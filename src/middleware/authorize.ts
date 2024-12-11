import { Request, Response, NextFunction } from "express";
import AccountModel from "../Model/Account_Model";

export async function authorize(req: Request, res: Response, next: NextFunction) {
    try {
        const account = await AccountModel.findOne({ username: req.userId }, 'role');
        if (!account) {
            res.status(403).send('Access denied.')
        } 
        // return res.json(account?.role)
        if (account?.role == false) {
            return res.status(403).send('Từ chối truy cập.')
        }else{
            next();
        }
    } catch (error) {
        throw new Error('Error querying role by username');
    }
}
