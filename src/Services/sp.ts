import { v2 as cloudinary } from 'cloudinary';
import slugify from 'slugify';

function generateRandomStringPost() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    const length = Math.floor(Math.random() * 10) + 1;

    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }
    return result;
}
export const randomStringPost = generateRandomStringPost();

export async function uploadImageToCloudinary(image: Express.Multer.File) {
    try {
        if (!image) {
            throw new Error('No image provided.');
        }
        const base64Image = image.buffer.toString('base64');
        const result = await cloudinary.uploader.upload(`data:image/png;base64,${base64Image}`, {
            folder: 'Tinhocnhuy.com',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        });
        return result.secure_url;
    } catch (error) {
        throw new Error('Failed to upload image to Cloudinary.');
    }
}

export function getPublicIdFromUrl(url: string) {
    const public_id = url.split('/').slice(-1)[0].split('.')[0];
    return public_id;
}

export async function deleteImageFromCloudinary(publicId: string) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('Image deleted from Cloudinary:', result);
    } catch (err) {
        console.log('Error deleting image from Cloudinary:', err);
    }
}

export function convertToSlug(title: string): string {
    const sanitizedTitle = title.replace(/\//g, '-');
    const slug = slugify(sanitizedTitle, {
        lower: true,        
        remove: /[*+~.()'"!:@]/g,
    });
    return slug;
}
