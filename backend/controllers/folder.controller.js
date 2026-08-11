import mongoose from "mongoose";

import Folder from "../models/folder.model.js";
import Photo from "../models/photo.model.js";

import {
    createDriveFolder,
    moveFileToFolder,
    renameDriveFolder,
    permanentlyDeleteFromDrive
} from "../services/googleDrive.service.js";


// =====================================================
// ADMIN ACCESS GUARD
// Defense-in-depth
// =====================================================

const requireControllerAdmin = (req, res) => {

    if (req.user?.role !== "admin") {

        res.status(403).json({

            success: false,

            message:
                "Admin access required"

        });

        return false;

    }

    return true;

};


// =====================================================
// CREATE FOLDER
// ADMIN ONLY
// =====================================================

export const createFolder = async (
    req,
    res
) => {

    if (!requireControllerAdmin(req, res)) {
        return;
    }


    try {

        const {
            name,
            parentFolder
        } = req.body;


        if (
            !name ||
            !name.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Folder name is required"

            });

        }


        let parentDriveFolderId =
            process.env.DRIVE_FOLDER_ID;

        let parentFolderId = null;


        // =================================================
        // OPTIONAL PARENT FOLDER
        // =================================================

        if (parentFolder) {

            if (
                !mongoose.Types.ObjectId.isValid(
                    parentFolder
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid parent folder ID"

                });

            }


            const parent =
                await Folder.findOne({

                    _id:
                        parentFolder,

                    isDeleted:
                        false

                });


            if (!parent) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Parent folder not found"

                });

            }


            parentDriveFolderId =
                parent.driveFolderId;

            parentFolderId =
                parent._id;

        }


        // =================================================
        // CREATE GOOGLE DRIVE FOLDER
        // =================================================

        const driveFolder =
            await createDriveFolder(

                name.trim(),

                parentDriveFolderId

            );


        // =================================================
        // CREATE MONGODB FOLDER
        // =================================================

        const folder =
            await Folder.create({

                name:
                    name.trim(),

                driveFolderId:
                    driveFolder.id,

                parentFolder:
                    parentFolderId,

                isDeleted:
                    false,

                deletedAt:
                    null

            });


        return res.status(201).json({

            success: true,

            message:
                "Folder created successfully",

            folder

        });


    } catch (error) {

        console.error(
            "CREATE FOLDER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create folder",

            error:
                error.message

        });

    }

};


// =====================================================
// GET ACTIVE FOLDERS
// ADMIN ONLY
// =====================================================

export const getFolders = async (
    req,
    res
) => {

    if (!requireControllerAdmin(req, res)) {
        return;
    }


    try {

        const folders =
            await Folder.find({

                isDeleted:
                    false

            })
            .populate(
                "parentFolder",
                "name"
            )
            .sort({

                createdAt:
                    -1

            })
            .lean();


        // =================================================
        // PHOTO COUNT
        // =================================================

        const foldersWithPhotoCount =
            await Promise.all(

                folders.map(
                    async (
                        folder
                    ) => {

                        const photoCount =
                            await Photo.countDocuments({

                                folder:
                                    folder._id,

                                isDeleted:
                                    false

                            });


                        return {

                            ...folder,

                            photoCount

                        };

                    }
                )

            );


        return res.status(200).json({

            success: true,

            folders:
                foldersWithPhotoCount

        });


    } catch (error) {

        console.error(
            "GET FOLDERS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to fetch folders"

        });

    }

};


// =====================================================
// GET FOLDER DETAILS
// ADMIN ONLY
// =====================================================

export const getFolderDetails = async (
    req,
    res
) => {

    if (!requireControllerAdmin(req, res)) {
        return;
    }


    try {

        const {
            folderId
        } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                folderId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid folder ID"

            });

        }


        const folder =
            await Folder.findOne({

                _id:
                    folderId,

                isDeleted:
                    false

            })
            .populate(
                "parentFolder",
                "name"
            );


        if (!folder) {

            return res.status(404).json({

                success: false,

                message:
                    "Folder not found"

            });

        }


        const photos =
            await Photo.find({

                folder:
                    folder._id,

                isDeleted:
                    false

            })
            .sort({

                createdAt:
                    -1

            });


        return res.status(200).json({

            success: true,

            folder,

            photos

        });


    } catch (error) {

        console.error(
            "GET FOLDER DETAILS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load folder"

        });

    }

};


