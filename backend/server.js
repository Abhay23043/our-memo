import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";

import {
    verifyMailConnection
} from "./services/mail.service.js";

import googleAuthRoutes
    from "./routes/googleAuth.routes.js";

import authRoutes
    from "./routes/auth.routes.js";

import photoRoutes
    from "./routes/photo.routes.js";

import folderRoutes
    from "./routes/folder.routes.js";


const app = express();


// =====================================================
// ENVIRONMENT
// =====================================================

const isProduction =
    process.env.NODE_ENV === "production";


// =====================================================
// TRUST RENDER PROXY
// =====================================================

if (isProduction) {

    app.set(
        "trust proxy",
        1
    );

}


// =====================================================
// FRONTEND CORS
// =====================================================

const frontendUrl =
    process.env.FRONTEND_URL ||
    "http://localhost:5173";


app.use(
    cors({

        origin: frontendUrl,

        credentials: true

    })
);


// =====================================================
// BODY PARSER
// =====================================================

app.use(
    express.json()
);


// =====================================================
// SESSION
// =====================================================

app.use(
    session({

        secret:
            process.env.SESSION_SECRET,

        resave:
            false,

        saveUninitialized:
            false,

        store:
            MongoStore.create({

                mongoUrl:
                    process.env.MONGO_URI

            }),

        cookie: {

            httpOnly:
                true,

            secure:
                isProduction,

            sameSite:
                isProduction
                    ? "none"
                    : "lax",

            maxAge:
                1000 *
                60 *
                60 *
                24 *
                7

        }

    })
);


// =====================================================
// ROUTES
// =====================================================


// Google authentication

app.use(
    "/auth",
    googleAuthRoutes
);


// Normal authentication

app.use(
    "/auth",
    authRoutes
);


// Photos

app.use(
    "/api/photos",
    photoRoutes
);


// Folders

app.use(
    "/api/folders",
    folderRoutes
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
    "/",
    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                "Our Memo API is running"

        });

    }
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "Route not found"

        });

    }
);


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "GLOBAL ERROR:",
            error
        );


        res.status(
            error.status || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Internal server error"

        });

    }
);


// =====================================================
// MONGODB + SERVER
// =====================================================

const PORT =
    process.env.PORT || 5000;


mongoose
    .connect(
        process.env.MONGO_URI
    )

    .then(() => {

        console.log(
            "MongoDB connected"
        );


        app.listen(
            PORT,
            () => {

                console.log(
                    `Server running on port ${PORT}`
                );

            }
        );


        verifyMailConnection();

    })

    .catch(
        (error) => {

            console.error(
                "MongoDB connection failed:",
                error
            );

            process.exit(1);

        }
    );