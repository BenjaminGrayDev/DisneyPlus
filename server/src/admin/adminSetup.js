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

/**
 * Function to dynamically fetch all collections from MongoDB and register them as Mongoose models.
 */
const loadAllCollections = async () => {
    try {
        // Fetch all collections from MongoDB
        const collections = await mongoose.connection.db.listCollections().toArray();

        // Loop through collections and create models if they don't exist
        collections.forEach((collection) => {
            const collectionName = collection.name;

            // If the model does not already exist, define a basic schema dynamically
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
