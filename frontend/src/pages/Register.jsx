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
    ShieldCheck,
    ArrowLeft
} from "lucide-react";

import api from "../services/api";


function Register() {

    const navigate =
        useNavigate();


    // =================================================
    // STEP
    // 1 = REGISTRATION FORM
    // 2 = OTP VERIFICATION
    // =================================================

    const [step, setStep] =
        useState(1);


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


    // =================================================
    // OTP
    // =================================================

    const [otp, setOtp] =
        useState("");


    // =================================================
    // PASSWORD VISIBILITY
    // =================================================

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);


    // =================================================
    // UI STATES
    // =================================================

    const [loading, setLoading] =
        useState(false);

    const [resendLoading, setResendLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =================================================
    // OTP RESEND TIMER
    // =================================================

    const [resendTimer, setResendTimer] =
        useState(0);


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
    // START RESEND TIMER
    // =================================================

    const startResendTimer = () => {

        setResendTimer(60);

        const timer =
            setInterval(() => {

                setResendTimer(
                    current => {

                        if (
                            current <= 1
                        ) {

                            clearInterval(
                                timer
                            );

                            return 0;

                        }

                        return current - 1;

                    }
                );

            }, 1000);

    };


    // =================================================
    // REGISTER
    // SEND OTP
    // =================================================

    const handleRegister =
        async (event) => {

            event.preventDefault();


            setError("");

            setSuccess("");


            // -----------------------------------------
            // REQUIRED
            // -----------------------------------------

            if (
                !name.trim() ||
                !email.trim() ||
                !password ||
                !confirmPassword
            ) {

                setError(
                    "Please fill in all fields."
                );

                return;

            }


            // -----------------------------------------
            // NAME
            // -----------------------------------------

            if (
                name.trim().length < 2
            ) {

                setError(
                    "Name must contain at least 2 characters."
                );

                return;

            }


            // -----------------------------------------
            // EMAIL
            // -----------------------------------------

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    email.trim()
                )
            ) {

                setError(
                    "Please enter a valid email address."
                );

                return;

            }


            // -----------------------------------------
            // PASSWORD
            // -----------------------------------------

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


            // -----------------------------------------
            // CONFIRM PASSWORD
            // -----------------------------------------

            if (
                password !==
                confirmPassword
            ) {

                setError(
                    "Passwords do not match."
                );

                return;

            }


            try {

                setLoading(true);


                const normalizedEmail =
                    email
                        .trim()
                        .toLowerCase();


                // -------------------------------------
                // SEND REGISTRATION OTP
                // -------------------------------------

                const response =
                    await api.post(

                        "/auth/register",

                        {
                            name:
                                name.trim(),

                            email:
                                normalizedEmail,

                            password
                        }

                    );


                if (
                    response.data.success
                ) {

                    setEmail(
                        normalizedEmail
                    );


                    setStep(2);


                    setSuccess(
                        "Verification OTP has been sent to your email."
                    );


                    startResendTimer();

                } else {

                    setError(
                        response.data.message ||
                        "Unable to send verification OTP."
                    );

                }


            } catch (error) {

                console.error(
                    "REGISTER ERROR:",
                    error
                );


                setError(

                    error.response?.data?.message ||

                    "Unable to create registration request. Please try again."

                );

            } finally {

                setLoading(false);

            }

        };


    // =================================================
    // VERIFY REGISTRATION OTP
    // =================================================

    const handleVerifyOTP =
        async (event) => {

            event.preventDefault();


            setError("");

            setSuccess("");


            // -----------------------------------------
            // OTP VALIDATION
            // -----------------------------------------

            if (
                !/^\d{6}$/.test(
                    otp
                )
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

                        "/auth/verify-registration-otp",

                        {
                            email:
                                email
                                    .trim()
                                    .toLowerCase(),

                            otp
                        }

                    );


                if (
                    response.data.success
                ) {

                    setSuccess(
                        "Email verified successfully. Redirecting to login..."
                    );


                    setSuccess(
                        "Email verified successfully. Welcome to Our Memo!"
                    );

                    setTimeout(() => {

                        navigate("/", {
                            replace: true
                        });

                    }, 800);

                } else {

                    setError(
                        response.data.message ||
                        "OTP verification failed."
                    );

                }


            } catch (error) {

                console.error(
                    "VERIFY REGISTRATION OTP ERROR:",
                    error
                );


                setError(

                    error.response?.data?.message ||

                    "Unable to verify OTP. Please try again."

                );

            } finally {

                setLoading(false);

            }

        };


    // =================================================
    // RESEND REGISTRATION OTP
    // =================================================

    const handleResendOTP =
        async () => {

            if (
                resendTimer > 0 ||
                resendLoading
            ) {

                return;

            }


            setError("");

            setSuccess("");


            try {

                setResendLoading(true);


                const response =
                    await api.post(

                        "/auth/resend-registration-otp",

                        {
                            email:
                                email
                                    .trim()
                                    .toLowerCase()
                        }

                    );


                if (
                    response.data.success
                ) {

                    setSuccess(
                        "A new OTP has been sent to your email."
                    );


                    setOtp("");


                    startResendTimer();

                } else {

                    setError(
                        response.data.message ||
                        "Unable to resend OTP."
                    );

                }


            } catch (error) {

                console.error(
                    "RESEND REGISTRATION OTP ERROR:",
                    error
                );


                setError(

                    error.response?.data?.message ||

                    "Unable to resend OTP."

                );

            } finally {

                setResendLoading(false);

            }

        };


    // =================================================
    // CHANGE EMAIL
    // =================================================

    const handleChangeEmail = () => {

        setStep(1);

        setOtp("");

        setError("");

        setSuccess("");

        setResendTimer(0);

    };


    // =================================================
    // UI
    // =================================================

    return (

        <main className="register-page">

            <div className="register-card">


                {/* =====================================
                    LOGO
                ===================================== */}

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


                {/* =====================================
                    STEP 1
                ===================================== */}

                {step === 1 && (

                    <>

                        <div className="register-header">

                            <h1>
                                Create your account
                            </h1>


                            <p>
                                Start saving your memories
                                in one place.
                            </p>

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div className="register-error">

                                {error}

                            </div>

                        )}


                        {/* SUCCESS */}

                        {success && (

                            <div className="register-success">

                                <CheckCircle
                                    size={17}
                                />

                                {success}

                            </div>

                        )}


                        {/* FORM */}

                        <form
                            className="register-form"
                            onSubmit={
                                handleRegister
                            }
                        >


                            {/* NAME */}

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


                            {/* EMAIL */}

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


                            {/* PASSWORD */}

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


                            {/* PASSWORD RULES */}

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


                            {/* CONFIRM PASSWORD */}

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


                            {/* PASSWORD MATCH */}

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


                            {/* SUBMIT */}

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

                                    ? "Sending OTP..."

                                    : "Continue"

                                }

                            </button>

                        </form>


                        {/* LOGIN */}

                        <div className="register-login">

                            Already have an account?

                            <Link
                                to="/login"
                            >
                                Login
                            </Link>

                        </div>

                    </>

                )}


                {/* =====================================
                    STEP 2 — OTP
                ===================================== */}

                {step === 2 && (

                    <>

                        <button
                            type="button"
                            className="register-otp-back"
                            onClick={
                                handleChangeEmail
                            }
                        >

                            <ArrowLeft
                                size={16}
                            />

                            Back

                        </button>


                        <div className="register-header">

                            <div className="register-otp-icon">

                                <ShieldCheck
                                    size={25}
                                />

                            </div>


                            <h1>
                                Verify your email
                            </h1>


                            <p>

                                We sent a 6 digit
                                verification code to

                                <br />

                                <strong>
                                    {email}
                                </strong>

                            </p>

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div className="register-error">

                                {error}

                            </div>

                        )}


                        {/* SUCCESS */}

                        {success && (

                            <div className="register-success">

                                <CheckCircle
                                    size={17}
                                />

                                {success}

                            </div>

                        )}


                        {/* OTP FORM */}

                        <form
                            className="register-form"
                            onSubmit={
                                handleVerifyOTP
                            }
                        >

                            <div className="register-field">

                                <label>
                                    Verification Code
                                </label>


                                <div className="register-input-wrapper">

                                    <ShieldCheck
                                        size={17}
                                    />


                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={
                                            otp
                                        }
                                        onChange={
                                            event =>
                                                setOtp(
                                                    event.target.value.replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                )
                                        }
                                        autoComplete="one-time-code"
                                        disabled={
                                            loading
                                        }
                                    />

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="register-submit"
                                disabled={
                                    loading ||
                                    otp.length !== 6
                                }
                            >

                                <ShieldCheck
                                    size={17}
                                />


                                {loading

                                    ? "Verifying..."

                                    : "Verify Email"

                                }

                            </button>

                        </form>


                        {/* RESEND */}

                        <div className="register-resend">

                            {resendTimer > 0 ? (

                                <span>
                                    Resend OTP in{" "}
                                    <strong>
                                        {resendTimer}s
                                    </strong>
                                </span>

                            ) : (

                                <button
                                    type="button"
                                    onClick={
                                        handleResendOTP
                                    }
                                    disabled={
                                        resendLoading
                                    }
                                >

                                    {resendLoading

                                        ? "Sending..."

                                        : "Resend OTP"

                                    }

                                </button>

                            )}

                        </div>


                        {/* CHANGE EMAIL */}

                        <button
                            type="button"
                            className="register-change-email"
                            onClick={
                                handleChangeEmail
                            }
                        >
                            Use a different email
                        </button>


                        <div className="register-login">

                            Already have an account?

                            <Link
                                to="/login"
                            >
                                Login
                            </Link>

                        </div>

                    </>

                )}

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