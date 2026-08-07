/**
 * NexOps Enterprise Platform - Express entry point.
 * Architecture: Frontend -> Routes -> Controllers -> Models -> MongoDB
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const assetRoutes = require('./routes/assetRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const projectRoutes = require('./routes/projectRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Ensure upload directories exist
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
['photos', 'resumes', 'offer_letters', 'id_proofs', 'certificates', 'documents'].forEach((folder) => {
  fs.mkdirSync(path.join(uploadDir, folder), { recursive: true });
});

// CORS: ALLOWED_ORIGIN can be "*" (any origin, no credentials) or a
// comma-separated list of exact origins (e.g. "https://app.example.com,http://localhost:5173").
const allowedOriginEnv = process.env.ALLOWED_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173';
const isWildcard = allowedOriginEnv.trim() === '*';
const allowedOrigins = isWildcard ? '*' : allowedOriginEnv.split(',').map((o) => o.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: !isWildcard, // browsers reject "credentials: true" combined with a wildcard origin
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), uploadDir)));

app.get('/', (req, res) => res.json({ app: process.env.APP_NAME, status: 'running' }));
app.get('/api/health', (req, res) => res.json({ status: 'healthy' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`NexOps API running on http://localhost:${PORT}`));
});

module.exports = app;
