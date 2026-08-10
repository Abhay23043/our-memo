import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true
        },

        driveFileId: {
            type: String,
            required: true,
            unique: true
        },

        fileName: {
            type: String,
            required: true
        },

        mimeType: {
            type: String,
            required: true
        },

        size: {
            type: Number
        },

        // Which website folder contains this photo
        folder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Folder",
            default: null
        },

        // Favourite
        isFavorite: {
            type: Boolean,
            default: false
        },

        // Recycle bin
        isDeleted: {
            type: Boolean,
            default: false
        },

        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Photo = mongoose.model("Photo", photoSchema);

export default Photo;