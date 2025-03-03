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
    id: { type: Number, unique: true, required: true },
    name: String,
    original_name: String,
    overview: String,
    tagline: String,
    first_air_date: String,
    last_air_date: String,
    number_of_seasons: Number,
    number_of_episodes: Number,
    status: String,
    type: String,
    homepage: String,
    in_production: Boolean,
    episode_run_time: [Number],
    original_language: String,
    origin_country: [String],
    adult: Boolean,
    languages: [String],
    created_by: [creatorSchema],
    networks: [networkSchema],
    production_companies: [productionCompanySchema],
    production_countries: [productionCountrySchema],
    spoken_languages: [spokenLanguageSchema],
    seasons: [seasonSchema],
    last_episode_to_air: episodeAirSchema,
    next_episode_to_air: episodeAirSchema,
    videos: [videoSchema],
    images: {
        backdrops: [imageSchema],
        posters: [imageSchema],
        logos: [imageSchema],
    },

    // ✅ Fix Missing Fields
    poster_path: { type: String, default: "" },
    backdrop_path: { type: String, default: "" },
    media_type: { type: String, enum: ["tv"], required: true }, // ✅ Ensure correct media type
    popularity: { type: Number, default: 0 }, // ✅ Prevent null issues
    vote_average: { type: Number, default: 0 },
    vote_count: { type: Number, default: 0 },
    similar_shows: [{ type: Number }], // ✅ Store array of similar show IDs

    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});


// Export TV Show Model
export default mongoose.model("TVShow", tvShowSchema);
