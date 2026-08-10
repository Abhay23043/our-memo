import {
    Navigate,
    Outlet
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";


function ProtectedRoute({
    adminOnly = false
}) {

    const {
        user,
        loading
    } = useAuth();


    // =====================================================
    // AUTHENTICATION CHECK
    // =====================================================

    if (loading) {

        return (
            <div className="auth-loading">

                <div className="loading-spinner"></div>

                <p>
                    Loading...
                </p>

            </div>
        );

    }


    // =====================================================
    // USER NOT LOGGED IN
    // =====================================================

    if (!user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    // =====================================================
    // ADMIN ONLY CHECK
    // =====================================================

    if (
        adminOnly &&
        user.role !== "admin"
    ) {

        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    // =====================================================
    // AUTHENTICATED USER
    // =====================================================

    return <Outlet />;

}


export default ProtectedRoute;