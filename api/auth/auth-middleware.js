const Users = require('../users/users-model');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../secrets"); // use this secret!

async function verifyAsync(token) {
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
      if (err)
        resolve(null);
      else
        resolve(decodedToken);
    })
  })
}

/*
If the user does not provide a token in the Authorization header:
status 401
{
  "message": "Token required"
}

If the provided token does not verify:
status 401
{
  "message": "Token invalid"
}

Put the decoded token in the req object, to make life easier for middlewares downstream!
*/
/** @type {import('express').RequestHandler} */
const restricted = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return next({ status: 401, message: "token required" });
  }

  const decodedToken = await verifyAsync(token);

  if (decodedToken) {
    req.token = decodedToken;
    return next();
  }
  else {
    return next({ status: 401, message: "token invalid" });
  }
}

/*
If the user does not provide a token in the Authorization header with a role_name
inside its payload matching the role_name passed to this function as its argument:
status 403
{
  "message": "This is not for you"
}

Pull the decoded token from the req object, to avoid verifying it again!
*/
const only = role_name => (req, res, next) => {
  if (req.token.role_name === role_name)
    return next();
  else
    return next({ status: 403, message: "this is not for you" });
}


/*
If the username in req.body does NOT exist in the database
status 401
{
  "message": "Invalid credentials"
}
*/
const checkUsernameExists = async (req, res, next) => {
  const user = await Users.findBy({ username: req.body.username });

  if (user.length === 1) {
    req.user = user[0];
    return next();
  }
  else {
    return next({ status: 401, message: "invalid credentials" });
  }
}


/*
If the role_name in the body is valid, set req.role_name to be the trimmed string and proceed.

If role_name is missing from req.body, or if after trimming it is just an empty string,
set req.role_name to be 'student' and allow the request to proceed.

If role_name is 'admin' after trimming the string:
status 422
{
  "message": "Role name can not be admin"
}

If role_name is over 32 characters after trimming the string:
status 422
{
  "message": "Role name can not be longer than 32 chars"
}
*/
const validateRoleName = (req, res, next) => {
  const role_name = (req.body.role_name || "").trim();

  if (role_name === 'admin') {
    return next({ status: 422, message: "role name can not be admin" });
  }
  else if (role_name.length > 32) {
    return next({ status: 422, message: "role name can not be longer than 32 chars" });
  }
  else if (role_name === '') {
    req.role_name = "student";
  }
  else {
    req.role_name = role_name;
  }

  return next();
}

module.exports = {
  restricted,
  checkUsernameExists,
  validateRoleName,
  only,
}
