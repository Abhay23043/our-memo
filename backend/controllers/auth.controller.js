import bcrypt from "bcryptjs";
import crypto from "crypto";

import RegistrationOTP from "../models/registrationOtp.model.js";
import User from "../models/user.model.js";

import {
    sendOTPEmail
} from "../services/mail.service.js";


// =====================================================
// REGISTER
// SEND REGISTRATION OTP
// =====================================================

export const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // ---------------------------------------------
        // REQUIRED FIELDS
        // ---------------------------------------------

        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, email and password are required"

            });

        }


        // ---------------------------------------------
        // PASSWORD VALIDATION
        // ---------------------------------------------

        if (
            password.length < 8 ||
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least 8 characters, one uppercase, one lowercase and one number"

            });

        }


        // ---------------------------------------------
        // NORMALIZE EMAIL
        // ---------------------------------------------

        const normalizedEmail =
            email
                .trim()
                .toLowerCase();


        // ---------------------------------------------
        // CHECK EXISTING USER
        // ---------------------------------------------

        const existingUser =
            await User.findOne({

                email:
                    normalizedEmail

            });


        if (existingUser) {

            return res.status(409).json({

                success: false,

                message:
                    "User already exists"

            });

        }


        // ---------------------------------------------
        // GENERATE 6 DIGIT OTP
        // ---------------------------------------------

        const otp =
            crypto
                .randomInt(
                    100000,
                    1000000
                )
                .toString();


        // ---------------------------------------------
        // OTP EXPIRES AFTER 10 MINUTES
        // ---------------------------------------------

        const expiresAt =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        // ---------------------------------------------
        // HASH PASSWORD
        // ---------------------------------------------

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );


        // ---------------------------------------------
        // DELETE OLD REGISTRATION OTP
        // ---------------------------------------------

        await RegistrationOTP.deleteMany({

            email:
                normalizedEmail

        });


        // ---------------------------------------------
        // SAVE REGISTRATION DATA
        // ---------------------------------------------

        await RegistrationOTP.create({

            name:
                name.trim(),

            email:
                normalizedEmail,

            password:
                hashedPassword,

            otp:
                otp,

            expiresAt:
                expiresAt

        });


        // ---------------------------------------------
        // SEND REGISTRATION OTP
        // ---------------------------------------------

        try {

            await sendOTPEmail(
                normalizedEmail,
                otp,
                "registration"
            );

        } catch (emailError) {

            console.error(
                "REGISTRATION EMAIL ERROR:",
                emailError
            );


            // Email failed, remove temporary data

            await RegistrationOTP.deleteMany({

                email:
                    normalizedEmail

            });


            return res.status(500).json({

                success: false,

                message:
                    "Unable to send verification email"

            });

        }


        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Verification OTP has been sent to your email",

            email:
                normalizedEmail

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
// VERIFY REGISTRATION OTP
// CREATE USER AFTER OTP VERIFICATION
// =====================================================

export const verifyRegistrationOTP =
    async (req, res) => {

        try {

            const {
                email,
                otp
            } = req.body;


            // -----------------------------------------
            // REQUIRED FIELDS
            // -----------------------------------------

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


            // -----------------------------------------
            // NORMALIZE EMAIL
            // -----------------------------------------

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            // -----------------------------------------
            // OTP FORMAT
            // -----------------------------------------

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


            // -----------------------------------------
            // FIND REGISTRATION OTP
            // -----------------------------------------

            const registrationOTP =
                await RegistrationOTP.findOne({

                    email:
                        normalizedEmail

                });


            if (!registrationOTP) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Registration OTP not found. Please register again."

                });

            }


            // -----------------------------------------
            // CHECK EXPIRY
            // -----------------------------------------

            if (
                !registrationOTP.expiresAt ||
                registrationOTP.expiresAt < new Date()
            ) {

                await RegistrationOTP.deleteOne({

                    _id:
                        registrationOTP._id

                });


                return res.status(400).json({

                    success: false,

                    message:
                        "OTP has expired. Please request a new OTP."

                });

            }


            // -----------------------------------------
            // CHECK OTP
            // -----------------------------------------

            if (
                registrationOTP.otp !==
                otp.toString()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid OTP"

                });

            }


            // -----------------------------------------
            // CHECK USER AGAIN
            // -----------------------------------------

            const existingUser =
                await User.findOne({

                    email:
                        normalizedEmail

                });


            if (existingUser) {

                await RegistrationOTP.deleteOne({

                    _id:
                        registrationOTP._id

                });


                return res.status(409).json({

                    success: false,

                    message:
                        "User already exists"

                });

            }


            // -----------------------------------------
            // CREATE USER
            // -----------------------------------------

            const user =
                await User.create({

                    name:
                        registrationOTP.name,

                    email:
                        registrationOTP.email,

                    password:
                        registrationOTP.password,

                    role:
                        "user"

                });
                // ---------------------------------------------
                // CREATE LOGIN SESSION
                // ---------------------------------------------

                req.session.userId = user._id.toString();

            // -----------------------------------------
            // DELETE USED OTP
            // -----------------------------------------

            await RegistrationOTP.deleteOne({

                _id:
                    registrationOTP._id

            });


            // -----------------------------------------
            // SUCCESS
            // -----------------------------------------

            return res.status(201).json({

                success: true,

                message:
                    "Email verified and account created successfully",

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
                "VERIFY REGISTRATION OTP ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to verify registration OTP"

            });

        }

    };


