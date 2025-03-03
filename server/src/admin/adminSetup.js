import AdminJS from 'adminjs';
import * as AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import mongoose from 'mongoose';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { ComponentLoader } from 'adminjs';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentLoader = new ComponentLoader(); // Initialize component loader


dotenv.config();

const adminOptions = {
    branding: {
        logo: false,
        companyName: ' ',
    },
    loginPage: {
        component: componentLoader.add('CustomLogin', path.join(__dirname, 'custom-login-component')),
    },
};

const waitForDBConnection = async () => {
    return new Promise((resolve, reject) => {
        if (mongoose.connection.readyState === 1) {
            console.log("✅ MongoDB is already connected.");
            return resolve();
        }

        console.log("⏳ Waiting for MongoDB connection...");
        mongoose.connection.once("open", () => {
            console.log("✅ MongoDB is now connected.");
            resolve();
        });

        mongoose.connection.on("error", (err) => {
            console.error("❌ MongoDB Connection Error:", err);
            reject(err);
        });
    });
};

const loadAllCollections = async () => {
    try {
        // Ensure MongoDB is fully connected before proceeding
        await waitForDBConnection();

        // Fetch all collections from MongoDB
        const db = mongoose.connection.db;
        if (!db) throw new Error("MongoDB connection is not ready.");
        
        const collections = await db.listCollections().toArray();

        // Loop through collections and create models if they don't exist
        collections.forEach((collection) => {
            const collectionName = collection.name;

            if (!mongoose.models[collectionName]) {
                const schema = new mongoose.Schema({}, { strict: false, collection: collectionName });
                mongoose.model(collectionName, schema);
            }
        });

        console.log("✅ All collections have been dynamically registered as Mongoose models.");
    } catch (error) {
        console.error("❌ Error loading collections:", error);
    }
};

const setupAdminJS = async (app) => {
    try {
        AdminJS.registerAdapter(AdminJSMongoose);

        // Ensure MongoDB is connected
        if (!mongoose.connection.readyState) {
            console.error("❌ MongoDB is not connected.");
            return;
        }

        // ✅ Load all collections dynamically
        await loadAllCollections();

        // ✅ Fetch all models after loading collections
        const allResources = Object.keys(mongoose.models).map((modelName) => ({
            resource: mongoose.models[modelName],

        }));

        const adminJs = new AdminJS({
            resources: allResources, // ✅ Load all models dynamically
            rootPath: '/admin',
            branding: {
                companyName: 'My Admin Panel',
            },
            ...adminOptions, // Use predefined options
        });

        const adminRouter = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
            authenticate: async (email, password) => {
                if (email === process.env.ADMIN_EMAIL && await bcrypt.compare(password, await bcrypt.hash(process.env.ADMIN_PASSWORD, 10))) {
                    return { email };
                }
                return null;
            },
            cookiePassword: process.env.COOKIE_SECRET || 'some-secret-key',
        });

        app.use(adminJs.options.rootPath, adminRouter);
        app.use((req, res, next) => {
            res.setHeader(
                "Content-Security-Policy",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com;"
            );
            next();
        });
        console.log(`✅ Admin panel set up at http://localhost:${process.env.PORT || 5000}/admin`);
    } catch (error) {
        console.error("❌ AdminJS Setup Failed", error);
    }
};

export default setupAdminJS;
