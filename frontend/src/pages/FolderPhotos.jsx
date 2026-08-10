import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    ArrowLeft,
    Folder,
    Image as ImageIcon,
    MoreVertical,
    Heart,
    Trash2
} from "lucide-react";

import api from "../services/api";

import PhotoViewer
    from "../components/PhotoViewer";


function FolderPhotos() {

    const { folderId } = useParams();

    const navigate = useNavigate();


    // =========================================
    // STATES
    // =========================================

    const [folder, setFolder] =
        useState(null);

    const [photos, setPhotos] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // Photo viewer
    const [viewerOpen, setViewerOpen] =
        useState(false);

    const [selectedPhoto, setSelectedPhoto] =
        useState(null);


    // =========================================
    // LOAD FOLDER
    // =========================================

    useEffect(() => {

        const loadFolder = async () => {

            try {

                setLoading(true);

                setError("");


                // =====================================
                // GET FOLDER DETAILS
                // =====================================

                const folderResponse =
                    await api.get(
                        `/api/folders/${folderId}`
                    );


                console.log(
                    "FOLDER RESPONSE:",
                    folderResponse.data
                );


                if (
                    folderResponse.data.success
                ) {

                    setFolder(
                        folderResponse.data.folder
                    );

                } else {

                    throw new Error(
                        folderResponse.data.message ||
                        "Unable to load folder"
                    );

                }


                // =====================================
                // GET PHOTOS INSIDE FOLDER
                // =====================================

                const photosResponse =
                    await api.get(
                        `/api/photos/folder/${folderId}`
                    );


                console.log(
                    "FOLDER PHOTOS RESPONSE:",
                    photosResponse.data
                );


                if (
                    photosResponse.data.success
                ) {

                    setPhotos(
                        photosResponse.data.photos || []
                    );

                } else {

                    setPhotos([]);

                }

            } catch (error) {

                console.error(
                    "LOAD FOLDER ERROR:",
                    error
                );


                setError(
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to load folder"
                );

            } finally {

                setLoading(false);

            }

        };


        if (folderId) {

            loadFolder();

        }

    }, [folderId]);


    // =========================================
    // LOADING
    // =========================================

    if (loading) {

        return (

            <main className="folders-page">

                <div className="folders-container">

                    <div className="folder-loading">

                        Loading folder...

                    </div>

                </div>

            </main>

        );

    }


    // =========================================
    // ERROR
    // =========================================

    if (error) {

        return (

            <main className="folders-page">

                <div className="folders-container">

                    <button
                        type="button"
                        className="back-button"
                        onClick={() =>
                            navigate("/folders")
                        }
                    >

                        <ArrowLeft size={18} />

                        Back to Folders

                    </button>


                    <div className="gallery-error">

                        {error}

                    </div>

                </div>

            </main>

        );

    }


    // =========================================
    // MAIN PAGE
    // =========================================

    return (

        <>

            <main className="folders-page">

                <div className="folders-container">


                    {/* =================================
                        HEADER
                    ================================= */}

                    <div className="folders-header">

                        <div>

                            <button
                                type="button"
                                className="back-button"
                                onClick={() =>
                                    navigate("/folders")
                                }
                            >

                                <ArrowLeft size={18} />

                                Back to Folders

                            </button>


                            <div className="gallery-eyebrow">

                                <Folder size={16} />

                                <span>
                                    Folder
                                </span>

                            </div>


                            <h1>

                                {folder?.name ||
                                    "Folder"}

                            </h1>


                            <p className="gallery-description">

                                {photos.length}

                                {" "}

                                {photos.length === 1
                                    ? "photo"
                                    : "photos"}

                            </p>

                        </div>

                    </div>


                    {/* =================================
                        NO PHOTOS
                    ================================= */}

                    {photos.length === 0 && (

                        <div className="empty-state">

                            <div className="empty-icon">

                                <ImageIcon size={28} />

                            </div>


                            <h2>

                                No photos yet

                            </h2>


                            <p>

                                This folder doesn't
                                contain any photos.

                            </p>

                        </div>

                    )}


                    {/* =================================
                        PHOTOS
                    ================================= */}

                    {photos.length > 0 && (

                        <div className="photo-grid">

                            {photos.map((photo) => (

                                <div
                                    key={photo._id}
                                    onClick={() => {

                                        setSelectedPhoto(
                                            photo
                                        );

                                        setViewerOpen(
                                            true
                                        );

                                    }}
                                >

                                    <PhotoCard
                                        photo={photo}
                                    />

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </main>


            {/* =================================
                PHOTO VIEWER
            ================================= */}

            {viewerOpen &&
                selectedPhoto && (

                    <PhotoViewer
                        photo={selectedPhoto}
                        photos={photos}
                        onClose={() => {

                            setViewerOpen(
                                false
                            );

                            setSelectedPhoto(
                                null
                            );

                        }}
                    />

                )}

        </>

    );

}


// =========================================
// PHOTO CARD
// =========================================

function PhotoCard({ photo }) {
    const [menuOpen, setMenuOpen] =
        useState(false);

    const [isFavorite, setIsFavorite] =
        useState(Boolean(photo.isFavorite));

    const [imageUrl, setImageUrl] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(false);
        

    // =========================================
    // recycle bin
    // ========================================= 
  const handleFavorite = async (event) => {

    event.stopPropagation();

    const oldStatus = isFavorite;

    // Immediate UI update
    setIsFavorite(!oldStatus);

    try {

        const response =
            await api.patch(
                `/api/photos/${photo._id}/favorite`
            );

        if (
            response.data.success &&
            typeof response.data.isFavorite === "boolean"
        ) {

            setIsFavorite(
                response.data.isFavorite
            );

        } else {

            setIsFavorite(oldStatus);

        }

    } catch (error) {

        console.error(
            "FAVORITE ERROR:",
            error
        );

        setIsFavorite(oldStatus);

    }

};

    const handleDelete = async (event) => {

        event.stopPropagation();

        setMenuOpen(false);


        const confirmed =
            window.confirm(
                "Move this photo to Recycle Bin?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await api.delete(
                    `/api/photos/${photo._id}`
                );


            if (response.data.success) {

                // Temporary solution:
                // remove deleted photo after reload
                window.location.reload();

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

        }

    };
    // =========================================
    // LOAD IMAGE
    // =========================================

    useEffect(() => {

        let objectUrl = null;


        const loadImage = async () => {

            try {

                setLoading(true);

                setError(false);


                const response =
                    await api.get(
                        `/api/photos/${photo._id}/image`,
                        {
                            responseType: "blob"
                        }
                    );


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


                setError(true);

            } finally {

                setLoading(false);

            }

        };


        if (photo?._id) {

            loadImage();

        }


        return () => {

            if (objectUrl) {

                URL.revokeObjectURL(
                    objectUrl
                );

            }

        };

    }, [photo?._id]);


    // =========================================
    // PHOTO CARD UI
    // =========================================

    return (

    <div className="photo-card">

        {/* IMAGE LOADING */}

        {loading && (

            <div className="photo-loading">

                <div className="photo-spinner" />

                Loading...

            </div>

        )}


        {/* IMAGE ERROR */}

        {error && (

            <div className="photo-error">

                <ImageIcon size={28} />

                <span>
                    Unable to load photo
                </span>

            </div>

        )}


        {/* PHOTO IMAGE */}

        {imageUrl && !error && (

            <img
                src={imageUrl}
                alt={
                    photo.title ||
                    photo.fileName ||
                    "Memory"
                }
                loading="lazy"
            />

        )}


        {/* =================================
            THREE DOT BUTTON
        ================================= */}

        <button
            type="button"
            className="photo-menu-button"
            onClick={(event) => {

                event.stopPropagation();

                setMenuOpen(
                    previous => !previous
                );

            }}
        >

            <MoreVertical size={20} />

        </button>


        {/* =================================
            THREE DOT MENU
        ================================= */}

        {menuOpen && (

            <div
                className="photo-action-menu"
                onClick={(event) => {

                    event.stopPropagation();

                }}
            >

                {/* FAVORITE */}

                <button
                    type="button"
                    onClick={handleFavorite}
                >

                    <Heart
                        size={17}
                        fill={
                            isFavorite
                                ? "currentColor"
                                : "none"
                        }
                    />

                    {isFavorite
                        ? "Remove from Favorites"
                        : "Add to Favorites"}

                </button>


                {/* DIVIDER */}

                <div
                    className="photo-menu-divider"
                />


                {/* RECYCLE BIN */}

                <button
                    type="button"
                    className="photo-menu-danger"
                    onClick={handleDelete}
                >

                    <Trash2 size={17} />

                    Move to Recycle Bin

                </button>

            </div>

        )}


        {/* PHOTO TITLE */}

        <div className="photo-card-title">

            {photo.title ||
                photo.fileName ||
                "Untitled photo"}

        </div>

    </div>

);

}


export default FolderPhotos;