// =====================================================
// RESEND REGISTRATION OTP
// =====================================================

export const resendRegistrationOTP =
    async (req, res) => {

        try {

            const {
                email
            } = req.body;


            // -----------------------------------------
            // EMAIL REQUIRED
            // -----------------------------------------

            if (!email) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email is required"

                });

            }


            // -----------------------------------------
            // NORMALIZE EMAIL
            // -----------------------------------------

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            // -----------------------------------------
            // CHECK IF USER ALREADY EXISTS
            // -----------------------------------------

            const existingUser =
                await User.findOne({

                    email:
                        normalizedEmail

                });


            if (existingUser) {

                return res.status(409).json({

                    success: false,

                    message:
                        "User already exists"

                });

            }


            // -----------------------------------------
            // FIND PENDING REGISTRATION
            // -----------------------------------------

            const registrationOTP =
                await RegistrationOTP.findOne({

                    email:
                        normalizedEmail

                });


            if (!registrationOTP) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Registration request not found. Please register again."

                });

            }


            // -----------------------------------------
            // GENERATE NEW OTP
            // -----------------------------------------

            const otp =
                crypto
                    .randomInt(
                        100000,
                        1000000
                    )
                    .toString();


            // -----------------------------------------
            // NEW EXPIRY
            // -----------------------------------------

            const expiresAt =
                new Date(
                    Date.now() +
                    10 * 60 * 1000
                );


            // -----------------------------------------
            // UPDATE OTP
            // -----------------------------------------

            registrationOTP.otp =
                otp;

            registrationOTP.expiresAt =
                expiresAt;


            await registrationOTP.save();


            // -----------------------------------------
            // SEND NEW OTP
            // -----------------------------------------

            try {

                await sendOTPEmail(
                    normalizedEmail,
                    otp,
                    "registration"
                );

            } catch (emailError) {

                console.error(
                    "RESEND EMAIL ERROR:",
                    emailError
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to send new OTP"

                });

            }


            // -----------------------------------------
            // SUCCESS
            // -----------------------------------------

            return res.status(200).json({

                success: true,

                message:
                    "A new OTP has been sent to your email"

            });


        } catch (error) {

            console.error(
                "RESEND REGISTRATION OTP ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to resend registration OTP"

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


        // ---------------------------------------------
        // REQUIRED
        // ---------------------------------------------

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


        // ---------------------------------------------
        // NORMALIZE EMAIL
        // ---------------------------------------------

        const normalizedEmail =
            email
                .trim()
                .toLowerCase();


        // ---------------------------------------------
        // FIND USER
        // ---------------------------------------------

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


        // ---------------------------------------------
        // CHECK PASSWORD
        // ---------------------------------------------

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


        // ---------------------------------------------
        // CREATE SESSION
        // ---------------------------------------------

        req.session.userId =
            user._id.toString();


        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

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
// EMAIL IS INTENTIONALLY NOT ACCEPTED
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


            // -----------------------------------------
            // EMAIL CAN NEVER BE CHANGED
            // -----------------------------------------

            if (
                email !== undefined
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email address cannot be changed"

                });

            }


            // -----------------------------------------
            // NAME VALIDATION
            // -----------------------------------------

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


            // -----------------------------------------
            // FIND USER
            // -----------------------------------------

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


            // -----------------------------------------
            // ONLY NAME IS UPDATED
            // -----------------------------------------

            user.name =
                name.trim();


            await user.save();


            // -----------------------------------------
            // SUCCESS
            // -----------------------------------------

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


            // -----------------------------------------
            // REQUIRED
            // -----------------------------------------

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


            // -----------------------------------------
            // CONFIRM PASSWORD
            // -----------------------------------------

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


            // -----------------------------------------
            // PASSWORD VALIDATION
            // -----------------------------------------

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


            // -----------------------------------------
            // FIND USER
            // -----------------------------------------

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


            // -----------------------------------------
            // VERIFY CURRENT PASSWORD
            // -----------------------------------------

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


            // -----------------------------------------
            // PREVENT SAME PASSWORD
            // -----------------------------------------

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


            // -----------------------------------------
            // HASH NEW PASSWORD
            // -----------------------------------------

            const hashedPassword =
                await bcrypt.hash(

                    newPassword,

                    12

                );


            user.password =
                hashedPassword;


            await user.save();


            // -----------------------------------------
            // SUCCESS
            // -----------------------------------------

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


            // -----------------------------------------
            // EMAIL REQUIRED
            // -----------------------------------------

            if (
                !email
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email is required"

                });

            }


            // -----------------------------------------
            // NORMALIZE EMAIL
            // -----------------------------------------

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            // -----------------------------------------
            // FIND USER
            // -----------------------------------------

            const user =
                await User.findOne({

                    email:
                        normalizedEmail

                });


            /*
             * Security:
             *
             * We intentionally return the same
             * response even when the email doesn't
             * exist.
             */

            if (!user) {

                return res.status(200).json({

                    success: true,

                    message:
                        "If an account exists with this email, an OTP has been sent."

                });

            }


            // -----------------------------------------
            // GENERATE 6 DIGIT OTP
            // -----------------------------------------

            const otp =
                crypto.randomInt(
                    100000,
                    1000000
                ).toString();


            // -----------------------------------------
            // OTP EXPIRES AFTER 10 MINUTES
            // -----------------------------------------

            const otpExpires =
                new Date(

                    Date.now() +
                    10 * 60 * 1000

                );


            // -----------------------------------------
            // SAVE OTP
            // -----------------------------------------

            user.resetOTP =
                otp;

            user.resetOTPExpires =
                otpExpires;

            user.resetVerified =
                false;


            await user.save();


            // -----------------------------------------
            // SEND OTP EMAIL
            // -----------------------------------------

            await sendOTPEmail(

                user.email,

                otp

            );


            // -----------------------------------------
            // SUCCESS
            // -----------------------------------------

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

