import { Request, Response } from "express";
import Types_News_Model from "../Model/Types_News_Models";
import unidecode from "unidecode";
import { convertToSlug, randomStringPost } from "../Services/sp";

//THÊM DANH MỤC BÀI VIẾT
async function createTypes_News(req: Request, res: Response) {
    try {
        const name = req.body.name;
        if (name == '') {
            return res.json({ message: 'Vui lòng điền đầy đủ thông tin' })
        }
        //MÃ hóa slug
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

//CẬP NHẬT DANH MỤC BÀI VIẾT
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

//XÓA DANH MỤC BÀI viết
async function deleteType_News(req: Request, res: Response) {
    const id = req.params.id
    try {
        await Types_News_Model.findOneAndDelete({ id: id })
        return res.json({ message: "Đã xóa danh mục bài viết", id })
    } catch (error) {
        res.status(500).json(error)
    }
}

//TÌM KIẾM DANH MỤC BÀI VIẾT
async function loadTypes_News(req: Request, res: Response) {
    try {
        const name = req.body.name
        const type = await Types_News_Model.findOne({ name: name })
        return res.json(type?.name)
    } catch (error) {
        return res.status(500).json(error)
    }
}

async function loadTypes_News2(req: Request, res: Response) {
    try {
        const name = req.body.name
        const type = await Types_News_Model.findOne({ id: name })
        return res.json(type?.name)
    } catch (error) {
        return res.status(500).json(error)
    }
}
//TẤT CẢ DANH MỤC BÀI VIẾT
async function loadAllType_News(req: Request, res: Response) {
    try {
        //load name
        const allType = await Types_News_Model.find({});
        //load all
        // const allCategories = await CategoriesModel.find();
        return res.json(allType);
    } catch (error) {
        return res.json(error);
    }
}

async function getSortedData(priorityId: string) {
    const data = await Types_News_Model.find({});
    // Sắp xếp mềm dựa trên `priorityId`
    const sortedData = data.sort((a, b) => {
        if (a.id === priorityId) return -1; // Đưa phần tử có `id` ưu tiên lên đầu
        if (b.id === priorityId) return 1;  // Giữ nguyên thứ tự
        return 0; // Giữ nguyên thứ tự các phần tử khác
    });
    // console.log(sortedData);
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