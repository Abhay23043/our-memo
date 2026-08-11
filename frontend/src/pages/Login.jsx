import { useState } from "react";

import {
    Lock,
    Mail,
    Heart,
    Eye,
    EyeOff
} from "lucide-react";

import {
    useNavigate,
    Link
} from "react-router-dom";

import api from "../services/api";

import {
    useAuth
} from "../context/AuthContext";


function Login() {

    const navigate =
        useNavigate();


    const {
        setUser
    } = useAuth();


    // =================================================
    // FORM STATES
    // =================================================

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");


    // =================================================
    // PASSWORD VISIBILITY
    // =================================================

    const [showPassword, setShowPassword] =
        useState(false);


    // =================================================
    // UI STATES
    // =================================================

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    // =================================================
    // LOGIN
    // =================================================

    const handleSubmit =
        async (event) => {

            event.preventDefault();


            setError("");

            setLoading(true);


            try {

                // =========================================
                // LOGIN REQUEST
                // =========================================

                const response =
                    await api.post(
                        "/auth/login",
                        {
                            email:
                                email
                                    .trim()
                                    .toLowerCase(),

                            password
                        }
                    );


                // =========================================
                // LOGIN SUCCESS
                // =========================================

                if (
                    response.data.success
                ) {

                    const loggedInUser =
                        response.data.user;


                    // =====================================
                    // SAVE USER IN AUTH CONTEXT
                    // =====================================

                    setUser(
                        loggedInUser
                    );


                    // =====================================
                    // ROLE BASED REDIRECT
                    // =====================================

                    if (
                        loggedInUser?.role ===
                        "admin"
                    ) {

                        // ADMIN
                        // → DASHBOARD

                        navigate(
                            "/dashboard",
                            {
                                replace: true
                            }
                        );

                    } else {

                        // NORMAL USER
                        // → PUBLIC LANDING PAGE

                        navigate(
                            "/",
                            {
                                replace: true
                            }
                        );

                    }


                } else {

                    setError(
                        response.data.message ||
                        "Login failed"
                    );

                }


            } catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                setError(

                    error.response?.data?.message ||

                    "Unable to login. Please try again."

                );

            } finally {

                setLoading(false);

            }

        };


    // =================================================
    // UI
    // =================================================

    return (

        <main className="login-page">

            <div className="login-card">


                {/* =========================================
                    LOGO
                ========================================= */}

                <div className="login-logo">

                    <div className="login-logo-icon">

                        <Heart
                            size={22}
                            fill="currentColor"
                        />

                    </div>

                </div>


                {/* =========================================
                    HEADING
                ========================================= */}

                <h1>
                    Welcome back
                </h1>


                <p className="login-subtitle">
                    Your memories are waiting for you.
                </p>


                {/* =========================================
                    ERROR
                ========================================= */}

                {error && (

                    <div className="login-error">

                        {error}

                    </div>

                )}


                {/* =========================================
                    LOGIN FORM
                ========================================= */}

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="login-form"
                >


                    {/* =====================================
                        EMAIL
                    ===================================== */}

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
                                placeholder="you@example.com"
                                value={
                                    email
                                }
                                onChange={
                                    (event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                }
                                autoComplete="email"
                                disabled={
                                    loading
                                }
                                required
                            />

                        </div>

                    </div>


                    {/* =====================================
                        PASSWORD
                    ===================================== */}

                    <div className="input-group">

                        <label>
                            Password
                        </label>


                        <div className="input-wrapper">

                            <Lock
                                size={18}
                            />


                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter your password"
                                value={
                                    password
                                }
                                onChange={
                                    (event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                }
                                autoComplete="current-password"
                                disabled={
                                    loading
                                }
                                required
                            />


                            {/* =================================
                                FORGOT PASSWORD
                            ================================= */}

                            <Link
                                to="/forgot-password"
                                className="forgot-password-link"
                            >
                                Forgot password?
                            </Link>


                            {/* =================================
                                PASSWORD VISIBILITY
                            ================================= */}

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        current =>
                                            !current
                                    )
                                }
                                disabled={
                                    loading
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >

                                {showPassword ? (

                                    <EyeOff
                                        size={18}
                                    />

                                ) : (

                                    <Eye
                                        size={18}
                                    />

                                )}

                            </button>

                        </div>

                    </div>


                    {/* =====================================
                        LOGIN BUTTON
                    ===================================== */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={
                            loading
                        }
                    >

                        {loading

                            ? "Signing in..."

                            : "Sign in"

                        }

                    </button>

                </form>


                {/* =========================================
                    REGISTER LINK
                ========================================= */}

                <p className="login-register">

                    Don't have an account?{" "}


                    <Link
                        to="/register"
                        className="register-link"
                    >
                        Create account
                    </Link>

                </p>


                {/* =========================================
                    FOOTER
                ========================================= */}

                <p className="login-footer">
                    Our memories, just for us. ❤️
                </p>


            </div>

        </main>

    );

}


export default Login;