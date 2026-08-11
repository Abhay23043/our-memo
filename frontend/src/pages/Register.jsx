import {
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Heart,
    UserPlus,
    CheckCircle,
    KeyRound
} from "lucide-react";

import api from "../services/api";


function Register() {

    const navigate =
        useNavigate();


    // =================================================
    // FORM STATES
    // =================================================

    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [secretKey, setSecretKey] =
        useState("");


    // =================================================
    // PASSWORD / SECRET KEY VISIBILITY
    // =================================================

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [showSecretKey, setShowSecretKey] =
        useState(false);


    // =================================================
    // UI STATES
    // =================================================

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =================================================
    // PASSWORD RULES
    // =================================================

    const passwordRules = {

        length:
            password.length >= 8,

        uppercase:
            /[A-Z]/.test(password),

        lowercase:
            /[a-z]/.test(password),

        number:
            /[0-9]/.test(password)

    };


    // =================================================
    // REGISTER
    // =================================================

    const handleRegister =
        async (event) => {

            event.preventDefault();


            setError("");

            setSuccess("");


            // =================================================
            // REQUIRED FIELDS
            // =================================================

            if (
                !name.trim() ||
                !email.trim() ||
                !password ||
                !confirmPassword ||
                !secretKey.trim()
            ) {

                setError(
                    "Please fill in all fields, including the secret key."
                );

                return;

            }


            // =================================================
            // NAME VALIDATION
            // =================================================

            const cleanName =
                name.trim();


            if (
                cleanName.length < 2
            ) {

                setError(
                    "Name must contain at least 2 characters."
                );

                return;

            }


            if (
                cleanName.length > 100
            ) {

                setError(
                    "Name cannot exceed 100 characters."
                );

                return;

            }


            // =================================================
            // EMAIL VALIDATION
            // =================================================

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    normalizedEmail
                )
            ) {

                setError(
                    "Please enter a valid email address."
                );

                return;

            }


            // =================================================
            // PASSWORD VALIDATION
            // =================================================

            if (
                !passwordRules.length ||
                !passwordRules.uppercase ||
                !passwordRules.lowercase ||
                !passwordRules.number
            ) {

                setError(
                    "Password must contain at least 8 characters, one uppercase, one lowercase and one number."
                );

                return;

            }


            // =================================================
            // CONFIRM PASSWORD
            // =================================================

            if (
                password !==
                confirmPassword
            ) {

                setError(
                    "Passwords do not match."
                );

                return;

            }


            // =================================================
            // REGISTER REQUEST
            // =================================================

            try {

                setLoading(true);


                const response =
                    await api.post(

                        "/auth/register",

                        {
                            name:
                                cleanName,

                            email:
                                normalizedEmail,

                            password,

                            secretKey:
                                secretKey.trim()

                        }

                    );


                // =================================================
                // SUCCESS
                // =================================================

                if (
                    response.data.success
                ) {

                    setSuccess(
                        "Account created successfully! Redirecting to login..."
                    );


                    // Clear sensitive fields

                    setPassword("");

                    setConfirmPassword("");

                    setSecretKey("");


                    // Redirect to login

                    setTimeout(() => {

                        navigate(
                            "/login",
                            {
                                replace: true
                            }
                        );

                    }, 1000);


                } else {

                    setError(

                        response.data.message ||

                        "Unable to create account."

                    );

                }


            } catch (error) {

                console.error(
                    "REGISTER ERROR:",
                    error
                );


                setError(

                    error.response?.data?.message ||

                    "Unable to create account. Please try again."

                );

            } finally {

                setLoading(false);

            }

        };


    // =================================================
    // UI
    // =================================================

    return (

        <main className="register-page">

            <div className="register-card">


                {/* =================================================
                    LOGO
                ================================================= */}

                <div className="register-logo">

                    <div className="register-logo-icon">

                        <Heart
                            size={20}
                            fill="currentColor"
                        />

                    </div>


                    <span>
                        Our Memo
                    </span>

                </div>


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="register-header">

                    <h1>
                        Create your account
                    </h1>


                    <p>
                        Start saving your memories
                        in one place.
                    </p>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="register-error">

                        {error}

                    </div>

                )}


                {/* =================================================
                    SUCCESS
                ================================================= */}

                {success && (

                    <div className="register-success">

                        <CheckCircle
                            size={17}
                        />

                        {success}

                    </div>

                )}


                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    className="register-form"
                    onSubmit={
                        handleRegister
                    }
                >


                    {/* =================================================
                        NAME
                    ================================================= */}

                    <div className="register-field">

                        <label>
                            Full Name
                        </label>


                        <div className="register-input-wrapper">

                            <User
                                size={17}
                            />


                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={
                                    name
                                }
                                onChange={
                                    event =>
                                        setName(
                                            event.target.value
                                        )
                                }
                                maxLength={100}
                                autoComplete="name"
                                disabled={
                                    loading
                                }
                            />

                        </div>

                    </div>


                    {/* =================================================
                        EMAIL
                    ================================================= */}

                    <div className="register-field">

                        <label>
                            Email Address
                        </label>


                        <div className="register-input-wrapper">

                            <Mail
                                size={17}
                            />


                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={
                                    email
                                }
                                onChange={
                                    event =>
                                        setEmail(
                                            event.target.value
                                        )
                                }
                                autoComplete="email"
                                disabled={
                                    loading
                                }
                            />

                        </div>

                    </div>


                    {/* =================================================
                        PASSWORD
                    ================================================= */}

                    <div className="register-field">

                        <label>
                            Password
                        </label>


                        <div className="register-input-wrapper">

                            <Lock
                                size={17}
                            />


                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Create a password"
                                value={
                                    password
                                }
                                onChange={
                                    event =>
                                        setPassword(
                                            event.target.value
                                        )
                                }
                                autoComplete="new-password"
                                disabled={
                                    loading
                                }
                            />


                            <button
                                type="button"
                                className="register-eye-button"
                                onClick={() =>
                                    setShowPassword(
                                        current =>
                                            !current
                                    )
                                }
                                disabled={
                                    loading
                                }
                            >

                                {showPassword ? (

                                    <EyeOff
                                        size={17}
                                    />

                                ) : (

                                    <Eye
                                        size={17}
                                    />

                                )}

                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        PASSWORD RULES
                    ================================================= */}

                    {password && (

                        <div className="register-password-rules">

                            <PasswordRule
                                valid={
                                    passwordRules.length
                                }
                                text="At least 8 characters"
                            />


                            <PasswordRule
                                valid={
                                    passwordRules.uppercase
                                }
                                text="One uppercase letter"
                            />


                            <PasswordRule
                                valid={
                                    passwordRules.lowercase
                                }
                                text="One lowercase letter"
                            />


                            <PasswordRule
                                valid={
                                    passwordRules.number
                                }
                                text="One number"
                            />

                        </div>

                    )}


                    {/* =================================================
                        CONFIRM PASSWORD
                    ================================================= */}

                    <div className="register-field">

                        <label>
                            Confirm Password
                        </label>


                        <div className="register-input-wrapper">

                            <Lock
                                size={17}
                            />


                            <input
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Confirm your password"
                                value={
                                    confirmPassword
                                }
                                onChange={
                                    event =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                }
                                autoComplete="new-password"
                                disabled={
                                    loading
                                }
                            />


                            <button
                                type="button"
                                className="register-eye-button"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        current =>
                                            !current
                                    )
                                }
                                disabled={
                                    loading
                                }
                            >

                                {showConfirmPassword ? (

                                    <EyeOff
                                        size={17}
                                    />

                                ) : (

                                    <Eye
                                        size={17}
                                    />

                                )}

                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        PASSWORD MATCH
                    ================================================= */}

                    {confirmPassword && (

                        <div
                            className={
                                password ===
                                confirmPassword
                                    ? "register-match success"
                                    : "register-match"
                            }
                        >

                            {password ===
                            confirmPassword

                                ? "Passwords match"

                                : "Passwords do not match"

                            }

                        </div>

                    )}


                    {/* =================================================
                        SECRET KEY
                    ================================================= */}

                    <div className="register-field">

                        <label>
                            Secret Key
                        </label>


                        <div className="register-input-wrapper">

                            <KeyRound
                                size={17}
                            />


                            <input
                                type={
                                    showSecretKey
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter secret key"
                                value={
                                    secretKey
                                }
                                onChange={
                                    event =>
                                        setSecretKey(
                                            event.target.value
                                        )
                                }
                                autoComplete="off"
                                disabled={
                                    loading
                                }
                            />


                            <button
                                type="button"
                                className="register-eye-button"
                                onClick={() =>
                                    setShowSecretKey(
                                        current =>
                                            !current
                                    )
                                }
                                disabled={
                                    loading
                                }
                            >

                                {showSecretKey ? (

                                    <EyeOff
                                        size={17}
                                    />

                                ) : (

                                    <Eye
                                        size={17}
                                    />

                                )}

                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        SUBMIT
                    ================================================= */}

                    <button
                        type="submit"
                        className="register-submit"
                        disabled={
                            loading
                        }
                    >

                        <UserPlus
                            size={17}
                        />


                        {loading

                            ? "Creating account..."

                            : "Create account"

                        }

                    </button>

                </form>


                {/* =================================================
                    LOGIN
                ================================================= */}

                <div className="register-login">

                    Already have an account?

                    <Link
                        to="/login"
                    >
                        Login
                    </Link>

                </div>


            </div>

        </main>

    );

}


// =====================================================
// PASSWORD RULE
// =====================================================

function PasswordRule({
    valid,
    text
}) {

    return (

        <div
            className={
                valid
                    ? "register-password-rule valid"
                    : "register-password-rule"
            }
        >

            <span>

                {valid
                    ? "✓"
                    : "○"
                }

            </span>


            {text}

        </div>

    );

}


export default Register;