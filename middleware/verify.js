const jwt = require("jsonwebtoken");

function verify(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.json({ message: "Access denied..." });
    }

    const token = authHeader.split[" "][1];

    const payload = jwt.verify(token, "aryan123");

    req.user = payload;

    next();
  } catch (error) {
    console.log("err occured...", error);
  }
}

module.exports = { verify };
