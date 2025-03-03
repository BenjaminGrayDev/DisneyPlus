import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
    plan_name: { type: String, required: true },
    plan_id: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    interval_unit: { type: String, required: true }, // Example: "MONTHLY", "YEARLY"
    currency: {
        type: String,
        enum: ["USD", "EUR"],
        required: true
    }
});

const PayPalPlanSchema = new mongoose.Schema({
    product_id: { type: String, required: true, unique: true }, // Unique PayPal product ID
    plans: [PlanSchema] // Embedded plans array
}, { timestamps: true });

export default mongoose.model("Paypal", PayPalPlanSchema);
