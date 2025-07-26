import User from "../models/User.model";
import jwt from 'jsonwebtoken';

// middleware to protect routes
export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ success: false, message: "Not authorized, user not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error.message);
        return res.status(401).json({ success: false, message: error.message || "Not authorized, token failed" });
    }
}