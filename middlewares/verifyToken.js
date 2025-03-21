import jwt from "jsonwebtoken";
import prisma from "../db/prismaClient.js";
export const verifyToken = async(req, res, next) => {
	const token = req.cookies.token;
	if (!token) return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log("decoded", decoded);
		if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });
		const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                role: {
                    include: {
                        permissions: true,  // Include permissions associated with the role
                    },
                },
            },
        });
		//console.log("user", user);
		if (!user) return res.status(401).json({ success: false, message: "Unauthorized - user not found" });
		req.user = user;
		req.userId = decoded.userId;
		next();
	} catch (error) {
		console.log("Error in verifyToken ", error);
		return res.status(500).json({ success: false, message: "Server error" });
	}
};
export const checkPermissions = (permissions) => {
    return (req, res, next) => {
        const userPermissions = req.user.role.permissions.map(permission => permission.permission);

        const hasPermission = permissions.every(permission => userPermissions.includes(permission));

        if (!hasPermission) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    };
};