// =====================================================
// MOVE PHOTO TO FOLDER
// ADMIN ONLY
// =====================================================

export const movePhotoToFolder = async (
    req,
    res
) => {

    if (!requireControllerAdmin(req, res)) {
        return;
    }


    try {

        const {
            photoId
        } = req.params;


        const {
            folderId
        } = req.body;


        if (
            !mongoose.Types.ObjectId.isValid(
                photoId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid photo ID"

            });

        }


        if (
            !folderId ||
            !mongoose.Types.ObjectId.isValid(
                folderId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid folder ID is required"

            });

        }


        const photo =
            await Photo.findOne({

                _id:
                    photoId,

                isDeleted:
                    false

            });


        if (!photo) {

            return res.status(404).json({

                success: false,

                message:
                    "Photo not found"

            });

        }


        const folder =
            await Folder.findOne({

                _id:
                    folderId,

                isDeleted:
                    false

            });


        if (!folder) {

            return res.status(404).json({

                success: false,

                message:
                    "Folder not found"

            });

        }


        // =================================================
        // MOVE GOOGLE DRIVE FILE
        // =================================================

        await moveFileToFolder(

            photo.driveFileId,

            folder.driveFolderId

        );


        // =================================================
        // UPDATE MONGODB
        // =================================================

        photo.folder =
            folder._id;

        await photo.save();


        return res.status(200).json({

            success: true,

            message:
                "Photo moved successfully",

            photo

        });


    } catch (error) {

        console.error(
            "MOVE PHOTO ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to move photo"

        });

    }

};


// =====================================================
// RENAME FOLDER
// ADMIN ONLY
// =====================================================

export const renameFolder = async (
    req,
    res
) => {

    if (!requireControllerAdmin(req, res)) {
        return;
    }


    try {

        const {
            folderId
        } = req.params;


        const {
            name
        } = req.body;


        if (
            !mongoose.Types.ObjectId.isValid(
                folderId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid folder ID"

            });

        }


        if (
            !name ||
            !name.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Folder name is required"

            });

        }


        const folder =
            await Folder.findOne({

                _id:
                    folderId,

                isDeleted:
                    false

            });


        if (!folder) {

            return res.status(404).json({

                success: false,

                message:
                    "Folder not found"

            });

        }


        // =================================================
        // RENAME GOOGLE DRIVE FOLDER
        // =================================================

        await renameDriveFolder(

            folder.driveFolderId,

            name.trim()

        );


        // =================================================
        // UPDATE MONGODB
        // =================================================

        folder.name =
            name.trim();

        await folder.save();


        return res.status(200).json({

            success: true,

            message:
                "Folder renamed successfully",

            folder

        });


    } catch (error) {

        console.error(
            "RENAME FOLDER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to rename folder"

        });

    }

};


// =====================================================
// MOVE FOLDER TO RECYCLE BIN
// ADMIN ONLY
// =====================================================

export const deleteFolder = async (
    req,
    res
) => {

    if (!requireControllerAdmin(req, res)) {
        return;
    }


    try {

        const {
            folderId
        } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                folderId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid folder ID"

            });

        }


        const folder =
            await Folder.findOne({

                _id:
                    folderId,

                isDeleted:
                    false

            });


        if (!folder) {

            return res.status(404).json({

                success: false,

                message:
                    "Folder not found"

            });

        }


        // =================================================
        // MOVE FOLDER TO RECYCLE BIN
        // =================================================

        folder.isDeleted =
            true;

        folder.deletedAt =
            new Date();

        await folder.save();


        // =================================================
        // MOVE PHOTOS TO RECYCLE BIN
        // =================================================

        await Photo.updateMany(

            {

                folder:
                    folder._id,

                isDeleted:
                    false

            },

            {

                $set: {

                    isDeleted:
                        true,

                    deletedAt:
                        new Date()

                }

            }

        );


        return res.status(200).json({

            success: true,

            message:
                "Folder moved to recycle bin"

        });


    } catch (error) {

        console.error(
            "DELETE FOLDER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to move folder to recycle bin"

        });

    }

};


