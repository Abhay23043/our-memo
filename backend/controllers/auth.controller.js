import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../models/user.model.js";

import {
    sendOTPEmail
} from "../services/mail.service.js";


// =====================================================
// REGISTER
// SECRET KEY PROTECTED
// NO REGISTRATION OTP
// =====================================================

export const registerUser = async (
    req,
    res
) => {

    try {

        const {
            name,
            email,
            password,
            secretKey
        } = req.body;


        // =================================================
        // REQUIRED FIELDS
        // =================================================

        if (
            !name ||
            !email ||
            !password ||
            !secretKey
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, email, password and secret key are required"

            });

        }


        // =================================================
        // SECRET KEY CONFIGURATION
        // =================================================

        const configuredSecretKey =
            process.env.SIGNUP_SECRET_KEY;


        if (!configuredSecretKey) {

            console.error(
                "SIGNUP_SECRET_KEY is not configured"
            );


            return res.status(500).json({

                success: false,

                message:
                    "Registration is temporarily unavailable"

            });

        }


        // =================================================
        // SECRET KEY VALIDATION
        // =================================================

        if (
            secretKey.trim() !==
            configuredSecretKey.trim()
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Invalid secret key"

            });

        }


        // =================================================
        // NAME VALIDATION
        // =================================================

        const cleanName =
            name.trim();


        if (
            cleanName.length < 2
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name must contain at least 2 characters"

            });

        }


        if (
            cleanName.length > 100
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name cannot exceed 100 characters"

            });

        }


        // =================================================
        // EMAIL NORMALIZATION
        // =================================================

        const normalizedEmail =
            email
                .trim()
                .toLowerCase();


        // =================================================
        // EMAIL VALIDATION
        // =================================================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(
                normalizedEmail
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a valid email address"

            });

        }


        // =================================================
        // PASSWORD VALIDATION
        // =================================================

        if (
            password.length < 8
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least 8 characters"

            });

        }


        if (
            !/[A-Z]/.test(password)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least one uppercase letter"

            });

        }


        if (
            !/[a-z]/.test(password)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least one lowercase letter"

            });

        }


        if (
            !/[0-9]/.test(password)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least one number"

            });

        }


        // =================================================
        // CHECK EXISTING USER
        // =================================================

        const existingUser =
            await User.findOne({

                email:
                    normalizedEmail

            });


        if (existingUser) {

            return res.status(409).json({

                success: false,

                message:
                    "An account with this email already exists"

            });

        }


        // =================================================
        // HASH PASSWORD
        // =================================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );


        // =================================================
        // CREATE USER
        // =================================================

        const user =
            await User.create({

                name:
                    cleanName,

                email:
                    normalizedEmail,

                password:
                    hashedPassword,

                role:
                    "user"

            });


        // =================================================
        // CREATE SESSION
        // =================================================

        req.session.userId =
            user._id.toString();


        // =================================================
        // SUCCESS
        // =================================================

        return res.status(201).json({

            success: true,

            message:
                "Account created successfully",

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role

            }

        });


    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Registration failed"

        });

    }

};


// =====================================================
// LOGIN
// =====================================================

export const loginUser = async (
    req,
    res
) => {

    try {

        const {
            email,
            password
        } = req.body;


        // =================================================
        // REQUIRED FIELDS
        // =================================================

        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"

            });

        }


        // =================================================
        // NORMALIZE EMAIL
        // =================================================

        const normalizedEmail =
            email
                .trim()
                .toLowerCase();


        // =================================================
        // FIND USER
        // =================================================

        const user =
            await User.findOne({

                email:
                    normalizedEmail

            });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        // =================================================
        // CHECK PASSWORD
        // =================================================

        const passwordMatch =
            await bcrypt.compare(

                password,

                user.password

            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        // =================================================
        // CREATE SESSION
        // =================================================

        req.session.userId =
            user._id.toString();


        // =================================================
        // SUCCESS
        // =================================================

        return res.status(200).json({

            success: true,

            message:
                "Login successful",

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role

            }

        });


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Login failed"

        });

    }

};


// =====================================================
// LOGOUT
// =====================================================

export const logoutUser = (
    req,
    res
) => {

    req.session.destroy(
        (error) => {

            if (error) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Logout failed"

                });

            }


            res.clearCookie(
                "connect.sid"
            );


            return res.json({

                success: true,

                message:
                    "Logout successful"

            });

        }
    );

};


// =====================================================
// CURRENT USER
// =====================================================

