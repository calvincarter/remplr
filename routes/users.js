"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const {
  ensureCorrectUserOrAdmin,
  ensureAdmin,
  ensureNutritionist,
  ensureClient,
  ensureAdminOrNutritionist,
  ensureLoggedIn,
} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/

router.get("/", ensureAdmin, async (req, res, next) => {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin, isNutritionist, isClient, recipes, ingredients, mealplans }
 *   where recipes is [id(s)]
 *   where ingredients is [id(s)]
 *   where mealplans is [id(s)]
 *
 * Authorization required: admin or same user-as-:username
 **/

router.get("/:username", async (req, res, next) => {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin, isNutritionist, isClient }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.patch("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.delete(
  "/:username",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      await User.remove(req.params.username);
      return res.json({ "deleted user": req.params.username });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /[username]/ingredients/{ingredientId} => { ingredient }
 *
 * Associates an ingredient with a user.
 *
 * Returns { ingredient: { id, aisle, image, name, original, amount, unit } }
 *
 * Authorization required: admin or same-user-as-:username
 **/
router.post(
  "/:username/ingredients/:ingredientId",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const { username, ingredientId } = req.params;
      const ingredient = await User.saveIngredient(username, ingredientId);
      return res.status(201).json({ "Saved ingredient with id": ingredientId });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /[username]/recipes/{recipeId} => { recipe }
 *
 * Associates a recipe with a user.
 *
 * Returns { recipe: { id, title, vegetarian, ...etc } }
 *
 * Authorization required: admin or same-user-as-:username
 **/
router.post(
  "/:username/recipes/:recipeId",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const { username, recipeId } = req.params;
      const recipe = await User.saveRecipe(username, recipeId);
      return res.status(201).json({ "Saved ingredient with id": recipeId });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /[username]/mealplans/{mealPlanId} => { mealPlan }
 *
 * Associates a meal plan with a user.
 *
 * Returns { mealPlan: { id, name, created_by } }
 *
 * Authorization required: admin or nutritionist
 **/
router.post(
  "/:username/mealplans/:mealPlanId",
  ensureAdminOrNutritionist,
  async (req, res, next) => {
    try {
      const { username, mealPlanId } = req.params;
      const mealPlan = await User.saveMealPlan(username, mealPlanId);
      return res.status(201).json({ mealPlan });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /[username]/ingredients => { ingredients }
 *
 * Get user saved ingredients
 *
 * Returns { ingredients: [{id, aisle, image, name, original, amount, unit}, ...] }
 *
 * Authorization required:  admin or same-user-as-:username
 **/

router.get("/:username/ingredients", ensureLoggedIn, async (req, res, next) => {
  try {
    const ingredients = await User.getSavedIngredients(req.params.username);
    return res.json(ingredients);
  } catch (err) {
    return next(err);
  }
});

/** GET /[username]/recipes => { recipes }
 *
 * Get user saved recipes
 *
 * Returns { recipes: [{id, vegetarian, vegan, dairyfree, weightwatchersmartpoints, creditstext, title, readyinminutes, servings, sourceurl, image, imagetype, dishtype, diets, summary}, ...] }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.get("/:username/recipes", ensureLoggedIn, async (req, res, next) => {
  try {
    const recipes = await User.getSavedRecipes(req.params.username);
    return res.json({ recipes });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username]/mealplans => { mealplans }
 *
 * Returns { mealplans: [{id, name, created_by}, ...] }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.get("/:username/mealplans", ensureLoggedIn, async (req, res, next) => {
  try {
    const mealplans = await User.getSavedMealPlans(req.params.username);
    return res.json({ mealplans });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[username]/recipes/{recipeId} => { msg }
 *
 * Removes associated recipe from a user.
 *
 * Returns { msg }
 *
 * Authorization required: admin or same-user-as-:username
 **/
router.delete(
  "/:username/recipes/:recipeId",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const { username, recipeId } = req.params;
      const recipe = await User.deleteSavedRecipe(username, recipeId);
      return res
        .status(202)
        .json({ "Removed recipe from saved recipes": recipeId });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[username]/ingredients/{ingredientId} => { msg }
 *
 * Removes associated ingredient from a user.
 *
 * Returns { msg }
 *
 * Authorization required: admin or same-user-as-:username
 **/
router.delete(
  "/:username/ingredients/:ingredientId",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const { username, ingredientId } = req.params;
      const recipe = await User.deleteSavedIngredient(username, ingredientId);
      return res
        .status(202)
        .json({ "Removed ingredient from saved ingredients": ingredientId });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
