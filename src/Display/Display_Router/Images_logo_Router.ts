import express from "express";
import { middleware } from "../../middleware/jwt"
import {authorize} from "../../middleware/authorize";
import { midlleware_file } from "../../middleware/file";
import { Images_logo_Index } from "../Display_Controller/Images_logo";

const Images_logo_Router = express();

Images_logo_Router.post('/createimagelogo', middleware, midlleware_file, authorize, Images_logo_Index.createImageLogo);

Images_logo_Router.post('/deleteimagelogo/:id', middleware, midlleware_file, authorize, Images_logo_Index.deleteImageLogo);

Images_logo_Router.get('/allimagelogo', Images_logo_Index.allImagaLogo);

export default Images_logo_Router;
