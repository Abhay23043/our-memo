import {
    BrowserRouter,
    Routes,
    Route,
    useLocation
} from "react-router-dom";


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


// =====================================================
// APP LAYOUT
// =====================================================

function AppLayout() {

    const location =
        useLocation();


    // =================================================
    // LANDING PAGE
    //
    // LandingPage already has its own navbar.
    // Therefore global Navbar should NOT appear here.
    // =================================================

    const isLandingPage =
        location.pathname === "/";


    // =================================================
    // AUTH PAGES
    //
    // Navbar hidden on login/register/forgot-password.
    // =================================================

    const isAuthPage =
        location.pathname === "/login" ||
        location.pathname === "/register" ||
        location.pathname === "/forgot-password";


    // =================================================
    // HIDE GLOBAL NAVBAR
    //
    // Landing page:
    //     has its own navbar
    //
    // Auth pages:
    //     should have no navbar
    // =================================================

    const hideNavbar =
        isLandingPage ||
        isAuthPage;


    return (

        <>


            {/* =================================================
                GLOBAL NAVBAR
                ADMIN PRIVATE PAGES ONLY
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
                ================================================= */}

                <Route
                    path="/"
                    element={
                        <LandingPage />
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
                    EVERYTHING INSIDE THIS ROUTE
                    REQUIRES ADMIN
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
                    SEND USER TO LANDING PAGE
                ================================================= */}

                <Route
                    path="*"
                    element={
                        <LandingPage />
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