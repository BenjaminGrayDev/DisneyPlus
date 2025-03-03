"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface PlanContextType {
    selectedPlanId: string | null;
    selectedPlanName: string | null;
    setPlan: (planId: string, planName: string) => void;
    clearPlan: () => void;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [selectedPlanName, setSelectedPlanName] = useState<string | null>(null);

      // ✅ Load from sessionStorage when the app starts
    useEffect(() => {
        const storedPlanId = sessionStorage.getItem("selectedPlanId");
        const storedPlanName = sessionStorage.getItem("selectedPlanName");

        if (storedPlanId && storedPlanName) {
            setSelectedPlanId(storedPlanId);
            setSelectedPlanName(storedPlanName);
        }
    }, []);

    const setPlan = (planId: string, planName: string) => {
        setSelectedPlanId(planId);
        setSelectedPlanName(planName);
        sessionStorage.setItem("selectedPlanId", planId);
        sessionStorage.setItem("selectedPlanName", planName);
    };

    const clearPlan = () => {
        setSelectedPlanId(null);
        setSelectedPlanName(null);
        sessionStorage.removeItem("selectedPlanId");
        sessionStorage.removeItem("selectedPlanName");
    };

    return (
        <PlanContext.Provider value={{ selectedPlanId, selectedPlanName, setPlan, clearPlan }}>
            {children}
        </PlanContext.Provider>
    );
};

export const usePlan = (): PlanContextType => {
    const context = useContext(PlanContext);
    if (!context) {
        throw new Error("usePlan must be used within a PlanProvider");
    }
    return context;
};
