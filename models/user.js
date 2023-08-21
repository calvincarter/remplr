"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email, is_admin, is_client, is_nutritionist }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin",
                  is_client AS "isClient",
                  is_nutritionist AS "isNutritionist"
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, first_name, last_name, email, is_admin, is_client, is_nutritionist }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({
    username,
    password,
    firstName,
    lastName,
    email,
    isAdmin,
    isClient,
    isNutritionist,
  }) {
    const duplicateCheck = await db.query(
      `SELECT username
           FROM users
           WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            is_admin, 
            is_client, 
            is_nutritionist
            )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin", is_client AS "isClient", is_nutritionist AS "isNutritionist"`,

      [
        username,
        hashedPassword,
        firstName,
        lastName,
        email,
        isAdmin,
        isClient,
        isNutritionist,
      ]
    );

    const user = result.rows[0];

    return user;
  }

  // Link a client to a nutritionist
  static async linkClientToNutritionist(clientId, nutritionistId) {
    // Validate that both client and nutritionist exist
    const client = await db.query(
      `SELECT id FROM users WHERE id = $1 AND is_client = true`,
      [clientId]
    );
    const nutritionist = await db.query(
      `SELECT id FROM users WHERE id = $1 AND is_nutritionist = true`,
      [nutritionistId]
    );

    if (!client.rows[0]) {
      throw new NotFoundError(`Client with id ${clientId} does not exist`);
    }

    if (!nutritionist.rows[0]) {
      throw new NotFoundError(
        `Nutritionist with id ${nutritionistId} does not exist`
      );
    }

    // Check if the relationship already exists
    const duplicateCheck = await db.query(
      `SELECT * FROM client_nutritionist
          WHERE client_id = $1 AND nutritionist_id = $2`,
      [clientId, nutritionistId]
    );

    if (duplicateCheck.rows.length > 0) {
      throw new BadRequestError(
        `Client is already linked to this nutritionist`
      );
    }

    // Insert the relationship
    await db.query(
      `INSERT INTO client_nutritionist (client_id, nutritionist_id)
        VALUES ($1, $2)`,
      [clientId, nutritionistId]
    );

    return `Client ${clientId} is now linked to Nutritionist ${nutritionistId}`;
  }

  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, is_admin, is_client, is_nutritionist }, ...]
   **/

  static async findAll() {
    const result = await db.query(
      `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin",
                  is_client AS "isClient",
                  is_nutritionist AS "isNutritionist"
           FROM users
           ORDER BY username`
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, email, is_admin, is_client, is_nutritionist }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
      `SELECT id, username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin",
                  is_client AS "isClient",
                  is_nutritionist AS "isNutritionist"
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { username, first_name, last_name, email, isAdmin, isClient, isNutritionist }
   *
   * Returns { username, first_name, last_name, email, isAdmin, isClient, isNutritionist }
   *
   * Throws NotFoundError if not found.
   *
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
      isClient: "is_client",
      isNutritionist: "is_nutritionist",
    });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin",
                                is_client AS "isClient",
                                is_nutritionist AS "isNutritionist"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
      `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  // Save a ingredient for a given user
  static async saveIngredient(username, ingredientId) {
    try {
      // First, retrieve the userId based on the username
      const user = await db.query(`SELECT id FROM users WHERE username = $1`, [
        username,
      ]);

      if (user.rows.length === 0) {
        throw new NotFoundError(`User not found`);
      }

      const userId = user.rows[0].id;

      // Check if the ingredient exists in the ingredients table
      const ingredient = await db.query(
        `SELECT * FROM ingredients WHERE id = $1`,
        [ingredientId]
      );

      if (!ingredient.rows[0]) {
        throw new NotFoundError(
          `Ingredient with id ${ingredientId} does not exist `
        );
      }

      // Check if Ingredient is already saved
      const duplicateCheck = await db.query(
        `SELECT * FROM user_saved_ingredients
          WHERE user_id = $1 AND ingredient_id = $2`,
        [userId, ingredientId]
      );

      if (duplicateCheck.rows.length > 0) {
        throw new BadRequestError(`Ingredient already saved`);
      }

      // Then, insert the ingredient using the retrieved userId
      const result = await db.query(
        `INSERT INTO user_saved_ingredients (user_id, ingredient_id)
          VALUES ($1, $2)
          RETURNING id`,
        [userId, ingredientId]
      );

      return result.rows[0];
    } catch (err) {
      // Handle any errors that might occur during the database queries
      throw err;
    }
  }

  // Save a recipe for a given user
  static async saveRecipe(username, recipeId) {
    try {
      // First, retrieve the userId based on the username
      const user = await db.query(`SELECT id FROM users WHERE username = $1`, [
        username,
      ]);
      const userId = user.rows[0].id;

      // Check if the recipe exists in the recipes table
      const recipe = await db.query(`SELECT * FROM recipes WHERE id = $1`, [
        recipeId,
      ]);

      if (!recipe.rows[0]) {
        throw new NotFoundError(`Recipe with id ${recipeId} does not exist `);
      }

      // check if recipe is already saved
      const duplicateCheck = await db.query(
        `SELECT * FROM user_saved_recipes
            WHERE user_id = $1 AND recipe_id = $2`,
        [userId, recipeId]
      );

      if (duplicateCheck.rows.length > 0)
        throw new BadRequestError(`Recipe already saved`);

      // Then, insert the ingredient using the retrieved userId
      const result = await db.query(
        `INSERT INTO user_saved_recipes (user_id, recipe_id)
          VALUES ($1, $2)
          RETURNING id`,
        [userId, recipeId]
      );
      return result.rows[0];
    } catch (err) {
      // Handle any errors that might occur during the database queries
      throw err;
    }
  }

  // Save a mealPlan for a given user
  static async saveMealPlan(username, mealPlanId) {
    // First, retrieve the userId based on the username
    const user = await db.query(`SELECT id FROM users WHERE username = $1`, [
      username,
    ]);
    const userId = user.rows[0].id;

    // Check if the meal plan exists in the ingredients table
    const mealPlan = await db.query(`SELECT * FROM meal_plans WHERE id = $1`, [
      mealPlanId,
    ]);

    if (!mealPlan.rows[0])
      throw new NotFoundError(
        `Meal Plan with id ${mealPlanId} does not exist `
      );

    // check if meal plan is already saved
    const duplicateCheck = await db.query(
      `SELECT * FROM user_saved_meal_plans
          WHERE user_id = $1 AND meal_plan_id = $2`,
      [userId, mealPlanId]
    );

    if (duplicateCheck.rows.length > 0)
      throw new BadRequestError(`Meal Plan already saved`);

    const result = await db.query(
      `INSERT INTO user_saved_meal_plans (user_id, meal_plan_id)
        VALUES ($1, $2)
        RETURNING id`,
      [userId, mealPlanId]
    );
    return result.rows[0];
  }

  // Get saved ingredients for a given user
  static async getSavedIngredients(username) {
    const userRes = await db.query(`SELECT id FROM users WHERE username = $1`, [
      username,
    ]);
    const userId = userRes.rows[0].id;

    const ingredientsRes = await db.query(
      `
        SELECT i.* 
        FROM ingredients AS i
        JOIN user_saved_ingredients AS usi ON i.id = usi.ingredient_id
        WHERE usi.user_id = $1`,
      [userId]
    );

    return ingredientsRes.rows;
  }

  // Get saved recipes for a given user
  static async getSavedRecipes(username) {
    const userRes = await db.query(`SELECT id FROM users WHERE username = $1`, [
      username,
    ]);
    const userId = userRes.rows[0].id;

    const recipesRes = await db.query(
      `
        SELECT r.* 
        FROM recipes AS r
        JOIN user_saved_recipes AS usr ON r.id = usr.recipe_id
        WHERE usr.user_id = $1`,
      [userId]
    );

    return recipesRes.rows;
  }

  // Get saved mealPlans for a given user
  static async getSavedMealPlans(username) {
    const userRes = await db.query(`SELECT id FROM users WHERE username = $1`, [
      username,
    ]);
    const userId = userRes.rows[0].id;

    const mealPlansRes = await db.query(
      `
        SELECT m.* 
        FROM meal_plans AS m
        JOIN user_saved_meal_plans AS usm ON m.id = usm.meal_plan_id
        WHERE usm.user_id = $1`,
      [userId]
    );

    return mealPlansRes.rows;
  }

  // Delete a saved recipe for a given user
  static async deleteSavedRecipe(username, recipeId) {
    try {
      // First, retrieve the userId based on the username
      const user = await db.query(`SELECT id FROM users WHERE username = $1`, [
        username,
      ]);
      const userId = user.rows[0].id;

      // Check if the recipe exists in the recipes table
      const recipe = await db.query(`SELECT * FROM recipes WHERE id = $1`, [
        recipeId,
      ]);

      if (!recipe.rows[0]) {
        throw new NotFoundError(`Recipe with id ${recipeId} does not exist`);
      }

      // check if recipe is actually saved
      const savedCheck = await db.query(
        `SELECT * FROM user_saved_recipes
          WHERE user_id = $1 AND recipe_id = $2`,
        [userId, recipeId]
      );

      if (savedCheck.rows.length === 0) {
        throw new BadRequestError(`Recipe not saved by this user`);
      }

      // Delete the saved recipe using the retrieved userId and recipeId
      await db.query(
        `DELETE FROM user_saved_recipes WHERE user_id = $1 AND recipe_id = $2`,
        [userId, recipeId]
      );

      return { message: "Recipe successfully deleted" };
    } catch (err) {
      // Handle any errors that might occur during the database queries
      throw err;
    }
  }

  // Delete a saved ingredient for a given user
  static async deleteSavedIngredient(username, ingredientId) {
    try {
      // First, retrieve the userId based on the username
      const user = await db.query(`SELECT id FROM users WHERE username = $1`, [
        username,
      ]);

      if (user.rows.length === 0) {
        throw new NotFoundError(`User not found`);
      }

      const userId = user.rows[0].id;

      // Check if the ingredient exists in the ingredients table
      const ingredient = await db.query(
        `SELECT * FROM ingredients WHERE id = $1`,
        [ingredientId]
      );

      if (!ingredient.rows[0]) {
        throw new NotFoundError(
          `Ingredient with id ${ingredientId} does not exist`
        );
      }

      // Check if the ingredient is actually saved by the user
      const savedCheck = await db.query(
        `SELECT * FROM user_saved_ingredients
          WHERE user_id = $1 AND ingredient_id = $2`,
        [userId, ingredientId]
      );

      if (savedCheck.rows.length === 0) {
        throw new BadRequestError(`Ingredient not saved by this user`);
      }

      // Delete the saved ingredient using the retrieved userId and ingredientId
      await db.query(
        `DELETE FROM user_saved_ingredients WHERE user_id = $1 AND ingredient_id = $2`,
        [userId, ingredientId]
      );

      return { message: "Ingredient successfully deleted" };
    } catch (err) {
      // Handle any errors that might occur during the database queries
      throw err;
    }
  }
}

module.exports = User;
