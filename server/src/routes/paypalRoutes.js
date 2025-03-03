import express from "express";
import crypto from "crypto";
import { createSubscription } from "../service/paypal/subscription/CreateSubscription.js";
import { getPlansForSubscription } from "../service/paypal/getPlansFromDbService.js";
import User from "../models/User.js";
import { showSubscription } from "../service/paypal/subscription/ShowSubscription.js";

const router = express.Router();

router.post("/create-subscription", async (req, res) => {
    try {
        const { planId } = req.body;
        if (!planId) {
            return res.status(400).json({ error: "Missing planId in the request body" });
        }
        const approvalUrl = await createSubscription(planId);
        res.status(200).json({ approvalUrl });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
});

router.get("/plans", async (req, res) => {
    try {
        const plans = await getPlansForSubscription();
        res.status(200).json({ plans });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
});

router.get("/get-user-plan", async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: "Missing email parameter" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ userPlanData: user });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
});

router.post("/paypal/webhook", async (req, res) => {
    try {
        const { event_type, resource } = req.body;
        console.log("Received PayPal Webhook:", event_type);

        if (event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
            await User.updateOne({ subscriptionId: resource.id }, {
                $set: {
                    subscriptionId: "",
                    planId: "",
                    paypalSubscriptionExpiresAt: "",
                    paypalSubscriptionApiKey: "",
                }
            });
            console.log(`Subscription ${resource.id} canceled. User access revoked.`);
        }
        res.status(200).json({ message: "Webhook received" });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
});

const generateApiKey = async () => {
    return crypto.randomBytes(32).toString("hex");
};

router.post("/save-subscription", async (req, res) => {
    try {
        const { planId, subscriptionId, planName, userEmail } = req.body;
        if (!planId || !subscriptionId || !planName || !userEmail) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const subscriptionResponse = await showSubscription(subscriptionId);
        const nextBillingTime = subscriptionResponse?.nextBillingTime;
        const subscriptionStatus = subscriptionResponse?.subscriptionStatus;
        const apiKey = await generateApiKey();
        await User.updateOne({ email: userEmail }, {
            $set: {
                planId,
                subscriptionId,
                planName,
                paypalSubscriptionExpiresAt: nextBillingTime,
                subscriptionStatus,
                paypalSubscriptionApiKey: apiKey,
            }
        });
        res.status(200).json({ success: "Subscription updated successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
});

router.post("/saveUsedFeatures", async (req, res) => {
    try {
        const { userEmail, backlinks, plugin, keywordSearches, competitiveAnalysis, serpScanner } = req.body;
        if (!userEmail) {
            return res.status(400).json({ error: "User email is missing" });
        }
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const usedFeatures = {
            backlinks: backlinks ?? user.usedFeatures?.backlinks ?? 0,
            plugin: plugin ?? user.usedFeatures?.plugin ?? 0,
            keywordSearches: keywordSearches ?? user.usedFeatures?.keywordSearches ?? 0,
            competitiveAnalysis: competitiveAnalysis ?? user.usedFeatures?.competitiveAnalysis ?? 0,
            serpScanner: serpScanner ?? user.usedFeatures?.serpScanner ?? 0,
        };
        await User.updateOne({ email: userEmail }, { $set: { usedFeatures } });
        res.status(200).json({ success: "Used Features saved successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
});

router.get("/show-subscription", async (req, res) => {
    try {
        const { subscriptionId } = req.query;
        if (!subscriptionId) {
            return res.status(400).json({ error: "Missing subscriptionId" });
        }
        const response = await showSubscription(subscriptionId);
        if (typeof response === "string") {
            return res.status(400).json({ error: response });
        }
        res.status(200).json({ subscriptionStatus: response.subscriptionStatus });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
});

export default router;
