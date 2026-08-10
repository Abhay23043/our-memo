import { useState } from "react";

import {
    Lock,
    Mail,
    Heart,
    Eye,
    EyeOff
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

import { useAuth } from "../context/AuthContext";

import {
    Link
} from "react-router-dom";

function Login() {

    const navigate = useNavigate();

    const { setUser } = useAuth();


    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        setLoading(true);


        try {

            const response = await api.post(
                "/auth/login",
                {
                    email,
                    password
                }
            );


            if (response.data.success) {

                setUser(
                    response.data.user
                );

                navigate("/");

            } else {

                setError(
                    response.data.message ||
                    "Login failed"
                );

            }

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Unable to login. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <main className="login-page">

            <div className="login-card">

                {/* Logo */}

                <div className="login-logo">

                    <div className="login-logo-icon">

                        <Heart
                            size={22}
                            fill="currentColor"
                        />

                    </div>

                </div>


                <h1>
                    Welcome back
                </h1>

                <p className="login-subtitle">
                    Your memories are waiting for you.
                </p>


                {/* Error */}

                {error && (

                    <div className="login-error">
                        {error}
                    </div>

                )}


                <form
                    onSubmit={handleSubmit}
                    className="login-form"
                >

                    {/* Email */}

                    <div className="input-group">

                        <label>
                            Email
                        </label>

                        <div className="input-wrapper">

                            <Mail size={18} />

                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                required
                            />

                        </div>

                    </div>


                    {/* Password */}

                    <div className="input-group">

                        <label>
                            Password
                        </label>

                        <div className="input-wrapper">

                            <Lock size={18} />

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                required
                            />
                            <Link
                                to="/forgot-password"
                                className="forgot-password-link"
                            >
                                Forgot password?
                            </Link>

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >

                                {showPassword
                                    ? <EyeOff size={18} />
                                    : <Eye size={18} />
                                }

                            </button>

                        </div>

                    </div>


                    {/* Login button */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Signing in..."
                            : "Sign in"
                        }

                    </button>

                </form>


                <p className="login-footer">
                    Our memories, just for us. ❤️
                </p>

            </div>

        </main>
    );
}

export default Login;