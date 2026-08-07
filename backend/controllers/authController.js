/**
 * Authentication: login (with a sign-in notification email), and a
 * two-step forgot-password flow using an emailed 6-digit OTP.
 */
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendEmail } = require('../utils/email');
const { generateOtp, hashOtp, verifyOtp } = require('../utils/otp');
const { serializeUser } = require('../utils/serializers');

const ROLE_LABELS = { admin: 'Admin', hr: 'HR', manager: 'Manager', employee: 'Employee' };
const OTP_EXPIRE_MINUTES = Number(process.env.RESET_TOKEN_EXPIRE_MINUTES) || 10;
const MAX_OTP_ATTEMPTS = 5;

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(422, 'Email and password are required');

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) throw new ApiError(403, 'Your account has been deactivated');

  const token = generateToken(user.id, user.role);

  const roleLabel = ROLE_LABELS[user.role] || user.role;
  const signInTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  sendEmail({
    to: user.email,
    subject: `New sign-in to the NexOps ${roleLabel} Portal`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>New sign-in detected</h2>
        <p>Hi ${user.fullName},</p>
        <p>Your account just signed in to the <strong>NexOps ${roleLabel} Portal</strong> at <strong>${signInTime}</strong>.</p>
        <p style="color:#888;font-size:12px;">If this wasn't you, change your password immediately from Profile → Change Password.</p>
      </div>
    `,
  }).catch((err) => console.error('Sign-in notification email failed:', err.message));

  res.json({ access_token: token, token_type: 'bearer', user: serializeUser(user) });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const genericMessage = 'If that email is registered, a 6-digit code has been sent to it.';
  const user = await prisma.user.findUnique({ where: { email: (email || '').toLowerCase() } });

  if (!user) return res.json({ message: genericMessage });

  await prisma.passwordResetOtp.updateMany({ where: { userId: user.id, used: false }, data: { used: true } });

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);
  await prisma.passwordResetOtp.create({ data: { userId: user.id, otpHash, expiresAt } });

  const roleLabel = ROLE_LABELS[user.role] || user.role;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Your NexOps password reset code',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>Hi ${user.fullName},</p>
          <p>Use this code to reset your ${roleLabel} Portal password. It expires in ${OTP_EXPIRE_MINUTES} minutes.</p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:8px;background:#f4f4f5;padding:16px 20px;border-radius:8px;text-align:center;">${otp}</p>
          <p style="color:#888;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    res.json({ message: genericMessage });
  } catch (err) {
    console.error('Failed to send OTP email:', err.message);
    if (process.env.NODE_ENV !== 'production') {
      return res.json({ message: `${genericMessage} [email failed — dev OTP: ${otp}]` });
    }
    res.json({ message: genericMessage });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, new_password: newPassword } = req.body;
  if (!email || !otp || !newPassword) throw new ApiError(422, 'Email, code, and new password are required');

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw new ApiError(400, 'Invalid code or email');

  const entry = await prisma.passwordResetOtp.findFirst({
    where: { userId: user.id, used: false },
    orderBy: { createdAt: 'desc' },
  });
  if (!entry) throw new ApiError(400, 'No active reset code found — please request a new one');
  if (entry.expiresAt < new Date()) throw new ApiError(400, 'This code has expired — please request a new one');
  if (entry.attempts >= MAX_OTP_ATTEMPTS) {
    throw new ApiError(429, 'Too many incorrect attempts — please request a new code');
  }

  const isValid = await verifyOtp(otp, entry.otpHash);
  if (!isValid) {
    await prisma.passwordResetOtp.update({ where: { id: entry.id }, data: { attempts: entry.attempts + 1 } });
    throw new ApiError(400, `Incorrect code (${MAX_OTP_ATTEMPTS - entry.attempts - 1} attempts remaining)`);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } }),
    prisma.passwordResetOtp.update({ where: { id: entry.id }, data: { used: true } }),
  ]);

  res.json({ message: 'Password has been reset successfully' });
});

module.exports = { login, forgotPassword, resetPassword };
