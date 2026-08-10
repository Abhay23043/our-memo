import {
    useEffect,
    useState,
    useRef
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    Folder,
    Plus,
    MoreVertical
} from "lucide-react";

import api from "../services/api";

import CreateFolderModal
    from "../components/CreateFolderModal";

import FolderMenu
    from "../components/FolderMenu";

import RenameFolderModal
    from "../components/RenameFolderModal";

import FolderDetailsModal
    from "../components/FolderDetailsModal";

import DeleteFolderModal
    from "../components/DeleteFolderModal";


function Folders() {

    // ========================================
    // STATE
    // ========================================

    const [folders, setFolders] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // Create folder modal
    const [createModalOpen, setCreateModalOpen] =
        useState(false);


    // Selected folder
    const [selectedFolder, setSelectedFolder] =
        useState(null);


    // Rename modal
    const [renameModalOpen, setRenameModalOpen] =
        useState(false);


    // Details modal
    const [detailsModalOpen, setDetailsModalOpen] =
        useState(false);


    // Delete modal
    const [deleteModalOpen, setDeleteModalOpen] =
        useState(false);


    // ========================================
    // FETCH FOLDERS
    // ========================================

    const fetchFolders = async () => {

        try {

            setLoading(true);

            setError("");


            const response = await api.get(
                "/api/folders"
            );


            if (response.data.success) {

                setFolders(
                    response.data.folders || []
                );

            } else {

                setError(
                    response.data.message ||
                    "Unable to load folders"
                );

            }

        } catch (error) {

            console.error(
                "FETCH FOLDERS ERROR:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Unable to load folders"
            );

        } finally {

            setLoading(false);

        }

    };


    // ========================================
    // INITIAL LOAD
    // ========================================

    useEffect(() => {

        fetchFolders();

    }, []);


    // ========================================
    // RENAME HANDLER
    // ========================================

    const handleRename = (folder) => {

        setSelectedFolder(folder);

        setRenameModalOpen(true);

    };


    // ========================================
    // DETAILS HANDLER
    // ========================================

    const handleDetails = (folder) => {

        setSelectedFolder(folder);

        setDetailsModalOpen(true);

    };


    // ========================================
    // DELETE HANDLER
    // ========================================

    const handleDelete = (folder) => {

        setSelectedFolder(folder);

        setDeleteModalOpen(true);

    };


    // ========================================
    // REFRESH FOLDERS
    // ========================================

    const refreshFolders = async () => {

        await fetchFolders();

    };


    // ========================================
    // AFTER CREATE FOLDER
    // ========================================

    const handleFolderCreated = async () => {

        try {

            await fetchFolders();

        } catch (error) {

            console.error(
                "REFRESH FOLDERS ERROR:",
                error
            );

        }

    };


    // ========================================
    // RENDER
    // ========================================

    return (

        <>

            {/* ========================================
                MAIN PAGE
            ======================================== */}

            <main className="folders-page">

                <div className="folders-container">


                    {/* ========================================
                        HEADER
                    ======================================== */}

                    <div className="folders-header">

                        <div>

                            <p className="gallery-eyebrow">
                                Organize your memories
                            </p>


                            <h1>
                                Your Folders
                            </h1>


                            <p className="gallery-description">
                                Keep your memories organized
                                your way.
                            </p>

                        </div>


                        {/* CREATE FOLDER BUTTON */}

                        <button
                            className="create-folder-button"
                            type="button"
                            onClick={() =>
                                setCreateModalOpen(true)
                            }
                        >

                            <Plus size={18} />

                            <span>
                                New Folder
                            </span>

                        </button>

                    </div>


                    {/* ========================================
                        ERROR
                    ======================================== */}

                    {error && (

                        <div className="gallery-error">

                            {error}

                        </div>

                    )}


                    {/* ========================================
                        LOADING
                    ======================================== */}

                    {loading && (

                        <div className="folder-grid">

                            {Array.from({
                                length: 6
                            }).map((_, index) => (

                                <div
                                    className="folder-skeleton"
                                    key={index}
                                />

                            ))}

                        </div>

                    )}


                    {/* ========================================
                        EMPTY STATE
                    ======================================== */}

                    {!loading &&
                        !error &&
                        folders.length === 0 && (

                            <div className="empty-state">

                                <div className="empty-icon">

                                    <Folder size={28} />

                                </div>


                                <h2>
                                    No folders yet
                                </h2>


                                <p>
                                    Create your first folder
                                    to organize your memories.
                                </p>

                            </div>

                        )}


                    {/* ========================================
                        FOLDERS
                    ======================================== */}

                    {!loading &&
                        folders.length > 0 && (

                            <div className="folder-grid">

                                {folders.map((folder) => (

                                    <FolderCard
                                        key={folder._id}
                                        folder={folder}
                                        onRename={handleRename}
                                        onDetails={handleDetails}
                                        onDelete={handleDelete}
                                    />

                                ))}

                            </div>

                        )}

                </div>

            </main>


            {/* ========================================
                CREATE FOLDER MODAL
            ======================================== */}

            <CreateFolderModal

                isOpen={createModalOpen}

                onClose={() => {

                    setCreateModalOpen(false);

                    setSelectedFolder(null);

                }}

                onFolderCreated={
                    handleFolderCreated
                }

            />


            {/* ========================================
                RENAME FOLDER MODAL
            ======================================== */}

            <RenameFolderModal

                folder={selectedFolder}

                isOpen={renameModalOpen}

                onClose={() => {

                    setRenameModalOpen(false);

                    setSelectedFolder(null);

                }}

                onRenamed={refreshFolders}

            />


            {/* ========================================
                DETAILS MODAL
            ======================================== */}

            <FolderDetailsModal

                folder={selectedFolder}

                isOpen={detailsModalOpen}

                onClose={() => {

                    setDetailsModalOpen(false);

                    setSelectedFolder(null);

                }}

            />


            {/* ========================================
                DELETE FOLDER MODAL
            ======================================== */}

            <DeleteFolderModal

                folder={selectedFolder}

                isOpen={deleteModalOpen}

                onClose={() => {

                    setDeleteModalOpen(false);

                    setSelectedFolder(null);

                }}

                onDeleted={refreshFolders}

            />

        </>

    );

}


