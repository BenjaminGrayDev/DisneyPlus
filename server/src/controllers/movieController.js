import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Movie from "../models/Movie.js";
import Trending from "../models/Trending.js";

dotenv.config();

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

/**
 * Fetch movie details from TMDB.
 */
const fetchMovieDetails = async (movieId) => {
    try {
        const { data } = await axios.get(
            `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,images,similar`
        );

        return {
            id: data.id,
            title: data.title,
            original_title: data.original_title,
            overview: data.overview,
            tagline: data.tagline || "",
            release_date: data.release_date,
            runtime: data.runtime,
            budget: data.budget || 0,
            revenue: data.revenue || 0,
            status: data.status,
            homepage: data.homepage || "",
            imdb_id: data.imdb_id || "",
            adult: data.adult,
            video: data.video,
            original_language: data.original_language,
            origin_country: data.origin_country || [],
            genres: data.genres || [],
            belongs_to_collection: data.belongs_to_collection || null,
            poster_path: data.poster_path,
            backdrop_path: data.backdrop_path,
            media_type: "movie",
            popularity: data.popularity,
            vote_average: data.vote_average,
            vote_count: data.vote_count,
            similar_movies: data.similar?.results.map((m) => m.id) || [],
            production_companies: data.production_companies || [],
            production_countries: data.production_countries || [],
            spoken_languages: data.spoken_languages || [],
            videos: Array.isArray(data.videos?.results)
                ? data.videos.results.map((video) => ({
                    id: video.id,
                    key: video.key,
                    site: video.site,
                    type: video.type,
                    official: video.official,
                }))
                : [],
            images: {
                backdrops: data.images?.backdrops?.map((img) => ({
                    file_path: img.file_path,
                    aspect_ratio: img.aspect_ratio,
                })) || [],
                posters: data.images?.posters?.map((img) => ({
                    file_path: img.file_path,
                    aspect_ratio: img.aspect_ratio,
                })) || [],
                logos: data.images?.logos?.map((img) => ({
                    file_path: img.file_path,
                    aspect_ratio: img.aspect_ratio,
                })) || [],
            },
        };
    } catch (error) {
        console.error(`Error fetching movie ${movieId}:`, error.message);
        return null;
    }
};

/**
 * Save movie data into MongoDB.
 */
const saveMovie = async (movieData) => {
    const existingMovie = await Movie.findOne({ id: movieData.id });

    if (!existingMovie) {
        await Movie.create(movieData);
        console.log(`✅ Added movie: ${movieData.title}`);
    } else {
        await Movie.updateOne({ id: movieData.id }, movieData);
        console.log(`♻️ Updated movie: ${movieData.title}`);
    }
};

/**
 * Fetch & Save All Trending Movies.
 */
const fetchTrendingMovies = async () => {
    await connectDB();

    console.log("🔄 Fetching trending movies...");

    try {
        const firstPageResponse = await axios.get(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`);
        const totalPages = Math.min(firstPageResponse.data.total_pages, 500); // Max 500 pages
        let allMovies = firstPageResponse.data.results; // Start with first page results

        console.log(`📌 Total pages to fetch: ${totalPages}`);

        // Loop through all pages and collect movies
        for (let page = 2; page <= totalPages; page++) {
            console.log(`🔄 Fetching page ${page}...`);
            const response = await axios.get(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&page=${page}`);
            allMovies = allMovies.concat(response.data.results); // Append results
        }

        console.log(`✅ Total movies fetched: ${allMovies.length}`);

        // Save each movie to MongoDB
        for (const movie of allMovies) {
            const movieDetails = await fetchMovieDetails(movie.id);
            if (movieDetails) await saveMovie(movieDetails);
        }

        // Store trending list in DB
        await Trending.findOneAndUpdate(
            { media_type: "movie", time_window: "day" },
            { results: allMovies.map(m => m.id), fetched_at: new Date() },
            { upsert: true }
        );

        console.log(`✅ All trending movies saved!`);
    } catch (error) {
        console.error("❌ Error fetching trending movies:", error.message);
    } finally {
        mongoose.connection.close();
    }
};


fetchTrendingMovies();
