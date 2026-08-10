import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    X,
    ChevronLeft,
    ChevronRight,
    Heart,
    Trash2,
    Folder
} from "lucide-react";

import api from "../services/api";


function PhotoViewer({
    photo,
    photos = [],
    onClose,
    onFavoriteChange,
    onPhotoDeleted
}) {

    // =================================================
    // CURRENT PHOTO INDEX
    // =================================================

    const getPhotoIndex = useCallback(
        (photoToFind) => {

            if (
                !photoToFind?._id ||
                photos.length === 0
            ) {

                return 0;

            }


            const index =
                photos.findIndex(
                    item =>
                        String(item._id) ===
                        String(photoToFind._id)
                );


            return index >= 0
                ? index
                : 0;

        },
        [photos]
    );


    const [currentIndex, setCurrentIndex] =
        useState(
            () =>
                getPhotoIndex(photo)
        );


    // =================================================
    // FAVORITE STATE
    // =================================================

    const [isFavorite, setIsFavorite] =
        useState(
            Boolean(
                photo?.isFavorite
            )
        );


    const [favoriteLoading, setFavoriteLoading] =
        useState(false);


    // =================================================
    // IMAGE STATE
    // =================================================

    const [imageUrl, setImageUrl] =
        useState("");


    const [loading, setLoading] =
        useState(true);


    const [imageError, setImageError] =
        useState(false);


    // =================================================
    // DELETE STATE
    // =================================================

    const [deleting, setDeleting] =
        useState(false);


    // =================================================
    // CURRENT PHOTO
    // =================================================

    const currentPhoto =
        photos[currentIndex] ||
        photo;


    // =================================================
    // UPDATE INDEX WHEN INITIAL PHOTO CHANGES
    // =================================================

    useEffect(() => {

        setCurrentIndex(
            getPhotoIndex(photo)
        );

    }, [
        photo?._id,
        getPhotoIndex
    ]);


    // =================================================
    // KEEP INDEX VALID
    // =================================================

    useEffect(() => {

        if (
            photos.length === 0
        ) {

            setCurrentIndex(0);

            return;

        }


        if (
            currentIndex >= photos.length
        ) {

            setCurrentIndex(
                photos.length - 1
            );

        }

    }, [
        photos.length,
        currentIndex
    ]);


    // =================================================
    // UPDATE FAVORITE WHEN PHOTO CHANGES
    // =================================================

    useEffect(() => {

        setIsFavorite(
            Boolean(
                currentPhoto?.isFavorite
            )
        );

        setFavoriteLoading(false);

    }, [
        currentPhoto?._id,
        currentPhoto?.isFavorite
    ]);


    // =================================================
    // LOAD CURRENT IMAGE
    // =================================================

    useEffect(() => {

        let objectUrl = null;

        let cancelled = false;


        const loadImage = async () => {

            if (
                !currentPhoto?._id
            ) {

                setLoading(false);

                return;

            }


            try {

                setLoading(true);

                setImageError(false);

                setImageUrl("");


                const response =
                    await api.get(

                        `/api/photos/${currentPhoto._id}/image`,

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

                if (
                    cancelled
                ) {

                    return;

                }


                console.error(
                    "VIEWER IMAGE ERROR:",
                    error
                );


                setImageUrl("");

                setImageError(true);

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
        currentPhoto?._id
    ]);


    // =================================================
    // PREVIOUS PHOTO
    // =================================================

    const handlePrevious =
        useCallback(() => {

            if (
                photos.length <= 1 ||
                deleting
            ) {

                return;

            }


            setCurrentIndex(
                previousIndex => {

                    if (
                        previousIndex === 0
                    ) {

                        return (
                            photos.length - 1
                        );

                    }


                    return (
                        previousIndex - 1
                    );

                }
            );

        }, [
            photos.length,
            deleting
        ]);


    // =================================================
    // NEXT PHOTO
    // =================================================

    const handleNext =
        useCallback(() => {

            if (
                photos.length <= 1 ||
                deleting
            ) {

                return;

            }


            setCurrentIndex(
                previousIndex => {

                    if (
                        previousIndex ===
                        photos.length - 1
                    ) {

                        return 0;

                    }


                    return (
                        previousIndex + 1
                    );

                }
            );

        }, [
            photos.length,
            deleting
        ]);


    // =================================================
    // FAVORITE
    // =================================================

    const handleFavorite =
        async () => {

            if (
                !currentPhoto?._id ||
                favoriteLoading ||
                deleting
            ) {

                return;

            }


            const previousStatus =
                isFavorite;


            const newStatus =
                !previousStatus;


            // =========================================
            // INSTANT UI UPDATE
            // =========================================

            setIsFavorite(
                newStatus
            );


            setFavoriteLoading(
                true
            );


            // =========================================
            // UPDATE PARENT IMMEDIATELY
            // =========================================

            if (
                onFavoriteChange
            ) {

                onFavoriteChange(
                    currentPhoto._id,
                    newStatus
                );

            }


            try {

                const response =
                    await api.patch(

                        `/api/photos/${currentPhoto._id}/favorite`

                    );


                if (
                    !response.data.success
                ) {

                    throw new Error(
                        response.data.message ||
                        "Favorite update failed"
                    );

                }


                // =====================================
                // USE BACKEND VALUE
                // =====================================

                if (
                    typeof
                    response.data.isFavorite ===
                    "boolean"
                ) {

                    const finalValue =
                        response.data.isFavorite;


                    setIsFavorite(
                        finalValue
                    );


                    if (
                        onFavoriteChange
                    ) {

                        onFavoriteChange(
                            currentPhoto._id,
                            finalValue
                        );

                    }

                }

            } catch (error) {

                console.error(
                    "FAVORITE ERROR:",
                    error
                );


                // =====================================
                // ROLLBACK
                // =====================================

                setIsFavorite(
                    previousStatus
                );


                if (
                    onFavoriteChange
                ) {

                    onFavoriteChange(
                        currentPhoto._id,
                        previousStatus
                    );

                }

            } finally {

                setFavoriteLoading(
                    false
                );

            }

        };


    // =================================================
    // DELETE / RECYCLE BIN
    // =================================================

    const handleDelete =
        async () => {

            if (
                !currentPhoto?._id ||
                deleting
            ) {

                return;

            }


            const shouldDelete =
                window.confirm(
                    "Move this photo to Recycle Bin?"
                );


            if (
                !shouldDelete
            ) {

                return;

            }


            try {

                setDeleting(
                    true
                );


                const response =
                    await api.delete(

                        `/api/photos/${currentPhoto._id}`

                    );


                if (
                    !response.data.success
                ) {

                    alert(
                        response.data.message ||
                        "Unable to move photo to recycle bin."
                    );

                    setDeleting(
                        false
                    );

                    return;

                }


                // =========================================
                // TELL PARENT TO REMOVE PHOTO
                // =========================================

                if (
                    onPhotoDeleted
                ) {

                    onPhotoDeleted(
                        currentPhoto._id
                    );

                }


                // =========================================
                // CLOSE VIEWER
                // =========================================

                onClose();

            } catch (error) {

                console.error(
                    "DELETE PHOTO ERROR:",
                    error
                );


                alert(
                    error.response?.data?.message ||
                    "Unable to move photo to recycle bin."
                );

            } finally {

                setDeleting(
                    false
                );

            }

        };


    // =================================================
    // KEYBOARD CONTROLS
    // =================================================

    useEffect(() => {

        const handleKeyboard =
            event => {

                // Ignore keyboard shortcuts
                // while typing

                const target =
                    event.target;


                const isTyping =
                    target?.tagName === "INPUT" ||
                    target?.tagName === "TEXTAREA" ||
                    target?.isContentEditable;


                if (
                    isTyping
                ) {

                    return;

                }


                // =====================================
                // ESC
                // =====================================

                if (
                    event.key === "Escape"
                ) {

                    if (
                        !deleting
                    ) {

                        onClose();

                    }

                    return;

                }


                // =====================================
                // LEFT
                // =====================================

                if (
                    event.key === "ArrowLeft"
                ) {

                    event.preventDefault();

                    handlePrevious();

                    return;

                }


                // =====================================
                // RIGHT
                // =====================================

                if (
                    event.key === "ArrowRight"
                ) {

                    event.preventDefault();

                    handleNext();

                    return;

                }

            };


        document.addEventListener(
            "keydown",
            handleKeyboard
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleKeyboard
            );

        };

    }, [
        handlePrevious,
        handleNext,
        onClose,
        deleting
    ]);


    // =================================================
    // BACKDROP CLICK
    // =================================================

    const handleBackdropClick =
        event => {

            if (
                event.target ===
                event.currentTarget
            ) {

                if (
                    !deleting
                ) {

                    onClose();

                }

            }

        };


    // =================================================
    // RENDER
    // =================================================

    return (

        <div
            className="photo-viewer"
            onClick={
                handleBackdropClick
            }
        >


            {/* =========================================
                TOP BAR
            ========================================= */}

            <div
                className="photo-viewer-topbar"
            >


                {/* PHOTO INFO */}

                <div
                    className="photo-viewer-info"
                >

                    <strong>

                        {
                            currentPhoto?.title ||
                            currentPhoto?.fileName ||
                            "Memory"
                        }

                    </strong>


                    <div
                        className="photo-viewer-meta"
                    >

                        {/* FOLDER */}

                        {currentPhoto?.folder?.name && (

                            <span>

                                <Folder
                                    size={13}
                                />

                                {
                                    currentPhoto.folder.name
                                }

                            </span>

                        )}


                        {/* POSITION */}

                        {photos.length > 0 && (

                            <span>

                                {currentIndex + 1}

                                {" / "}

                                {photos.length}

                            </span>

                        )}

                    </div>

                </div>


                {/* ACTIONS */}

                <div
                    className="photo-viewer-actions"
                >


                    {/* FAVORITE */}

                    <button
                        type="button"
                        className={
                            `viewer-action-button ${
                                isFavorite
                                    ? "viewer-favorite-active"
                                    : ""
                            }`
                        }
                        onClick={
                            handleFavorite
                        }
                        aria-label={
                            isFavorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                        }
                        disabled={
                            deleting ||
                            favoriteLoading
                        }
                    >

                        <Heart
                            size={22}
                            fill={
                                isFavorite
                                    ? "currentColor"
                                    : "none"
                            }
                        />
                    </button>


                    {/* DELETE */}

                    <button
                        type="button"
                        className="
                            viewer-action-button
                            viewer-delete-button
                        "
                        onClick={
                            handleDelete
                        }
                        aria-label="
                            Move to recycle bin
                        "
                        disabled={
                            deleting ||
                            favoriteLoading
                        }
                    >

                        <Trash2
                            size={21}
                        />

                    </button>


                    {/* CLOSE */}

                    <button
                        type="button"
                        className="
                            viewer-action-button
                        "
                        onClick={
                            onClose
                        }
                        aria-label="
                            Close viewer
                        "
                        disabled={
                            deleting
                        }
                    >

                        <X
                            size={24}
                        />

                    </button>

                </div>

            </div>


            {/* =========================================
                PREVIOUS
            ========================================= */}

            {photos.length > 1 && (

                <button
                    type="button"
                    className="
                        viewer-navigation
                        viewer-previous
                    "
                    onClick={
                        handlePrevious
                    }
                    aria-label="
                        Previous photo
                    "
                    disabled={
                        deleting
                    }
                >

                    <ChevronLeft
                        size={32}
                    />

                </button>

            )}


            {/* =========================================
                IMAGE CONTENT
            ========================================= */}

            <div
                className="
                    photo-viewer-content
                "
            >


                {/* LOADING */}

                {loading && (

                    <div
                        className="
                            photo-viewer-loading
                        "
                    >

                        <div
                            className="
                                photo-spinner
                            "
                        />

                    </div>

                )}


                {/* ERROR */}

                {!loading &&
                    imageError && (

                    <div
                        className="
                            photo-viewer-image-error
                        "
                    >

                        <ImageErrorIcon />

                        <strong>
                            Unable to load photo
                        </strong>

                        <span>
                            Please try again.
                        </span>

                    </div>

                )}


                {/* IMAGE */}

                {!loading &&
                    !imageError &&
                    imageUrl && (

                    <img
                        src={
                            imageUrl
                        }
                        alt={
                            currentPhoto?.title ||
                            currentPhoto?.fileName ||
                            "Memory"
                        }
                        className="
                            photo-viewer-image
                        "
                        draggable="false"
                    />

                )}

            </div>


            {/* =========================================
                NEXT
            ========================================= */}

            {photos.length > 1 && (

                <button
                    type="button"
                    className="
                        viewer-navigation
                        viewer-next
                    "
                    onClick={
                        handleNext
                    }
                    aria-label="
                        Next photo
                    "
                    disabled={
                        deleting
                    }
                >

                    <ChevronRight
                        size={32}
                    />

                </button>

            )}


            {/* =========================================
                DELETE LOADING
            ========================================= */}

            {deleting && (

                <div
                    className="
                        photo-viewer-delete-overlay
                    "
                >

                    <div
                        className="
                            photo-spinner
                        "
                    />

                    <span>
                        Moving to Recycle Bin...
                    </span>

                </div>

            )}

        </div>

    );

}


// =====================================================
// IMAGE ERROR ICON
// =====================================================

function ImageErrorIcon() {

    return (

        <div
            className="
                photo-viewer-error-icon
            "
        >

            <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >

                <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                />

                <circle
                    cx="8.5"
                    cy="8.5"
                    r="1.5"
                />

                <path
                    d="m21 15-5-5L5 21"
                />

            </svg>

        </div>

    );

}


export default PhotoViewer;