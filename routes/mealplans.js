"use strict";

const jsonschema = require("jsonschema");
const MealPlan = require("../models/mealplan");
const express = require("express");
const { BadRequestError } = require("../expressError");
const {
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
  ensureAdminOrNutritionist,
  ensureAdminOrClient,
  ensureAdmin,
  ensureNutritionist,
  ensureClient,
} = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

/** POST / { mealPlan } =>  { mealPlan }
 *
 * MealPlan should be { name, created_by, recipes : [{recipe_id, meal_type, meal_day},...] }
 *
 * Returns { id, name, created_by, recipes : [{recipe_id, meal_type, meal_day},...] }
 *
 * Authorization required: admin or nutritionist
 */
router.post("/", ensureAdminOrNutritionist, async (req, res, next) => {
  try {
    // Create the meal plan
    const mealPlan = await MealPlan.create({
      name: req.body.mealPlanName,
      created_by: req.body.created_by,
      user_id: req.body.user_id,
    });

    // Add each recipe to the meal plan
    for (let recipe of req.body.recipes) {
      await MealPlan.addRecipeToMealPlan({
        meal_plan_id: mealPlan.id,
        recipe_id: recipe.recipe_id,
        meal_type: recipe.meal_type,
        meal_day: recipe.meal_day,
      });
    }

    return res.status(201).json({ mealPlan });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { mealPlans: [ { id, name, created_by }, ...] }
 *
 * Authorization required: admin or nutritionist
 */

router.get("/", ensureAdminOrNutritionist, async (req, res, next) => {
  try {
    const mealPlans = await MealPlan.findAll();
    return res.json({ mealPlans });
  } catch (err) {
    return next(err);
  }
});

/** GET /[mealPlanId]  =>
 *  { id, name, created_by, recipes: [{ { id, vegetarian, vegan, dairyfree, weightwatchersmartpoints, creditstext,
 *  title, readyinminutes, servings, sourceurl, image, imagetype, dishtype, diets, summary } ,meal_type, meal_day}, ...] }
 *
 *  Authorization required: admin or nutritionist
 */
router.get(
  "/:mealPlanId",
  ensureAdminOrNutritionist,
  async (req, res, next) => {
    try {
      const mealPlan = await MealPlan.get(req.params.mealPlanId);
      console.log(mealPlan);
      return res.json({ mealPlan });
    } catch (err) {
      return next(err);
    }
  }
);

/** PATCH /[mealPlanId] { mealPlan } => { mealPlan }
 *
 * Data can include: { name, created_by }
 *
 * Returns { id, name, created_by }
 *
 * Authorization required: admin or nutritionist
 */

router.patch(
  "/:mealPlanId",
  ensureAdminOrNutritionist,
  async function (req, res, next) {
    try {
      const mealPlan = await MealPlan.update(req.params.mealPlanId, req.body);
      return res.json({ mealPlan });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * POST /[mealPlanId]/recipes { recipe } => { recipe }
 *
 * Data can include: { recipe_id, meal_type, meal_day }
 *
 * Returns { id, meal_plan_id, recipe_id, meal_type, meal_day }
 *
 * This route is used to add a new recipe to the specified meal plan.
 *
 * Authorization required: admin or nutritionist
 */

router.post(
  "/:mealPlanId/recipes/:recipeId",
  ensureAdminOrNutritionist,
  async function (req, res, next) {
    try {
      const recipe = await MealPlan.addRecipeToMealPlan({
        meal_plan_id: req.params.mealPlanId,
        ...req.body,
      });
      return res.status(201).json({ recipe });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * DELETE /[mealPlanId]/recipes/[recipeId] { recipe } => { deleted: recipeId }
 *
 * This route is used to remove a recipe from the specified meal plan.
 *
 * Authorization required: admin or nutritionist
 */

router.delete(
  "/:mealPlanId/recipes/:recipeId",
  ensureAdminOrNutritionist,
  async function (req, res, next) {
    try {
      await MealPlan.removeRecipe(req.params.recipeId);
      return res.json({ "deleted recipe": req.params.recipeId });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * DELETE /[mealPlanId] { mealPlan } => { deleted: mealPlanId }
 *
 * This route is used to delete the specified meal plan.
 *
 * Authorization required: admin
 */

router.delete("/:mealPlanId", ensureAdmin, async function (req, res, next) {
  try {
    await MealPlan.remove(req.params.mealPlanId);
    return res.json({ "deleted meal plan": req.params.mealPlanId });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /:mealPlanId/share { mealPlan } => { message: Meal plan ${mealPlanId} is now shared with client ${clientUsername} by nutritionist ${nutritionistUsername} }
 *
 * This route is used to allow nutritionist to share a specified meal plan to client
 *
 * Authorization required: admin or nutritionist
 */

router.post(
  "/:mealPlanId/share",
  ensureAdminOrNutritionist,
  async (req, res, next) => {
    try {
      const { nutritionistUsername, clientUsername } = req.body;

      if (!nutritionistUsername || !clientUsername)
        throw new BadRequestError(
          "Nutritionist username, and client username are required"
        );

      const result = await MealPlan.shareMealPlan(
        req.params.mealPlanId,
        nutritionistUsername,
        clientUsername
      );
      return res.status(200).json({ message: result });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /shared/:clientUsername  => { mealplans }
 *
 * This route is used to get shared meal plan to client
 *
 * Authorization required: admin or client
 */

router.get(
  "/shared/:clientUsername",
  ensureAdminOrClient,
  async (req, res, next) => {
    try {
      const { clientUsername } = req.params;

      if (!clientUsername) {
        return res.status(400).json({ error: "Client username is required" });
      }

      const mealPlans = await MealPlan.getSharedMealPlans(clientUsername);
      return res.status(200).json(mealPlans);
    } catch (error) {
      // Forward the error to an error handling middleware
      return next(error);
    }
  }
);

module.exports = router;
