import express from "express";
import Movie from "../models/Movie.js";
import TVShow from "../models/TVShow.js";
import Trending from "../models/Trending.js";

const router = express.Router();

// 🟢 Search Movies & TV Shows
router.get("/search", async (req, res) => {
    try {
        const { query, page = 1 } = req.query;
        const movies = await Movie.find({ title: new RegExp(query, "i") }).limit(10);
        const tvShows = await TVShow.find({ name: new RegExp(query, "i") }).limit(10);

        const results = [...movies, ...tvShows].map(media => ({
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
            language: { original: media.original_language },
        }));

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/spotlight/:type", async (req, res) => {
    console.log("🔍 Reached /spotlight route");
    try {
        const { type } = req.params;
        console.log(`🔍 Fetching spotlight for type: ${type}`);

        let collection;

        if (type === "movies") {
            collection = Movie;
        } else if (type === "series") {
            collection = TVShow;
        } else if (type === "all") {
            const movies = await Movie.find();
            const series = await TVShow.find();
            const allMedia = [...movies, ...series];

            console.log(`📊 Found ${movies.length} movies, ${series.length} series.`);

            if (allMedia.length === 0) {
                console.log("⚠ No media found.");
                return res.status(404).json({ error: "No spotlight media available" });
            }

            const randomIndex = Math.floor(Math.random() * allMedia.length);
            const media = allMedia[randomIndex];

            return res.json({
                id: media.id,
                title: media.title || media.name,
                isForAdult: media.adult || false,
                type: media.media_type === "movie" ? "movies" : "series",
                image: {
                    poster: media.poster_path || "",
                    backdrop: media.backdrop_path || "",
                },
                overview: media.overview || "No overview available.",
                releasedAt: media.release_date || media.first_air_date || "Unknown",
                language: { original: media.original_language || "Unknown" },
            });
        } else {
            console.log("❌ Invalid media type received.");
            return res.status(400).json({ error: "Invalid media type. Use 'movies', 'series', or 'all'." });
        }

        const count = await collection.countDocuments();
        console.log(`🔢 Found ${count} media items in ${type}`);

        if (count === 0) {
            console.log("⚠ No media found in the database.");
            return res.status(404).json({ error: "No spotlight media available" });
        }

        const random = Math.floor(Math.random() * count);
        console.log(`🎲 Random index selected: ${random}`);

        const media = await collection.findOne().skip(random);

        if (!media) {
            console.log("❌ No media found after random selection.");
            return res.status(404).json({ error: "Spotlight media not found" });
        }

        console.log(`✅ Returning media: ${media.title || media.name}`);

        // ✅ Return in the same structure as your frontend expects
        res.json({
            id: media.id,
            title: media.title || media.name,
            isForAdult: media.adult || false,
            type: media.media_type === "movie" ? "movies" : "series",
            image: {
                poster: media.poster_path || "",
                backdrop: media.backdrop_path || "",
            },
            overview: media.overview || "No overview available.",
            releasedAt: media.release_date || media.first_air_date || "Unknown",
            language: { original: media.original_language || "Unknown" },
        });
    } catch (error) {
        console.error("🚨 ERROR in /spotlight/:type:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});


// 🔥 Get Trending Media
router.get("/trending/:type", async (req, res) => {
    console.log("🔍 Reached /trending route");
    try {
        const { type } = req.params;
        console.log(`🔍 Fetching trending for type: ${type}`);

        // Find trending entry in the database
        const trending = await Trending.findOne({ media_type: type, time_window: "day" });

        if (!trending) {
            console.log("⚠ No trending media found in DB.");
            return res.status(404).json({ error: "No trending media found" });
        }

        console.log(`📊 Trending results count: ${trending.results.length}`);

        const results = await Promise.all(
            trending.results.map(async (id) => {
                console.log(`🔍 Searching for media ID: ${id}`);
                return type === "movies" ? await Movie.findOne({ id }) : await TVShow.findOne({ id });
            })
        );

        const filteredResults = results.filter(Boolean);
        console.log(`✅ Returning ${filteredResults.length} trending items`);

        res.json(filteredResults);
    } catch (error) {
        console.error("🚨 ERROR in /trending/:type:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});



// 🏆 Get Grouped Media (Popular, Top-Rated)
router.get("/group/:type/:group", async (req, res) => {
    try {
        const { type, group } = req.params;

        const groupMapping = {
            "popular": { popularity: -1 },
            "top-rated": { vote_average: -1 },
            "now-playing": { release_date: -1 },
            "upcoming": { release_date: 1 },
            "airing-today": { first_air_date: -1 },
        };

        if (!groupMapping[group]) {
            return res.status(400).json({ error: "Invalid group type" });
        }

        const Model = type === "movies" ? Movie : TVShow;
        const results = await Model.find().sort(groupMapping[group]).limit(20);

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// 🔵 Get Movie or TV Show Details
router.get("/:type/:id", async (req, res) => {
    try {
        const { type, id } = req.params;
        const media = type === "movies" ? await Movie.findOne({ id }) : await TVShow.findOne({ id });

        if (!media) return res.status(404).json({ error: "Not Found" });

        res.json(media);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// 🎥 Get Videos (Trailers, Teasers)
router.get("/:type/:id/videos", async (req, res) => {
    try {
        const { type, id } = req.params;
        const media = type === "movies" ? await Movie.findOne({ id }) : await TVShow.findOne({ id });

        if (!media) return res.status(404).json({ error: "Not Found" });

        res.json(media.videos || []);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🖼 Get Images (Posters, Backdrops, Logos)
router.get("/:type/:id/images", async (req, res) => {
    try {
        const { type, id } = req.params;
        const media = type === "movies" ? await Movie.findOne({ id }) : await TVShow.findOne({ id });

        if (!media) return res.status(404).json({ error: "Not Found" });

        res.json(media.images || []);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});






export default router;