// ========================================
// FOLDER CARD
// ========================================

function FolderCard({
    folder,
    onRename,
    onDetails,
    onDelete
}) {
    const navigate = useNavigate();
    // ========================================
    // MENU STATE
    // ========================================

    const [menuOpen, setMenuOpen] =
        useState(false);


    // Reference for menu
    const menuRef = useRef(null);


    // ========================================
    // CLOSE MENU WHEN CLICKING OUTSIDE
    // ========================================

    useEffect(() => {

        const handleOutsideClick = (event) => {

            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target
                )
            ) {

                setMenuOpen(false);

            }

        };


        if (menuOpen) {

            document.addEventListener(
                "mousedown",
                handleOutsideClick
            );

        }


        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

        };

    }, [menuOpen]);


    // ========================================
    // OPEN FOLDER
    // ========================================

    const handleOpen = () => {

    navigate(`/folders/${folder._id}`);

};


    // ========================================
    // FOLDER CARD
    // ========================================

    return (

        <article
            className={`folder-card ${
                menuOpen
                    ? "folder-card-menu-open"
                    : ""
            }`}
            onClick={handleOpen}
        >


            {/* ========================================
                FOLDER ICON
            ======================================== */}

            <div className="folder-icon">

                <Folder
                    size={34}
                    strokeWidth={1.7}
                />

            </div>


            {/* ========================================
                FOLDER INFORMATION
            ======================================== */}

            <div className="folder-content">

                <h2>
                    {folder.name}
                </h2>


                <p>

                    {folder.photoCount || 0}

                    {" "}

                    {folder.photoCount === 1
                        ? "photo"
                        : "photos"}

                </p>

            </div>


            {/* ========================================
                THREE DOT BUTTON
            ======================================== */}

            <button
                type="button"
                className="folder-menu-button"
                aria-label="Folder options"
                onClick={(event) => {

                    event.stopPropagation();

                    setMenuOpen(
                        current => !current
                    );

                }}
            >

                <MoreVertical size={19} />

            </button>


            {/* ========================================
                THREE DOT MENU
            ======================================== */}

            {menuOpen && (

                <div
                    ref={menuRef}
                    onClick={(event) =>
                        event.stopPropagation()
                    }
                >

                    <FolderMenu

                        onOpen={() => {

                            setMenuOpen(false);

                            handleOpen();

                        }}


                        onRename={() => {

                            setMenuOpen(false);

                            onRename(folder);

                        }}


                        onDetails={() => {

                            setMenuOpen(false);

                            onDetails(folder);

                        }}


                        onDelete={() => {

                            setMenuOpen(false);

                            onDelete(folder);

                        }}

                    />

                </div>

            )}

        </article>

    );

}


export default Folders;