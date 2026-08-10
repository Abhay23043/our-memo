import {
    FolderOpen,
    Pencil,
    Info,
    Trash2
} from "lucide-react";

function FolderMenu({
    onOpen,
    onRename,
    onDetails,
    onDelete
}) {

    return (

        <div className="folder-menu">

            <button
                type="button"
                onClick={(event) => {

                    event.stopPropagation();

                    onOpen();

                }}
            >

                <FolderOpen size={17} />

                <span>
                    Open
                </span>

            </button>


            <button
                type="button"
                onClick={(event) => {

                    event.stopPropagation();

                    onRename();

                }}
            >

                <Pencil size={17} />

                <span>
                    Rename
                </span>

            </button>


            <button
                type="button"
                onClick={(event) => {

                    event.stopPropagation();

                    onDetails();

                }}
            >

                <Info size={17} />

                <span>
                    Details
                </span>

            </button>


            <div className="folder-menu-divider" />


            <button
                type="button"
                className="folder-menu-danger"
                onClick={(event) => {

                    event.stopPropagation();

                    onDelete();

                }}
            >

                <Trash2 size={17} />

                <span>
                    Delete
                </span>

            </button>

        </div>
    );
}


export default FolderMenu;