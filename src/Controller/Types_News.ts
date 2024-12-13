import { Request, Response } from "express";
import Types_News_Model from "../Model/Types_News_Models";
import { convertToSlug } from "../Services/sp";

async function createTypes_News(req: Request, res: Response) {
    try {
        const name = req.body.name;
        if (name == '') {
            return res.json({ message: 'Vui lòng điền đầy đủ thông tin' })
        }
        const id = convertToSlug(name)
        const findIdCategories_News = await Types_News_Model.findOne({ id: id })
        if (findIdCategories_News) {
            return res.json({ message: 'Danh mục đã tồn tại' })
        }
        await Types_News_Model.create({
            id: id,
            name: name
        })
        return res.json({ message: 'Tạo danh mục bài viết thành công', id })
    } catch (error) {
        res.status(500).json(error)
    }
}

async function updateTypes_News(req: Request, res: Response) {
    const id = req.params.id;
    const name = req.body.name;
    try {
        await Types_News_Model.findOneAndUpdate({ id: id }, {
            name: name
        })
        return res.json({ message: "Cập nhật thành công", id })
    } catch (error) {
        res.status(500).json(error)
    }
}

async function deleteType_News(req: Request, res: Response) {
    const id = req.params.id
    try {
        await Types_News_Model.findOneAndDelete({ id: id })
        return res.json({ message: "Đã xóa danh mục bài viết", id })
    } catch (error) {
        res.status(500).json(error)
    }
}

async function loadTypes_News(req: Request, res: Response) {
    try {
        const name = req.body.name
        const type = await Types_News_Model.findOne({ name: name })
        return res.json(type?.name)
    } catch (error) {
        return res.status(500).json(error)
    }
}

async function loadAllType_News(req: Request, res: Response) {
    try {
        const allType = await Types_News_Model.find({});
        return res.json(allType);
    } catch (error) {
        return res.json(error);
    }
}

async function getSortedData(priorityId: string) {
    const data = await Types_News_Model.find({});
    const sortedData = data.sort((a, b) => {
        if (a.id === priorityId) return -1;
        if (b.id === priorityId) return 1;
        return 0;
    });
    return sortedData
}

async function sort(req: Request, res: Response) {
    const id = req.params.id
  const get = await getSortedData(id)
    return res.json(get)
}

export const Types_News = {
    createTypes_News,
    updateTypes_News,
    deleteType_News,
    loadTypes_News,
    loadAllType_News,
    sort
}