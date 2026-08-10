import { useEffect, useRef, useState } from "react";

import {
    X,
    FolderPlus
} from "lucide-react";

import api from "../services/api";


function CreateFolderModal({
    isOpen,
    onClose,
    onFolderCreated
}) {

    const [name, setName] = useState("");

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const inputRef = useRef(null);


    // Focus input when modal opens
    useEffect(() => {

        if (isOpen) {

            setName("");
            setError("");

            setTimeout(() => {

                inputRef.current?.focus();

            }, 100);

        }

    }, [isOpen]);


    // Close with Escape
    useEffect(() => {

        const handleEscape = (event) => {

            if (
                event.key === "Escape" &&
                isOpen
            ) {

                onClose();

            }

        };


        document.addEventListener(
            "keydown",
            handleEscape
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleEscape
            );

        };

    }, [isOpen, onClose]);


    if (!isOpen) {
        return null;
    }


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");


        const folderName = name.trim();


        if (!folderName) {

            setError(
                "Please enter a folder name."
            );

            inputRef.current?.focus();

            return;
        }


        try {

            setLoading(true);


            const response = await api.post(
                "/api/folders",
                {
                    name: folderName
                }
            );
            console.log(
                "CREATE FOLDER STATUS:",
                response.status
            );

            console.log(
                "CREATE FOLDER RESPONSE:",
                response.data
            );


            if (response.data.success) {

                console.log(
                    "FOLDER CREATED SUCCESSFULLY:",
                    response.data.folder
                );

                // Modal immediately close
                onClose();

                // Refresh folder list
                // Error ko folder creation failure mat samjho
                try {

                    await onFolderCreated();

                } catch (refreshError) {

                    console.error(
                        "FOLDER LIST REFRESH ERROR:",
                        refreshError
                    );

                }

            } else {

                setError(
                    response.data.message ||
                    "Unable to create folder."
                );

            }

        } catch (error) {

            console.error(
                "CREATE FOLDER ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to create folder."
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div
            className="modal-backdrop"
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    onClose();

                }

            }}
        >

            <div
                className="folder-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-folder-title"
            >

                {/* Header */}

                <div className="modal-header">

                    <div className="modal-title-wrapper">

                        <div className="modal-icon">

                            <FolderPlus
                                size={21}
                            />

                        </div>

                        <div>

                            <h2 id="create-folder-title">
                                Create New Folder
                            </h2>

                            <p>
                                Give your memories
                                a place to live.
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="modal-close-button"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close"
                    >

                        <X size={20} />

                    </button>

                </div>


                {/* Form */}

                <form
                    className="folder-form"
                    onSubmit={handleSubmit}
                >

                    <div className="modal-input-group">

                        <label htmlFor="folder-name">
                            Folder name
                        </label>

                        <input
                            ref={inputRef}
                            id="folder-name"
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value
                                )
                            }
                            placeholder="e.g. Birthday"
                            maxLength={50}
                            disabled={loading}
                            autoComplete="off"
                        />

                        <span className="input-hint">
                            {name.length}/50
                        </span>

                    </div>


                    {error && (

                        <div className="modal-error">
                            {error}
                        </div>

                    )}


                    {/* Actions */}

                    <div className="modal-actions">

                        <button
                            type="button"
                            className="modal-cancel-button"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="modal-create-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Creating..."
                                : "Create Folder"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}


export default CreateFolderModal;