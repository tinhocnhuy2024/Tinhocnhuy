import express from "express";
import { middleware } from "../../middleware/jwt"
import {authorize} from "../../middleware/authorize";
import { midlleware_file } from "../../middleware/file";
import { About_Images } from "../Display_Controller/About_images";

const About_Images_Router= express();

About_Images_Router.post('/createaboutimage', middleware, authorize, midlleware_file, About_Images.createAboutImages);

About_Images_Router.post('/deleteaboutiamge/:id', middleware, authorize, midlleware_file, About_Images.deleteAboutImages);

About_Images_Router.get('/allaboutimage', About_Images.allAboutImages);

export default About_Images_Router