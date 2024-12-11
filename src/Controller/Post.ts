import { Request, Response } from "express";
import { PostModel } from "../Model/Post_Model";
import CategoriesModel from "../Model/Categories_Model";
import { NewsModel } from "../Model/News_Models";
import { v2 as cloudinary } from 'cloudinary';
import { uploadImageToCloudinary, randomStringPost, deleteImageFromCloudinary, convertToSlug } from "../Services/sp";

var publicId: any;
export async function uploadImagesPost(req: Request, res: Response) {
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

async function post(req: Request, res: Response) {
    res.render('createpostLocal')
}

interface TempMulterFile extends Express.Multer.File {
    buffer: Buffer;
}

async function createPost(req: Request, res: Response) {
    let thumbnailUrl: string | null = null;
    try {
        const title = req.body.title;
        const description = req.body.description;
        const category = req.body.category;
        const content = req.body.content;
        const linkfile = req.file as TempMulterFile;

        if (title == '' || description == '' || category == '' || content == '') {
            deleteImageFromCloudinary(publicId)
            return res.json({ message: "Vui lòng điền đầy đủ thông tin" })
        }

        if (!linkfile) {
            return res.status(400).json({ error: 'No image provided.' });
        }

        const Cate = await CategoriesModel.findOne({ name: category })
        if (!Cate) {
            deleteImageFromCloudinary(publicId)
            return res.json({ message: "Không tìm thấy Danh mục" })
        }
        const slug = convertToSlug(title);

        const idPost = await PostModel.findOne({ id: slug })
        var id
        if (!idPost) {
            id = slug
        } else {
            id = slug + '-' + randomStringPost
        }
        thumbnailUrl = await uploadImageToCloudinary(linkfile)

        const newPost = await PostModel.create({
            id: id,
            title: title,
            slug: id,
            description: description,
            avatar: thumbnailUrl,
            content: content,
            username: "admindemo",
            categoryId: Cate.id,
        });
        return res.json({ message: "Đã thêm bài viết", id });
    } catch (err) {
        deleteImageFromCloudinary(publicId)
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function updatePost(req: Request, res: Response) {
    let thumbnailUrl: string | null = null;
    try {
        const id = req.params.id;
        const { title, slug, description, content, category } = req.body;
        const linkfile = req.file as TempMulterFile;
        const Cate = await CategoriesModel.findOne({ name: category })
        if (!Cate) {
            deleteImageFromCloudinary(publicId)
            return res.json({ message: "Không tìm thấy Danh mục" })
        }

        if (!linkfile) {
            await PostModel.findOneAndUpdate({ id: id }, {
                title: title,
                slug: slug,
                description: description,
                content: content,
                category: Cate.id,
            })
            return res.json({ message: "Cập nhật thành công", id })
        } else {
            thumbnailUrl = await uploadImageToCloudinary(linkfile)
            await PostModel.findOneAndUpdate({ id: id }, {
                title: title,
                slug: slug,
                description: description,
                avatar: thumbnailUrl,
                content: content,
                categoryId: Cate.id
            })
            return res.json({ message: "Cập nhật thành công", id })
        }
    } catch (error) {
        deleteImageFromCloudinary(publicId)
        return res.status(500).json(error)
    }
}

async function deletePost(req: Request, res: Response) {
    const id = req.params.id;
    try {
        const post = await PostModel.findOne({ id: id });
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
        const idthumnail = post?.avatar
        if (idthumnail) {
            const urlObject = new URL(idthumnail);
            const path = urlObject.pathname;
            const idImage = path.substring(path.indexOf('Tinhocnhuy.com/'), path.lastIndexOf('.'));
            await deleteImageFromCloudinary(idImage)
        }

        await PostModel.deleteOne({ id: id });
        return res.json({ message: "Đã xóa bài viết", id });
    } catch (error) {
        res.status(500).json(error);
    }
}

async function loadPost(req: Request, res: Response) {
    const postSlug = req.params.slug;
    const post = await PostModel.findOne({ slug: postSlug })
    if (!post) {
        res.status(505).json({ message: "Bài viết không tồn tại" });
    } else {
        res.json(post)
    }
}

async function loadPostId(req: Request, res: Response) {
    const id = req.params.id;
    const post = await PostModel.findOne({ id: id })
    if (!post) {
        res.status(505).json({ message: "Bài viết không tồn tại" });
    } else {
        res.json(post)
    }
}

async function loadAllPost(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 9;
    const startIndex = (page - 1) * limit;
    try {
        const posts = await PostModel.find().select('id title slug description avatar date views username').skip(startIndex).limit(limit)
        const totalPosts = await PostModel.countDocuments().exec();

        const paginationResult = {
            data: posts,
            total: totalPosts,
            pages: Math.ceil(totalPosts / limit),
            currentPage: page,
            limit: limit
        }
        res.json(paginationResult)
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

async function loadPost_Username(req: Request, res: Response) {
    try {
        const post = await PostModel.find({
            username: req.userId
        })
        return res.json(post);
    } catch (error) {
        console.log(error)
    }
}

async function loadPost_Categories(req: Request, res: Response) {
    const categorieId = req.params.id
    try {
        const post = await PostModel.find({ categoryId: categorieId })
        return res.json(post);
    } catch (error) {
        console.log(error)
    }
}

async function top4_LoadPost_Dichvu(req: Request, res: Response) {
    try {
        const top5LatestPost = await PostModel.find({ categoryId: 'Dich-vu' })
            .sort({ date: -1 })
            .limit(4)
            .select('id title slug avatar')
            .exec();
        res.json(top5LatestPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function top4_LoadPost_Giaiphap(req: Request, res: Response) {
    try {
        const top5LatestPost = await PostModel.find({ categoryId: 'Giai-phap' })
            .sort({ date: -1 })
            .limit(4)
            .select('id title slug avatar')
            .exec();
        res.json(top5LatestPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function loadViews(req: Request, res: Response) {
    const postId = req.params.id;
    const post = await PostModel.findOne({ id: postId })
    if (!post) {
        return res.status(505).json("Bài viết không tồn tại");
    } else {
        return res.json(`Số lượt xem của bài đăng ${postId}: ${post.views}`);
    }
}

const countViews = async (req: Request, res: Response) => {
    const postId = req.params.id;
    const post = await PostModel.findOne({ id: postId })
    if (!post) {
        return res.status(505).json("Bài viết không tồn tại");
    } else {
        await PostModel.findOneAndUpdate({ id: postId }, { $inc: { views: 1 } })
        return res.json(`Số lượt xem của bài đăng ${postId}: ${post.views}`);
    }
}

async function AllSlugPost(req: Request, res: Response) {
    const post = await PostModel.find().select('id');
    return res.json(post)
}

async function AllSlugPost_News(req: Request, res: Response) {
    const post = await PostModel.find({}, 'id');
    const news = await NewsModel.find({}, 'id');
    return res.json({
        post, news
    });
}

export const Post = {
    post,
    createPost,
    updatePost,
    deletePost,
    loadPost,
    loadPostId,
    loadAllPost,
    loadPost_Username,
    loadPost_Categories,
    top4_LoadPost_Dichvu,
    top4_LoadPost_Giaiphap,
    loadViews,
    countViews,
    AllSlugPost,
    AllSlugPost_News,
    uploadImagesPost,
}