export const verifyResetOTP = async (
    req,
    res
) => {

    try {

        const {
            email,
            otp
        } = req.body;


        // ---------------------------------------------
        // REQUIRED FIELDS
        // ---------------------------------------------

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


        // ---------------------------------------------
        // NORMALIZE EMAIL
        // ---------------------------------------------

        const normalizedEmail =
            email
                .trim()
                .toLowerCase();


        // ---------------------------------------------
        // VALIDATE OTP FORMAT
        // ---------------------------------------------

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


        // ---------------------------------------------
        // FIND USER
        // ---------------------------------------------

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


        // ---------------------------------------------
        // CHECK OTP
        // ---------------------------------------------

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


        // ---------------------------------------------
        // CHECK OTP EXPIRY
        // ---------------------------------------------

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


        // ---------------------------------------------
        // OTP VERIFIED
        // ---------------------------------------------

        user.resetVerified =
            true;


        await user.save();


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

export const resetPassword = async (
    req,
    res
) => {

    try {

        const {
            email,
            newPassword,
            confirmPassword
        } = req.body;


        // ---------------------------------------------
        // REQUIRED FIELDS
        // ---------------------------------------------

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


        // ---------------------------------------------
        // NORMALIZE EMAIL
        // ---------------------------------------------

        const normalizedEmail =
            email
                .trim()
                .toLowerCase();


        // ---------------------------------------------
        // CHECK PASSWORD MATCH
        // ---------------------------------------------

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


        // ---------------------------------------------
        // PASSWORD VALIDATION
        // ---------------------------------------------

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


        // ---------------------------------------------
        // FIND USER
        // ---------------------------------------------

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


        // ---------------------------------------------
        // OTP MUST BE VERIFIED
        // ---------------------------------------------

        if (
            user.resetVerified !== true
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Please verify the OTP first"

            });

        }


        // ---------------------------------------------
        // HASH NEW PASSWORD
        // ---------------------------------------------

        const hashedPassword =
            await bcrypt.hash(

                newPassword,

                12

            );


        // ---------------------------------------------
        // UPDATE PASSWORD
        // ---------------------------------------------

        user.password =
            hashedPassword;


        // ---------------------------------------------
        // CLEAR OTP DATA
        // ---------------------------------------------

        user.resetOTP =
            null;

        user.resetOTPExpires =
            null;

        user.resetVerified =
            false;


        await user.save();


        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

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