// =====================================================
// GET DELETED FOLDERS
// ADMIN ONLY
// =====================================================

export const getDeletedFolders = async (
    req,
    res
) => {

    if (!requireControllerAdmin(req, res)) {
        return;
    }


    try {

        const folders =
            await Folder.find({

                isDeleted:
                    true

            })
            .populate(
                "parentFolder",
                "name"
            )
            .sort({

                deletedAt:
                    -1

            });


        return res.status(200).json({

            success: true,

            folders

        });


    } catch (error) {

        console.error(
            "GET DELETED FOLDERS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to fetch deleted folders"

        });

    }

};


// =====================================================
// RESTORE FOLDER
// ADMIN ONLY
// =====================================================

export const restoreFolder = async (
    req,
    res
) => {

    if (!requireControllerAdmin(req, res)) {
        return;
    }


    try {

        const {
            folderId
        } = req.params;


        const folder =
            await Folder.findOne({

                _id:
                    folderId,

                isDeleted:
                    true

            });


        if (!folder) {

            return res.status(404).json({

                success: false,

                message:
                    "Deleted folder not found"

            });

        }


        // =================================================
        // RESTORE FOLDER
        // =================================================

        folder.isDeleted =
            false;

        folder.deletedAt =
            null;

        await folder.save();


        // =================================================
        // RESTORE PHOTOS
        // =================================================

        await Photo.updateMany(

            {

                folder:
                    folder._id,

                isDeleted:
                    true

            },

            {

                $set: {

                    isDeleted:
                        false,

                    deletedAt:
                        null

                }

            }

        );


        return res.status(200).json({

            success: true,

            message:
                "Folder restored successfully",

            folder

        });


    } catch (error) {

        console.error(
            "RESTORE FOLDER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to restore folder"

        });

    }

};


// =====================================================
// PERMANENTLY DELETE FOLDER
// ADMIN ONLY
// =====================================================

export const permanentlyDeleteFolder =
    async (
        req,
        res
    ) => {

        if (!requireControllerAdmin(req, res)) {
            return;
        }


        try {

            const {
                folderId
            } = req.params;


            const folder =
                await Folder.findOne({

                    _id:
                        folderId,

                    isDeleted:
                        true

                });


            if (!folder) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Folder not found in recycle bin"

                });

            }


            // =================================================
            // FIND DELETED PHOTOS
            // =================================================

            const photos =
                await Photo.find({

                    folder:
                        folder._id

                });


            // =================================================
            // DELETE PHOTOS FROM GOOGLE DRIVE
            // =================================================

            for (
                const photo of photos
            ) {

                try {

                    await permanentlyDeleteFromDrive(

                        photo.driveFileId

                    );

                } catch (
                    driveError
                ) {

                    console.error(

                        "DRIVE PHOTO DELETE ERROR:",

                        driveError

                    );

                }

            }


            // =================================================
            // DELETE PHOTO METADATA
            // =================================================

            await Photo.deleteMany({

                folder:
                    folder._id

            });


            // =================================================
            // DELETE DRIVE FOLDER
            // =================================================

            try {

                await permanentlyDeleteFromDrive(

                    folder.driveFolderId

                );

            } catch (
                driveError
            ) {

                console.error(

                    "DRIVE FOLDER DELETE ERROR:",

                    driveError

                );

            }


            // =================================================
            // DELETE MONGODB FOLDER
            // =================================================

            await Folder.findByIdAndDelete(

                folder._id

            );


            return res.status(200).json({

                success: true,

                message:
                    "Folder permanently deleted"

            });


        } catch (error) {

            console.error(

                "PERMANENT FOLDER DELETE ERROR:",

                error

            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to permanently delete folder"

            });

        }

    };