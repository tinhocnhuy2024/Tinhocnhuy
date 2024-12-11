import { Request, Response } from "express";
import TagModel from "../Model/Tag_Models";

async function createTag(req: Request, res: Response) {
    try {
        const tag = req.body.tag;
        // const tagRegex=/^\S+$/;
        const findTag = await TagModel.findOne({ name: tag })
        if (findTag) {
            return res.status(500).json({ message: "Tag đã tồn tại" });
        }
        // if (!tagRegex.test(tag)){
        //     return res.status(500).json({ message: "Tag không được chứa kí tự khoảng trắng" });
        // }
        else {
            await TagModel.create({
                name: tag
            })
            return res.json({ message: "Thêm Tag thành công", tag})
        }
    } catch (error) {
        return res.status(500).json(error)
    }
}

async function deleteTag(req: Request, res: Response) {
    try {
        const tag = req.body.tag;
        await TagModel.findOneAndDelete({ name: tag })
        return res.json({ message: "Đã xóa", tag})
    } catch (error) {
        return res.status(500).json(error)
    }
}

async function loadAllTag(req: Request, res: Response) {
    try {
        const AllTag = await TagModel.find({});
        return res.json(AllTag);
    } catch (error) {
        return res.status(500).json(error)
    }
}

export const Tag = {
    createTag,
    deleteTag,
    loadAllTag
}