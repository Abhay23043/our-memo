import {
    useEffect,
    useState
} from "react";


import {
    NavLink,
    Link,
    useLocation
} from "react-router-dom";


import {
    Heart,
    Folder,
    Trash2,
    Menu,
    X,
    Images,
    Home,
    User
} from "lucide-react";


import {
    useAuth
} from "../context/AuthContext";


function Navbar() {

    const [
        mobileMenuOpen,
        setMobileMenuOpen
    ] = useState(false);


    const location =
        useLocation();


    const {
        user
    } = useAuth();


    // =================================================
    // CHECK ADMIN
    // =================================================

    const isAdmin =
        user?.role === "admin";


    // =================================================
    // CLOSE MOBILE MENU WHEN ROUTE CHANGES
    // =================================================

    useEffect(() => {

        setMobileMenuOpen(false);

    }, [
        location.pathname
    ]);


    // =================================================
    // CLOSE MOBILE MENU
    // =================================================

    const closeMobileMenu = () => {

        setMobileMenuOpen(false);

    };


    // =================================================
    // NAV LINK CLASS
    // =================================================

    const getNavLinkClass = ({
        isActive
    }) => {

        return (

            isActive
                ? "nav-link active"
                : "nav-link"

        );

    };


    // =================================================
    // MOBILE NAV LINK CLASS
    // =================================================

    const getMobileNavLinkClass = ({
        isActive
    }) => {

        return (

            isActive
                ? "mobile-nav-link active"
                : "mobile-nav-link"

        );

    };


    // =================================================
    // DISABLED PROFILE
    // NORMAL USER ONLY
    //
    // Profile is visible but not accessible.
    // =================================================

    const handleDisabledProfile = (
        event
    ) => {

        if (!isAdmin) {

            event.preventDefault();

        }

    };


    // =================================================
    // UI
    // =================================================

    return (

        <header className="navbar">


            <div className="navbar-inner">


                {/* =====================================
                    LOGO
                ===================================== */}

                <Link
                    to="/"
                    className="navbar-logo"
                    onClick={
                        closeMobileMenu
                    }
                >

                    <div className="logo-icon">

                        <Heart
                            size={18}
                            fill="currentColor"
                        />

                    </div>


                    <span>
                        Our Memo
                    </span>

                </Link>


                {/* =====================================
                    DESKTOP NAVIGATION
                    ADMIN ONLY
                ===================================== */}

                {isAdmin && (

                    <nav className="desktop-nav">


                        {/* DASHBOARD */}

                        <NavLink
                            to="/dashboard"
                            className={
                                getNavLinkClass
                            }
                        >

                            <Home
                                size={17}
                            />

                            <span>
                                Dashboard
                            </span>

                        </NavLink>


                        {/* GALLERY */}

                        <NavLink
                            to="/gallery"
                            className={
                                getNavLinkClass
                            }
                        >

                            <Images
                                size={17}
                            />

                            <span>
                                Gallery
                            </span>

                        </NavLink>


                        {/* FOLDERS */}

                        <NavLink
                            to="/folders"
                            className={
                                getNavLinkClass
                            }
                        >

                            <Folder
                                size={17}
                            />

                            <span>
                                Folders
                            </span>

                        </NavLink>


                        {/* FAVORITES */}

                        <NavLink
                            to="/favorites"
                            className={
                                getNavLinkClass
                            }
                        >

                            <Heart
                                size={17}
                            />

                            <span>
                                Favorites
                            </span>

                        </NavLink>


                        {/* RECYCLE BIN */}

                        <NavLink
                            to="/recycle-bin"
                            className={
                                getNavLinkClass
                            }
                        >

                            <Trash2
                                size={17}
                            />

                            <span>
                                Recycle Bin
                            </span>

                        </NavLink>


                    </nav>

                )}


                {/* =====================================
                    RIGHT SIDE
                ===================================== */}

                <div className="navbar-actions">


                    {/* =================================
                        PROFILE

                        ADMIN:
                        Accessible

                        NORMAL USER:
                        Visible but disabled
                    ================================= */}

                    {isAdmin ? (

                        <Link
                            to="/profile"
                            className="profile-button"
                            aria-label="Profile"
                        >

                            <User
                                size={18}
                            />

                        </Link>

                    ) : (

                        <button
                            type="button"
                            className="profile-button"
                            aria-label="Profile"
                            aria-disabled="true"
                            onClick={
                                handleDisabledProfile
                            }
                            title="Profile is available to admin only"
                        >

                            <User
                                size={18}
                            />

                        </button>

                    )}


                    {/* =================================
                        MOBILE MENU BUTTON
                        ADMIN ONLY
                    ================================= */}

                    {isAdmin && (

                        <button
                            type="button"
                            className="mobile-menu-button"
                            onClick={() =>
                                setMobileMenuOpen(
                                    previous =>
                                        !previous
                                )
                            }
                            aria-label={
                                mobileMenuOpen
                                    ? "Close menu"
                                    : "Open menu"
                            }
                            aria-expanded={
                                mobileMenuOpen
                            }
                        >

                            {mobileMenuOpen ? (

                                <X
                                    size={23}
                                />

                            ) : (

                                <Menu
                                    size={23}
                                />

                            )}

                        </button>

                    )}


                </div>


            </div>


            {/* =========================================
                MOBILE NAVIGATION
                ADMIN ONLY
            ========================================= */}

            {isAdmin &&
                mobileMenuOpen && (

                <div className="mobile-menu">


                    {/* DASHBOARD */}

                    <NavLink
                        to="/dashboard"
                        className={
                            getMobileNavLinkClass
                        }
                        onClick={
                            closeMobileMenu
                        }
                    >

                        <Home
                            size={18}
                        />

                        <span>
                            Dashboard
                        </span>

                    </NavLink>


                    {/* GALLERY */}

                    <NavLink
                        to="/gallery"
                        className={
                            getMobileNavLinkClass
                        }
                        onClick={
                            closeMobileMenu
                        }
                    >

                        <Images
                            size={18}
                        />

                        <span>
                            Gallery
                        </span>

                    </NavLink>


                    {/* FOLDERS */}

                    <NavLink
                        to="/folders"
                        className={
                            getMobileNavLinkClass
                        }
                        onClick={
                            closeMobileMenu
                        }
                    >

                        <Folder
                            size={18}
                        />

                        <span>
                            Folders
                        </span>

                    </NavLink>


                    {/* FAVORITES */}

                    <NavLink
                        to="/favorites"
                        className={
                            getMobileNavLinkClass
                        }
                        onClick={
                            closeMobileMenu
                        }
                    >

                        <Heart
                            size={18}
                        />

                        <span>
                            Favorites
                        </span>

                    </NavLink>


                    {/* RECYCLE BIN */}

                    <NavLink
                        to="/recycle-bin"
                        className={
                            getMobileNavLinkClass
                        }
                        onClick={
                            closeMobileMenu
                        }
                    >

                        <Trash2
                            size={18}
                        />

                        <span>
                            Recycle Bin
                        </span>

                    </NavLink>


                </div>

            )}


        </header>

    );

}


export default Navbar;