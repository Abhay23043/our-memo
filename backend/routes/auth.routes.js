import express from "express";

import {
    registerUser,

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


const router =
    express.Router();


// =====================================================
// REGISTER
// SECRET KEY PROTECTED
// =====================================================

router.post(
    "/register",
    registerUser
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


// =====================================================
// EXPORT
// =====================================================

export default router;