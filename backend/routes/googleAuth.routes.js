import "dotenv/config";

import express from "express";

import { google } from "googleapis";

import crypto from "crypto";


const router = express.Router();


// =====================================================
// GOOGLE OAUTH CLIENT
// =====================================================

const oauth2Client =
    new google.auth.OAuth2(

        process.env.GOOGLE_CLIENT_ID,

        process.env.GOOGLE_CLIENT_SECRET,

        process.env.GOOGLE_REDIRECT_URI

    );


// =====================================================
// GOOGLE DRIVE SCOPES
// =====================================================

const SCOPES = [

    "https://www.googleapis.com/auth/drive"

];


// =====================================================
// START GOOGLE OAUTH
// GET /auth/google
// =====================================================

router.get(
    "/google",
    (req, res) => {

        try {

            // =================================================
            // CREATE RANDOM STATE
            // Prevents OAuth CSRF attacks
            // =================================================

            const state =
                crypto
                    .randomBytes(32)
                    .toString("hex");


            // =================================================
            // SAVE STATE IN SESSION
            // =================================================

            req.session.googleOAuthState =
                state;


            // =================================================
            // GENERATE GOOGLE AUTH URL
            // =================================================

            const authUrl =
                oauth2Client.generateAuthUrl({

                    access_type:
                        "offline",

                    scope:
                        SCOPES,

                    prompt:
                        "consent",

                    state:
                        state

                });


            console.log(
                "Google OAuth started"
            );


            console.log(
                "Google Redirect URI:",
                process.env.GOOGLE_REDIRECT_URI
            );


            // =================================================
            // REDIRECT TO GOOGLE
            // =================================================

            return res.redirect(
                authUrl
            );


        } catch (error) {

            console.error(
                "GOOGLE AUTH START ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to start Google authentication"

            });

        }

    }
);


// =====================================================
// GOOGLE OAUTH CALLBACK
// GET /auth/google/callback
// =====================================================

router.get(
    "/google/callback",
    async (req, res) => {

        const {
            code,
            state,
            error
        } = req.query;


        // =================================================
        // GOOGLE DENIED ACCESS
        // =================================================

        if (error) {

            console.error(
                "Google OAuth denied:",
                error
            );


            return res.status(400).json({

                success: false,

                message:
                    "Google authorization was denied"

            });

        }


        // =================================================
        // AUTHORIZATION CODE CHECK
        // =================================================

        if (!code) {

            return res.status(400).json({

                success: false,

                message:
                    "Authorization code missing"

            });

        }


        // =================================================
        // STATE CHECK
        // =================================================

        if (
            !state ||
            !req.session.googleOAuthState ||
            state !==
                req.session.googleOAuthState
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid OAuth state"

            });

        }


        // =================================================
        // REMOVE USED STATE
        // =================================================

        delete req.session.googleOAuthState;


        try {

            // =================================================
            // EXCHANGE AUTHORIZATION CODE
            // =================================================

            const {
                tokens
            } =
                await oauth2Client.getToken(
                    code
                );


            // =================================================
            // DO NOT SEND TOKENS TO BROWSER
            //
            // IMPORTANT:
            // refresh_token is a sensitive credential.
            // Your existing GOOGLE_REFRESH_TOKEN should
            // remain in Render Environment Variables.
            // =================================================

            console.log(
                "Google OAuth authorization successful"
            );


            // =================================================
            // OPTIONAL INFORMATION
            // Do NOT log access_token / refresh_token
            // =================================================

            console.log({

                hasAccessToken:
                    Boolean(
                        tokens.access_token
                    ),

                hasRefreshToken:
                    Boolean(
                        tokens.refresh_token
                    )

            });


            // =================================================
            // SUCCESS RESPONSE
            // =================================================

            return res.status(200).send(`

                <!DOCTYPE html>

                <html>

                <head>

                    <meta
                        charset="UTF-8"
                    />

                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    />

                    <title>
                        Google Authorization Successful
                    </title>

                    <style>

                        body {

                            margin: 0;

                            min-height: 100vh;

                            display: flex;

                            align-items: center;

                            justify-content: center;

                            font-family: Arial, sans-serif;

                            background: #f5f5f5;

                            color: #111;

                        }

                        .card {

                            width: min(
                                460px,
                                calc(100% - 40px)
                            );

                            padding: 30px;

                            border-radius: 18px;

                            background: white;

                            text-align: center;

                            box-shadow:
                                0 15px 50px
                                rgba(
                                    0,
                                    0,
                                    0,
                                    0.12
                                );

                        }

                        h1 {

                            margin:
                                0 0 12px;

                            font-size: 24px;

                        }

                        p {

                            margin: 0;

                            color: #666;

                            line-height: 1.6;

                            font-size: 14px;

                        }

                    </style>

                </head>

                <body>

                    <div class="card">

                        <h1>
                            Google Authorization Successful
                        </h1>

                        <p>
                            Google Drive authorization
                            was completed successfully.
                            You can close this window.
                        </p>

                    </div>

                </body>

                </html>

            `);


        } catch (error) {

            console.error(
                "Google OAuth Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Google authentication failed"

            });

        }

    }
);


export default router;