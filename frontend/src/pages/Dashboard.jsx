import "../styles/dashboard.css";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import { useAuth } from "../context/AuthContext";

import {
    Camera,
    Heart,
    Folder,
    Upload,
    ArrowRight,
    Images,
    Clock3,
    Trash2,
    X
} from "lucide-react";

import api from "../services/api";

import UploadModal from "../components/UploadModal";

import PhotoViewer from "../components/PhotoViewer";


function Dashboard() {

    const {
        user
    } = useAuth();


    // =================================================
    // STATE
    // =================================================

    const [photos, setPhotos] =
        useState([]);

    const [folders, setFolders] =
        useState([]);

    const [recycleBinPhotos, setRecycleBinPhotos] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [uploadOpen, setUploadOpen] =
        useState(false);

    const [viewerOpen, setViewerOpen] =
        useState(false);

    const [selectedPhoto, setSelectedPhoto] =
        useState(null);

    // Delete confirmation modal
    const [deleteConfirmPhoto, setDeleteConfirmPhoto] =
        useState(null);

    const [deleteLoading, setDeleteLoading] =
        useState(false);

    const [deleteError, setDeleteError] =
        useState("");


    // =================================================
    // FETCH DASHBOARD DATA
    // =================================================

    const fetchDashboardData = async () => {

        // =================================================
        // NORMAL USERS DO NOT HAVE ACCESS TO PHOTO CONTENT
        // =================================================

        if (user?.role !== "admin") {

            setPhotos([]);

            setFolders([]);

            setRecycleBinPhotos([]);

            setError("");

            setLoading(false);

            return;
        }


        try {

            setLoading(true);

            setError("");


            const [
                photosResponse,
                foldersResponse,
                recycleResponse
            ] = await Promise.all([

                api.get(
                    "/api/photos"
                ),

                api.get(
                    "/api/folders"
                ),

                api.get(
                    "/api/photos/recycle-bin"
                )

            ]);


            // =========================================
            // PHOTOS
            // =========================================

            if (
                photosResponse.data.success
            ) {

                setPhotos(
                    photosResponse.data.photos || []
                );

            } else {

                setPhotos([]);

            }


            // =========================================
            // FOLDERS
            // =========================================

            if (
                foldersResponse.data.success
            ) {

                setFolders(
                    foldersResponse.data.folders || []
                );

            } else {

                setFolders([]);

            }


            // =========================================
            // RECYCLE BIN
            // =========================================

            if (
                recycleResponse.data.success
            ) {

                setRecycleBinPhotos(
                    recycleResponse.data.photos ||
                    recycleResponse.data.deletedPhotos ||
                    []
                );

            } else {

                setRecycleBinPhotos([]);

            }

        } catch (error) {

            console.error(
                "DASHBOARD LOAD ERROR:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Unable to load dashboard"
            );

        } finally {

            setLoading(false);

        }

    };


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        fetchDashboardData();

    }, [user]);


    // =================================================
    // STATISTICS
    // =================================================

    const totalPhotos =
        photos.length;


    const totalFavorites =
        photos.filter(
            photo =>
                photo.isFavorite
        ).length;


    const totalFolders =
        folders.length;


    const totalRecycleBin =
        recycleBinPhotos.length;


    // =================================================
    // RECENT PHOTOS
    // =================================================

    const recentPhotos =
        useMemo(() => {

            return [...photos]
                .sort(
                    (
                        first,
                        second
                    ) => {

                        const firstDate =
                            new Date(
                                first.createdAt || 0
                            ).getTime();


                        const secondDate =
                            new Date(
                                second.createdAt || 0
                            ).getTime();


                        return (
                            secondDate -
                            firstDate
                        );

                    }
                )
                .slice(0, 6);

        }, [photos]);


    // =================================================
    // FAVORITE PHOTOS
    // =================================================

    const favoritePhotos =
        useMemo(() => {

            return photos
                .filter(
                    photo =>
                        photo.isFavorite
                )
                .slice(0, 4);

        }, [photos]);


    // =================================================
    // RECENT FOLDERS
    // =================================================

    const recentFolders =
        useMemo(() => {

            return [...folders]
                .sort(
                    (
                        first,
                        second
                    ) => {

                        const firstDate =
                            new Date(
                                first.createdAt || 0
                            ).getTime();


                        const secondDate =
                            new Date(
                                second.createdAt || 0
                            ).getTime();


                        return (
                            secondDate -
                            firstDate
                        );

                    }
                )
                .slice(0, 4);

        }, [folders]);


    // =================================================
    // OPEN PHOTO
    // =================================================

    const handleOpenPhoto = (
        photo
    ) => {

        setSelectedPhoto(
            photo
        );

        setViewerOpen(
            true
        );

    };


    // =================================================
    // CLOSE VIEWER
    // =================================================

    const handleCloseViewer = () => {

        setViewerOpen(false);

        setSelectedPhoto(null);

    };


    // =================================================
    // FAVORITE CHANGE
    // =================================================

    const handleFavoriteChange = (
        photoId,
        newValue
    ) => {

        setPhotos(
            currentPhotos =>
                currentPhotos.map(
                    photo => {

                        if (
                            String(
                                photo._id
                            ) ===
                            String(
                                photoId
                            )
                        ) {

                            return {
                                ...photo,
                                isFavorite:
                                    newValue
                            };

                        }


                        return photo;

                    }
                )
        );


        setSelectedPhoto(
            currentPhoto => {

                if (
                    !currentPhoto ||
                    String(
                        currentPhoto._id
                    ) !==
                    String(
                        photoId
                    )
                ) {

                    return currentPhoto;

                }


                return {
                    ...currentPhoto,
                    isFavorite:
                        newValue
                };

            }
        );

    };


    // =================================================
    // PHOTO DELETE
    // =================================================

    const handlePhotoDeleted = (
        photoId
    ) => {

        setPhotos(
            currentPhotos =>
                currentPhotos.filter(
                    photo =>
                        String(
                            photo._id
                        ) !==
                        String(
                            photoId
                        )
                )
        );


        // Update recycle count instantly

        setRecycleBinPhotos(
            currentPhotos => [
                ...currentPhotos,
                {
                    _id: photoId
                }
            ]
        );


        setViewerOpen(false);

        setSelectedPhoto(null);

    };


    // =================================================
    // DIRECT FAVORITE FROM DASHBOARD
    // =================================================

    const handleDashboardFavorite =
        async (
            photo
        ) => {

            const previousValue =
                Boolean(
                    photo.isFavorite
                );


            const newValue =
                !previousValue;


            // =========================================
            // INSTANT UI UPDATE
            // =========================================

            setPhotos(
                currentPhotos =>
                    currentPhotos.map(
                        currentPhoto => {

                            if (
                                String(
                                    currentPhoto._id
                                ) ===
                                String(
                                    photo._id
                                )
                            ) {

                                return {
                                    ...currentPhoto,
                                    isFavorite:
                                        newValue
                                };

                            }


                            return currentPhoto;

                        }
                    )
            );


            try {

                const response =
                    await api.patch(

                        `/api/photos/${photo._id}/favorite`

                    );


                if (
                    !response.data.success
                ) {

                    throw new Error(
                        response.data.message ||
                        "Unable to update favorite"
                    );

                }


                if (
                    typeof
                    response.data.isFavorite ===
                    "boolean"
                ) {

                    handleFavoriteChange(
                        photo._id,
                        response.data.isFavorite
                    );

                }

            } catch (error) {

                console.error(
                    "DASHBOARD FAVORITE ERROR:",
                    error
                );


                // =====================================
                // ROLLBACK
                // =====================================

                setPhotos(
                    currentPhotos =>
                        currentPhotos.map(
                            currentPhoto => {

                                if (
                                    String(
                                        currentPhoto._id
                                    ) ===
                                    String(
                                        photo._id
                                    )
                                ) {

                                    return {
                                        ...currentPhoto,
                                        isFavorite:
                                            previousValue
                                    };

                                }


                                return currentPhoto;

                            }
                        )
                );

            }

        };


    // =================================================
    // DIRECT DELETE FROM DASHBOARD
    // =================================================

    const handleDashboardDelete =
        (photo) => {

            setDeleteError("");

            setDeleteConfirmPhoto(
                photo
            );

        };


    // =================================================
    // CONFIRM PHOTO DELETE
    // =================================================

    const handleConfirmDashboardDelete =
        async () => {

            if (
                !deleteConfirmPhoto ||
                deleteLoading
            ) {

                return;

            }


            try {

                setDeleteLoading(true);

                setDeleteError("");


                const response =
                    await api.delete(

                        `/api/photos/${deleteConfirmPhoto._id}`

                    );


                if (
                    !response.data.success
                ) {

                    setDeleteError(
                        response.data.message ||
                        "Unable to move photo to recycle bin."
                    );

                    return;

                }


                // =====================================
                // REMOVE FROM PHOTOS
                // =====================================

                setPhotos(
                    currentPhotos =>
                        currentPhotos.filter(
                            currentPhoto =>
                                String(
                                    currentPhoto._id
                                ) !==
                                String(
                                    deleteConfirmPhoto._id
                                )
                        )
                );


                // =====================================
                // UPDATE RECYCLE BIN COUNT
                // =====================================

                setRecycleBinPhotos(
                    currentPhotos => [
                        ...currentPhotos,
                        deleteConfirmPhoto
                    ]
                );


                // =====================================
                // CLOSE VIEWER IF SAME PHOTO
                // =====================================

                if (
                    selectedPhoto &&
                    String(
                        selectedPhoto._id
                    ) ===
                    String(
                        deleteConfirmPhoto._id
                    )
                ) {

                    setViewerOpen(false);

                    setSelectedPhoto(null);

                }


                // Close confirmation modal

                setDeleteConfirmPhoto(null);

            } catch (error) {

                console.error(
                    "DASHBOARD DELETE ERROR:",
                    error
                );


                setDeleteError(
                    error.response?.data?.message ||
                    "Unable to move photo to recycle bin."
                );

            } finally {

                setDeleteLoading(false);

            }

        };


    const handleCancelDashboardDelete =
        () => {

            if (deleteLoading) {
                return;
            }

            setDeleteConfirmPhoto(null);

            setDeleteError("");

        };


    // =================================================
    // VIEWER PHOTOS
    // =================================================

    const viewerPhotos =
        photos;


    // =================================================
    // LOADING
    // =================================================

    if (
        loading
    ) {

        return (

            <main className="dashboard-page">

                <div className="dashboard-container">

                    <div className="dashboard-loading">

                        <div
                            className="dashboard-spinner"
                        />

                        <p>
                            Loading your memories...
                        </p>

                    </div>

                </div>

            </main>

        );

    }


    // =================================================
    // UI
    // =================================================

    return (

        <main className="dashboard-page">

            {/* =================================================
                PERSONAL USE ACCESS NOTICE
                NORMAL USERS ONLY
            ================================================= */}

            {user?.role !== "admin" && (

                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="personal-use-title"
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                        background: "rgba(0, 0, 0, 0.55)",
                        backdropFilter: "blur(5px)"
                    }}
                >

                    <div
                        style={{
                            width: "min(460px, 100%)",
                            padding: "28px",
                            border: "1px solid var(--border)",
                            borderRadius: "20px",
                            background: "var(--surface)",
                            color: "var(--text)",
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.20)",
                            textAlign: "center"
                        }}
                    >

                        <div
                            style={{
                                width: "52px",
                                height: "52px",
                                margin: "0 auto 18px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "15px",
                                background: "var(--surface-soft)"
                            }}
                        >

                            <Images size={24} />

                        </div>


                        <h2
                            id="personal-use-title"
                            style={{
                                margin: "0 0 10px",
                                fontSize: "21px",
                                letterSpacing: "-0.02em"
                            }}
                        >
                            Personal Use Only
                        </h2>


                        <p
                            style={{
                                margin: "0 auto 18px",
                                maxWidth: "390px",
                                color: "var(--text-secondary)",
                                fontSize: "13px",
                                lineHeight: "1.7"
                            }}
                        >
                            To access the gallery content, please ask
                            the administrator for access.
                            This website is intended for personal use
                            only and is not available for public access.
                        </p>


                        <div
                            style={{
                                marginBottom: "20px",
                                padding: "13px 15px",
                                borderRadius: "12px",
                                background: "var(--surface-soft)",
                                fontSize: "13px",
                                lineHeight: "1.5"
                            }}
                        >

                            <span
                                style={{
                                    display: "block",
                                    marginBottom: "4px",
                                    color: "var(--text-secondary)",
                                    fontSize: "11px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em"
                                }}
                            >
                                Admin Contact
                            </span>


                            <a
                                href="mailto:abhayjaiswal457@gmail.com"
                                style={{
                                    color: "var(--text)",
                                    fontWeight: 600,
                                    textDecoration: "none"
                                }}
                            >
                                abhayjaiswal457@gmail.com
                            </a>

                        </div>


                        <p
                            style={{
                                margin: 0,
                                color: "var(--text-secondary)",
                                fontSize: "11px"
                            }}
                        >
                            Thank you for understanding.
                        </p>

                    </div>

                </div>

            )}


            <div className="dashboard-container">


                {/* =====================================
                    HEADER
                ===================================== */}

                <section className="dashboard-hero">

                    <div>

                        <p className="dashboard-eyebrow">
                            Welcome back
                        </p>


                        <h1>
                            Your Memories
                        </h1>


                        <p className="dashboard-description">

                            Everything you love,
                            all in one place.

                        </p>

                    </div>


                    <button
                        type="button"
                        className="dashboard-upload-button"
                        onClick={() =>
                            setUploadOpen(true)
                        }
                    >

                        <Upload
                            size={18}
                        />

                        Upload Photos

                    </button>

                </section>


                {/* =====================================
                    ERROR
                ===================================== */}

                {error && (

                    <div className="dashboard-error">

                        {error}

                    </div>

                )}


                {/* =====================================
                    STAT CARDS
                ===================================== */}

                <section className="dashboard-stats">


                    {/* TOTAL PHOTOS */}

                    <div className="dashboard-stat-card">

                        <div className="dashboard-stat-icon">

                            <Camera
                                size={20}
                            />

                        </div>


                        <div>

                            <span>
                                Total Photos
                            </span>

                            <strong>
                                {totalPhotos}
                            </strong>

                        </div>

                    </div>


                    {/* FAVORITES */}

                    <div className="dashboard-stat-card">

                        <div className="dashboard-stat-icon">

                            <Heart
                                size={20}
                            />

                        </div>


                        <div>

                            <span>
                                Favorites
                            </span>

                            <strong>
                                {totalFavorites}
                            </strong>

                        </div>

                    </div>


                    {/* FOLDERS */}

                    <div className="dashboard-stat-card">

                        <div className="dashboard-stat-icon">

                            <Folder
                                size={20}
                            />

                        </div>


                        <div>

                            <span>
                                Folders
                            </span>

                            <strong>
                                {totalFolders}
                            </strong>

                        </div>

                    </div>


                    {/* RECYCLE BIN */}

                    <div className="dashboard-stat-card">

                        <div className="dashboard-stat-icon">

                            <Trash2
                                size={20}
                            />

                        </div>


                        <div>

                            <span>
                                Recycle Bin
                            </span>

                            <strong>
                                {totalRecycleBin}
                            </strong>

                        </div>

                    </div>


                </section>


                {/* =====================================
                    RECENT MEMORIES
                ===================================== */}

                <section className="dashboard-section">

                    <div className="dashboard-section-header">

                        <div>

                            <p className="dashboard-section-eyebrow">

                                <Clock3
                                    size={14}
                                />

                                Recently added

                            </p>


                            <h2>
                                Recent Memories
                            </h2>

                        </div>


                        {recentPhotos.length > 0 && (

                            <button
                                type="button"
                                className="dashboard-view-all"
                                onClick={() =>
                                    window.location.href =
                                        "/gallery"
                                }
                            >

                                View all

                                <ArrowRight
                                    size={15}
                                />

                            </button>

                        )}

                    </div>


                    {recentPhotos.length === 0 ? (

                        <div className="dashboard-empty">

                            <div className="dashboard-empty-icon">

                                <Images
                                    size={25}
                                />

                            </div>


                            <h3>
                                No memories yet
                            </h3>


                            <p>
                                Upload your first
                                photo to get started.
                            </p>


                            <button
                                type="button"
                                onClick={() =>
                                    setUploadOpen(true)
                                }
                            >

                                <Upload
                                    size={16}
                                />

                                Upload Photo

                            </button>

                        </div>

                    ) : (

                        <div className="dashboard-photo-grid">

                            {recentPhotos.map(
                                photo => (

                                <DashboardPhoto
                                    key={
                                        photo._id
                                    }
                                    photo={
                                        photo
                                    }
                                    onOpen={
                                        handleOpenPhoto
                                    }
                                    onFavorite={
                                        handleDashboardFavorite
                                    }
                                    onDelete={
                                        handleDashboardDelete
                                    }
                                />

                            ))}

                        </div>

                    )}

                </section>


                {/* =====================================
                    FOLDERS
                ===================================== */}

                {recentFolders.length > 0 && (

                    <section className="dashboard-section">

                        <div className="dashboard-section-header">

                            <div>

                                <p className="dashboard-section-eyebrow">

                                    <Folder
                                        size={14}
                                    />

                                    Your collection

                                </p>


                                <h2>
                                    Folders
                                </h2>

                            </div>


                            <button
                                type="button"
                                className="dashboard-view-all"
                                onClick={() =>
                                    window.location.href =
                                        "/folders"
                                }
                            >

                                View all

                                <ArrowRight
                                    size={15}
                                />

                            </button>

                        </div>


                        <div className="dashboard-folder-grid">

                            {recentFolders.map(
                                folder => (

                                <button
                                    type="button"
                                    className="dashboard-folder-card"
                                    key={
                                        folder._id
                                    }
                                    onClick={() =>
                                        window.location.href =
                                            `/folders/${folder._id}`
                                    }
                                >

                                    <div className="dashboard-folder-icon">

                                        <Folder
                                            size={22}
                                        />

                                    </div>


                                    <div>

                                        <strong>
                                            {
                                                folder.name
                                            }
                                        </strong>


                                        <span>

                                            {
                                                folder.photoCount ||
                                                0
                                            }

                                            {" "}

                                            {
                                                (
                                                    folder.photoCount ||
                                                    0
                                                ) === 1
                                                    ? "photo"
                                                    : "photos"
                                            }

                                        </span>

                                    </div>


                                    <ArrowRight
                                        size={17}
                                    />

                                </button>

                            ))}

                        </div>

                    </section>

                )}


                {/* =====================================
                    FAVORITES
                ===================================== */}

                {favoritePhotos.length > 0 && (

                    <section className="dashboard-section">

                        <div className="dashboard-section-header">

                            <div>

                                <p className="dashboard-section-eyebrow">

                                    <Heart
                                        size={14}
                                    />

                                    Your favorites

                                </p>


                                <h2>
                                    Favorite Memories
                                </h2>

                            </div>


                            <button
                                type="button"
                                className="dashboard-view-all"
                                onClick={() =>
                                    window.location.href =
                                        "/favorites"
                                }
                            >

                                View all

                                <ArrowRight
                                    size={15}
                                />

                            </button>

                        </div>


                        <div className="dashboard-favorite-grid">

                            {favoritePhotos.map(
                                photo => (

                                <DashboardPhoto
                                    key={
                                        photo._id
                                    }
                                    photo={
                                        photo
                                    }
                                    onOpen={
                                        handleOpenPhoto
                                    }
                                    onFavorite={
                                        handleDashboardFavorite
                                    }
                                    onDelete={
                                        handleDashboardDelete
                                    }
                                />

                            ))}

                        </div>

                    </section>

                )}


            </div>


            {/* =========================================
                DELETE CONFIRMATION MODAL
            ========================================= */}

            {deleteConfirmPhoto && (

                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-photo-title"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCancelDashboardDelete();
                        }
                    }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 10000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "16px",
                        background: "rgba(0, 0, 0, 0.55)",
                        backdropFilter: "blur(6px)"
                    }}
                >

                    <div
                        style={{
                            position: "relative",
                            width: "min(430px, 100%)",
                            maxHeight: "calc(100vh - 32px)",
                            overflowY: "auto",
                            padding: "26px",
                            border: "1px solid var(--border)",
                            borderRadius: "20px",
                            background: "var(--surface)",
                            color: "var(--text)",
                            boxShadow: "0 24px 70px rgba(0, 0, 0, 0.25)",
                            textAlign: "center",
                            boxSizing: "border-box"
                        }}
                    >

                        <button
                            type="button"
                            onClick={handleCancelDashboardDelete}
                            disabled={deleteLoading}
                            aria-label="Close"
                            style={{
                                position: "absolute",
                                top: "12px",
                                right: "12px",
                                width: "34px",
                                height: "34px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "none",
                                borderRadius: "10px",
                                background: "var(--surface-soft)",
                                color: "var(--text-secondary)",
                                cursor: deleteLoading ? "not-allowed" : "pointer",
                                opacity: deleteLoading ? 0.5 : 1
                            }}
                        >
                            <X size={17} />
                        </button>


                        <div
                            style={{
                                width: "54px",
                                height: "54px",
                                margin: "0 auto 18px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "16px",
                                background: "rgba(220, 38, 38, 0.10)",
                                color: "#dc2626"
                            }}
                        >
                            <Trash2 size={25} />
                        </div>


                        <h2
                            id="delete-photo-title"
                            style={{
                                margin: "0 0 9px",
                                fontSize: "21px",
                                lineHeight: 1.25,
                                letterSpacing: "-0.02em"
                            }}
                        >
                            Move to Recycle Bin?
                        </h2>


                        <p
                            style={{
                                margin: "0 auto 20px",
                                maxWidth: "350px",
                                color: "var(--text-secondary)",
                                fontSize: "13px",
                                lineHeight: 1.65,
                                overflowWrap: "anywhere"
                            }}
                        >
                            This photo will be moved to the Recycle Bin.
                            You can restore it later if needed.
                        </p>


                        {deleteError && (

                            <div
                                style={{
                                    marginBottom: "16px",
                                    padding: "10px 12px",
                                    borderRadius: "10px",
                                    background: "rgba(220, 38, 38, 0.08)",
                                    color: "#dc2626",
                                    fontSize: "12px",
                                    lineHeight: 1.5
                                }}
                            >
                                {deleteError}
                            </div>

                        )}


                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                width: "100%"
                            }}
                        >

                            <button
                                type="button"
                                onClick={handleCancelDashboardDelete}
                                disabled={deleteLoading}
                                style={{
                                    flex: 1,
                                    minHeight: "44px",
                                    padding: "10px 14px",
                                    border: "1px solid var(--border)",
                                    borderRadius: "11px",
                                    background: "var(--surface)",
                                    color: "var(--text)",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    cursor: deleteLoading ? "not-allowed" : "pointer",
                                    opacity: deleteLoading ? 0.55 : 1
                                }}
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                onClick={handleConfirmDashboardDelete}
                                disabled={deleteLoading}
                                style={{
                                    flex: 1,
                                    minHeight: "44px",
                                    padding: "10px 14px",
                                    border: "none",
                                    borderRadius: "11px",
                                    background: "#dc2626",
                                    color: "#ffffff",
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    cursor: deleteLoading ? "not-allowed" : "pointer",
                                    opacity: deleteLoading ? 0.65 : 1
                                }}
                            >
                                {deleteLoading
                                    ? "Moving..."
                                    : "Move to Recycle Bin"
                                }
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =========================================
                UPLOAD MODAL
            ========================================= */}

            <UploadModal
                isOpen={
                    uploadOpen
                }
                onClose={() =>
                    setUploadOpen(
                        false
                    )
                }
                onUploadSuccess={
                    fetchDashboardData
                }
            />


            {/* =========================================
                PHOTO VIEWER
            ========================================= */}

            {viewerOpen &&
                selectedPhoto && (

                <PhotoViewer
                    photo={
                        selectedPhoto
                    }
                    photos={
                        viewerPhotos
                    }
                    onClose={
                        handleCloseViewer
                    }
                    onFavoriteChange={
                        handleFavoriteChange
                    }
                    onPhotoDeleted={
                        handlePhotoDeleted
                    }
                />

            )}

        </main>

    );

}


