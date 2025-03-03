import { PAYPAL_API } from "../../../global/urls.js";


export const showPlan = async (planID, accessToken) => {

    const response = await fetch(`${PAYPAL_API}/v1/billing/plans/${planID}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        }
    });

    if (!response.ok) {
        const error = await response.json();
        console.error(`Error deactivating :`, error);
        return null; // Return null if the plan creation fails
    }

    const data = await response.json();

    return data;
}