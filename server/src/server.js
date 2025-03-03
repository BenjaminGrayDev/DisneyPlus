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
import Movie from './models/Movie.js';
import TVShow from './models/TVShow.js';
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

    const movieIndexes = await Movie.collection.indexes();
    const tvShowIndexes = await TVShow.collection.indexes();

    const existingMovieIndexes = movieIndexes.map(index => index.name);
    const existingTVShowIndexes = tvShowIndexes.map(index => index.name);

    const indexesToCreate = [
        { key: { id: 1 }, options: { name: "id_1" } },
        { key: { popularity: -1 }, options: { name: "popularity_-1" } },
        { key: { vote_average: -1 }, options: { name: "vote_average_-1" } },
        { key: { release_date: -1 }, options: { name: "release_date_-1" } },
    ];

    const tvIndexesToCreate = [
        { key: { id: 1 }, options: { name: "id_1" } },
        { key: { popularity: -1 }, options: { name: "popularity_-1" } },
        { key: { vote_average: -1 }, options: { name: "vote_average_-1" } },
        { key: { first_air_date: -1 }, options: { name: "first_air_date_-1" } },
    ];

    // Create only if index doesn't exist
    for (const { key, options } of indexesToCreate) {
        if (!existingMovieIndexes.includes(options.name)) {
            await Movie.collection.createIndex(key, options);
        }
    }

    for (const { key, options } of tvIndexesToCreate) {
        if (!existingTVShowIndexes.includes(options.name)) {
            await TVShow.collection.createIndex(key, options);
        }
    }

    console.log("✅ Indexes created successfully.");
}


// ✅ Call createIndexes AFTER DB connection
createIndexes().catch(console.error);

createPlansAndGetID().catch(console.error);

// Setup AdminJS
setupAdminJS(app);

const PORT = process.env.PORT || 5000;
app.listen(5000, '0.0.0.0', () => {
    console.log('Server running on port 5000 (IPv4)');
});

