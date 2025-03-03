import { PAYPAL_API } from "../../../global/urls.js";
import { getAccessToken } from "../Authentication.js";

export const listActivePlans = async () => {
    const accessToken = await getAccessToken();
    const activePlans = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
        const response = await fetch(
            `${PAYPAL_API}/v1/billing/plans?page_size=20&page=${currentPage}&total_required=true`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Prefer: "return=representation",
                },
            }
        );

        const data = await response.json();
        if (data.plans && data.plans.length > 0) {
            data.plans.forEach((plan) => {
                if (plan.status === 'ACTIVE' && plan.billing_cycles) {
                    const firstBillingCycle = plan.billing_cycles[0];
                    const price = firstBillingCycle?.pricing_scheme?.fixed_price?.value
                        ? parseFloat(firstBillingCycle.pricing_scheme.fixed_price.value)
                        : 0;
                    const currency = firstBillingCycle?.pricing_scheme?.fixed_price?.currency_code || null;
                    const interval_unit = firstBillingCycle?.frequency?.interval_unit || '';

                    activePlans.push({
                        plan_id: plan.id,
                        plan_name: plan.name,
                        description: plan.description || "",
                        interval_unit: interval_unit,
                        price: price,
                        currency: currency === "USD" || currency === "EUR" ? currency : null,
                    });
                }
            });

            if (data.total_items > currentPage * 20) {
                currentPage += 1;
            } else {
                hasMore = false;
            }
        } else {
            hasMore = false;
        }
    }

    return activePlans;
};
