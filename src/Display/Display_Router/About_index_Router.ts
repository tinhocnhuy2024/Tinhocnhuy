import express from "express";
import { middleware } from "../../middleware/jwt";
import {authorize} from "../../middleware/authorize";
// import { About_Index } from "../../Controller/Display/About_index";
import { About_Index } from "../Display_Controller/About_index";
import { midlleware_file } from "../../middleware/file";

const About_index_Router = express();

About_index_Router.post('/createaboutcontent', middleware, midlleware_file, authorize, About_Index.createAbout_Index);

About_index_Router.post('/updateaboutcontent', middleware, midlleware_file, authorize, About_Index.updateAbout_Index);

About_index_Router.post('/deleteaboutcontent', middleware, authorize , About_Index.deleteAbout_Index);

About_index_Router.get('/aboutcontent', About_Index.findAboutIndex);

export default About_index_Router