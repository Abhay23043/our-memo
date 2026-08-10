import express from "express";
import { getDriveFolder } from "../services/googleDrive.service.js";

const router = express.Router();

router.get("/drive", async (req, res) => {

    try {

        const folder = await getDriveFolder();

        res.json({
            success: true,
            folder
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Drive connection failed"
        });

    }

});

export default router;