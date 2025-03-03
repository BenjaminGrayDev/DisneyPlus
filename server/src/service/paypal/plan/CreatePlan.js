import { PAYPAL_API } from "../../../global/urls.js";
import Paypal from "../../../models/Paypal.js";
import { getAccessToken } from "../Authentication.js";
import { createProduct } from "../catalogProducts/CreateProduct.js";
import { getProductAndPlanIdFromDB } from "../catalogProducts/getProductsFromDB.js";
import { listActivePlans } from "./ListPlan.js";


const createPlanPayload = (plan, productID) => ({
    product_id: productID,
    name: plan.name,
    description: plan.description,
    status: "ACTIVE",
    billing_cycles: [
        {
            frequency: {
                interval_unit: plan.interval_unit,
                interval_count: 1,
            },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: {
                fixed_price: {
                    value: plan.price.toString(),
                    currency_code: plan.currency,
                },
            },
        },
    ],
    payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
            value: "0",
            currency_code: plan.currency,
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
    },
    taxes: {
        percentage: "0",
        inclusive: false,
    },
});

export const createPlansAndGetID = async () => {
    try {
        const accessToken = await getAccessToken();
        let productFromDB = await getProductAndPlanIdFromDB();
        let productID;
        let plansFromDB = [];

        if (productFromDB && productFromDB.productID) {
            productID = productFromDB.productID;
            plansFromDB = productFromDB.plans || [];
        } else {
            console.log("No product found in the database. Creating a new product.");
            const productResponse = await createProduct();
            productID = productResponse.id;

            await Paypal.create({ product_id: productID, plans: [] });
            console.log("New product saved to the database:", productID);
        }

        const activePayPalPlans = await listActivePlans();
        const databasePlanIDSet = new Set(plansFromDB.map(dbPlan => dbPlan.plan_id));
        const payPalPlanIDSet = new Set(activePayPalPlans.map(payPalPlan => payPalPlan.plan_id));

        console.log('Database Plan IDs:', databasePlanIDSet);
        console.log('PayPal Plan IDs:', payPalPlanIDSet);

        const plans = [
            { name: "Standard Plan", description: "Recommended for Standard Plan", interval_unit: "MONTH", price: 15, currency: "USD" },
            { name: "Booster Plan", description: "Recommended for Booster Plan", interval_unit: "MONTH", price: 50, currency: "USD" },
            { name: "Spammer Plan", description: "Recommended for Spammer Plan", interval_unit: "MONTH", price: 100, currency: "USD" },
            { name: "Standard Plan", description: "Recommended for Standard Plan", interval_unit: "YEAR", price: 150, currency: "USD" },
            { name: "Booster Plan", description: "Recommended for Booster Plan", interval_unit: "YEAR", price: 500, currency: "USD" },
            { name: "Spammer Plan", description: "Recommended for Spammer Plan", interval_unit: "YEAR", price: 1000, currency: "USD" },
        ];

        const newPlans = [];
        const isExist = Array.from(databasePlanIDSet).some(planId =>
            activePayPalPlans.some(payPalPlan => payPalPlan.plan_id === planId)
        );

        if (!isExist) {
            for (const plan of plans) {
                console.log(`Creating new plan: ${plan.name}`);
                const payload = createPlanPayload(plan, productID);
                const response = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "PayPal-Request-Id": `PLAN-${Date.now()}-${plan.name}`,
                        Prefer: "return=representation",
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const error = await response.json();
                    console.error(`Error creating ${plan.name}:`, error);
                    continue;
                }

                const data = await response.json();
                console.log(`${plan.name} Created Successfully:`);

                newPlans.push({
                    plan_name: data.name,
                    plan_id: data.id,
                    description: data.description,
                    interval_unit: data.billing_cycles[0].frequency.interval_unit,
                    price: data.billing_cycles[0].pricing_scheme.fixed_price.value,
                    currency: data.billing_cycles[0].pricing_scheme.fixed_price.currency_code,
                });

                databasePlanIDSet.add(data.id);
            }
        }

        if (newPlans.length > 0) {
            try {
                const sanitizedPlans = newPlans.map(plan => ({
                    ...plan,
                    currency: (["USD", "EUR"].includes(plan.currency || "")) ? plan.currency : "USD",
                    price: parseFloat(plan.price.toString()) || 0,
                }));

                await Paypal.updateOne(
                    { product_id: productID },
                    { $push: { plans: { $each: sanitizedPlans } } }
                );
                console.log("Database updated with new plans.");
            } catch (updateError) {
                console.error("Error updating the database with new plans:", updateError);
            }
        }

        console.log("All plans processed successfully.");
    } catch (error) {
        console.error("Error creating plans:", error);
    }
};