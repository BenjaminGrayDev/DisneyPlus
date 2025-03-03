import Paypal from "../../models/Paypal.js";


export const getPlansForSubscription = async () => {

    try {
        // Fetch plans directly from MongoDB using Mongoose
        const fetchedPlansData = await Paypal.findOne();

        if (!fetchedPlansData || !fetchedPlansData.plans) {
            throw new Error("No plans found in the database.");
        }

        const plans = fetchedPlansData.plans.map((plan) => ({
            plan_name: plan.plan_name,
            plan_id: plan.plan_id,
            description: plan.description,
            price: plan.price,
            currency: plan.currency,
            interval_unit: plan.interval_unit,
        }));

        return plans;
    } catch (error) {
        console.error(
            'Error fetching plans:',
            error instanceof Error ? error.message : error
        );
        throw new Error('Failed to fetch plans from the database.');
    }
};