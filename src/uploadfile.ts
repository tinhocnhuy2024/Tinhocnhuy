import express, { NextFunction, Request, Response } from "express";
import path from "path";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CONFIG } from "./config/config";

//TẢI HÌNH ẢNH LÊN LOCAL
const diskStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "src/uploads");
    },
    filename: (req, file, callback) => {
        let fileName = `images/${file.originalname}`;
        callback(null, fileName);
    }
});
export let uploadFile = multer({ storage: diskStorage }).single("file");

cloudinary.config({
    cloud_name: CONFIG.cloudinary.cloud_name,
    api_key: CONFIG.cloudinary.api_key,
    api_secret: CONFIG.cloudinary.api_secret
})

async function get_Uploadfile(req: Request, res: Response) {
    res.render('demo.ejs')
}
async function post_Uploadfile(req: Request, res: Response) {

    uploadFile(req, res, (error) => {
        if (error) {
            return res.send(`Error when trying to upload: ${error}`);
        }
        res.sendFile(path.join(`${__dirname}/uploads/${req.file?.filename}`));
    })
}

export const upload = {
    get_Uploadfile,
    post_Uploadfile,
}