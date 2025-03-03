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

// ✅ Get Spotlight Media (Optimized)
router.get("/spotlight/:type", async (req, res) => {
    try {
        const { type } = req.params;
        const collection = type === "movies" ? Movie : TVShow;
        const count = await collection.countDocuments();
        if (count === 0) return res.status(404).json({ error: "No spotlight media" });

        const random = Math.floor(Math.random() * count);
        const media = await collection.findOne().skip(random).lean();
        if (!media) return res.status(404).json({ error: "No media found" });

        res.json({
            id: media.id,
            title: media.title || media.name,
            isForAdult: media.adult || false,
            type,
            image: {
                poster: media.poster_path || "",
                backdrop: media.backdrop_path || "",
            },
            overview: media.overview || "No overview available.",
            releasedAt: media.release_date || media.first_air_date || "Unknown",
            language: { original: media.original_language || "Unknown" },
        });
    } catch (error) {
        console.error("🚨 Error in /spotlight/:type:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🔥 Get Trending Media
router.get("/trending/:type", async (req, res) => {
    try {
        const { type } = req.params;
        if (!["movies", "series"].includes(type)) return res.status(400).json({ error: "Invalid type" });

        const trending = await Trending.findOne({ media_type: type, time_window: "day" }).lean();
        if (!trending || !trending.results.length) return res.status(404).json({ error: "No trending media" });

        const results = await (type === "movies" ? Movie : TVShow)
            .find({ id: { $in: trending.results } })
            .select("id title name adult poster_path backdrop_path overview release_date first_air_date original_language")
            .lean();

        res.json(results.map(media => ({
            id: media.id,
            title: media.title || media.name,
            isForAdult: media.adult || false,
            type,
            image: {
                poster: media.poster_path || "",
                backdrop: media.backdrop_path || "",
            },
            overview: media.overview || "No overview available.",
            releasedAt: media.release_date || media.first_air_date || "Unknown",
            language: { original: media.original_language || "Unknown" },
        })));
    } catch (error) {
        console.error("🚨 Error in /trending/:type:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// 🏆 Get Grouped Media (Popular, Top-Rated)
router.get("/group/:type/:group", async (req, res) => {
    try {
        const { type, group } = req.params;
        const page = parseInt(req.query.page) || 1;
        const Model = type === "movies" ? Movie : TVShow;

        const groupMapping = {
            "popular": { popularity: -1 },
            "top-rated": { vote_average: -1 },
            "now-playing": { first_air_date: -1 },
            "upcoming": { first_air_date: 1 },
            "airing-today": { first_air_date: -1 },
        };

        if (!groupMapping[group]) return res.status(400).json({ error: "Invalid group" });

        const results = await Model.find()
            .sort(groupMapping[group])
            .skip((page - 1) * 20)
            .limit(20)
            .select("id title name adult poster_path backdrop_path overview first_air_date original_language")
            .lean();

        res.json(results.map(media => ({
            id: media.id,
            title: media.name || "Unknown Title",
            isForAdult: media.adult || false,
            type,
            image: {
                poster: media.poster_path || "",
                backdrop: media.backdrop_path || "",
            },
            overview: media.overview || "No overview available.",
            releasedAt: media.first_air_date || "Unknown",
            language: { original: media.original_language || "Unknown" },
        })));
    } catch (error) {
        console.error("🚨 Error in /group/:type/:group:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🔵 Get Movie or TV Show Details
router.get("/:type/:id", async (req, res) => {
    try {
        const { type, id } = req.params;
        console.log(`🔍 Fetching details for: Type=${type}, ID=${id}`);

        // Determine the correct model
        const Model = type === "movies" ? Movie : TVShow;
        const media = await Model.findOne({ id });

        if (!media) {
            console.log("⚠ Media not found.");
            return res.status(404).json({ error: "Not Found" });
        }

        console.log(`✅ Found media: ${media.title || media.name}`);

        // ✅ Return response formatted exactly like frontend API
        const formattedResponse = {
            id: media.id,
            title: media.title || media.name,
            isForAdult: media.adult || false,
            type: type, // ✅ Ensure it's "movies" or "series"
            image: {
                poster: media.poster_path || "",
                backdrop: media.backdrop_path || "",
            },
            overview: media.overview || "No overview available.",
            releasedAt: media.release_date || media.first_air_date || "Unknown",
            language: { original: media.original_language || "Unknown" },
        };

        res.json(formattedResponse);
    } catch (error) {
        console.error("🚨 ERROR in /:type/:id:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// 🎥 Get Videos (Trailers, Teasers)
router.get("/:type/:id/videos", async (req, res) => {
    try {
    const { type, id } = req.params;
    const media = type === "movies" ? await Movie.findOne({ id }) : await TVShow.findOne({ id });

    if (!media) return res.status(404).json({ error: "Not Found" });

    if (!media.videos || media.videos.length === 0) return res.json(null);

    // ✅ Find the best video (Trailer/Teaser & Official)
    const video = media.videos.find(
        (vid) => (vid.type === "Trailer" || vid.type === "Teaser") && vid.official
    );

    if (!video) return res.json(null);

    // ✅ Format response to match frontend API
    res.json({
        id: video.id,
        name: video.name,
        key: video.key,
        site: video.site,
        size: video.size,
        type: video.type,
        isOfficial: video.official,
    });
    } catch (error) {
    console.error("🚨 ERROR in /:type/:id/videos:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// 🖼 Get Images (Posters, Backdrops, Logos)
router.get("/:type/:id/images", async (req, res) => {
    try {
        const { type, id } = req.params;
        const media = type === "movies" ? await Movie.findOne({ id }) : await TVShow.findOne({ id });

        if (!media) return res.status(404).json({ error: "Not Found" });

        // ✅ Extract only logos from images
        const logos = media.images?.logos || [];

        // ✅ Find the English logo (or first available logo)
        const logo = logos.find((logo) => logo.iso_639_1 === "en") || logos[0];

        if (!logo) return res.json(null); // Return null if no logo found

        // ✅ If width & height exist in DB, use them
        let { width, height, aspect_ratio } = logo;

        // ✅ If aspect_ratio exists but width/height is missing, calculate dynamically
        const defaultWidth = 500;  // 🔹 You can adjust this as needed
        if (!width && !height && aspect_ratio) {
            width = Math.round(defaultWidth);
            height = Math.round(defaultWidth / aspect_ratio);
        }

        // ✅ If width exists but height is missing, calculate height
        if (width && !height && aspect_ratio) {
            height = Math.round(width / aspect_ratio);
        }

        // ✅ If height exists but width is missing, calculate width
        if (height && !width && aspect_ratio) {
            width = Math.round(height * aspect_ratio);
        }

        // ✅ Final response
        res.json({
            aspectRatio: aspect_ratio || (width && height ? width / height : 1), // Fallback to 1 if missing
            width: width || defaultWidth,  // Ensure a valid width
            height: height || Math.round(defaultWidth / (aspect_ratio || 1)), // Ensure a valid height
            image: logo.file_path, // ✅ Ensure correct image path
        });
    } catch (error) {
        console.error("🚨 ERROR in /:type/:id/images:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

router.get("/:type/:id/similar", async (req, res) => {
    try {
        const { type, id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const Model = type === "movies" ? Movie : TVShow;

        // 🔍 Find the target media
        const media = await Model.findOne({ id });
        if (!media) return res.status(404).json({ error: "Media not found" });

        // 🎯 Find similar media based on stored `similar_movies` or `similar_shows`
        const similarMedia = await Model.find({ id: { $in: media.similar_movies || media.similar_shows || [] } })
            .skip(skip)
            .limit(limit);

        if (!similarMedia.length) {
            return res.status(404).json({ error: "No similar media found" });
        }

        // ✅ Format the response to match TMDB API structure
        const formattedResults = similarMedia.map(media => ({
            id: media.id,
            title: media.title || media.name,
            isForAdult: media.adult || false,
            type: type === "movies" ? "movies" : "series",
            image: {
                poster: media.poster_path || "",
                backdrop: media.backdrop_path || "",
            },
            overview: media.overview || "No overview available.",
            releasedAt: media.release_date || media.first_air_date || "Unknown",
            language: { original: media.original_language || "Unknown" },
        }));

        res.json({
            page,
            total_results: similarMedia.length,
            results: formattedResults
        });
    } catch (error) {
        console.error("🚨 ERROR in /:type/:id/similar:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// 📏 Get Runtime (for Movies) or Number of Seasons (for TV Shows)
router.get("/:type/:id/measure", async (req, res) => {
    try {
        const { type, id } = req.params;
        const media = type === "movies" ? await Movie.findOne({ id }) : await TVShow.findOne({ id });

        if (!media) return res.status(404).json({ error: "Media Not Found" });

        const measure = type === "movies" ? media.runtime : media.number_of_seasons;

        res.json({ measure });
    } catch (error) {
        console.error("🚨 ERROR in /:type/:id/measure:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

export default router;
