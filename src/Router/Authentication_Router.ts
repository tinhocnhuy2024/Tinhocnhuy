import express from "express";
import { middleware } from "../middleware/jwt";
import { authorize } from "../middleware/authorize";
import { Authentication } from "../Controller/Authentication";

const Authentication_Router = express();

Authentication_Router.get('/allaccount', middleware, authorize, Authentication.AllAccount);

Authentication_Router.post('/updateauth/:username', middleware, authorize, Authentication.updateRole);

export default Authentication_Router;