import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    // 💡 FIX: req.headers.authorization (plural 'headers')
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({
            message: "Not authorized, no token"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // Yeh authController me `req.userId` se exact match kar raha hai 👍
        next();
    } catch {
        return res.status(401).json({
            message: "Not authorized, token invalid"
        }); 
    }
};