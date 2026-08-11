import express from "express";

import {

    createFolder,

    getFolders,

    movePhotoToFolder,

    renameFolder,

    getFolderDetails,

    deleteFolder,

    getDeletedFolders,

    restoreFolder,

    permanentlyDeleteFolder

} from "../controllers/folder.controller.js";


import {

    requireAuth,

    requireAdmin

} from "../middleware/auth.middleware.js";


const router =
    express.Router();


// =====================================================
// CREATE FOLDER
// ADMIN ONLY
// =====================================================

router.post(
    "/",
    requireAuth,
    requireAdmin,
    createFolder
);


// =====================================================
// RECYCLE BIN - GET FOLDERS
// ADMIN ONLY
// IMPORTANT: BEFORE /:folderId
// =====================================================

router.get(
    "/recycle-bin",
    requireAuth,
    requireAdmin,
    getDeletedFolders
);


// =====================================================
// RECYCLE BIN - RESTORE
// ADMIN ONLY
// =====================================================

router.patch(
    "/:folderId/restore",
    requireAuth,
    requireAdmin,
    restoreFolder
);


// =====================================================
// RECYCLE BIN - PERMANENT DELETE
// ADMIN ONLY
// =====================================================

router.delete(
    "/:folderId/permanent",
    requireAuth,
    requireAdmin,
    permanentlyDeleteFolder
);


// =====================================================
// FOLDER DETAILS
// ADMIN ONLY
//
// Returns folder information + photos.
// =====================================================

router.get(
    "/:folderId",
    requireAuth,
    requireAdmin,
    getFolderDetails
);


// =====================================================
// GET ACTIVE FOLDERS
// ADMIN ONLY
//
// IMPORTANT:
// Normal users MUST NOT be able to access folders.
// =====================================================

router.get(
    "/",
    requireAuth,
    requireAdmin,
    getFolders
);


// =====================================================
// MOVE PHOTO TO FOLDER
// ADMIN ONLY
// =====================================================

router.patch(
    "/move-photo/:photoId",
    requireAuth,
    requireAdmin,
    movePhotoToFolder
);


// =====================================================
// RENAME FOLDER
// ADMIN ONLY
// =====================================================

router.patch(
    "/:folderId",
    requireAuth,
    requireAdmin,
    renameFolder
);


// =====================================================
// DELETE FOLDER → RECYCLE BIN
// ADMIN ONLY
// =====================================================

router.delete(
    "/:folderId",
    requireAuth,
    requireAdmin,
    deleteFolder
);


export default router;