import mongoose from "mongoose";

const trendingSchema = new mongoose.Schema({
    media_type: { type: String, enum: ["movie", "tv", "all"], required: true },
    time_window: { type: String, enum: ["day", "week"], required: true },
    results: [{ type: Number }], // Array of movie/TV IDs
    fetched_at: { type: Date, default: Date.now }, // Last fetched time
});

export default mongoose.model("Trending", trendingSchema);