export const getCurrentUser =
    async (
        req,
        res
    ) => {

        try {

            if (
                !req.session.userId
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Not authenticated"

                });

            }


            const user =
                await User.findById(

                    req.session.userId

                ).select(
                    "-password"
                );


            if (!user) {

                return res.status(401).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            return res.status(200).json({

                success: true,

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role

                }

            });


        } catch (error) {

            console.error(
                "CURRENT USER ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to get current user"

            });

        }

    };


// =====================================================
// UPDATE PROFILE
// ONLY NAME CAN BE CHANGED
// =====================================================

export const updateProfile =
    async (
        req,
        res
    ) => {

        try {

            if (
                !req.session.userId
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Authentication required"

                });

            }


            const {
                name,
                email
            } = req.body;


            // =================================================
            // EMAIL CANNOT BE CHANGED
            // =================================================

            if (
                email !== undefined
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email address cannot be changed"

                });

            }


            // =================================================
            // NAME VALIDATION
            // =================================================

            if (
                !name ||
                !name.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name is required"

                });

            }


            if (
                name.trim().length > 100
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name cannot exceed 100 characters"

                });

            }


            // =================================================
            // FIND USER
            // =================================================

            const user =
                await User.findById(
                    req.session.userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            // =================================================
            // UPDATE NAME
            // =================================================

            user.name =
                name.trim();


            await user.save();


            // =================================================
            // SUCCESS
            // =================================================

            return res.status(200).json({

                success: true,

                message:
                    "Profile updated successfully",

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role

                }

            });


        } catch (error) {

            console.error(
                "UPDATE PROFILE ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to update profile"

            });

        }

    };


// =====================================================
// CHANGE PASSWORD
// =====================================================

export const changePassword =
    async (
        req,
        res
    ) => {

        try {

            if (
                !req.session.userId
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Authentication required"

                });

            }


            const {
                currentPassword,
                newPassword,
                confirmPassword
            } = req.body;


            // =================================================
            // REQUIRED FIELDS
            // =================================================

            if (
                !currentPassword ||
                !newPassword ||
                !confirmPassword
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Current password, new password and confirmation are required"

                });

            }


            // =================================================
            // PASSWORD MATCH
            // =================================================

            if (
                newPassword !==
                confirmPassword
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "New passwords do not match"

                });

            }


            // =================================================
            // PASSWORD VALIDATION
            // =================================================

            if (
                newPassword.length < 8 ||
                !/[A-Z]/.test(newPassword) ||
                !/[a-z]/.test(newPassword) ||
                !/[0-9]/.test(newPassword)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Password must contain at least 8 characters, one uppercase, one lowercase and one number"

                });

            }


            // =================================================
            // FIND USER
            // =================================================

            const user =
                await User.findById(
                    req.session.userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            // =================================================
            // VERIFY CURRENT PASSWORD
            // =================================================

            const currentPasswordMatch =
                await bcrypt.compare(

                    currentPassword,

                    user.password

                );


            if (
                !currentPasswordMatch
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Current password is incorrect"

                });

            }


            // =================================================
            // PREVENT SAME PASSWORD
            // =================================================

            const samePassword =
                await bcrypt.compare(

                    newPassword,

                    user.password

                );


            if (
                samePassword
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "New password must be different from current password"

                });

            }


            // =================================================
            // HASH NEW PASSWORD
            // =================================================

            const hashedPassword =
                await bcrypt.hash(

                    newPassword,

                    12

                );


            user.password =
                hashedPassword;


            await user.save();


            // =================================================
            // SUCCESS
            // =================================================

            return res.status(200).json({

                success: true,

                message:
                    "Password changed successfully"

            });


        } catch (error) {

            console.error(
                "CHANGE PASSWORD ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to change password"

            });

        }

    };


// =====================================================
// FORGOT PASSWORD
// SEND OTP
// =====================================================

