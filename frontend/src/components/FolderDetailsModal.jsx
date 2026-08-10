import { useEffect, useState } from "react";

import {
    X,
    Info,
    Folder,
    Image,
    Heart
} from "lucide-react";

import api from "../services/api";


function FolderDetailsModal({
    folder,
    isOpen,
    onClose
}) {

    const [details, setDetails] =
        useState(null);

    const [loading, setLoading] =
        useState(false);


    useEffect(() => {

        if (!isOpen || !folder) {
            return;
        }


        const fetchDetails = async () => {

            try {

                setLoading(true);


                const response =
                    await api.get(
                        `/api/folders/${folder._id}`
                    );


                if (response.data.success) {

                    setDetails(
                        response.data.folder
                    );

                }

            } catch (error) {

                console.error(
                    "FOLDER DETAILS ERROR:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };


        fetchDetails();

    }, [isOpen, folder]);


    if (!isOpen || !folder) {
        return null;
    }


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

                            <Info size={20} />

                        </div>

                        <div>

                            <h2>
                                Folder Details
                            </h2>

                            <p>
                                Information about this
                                memory folder.
                            </p>

                        </div>

                    </div>


                    <button
                        className="modal-close-button"
                        onClick={onClose}
                    >

                        <X size={20} />

                    </button>

                </div>


                {loading ? (

                    <p>
                        Loading details...
                    </p>

                ) : (

                    <div className="folder-details">

                        <div className="detail-row">

                            <Folder size={18} />

                            <div>

                                <span>
                                    Folder
                                </span>

                                <strong>
                                    {details?.name ||
                                        folder.name}
                                </strong>

                            </div>

                        </div>


                        <div className="detail-row">

                            <Image size={18} />

                            <div>

                                <span>
                                    Photos
                                </span>

                                <strong>
                                    {details?.photoCount ??
                                        folder.photoCount ??
                                        0}
                                </strong>

                            </div>

                        </div>


                        <div className="detail-row">

                            <Heart size={18} />

                            <div>

                                <span>
                                    Favorites
                                </span>

                                <strong>
                                    {details?.favoriteCount ??
                                        0}
                                </strong>

                            </div>

                        </div>


                        <div className="detail-row">

                            <Info size={18} />

                            <div>

                                <span>
                                    Created
                                </span>

                                <strong>

                                    {details?.createdAt
                                        ? new Date(
                                            details.createdAt
                                        ).toLocaleDateString()
                                        : "—"}

                                </strong>

                            </div>

                        </div>

                    </div>

                )}


                <div className="modal-actions">

                    <button
                        type="button"
                        className="modal-create-button"
                        onClick={onClose}
                    >
                        Done
                    </button>

                </div>

            </div>

        </div>
    );
}


export default FolderDetailsModal;