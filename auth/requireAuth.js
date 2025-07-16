const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return res.sendStatus(401); // no token = not logged in

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.sendStatus(401); // invalid or expired token
  }
};
