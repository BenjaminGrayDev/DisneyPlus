import AdminJS from 'adminjs';
import * as AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import mongoose from 'mongoose';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const setupAdminJS = async (app) => {
    try {
        AdminJS.registerAdapter(AdminJSMongoose);

        // Ensure MongoDB is connected
        if (!mongoose.connection.readyState) {
            console.error("❌ MongoDB is not connected.");
            return;
        }

        const adminJs = new AdminJS({
            databases: [mongoose],
            rootPath: '/admin',
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
