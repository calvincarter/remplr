const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(user) {
  console.assert(
    user.isAdmin !== undefined,
    user.isNutritionist !== undefined,
    user.isClient !== undefined,
    "createToken passed user without isAdmin, isNutritionist and isClient property"
  );

  let payload = {
    username: user.username,
    isAdmin: user.isAdmin || false,
    isNutritionist: user.isNutritionist || false,
    isClient: user.isClient || false,
  };
  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
