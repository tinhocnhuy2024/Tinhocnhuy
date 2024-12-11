import { Request, Response } from "express";
import { randomStringPost } from "../Services/sp";
import { NewsModel } from "../Model/News_Models";
import Types_News_Model from "../Model/Types_News_Models"
import { uploadImageToCloudinary, deleteImageFromCloudinary, convertToSlug} from "../Services/sp"
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

//UPLOAD HÌNH ẢNH LÊN CLOUDINARY KHI CHỌN HÌNH ẢNH TẠO BÀI VIẾT
var publicId: any;
async function uploadImagesNews2(req: Request, res: Response) {
    const file = req.file?.path;
    if (!file) {
        console.error('No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        const result = await cloudinary.uploader.upload(file, { folder: 'Tinhocnhuy' });
        res.json({ location: result.secure_url });
        publicId = result.public_id
        console.log({ publicId: result.public_id })
        fs.unlink(file, (err) => {
            if (err) {
                console.error('Error deleting uploaded file:', err);
            } else {
                console.log('Uploaded file deleted:', file);
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Upload failed:' + err });
    }
}


export async function uploadImagesNews(req: Request, res: Response) {
    const fileBuffer = req.file?.buffer;
    if (!fileBuffer) {
        console.error('No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        const result = await cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: 'Tinhocnhuy' },
            async (error, result) => {
                if (error) {
                    console.error('Upload failed:', error);
                    return res.status(500).json({ error: 'Upload failed' });
                }
                if (result) { // Kiểm tra result có giá trị không
                    console.log('Upload success:', result);
                    res.json({ location: result.secure_url });
                    publicId = result.public_id
                }
            }
        ).end(fileBuffer);
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Upload failed:' + err });
    }
}

//THÊM TIN TỨC
async function get_CreateNews(req: Request, res: Response) {
    res.render('createNews.ejs')
}

interface TempMulterFile extends Express.Multer.File {
    buffer: Buffer;
}

async function post_CreateNews(req: Request, res: Response) {
    let thumbnailUrl: string | null = null;
    try {
        const title = req.body.title;
        const description = req.body.description;
        const linkfile = req.file as TempMulterFile;
        const content = req.body.content;
        const nametypes = req.body.types;
        const tag = req.body.tag;

        if (title == '' || description == '' || content == '' || nametypes == '') {
            deleteImageFromCloudinary(publicId)
            return res.json({ message: "Vui lòng điền đầy đủ thông tin" })
        }

        if (!linkfile) {
            return res.status(400).json({ error: 'No image provided.' });
        }

        const types = await Types_News_Model.findOne({ name: nametypes })
        if (!types) {
            deleteImageFromCloudinary(publicId)
            return res.json({ message: "Không tìm thấy danh mục bài viết" })
        }
        //mã hóa slug
        const slug = convertToSlug(title)

        const idNews = await NewsModel.findOne({ id: slug })
        var id
        if (!idNews) {
            id = slug
        } else {
            id = slug + '-' + randomStringPost
        }
        thumbnailUrl = await uploadImageToCloudinary(linkfile);
        const newPost = await NewsModel.create({
            id: id,//Id Post
            title: title,
            slug: id,
            description: description,
            avatar: thumbnailUrl,
            content: content,
            username: req.userId,
            // username: "admindemo",
            // account: accountId,
            typesid: types.id,
            tag: tag
        });
        // return res.json(newPost);

        // fs.unlink(linkfile.path, (err) => {
        //     if (err) {
        //         console.error('Error deleting uploaded file:', err);
        //     } else {
        //         console.log('Uploaded file deleted:', linkfile.path);
        //     }
        // });

        return res.json({ message: "Thêm thành công", id })
    } catch (error) {
        deleteImageFromCloudinary(publicId)
        console.log(error);
        return res.status(500).json({ message: 'Internal server error:' + error });
    }
}

//CẬP NHẬT TIN TỨC
async function updateNews(req: Request, res: Response) {
    let thumbnailUrl: string | null = null;
    try {
        const id = req.params.id;
        const { title, slug, description, content, tag } = req.body;
        const nametypes = req.body.types;
        const linkfile = req.file as TempMulterFile;
        // if (title == '' || description == '' || content == '' || linkfile == '' || nametypes == '') {
        //     deleteImageFromCloudinary(publicId)
        //     return res.json({ message: "Vui lòng điền đầy đủ thông tin" })
        // }

        // if (!linkfile) {
        //     return res.status(400).json({ error: 'No image provided.' });
        // }

        const types = await Types_News_Model.findOne({ name: nametypes })
        if (!types) {
            deleteImageFromCloudinary(publicId)
            return res.json({ message: "Không tìm thấy Loại tin tức" })
        }
        // const findtag = await TagModel.findOne({ name: tag })
        // if (!findtag) {
        //     deleteImageFromCloudinary(publicId)
        //     return res.json({ message: "Không tìm thấy Tag" })
        // }
        // else {
        // }

        if (!linkfile) {
            await NewsModel.findOneAndUpdate({ id: id }, {
                title: title,
                slug: slug,
                description: description,
                content: content,
                typesid: types.id,
                tag: tag
            })
            return res.json({ message: "Cập nhật thành công", id })
        } else {
            thumbnailUrl = await uploadImageToCloudinary(linkfile);
            await NewsModel.findOneAndUpdate({ id: id }, {
                title: title,
                slug: slug,
                description: description,
                avatar: thumbnailUrl,
                content: content,
                typesid: types.id,
                tag: tag
            })
            return res.json({ message: "Cập nhật thành công", id })
        }
    } catch (error) {
        deleteImageFromCloudinary(publicId)
        return res.status(500).json(error)
    }
}

//XÓA TIN TỨC
async function deleteNews(req: Request, res: Response) {
    const id = req.params.id;
    try {
        const post = await NewsModel.findOne({ id: id });

        const idthumnail = post?.avatar
        if (idthumnail) {
            const urlObject = new URL(idthumnail);
            const path = urlObject.pathname;
            const idImage = path.substring(path.indexOf('Tinhocnhuy/'), path.lastIndexOf('.'));
            await deleteImageFromCloudinary(idImage)
        }

        const imageRegex = /src="([^"]+)"/g;
        const imageUrlMatches = post?.content.match(imageRegex);
        if (imageUrlMatches) {
            await Promise.all(imageUrlMatches.map(async (imageUrlMatch) => {
                const imageUrl = imageUrlMatch.match(/src="([^"]+)"/)?.[1];
                if (imageUrl) {
                    const urlObject = new URL(imageUrl);
                    const path = urlObject.pathname;
                    const idImage = path.substring(path.indexOf('Tinhocnhuy/'), path.lastIndexOf('.'));
                    console.log(idImage);
                    await deleteImageFromCloudinary(idImage);
                }
            }));
        }

        await NewsModel.deleteOne({ id: id });
        return res.json({ message: "Đã xóa bài viết", id });
    } catch (error) {
        res.status(500).json(error);
    }
}

//HIỂN THỊ CHI TIẾT TIN TỨC
async function loadNews(req: Request, res: Response) {
    const newsSlug = req.params.slug
    const news = await NewsModel.findOne({ slug: newsSlug })
    if (!news) {
        res.status(505).json({ message: "Bài viết không tồn tại" });
    } else {
        // res.render('news.ejs', { news: news.content })
        res.json(news)
    }
}

//HIỂN THỊ CHI TIẾT TIN TỨC THEO ID
async function loadNewsId(req: Request, res: Response) {
    const id = req.params.id
    const news = await NewsModel.findOne({ id: id })
    if (!news) {
        res.status(505).json({ message: "Bài viết không tồn tại" });
    } else {
        // res.render('news.ejs', { news: news.content })
        res.json(news)
    }
}

// DANH SÁCH TẤT CẢ BÀI VIẾT
async function loadAllNews(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 8;
    const startIndex = (page - 1) * limit;

    try {
        // Lấy tất cả bài viết và phân trang
        const news = await NewsModel.find({})
            .select('id title slug description avatar date')
            .sort({ date: -1 })
            .lean()
            .skip(startIndex)
            .limit(limit)
            .exec();

        // Đếm tổng số bài viết
        const totalArticles = await NewsModel.countDocuments().exec();

        //         // Định dạng trường ngày trong kết quả
        const formattedResult = news.map(item => ({
            ...item,
            date: item.date instanceof Date ? item.date.toISOString().split('T')[0] : item.date,
        }));

        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(totalArticles / limit);
        const currentPage = Math.min(page, totalPages);

        // Trả về kết quả phân trang
        const paginationResult = {
            data: formattedResult,
            total: totalArticles,
            pages: totalPages,
            currentPage: currentPage,
            limit: limit
        };
        return res.json(paginationResult);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}


//HIỂN THỊ NGẪU NHIÊN TIN TỨC
async function loadRandomNews(req: Request, res: Response) {
    try {
        const numberOfRecords = 5;
        const news = await NewsModel.aggregate([
            { $sample: { size: numberOfRecords } },
            { $limit: numberOfRecords },
            { $project: { _id: 0, title: 1, description: 1, avatar: 1 } }
        ])
        return res.json(news)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

//DANH SÁCH BÀI VIẾT THEO DANH MỤC
async function loadNews_Types(req: Request, res: Response) {
    const typesid = req.params.id

    const page = parseInt(req.query.page as string) || 1;
    const limit = 8
    const startIndex = (page - 1) * limit;

    try {
        const news = await NewsModel.find({ typesid: typesid }).select('id title slug description avatar date').sort({ date: -1 }).lean().skip(startIndex).limit(limit).exec();

        // Đếm tổng số bài viết
        const totalArticles = await NewsModel.countDocuments({ typesid: typesid }).exec();

        // Định dạng trường ngày trong kết quả
        const formattedResult = news.map(item => ({
            ...item,
            date: item.date instanceof Date ? item.date.toISOString().split('T')[0] : item.date,
        }));

        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(totalArticles / limit);
        const currentPage = Math.min(page, totalPages);

        // Nếu không có bài viết và đang ở trang cuối, trả về thông báo lỗi
        if (news.length === 0 && currentPage > 1) {
            return res.status(404).json({ message: 'Page not found' });
        }

        // const totalPages = await NewsModel.countDocuments().exec();
        const paginationResult = {
            data: formattedResult,
            total: totalArticles,
            // pages: Math.ceil(totalPages / limit),
            pages: totalPages,
            currentPage: currentPage,
            limit: limit
        };
        return res.json(paginationResult);
    } catch (error) {
        console.log(error)
    }
}

//DANH SÁCH BÀI VIẾT THEO TAG
async function LoadNews_Tag(req: Request, res: Response) {
    const tagid = req.params.id

    const page = parseInt(req.query.page as string) || 1;
    const limit = 8;
    const startIndex = (page - 1) * limit;
    try {
        const tag = await NewsModel.find({ tag: tagid }).select('id title slug description avatar date').lean().skip(startIndex).limit(limit).exec();

        // Đếm tổng số bài viết
        const totalArticles = await NewsModel.countDocuments({ tag: tagid }).exec();

        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(totalArticles / limit);
        const currentPage = Math.min(page, totalPages);

        // Nếu không có bài viết và đang ở trang cuối, trả về thông báo lỗi
        if (tag.length === 0 && currentPage > 1) {
            return res.status(404).json({ message: 'Page not found' });
        }

        const paginationResult = {
            data: tag,
            total: totalArticles,
            pages: totalPages,
            currentPage: currentPage,
            limit: limit
        };
        return res.json(paginationResult)
    } catch (error) {
        console.log(error)
    }
}

//HIỂN THỊ 5 BÀI VIẾT CÓ NHIỀU LƯỢT XEM NHẤT TRONG NGÀY
async function LoadNews_Top5_ViewstoDay(req: Request, res: Response) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Lấy ngày hiện tại và đặt giờ về 00:00:00
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Ngày tiếp theo

        const topPosts = await NewsModel.find({ date: { $gte: today.toLocaleDateString(), $lt: tomorrow.toLocaleDateString() } })
            .sort({ views: -1 })
            .limit(5);
        return res.json(topPosts)
    } catch (error) {
        console.error(error);
    }
}

//HIỂN THỊ TOP 5 BÀI VIẾT CÓ LƯỢT XEM NHIỀU NHẤT TỪ TRƯỚC TỚI NAY
async function Top5Views(req: Request, res: Response) {
    try {
        const topPosts = await NewsModel.find()
            .sort({ views: -1 })
            .limit(5);
        return res.json(topPosts);
    } catch (error) {
        console.error(error);
    }
}

//HIỂN THỊ TOP 5 BÀI VIẾT MỚI NHẤT
async function top5LatestNews(req: Request, res: Response) {
    try {
        // const top5LatestNews = await NewsModel.find()
        //     .sort({ date: -1 }) // Sắp xếp giảm dần theo trường "date"
        //     .limit(5) // Giới hạn chỉ lấy 5 bài viết
        //     .select('id title description avatar date')
        //     .exec();
        const top5LatestNews = await NewsModel.find({}, 'id title slug description avatar date')
            .sort({ date: -1 }) //.sort({ date: -1 })
            .limit(5)
            .lean()
            .exec();

        const formattedResult = top5LatestNews.map(item => ({
            ...item,
            date: item.date instanceof Date ? item.date.toISOString().split('T')[0] : item.date,
        }));

        res.json(formattedResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

//HIỂN THỊ LƯỢT XEM
async function loadViews(req: Request, res: Response) {
    const newsId = req.params.id;
    const news = await NewsModel.findOne({ id: newsId })
    if (!news) {
        return res.status(505).json("Bài viết không tồn tại");
    } else {
        return res.json(`Số lượt xem của bài viết ${newsId}: ${news.views}`)
    }
}

//ĐẾM LƯỢT XEM
async function countViews(req: Request, res: Response) {
    const newsId = req.params.id;
    const news = await NewsModel.findOne({ id: newsId })
    if (!news) {
        return res.status(505).json("Bài viết không tồn tại");
    } else {
        await NewsModel.findOneAndUpdate({ id: newsId }, { $inc: { views: 1 } })
        return res.json(`Số lượt xem của bài viết ${newsId}: ${news.views}`)
    }
}

//ALLSLUGNEWS
async function AllSlugNews(req: Request, res: Response) {
    const news = await NewsModel.find().select('id');
    return res.json(news);
}

//Test convert slug
async function Testslug(req: Request, res: Response) {
    const slug= req.body.slug;
    const return_slug =convertToSlug(slug)
    return res.json(return_slug)
}

export const News = {
    get_CreateNews,
    post_CreateNews,
    updateNews,
    deleteNews,
    loadNews,
    loadNewsId,
    loadAllNews,
    loadRandomNews,
    loadNews_Types,
    LoadNews_Tag,
    LoadNews_Top5_ViewstoDay,
    Top5Views,
    top5LatestNews,
    loadViews,
    countViews,
    AllSlugNews,
    uploadImagesNews,
    Testslug
}