// =====================================================
// DASHBOARD PHOTO
// =====================================================

function DashboardPhoto({
    photo,
    onOpen,
    onFavorite,
    onDelete
}) {

    const [imageUrl, setImageUrl] =
        useState("");

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        let objectUrl = null;

        let cancelled = false;


        const loadImage = async () => {

            try {

                setLoading(true);


                const response =
                    await api.get(

                        `/api/photos/${photo._id}/image`,

                        {
                            responseType:
                                "blob"
                        }

                    );


                if (
                    cancelled
                ) {

                    return;

                }


                objectUrl =
                    URL.createObjectURL(
                        response.data
                    );


                setImageUrl(
                    objectUrl
                );

            } catch (error) {

                console.error(
                    "DASHBOARD IMAGE ERROR:",
                    error
                );

            } finally {

                if (
                    !cancelled
                ) {

                    setLoading(false);

                }

            }

        };


        loadImage();


        return () => {

            cancelled = true;


            if (
                objectUrl
            ) {

                URL.revokeObjectURL(
                    objectUrl
                );

            }

        };

    }, [
        photo._id
    ]);


    // =================================================
    // FAVORITE
    // =================================================

    const handleFavoriteClick = (
        event
    ) => {

        event.stopPropagation();

        onFavorite(
            photo
        );

    };


    // =================================================
    // DELETE
    // =================================================

    const handleDeleteClick = (
        event
    ) => {

        event.stopPropagation();

        onDelete(
            photo
        );

    };


    // =================================================
    // RENDER
    // =================================================

    return (

        <article
            className="dashboard-photo-card"
            onClick={() =>
                onOpen(photo)
            }
        >


            {/* IMAGE */}

            {loading ? (

                <div className="dashboard-photo-loading">

                    <div className="dashboard-mini-spinner" />

                </div>

            ) : imageUrl ? (

                <img
                    src={
                        imageUrl
                    }
                    alt={
                        photo.title ||
                        photo.fileName ||
                        "Memory"
                    }
                />

            ) : (

                <div className="dashboard-photo-error">

                    <Images
                        size={25}
                    />

                </div>

            )}


            {/* ACTION BUTTONS */}

            <div className="dashboard-photo-actions">


                {/* FAVORITE */}

                <button
                    type="button"
                    className={
                        photo.isFavorite
                            ? "dashboard-photo-action dashboard-photo-favorite active"
                            : "dashboard-photo-action dashboard-photo-favorite"
                    }
                    onClick={
                        handleFavoriteClick
                    }
                    aria-label={
                        photo.isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                    }
                >

                    <Heart
                        size={17}
                        fill={
                            photo.isFavorite
                                ? "currentColor"
                                : "none"
                        }
                    />

                </button>


                {/* DELETE */}

                <button
                    type="button"
                    className="dashboard-photo-action dashboard-photo-delete"
                    onClick={
                        handleDeleteClick
                    }
                    aria-label="Move to recycle bin"
                >

                    <Trash2
                        size={17}
                    />

                </button>


            </div>


            {/* PHOTO INFO */}

            <div className="dashboard-photo-overlay">

                <strong>

                    {
                        photo.title ||
                        photo.fileName ||
                        "Memory"
                    }

                </strong>


                {photo.folder?.name && (

                    <span>

                        {
                            photo.folder.name
                        }

                    </span>

                )}

            </div>


        </article>

    );

}


export default Dashboard;