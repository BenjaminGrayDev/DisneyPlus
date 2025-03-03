import Paypal from "../../../models/Paypal.js";


export const getProductAndPlanIdFromDB = async () => {
    try {
        const productData = await Paypal.findOne(); // Fetch the first product with plans

        if (!productData) {
            console.warn("No product or plans found in the database.");
            return null;
        }

        if (!productData.product_id || !productData.plans) {
            console.warn("Incomplete product data in database.");
            return null;
        }

        const plans = productData.plans.map((plan) => ({
            ...plan.toObject(),
            price: String(plan.price), // Convert price to string
        }));

        return {
            productID: productData.product_id,
            plans,
        };
    } catch (error) {
        console.error("Error fetching product and plans from database:", error);
        return null;
    }
};
