import mongoose from "mongoose";

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

// Schema for collections (movie series like Marvel, Harry Potter, etc.)
const collectionSchema = new mongoose.Schema({
    id: Number,
    name: String,
    poster_path: String,
    backdrop_path: String,
});

// Movie Schema
const movieSchema = new mongoose.Schema({
    id: { type: Number, unique: true, required: true }, // TMDB ID
    title: String,
    original_title: String,
    overview: String,
    tagline: String, // ✅ New: Movie tagline
    release_date: String,
    runtime: Number,
    budget: Number, // ✅ New: Budget (in USD)
    revenue: Number, // ✅ New: Revenue (in USD)
    status: String, // ✅ New: Movie status (Released, In Production, etc.)
    homepage: String, // ✅ New: Official homepage URL
    imdb_id: String, // ✅ New: IMDb ID
    adult: Boolean, // ✅ New: Indicates if the movie is for adults (18+)
    video: Boolean, // ✅ New: Indicates if it's a video-only release
    original_language: String, // ✅ New: Original language of the movie
    origin_country: [String], // ✅ New: Array of country codes where the movie was made
    genre_ids: [Number], // Genre IDs
    genres: [{ id: Number, name: String }], // Full genre objects
    belongs_to_collection: collectionSchema, // ✅ New: Collection if part of a movie series
    poster_path: String,
    backdrop_path: String,
    media_type: { type: String, enum: ["movie"] },
    popularity: Number,
    vote_average: Number,
    vote_count: Number,
    similar_movies: [{ type: Number }], // Array of similar movie IDs
    production_companies: [productionCompanySchema], // ✅ New: List of production companies
    production_countries: [productionCountrySchema], // ✅ New: List of production countries
    spoken_languages: [spokenLanguageSchema], // ✅ New: List of languages spoken in the movie
    videos: [videoSchema], // Trailers, teasers, clips
    images: {
        backdrops: [imageSchema],
        posters: [imageSchema],
        logos: [imageSchema],
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

// Export Movie Model
export default mongoose.model("Movie", movieSchema);
