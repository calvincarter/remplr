"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userNewSchema = require("../schemas/userNew.json");
const { BadRequestError } = require("../expressError");
const { ensureAdminOrNutritionist } = require("../middleware/auth");

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

/**Route to add new client for nutritionist
 *
 * POST /auth/register/client:   { user } => { message: Client ${clientId} is now linked to Nutritionist ${nutritionistId} }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post(
  "/client/new",
  ensureAdminOrNutritionist,
  async (req, res, next) => {
    try {
      // Check for proper validation according to your userNewSchema
      const validator = jsonschema.validate(req.body, userNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      // Register the new client
      const newUser = await User.register({
        ...req.body,
        isAdmin: false,
        isClient: true,
        isNutritionist: false,
      });

      // Get nutritionist by username
      const nutritionist = await User.get(req.body.nutritionist_username);

      if (!nutritionist || !nutritionist.isNutritionist) {
        throw new BadRequestError("Nutritionist username is required.");
      }

      const result = await User.linkClientToNutritionist(
        newUser.id,
        nutritionist.id
      );

      return res.status(201).json({ message: result });
    } catch (err) {
      return next(err);
    }
  }
);

/**Nutritionist Registeration
 *
 * POST /auth/register/client:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await User.register({
      ...req.body,
      isAdmin: false,
      isNutritionist: true,
      isClient: false,
    });
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
