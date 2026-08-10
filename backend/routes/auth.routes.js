import express from "express";

import {
    registerUser,
    verifyRegistrationOTP,
    resendRegistrationOTP,

    loginUser,
    logoutUser,
    getCurrentUser,

    updateProfile,
    changePassword,

    forgotPassword,
    verifyResetOTP,
    resetPassword
} from "../controllers/auth.controller.js";

import {
    requireAuth
} from "../middleware/auth.middleware.js";

import {
    loginLimiter
} from "../middleware/rateLimit.middleware.js";


const router = express.Router();


// =====================================================
// REGISTER
// =====================================================

router.post(
    "/register",
    registerUser
);


// =====================================================
// VERIFY REGISTRATION OTP
// =====================================================

router.post(
    "/verify-registration-otp",
    verifyRegistrationOTP
);


// =====================================================
// RESEND REGISTRATION OTP
// =====================================================

router.post(
    "/resend-registration-otp",
    resendRegistrationOTP
);


// =====================================================
// LOGIN
// =====================================================

router.post(
    "/login",
    loginLimiter,
    loginUser
);


// =====================================================
// LOGOUT
// =====================================================

router.post(
    "/logout",
    logoutUser
);


// =====================================================
// CURRENT USER
// =====================================================

router.get(
    "/me",
    getCurrentUser
);


// =====================================================
// UPDATE PROFILE
// ONLY NAME
// =====================================================

router.patch(
    "/profile",
    requireAuth,
    updateProfile
);


// =====================================================
// CHANGE PASSWORD
// =====================================================

router.patch(
    "/password",
    requireAuth,
    changePassword
);


// =====================================================
// FORGOT PASSWORD
// SEND OTP
// =====================================================

router.post(
    "/forgot-password",
    forgotPassword
);


// =====================================================
// VERIFY PASSWORD RESET OTP
// =====================================================

router.post(
    "/verify-reset-otp",
    verifyResetOTP
);


// =====================================================
// RESET PASSWORD
// =====================================================

router.post(
    "/reset-password",
    resetPassword
);


export default router;