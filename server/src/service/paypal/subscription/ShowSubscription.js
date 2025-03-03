import { PAYPAL_API } from "../../../global/urls.js";
import { getAccessToken } from "../Authentication.js";


export const showSubscription = async (subscriptionID) => {
    if (!subscriptionID) {
        throw new Error("Invalid subscription provided.");
    }

    try {
        const accessToken = await getAccessToken();

        const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionID}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to show subscription : ${response.statusText}`);
        }

        const data = await response.json();

        const nextBillingTime = data?.billing_info?.next_billing_time || "";
        const subscriptionStatus = data?.status || "";

        return {
            nextBillingTime,
            subscriptionStatus,
        };
    } catch (error) {
        throw new Error(error.message);
    }
};
