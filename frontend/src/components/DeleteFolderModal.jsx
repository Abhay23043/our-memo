import { useState } from "react";

import {
    X,
    Trash2
} from "lucide-react";

import api from "../services/api";


function DeleteFolderModal({
    folder,
    isOpen,
    onClose,
    onDeleted
}) {

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    if (!isOpen || !folder) {
        return null;
    }


    const handleDelete = async () => {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.delete(
                    `/api/folders/${folder._id}`
                );


            console.log(
                "DELETE FOLDER RESPONSE:",
                response.data
            );


            if (response.data.success) {

                await onDeleted();

                onClose();

            } else {

                setError(
                    response.data.message ||
                    "Unable to delete folder."
                );

            }

        } catch (error) {

            console.error(
                "DELETE FOLDER ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to delete folder."
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

            <div className="folder-modal">

                <div className="modal-header">

                    <div className="modal-title-wrapper">

                        <div
                            className="modal-icon"
                            style={{
                                color: "#d70015"
                            }}
                        >

                            <Trash2 size={20} />

                        </div>

                        <div>

                            <h2>
                                Delete Folder?
                            </h2>

                            <p>
                                This folder will be
                                moved to the recycle bin.
                            </p>

                        </div>

                    </div>


                    <button
                        className="modal-close-button"
                        onClick={onClose}
                        disabled={loading}
                    >

                        <X size={20} />

                    </button>

                </div>


                <div className="delete-folder-message">

                    <strong>
                        "{folder.name}"
                    </strong>

                    <p>
                        Your photos will remain safe.
                        The folder itself will be moved
                        to the recycle bin.
                    </p>

                </div>


                {error && (

                    <div className="modal-error">
                        {error}
                    </div>

                )}


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
                        type="button"
                        className="delete-confirm-button"
                        onClick={handleDelete}
                        disabled={loading}
                    >

                        {loading
                            ? "Deleting..."
                            : "Delete Folder"
                        }

                    </button>

                </div>

            </div>

        </div>
    );
}


export default DeleteFolderModal;