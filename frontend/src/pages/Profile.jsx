import {
    useEffect,
    useState
} from "react";

import {
    User,
    Mail,
    Shield,
    CalendarDays,
    LogOut,
    ArrowLeft,
    Pencil,
    Save,
    X,
    Lock,
    Eye,
    EyeOff,
    CheckCircle
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

import api from "../services/api";

import "../styles/Profile.css";


function Profile() {

    const navigate =
        useNavigate();


    // =================================================
    // USER
    // =================================================

    const [user, setUser] =
        useState(null);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    // =================================================
    // EDIT PROFILE
    // =================================================

    const [editingName, setEditingName] =
        useState(false);


    const [name, setName] =
        useState("");


    const [savingName, setSavingName] =
        useState(false);


    const [nameSuccess, setNameSuccess] =
        useState("");


    // =================================================
    // CHANGE PASSWORD
    // =================================================

    const [passwordOpen, setPasswordOpen] =
        useState(false);


    const [currentPassword, setCurrentPassword] =
        useState("");


    const [newPassword, setNewPassword] =
        useState("");


    const [confirmPassword, setConfirmPassword] =
        useState("");


    const [changingPassword, setChangingPassword] =
        useState(false);


    const [passwordError, setPasswordError] =
        useState("");


    const [passwordSuccess, setPasswordSuccess] =
        useState("");


    // =================================================
    // PASSWORD VISIBILITY
    // =================================================

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);


    const [showNewPassword, setShowNewPassword] =
        useState(false);


    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);


    // =================================================
    // LOGOUT
    // =================================================

    const [loggingOut, setLoggingOut] =
        useState(false);


    // =================================================
    // LOAD CURRENT USER
    // =================================================

    useEffect(() => {

        const loadUser =
            async () => {

                try {

                    setLoading(true);

                    setError("");


                    const response =
                        await api.get(
                            "/auth/me"
                        );


                    if (
                        response.data.success
                    ) {

                        const currentUser =
                            response.data.user;


                        setUser(
                            currentUser
                        );


                        setName(
                            currentUser?.name ||
                            ""
                        );

                    } else {

                        setError(
                            response.data.message ||
                            "Unable to load profile"
                        );

                    }

                } catch (error) {

                    console.error(
                        "PROFILE LOAD ERROR:",
                        error
                    );


                    setError(
                        error.response?.data?.message ||
                        "Unable to load profile"
                    );

                } finally {

                    setLoading(false);

                }

            };


        loadUser();

    }, []);


    // =================================================
    // EDIT NAME
    // =================================================

    const handleStartEdit =
        () => {

            setName(
                user?.name || ""
            );

            setNameSuccess("");

            setError("");

            setEditingName(true);

        };


    // =================================================
    // CANCEL NAME EDIT
    // =================================================

    const handleCancelEdit =
        () => {

            setName(
                user?.name || ""
            );

            setEditingName(false);

            setNameSuccess("");

            setError("");

        };


    // =================================================
    // SAVE NAME
    // =================================================

    const handleSaveName =
        async () => {

            const trimmedName =
                name.trim();


            if (
                !trimmedName
            ) {

                setError(
                    "Name is required"
                );

                return;

            }


            if (
                trimmedName.length > 100
            ) {

                setError(
                    "Name cannot exceed 100 characters"
                );

                return;

            }


            if (
                trimmedName ===
                user?.name
            ) {

                setEditingName(false);

                return;

            }


            try {

                setSavingName(true);

                setError("");

                setNameSuccess("");


                const response =
                    await api.patch(

                        "/auth/profile",

                        {
                            name:
                                trimmedName
                        }

                    );


                if (
                    response.data.success
                ) {

                    setUser(
                        response.data.user
                    );


                    setName(
                        response.data.user.name
                    );


                    setEditingName(
                        false
                    );


                    setNameSuccess(
                        "Name updated successfully"
                    );


                    // Remove success message
                    // after a few seconds

                    setTimeout(
                        () => {

                            setNameSuccess("");

                        },
                        3000
                    );

                } else {

                    setError(
                        response.data.message ||
                        "Unable to update name"
                    );

                }

            } catch (error) {

                console.error(
                    "UPDATE NAME ERROR:",
                    error
                );


                setError(
                    error.response?.data?.message ||
                    "Unable to update name"
                );

            } finally {

                setSavingName(false);

            }

        };


    // =================================================
    // OPEN PASSWORD FORM
    // =================================================

    const handleOpenPassword =
        () => {

            setPasswordOpen(true);

            setPasswordError("");

            setPasswordSuccess("");

        };


    // =================================================
    // CLOSE PASSWORD FORM
    // =================================================

    const handleClosePassword =
        () => {

            if (
                changingPassword
            ) {

                return;

            }


            setPasswordOpen(false);

            setCurrentPassword("");

            setNewPassword("");

            setConfirmPassword("");

            setPasswordError("");

            setPasswordSuccess("");

            setShowCurrentPassword(false);

            setShowNewPassword(false);

            setShowConfirmPassword(false);

        };


    // =================================================
    // CHANGE PASSWORD
    // =================================================

    const handleChangePassword =
        async (
            event
        ) => {

            event.preventDefault();


            setPasswordError("");

            setPasswordSuccess("");


            // -----------------------------------------
            // REQUIRED
            // -----------------------------------------

            if (
                !currentPassword ||
                !newPassword ||
                !confirmPassword
            ) {

                setPasswordError(
                    "Please fill in all password fields"
                );

                return;

            }


            // -----------------------------------------
            // CONFIRM PASSWORD
            // -----------------------------------------

            if (
                newPassword !==
                confirmPassword
            ) {

                setPasswordError(
                    "New passwords do not match"
                );

                return;

            }


            // -----------------------------------------
            // PASSWORD RULES
            // -----------------------------------------

            if (
                newPassword.length < 8
            ) {

                setPasswordError(
                    "Password must contain at least 8 characters"
                );

                return;

            }


            if (
                !/[A-Z]/.test(
                    newPassword
                )
            ) {

                setPasswordError(
                    "Password must contain at least one uppercase letter"
                );

                return;

            }


            if (
                !/[a-z]/.test(
                    newPassword
                )
            ) {

                setPasswordError(
                    "Password must contain at least one lowercase letter"
                );

                return;

            }


            if (
                !/[0-9]/.test(
                    newPassword
                )
            ) {

                setPasswordError(
                    "Password must contain at least one number"
                );

                return;

            }


            try {

                setChangingPassword(
                    true
                );


                const response =
                    await api.patch(

                        "/auth/password",

                        {
                            currentPassword,

                            newPassword,

                            confirmPassword
                        }

                    );


                if (
                    response.data.success
                ) {

                    setPasswordSuccess(
                        "Password changed successfully"
                    );


                    setCurrentPassword("");

                    setNewPassword("");

                    setConfirmPassword("");


                    setShowCurrentPassword(
                        false
                    );

                    setShowNewPassword(
                        false
                    );

                    setShowConfirmPassword(
                        false
                    );


                    // Close form after success

                    setTimeout(
                        () => {

                            setPasswordOpen(
                                false
                            );

                            setPasswordSuccess("");

                        },
                        1800
                    );

                } else {

                    setPasswordError(
                        response.data.message ||
                        "Unable to change password"
                    );

                }

            } catch (error) {

                console.error(
                    "CHANGE PASSWORD ERROR:",
                    error
                );


                setPasswordError(
                    error.response?.data?.message ||
                    "Unable to change password"
                );

            } finally {

                setChangingPassword(
                    false
                );

            }

        };


    // =================================================
    // LOGOUT
    // =================================================

    const handleLogout =
        async () => {

            if (
                loggingOut
            ) {

                return;

            }


            try {

                setLoggingOut(true);

                setError("");


                await api.post(
                    "/auth/logout"
                );


                navigate(
                    "/login",
                    {
                        replace: true
                    }
                );

            } catch (error) {

                console.error(
                    "LOGOUT ERROR:",
                    error
                );


                setError(
                    error.response?.data?.message ||
                    "Unable to logout"
                );

            } finally {

                setLoggingOut(false);

            }

        };


    // =================================================
    // FORMAT DATE
    // =================================================

    const formatDate =
        (
            date
        ) => {

            if (
                !date
            ) {

                return "Not available";

            }


            const parsedDate =
                new Date(date);


            if (
                Number.isNaN(
                    parsedDate.getTime()
                )
            ) {

                return "Not available";

            }


            return parsedDate.toLocaleDateString(

                "en-IN",

                {
                    day:
                        "numeric",

                    month:
                        "long",

                    year:
                        "numeric"
                }

            );

        };


    // =================================================
    // PASSWORD STRENGTH CHECK
    // =================================================

    const passwordRules = {

        length:
            newPassword.length >= 8,

        uppercase:
            /[A-Z]/.test(
                newPassword
            ),

        lowercase:
            /[a-z]/.test(
                newPassword
            ),

        number:
            /[0-9]/.test(
                newPassword
            )

    };


    // =================================================
    // LOADING
    // =================================================

    if (
        loading
    ) {

        return (

            <main className="profile-page">

                <div className="profile-container">

                    <div className="profile-loading">

                        <div
                            className="profile-spinner"
                        />

                        <p>
                            Loading profile...
                        </p>

                    </div>

                </div>

            </main>

        );

    }


    // =================================================
    // ERROR
    // =================================================

    if (
        error &&
        !user
    ) {

        return (

            <main className="profile-page">

                <div className="profile-container">

                    <button
                        type="button"
                        className="profile-back-button"
                        onClick={() =>
                            navigate("/")
                        }
                    >

                        <ArrowLeft
                            size={17}
                        />

                        Back to Dashboard

                    </button>


                    <div className="profile-error">

                        <strong>
                            Unable to load profile
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>

                </div>

            </main>

        );

    }


    // =================================================
    // MAIN PROFILE
    // =================================================

    return (

        <main className="profile-page">

            <div className="profile-container">


                {/* =====================================
                    BACK
                ===================================== */}

                <button
                    type="button"
                    className="profile-back-button"
                    onClick={() =>
                        navigate(-1)
                    }
                >

                    <ArrowLeft
                        size={17}
                    />

                    Back

                </button>


                {/* =====================================
                    HEADER
                ===================================== */}

                <section className="profile-header">

                    <div className="profile-avatar">

                        <User
                            size={30}
                        />

                    </div>


                    <div>

                        <p className="profile-eyebrow">
                            Account
                        </p>


                        <h1>
                            My Profile
                        </h1>


                        <p>
                            Manage your account
                            information.
                        </p>

                    </div>

                </section>


                {/* =====================================
                    GENERAL ERROR
                ===================================== */}

                {error && (

                    <div className="profile-inline-error">

                        {error}

                    </div>

                )}


                {/* =====================================
                    NAME SUCCESS
                ===================================== */}

                {nameSuccess && (

                    <div className="profile-success">

                        <CheckCircle
                            size={16}
                        />

                        {nameSuccess}

                    </div>

                )}


                {/* =====================================
                    PERSONAL INFORMATION
                ===================================== */}

                <section className="profile-card">

                    <div className="profile-card-header">

                        <div>

                            <h2>
                                Personal Information
                            </h2>

                            <p>
                                Your account details
                            </p>

                        </div>

                    </div>


                    <div className="profile-details">


                        {/* =================================
                            NAME
                        ================================= */}

                        <div className="profile-detail">

                            <div className="profile-detail-icon">

                                <User
                                    size={18}
                                />

                            </div>


                            <div className="profile-detail-content">

                                <span>
                                    Name
                                </span>


                                {editingName ? (

                                    <div className="profile-edit-name">

                                        <input
                                            type="text"
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
                                            autoFocus
                                            disabled={
                                                savingName
                                            }
                                        />


                                        <button
                                            type="button"
                                            className="profile-small-button profile-save-button"
                                            onClick={
                                                handleSaveName
                                            }
                                            disabled={
                                                savingName
                                            }
                                            aria-label="
                                                Save name
                                            "
                                        >

                                            <Save
                                                size={15}
                                            />

                                        </button>


                                        <button
                                            type="button"
                                            className="profile-small-button"
                                            onClick={
                                                handleCancelEdit
                                            }
                                            disabled={
                                                savingName
                                            }
                                            aria-label="
                                                Cancel name edit
                                            "
                                        >

                                            <X
                                                size={15}
                                            />

                                        </button>

                                    </div>

                                ) : (

                                    <div className="profile-name-display">

                                        <strong>

                                            {
                                                user?.name ||
                                                "Not available"
                                            }

                                        </strong>


                                        <button
                                            type="button"
                                            className="profile-edit-button"
                                            onClick={
                                                handleStartEdit
                                            }
                                            aria-label="
                                                Edit name
                                            "
                                        >

                                            <Pencil
                                                size={14}
                                            />

                                        </button>

                                    </div>

                                )}

                            </div>

                        </div>


                        {/* =================================
                            EMAIL - READ ONLY
                        ================================= */}

                        <div className="profile-detail">

                            <div className="profile-detail-icon">

                                <Mail
                                    size={18}
                                />

                            </div>


                            <div className="profile-detail-content">

                                <span>
                                    Email
                                </span>


                                <div className="profile-readonly-value">

                                    <strong>
                                        {
                                            user?.email ||
                                            "Not available"
                                        }
                                    </strong>

                                    <span className="profile-readonly-badge">
                                        Read only
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* =================================
                            ROLE
                        ================================= */}

                        <div className="profile-detail">

                            <div className="profile-detail-icon">

                                <Shield
                                    size={18}
                                />

                            </div>


                            <div className="profile-detail-content">

                                <span>
                                    Account Type
                                </span>


                                <strong className="profile-role">

                                    {
                                        user?.role ||
                                        "user"
                                    }

                                </strong>

                            </div>

                        </div>


                        {/* =================================
                            CREATED DATE
                        ================================= */}

                        <div className="profile-detail">

                            <div className="profile-detail-icon">

                                <CalendarDays
                                    size={18}
                                />

                            </div>


                            <div className="profile-detail-content">

                                <span>
                                    Member Since
                                </span>


                                <strong>

                                    {
                                        formatDate(
                                            user?.createdAt
                                        )
                                    }

                                </strong>

                            </div>

                        </div>


                    </div>

                </section>


                {/* =====================================
                    CHANGE PASSWORD
                ===================================== */}

                <section className="profile-card">

                    <div className="profile-card-header profile-password-header">

                        <div>

                            <h2>
                                Password & Security
                            </h2>

                            <p>
                                Keep your account secure
                                with a strong password.
                            </p>

                        </div>


                        {!passwordOpen && (

                            <button
                                type="button"
                                className="profile-password-button"
                                onClick={
                                    handleOpenPassword
                                }
                            >

                                <Lock
                                    size={15}
                                />

                                Change Password

                            </button>

                        )}

                    </div>


                    {passwordOpen && (

                        <form
                            className="profile-password-form"
                            onSubmit={
                                handleChangePassword
                            }
                        >

                            {/* CURRENT PASSWORD */}

                            <PasswordInput
                                label="Current Password"
                                value={
                                    currentPassword
                                }
                                onChange={
                                    setCurrentPassword
                                }
                                show={
                                    showCurrentPassword
                                }
                                setShow={
                                    setShowCurrentPassword
                                }
                                disabled={
                                    changingPassword
                                }
                            />


                            {/* NEW PASSWORD */}

                            <PasswordInput
                                label="New Password"
                                value={
                                    newPassword
                                }
                                onChange={
                                    setNewPassword
                                }
                                show={
                                    showNewPassword
                                }
                                setShow={
                                    setShowNewPassword
                                }
                                disabled={
                                    changingPassword
                                }
                            />


                            {/* PASSWORD RULES */}

                            {newPassword && (

                                <div className="profile-password-rules">

                                    <PasswordRule
                                        valid={
                                            passwordRules.length
                                        }
                                        text="
                                            At least 8 characters
                                        "
                                    />


                                    <PasswordRule
                                        valid={
                                            passwordRules.uppercase
                                        }
                                        text="
                                            One uppercase letter
                                        "
                                    />


                                    <PasswordRule
                                        valid={
                                            passwordRules.lowercase
                                        }
                                        text="
                                            One lowercase letter
                                        "
                                    />


                                    <PasswordRule
                                        valid={
                                            passwordRules.number
                                        }
                                        text="
                                            One number
                                        "
                                    />

                                </div>

                            )}


                            {/* CONFIRM PASSWORD */}

                            <PasswordInput
                                label="Confirm New Password"
                                value={
                                    confirmPassword
                                }
                                onChange={
                                    setConfirmPassword
                                }
                                show={
                                    showConfirmPassword
                                }
                                setShow={
                                    setShowConfirmPassword
                                }
                                disabled={
                                    changingPassword
                                }
                            />


                            {/* MATCH STATUS */}

                            {confirmPassword && (

                                <div
                                    className={
                                        `profile-password-match ${
                                            newPassword ===
                                            confirmPassword
                                                ? "match-success"
                                                : "match-error"
                                        }`
                                    }
                                >

                                    {newPassword ===
                                    confirmPassword
                                        ? "Passwords match"
                                        : "Passwords do not match"}

                                </div>

                            )}


                            {/* ERROR */}

                            {passwordError && (

                                <div className="profile-password-error">

                                    {passwordError}

                                </div>

                            )}


                            {/* SUCCESS */}

                            {passwordSuccess && (

                                <div className="profile-success">

                                    <CheckCircle
                                        size={16}
                                    />

                                    {passwordSuccess}

                                </div>

                            )}


                            {/* ACTIONS */}

                            <div className="profile-password-actions">

                                <button
                                    type="button"
                                    className="profile-cancel-password"
                                    onClick={
                                        handleClosePassword
                                    }
                                    disabled={
                                        changingPassword
                                    }
                                >

                                    <X
                                        size={16}
                                    />

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="profile-save-password"
                                    disabled={
                                        changingPassword
                                    }
                                >

                                    <Save
                                        size={16}
                                    />

                                    {changingPassword
                                        ? "Changing..."
                                        : "Change Password"}

                                </button>

                            </div>

                        </form>

                    )}

                </section>


                {/* =====================================
                    LOGOUT
                ===================================== */}

                <section className="profile-danger-card">

                    <div>

                        <h2>
                            Sign out
                        </h2>

                        <p>
                            Sign out of your
                            Our Memo account.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="profile-logout-button"
                        onClick={
                            handleLogout
                        }
                        disabled={
                            loggingOut
                        }
                    >

                        <LogOut
                            size={17}
                        />

                        {loggingOut
                            ? "Signing out..."
                            : "Logout"}

                    </button>

                </section>


            </div>

        </main>

    );

}


