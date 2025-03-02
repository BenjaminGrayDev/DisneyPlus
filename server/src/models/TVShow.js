import mongoose from "mongoose";

// Schema for creators (people who created the show)
const creatorSchema = new mongoose.Schema({
    id: Number,
    name: String,
    profile_path: String,
});

// Schema for networks
const networkSchema = new mongoose.Schema({
    id: Number,
    name: String,
    logo_path: String,
    origin_country: String,
});

// Schema for production companies
const productionCompanySchema = new mongoose.Schema({
    id: Number,
    name: String,
    logo_path: String,
    origin_country: String,
});

// Schema for production countries
const productionCountrySchema = new mongoose.Schema({
    iso_3166_1: String,
    name: String,
});

// Schema for spoken languages
const spokenLanguageSchema = new mongoose.Schema({
    iso_639_1: String,
    name: String,
});

// Schema for videos (trailers, teasers)
const videoSchema = new mongoose.Schema({
    id: String,
    key: String,
    site: String,
    type: String,
    official: Boolean,
});

// Schema for images (posters, backdrops, logos)
const imageSchema = new mongoose.Schema({
    file_path: String,
    aspect_ratio: Number,
});

// Schema for last & next episodes to air
const episodeAirSchema = new mongoose.Schema({
    id: Number,
    name: String,
    overview: String,
    air_date: String,
    episode_number: Number,
    season_number: Number,
    still_path: String,
    vote_average: Number,
    vote_count: Number,
});

// **✅ Updated Schema for Seasons**
const seasonSchema = new mongoose.Schema({
    id: Number,
    name: String,
    overview: String,
    poster_path: String,
    season_number: Number,
    vote_average: Number,
    episode_count: Number, // ✅ Total episodes in this season
    air_date: [String], // ✅ Array of air dates for episodes
});

// **✅ Updated TV Show Schema**
const tvShowSchema = new mongoose.Schema({
    id: { type: Number, unique: true, required: true }, // TMDB ID
    name: String, // TV Show Title
    original_name: String,
    overview: String,
    tagline: String, // ✅ New: Show tagline
    first_air_date: String,
    last_air_date: String,
    number_of_seasons: Number,
    number_of_episodes: Number,
    status: String, // ✅ New: (Returning Series, Ended, etc.)
    type: String, // ✅ New: (Documentary, Scripted, Reality, etc.)
    homepage: String, // ✅ New: Official homepage URL
    in_production: Boolean, // ✅ New: Whether it's still being produced
    episode_run_time: [Number], // ✅ New: Array of runtimes for episodes
    original_language: String, // ✅ New: Original language
    origin_country: [String], // ✅ New: Country codes where the show was made
    adult: Boolean, // ✅ New: Indicates if the show is for adults (18+)
    languages: [String], // ✅ New: List of available languages for the show
    genres: [{ id: Number, name: String }],
    poster_path: String,
    backdrop_path: String,
    media_type: { type: String, enum: ["tv"] },
    popularity: Number,
    vote_average: Number,
    vote_count: Number,
    similar_shows: [{ type: Number }], // Array of TV show IDs
    created_by: [creatorSchema], // ✅ New: List of show creators
    networks: [networkSchema], // ✅ New: List of TV networks airing the show
    production_companies: [productionCompanySchema], // ✅ New: List of production companies
    production_countries: [productionCountrySchema], // ✅ New: List of production countries
    spoken_languages: [spokenLanguageSchema], // ✅ New: List of spoken languages
    seasons: [seasonSchema], // ✅ Updated: Array of seasons with correct fields
    last_episode_to_air: episodeAirSchema, // ✅ New: Last aired episode
    next_episode_to_air: episodeAirSchema, // ✅ New: Next scheduled episode
    videos: [videoSchema], // Videos (trailers, teasers, clips)
    images: {
        backdrops: [imageSchema],
        posters: [imageSchema],
        logos: [imageSchema],
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

// Export TV Show Model
export default mongoose.model("TVShow", tvShowSchema);
