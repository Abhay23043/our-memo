import express from "express";
import mongoose from "mongoose";

import upload from "../middleware/upload.middleware.js";

import {
    uploadToDrive,
    getFileStream,
    permanentlyDeleteFromDrive
} from "../services/googleDrive.service.js";

import Photo from "../models/photo.model.js";
import Folder from "../models/folder.model.js";

import {
    requireAuth,
    requireAdmin
} from "../middleware/auth.middleware.js";


const router = express.Router();


// =====================================================
// UPLOAD PHOTO
// POST /api/photos/upload
// =====================================================

router.post(
    "/upload",
    requireAuth,
    requireAdmin,
    upload.single("photo"),

    async (req, res) => {

        try {

            // ==========================================
            // CHECK PHOTO
            // ==========================================

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "Photo is required"
                });

            }


            // ==========================================
            // GET FORM DATA
            // title = OPTIONAL
            // folderId = OPTIONAL
            // ==========================================

            const title =
                req.body.title?.trim() || "";

            const folderId =
                req.body.folderId?.trim() || "";


            // ==========================================
            // VALIDATE FOLDER ID
            // ==========================================

            if (
                folderId &&
                !mongoose.Types.ObjectId.isValid(
                    folderId
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid folder ID"
                });

            }


            // ==========================================
            // FIND SELECTED FOLDER
            // ==========================================

            let folder = null;


            if (folderId) {

                folder =
                    await Folder.findOne({
                        _id: folderId,
                        isDeleted: false
                    });


                if (!folder) {

                    return res.status(404).json({
                        success: false,
                        message: "Folder not found"
                    });

                }

            }


            // ==========================================
            // LOG FILE
            // ==========================================

            console.log(
                "File received:",
                req.file.originalname
            );


            // ==========================================
            // UPLOAD TO GOOGLE DRIVE
            // ==========================================

            const uploadedFile =
                await uploadToDrive(
                    req.file,
                    folder
                        ? folder.driveFolderId
                        : process.env.DRIVE_FOLDER_ID
                );


            console.log(
                "Uploaded to Drive:",
                uploadedFile
            );


            // ==========================================
            // PREPARE PHOTO DATA
            // ==========================================

            const photoData = {

                driveFileId:
                    uploadedFile.id,

                fileName:
                    uploadedFile.name,

                mimeType:
                    uploadedFile.mimeType,

                size:
                    uploadedFile.size,

                folder:
                    folder
                        ? folder._id
                        : null,

                isFavorite:
                    false,

                isDeleted:
                    false,

                deletedAt:
                    null

            };


            // ==========================================
            // TITLE IS OPTIONAL
            // ==========================================

            if (title) {

                photoData.title = title;

            }


            // ==========================================
            // SAVE PHOTO IN MONGODB
            // ==========================================

            const photo =
                await Photo.create(
                    photoData
                );


            // ==========================================
            // SUCCESS RESPONSE
            // ==========================================

            return res.status(201).json({

                success: true,

                message:
                    "Photo uploaded successfully",

                photo,

                file:
                    uploadedFile

            });


        } catch (error) {

            console.error(
                "UPLOAD ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Upload failed",

                error:
                    error.message

            });

        }

    }
);



// =====================================================
// GET ALL PHOTOS
// GET /api/photos
// ADMIN ONLY
// =====================================================

router.get(
    "/",
    requireAuth,
    requireAdmin,

    async (req, res) => {

        try {

            const photos =
                await Photo.find({
                    isDeleted: false
                })
                .populate(
                    "folder",
                    "name"
                )
                .sort({
                    createdAt: -1
                });


            return res.status(200).json({

                success: true,

                photos

            });


        } catch (error) {

            console.error(
                "FETCH PHOTOS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to fetch photos"

            });

        }

    }
);



// =====================================================
// GET PHOTO IMAGE
// GET /api/photos/:id/image
// ADMIN ONLY
// =====================================================

router.get(
    "/:id/image",
    requireAuth,
    requireAdmin,

    async (req, res) => {

        try {

            const photo =
                await Photo.findById(
                    req.params.id
                );


            if (!photo) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Photo not found"

                });

            }


            const response =
                await getFileStream(
                    photo.driveFileId
                );


            res.setHeader(
                "Content-Type",
                photo.mimeType
            );


            response.data.pipe(res);


        } catch (error) {

            console.error(
                "IMAGE FETCH ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load photo"

            });

        }

    }
);



// =====================================================
// MOVE PHOTO TO RECYCLE BIN
// DELETE /api/photos/:id
// =====================================================

