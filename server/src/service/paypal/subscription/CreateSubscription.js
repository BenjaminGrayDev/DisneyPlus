import { PAYPAL_API } from "../../../global/urls.js";
import { getAccessToken } from "../Authentication.js";


export const createSubscription = async (planID) => {
    if (!planID) {
        throw new Error("Invalid plan ID provided");
    }

    try {
        const accessToken = await getAccessToken();

        const subscriptionPayload = {
            plan_id: planID,
            start_time: new Date(new Date().getTime() + 60000).toISOString(),
            quantity: 1,
            application_context: {
                brand_name: "Surferlink",
                locale: "en-US",
                user_action: "SUBSCRIBE_NOW",
                return_url: "http://localhost:3000/dashboard",
                cancel_url: "http://localhost:3000/dashboard",
            },
        };

        const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                Accept: "application/json",
                "PayPal-Request-Id": `SUBSCRIPTION-${Date.now()}`,
                Prefer: "return=representation",
            },
            body: JSON.stringify(subscriptionPayload),
        });

        if (!response.ok) {
            throw new Error(`Failed to create subscription : ${response.statusText}`);
        }

        const data = await response.json();
        const approvalUrl = data.links.find((link) => link.rel === "approve")?.href;

        if (!approvalUrl) {
            throw new Error("Approval URL not found in PayPal response");
        }

        return approvalUrl;
    } catch (error) {
        throw new Error(error.message);
    }
};
