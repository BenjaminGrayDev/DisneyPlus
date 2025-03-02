import express from "express";
import Movie from "../models/Movie.js";
import TVShow from "../models/TVShow.js";
import Trending from "../models/Trending.js";

const router = express.Router();

/**
 * 📌 1️⃣ Search for Movies & TV Shows
 */
router.get("/search", async (req, res) => {
    const { query, page = 1, limit = 20 } = req.query;

    if (!query) return res.status(400).json({ error: "Query parameter is required" });

    try {
        const movies = await Movie.find({
            title: { $regex: query, $options: "i" },
        })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const tvShows = await TVShow.find({
            name: { $regex: query, $options: "i" },
        })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const results = [...movies, ...tvShows].map((media) => ({
            id: media.id,
            title: media.title || media.name,
            isForAdult: media.adult,
            type: media.media_type === "movie" ? "movies" : "series",
            image: {
                poster: media.poster_path,
                backdrop: media.backdrop_path,
            },
            overview: media.overview,
            releasedAt: media.release_date || media.first_air_date,
            language: {
                original: media.original_language,
            },
        }));

        res.json({ results });
    } catch (error) {
        res.status(500).json({ error: "Failed to search media" });
    }
});

/**
 * 📌 2️⃣ Fetch Similar Movies or TV Shows
 */
router.get("/:type/:id/similar", async (req, res) => {
    const { type, id } = req.params;

    try {
        const Model = type === "movies" ? Movie : TVShow;
        const media = await Model.findOne({ id: Number(id) });

        if (!media) return res.status(404).json({ error: "Media not found" });

        const similar = await Model.find({ id: { $in: media.similar_movies || media.similar_shows } });

        res.json({ results: similar });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch similar media" });
    }
});

/**
 * 📌 3️⃣ Fetch Trending Movies & TV Shows
 */
router.get("/trending/:time", async (req, res) => {
    const { time } = req.params;

    try {
        const trending = await Trending.findOne({ time_window: time });
        if (!trending) return res.status(404).json({ message: "No trending data available" });

        const movies = await Movie.find({ id: { $in: trending.results } });
        const tvShows = await TVShow.find({ id: { $in: trending.results } });

        res.json({ results: [...movies, ...tvShows] });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trending media" });
    }
});

/**
 * 📌 4️⃣ Fetch Grouped Media (Popular, Top-Rated, Now Playing, etc.)
 */
router.get("/group/:name/:type/:page", async (req, res) => {
    const { name, type, page } = req.params;
    const limit = 20;
    const skip = (page - 1) * limit;

    try {
        const Model = type === "movies" ? Movie : TVShow;
        const query = {};

        if (name === "popular") query.popularity = { $gt: 1000 };
        if (name === "top-rated") query.vote_average = { $gte: 8 };
        if (name === "now-playing") query.release_date = { $gte: "2023-01-01" };
        if (name === "upcoming") query.release_date = { $gte: "2024-01-01" };

        const results = await Model.find(query).skip(skip).limit(limit);
        res.json({ results });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch grouped media" });
    }
});

/**
 * 📌 5️⃣ Fetch Media Details
 */
router.get("/:type/:id", async (req, res) => {
    const { type, id } = req.params;

    try {
        const Model = type === "movies" ? Movie : TVShow;
        const media = await Model.findOne({ id: Number(id) });

        if (!media) return res.status(404).json({ error: "Media not found" });

        res.json(media);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch media details" });
    }
});

/**
 * 📌 6️⃣ Fetch Media Videos
 */
router.get("/:type/:id/videos", async (req, res) => {
    const { type, id } = req.params;

    try {
        const Model = type === "movies" ? Movie : TVShow;
        const media = await Model.findOne({ id: Number(id) });

        if (!media) return res.status(404).json({ error: "Media not found" });

        res.json({ videos: media.videos });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch media videos" });
    }
});

/**
 * 📌 7️⃣ Fetch Media Logos
 */
router.get("/:type/:id/logos", async (req, res) => {
    const { type, id } = req.params;

    try {
        const Model = type === "movies" ? Movie : TVShow;
        const media = await Model.findOne({ id: Number(id) });

        if (!media) return res.status(404).json({ error: "Media not found" });

        res.json({ logos: media.images.logos });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch media logos" });
    }
});

/**
 * 📌 8️⃣ Fetch Spotlight Media (Random Trending)
 */
router.get("/spotlight/:type", async (req, res) => {
    const { type } = req.params;

    try {
        const Model = type === "movies" ? Movie : TVShow;
        const count = await Model.countDocuments();
        const random = Math.floor(Math.random() * count);
        const media = await Model.findOne().skip(random);

        res.json(media);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch spotlight media" });
    }
});

export default router;
