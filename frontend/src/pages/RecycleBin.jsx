import {
    useEffect,
    useState
} from "react";


import {
    Trash2,
    RotateCcw,
    X,
    Folder,
    Image as ImageIcon
} from "lucide-react";


import api from "../services/api";


function RecycleBin() {

    const [photos, setPhotos] =
        useState([]);


    const [folders, setFolders] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    // =====================================================
    // FETCH RECYCLE BIN
    // =====================================================

    const fetchRecycleBin =
        async () => {

            try {

                setLoading(true);

                setError("");


                const [
                    photosResponse,
                    foldersResponse
                ] = await Promise.all([

                    api.get(
                        "/api/photos/recycle-bin"
                    ),

                    api.get(
                        "/api/folders/recycle-bin"
                    )

                ]);


                if (
                    photosResponse.data.success
                ) {

                    setPhotos(
                        photosResponse.data.photos ||
                        []
                    );

                }


                if (
                    foldersResponse.data.success
                ) {

                    setFolders(
                        foldersResponse.data.folders ||
                        []
                    );

                }

            } catch (error) {

                console.error(
                    "RECYCLE BIN ERROR:",
                    error
                );


                setError(
                    error.response?.data?.message ||
                    "Unable to load recycle bin"
                );

            } finally {

                setLoading(false);

            }

        };


    useEffect(() => {

        fetchRecycleBin();

    }, []);


    // =====================================================
    // RESTORE PHOTO
    // =====================================================

    const handleRestorePhoto =
        async (
            photoId
        ) => {

            try {

                const response =
                    await api.patch(

                        `/api/photos/${photoId}/restore`

                    );


                if (
                    response.data.success
                ) {

                    setPhotos(
                        previous =>
                            previous.filter(
                                photo =>
                                    photo._id !==
                                    photoId
                            )
                    );

                }

            } catch (error) {

                console.error(
                    "RESTORE PHOTO ERROR:",
                    error
                );


                alert(
                    error.response?.data?.message ||
                    "Unable to restore photo"
                );

            }

        };


    // =====================================================
    // DELETE PHOTO PERMANENTLY
    // =====================================================

    const handlePermanentDeletePhoto =
        async (
            photoId
        ) => {

            const confirmed =
                window.confirm(

                    "Delete this photo permanently? This cannot be undone."

                );


            if (!confirmed) {

                return;

            }


            try {

                const response =
                    await api.delete(

                        `/api/photos/${photoId}/permanent`

                    );


                if (
                    response.data.success
                ) {

                    setPhotos(
                        previous =>
                            previous.filter(
                                photo =>
                                    photo._id !==
                                    photoId
                            )
                    );

                }

            } catch (error) {

                console.error(
                    "PERMANENT PHOTO DELETE ERROR:",
                    error
                );


                alert(
                    error.response?.data?.message ||
                    "Unable to permanently delete photo"
                );

            }

        };


    // =====================================================
    // RESTORE FOLDER
    // =====================================================

    const handleRestoreFolder =
        async (
            folderId
        ) => {

            try {

                const response =
                    await api.patch(

                        `/api/folders/${folderId}/restore`

                    );


                if (
                    response.data.success
                ) {

                    setFolders(
                        previous =>
                            previous.filter(
                                folder =>
                                    folder._id !==
                                    folderId
                            )
                    );

                    // -------------------------------------
                    // Refresh photos because restoring
                    // a folder also restores its photos
                    // -------------------------------------

                    const photosResponse =
                        await api.get(
                            "/api/photos/recycle-bin"
                        );


                    if (
                        photosResponse.data.success
                    ) {

                        setPhotos(
                            photosResponse.data.photos ||
                            []
                        );

                    }

                }

            } catch (error) {

                console.error(
                    "RESTORE FOLDER ERROR:",
                    error
                );


                alert(
                    error.response?.data?.message ||
                    "Unable to restore folder"
                );

            }

        };


    // =====================================================
    // DELETE FOLDER PERMANENTLY
    // =====================================================

    const handlePermanentDeleteFolder =
        async (
            folderId
        ) => {

            const confirmed =
                window.confirm(

                    "Delete this folder and all its photos permanently? This cannot be undone."

                );


            if (!confirmed) {

                return;

            }


            try {

                const response =
                    await api.delete(

                        `/api/folders/${folderId}/permanent`

                    );


                if (
                    response.data.success
                ) {

                    setFolders(
                        previous =>
                            previous.filter(
                                folder =>
                                    folder._id !==
                                    folderId
                            )
                    );


                    // -------------------------------------
                    // Refresh photos
                    // -------------------------------------

                    const photosResponse =
                        await api.get(
                            "/api/photos/recycle-bin"
                        );


                    if (
                        photosResponse.data.success
                    ) {

                        setPhotos(
                            photosResponse.data.photos ||
                            []
                        );

                    }

                }

            } catch (error) {

                console.error(
                    "PERMANENT FOLDER DELETE ERROR:",
                    error
                );


                alert(
                    error.response?.data?.message ||
                    "Unable to permanently delete folder"
                );

            }

        };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <main className="gallery-page">

                <div className="gallery-container">

                    <div className="empty-state">

                        <div className="empty-icon">

                            <Trash2
                                size={28}
                            />

                        </div>


                        <p>
                            Loading recycle bin...
                        </p>

                    </div>

                </div>

            </main>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <main className="gallery-page">

                <div className="gallery-container">

                    <div className="gallery-error">

                        {error}

                    </div>

                </div>

            </main>

        );

    }


    const isEmpty =
        photos.length === 0 &&
        folders.length === 0;


    // =====================================================
    // UI
    // =====================================================

    return (

        <main className="gallery-page">

            <div className="gallery-container">


                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="gallery-header">

                    <div>

                        <p className="gallery-eyebrow">

                            Recently deleted

                        </p>


                        <h1>

                            Recycle Bin

                        </h1>


                        <p className="gallery-description">

                            Deleted photos and folders
                            stay here until you restore
                            or permanently delete them.

                        </p>

                    </div>


                    <div className="favorites-heading-icon">

                        <Trash2
                            size={24}
                        />

                    </div>

                </div>


                {/* =========================================
                    EMPTY
                ========================================= */}

                {isEmpty && (

                    <div className="empty-state">

                        <div className="empty-icon">

                            <Trash2
                                size={28}
                            />

                        </div>


                        <h2>

                            Recycle Bin is empty

                        </h2>


                        <p>

                            Deleted photos and folders
                            will appear here.

                        </p>

                    </div>

                )}


                {/* =========================================
                    FOLDERS
                ========================================= */}

                {folders.length > 0 && (

                    <section className="recycle-section">

                        <div className="recycle-section-header">

                            <div>

                                <h2>
                                    Folders
                                </h2>

                                <span>
                                    {folders.length}
                                    {" "}
                                    {folders.length === 1
                                        ? "folder"
                                        : "folders"}
                                </span>

                            </div>

                        </div>


                        <div className="recycle-folder-grid">

                            {folders.map(
                                folder => (

                                <RecycleFolder
                                    key={
                                        folder._id
                                    }
                                    folder={
                                        folder
                                    }
                                    onRestore={
                                        handleRestoreFolder
                                    }
                                    onDelete={
                                        handlePermanentDeleteFolder
                                    }
                                />

                            ))}

                        </div>

                    </section>

                )}


                {/* =========================================
                    PHOTOS
                ========================================= */}

                {photos.length > 0 && (

                    <section className="recycle-section">

                        <div className="recycle-section-header">

                            <div>

                                <h2>
                                    Photos
                                </h2>

                                <span>
                                    {photos.length}
                                    {" "}
                                    {photos.length === 1
                                        ? "photo"
                                        : "photos"}
                                </span>

                            </div>

                        </div>


                        <div className="photo-grid">

                            {photos.map(
                                photo => (

                                <RecyclePhoto
                                    key={
                                        photo._id
                                    }
                                    photo={
                                        photo
                                    }
                                    onRestore={
                                        handleRestorePhoto
                                    }
                                    onDelete={
                                        handlePermanentDeletePhoto
                                    }
                                />

                            ))}

                        </div>

                    </section>

                )}

            </div>

        </main>

    );

}