router.delete(
    "/:id",
    requireAuth,
    requireAdmin,

    async (req, res) => {

        try {

            const photo =
                await Photo.findById(
                    req.params.id
                );


            if (!photo) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Photo not found"

                });

            }


            // Soft delete

            photo.isDeleted = true;

            photo.deletedAt = new Date();


            await photo.save();


            return res.status(200).json({

                success: true,

                message:
                    "Photo moved to recycle bin"

            });


        } catch (error) {

            console.error(
                "RECYCLE BIN ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to move photo to recycle bin"

            });

        }

    }
);



// =====================================================
// GET RECYCLE BIN
// GET /api/photos/recycle-bin
// ADMIN ONLY
// =====================================================

router.get(
    "/recycle-bin",
    requireAuth,
    requireAdmin,

    async (req, res) => {

        try {

            const photos =
                await Photo.find({
                    isDeleted: true
                })
                .populate(
                    "folder",
                    "name"
                )
                .sort({
                    deletedAt: -1
                });


            return res.status(200).json({

                success: true,

                photos

            });


        } catch (error) {

            console.error(
                "RECYCLE BIN FETCH ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to fetch recycle bin"

            });

        }

    }
);



// =====================================================
// RESTORE PHOTO
// PATCH /api/photos/:id/restore
// =====================================================

router.patch(
    "/:id/restore",
    requireAuth,
    requireAdmin,

    async (req, res) => {

        try {

            const photo =
                await Photo.findOne({

                    _id:
                        req.params.id,

                    isDeleted:
                        true

                });


            if (!photo) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Deleted photo not found"

                });

            }


            photo.isDeleted = false;

            photo.deletedAt = null;


            await photo.save();


            return res.status(200).json({

                success: true,

                message:
                    "Photo restored successfully",

                photo

            });


        } catch (error) {

            console.error(
                "RESTORE ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to restore photo",

                error:
                    error.message

            });

        }

    }
);



// =====================================================
// PERMANENT DELETE
// DELETE /api/photos/:id/permanent
// =====================================================

router.delete(
    "/:id/permanent",
    requireAuth,
    requireAdmin,

    async (req, res) => {

        try {

            const photo =
                await Photo.findOne({

                    _id:
                        req.params.id,

                    isDeleted:
                        true

                });


            if (!photo) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Photo not found in recycle bin"

                });

            }


            // Delete from Google Drive

            await permanentlyDeleteFromDrive(
                photo.driveFileId
            );


            // Delete from MongoDB

            await Photo.findByIdAndDelete(
                photo._id
            );


            return res.status(200).json({

                success: true,

                message:
                    "Photo permanently deleted"

            });


        } catch (error) {

            console.error(
                "PERMANENT DELETE ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to permanently delete photo"

            });

        }

    }
);



// =====================================================
// GET FAVORITES
// GET /api/photos/favorites
// ADMIN ONLY
// =====================================================

router.get(
    "/favorites",
    requireAuth,
    requireAdmin,

    async (req, res) => {

        try {

            const photos =
                await Photo.find({

                    isFavorite:
                        true,

                    isDeleted:
                        false

                })
                .populate(
                    "folder",
                    "name"
                )
                .sort({
                    updatedAt: -1
                });


            return res.status(200).json({

                success: true,

                photos

            });


        } catch (error) {

            console.error(
                "GET FAVORITES ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to fetch favorites"

            });

        }

    }
);



// =====================================================
// TOGGLE FAVORITE
// PATCH /api/photos/:id/favorite
// ADMIN ONLY
// =====================================================

router.patch(
    "/:id/favorite",
    requireAuth,
    requireAdmin,

    async (req, res) => {

        try {

            const photo =
                await Photo.findOne({

                    _id:
                        req.params.id,

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


            photo.isFavorite =
                !photo.isFavorite;


            await photo.save();


            return res.status(200).json({

                success: true,

                message:
                    photo.isFavorite
                        ? "Added to favorites"
                        : "Removed from favorites",

                isFavorite:
                    photo.isFavorite

            });


        } catch (error) {

            console.error(
                "FAVORITE ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to update favorite"

            });

        }

    }
);



// =====================================================
// GET PHOTOS OF FOLDER
// GET /api/photos/folder/:folderId
// ADMIN ONLY
// =====================================================

router.get(
    "/folder/:folderId",
    requireAuth,
    requireAdmin,

    async (req, res) => {

        try {

            const photos =
                await Photo.find({

                    folder:
                        req.params.folderId,

                    isDeleted:
                        false

                })
                .populate(
                    "folder",
                    "name"
                )
                .sort({
                    createdAt: -1
                });


            return res.status(200).json({

                success: true,

                photos

            });


        } catch (error) {

            console.error(
                "FOLDER PHOTOS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to fetch folder photos"

            });

        }

    }
);


export default router;