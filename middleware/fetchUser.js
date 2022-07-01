// Verify User
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const fetchUser = (req, res, next) => {
  let success;
  const token = req.header("user-auth-token");
  if (!token) {
    success = false;
    return res.status(401).json({ success, error: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, secret);
    req.user = data.user;
    next();
  } catch (error) {
    success = false;
    return res.status(401).json({ success, error: error.message });
  }
};

module.exports = fetchUser;
