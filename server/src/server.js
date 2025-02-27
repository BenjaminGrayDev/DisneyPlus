import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import setupAdminJS from './admin/adminSetup.js';

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(
    helmet({
        contentSecurityPolicy: false, // ✅ Fix for AdminJS CSP issue
        crossOriginEmbedderPolicy: false,
    })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);

// Setup AdminJS
setupAdminJS(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}/`));
