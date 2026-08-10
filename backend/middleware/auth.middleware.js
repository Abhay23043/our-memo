import User from "../models/user.model.js";

export const requireAuth = async (req, res, next) => {

    try {

        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const user = await User.findById(
            req.session.userId
        ).select("-password");

        if (!user) {

            req.session.destroy(() => {});

            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;

        next();

    } catch (error) {

        console.error("AUTH ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Authentication check failed"
        });
    }
};

export const requireAdmin = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    next();
};