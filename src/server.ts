import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { CONFIG } from "./config/config";
import token_Router from "./Router/token_Router";
import Account_Router from "./Router/Account_Router";
import Authentication_Router from "./Router/Authentication_Router";
import post_Router from "./Router/post_Router";
import news_Router from "./Router/news_Router";
import types_Router from "./Router/types_news_Router";
import categories_Router from "./Router/categories_Router";
import tag_Router from "./Router/tag_Router";
import About_index_Router from "./Display/Display_Router/About_index_Router";
import About_Images_Router from "./Display/Display_Router/About_images_Router";
import Images_logo_Router from "./Display/Display_Router/Images_logo_Router";
import About_Router from "./Display/Display_Router/About_Router";
import Content_Banner_Router from "./Display/Display_Router/Content_Banner_Router";
import Contact_Router from "./Display/Display_Router/Contact_Router";
import bodyParser from "body-parser";
import path from "path";
import { v2 as cloudinary } from 'cloudinary';

import dotenv from 'dotenv';
dotenv.config();

const date = new Date();

const formatted = date.toTimeString();
mongoose
    .connect(CONFIG.mongo.url)
    .then(() => {
        console.log('Connect to MongoDB');
    })
    .catch((error) => {
        console.log(error);
    });

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    res.setHeader('Access-Control-Allow-Origin', 'https://tinhocnhuy.com',);

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', "true");

    // Pass to next layer of middleware
    next();
});


app.get('/', function (req: Request, res: Response) {
    res.json("Trang này của tao")
})

app.use('/api', token_Router);
app.use('/api', Account_Router);
app.use('/api', Authentication_Router);
app.use('/api', post_Router);
app.use('/api', news_Router);
app.use('/api', categories_Router);
app.use('/api', types_Router);
app.use('/api', tag_Router);

//Display
app.use('/api', About_index_Router);
app.use('/api', About_Images_Router);
app.use('/api', Images_logo_Router);
app.use('/api', About_Router);
app.use('/api', Content_Banner_Router);
app.use('/api', Contact_Router);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.static(path.join(__dirname, '../public')));

app.listen(CONFIG.Server.port, () => {
    console.log(`Example app listening at http://localhost:${CONFIG.Server.port} (${formatted})`)
})