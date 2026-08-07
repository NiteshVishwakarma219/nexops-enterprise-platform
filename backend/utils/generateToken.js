const jwt = require('jsonwebtoken');

function generateToken(userId, role) {
  return jwt.sign({ sub: userId.toString(), role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

module.exports = generateToken;