// =====================================================
// PASSWORD INPUT
// =====================================================

function PasswordInput({
    label,
    value,
    onChange,
    show,
    setShow,
    disabled
}) {

    return (

        <div className="profile-password-field">

            <label>
                {label}
            </label>


            <div className="profile-password-input">

                <Lock
                    size={16}
                />


                <input
                    type={
                        show
                            ? "text"
                            : "password"
                    }
                    value={
                        value
                    }
                    onChange={
                        event =>
                            onChange(
                                event.target.value
                            )
                    }
                    disabled={
                        disabled
                    }
                    autoComplete="off"
                />


                <button
                    type="button"
                    onClick={() =>
                        setShow(
                            previous =>
                                !previous
                        )
                    }
                    disabled={
                        disabled
                    }
                    aria-label={
                        show
                            ? "Hide password"
                            : "Show password"
                    }
                >

                    {show
                        ? (
                            <EyeOff
                                size={17}
                            />
                        )
                        : (
                            <Eye
                                size={17}
                            />
                        )}

                </button>

            </div>

        </div>

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
                `profile-password-rule ${
                    valid
                        ? "rule-valid"
                        : ""
                }`
            }
        >

            <span>

                {valid
                    ? "✓"
                    : "○"}

            </span>

            {text}

        </div>

    );

}


export default Profile;