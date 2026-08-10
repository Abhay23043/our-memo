import { useState } from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    ArrowLeft,
    Mail,
    ShieldCheck,
    Lock
} from "lucide-react";

import api from "../services/api";


function ForgotPassword() {

    const navigate = useNavigate();


    // =====================================================
    // STEP
    // 1 = EMAIL
    // 2 = OTP
    // 3 = NEW PASSWORD
    // =====================================================

    const [step, setStep] =
        useState(1);


    const [email, setEmail] =
        useState("");


    const [otp, setOtp] =
        useState("");


    const [newPassword, setNewPassword] =
        useState("");


    const [confirmPassword, setConfirmPassword] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    const [error, setError] =
        useState("");


    const [success, setSuccess] =
        useState("");


    // =====================================================
    // SEND OTP
    // =====================================================

    const handleSendOTP = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        if (!email.trim()) {

            setError(
                "Please enter your email address."
            );

            return;

        }


        try {

            setLoading(true);


            const response =
                await api.post(
                    "/auth/forgot-password",
                    {
                        email:
                            email.trim()
                    }
                );


            if (
                response.data.success
            ) {

                setSuccess(
                    "If this email is registered, an OTP has been sent."
                );

                setStep(2);

            }


        } catch (error) {

            console.error(
                "SEND OTP ERROR:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Unable to send OTP. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // VERIFY OTP
    // =====================================================

    const handleVerifyOTP = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        if (
            !/^\d{6}$/.test(otp)
        ) {

            setError(
                "Please enter a valid 6 digit OTP."
            );

            return;

        }


        try {

            setLoading(true);


            const response =
                await api.post(
                    "/auth/verify-reset-otp",
                    {
                        email:
                            email.trim(),

                        otp:
                            otp
                    }
                );


            if (
                response.data.success
            ) {

                setSuccess(
                    "OTP verified successfully."
                );

                setStep(3);

            }


        } catch (error) {

            console.error(
                "VERIFY OTP ERROR:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Invalid or expired OTP."
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // RESET PASSWORD
    // =====================================================

    const handleResetPassword =
        async (event) => {

            event.preventDefault();

            setError("");
            setSuccess("");


            if (
                newPassword.length < 8 ||
                !/[A-Z]/.test(newPassword) ||
                !/[a-z]/.test(newPassword) ||
                !/[0-9]/.test(newPassword)
            ) {

                setError(
                    "Password must contain at least 8 characters, one uppercase, one lowercase and one number."
                );

                return;

            }


            if (
                newPassword !==
                confirmPassword
            ) {

                setError(
                    "Passwords do not match."
                );

                return;

            }


            try {

                setLoading(true);


                const response =
                    await api.post(
                        "/auth/reset-password",
                        {
                            email:
                                email.trim(),

                            newPassword:
                                newPassword,

                            confirmPassword:
                                confirmPassword
                        }
                    );


                if (
                    response.data.success
                ) {

                    setSuccess(
                        "Password reset successfully. Redirecting to login..."
                    );


                    setTimeout(() => {

                        navigate(
                            "/login",
                            {
                                replace: true
                            }
                        );

                    }, 1500);

                }


            } catch (error) {

                console.error(
                    "RESET PASSWORD ERROR:",
                    error
                );


                setError(
                    error.response?.data?.message ||
                    "Unable to reset password."
                );

            } finally {

                setLoading(false);

            }

        };


    // =====================================================
    // RESEND / CHANGE EMAIL
    // =====================================================

    const handleChangeEmail = () => {

        setStep(1);

        setOtp("");

        setError("");

        setSuccess("");

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <main className="login-page">

            <div className="login-card">

                {/* =========================================
                    BACK TO LOGIN
                ========================================= */}

                <Link
                    to="/login"
                    className="forgot-back-link"
                >

                    <ArrowLeft
                        size={16}
                    />

                    Back to login

                </Link>


                {/* =========================================
                    STEP 1
                ========================================= */}

                {step === 1 && (

                    <>

                        <div className="forgot-icon">

                            <Mail
                                size={24}
                            />

                        </div>


                        <h1>
                            Forgot password?
                        </h1>


                        <p className="forgot-description">
                            Enter your registered email
                            and we'll send you a
                            verification code.
                        </p>


                        {error && (

                            <div className="login-error">

                                {error}

                            </div>

                        )}


                        {success && (

                            <div className="login-success">

                                {success}

                            </div>

                        )}


                        <form
                            onSubmit={
                                handleSendOTP
                            }
                        >

                            <div className="input-group">

                                <label>
                                    Email
                                </label>


                                <div className="input-wrapper">

                                    <Mail
                                        size={18}
                                    />


                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                    />

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="login-button"
                                disabled={
                                    loading
                                }
                            >

                                {loading
                                    ? "Sending..."
                                    : "Send OTP"
                                }

                            </button>

                        </form>

                    </>

                )}


                {/* =========================================
                    STEP 2
                ========================================= */}

                {step === 2 && (

                    <>

                        <div className="forgot-icon">

                            <ShieldCheck
                                size={24}
                            />

                        </div>


                        <h1>
                            Verify OTP
                        </h1>


                        <p className="forgot-description">

                            Enter the 6 digit code
                            sent to

                            <br />

                            <strong>
                                {email}
                            </strong>

                        </p>


                        {error && (

                            <div className="login-error">

                                {error}

                            </div>

                        )}


                        {success && (

                            <div className="login-success">

                                {success}

                            </div>

                        )}


                        <form
                            onSubmit={
                                handleVerifyOTP
                            }
                        >

                            <div className="input-group">

                                <label>
                                    Verification code
                                </label>


                                <div className="input-wrapper">

                                    <ShieldCheck
                                        size={18}
                                    />


                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(event) =>
                                            setOtp(
                                                event.target.value.replace(
                                                    /\D/g,
                                                    ""
                                                )
                                            )
                                        }
                                        placeholder="000000"
                                        autoComplete="one-time-code"
                                        required
                                    />

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="login-button"
                                disabled={
                                    loading
                                }
                            >

                                {loading
                                    ? "Verifying..."
                                    : "Verify OTP"
                                }

                            </button>

                        </form>


                        <button
                            type="button"
                            className="forgot-secondary-button"
                            onClick={
                                handleChangeEmail
                            }
                        >
                            Change email
                        </button>

                    </>

                )}


                {/* =========================================
                    STEP 3
                ========================================= */}

                {step === 3 && (

                    <>

                        <div className="forgot-icon">

                            <Lock
                                size={24}
                            />

                        </div>


                        <h1>
                            Create new password
                        </h1>


                        <p className="forgot-description">
                            Your OTP has been verified.
                            Create a new password for
                            your account.
                        </p>


                        {error && (

                            <div className="login-error">

                                {error}

                            </div>

                        )}


                        {success && (

                            <div className="login-success">

                                {success}

                            </div>

                        )}


                        <form
                            onSubmit={
                                handleResetPassword
                            }
                        >

                            <div className="input-group">

                                <label>
                                    New password
                                </label>


                                <div className="input-wrapper">

                                    <Lock
                                        size={18}
                                    />


                                    <input
                                        type="password"
                                        value={
                                            newPassword
                                        }
                                        onChange={(event) =>
                                            setNewPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Minimum 8 characters"
                                        autoComplete="new-password"
                                        required
                                    />

                                </div>

                            </div>


                            <div className="input-group">

                                <label>
                                    Confirm password
                                </label>


                                <div className="input-wrapper">

                                    <Lock
                                        size={18}
                                    />


                                    <input
                                        type="password"
                                        value={
                                            confirmPassword
                                        }
                                        onChange={(event) =>
                                            setConfirmPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Repeat your password"
                                        autoComplete="new-password"
                                        required
                                    />

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="login-button"
                                disabled={
                                    loading
                                }
                            >

                                {loading
                                    ? "Updating..."
                                    : "Reset Password"
                                }

                            </button>

                        </form>

                    </>

                )}

            </div>

        </main>

    );

}


export default ForgotPassword;