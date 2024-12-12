import dotenv from 'dotenv';
dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';

const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.sxwd9.mongodb.net/Tinhocnhuy?retryWrites=true&w=majority`

const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 1337;

const ACCESS = process.env.JWT_SECRET_ACCESS || '';
const REFRESH = process.env.JWT_SECRET_REFRESH || '';

const EMAIL_API=process.env.EMAIL_API;

const EMAIL_ADDRESS=process.env.emailAddress
const EMAIL_PASSWORD=process.env.emailPassword

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export const CONFIG = {
    mongo: {
        url: MONGO_URL
    },
    Server: {
        port: SERVER_PORT
    },

    jwt: {
        access: ACCESS,
        refresh: REFRESH
    },
    cloudinary: {
        cloud_name: CLOUD_NAME,
        api_key: API_KEY,
        api_secret: API_SECRET
    },
    email:{
        emailaddress: EMAIL_ADDRESS,
        emailpassword: EMAIL_PASSWORD
    },
EMAIL_API
};