// =====================================================
// RECYCLE FOLDER
// =====================================================

function RecycleFolder({
    folder,
    onRestore,
    onDelete
}) {

    return (

        <article className="recycle-folder-card">


            <div className="recycle-folder-icon">

                <Folder
                    size={34}
                />

            </div>


            <div className="recycle-folder-info">

                <h3>

                    {folder.name}

                </h3>


                <span>

                    {folder.deletedAt
                        ? `Deleted ${new Date(
                            folder.deletedAt
                        ).toLocaleDateString(
                            "en-IN"
                        )}`
                        : "Deleted folder"}

                </span>

            </div>


            <div className="recycle-folder-actions">

                <button
                    type="button"
                    className="recycle-restore-button"
                    onClick={() =>
                        onRestore(
                            folder._id
                        )
                    }
                >

                    <RotateCcw
                        size={16}
                    />

                    Restore

                </button>


                <button
                    type="button"
                    className="recycle-delete-button"
                    onClick={() =>
                        onDelete(
                            folder._id
                        )
                    }
                >

                    <X
                        size={16}
                    />

                    Delete

                </button>

            </div>

        </article>

    );

}


// =====================================================
// RECYCLE PHOTO
// =====================================================

function RecyclePhoto({
    photo,
    onRestore,
    onDelete
}) {

    const [imageUrl, setImageUrl] =
        useState(null);


    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        let objectUrl = null;


        const loadImage =
            async () => {

                try {

                    const response =
                        await api.get(

                            `/api/photos/${photo._id}/image`,

                            {
                                responseType:
                                    "blob"
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
                        "RECYCLE IMAGE ERROR:",
                        error
                    );

                } finally {

                    setLoading(false);

                }

            };


        loadImage();


        return () => {

            if (objectUrl) {

                URL.revokeObjectURL(
                    objectUrl
                );

            }

        };

    }, [
        photo._id
    ]);


    return (

        <article className="photo-card recycle-photo-card">

            <div className="photo-image-wrapper">

                {loading && (

                    <div className="photo-loading">

                        Loading...

                    </div>

                )}


                {imageUrl && (

                    <img
                        src={imageUrl}
                        alt={
                            photo.title ||
                            photo.fileName ||
                            "Deleted photo"
                        }
                        className="photo-image"
                    />

                )}


                <div className="recycle-photo-overlay">

                    <button
                        type="button"
                        className="recycle-restore-button"
                        onClick={() =>
                            onRestore(
                                photo._id
                            )
                        }
                    >

                        <RotateCcw
                            size={17}
                        />

                        Restore

                    </button>


                    <button
                        type="button"
                        className="recycle-delete-button"
                        onClick={() =>
                            onDelete(
                                photo._id
                            )
                        }
                    >

                        <X
                            size={17}
                        />

                        Delete

                    </button>

                </div>

            </div>


            <div className="photo-info">

                <h3>

                    {photo.title ||
                        photo.fileName ||
                        "Our Memory"}

                </h3>


                {photo.deletedAt && (

                    <span>

                        Deleted recently

                    </span>

                )}

            </div>

        </article>

    );

}


export default RecycleBin;