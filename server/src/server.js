import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import mediaRoutes from "./routes/mediaRoutes.js";
import paypalRoutes from "./routes/paypalRoutes.js";
import setupAdminJS from './admin/adminSetup.js';
import  './models/Movie.js';
import  './models/TVShow.js';
import  './models/Trending.js';
import  './models/Paypal.js';
import { createPlansAndGetID } from './service/paypal/plan/CreatePlan.js';

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

app.use('/custom.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'custom.css'));
});

// Routes
app.use('/api/auth', authRoutes);

app.use("/api/media", mediaRoutes);

app.use("/api/paypal", paypalRoutes);

// ✅ Indexing for Faster Queries (Only Run Once)
async function createIndexes() {
    console.log("🚀 Creating indexes for faster queries...");
    await Movie.collection.createIndex({ id: 1 });
    await Movie.collection.createIndex({ popularity: -1 });
    await Movie.collection.createIndex({ vote_average: -1 });
    await Movie.collection.createIndex({ release_date: -1 });

    await TVShow.collection.createIndex({ id: 1 });
    await TVShow.collection.createIndex({ popularity: -1 });
    await TVShow.collection.createIndex({ vote_average: -1 });
    await TVShow.collection.createIndex({ first_air_date: -1 });

    console.log("✅ Indexes created successfully.");
}

// ✅ Call createIndexes AFTER DB connection
createIndexes().catch(console.error);

createPlansAndGetID().catch(console.error);

// Setup AdminJS
setupAdminJS(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}/`));
