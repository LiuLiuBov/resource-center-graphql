const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function getUserFromToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    return user ? user : null;
  } catch (err) {
    return null; // Якщо токен недійсний або прострочений
  }
}

module.exports = {
  getUserFromToken,
};
