import AccountModel from "../Model/Account_Model";
import { Request, Response } from "express";

async function AllAccount(req: Request, res: Response) {
    const account = await AccountModel.find({}).select('username fullname email role')
    return res.json(account)
}

async function updateRole(req: Request, res: Response) {
    try {
        const username = req.params.username;
        const role = req.body.role;
        if (req.userId == username) {
            return res.status(400).json("Bạn đang là Admin!!!")
        } else {
            await AccountModel.findOneAndUpdate({ username: username },
                {
                    role: role
                })
            return res.json({ message: "Cập nhật thành công" })
        }
    } catch (error) {
        return res.json({ message: error })
    }

}

export const Authentication = {
    AllAccount,
    updateRole
}