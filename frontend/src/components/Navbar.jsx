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


function Navbar() {

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);


    const location =
        useLocation();


    // =================================================
    // CLOSE MOBILE MENU WHEN ROUTE CHANGES
    // =================================================

    useEffect(() => {

        setMobileMenuOpen(
            false
        );

    }, [
        location.pathname
    ]);


    // =================================================
    // CLOSE MOBILE MENU
    // =================================================

    const closeMobileMenu = () => {

        setMobileMenuOpen(
            false
        );

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
                ===================================== */}

                <nav className="desktop-nav">


                    {/* DASHBOARD */}

                    <NavLink
                        to="/"
                        end
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


                {/* =====================================
                    RIGHT SIDE
                ===================================== */}

                <div className="navbar-actions">


                    {/* PROFILE */}

                  <Link
                    to="/profile"
                    className="profile-button"
                    aria-label="Profile"
                >
                    <User
                        size={18}
                    />
                </Link>


                    {/* =================================
                        MOBILE MENU BUTTON
                    ================================= */}

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


                </div>


            </div>


            {/* =========================================
                MOBILE NAVIGATION
            ========================================= */}

            {mobileMenuOpen && (

                <div className="mobile-menu">


                    {/* DASHBOARD */}

                    <NavLink
                        to="/"
                        end
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