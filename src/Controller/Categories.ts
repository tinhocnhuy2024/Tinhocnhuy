import { Request, Response } from "express";
import CategoriesModel from "../Model/Categories_Model";
import unidecode from "unidecode";
import { randomStringPost, convertToSlug } from "../Services/sp";

//THÊM DANH MỤC
async function createCategories(req: Request, res: Response) {
    try {
        const name = req.body.name;
        //mã hóa Loại bài viết
        const id = convertToSlug(name)

        // const titleNoAccent = unidecode(name);
        // const encodedStr = encodeURIComponent(titleNoAccent).replace(/%20/g, '-');
        // const id = decodeURIComponent(encodedStr);

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

//CẬP NHẬT DANH MỤC
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

//XÓA DANH MỤC
async function deleteCategories(req: Request, res: Response) {
    const id = req.params.id
    try {
        await CategoriesModel.findOneAndDelete({ id: id })
        return res.json({ message: "Đã xóa danh mục", id})
    } catch (error) {
        return res.status(500).json(error)
    }
}

//TÌM KIẾM DANH MỤC
async function loadCategories(req: Request, res: Response) {
    try {
        const name = req.body.name
        const categorie = await CategoriesModel.findOne({ name: name })
        return res.json(categorie?.name)
    } catch (error) {
        return res.status(500).json(error)
    }
}
//TẤT CẢ DANH MỤC
async function loadAllCategories(req: Request, res: Response) {
    try {
        //load name
        const allCategories = await CategoriesModel.find({});
        //load all
        // const allCategories = await CategoriesModel.find();
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