import { PAYPAL_API } from "../../../global/urls.js";
import { getAccessToken } from "../Authentication.js";


export const deactivePlan = async (planID) => {

    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API}/v1/billing/plans/${planID}/deactivate`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: '',
    });

    if (!response.ok) {
        const error = await response.json();
        console.error(`Error deactivating :`, error);
        return null; // Return null if the plan creation fails
    }

    return response;
}