import express from 'express';
import mongoose from 'mongoose';
import AdminJS from 'adminjs';
import * as AdminJSExpress from '@adminjs/express'; // Fix import
import * as AdminJSMongoose from '@adminjs/mongoose'; // Fix import

import dotenv from 'dotenv';
import session from 'express-session';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

AdminJS.registerAdapter(AdminJSMongoose);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Admin panel running at http://localhost:${PORT}/admin`));
