import {
    BrowserRouter,
    Routes,
    Route,
    useLocation,
    Navigate
} from "react-router-dom";


import {
    useEffect
} from "react";


import LandingPage
from "./pages/LandingPage.jsx";


import Dashboard
from "./pages/Dashboard.jsx";


import Gallery
from "./pages/Gallery.jsx";


import Favorites
from "./pages/Favorites.jsx";


import Folders
from "./pages/Folders.jsx";


import FolderPhotos
from "./pages/FolderPhotos.jsx";


import RecycleBin
from "./pages/RecycleBin.jsx";


import Login
from "./pages/Login.jsx";


import Register
from "./pages/Register.jsx";


import Profile
from "./pages/Profile.jsx";


import ForgotPassword
from "./pages/ForgotPassword";


import Navbar
from "./components/Navbar.jsx";


import ProtectedRoute
from "./components/ProtectedRoute.jsx";


import {
    useAuth
} from "./context/AuthContext.jsx";


// =====================================================
// ROLE REDIRECT
//
// This component checks the CURRENT role obtained
// from /auth/me.
//
// IMPORTANT:
// If MongoDB role changes from user → admin,
// refreshing the browser will detect the new role.
// =====================================================

function RoleRedirect() {

    const {
        user,
        loading
    } = useAuth();


    // =================================================
    // WAIT FOR AUTH CHECK
    // =================================================

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


    // =================================================
    // ADMIN
    //
    // Admin visiting "/" goes to dashboard.
    // =================================================

    if (
        user &&
        user.role === "admin"
    ) {

        return (

            <Navigate
                to="/dashboard"
                replace
            />

        );

    }


    // =================================================
    // NORMAL USER / LOGGED OUT
    //
    // Stay on landing page.
    // =================================================

    return (
        <LandingPage />
    );

}


// =====================================================
// APP LAYOUT
// =====================================================

function AppLayout() {

    const location =
        useLocation();


    const {
        user,
        loading
    } = useAuth();


    // =================================================
    // LANDING PAGE
    //
    // LandingPage has its own navbar.
    // =================================================

    const isLandingPage =
        location.pathname === "/";


    // =================================================
    // AUTH PAGES
    // =================================================

    const isAuthPage =
        location.pathname === "/login" ||
        location.pathname === "/register" ||
        location.pathname === "/forgot-password";


    // =================================================
    // HIDE GLOBAL NAVBAR
    //
    // Landing page:
    //     own navbar
    //
    // Auth pages:
    //     no navbar
    // =================================================

    const hideNavbar =
        isLandingPage ||
        isAuthPage;


    // =================================================
    // AUTOMATIC ADMIN REDIRECT
    //
    // This handles:
    //
    // MongoDB:
    // role = user
    //
    // change to:
    // role = admin
    //
    // then browser refresh:
    // "/" → "/dashboard"
    // =================================================

    useEffect(() => {

        if (
            loading
        ) {

            return;

        }


        // =================================================
        // ONLY REDIRECT FROM LANDING PAGE
        // =================================================

        if (
            location.pathname === "/" &&
            user?.role === "admin"
        ) {

            window.history.replaceState(
                null,
                "",
                "/dashboard"
            );

            window.dispatchEvent(
                new PopStateEvent(
                    "popstate"
                )
            );

        }

    }, [
        user,
        loading,
        location.pathname
    ]);


    return (

        <>


            {/* =================================================
                GLOBAL NAVBAR

                Only authenticated/private pages.
            ================================================= */}

            {!hideNavbar && (

                <Navbar />

            )}


            {/* =================================================
                ROUTES
            ================================================= */}

            <Routes>


                {/* =================================================
                    PUBLIC LANDING PAGE

                    IMPORTANT:
                    RoleRedirect decides:

                    Normal user → Landing Page
                    Admin       → Dashboard
                ================================================= */}

                <Route
                    path="/"
                    element={
                        <RoleRedirect />
                    }
                />


                {/* =================================================
                    LOGIN
                ================================================= */}

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />


                {/* =================================================
                    REGISTER
                ================================================= */}

                <Route
                    path="/register"
                    element={
                        <Register />
                    }
                />


                {/* =================================================
                    FORGOT PASSWORD
                ================================================= */}

                <Route
                    path="/forgot-password"
                    element={
                        <ForgotPassword />
                    }
                />


                {/* =================================================
                    ADMIN ONLY ROUTES
                ================================================= */}

                <Route
                    element={
                        <ProtectedRoute
                            adminOnly
                        />
                    }
                >


                    {/* =================================================
                        DASHBOARD
                    ================================================= */}

                    <Route
                        path="/dashboard"
                        element={
                            <Dashboard />
                        }
                    />


                    {/* =================================================
                        GALLERY
                    ================================================= */}

                    <Route
                        path="/gallery"
                        element={
                            <Gallery />
                        }
                    />


                    {/* =================================================
                        FOLDERS
                    ================================================= */}

                    <Route
                        path="/folders"
                        element={
                            <Folders />
                        }
                    />


                    {/* =================================================
                        FOLDER PHOTOS
                    ================================================= */}

                    <Route
                        path="/folders/:folderId"
                        element={
                            <FolderPhotos />
                        }
                    />


                    {/* =================================================
                        FAVORITES
                    ================================================= */}

                    <Route
                        path="/favorites"
                        element={
                            <Favorites />
                        }
                    />


                    {/* =================================================
                        RECYCLE BIN
                    ================================================= */}

                    <Route
                        path="/recycle-bin"
                        element={
                            <RecycleBin />
                        }
                    />


                    {/* =================================================
                        PROFILE
                    ================================================= */}

                    <Route
                        path="/profile"
                        element={
                            <Profile />
                        }
                    />


                    {/* =================================================
                        ADMIN
                    ================================================= */}

                    <Route
                        path="/admin"
                        element={
                            <h1>
                                Admin
                            </h1>
                        }
                    />


                </Route>


                {/* =================================================
                    UNKNOWN ROUTES
                ================================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />


            </Routes>


        </>

    );

}


// =====================================================
// APP
// =====================================================

function App() {

    return (

        <BrowserRouter>

            <AppLayout />

        </BrowserRouter>

    );

}


export default App;