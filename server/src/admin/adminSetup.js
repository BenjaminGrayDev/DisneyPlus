import AdminJS from 'adminjs';
import * as AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import mongoose from 'mongoose';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { ComponentLoader } from 'adminjs';
import path from 'path';
import { useTranslation } from 'adminjs'



import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentLoader = new ComponentLoader(); // Initialize component loader

const dashboardPath = path.resolve(__dirname, "custom-dashboard.jsx");
console.log("📌 Dashboard Path:", dashboardPath);

const Components = {
    Dashboard: componentLoader.add("Dashboard", dashboardPath),
};

// ✅ Log component registration
console.log("✅ Custom Dashboard Registered in AdminJS:", Components.Dashboard);

componentLoader.override('Login', path.resolve(__dirname, 'custom-login-component.jsx'));

const adminOptions = {
    branding: {
        logo: false,
        companyName: 'Disney Plus',
        softwareBrothers: false,
    },
    assets: {
        styles: [
            `
            /* Forcefully hide the footer branding in AdminJS 7.8.15 */
            .adminjs_LoggedIn { display: none !important; } /* ✅ Hides branding in sidebar */
            .adminjs_MadeWithLove { display: none !important; } /* ✅ Hides "Made with ❤️" */
            .sidebar-footer { display: none !important; } /* ✅ Hides the entire sidebar footer */
            .sb-footer { display: none !important; } /* ✅ Ensures no other footer remains */
            .adminjs_PageFooter { display: none !important; } /* ✅ Removes footer in the main layout */
            .adminjs_Box[data-css="footer"] { display: none !important; } /* ✅ Targets AdminJS 7+ footer */
            `,
        ],
    },
    componentLoader
};

adminOptions.dashboard = { component: Components.Dashboard };


console.log("📌 AdminJS Branding Settings:", adminOptions.branding);


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
