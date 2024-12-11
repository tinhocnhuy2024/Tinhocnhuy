import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { CONFIG } from '../config/config';
import AccountModel from '../Model/Account_Model';

export function generateAccessToken(user: any) {
    return jwt.sign({ user }, CONFIG.jwt.access, { expiresIn: '3h' })
}

export function generateRefreshToken(user: any) {
    return jwt.sign({ user }, CONFIG.jwt.refresh, { expiresIn: '365d' })
}

interface AuthTokenPayload {
    user: string;
}

export const middleware = function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Vui lòng đăng nhập để tiếp tục" });
    }
    try {
        const decodedToken = jwt.verify(token, CONFIG.jwt.access) as AuthTokenPayload;
        req.userId = decodedToken.user;
        next();
    } catch (error) {
        res.status(401).json(error)
    }
}

export function checkToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
        try {
            const decodedToken = jwt.verify(token, CONFIG.jwt.access) as AuthTokenPayload;
            req.userId = decodedToken.user;

            return res.json(true);
        } catch (err) {
            console.error("Error verifying token:", err);
        }
    }
    return res.json(false);
}

function findRefreshToken(refreshToken: string): Promise<JwtPayload | null> {
    return AccountModel.findOne({ refreshtoken: refreshToken }).exec();
}

export async function requestRefreshToken(req: Request, res: Response,) {
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader && authHeader.split(" ")[1];
    if (!refreshToken) {
        return res.status(401).json({ message: 'Token không tồn tại.' });
    }
    try {
        const decodedToken = jwt.verify(refreshToken, CONFIG.jwt.refresh) as { user: any };
        if (!decodedToken) {
            return res.status(401).json({ message: 'Invalid refresh token.' });
        }
        const refreshtokendoc = await findRefreshToken(refreshToken);
        if (!refreshtokendoc) {
            return res.status(401).json({ message: 'Token không tồn tại.' });
        }
        const new_accessToken = generateAccessToken(decodedToken.user);
        return res.json({ accesstoken: new_accessToken });
    } catch (error) {
        return res.status(500).json(error)
    }

}