export const forgotPassword =
    async (
        req,
        res
    ) => {

        try {

            const {
                email
            } = req.body;


            // =================================================
            // EMAIL REQUIRED
            // =================================================

            if (
                !email
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email is required"

                });

            }


            // =================================================
            // NORMALIZE EMAIL
            // =================================================

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            // =================================================
            // FIND USER
            // =================================================

            const user =
                await User.findOne({

                    email:
                        normalizedEmail

                });


            // =================================================
            // SAME RESPONSE FOR SECURITY
            // =================================================

            if (!user) {

                return res.status(200).json({

                    success: true,

                    message:
                        "If an account exists with this email, an OTP has been sent."

                });

            }


            // =================================================
            // GENERATE 6 DIGIT OTP
            // =================================================

            const otp =
                crypto.randomInt(
                    100000,
                    1000000
                ).toString();


            // =================================================
            // OTP EXPIRY - 10 MINUTES
            // =================================================

            const otpExpires =
                new Date(

                    Date.now() +
                    10 * 60 * 1000

                );


            // =================================================
            // SAVE RESET OTP
            // =================================================

            user.resetOTP =
                otp;

            user.resetOTPExpires =
                otpExpires;

            user.resetVerified =
                false;


            await user.save();


            // =================================================
            // SEND RESET OTP EMAIL
            // =================================================

            await sendOTPEmail(

                user.email,

                otp,

                "password-reset"

            );


            // =================================================
            // SUCCESS
            // =================================================

            return res.status(200).json({

                success: true,

                message:
                    "If an account exists with this email, an OTP has been sent."

            });


        } catch (error) {

            console.error(
                "FORGOT PASSWORD ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to send password reset OTP"

            });

        }

    };


// =====================================================
// VERIFY PASSWORD RESET OTP
// =====================================================

export const verifyResetOTP =
    async (
        req,
        res
    ) => {

        try {

            const {
                email,
                otp
            } = req.body;


            // =================================================
            // REQUIRED FIELDS
            // =================================================

            if (
                !email ||
                !otp
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email and OTP are required"

                });

            }


            // =================================================
            // NORMALIZE EMAIL
            // =================================================

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            // =================================================
            // OTP FORMAT
            // =================================================

            if (
                !/^\d{6}$/.test(
                    otp.toString()
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "OTP must be 6 digits"

                });

            }


            // =================================================
            // FIND USER
            // =================================================

            const user =
                await User.findOne({

                    email:
                        normalizedEmail

                });


            if (!user) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid or expired OTP"

                });

            }


            // =================================================
            // CHECK OTP
            // =================================================

            if (
                user.resetOTP !==
                otp.toString()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid OTP"

                });

            }


            // =================================================
            // CHECK OTP EXPIRY
            // =================================================

            if (
                !user.resetOTPExpires ||
                user.resetOTPExpires <
                new Date()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "OTP has expired. Please request a new OTP."

                });

            }


            // =================================================
            // MARK OTP VERIFIED
            // =================================================

            user.resetVerified =
                true;


            await user.save();


            // =================================================
            // SUCCESS
            // =================================================

            return res.status(200).json({

                success: true,

                message:
                    "OTP verified successfully"

            });


        } catch (error) {

            console.error(
                "VERIFY OTP ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to verify OTP"

            });

        }

    };


// =====================================================
// RESET PASSWORD
// =====================================================

export const resetPassword =
    async (
        req,
        res
    ) => {

        try {

            const {
                email,
                newPassword,
                confirmPassword
            } = req.body;


            // =================================================
            // REQUIRED FIELDS
            // =================================================

            if (
                !email ||
                !newPassword ||
                !confirmPassword
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email, new password and confirmation are required"

                });

            }


            // =================================================
            // NORMALIZE EMAIL
            // =================================================

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            // =================================================
            // PASSWORD MATCH
            // =================================================

            if (
                newPassword !==
                confirmPassword
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Passwords do not match"

                });

            }


            // =================================================
            // PASSWORD VALIDATION
            // =================================================

            if (
                newPassword.length < 8 ||
                !/[A-Z]/.test(newPassword) ||
                !/[a-z]/.test(newPassword) ||
                !/[0-9]/.test(newPassword)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Password must contain at least 8 characters, one uppercase, one lowercase and one number"

                });

            }


            // =================================================
            // FIND USER
            // =================================================

            const user =
                await User.findOne({

                    email:
                        normalizedEmail

                });


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            // =================================================
            // OTP MUST BE VERIFIED
            // =================================================

            if (
                user.resetVerified !== true
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Please verify the OTP first"

                });

            }


            // =================================================
            // HASH NEW PASSWORD
            // =================================================

            const hashedPassword =
                await bcrypt.hash(

                    newPassword,

                    12

                );


            // =================================================
            // UPDATE PASSWORD
            // =================================================

            user.password =
                hashedPassword;


            // =================================================
            // CLEAR RESET DATA
            // =================================================

            user.resetOTP =
                null;

            user.resetOTPExpires =
                null;

            user.resetVerified =
                false;


            await user.save();


            // =================================================
            // SUCCESS
            // =================================================

            return res.status(200).json({

                success: true,

                message:
                    "Password reset successfully"

            });


        } catch (error) {

            console.error(
                "RESET PASSWORD ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to reset password"

            });

        }

    };