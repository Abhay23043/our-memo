import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Heart,
    Upload,
    Image as ImageIcon,
    Trash2,
    Search,
    X,
    Folder
} from "lucide-react";

import api from "../services/api";

import UploadModal from "../components/UploadModal";

import PhotoViewer from "../components/PhotoViewer";


function Gallery() {

    // =================================================
    // PHOTOS
    // =================================================

    const [photos, setPhotos] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    // =================================================
    // UPLOAD
    // =================================================

    const [uploadOpen, setUploadOpen] =
        useState(false);


    // =================================================
    // PHOTO VIEWER
    // =================================================

    const [viewerOpen, setViewerOpen] =
        useState(false);


    const [selectedPhoto, setSelectedPhoto] =
        useState(null);


    // =================================================
    // SEARCH
    // =================================================

    const [search, setSearch] =
        useState("");


    // =================================================
    // FILTERS
    // =================================================

    const [selectedFolder, setSelectedFolder] =
        useState("all");


    const [selectedFilter, setSelectedFilter] =
        useState("all");

    const [sortBy, setSortBy] =
        useState("newest");


    // =================================================
    // FETCH PHOTOS
    // =================================================

    const fetchPhotos = async () => {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    "/api/photos"
                );


            if (
                response.data.success
            ) {

                setPhotos(
                    response.data.photos || []
                );

            } else {

                setError(
                    response.data.message ||
                    "Unable to load photos"
                );

            }

        } catch (error) {

            console.error(
                "FETCH PHOTOS ERROR:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Unable to load photos"
            );

        } finally {

            setLoading(false);

        }

    };


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        fetchPhotos();

    }, []);


    // =================================================
    // UNIQUE FOLDERS
    // =================================================

    const folders = useMemo(() => {

        const folderMap =
            new Map();


        photos.forEach(
            photo => {

                if (
                    photo.folder?._id &&
                    photo.folder?.name
                ) {

                    folderMap.set(
                        String(
                            photo.folder._id
                        ),
                        {
                            _id:
                                photo.folder._id,

                            name:
                                photo.folder.name
                        }
                    );

                }

            }
        );


        return Array.from(
            folderMap.values()
        ).sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );

    }, [photos]);


    // =================================================
    // FILTERED PHOTOS
    // =================================================

    const filteredPhotos = useMemo(() => {

        let result =
            [...photos];


        // =============================================
        // SEARCH
        // =============================================

        const searchValue =
            search
                .trim()
                .toLowerCase()
                .replace(
                    /\s+/g,
                    " "
                );


        if (
            searchValue
        ) {

            // Support multiple words.
            // Example:
            // "trip photo"
            //
            // Every word must exist somewhere
            // in title / filename / folder.

            const searchWords =
                searchValue
                    .split(" ")
                    .filter(Boolean);


            result =
                result.filter(
                    photo => {

                        const title =
                            String(
                                photo.title || ""
                            )
                            .toLowerCase();


                        const fileName =
                            String(
                                photo.fileName || ""
                            )
                            .toLowerCase();


                        const folderName =
                            String(
                                photo.folder?.name ||
                                ""
                            )
                            .toLowerCase();


                        const searchableText =
                            `${title} ${fileName} ${folderName}`;


                        return searchWords.every(
                            word =>
                                searchableText.includes(
                                    word
                                )
                        );

                    }
                );

        }


        // =============================================
        // FOLDER FILTER
        // =============================================

        if (
            selectedFolder !== "all"
        ) {

            result =
                result.filter(
                    photo =>
                        String(
                            photo.folder?._id
                        ) ===
                        String(
                            selectedFolder
                        )
                );

        }


        // =============================================
        // FAVORITE FILTER
        // =============================================

        if (
            selectedFilter ===
            "favorites"
        ) {

            result =
                result.filter(
                    photo =>
                        Boolean(
                            photo.isFavorite
                        )
                );

        }


        // =============================================
        // RECENT FILTER
        // =============================================

        if (selectedFilter === "recent") {
            result = [...result].sort((first, second) => {
                const firstDate = new Date(first.createdAt || 0).getTime();
                const secondDate = new Date(second.createdAt || 0).getTime();
                return secondDate - firstDate;
            });
        }

        // =============================================
        // SORT
        // =============================================

        result = [...result].sort((first, second) => {
            if (sortBy === "az" || sortBy === "za") {
                const firstName = String(first.title || first.fileName || "Memory").toLowerCase();
                const secondName = String(second.title || second.fileName || "Memory").toLowerCase();
                const comparison = firstName.localeCompare(secondName, undefined, { numeric: true });
                return sortBy === "az" ? comparison : -comparison;
            }

            const firstDate = new Date(first.createdAt || 0).getTime();
            const secondDate = new Date(second.createdAt || 0).getTime();
            return sortBy === "oldest" ? firstDate - secondDate : secondDate - firstDate;
        });

        return result;

    }, [
        photos,
        search,
        selectedFolder,
        selectedFilter,
        sortBy
    ]);


    // =================================================
    // FAVORITE CHANGE
    // =================================================

    const handleFavoriteChange = (
        photoId,
        newFavoriteValue
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
                                    newFavoriteValue

                            };

                        }


                        return photo;

                    }
                )
        );


        // Keep viewer synchronized

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
                        newFavoriteValue

                };

            }
        );

    };


    // =================================================
    // PHOTO DELETED
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


        setViewerOpen(false);

        setSelectedPhoto(null);

    };


    // =================================================
    // OPEN VIEWER
    // =================================================

    const handleOpenViewer = (
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
    // CLEAR SEARCH
    // =================================================

    const clearSearch = () => {

        setSearch("");

    };


    // =================================================
    // RESET FILTERS
    // =================================================

    const resetFilters = () => {

        setSearch("");

        setSelectedFolder("all");

        setSelectedFilter("all");

    };


    // =================================================
    // ACTIVE FILTER CHECK
    // =================================================

    const hasActiveFilters =
        search.trim() !== "" ||
        selectedFolder !== "all" ||
        selectedFilter !== "all" ||
        sortBy !== "newest";


    // =================================================
    // MAIN UI
    // =================================================

    return (

        <main className="gallery-page">

            <div className="gallery-container">


                {/* =====================================
                    HEADER
                ===================================== */}

                <div className="gallery-header">

                    <div>

                        <p className="gallery-eyebrow">

                            Our memories

                        </p>


                        <h1>

                            Your Photos

                        </h1>


                        <p className="gallery-description">

                            All your beautiful moments,
                            kept in one place.

                        </p>

                    </div>


                    <button
                        className="upload-button"
                        type="button"
                        onClick={() =>
                            setUploadOpen(true)
                        }
                    >

                        <Upload
                            size={18}
                        />

                        <span>
                            Upload
                        </span>

                    </button>

                </div>


                {/* =====================================
                    SEARCH + FILTERS
                ===================================== */}

                {!loading &&
                    photos.length > 0 && (

                    <div className="gallery-toolbar">


                        {/* SEARCH */}

                        <div className="gallery-search">

                            <Search
                                size={18}
                            />


                            <input
                                type="text"
                                value={search}
                                onChange={
                                    event =>
                                        setSearch(
                                            event.target.value
                                        )
                                }
                                placeholder="
                                    Search title,
                                    filename or folder...
                                "
                                aria-label="
                                    Search photos
                                "
                            />


                            {search && (

                                <button
                                    type="button"
                                    onClick={
                                        clearSearch
                                    }
                                    aria-label="
                                        Clear search
                                    "
                                >

                                    <X
                                        size={16}
                                    />

                                </button>

                            )}

                        </div>


                        {/* FOLDER FILTER */}

                        <div className="gallery-filter">

                            <Folder
                                size={16}
                            />


                            <select
                                value={
                                    selectedFolder
                                }
                                onChange={
                                    event =>
                                        setSelectedFolder(
                                            event.target.value
                                        )
                                }
                                aria-label="
                                    Filter by folder
                                "
                            >

                                <option value="all">

                                    All Folders

                                </option>


                                {folders.map(
                                    folder => (

                                    <option
                                        key={
                                            folder._id
                                        }
                                        value={
                                            folder._id
                                        }
                                    >

                                        {
                                            folder.name
                                        }

                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* PHOTO TYPE */}

                        <div className="gallery-filter">

                            <Heart
                                size={16}
                            />


                            <select
                                value={
                                    selectedFilter
                                }
                                onChange={
                                    event =>
                                        setSelectedFilter(
                                            event.target.value
                                        )
                                }
                                aria-label="
                                    Filter photos
                                "
                            >

                                <option value="all">

                                    All Photos

                                </option>


                                <option value="favorites">

                                    Favorites

                                </option>


                                <option value="recent">

                                    Recent

                                </option>

                            </select>

                        </div>

                        {/* SORT */}

                        <div className="gallery-filter">

                            <select
                                value={sortBy}
                                onChange={
                                    event =>
                                        setSortBy(
                                            event.target.value
                                        )
                                }
                                aria-label="Sort photos"
                            >
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                                <option value="az">A → Z</option>
                                <option value="za">Z → A</option>
                            </select>

                        </div>

                    </div>

                )}


                {/* =====================================
                    FILTER SUMMARY
                ===================================== */}

                {!loading &&
                    photos.length > 0 && (

                    <div className="gallery-filter-summary">

                        <span>

                            Showing{" "}

                            <strong>
                                {
                                    filteredPhotos.length
                                }
                            </strong>

                            {" "}of{" "}

                            <strong>
                                {
                                    photos.length
                                }
                            </strong>

                            {" "}photos

                        </span>


                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={
                                    resetFilters
                                }
                            >

                                Clear filters

                            </button>
                        )}

                    </div>

                )}


                {/* =====================================
                    ERROR
                ===================================== */}

                {error && (

                    <div className="gallery-error">

                        {error}

                    </div>

                )}


                {/* =====================================
                    LOADING
                ===================================== */}

                {loading && (

                    <div className="photo-grid">

                        {Array.from({
                            length: 8
                        }).map(
                            (_, index) => (

                            <div
                                className="photo-skeleton"
                                key={index}
                            />

                        ))}

                    </div>

                )}


                {/* =====================================
                    EMPTY GALLERY
                ===================================== */}

                {!loading &&
                    !error &&
                    photos.length === 0 && (

                    <div className="empty-state">

                        <div className="empty-icon">

                            <ImageIcon
                                size={28}
                            />

                        </div>


                        <h2>

                            No memories yet

                        </h2>


                        <p>

                            Upload your first photo
                            to start your collection.

                        </p>

                    </div>

                )}


                {/* =====================================
                    NO SEARCH RESULT
                ===================================== */}

                {!loading &&
                    !error &&
                    photos.length > 0 &&
                    filteredPhotos.length === 0 && (

                    <div className="empty-state">

                        <div className="empty-icon">

                            <Search
                                size={28}
                            />

                        </div>


                        <h2>

                            No photos found

                        </h2>


                        <p>

                            No photo matches your
                            current search or filters.

                        </p>


                        <button
                            type="button"
                            className="empty-reset-button"
                            onClick={
                                resetFilters
                            }
                        >

                            Clear filters

                        </button>

                    </div>

                )}


                {/* =====================================
                    PHOTOS
                ===================================== */}

                {!loading &&
                    !error &&
                    filteredPhotos.length > 0 && (

                    <div className="photo-grid">

                        {filteredPhotos.map(
                            photo => (

                            <PhotoCard
                                key={
                                    photo._id
                                }
                                photo={
                                    photo
                                }
                                onOpen={
                                    handleOpenViewer
                                }
                                onFavoriteChange={
                                    handleFavoriteChange
                                }
                                onPhotoDeleted={
                                    handlePhotoDeleted
                                }
                            />

                        ))}

                    </div>

                )}

            </div>


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
                    fetchPhotos
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
                        filteredPhotos
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
// PHOTO CARD
// =====================================================

function PhotoCard({
    photo,
    onOpen,
    onFavoriteChange,
    onPhotoDeleted
}) {

    const [imageUrl, setImageUrl] =
        useState(null);


    const [favoriteLoading, setFavoriteLoading] =
        useState(false);


    const [deleteLoading, setDeleteLoading] =
        useState(false);


    // =================================================
    // LOAD IMAGE
    // =================================================

    useEffect(() => {

        let objectUrl = null;

        let cancelled = false;


        const loadImage = async () => {

            try {

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
                    "IMAGE LOAD ERROR:",
                    error
                );

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

    const handleFavorite = async (
        event
    ) => {

        event.preventDefault();

        event.stopPropagation();


        if (
            favoriteLoading ||
            deleteLoading
        ) {

            return;

        }


        const oldValue =
            Boolean(
                photo.isFavorite
            );


        const newValue =
            !oldValue;


        // =============================================
        // INSTANT UI
        // =============================================

        onFavoriteChange(
            photo._id,
            newValue
        );


        setFavoriteLoading(
            true
        );


        try {

            const response =
                await api.patch(

                    `/api/photos/${photo._id}/favorite`

                );


            if (
                !response.data.success
            ) {

                onFavoriteChange(
                    photo._id,
                    oldValue
                );

                return;

            }


            if (
                typeof
                response.data.isFavorite ===
                "boolean"
            ) {

                onFavoriteChange(
                    photo._id,
                    response.data.isFavorite
                );

            }

        } catch (error) {

            console.error(
                "FAVORITE API ERROR:",
                error
            );


            onFavoriteChange(
                photo._id,
                oldValue
            );

        } finally {

            setFavoriteLoading(
                false
            );

        }

    };


    // =================================================
    // DELETE
    // =================================================

    const handleDelete = async (
        event
    ) => {

        event.preventDefault();

        event.stopPropagation();


        if (
            deleteLoading ||
            favoriteLoading
        ) {

            return;

        }


        const confirmed =
            window.confirm(
                "Move this photo to Recycle Bin?"
            );


        if (
            !confirmed
        ) {

            return;

        }


        try {

            setDeleteLoading(
                true
            );


            const response =
                await api.delete(

                    `/api/photos/${photo._id}`

                );


            if (
                response.data.success
            ) {

                onPhotoDeleted(
                    photo._id
                );

            } else {

                alert(
                    response.data.message ||
                    "Unable to move photo to Recycle Bin"
                );

            }

        } catch (error) {

            console.error(
                "DELETE PHOTO ERROR:",
                error
            );


            alert(
                error.response?.data?.message ||
                "Unable to move photo to Recycle Bin"
            );

        } finally {

            setDeleteLoading(
                false
            );

        }

    };


    // =================================================
    // OPEN VIEWER
    // =================================================

    const handleOpen = () => {

        if (
            deleteLoading ||
            favoriteLoading
        ) {

            return;

        }


        onOpen(
            photo
        );

    };


    // =================================================
    // KEYBOARD OPEN
    // =================================================

    const handleCardKeyDown = (
        event
    ) => {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            handleOpen();

        }

    };


    // =================================================
    // RENDER
    // =================================================

    return (

        <article
            className="photo-card"
            onClick={
                handleOpen
            }
            role="button"
            tabIndex={0}
            onKeyDown={
                handleCardKeyDown
            }
        >

            <div className="photo-image-wrapper">

                {/* IMAGE */}

                {imageUrl ? (

                    <img
                        src={
                            imageUrl
                        }
                        alt={
                            photo.title ||
                            photo.fileName ||
                            "Memory"
                        }
                        className="photo-image"
                        draggable="false"
                    />

                ) : (

                    <div className="photo-loading">

                        <div
                            className="image-spinner"
                        />

                    </div>

                )}


                {/* HEART */}

                <button
                    type="button"
                    className={
                        `favorite-button ${
                            photo.isFavorite
                                ? "favorite-active"
                                : ""
                        }`
                    }
                    aria-label={
                        photo.isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                    }
                    onClick={
                        handleFavorite
                    }
                    disabled={
                        favoriteLoading ||
                        deleteLoading
                    }
                >

                    <Heart
                        size={19}
                        fill={
                            photo.isFavorite
                                ? "currentColor"
                                : "none"
                        }
                    />

                </button>


                {/* TRASH */}

                <button
                    type="button"
                    className="photo-trash-button"
                    aria-label={
                        deleteLoading
                            ? "Deleting photo"
                            : "Move to recycle bin"
                    }
                    onClick={
                        handleDelete
                    }
                    disabled={
                        deleteLoading ||
                        favoriteLoading
                    }
                >

                    <Trash2
                        size={19}
                    />

                </button>

            </div>


            {/* PHOTO INFO */}

            <div className="photo-info">

                <h3>

                    {photo.title ||
                        photo.fileName ||
                        "Memory"}

                </h3>


                {photo.folder && (

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


export default Gallery;