import { Request, Response } from "express";
import { randomStringPost } from "../Services/sp";
import { NewsModel } from "../Model/News_Models";
import Types_News_Model from "../Model/Types_News_Models"
import { uploadImageToCloudinary, deleteImageFromCloudinary, convertToSlug} from "../Services/sp"
import { v2 as cloudinary } from 'cloudinary';

var publicId: any;
export async function uploadImagesNews(req: Request, res: Response) {
    const fileBuffer = req.file?.buffer;
    if (!fileBuffer) {
        console.error('No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        const result = await cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: 'Tinhocnhuy.com' },
            async (error, result) => {
                if (error) {
                    console.error('Upload failed:', error);
                    return res.status(500).json({ error: 'Upload failed' });
                }
                if (result) {
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
            id: id,
            title: title,
            slug: id,
            description: description,
            avatar: thumbnailUrl,
            content: content,
            username: req.userId,
            typesid: types.id,
            tag: tag
        });
        return res.json({ message: "Thêm thành công", id })
    } catch (error) {
        deleteImageFromCloudinary(publicId)
        console.log(error);
        return res.status(500).json({ message: 'Internal server error:' + error });
    }
}

async function updateNews(req: Request, res: Response) {
    let thumbnailUrl: string | null = null;
    try {
        const id = req.params.id;
        const { title, slug, description, content, tag } = req.body;
        const nametypes = req.body.types;
        const linkfile = req.file as TempMulterFile;
        const types = await Types_News_Model.findOne({ name: nametypes })
        if (!types) {
            deleteImageFromCloudinary(publicId)
            return res.json({ message: "Không tìm thấy Loại tin tức" })
        }
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

async function deleteNews(req: Request, res: Response) {
    const id = req.params.id;
    try {
        const post = await NewsModel.findOne({ id: id });

        const idthumnail = post?.avatar
        if (idthumnail) {
            const urlObject = new URL(idthumnail);
            const path = urlObject.pathname;
            const idImage = path.substring(path.indexOf('Tinhocnhuy.com/'), path.lastIndexOf('.'));
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
                    const idImage = path.substring(path.indexOf('Tinhocnhuy.com/'), path.lastIndexOf('.'));
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

async function loadNews(req: Request, res: Response) {
    const newsSlug = req.params.slug
    const news = await NewsModel.findOne({ slug: newsSlug })
    if (!news) {
        res.status(505).json({ message: "Bài viết không tồn tại" });
    } else {
        res.json(news)
    }
}

async function loadNewsId(req: Request, res: Response) {
    const id = req.params.id
    const news = await NewsModel.findOne({ id: id })
    if (!news) {
        res.status(505).json({ message: "Bài viết không tồn tại" });
    } else {
        res.json(news)
    }
}

async function loadAllNews(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 8;
    const startIndex = (page - 1) * limit;

    try {
        const news = await NewsModel.find({})
            .select('id title slug description avatar date')
            .sort({ date: -1 })
            .lean()
            .skip(startIndex)
            .limit(limit)
            .exec();
        const totalArticles = await NewsModel.countDocuments().exec();
        const formattedResult = news.map(item => ({
            ...item,
            date: item.date instanceof Date ? item.date.toISOString().split('T')[0] : item.date,
        }));
        const totalPages = Math.ceil(totalArticles / limit);
        const currentPage = Math.min(page, totalPages);
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

async function loadNews_Types(req: Request, res: Response) {
    const typesid = req.params.id

    const page = parseInt(req.query.page as string) || 1;
    const limit = 8
    const startIndex = (page - 1) * limit;

    try {
        const news = await NewsModel.find({ typesid: typesid }).select('id title slug description avatar date').sort({ date: -1 }).lean().skip(startIndex).limit(limit).exec();
        const totalArticles = await NewsModel.countDocuments({ typesid: typesid }).exec();
        const formattedResult = news.map(item => ({
            ...item,
            date: item.date instanceof Date ? item.date.toISOString().split('T')[0] : item.date,
        }));
        const totalPages = Math.ceil(totalArticles / limit);
        const currentPage = Math.min(page, totalPages);

        if (news.length === 0 && currentPage > 1) {
            return res.status(404).json({ message: 'Page not found' });
        }
        const paginationResult = {
            data: formattedResult,
            total: totalArticles,
            pages: totalPages,
            currentPage: currentPage,
            limit: limit
        };
        return res.json(paginationResult);
    } catch (error) {
        console.log(error)
    }
}

async function LoadNews_Tag(req: Request, res: Response) {
    const tagid = req.params.id

    const page = parseInt(req.query.page as string) || 1;
    const limit = 8;
    const startIndex = (page - 1) * limit;
    try {
        const tag = await NewsModel.find({ tag: tagid }).select('id title slug description avatar date').lean().skip(startIndex).limit(limit).exec();
        const totalArticles = await NewsModel.countDocuments({ tag: tagid }).exec();
        const totalPages = Math.ceil(totalArticles / limit);
        const currentPage = Math.min(page, totalPages);
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

async function LoadNews_Top5_ViewstoDay(req: Request, res: Response) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const topPosts = await NewsModel.find({ date: { $gte: today.toLocaleDateString(), $lt: tomorrow.toLocaleDateString() } })
            .sort({ views: -1 })
            .limit(5);
        return res.json(topPosts)
    } catch (error) {
        console.error(error);
    }
}

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

async function top5LatestNews(req: Request, res: Response) {
    try {
        const top5LatestNews = await NewsModel.find({}, 'id title slug description avatar date')
            .sort({ date: -1 })
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

async function loadViews(req: Request, res: Response) {
    const newsId = req.params.id;
    const news = await NewsModel.findOne({ id: newsId })
    if (!news) {
        return res.status(505).json("Bài viết không tồn tại");
    } else {
        return res.json(`Số lượt xem của bài viết ${newsId}: ${news.views}`)
    }
}

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

async function AllSlugNews(req: Request, res: Response) {
    const news = await NewsModel.find().select('id');
    return res.json(news);
}

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