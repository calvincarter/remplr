"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Ingredient {
  /** Create a ingredient (from data), update db, return new ingredient data.
   *
   * data should be { aisle, image, name, amount, unit, original }
   *
   * Returns { id, aisle, image, name, amount, unit, details }
   **/

  static async create(data) {
    const result = await db.query(
      `INSERT INTO ingredients (aisle,
        image,
        name,
        amount,
        unit,
        original)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, aisle, image, name, amount, unit, original as "details"`,
      [data.aisle, data.image, data.name, data.amount, data.unit, data.original]
    );
    let ingredient = result.rows[0];

    return ingredient;
  }

  /** Find all ingredients
   *
   * Returns [{ id, aisle, image, name, amount, unit, details }, ...]
   * */

  static async findAll() {
    let query = `SELECT i.id,
                        i.aisle,
                        i.image,
                        i.name,
                        i.amount,
                        i.unit,
                        i.original as "details"
                 FROM ingredients i`;
    let whereExpressions = [];
    let queryValues = [];

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY name";
    const ingredientsRes = await db.query(query, queryValues);
    return ingredientsRes.rows;
  }

  /** Given a ingredient id, return data about ingredient.
   *
   * Returns { id, aisle, image, name, amount, unit, details, nutrients:
   * { name, amount, unit, percentOfDailyNeeds} }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const ingredientRes = await db.query(
      `SELECT i.id,
              i.aisle, 
              i.image, 
              i.name, 
              i.amount, 
              i.unit, 
              i.original as "details",
              inut.name AS "nutrientName",
              inut.amount AS "nutrientAmount",
              inut.unit AS "nutrientUnit",
              inut.percentofdailyneeds AS "percentOfDailyNeeds"
            FROM ingredients i
            LEFT JOIN ingredient_nutrients inut ON i.id = inut.ingredient_id
            WHERE i.id = $1`,
      [id]
    );

    const rows = ingredientRes.rows;
    if (rows.length === 0) throw new NotFoundError(`No ingredient: ${id}`);

    // Group nutrient information for the ingredient
    const { aisle, image, name, amount, unit, details } = rows[0];
    const nutrients = rows.map((row) => ({
      name: row.nutrientName,
      amount: row.nutrientAmount,
      unit: row.nutrientUnit,
      percentofdailyneeds: row.percentOfDailyNeeds,
    }));

    return { id, aisle, image, name, amount, unit, details, nutrients };
  }

  /** Update ingredient data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { aisle, image, name, amount, unit, original }
   *
   * Returns { id, aisle, image, name, amount, unit, details }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE ingredients 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING { id, 
                                aisle, 
                                image, 
                                name, 
                                amount, 
                                unit, 
                                original as "details" }`;
    const result = await db.query(querySql, [...values, id]);
    const ingredient = result.rows[0];

    if (!ingredient) throw new NotFoundError(`No ingredient: ${id}`);

    return ingredient;
  }

  /** Delete given ingredient from database; returns undefined.
   *
   * Throws NotFoundError if ingredient not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM ingredients
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const ingredient = result.rows[0];

    if (!ingredient) throw new NotFoundError(`No ingredient: ${id}`);
  }
}

module.exports = Ingredient;
