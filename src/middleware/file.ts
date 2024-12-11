import multer from "multer";
const diskStorage = multer.memoryStorage();
export const midlleware_file = multer({ storage: diskStorage }).single("file");