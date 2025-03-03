"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { usePlan } from "../../context/UserPlanContext";

interface Plan {
    plan_name: string;
    plan_id: string;
    description: string;
    price: number;
    currency: string;
    interval_unit: string;
}

export default function PricingTable({ isUpdatingSubscription }: { isUpdatingSubscription: boolean }) {
    const { user, refreshUser } = useUser();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const { setPlan } = usePlan();
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await fetch("/api/paypal/plans");
                const data = await response.json();
                setPlans(data.plans);

                if (data.plans.length > 0) {
                    setBillingCycle(data.plans[0].interval_unit === "MONTH" ? "monthly" : "annually");
                }
            } catch (error) {
                console.error("Error fetching plans:", error);
            } finally {
                setFetchLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleSubscription = async (planId: string, planName: string) => {
        try {
            setIsProcessing(true);
            const response = await fetch("/api/paypal/create-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
            });

            const result = await response.json();
            if (response.ok && result.approvalUrl) {
                setPlan(planId, planName);
                setTimeout(() => {
                    window.location.href = result.approvalUrl;
                }, 1000);
            } else {
                alert("Subscription creation failed.");
            }
        } catch (error) {
            console.error("Error creating subscription:", error);
            alert("An error occurred.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (fetchLoading || isUpdatingSubscription) {
        return (
            <div className="flex flex-col items-center mx-auto my-auto">
                Loading...
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center mx-auto py-10">
            {/* Billing Toggle */}
            <div className="flex items-center space-x-4 mb-10">
                {["monthly", "annually"].map((cycle) => (
                    <button
                        key={cycle}
                        onClick={() => setBillingCycle(cycle as "monthly" | "annually")}
                        className={`px-4 py-1 rounded-full ${billingCycle === cycle ? "bg-blue-500 text-white" : "text-gray-600"}`}
                    >
                        {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                    </button>
                ))}
            </div>

            {/* Pricing Cards */}
            <div className="flex flex-wrap justify-center gap-16 ">
                {plans
                    .filter((plan) => billingCycle === "monthly" ? plan.interval_unit === "MONTH" : plan.interval_unit === "YEAR")
                    .map((plan, index) => {
                        const isCurrentPlan = user?.subscriptionId && user?.planName === plan.plan_name;
                        return (
                            <div key={index} className={`p-6 rounded-lg shadow-md border ${isCurrentPlan ? "border-blue-500" : "border-gray-300"}`}>
                                <h3 className="text-xl font-bold mb-2">{plan.plan_name}</h3>
                                <p className="text-gray-600">{plan.description}</p>
                                <p className="text-3xl font-bold mt-4">
                                    {plan.currency ? "$" : "€"}{plan.price}
                                    <span className="text-sm"> / {billingCycle}</span>
                                </p>

                                <button
                                    className={`w-full py-2 mt-4 rounded-lg ${isCurrentPlan ? "bg-blue-500 text-white" : "bg-gray-300"}`}
                                    disabled={!!isCurrentPlan}
                                    onClick={() => {
                                        if (!isCurrentPlan) {
                                            setSelectedPlan({ id: plan.plan_id, name: plan.plan_name });
                                            setIsModalOpen(true);
                                        }
                                    }}
                                >
                                    {isCurrentPlan ? "Current Plan" : "Upgrade Plan"}
                                </button>
                            </div>
                        );
                })}
            </div>

            {/* Subscription Confirmation Modal */}
            {isModalOpen && selectedPlan && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-md w-96">
                        <h2 className="text-lg font-bold">Confirm Subscription</h2>
                        <p className="mt-2">Subscribe to <strong>{selectedPlan.name}</strong>?</p>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button className="px-4 py-2 bg-gray-300" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button
                                className={`px-4 py-2 text-white ${isProcessing ? "bg-gray-500" : "bg-blue-500"}`}
                                onClick={() => handleSubscription(selectedPlan.id, selectedPlan.name)}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "Processing..." : "OK"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
