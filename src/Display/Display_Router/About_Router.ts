import express from "express";
import { middleware } from "../../middleware/jwt";
import {authorize} from "../../middleware/authorize";
// import { About } from "../../Controller/Display/About";
import { About } from "../Display_Controller/About";
import { midlleware_file } from "../../middleware/file";

const About_Router = express();

About_Router.post('/createabout', middleware, midlleware_file, authorize, About.createAbout);

About_Router.post('/updateabout/:id', middleware, midlleware_file, authorize, About.updateAbout);

About_Router.post('/deleteabout/:id', middleware, midlleware_file, authorize, About.deleteAbout);

About_Router.get('/allabout', About.allAbout)

export default About_Router