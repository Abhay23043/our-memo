import {
    useEffect,
    useState
} from "react";

import {
    X,
    Upload,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Image as ImageIcon
} from "lucide-react";

import api from "../services/api";


function UploadModal({
    isOpen,
    onClose,
    onUploadSuccess
}) {

    // =================================================
    // STATE
    // =================================================

    const [files, setFiles] =
        useState([]);

    const [folders, setFolders] =
        useState([]);

    const [selectedFolder, setSelectedFolder] =
        useState("");

    const [title, setTitle] =
        useState("");

    const [uploading, setUploading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [currentFile, setCurrentFile] =
        useState(0);

    const [uploadProgress, setUploadProgress] =
        useState(0);

    const [fileStatuses, setFileStatuses] =
        useState({});

    const [previewUrls, setPreviewUrls] =
        useState([]);


    // =================================================
    // FETCH FOLDERS
    // =================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }


        const fetchFolders = async () => {

            try {

                const response =
                    await api.get(
                        "/api/folders"
                    );


                if (
                    response.data.success
                ) {

                    setFolders(
                        response.data.folders || []
                    );

                }

            } catch (error) {

                console.error(
                    "FETCH FOLDERS ERROR:",
                    error
                );

            }

        };


        fetchFolders();

    }, [isOpen]);


    // =================================================
    // CREATE PREVIEWS
    // =================================================

    useEffect(() => {

        const urls =
            files.map(
                file =>
                    URL.createObjectURL(
                        file
                    )
            );


        setPreviewUrls(
            urls
        );


        return () => {

            urls.forEach(
                url =>
                    URL.revokeObjectURL(
                        url
                    )
            );

        };

    }, [files]);


    // =================================================
    // RESET MODAL
    // =================================================

    const resetModal = () => {

        setFiles([]);

        setTitle("");

        setSelectedFolder("");

        setError("");

        setCurrentFile(0);

        setUploadProgress(0);

        setFileStatuses({});

    };


    // =================================================
    // SELECT FILES
    // =================================================

    const handleFileChange = (
        event
    ) => {

        const selectedFiles =
            Array.from(
                event.target.files || []
            );


        if (
            selectedFiles.length === 0
        ) {

            return;

        }


        const imageFiles =
            selectedFiles.filter(
                file =>
                    file.type.startsWith(
                        "image/"
                    )
            );


        if (
            imageFiles.length === 0
        ) {

            setError(
                "Please select valid image files."
            );

            event.target.value = "";

            return;

        }


        setFiles(
            currentFiles => {

                const existingKeys =
                    new Set(
                        currentFiles.map(
                            file =>
                                `${file.name}-${file.size}-${file.lastModified}`
                        )
                    );


                const newFiles =
                    imageFiles.filter(
                        file =>
                            !existingKeys.has(
                                `${file.name}-${file.size}-${file.lastModified}`
                            )
                    );


                return [
                    ...currentFiles,
                    ...newFiles
                ];

            }
        );


        setError("");

        setFileStatuses({});

        setUploadProgress(0);

        setCurrentFile(0);


        // Allow selecting same file again

        event.target.value = "";

    };


    // =================================================
    // REMOVE SELECTED FILE
    // =================================================

    const handleRemoveFile = (
        index
    ) => {

        if (uploading) {
            return;
        }


        setFiles(
            currentFiles =>
                currentFiles.filter(
                    (_, fileIndex) =>
                        fileIndex !== index
                )
        );


        setError("");

        setFileStatuses({});

    };


    // =================================================
    // UPLOAD
    // =================================================

    const handleUpload = async () => {

        if (
            files.length === 0
        ) {

            setError(
                "Please select at least one photo."
            );

            return;

        }


        try {

            setUploading(true);

            setError("");

            setUploadProgress(0);

            setCurrentFile(0);

            setFileStatuses({});


            let completedFiles = 0;

            let failedFiles = 0;


            // =========================================
            // UPLOAD FILES ONE BY ONE
            // =========================================

            for (
                let index = 0;
                index < files.length;
                index++
            ) {

                const file =
                    files[index];


                setCurrentFile(
                    index + 1
                );


                setFileStatuses(
                    previous => ({
                        ...previous,
                        [index]:
                            "uploading"
                    })
                );


                if (
                    !(file instanceof File)
                ) {

                    failedFiles++;


                    setFileStatuses(
                        previous => ({
                            ...previous,
                            [index]:
                                "error"
                        })
                    );


                    continue;

                }


                const formData =
                    new FormData();


                // =====================================
                // PHOTO
                // =====================================

                formData.append(
                    "photo",
                    file,
                    file.name
                );


                // =====================================
                // OPTIONAL TITLE
                // =====================================

                if (
                    title.trim()
                ) {

                    formData.append(
                        "title",
                        title.trim()
                    );

                }


                // =====================================
                // OPTIONAL FOLDER
                // =====================================

                if (
                    selectedFolder
                ) {

                    formData.append(
                        "folderId",
                        selectedFolder
                    );

                }


                try {

                    await api.post(
                        "/api/photos/upload",
                        formData,
                        {
                            headers: {
                                "Content-Type":
                                    "multipart/form-data"
                            },

                            onUploadProgress:
                                progressEvent => {

                                    if (
                                        !progressEvent.total
                                    ) {

                                        return;

                                    }


                                    const fileProgress =
                                        Math.round(
                                            (
                                                progressEvent.loaded /
                                                progressEvent.total
                                            ) * 100
                                        );


                                    const overallProgress =
                                        Math.round(
                                            (
                                                completedFiles +
                                                (
                                                    fileProgress /
                                                    100
                                                )
                                            ) /
                                            files.length *
                                            100
                                        );


                                    setUploadProgress(
                                        overallProgress
                                    );

                                }

                        }
                    );


                    // =================================
                    // SUCCESS
                    // =================================

                    setFileStatuses(
                        previous => ({
                            ...previous,
                            [index]:
                                "success"
                        })
                    );


                    completedFiles++;


                    setUploadProgress(
                        Math.round(
                            (
                                completedFiles /
                                files.length
                            ) * 100
                        )
                    );


                } catch (fileError) {

                    console.error(
                        `UPLOAD ERROR: ${file.name}`,
                        fileError
                    );


                    failedFiles++;


                    setFileStatuses(
                        previous => ({
                            ...previous,
                            [index]:
                                "error"
                        })
                    );

                }

            }


            // =========================================
            // REFRESH DASHBOARD
            // =========================================

            if (
                completedFiles > 0 &&
                onUploadSuccess
            ) {

                await onUploadSuccess();

            }


            // =========================================
            // ALL SUCCESS
            // =========================================

            if (
                failedFiles === 0
            ) {

                setUploadProgress(100);


                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            500
                        )
                );


                resetModal();

                onClose();

                return;

            }


            // =========================================
            // PARTIAL FAILURE
            // =========================================

            if (
                completedFiles > 0 &&
                failedFiles > 0
            ) {

                setError(
                    `${completedFiles} photo${completedFiles > 1 ? "s" : ""} uploaded successfully. ${failedFiles} failed.`
                );


                setUploading(false);

                return;

            }


            // =========================================
            // ALL FAILED
            // =========================================

            setError(
                "Unable to upload the selected photos."
            );

        } catch (error) {

            console.error(
                "UPLOAD ERROR:",
                error
            );


            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );


            setError(
                error.response?.data?.message ||
                "Unable to upload photos."
            );

        } finally {

            setUploading(false);

        }

    };


    // =================================================
    // CLOSE
    // =================================================

    const handleClose = () => {

        if (uploading) {
            return;
        }


        resetModal();

        onClose();

    };


    // =================================================
    // CLOSED
    // =================================================

    if (!isOpen) {

        return null;

    }


    // =================================================
    // UI
    // =================================================

    return (

        <div
            className="upload-modal-overlay"
            onClick={handleClose}
        >

            <div
                className="upload-modal"
                onClick={
                    event =>
                        event.stopPropagation()
                }
            >


                {/* =====================================
                    HEADER
                ===================================== */}

                <div className="upload-modal-header">

                    <div>

                        <h2>
                            Upload Photos
                        </h2>

                        <p>
                            Add your memories
                            to Our Memo.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="upload-modal-close"
                        onClick={handleClose}
                        disabled={uploading}
                        aria-label="Close upload modal"
                    >

                        <X
                            size={20}
                        />

                    </button>

                </div>


                {/* =====================================
                    DROPZONE / SELECT
                ===================================== */}

                <label
                    className={
                        uploading
                            ? "upload-dropzone upload-dropzone-disabled"
                            : "upload-dropzone"
                    }
                >

                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploading}
                        onChange={
                            handleFileChange
                        }
                    />


                    <div className="upload-dropzone-icon">

                        <Upload
                            size={30}
                        />

                    </div>


                    <strong>
                        Choose Photos
                    </strong>


                    <span>
                        JPG, PNG, WEBP and
                        other image formats
                    </span>


                    {files.length > 0 && (

                        <small>

                            {files.length}
                            {" "}
                            {files.length === 1
                                ? "photo"
                                : "photos"}
                            {" "}selected

                        </small>

                    )}

                </label>


                {/* =====================================
                    PREVIEWS
                ===================================== */}

                {files.length > 0 && (

                    <div className="upload-preview-grid">

                        {files.map(
                            (
                                file,
                                index
                            ) => (

                            <div
                                className="upload-preview-item"
                                key={
                                    `${file.name}-${file.size}-${file.lastModified}`
                                }
                            >

                                {/* IMAGE */}

                                {previewUrls[index] ? (

                                    <img
                                        src={
                                            previewUrls[index]
                                        }
                                        alt={
                                            file.name
                                        }
                                    />

                                ) : (

                                    <div className="upload-preview-placeholder">

                                        <ImageIcon
                                            size={24}
                                        />

                                    </div>

                                )}


                                {/* STATUS */}

                                {fileStatuses[index] ===
                                    "success" && (

                                    <div className="upload-preview-success">

                                        <CheckCircle2
                                            size={18}
                                        />

                                    </div>

                                )}


                                {fileStatuses[index] ===
                                    "error" && (

                                    <div className="upload-preview-error">

                                        <AlertCircle
                                            size={18}
                                        />

                                    </div>

                                )}


                                {/* REMOVE */}

                                {!uploading && (

                                    <button
                                        type="button"
                                        className="upload-preview-remove"
                                        onClick={() =>
                                            handleRemoveFile(
                                                index
                                            )
                                        }
                                        aria-label={
                                            `Remove ${file.name}`
                                        }
                                    >

                                        <Trash2
                                            size={15}
                                        />

                                    </button>

                                )}


                                {/* FILE INFO */}

                                <div className="upload-preview-info">

                                    <span>
                                        {
                                            file.name
                                        }
                                    </span>

                                    <small>

                                        {(
                                            file.size /
                                            1024 /
                                            1024
                                        ).toFixed(2)}

                                        {" MB"}

                                    </small>

                                </div>

                            </div>

                        ))}

                    </div>

                )}


                {/* =====================================
                    TITLE
                ===================================== */}

                <div className="upload-title-field">

                    <label htmlFor="photo-title">

                        Photo Title

                        <span>
                            {" "}Optional
                        </span>

                    </label>


                    <input
                        id="photo-title"
                        type="text"
                        value={title}
                        onChange={
                            event =>
                                setTitle(
                                    event.target.value
                                )
                        }
                        placeholder="e.g. Our first memory"
                        maxLength={100}
                        disabled={uploading}
                    />

                </div>


                {/* =====================================
                    FOLDER
                ===================================== */}

                <div className="upload-folder-field">

                    <label htmlFor="photo-folder">

                        Save in folder

                    </label>


                    <select
                        id="photo-folder"
                        value={selectedFolder}
                        onChange={
                            event =>
                                setSelectedFolder(
                                    event.target.value
                                )
                        }
                        disabled={uploading}
                    >

                        <option value="">
                            All Photos
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


                {/* =====================================
                    PROGRESS
                ===================================== */}

                {uploading && (

                    <div className="upload-progress-section">

                        <div className="upload-progress-header">

                            <span>

                                Uploading{" "}
                                {currentFile}{" "}
                                of{" "}
                                {files.length}

                            </span>


                            <strong>

                                {uploadProgress}%

                            </strong>

                        </div>


                        <div className="upload-progress-track">

                            <div
                                className="upload-progress-bar"
                                style={{
                                    width:
                                        `${uploadProgress}%`
                                }}
                            />

                        </div>


                        <p>
                            Please don't close
                            this window.
                        </p>

                    </div>

                )}


                {/* =====================================
                    ERROR
                ===================================== */}

                {error && (

                    <div className="upload-error">

                        <AlertCircle
                            size={16}
                        />

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                {/* =====================================
                    ACTIONS
                ===================================== */}

                <div className="upload-modal-actions">

                    <button
                        type="button"
                        className="upload-cancel-button"
                        onClick={handleClose}
                        disabled={uploading}
                    >

                        Cancel

                    </button>


                    <button
                        type="button"
                        className="upload-submit-button"
                        onClick={handleUpload}
                        disabled={
                            uploading ||
                            files.length === 0
                        }
                    >

                        {uploading
                            ? `Uploading ${uploadProgress}%`
                            : "Upload Photos"}

                    </button>

                </div>


            </div>

        </div>

    );

}


export default UploadModal;