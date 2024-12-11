import { v2 as cloudinary } from 'cloudinary';
import slugify from 'slugify';

//hàm tạo chuỗi ngẫu nhiên tù 1->10 kí tự
function generateRandomStringPost() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    const length = Math.floor(Math.random() * 10) + 1; // Độ dài chuỗi từ 1 đến 10 (có thể điều chỉnh)

    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }
    return result;
}
export const randomStringPost = generateRandomStringPost();

// Hàm upload ảnh lên Cloudinary (hiện tại đang lỗi, upload vào cloud lẫn local)
export async function uploadImageToCloudinary2(image: Express.Multer.File) {
    try {
        if (!image) {
            throw new Error('No image provided.');
        }
        // Upload ảnh lên Cloudinary
        const result = await cloudinary.uploader.upload(image.path, {
            folder: 'Tinhocnhuy', // Tên thư mục chứa các thumbnail trên Cloudinary
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        });

        // Trả về URL của ảnh đã upload
        return result.secure_url;
    } catch (error) {
        throw new Error('Failed to upload image to Cloudinary.');
    }
}

export async function uploadImageToCloudinary(image: Express.Multer.File) {
    try {
        if (!image) {
            throw new Error('No image provided.');
        }
        const base64Image = image.buffer.toString('base64');
        // Upload base64-encoded ảnh lên Cloudinary
        const result = await cloudinary.uploader.upload(`data:image/png;base64,${base64Image}`, {
            folder: 'Tinhocnhuy.com', // Tên thư mục chứa các thumbnail trên Cloudinary
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        });
        // Trả về URL của ảnh đã upload
        return result.secure_url;
    } catch (error) {
        throw new Error('Failed to upload image to Cloudinary.');
    }
}

//HÀM LẤY PUBLIC_ID TỪ LINK HÌNH ẢNH CLOUDINARY
export function getPublicIdFromUrl(url: string) {
    const public_id = url.split('/').slice(-1)[0].split('.')[0];
    return public_id;
}

//HÀM XÓA HÌNH ẢNH ĐÃ UPLOAD LÊN COUDINARY
export async function deleteImageFromCloudinary(publicId: string) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('Image deleted from Cloudinary:', result);
    } catch (err) {
        console.log('Error deleting image from Cloudinary:', err);
    }
}


//HÀM CHUYỂN CHUỔI TITLE CHO BÀI VIẾT
export function convertToSlug(title: string): string {
    // Thay thế các ký tự đặc biệt không mong muốn trước khi slugify
    const sanitizedTitle = title.replace(/\//g, '-');  // Thay thế dấu gạch chéo bằng dấu gạch ngang

    // Sử dụng slugify với tùy chọn bỏ dấu và chuyển thành chữ thường
    const slug = slugify(sanitizedTitle, {
        lower: true,           // Chuyển thành chữ thường
        remove: /[*+~.()'"!:@]/g,  // Loại bỏ các ký tự đặc biệt không mong muốn (loại bỏ ký tự `/` vì đã xử lý ở trên)
    });
    return slug;
}
