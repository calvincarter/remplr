"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const Recipe = require("./recipe");
const User = require("./user");
const { sqlForPartialUpdate } = require("../helpers/sql");

class MealPlan {
  /** Create a meal plan (from data), update db, return new meal plan data.
   *
   * data should be { name, created_by }
   *
   * Returns { id, name, created_by }
   **/

  static async create({ name, created_by, user_id }) {
    // Check if a meal plan with the same name already exists
    const duplicateCheck = await db.query(
      `SELECT * FROM meal_plans WHERE name = $1`,
      [name]
    );

    if (duplicateCheck.rows.length > 0)
      throw new BadRequestError(`Duplicate mealPlan: ${name}`);

    // Create the meal plan
    const result = await db.query(
      `INSERT INTO meal_plans (name, created_by, user_id)
           VALUES ($1, $2, $3)
           RETURNING id, name, created_by, user_id`,
      [name, created_by, user_id]
    );

    let mealPlan = result.rows[0];
    return mealPlan;
  }

  /** Add/link a recipe to a meal plan.
   *
   * data should be { meal_plan_id, recipe_id, meal_type, meal_day }
   *
   * Returns { id, meal_plan_id, recipe_id, meal_type, meal_day }
   **/

  static async addRecipeToMealPlan(data) {
    const result = await db.query(
      `INSERT INTO meal_plan_recipes (meal_plan_id, recipe_id, meal_type, meal_day)
           VALUES ($1, $2, $3, $4)
           RETURNING id, meal_plan_id, recipe_id, meal_type, meal_day`,
      [data.meal_plan_id, data.recipe_id, data.meal_type, data.meal_day]
    );

    return result.rows[0];
  }

  /** Remove a recipe from a meal plan.
   *
   * Returns { id, meal_plan_id, recipe_id, meal_type, meal_day }
   *
   * Throws NotFoundError if not found.
   **/
  static async removeRecipe(id) {
    const result = await db.query(
      `DELETE
           FROM meal_plan_recipes
           WHERE recipe_id = $1
           RETURNING id, meal_plan_id, recipe_id, meal_type, meal_day`,
      [id]
    );

    const mealPlanRecipe = result.rows[0];

    if (!mealPlanRecipe)
      throw new NotFoundError(`No recipe in meal plan with id: ${id}`);

    return mealPlanRecipe;
  }

  /** Find all meal plans
   *
   * Returns [{ id, name, created_by }, ...]
   * */

  static async findAll() {
    const mealPlansRes = await db.query(
      `SELECT id,
              name,
              created_by
           FROM meal_plans
           ORDER BY name`
    );
    return mealPlansRes.rows;
  }

  /** Given a meal plan id, return data about meal plan.
   *
   * Returns { id, name, created_by, recipes: [{ { id, vegetarian, vegan, dairyfree, weightwatchersmartpoints, creditstext,
   * title, readyinminutes, servings, sourceurl, image, imagetype, dishtype, diets, summary } ,meal_type, meal_day}, ...] }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const mealPlanRes = await db.query(
      `SELECT id,
            name,
            created_by
         FROM meal_plans
         WHERE id = $1`,
      [id]
    );

    const mealPlan = mealPlanRes.rows[0];

    if (!mealPlan) throw new NotFoundError(`No meal plan: ${id}`);

    const mealPlanRecipesRes = await db.query(
      `SELECT mpr.recipe_id,
            mpr.meal_type,
            mpr.meal_day,
            r.id AS recipe_id,
            r.vegetarian,
            r.vegan,
            r.dairyfree,
            r.weightwatchersmartpoints,
            r.creditstext,
            r.title,
            r.readyinminutes,
            r.servings,
            r.sourceurl,
            r.image,
            r.imagetype,
            r.dishtype,
            r.diets,
            r.summary
     FROM meal_plan_recipes AS mpr
     JOIN recipes AS r ON mpr.recipe_id = r.id
     WHERE mpr.meal_plan_id = $1
     ORDER BY mpr.meal_type, mpr.meal_day`,
      [id]
    );

    mealPlan.recipes = mealPlanRecipesRes.rows;

    return mealPlan;
  }

  /** Update meal plan data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { name, created_by }
   *
   * Returns { id, name, created_by }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE meal_plans 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, name, created_by`;
    const result = await db.query(querySql, [...values, id]);
    const mealPlan = result.rows[0];

    if (!mealPlan) throw new NotFoundError(`No meal plan: ${id}`);

    return mealPlan;
  }

  /** Delete given meal plan from database; returns undefined.
   *
   * Throws NotFoundError if meal plan not found.
   **/

