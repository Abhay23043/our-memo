import { google } from "googleapis";

import dotenv from "dotenv";

import { Readable } from "stream";


dotenv.config();


const oauth2Client =
    new google.auth.OAuth2(

        process.env.GOOGLE_CLIENT_ID,

        process.env.GOOGLE_CLIENT_SECRET,

        process.env.GOOGLE_REDIRECT_URI

    );


oauth2Client.setCredentials({

    refresh_token:
        process.env.GOOGLE_REFRESH_TOKEN

});


const drive =
    google.drive({

        version: "v3",

        auth: oauth2Client

    });


// =====================================================
// GET ROOT DRIVE FOLDER
// =====================================================

export const getDriveFolder =
    async () => {

        const response =
            await drive.files.get({

                fileId:
                    process.env.DRIVE_FOLDER_ID,

                fields:
                    "id,name,mimeType"

            });


        return response.data;

    };


// =====================================================
// UPLOAD FILE
// =====================================================

export const uploadToDrive =
    async (
        file,
        folderId =
            process.env.DRIVE_FOLDER_ID
    ) => {

        const fileMetadata = {

            name:
                file.originalname,

            parents: [
                folderId
            ]

        };


        const media = {

            mimeType:
                file.mimetype,

            body:
                Readable.from(
                    file.buffer
                )

        };


        const response =
            await drive.files.create({

                requestBody:
                    fileMetadata,

                media,

                fields:
                    "id,name,mimeType,size,parents"

            });


        return response.data;

    };


// =====================================================
// CREATE DRIVE FOLDER
// =====================================================

export const createDriveFolder =
    async (
        folderName,
        parentFolderId
    ) => {

        const fileMetadata = {

            name:
                folderName,

            mimeType:
                "application/vnd.google-apps.folder",

            parents: [
                parentFolderId
            ]

        };


        const response =
            await drive.files.create({

                requestBody:
                    fileMetadata,

                fields:
                    "id,name,mimeType,parents"

            });


        return response.data;

    };


// =====================================================
// MOVE FILE
// =====================================================

export const moveFileToFolder =
    async (
        fileId,
        newFolderId
    ) => {

        const file =
            await drive.files.get({

                fileId,

                fields:
                    "parents"

            });


        const previousParents =
            file.data.parents?.join(",") ||
            "";


        const response =
            await drive.files.update({

                fileId,

                addParents:
                    newFolderId,

                removeParents:
                    previousParents,

                fields:
                    "id,name,parents"

            });


        return response.data;

    };


// =====================================================
// GET FILE STREAM
// =====================================================

export const getFileStream =
    async (
        fileId
    ) => {

        const response =
            await drive.files.get(

                {
                    fileId,

                    alt: "media"
                },

                {
                    responseType:
                        "stream"
                }

            );


        return response;

    };


// =====================================================
// RENAME DRIVE FOLDER
// =====================================================

export const renameDriveFolder =
    async (
        folderId,
        newName
    ) => {

        const response =
            await drive.files.update({

                fileId:
                    folderId,

                requestBody: {

                    name:
                        newName

                },

                fields:
                    "id,name,mimeType,parents"

            });


        return response.data;

    };


// =====================================================
// PERMANENT DELETE FROM DRIVE
// =====================================================

export const permanentlyDeleteFromDrive =
    async (
        fileId
    ) => {

        try {

            await drive.files.delete({

                fileId

            });


            return true;

        } catch (error) {

            // File already deleted
            if (
                error?.code === 404
            ) {

                return true;

            }


            throw error;

        }

    };


export default drive;