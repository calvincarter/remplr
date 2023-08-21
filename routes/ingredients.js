const express = require("express");
const Ingredient = require("../models/ingredient");
const router = new express.Router();
const { BadRequestError } = require("../expressError");
const jsonschema = require("jsonschema");
const {
  ensureCorrectUserOrAdmin,
  ensureAdminOrNutritionist,
  ensureAdmin,
  ensureLoggedIn,
} = require("../middleware/auth");
const ingredientNewSchema = require("../schemas/ingredientNew.json");
const ingredientUpdateSchema = require("../schemas/ingredientUpdate.json");

/** POST / { ingredient } =>  { ingredient }
 *
 * ingredient should be { aisle, image, name, amount, unit, original }
 *
 * Returns {id, aisle, image, name, amount, unit, details }
 *
 * Authorization required: admin or nutritionist
 */

router.post("/", ensureAdminOrNutritionist, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, ingredientNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const ingredient = await Ingredient.create(req.body);
    return res.status(201).json({ ingredient });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { ingredients: [{id, aisle, image, name, amount, unit, details },...] }
 *
 * Can filter on provided search filters:
 * - TODO: add filter parameters
 *
 * Authorization required: admin or same-user-as-:username
 */

router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const ingredients = await Ingredient.findAll(req.query);
    return res.json({ ingredients });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => { ingredient }
 *
 *  ingredient is { id, aisle, image, name, amount, unit, details }
 *
 * Authorization required: admin or same-user-as-:username
 */

router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const ingredient = await Ingredient.get(req.params.id);
    return res.json({ ingredient });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { ingredient } => { ingredient }
 *
 * Data can include: { aisle, image, name, amount, unit, original }
 *
 * Returns { id, aisle, image, name, amount, unit, details }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, ingredientUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const ingredient = await Ingredient.update(req.params.id, req.body);
    return res.json({ ingredient });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Ingredient.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
