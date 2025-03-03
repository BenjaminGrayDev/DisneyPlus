import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import TVShow from "../models/TVShow.js";

dotenv.config();

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

/**
 * Fetch TV show details from TMDB.
 */
const fetchTVShowDetails = async (tvId) => {
    try {
        const { data } = await axios.get(
            `${BASE_URL}/tv/${tvId}?api_key=${API_KEY}&append_to_response=videos,images,similar`
        );

        return {
            id: data.id,
            name: data.name,
            original_name: data.original_name,
            overview: data.overview,
            tagline: data.tagline || "",
            first_air_date: data.first_air_date,
            last_air_date: data.last_air_date,
            number_of_seasons: data.number_of_seasons,
            number_of_episodes: data.number_of_episodes,
            status: data.status,
            type: data.type || "",
            homepage: data.homepage || "",
            in_production: data.in_production,
            episode_run_time: data.episode_run_time || [],
            original_language: data.original_language,
            origin_country: data.origin_country || [],
            adult: data.adult,
            languages: data.languages || [],
            created_by: data.created_by || [],
            networks: data.networks || [],
            production_companies: data.production_companies || [],
            production_countries: data.production_countries || [],
            spoken_languages: data.spoken_languages || [],
            seasons: data.seasons || [],
            last_episode_to_air: data.last_episode_to_air || null,
            next_episode_to_air: data.next_episode_to_air || null,
            videos: data.videos?.results || [],
            images: data.images || {},

            // ✅ Fix Missing Fields
            poster_path: data.poster_path || "",
            backdrop_path: data.backdrop_path || "",
            media_type: "tv",  // ✅ Explicitly set media type
            popularity: data.popularity || 0,  // ✅ Avoid null values
            vote_average: data.vote_average || 0,  // ✅ Avoid null values
            vote_count: data.vote_count || 0,  // ✅ Avoid null values
            similar_shows: data.similar?.results?.map(show => show.id) || [], // ✅ Store similar show IDs
        };
    } catch (error) {
        console.error(`❌ Error fetching TV Show ${tvId}:`, error.message);
        return null;
    }
};

const saveTVShow = async (tvShowData) => {
    try {
        const existingShow = await TVShow.findOne({ id: tvShowData.id });

        if (!existingShow) {
            await TVShow.create(tvShowData);
            console.log(`✅ Added TV Show: ${tvShowData.name}`);
        } else {
            await TVShow.updateOne({ id: tvShowData.id }, tvShowData);
            console.log(`♻️ Updated TV Show: ${tvShowData.name}`);
        }
    } catch (error) {
        console.error(`❌ Error saving TV Show ${tvShowData.id}:`, error.message);
    }
};

const fetchTrendingTVShows = async () => {
    await connectDB();

    console.log("🔄 Fetching trending TV shows...");

    try {
        const firstPageResponse = await axios.get(`${BASE_URL}/trending/tv/day?api_key=${API_KEY}`);
        const totalPages = Math.min(firstPageResponse.data.total_pages, 500); // Max 500 pages
        let allShows = firstPageResponse.data.results;

        console.log(`📌 Total pages to fetch: ${totalPages}`);

        for (let page = 2; page <= totalPages; page++) {
            console.log(`🔄 Fetching page ${page}...`);
            const response = await axios.get(`${BASE_URL}/trending/tv/day?api_key=${API_KEY}&page=${page}`);
            allShows = allShows.concat(response.data.results);
        }

        console.log(`✅ Total TV Shows fetched: ${allShows.length}`);

        for (const show of allShows) {
            const tvShowDetails = await fetchTVShowDetails(show.id);
            if (tvShowDetails) await saveTVShow(tvShowDetails);
        }

        console.log(`✅ All trending TV shows saved!`);
    } catch (error) {
        console.error("❌ Error fetching trending TV shows:", error.message);
    } finally {
        mongoose.connection.close();
    }
};

// Run the function
fetchTrendingTVShows();
