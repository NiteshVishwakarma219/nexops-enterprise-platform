/**
 * One-time-passcode helpers for the forgot-password flow.
 * OTPs are 6-digit numeric codes, stored only as a bcrypt hash (never in
 * plaintext) so a leaked database doesn't expose usable reset codes.
 */
const bcrypt = require('bcryptjs');

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // always 6 digits
}

async function hashOtp(otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

async function verifyOtp(otp, hash) {
  return bcrypt.compare(otp, hash);
}

module.exports = { generateOtp, hashOtp, verifyOtp };
