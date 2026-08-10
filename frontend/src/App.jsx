import {
    BrowserRouter,
    Routes,
    Route,
    useLocation
} from "react-router-dom";


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


import Navbar
from "./components/Navbar.jsx";


import ProtectedRoute
from "./components/ProtectedRoute.jsx";


import ForgotPassword
from "./pages/ForgotPassword";


function AppLayout() {

    const location =
        useLocation();


    // =================================================
    // PUBLIC AUTH PAGES
    // =================================================

    const isAuthPage =
        location.pathname === "/login" ||
        location.pathname === "/register" ||
        location.pathname === "/forgot-password";


    return (

        <>

            {/* =================================================
                NAVBAR
            ================================================= */}

            {!isAuthPage && (

                <Navbar />

            )}


            {/* =================================================
                ROUTES
            ================================================= */}

            <Routes>


                {/* =================================================
                    PUBLIC ROUTES
                ================================================= */}

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />


                <Route
                    path="/forgot-password"
                    element={
                        <ForgotPassword />
                    }
                />


                <Route
                    path="/register"
                    element={
                        <Register />
                    }
                />


                {/* =================================================
                    NORMAL AUTHENTICATED ROUTES
                ================================================= */}

                <Route
                    element={
                        <ProtectedRoute />
                    }
                >


                    {/* =================================================
                        DASHBOARD
                    ================================================= */}

                    <Route
                        path="/"
                        element={
                            <Dashboard />
                        }
                    />


                    {/* =================================================
                        FOLDERS
                        Normal users can see folder list
                    ================================================= */}

                    <Route
                        path="/folders"
                        element={
                            <Folders />
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


                </Route>


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
                        GALLERY
                    ================================================= */}

                    <Route
                        path="/gallery"
                        element={
                            <Gallery />
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
                        FOLDER PHOTOS
                    ================================================= */}

                    <Route
                        path="/folders/:folderId"
                        element={
                            <FolderPhotos />
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


            </Routes>

        </>

    );

}


function App() {

    return (

        <BrowserRouter>

            <AppLayout />

        </BrowserRouter>

    );

}


export default App;