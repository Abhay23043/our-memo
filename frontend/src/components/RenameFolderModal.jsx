import { useEffect, useState } from "react";

import {
    X,
    Pencil
} from "lucide-react";

import api from "../services/api";


function RenameFolderModal({
    folder,
    isOpen,
    onClose,
    onRenamed
}) {

    const [name, setName] = useState("");

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");


    useEffect(() => {

        if (isOpen && folder) {

            setName(folder.name || "");

            setError("");

        }

    }, [isOpen, folder]);


    if (!isOpen || !folder) {
        return null;
    }


    const handleSubmit = async (event) => {

        event.preventDefault();

        const newName = name.trim();

        if (!newName) {

            setError(
                "Folder name is required."
            );

            return;
        }


        try {

            setLoading(true);

            setError("");


            const response = await api.patch(
                `/api/folders/${folder._id}`,
                {
                    name: newName
                }
            );


            console.log(
                "RENAME RESPONSE:",
                response.data
            );


            if (response.data.success) {

                await onRenamed();

                onClose();

            } else {

                setError(
                    response.data.message ||
                    "Unable to rename folder."
                );

            }

        } catch (error) {

            console.error(
                "RENAME ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to rename folder."
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

                        <div className="modal-icon">

                            <Pencil size={20} />

                        </div>

                        <div>

                            <h2>
                                Rename Folder
                            </h2>

                            <p>
                                Choose a new name for
                                your folder.
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="modal-close-button"
                        onClick={onClose}
                    >

                        <X size={20} />

                    </button>

                </div>


                <form
                    className="folder-form"
                    onSubmit={handleSubmit}
                >

                    <div className="modal-input-group">

                        <label>
                            Folder name
                        </label>

                        <input
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value
                                )
                            }
                            maxLength={50}
                            autoFocus
                        />

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
                            type="submit"
                            className="modal-create-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Saving..."
                                : "Save Changes"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}


export default RenameFolderModal;