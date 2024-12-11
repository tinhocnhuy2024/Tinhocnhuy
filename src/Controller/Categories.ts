import { Request, Response } from "express";
import CategoriesModel from "../Model/Categories_Model";
import { randomStringPost, convertToSlug } from "../Services/sp";

async function createCategories(req: Request, res: Response) {
    try {
        const name = req.body.name;
        const id = convertToSlug(name)
        const findIdCategories = await CategoriesModel.findOne({ id: id })
        var newIdCategory
        if (!findIdCategories) {
            newIdCategory = id
        } else {
            newIdCategory = id + '-' + randomStringPost
        }

        if (name == '') {
            return res.json("Vui lòng điền đẩy đủ thông tin");
        }
        await CategoriesModel.create({
            id: newIdCategory,
            name: name
        })
        return res.json({ message: "Tạo Danh Mục thành công", newIdCategory});
    } catch (error) {
        res.json(error)
    }
}

async function updateCategories(req: Request, res: Response) {
    const id = req.params.id;
    const name = req.body.name;
    try {
        await CategoriesModel.findOneAndUpdate({ id: id }, {
            name: name
        })
        return res.json({ message: "Cập nhật thành công", id})
    } catch (error) {
        res.status(500).json(error)
    }
}

async function deleteCategories(req: Request, res: Response) {
    const id = req.params.id
    try {
        await CategoriesModel.findOneAndDelete({ id: id })
        return res.json({ message: "Đã xóa danh mục", id})
    } catch (error) {
        return res.status(500).json(error)
    }
}

async function loadCategories(req: Request, res: Response) {
    try {
        const name = req.body.name
        const categorie = await CategoriesModel.findOne({ name: name })
        return res.json(categorie?.name)
    } catch (error) {
        return res.status(500).json(error)
    }
}

async function loadAllCategories(req: Request, res: Response) {
    try {
        const allCategories = await CategoriesModel.find({});
        return res.json(allCategories);
    } catch (error) {
        return res.json(error);
    }
}

export const Categories = {
    createCategories,
    updateCategories,
    deleteCategories,
    loadCategories,
    loadAllCategories
}