  static async remove(id) {
    try {
      // First, delete associated data from meal_plan_recipes table
      await db.query(`DELETE FROM meal_plan_recipes WHERE meal_plan_id = $1`, [
        id,
      ]);

      // Then, delete the meal plan from meal_plans table
      const result = await db.query(
        `DELETE FROM meal_plans WHERE id = $1 RETURNING id`,
        [id]
      );

      const mealPlan = result.rows[0];

      if (!mealPlan) throw new NotFoundError(`No meal plan: ${id}`);
    } catch (err) {
      throw err;
    }
  }

  /** Allow Nutritionist to share a mealPlan to client
   *
   * Throws NotFoundError if meal plan, client or nutritionist not found.
   **/

  static async shareMealPlan(mealPlanId, nutritionistUsername, clientUsername) {
    // Validate that the meal plan exists
    const mealPlan = await db.query(`SELECT id FROM meal_plans WHERE id = $1`, [
      mealPlanId,
    ]);
    if (!mealPlan.rows[0]) {
      throw new NotFoundError(`Meal plan with id ${mealPlanId} does not exist`);
    }

    // Validate that the usernames correspond to a nutritionist and a client
    const nutritionist = await db.query(
      `SELECT id FROM users WHERE username = $1 AND is_nutritionist = true`,
      [nutritionistUsername]
    );

    const nutritionist_id = nutritionist.rows[0].id;

    const client = await db.query(
      `SELECT id FROM users WHERE username = $1 AND is_client = true`,
      [clientUsername]
    );
    const client_id = client.rows[0].id;

    if (!nutritionist.rows[0]) {
      throw new NotFoundError(
        `Nutritionist with username ${nutritionistUsername} does not exist`
      );
    }

    if (!client.rows[0]) {
      throw new NotFoundError(
        `Client with username ${clientUsername} does not exist`
      );
    }

    // Check if the meal plan is already shared with the client
    const duplicateCheck = await db.query(
      `SELECT * FROM shared_mealplans
          WHERE mealplan_id = $1 AND client_id = $2`,
      [mealPlanId, client_id]
    );

    if (duplicateCheck.rows.length > 0) {
      throw new BadRequestError(`Meal plan is already shared with this client`);
    }

    // Share the meal plan
    await db.query(
      `INSERT INTO shared_mealplans (mealplan_id, nutritionist_id, client_id)
        VALUES ($1, $2, $3)`,
      [mealPlanId, nutritionist_id, client_id]
    );

    return `Meal plan ${mealPlanId} is now shared with client ${clientUsername} by nutritionist ${nutritionistUsername}`;
  }

  /** Given a client username, return data about mealPlanDetails associated with that client.
   *
   * Returns { id, name, created_by, recipes: [{ { id, vegetarian, vegan, dairyfree, weightwatchersmartpoints, creditstext,
   * title, readyinminutes, servings, sourceurl, image, imagetype, dishtype, diets, summary } ,meal_type, meal_day}, ...] }
   *
   **/
  static async getSharedMealPlans(clientUsername) {
    try {
      // Get client ID using the provided client username
      const client = await User.get(clientUsername);
      const clientId = client.id;

      // Get meal plan IDs shared with this client from the shared_mealplans table
      const sharedMealPlans = await db.query(
        "SELECT mealplan_id FROM shared_mealplans WHERE client_id = $1",
        [clientId]
      );

      console.log("sharedMealPlans", sharedMealPlans);

      // Initialize an array to store the meal plan details
      const mealPlanDetails = [];

      // Loop through the meal plan IDs and fetch the details for each meal plan
      for (const sharedMealPlan of sharedMealPlans.rows) {
        const mealPlanId = sharedMealPlan.mealplan_id;
        const mealPlan = await MealPlan.get(mealPlanId);
        mealPlanDetails.push(mealPlan);
      }

      return mealPlanDetails;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = MealPlan;
