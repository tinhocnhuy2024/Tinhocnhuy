import express from "express";
import { Account } from "../Controller/Account";
import { upload } from "../uploadfile";
import { middleware, requestRefreshToken } from "../middleware/jwt"
import { contact } from "../Services/mailer";
const Account_Router = express();

Account_Router.post('/register', Account.get_Register);

Account_Router.post('/postregister', Account.post_Register);

// Account_Router.get('/login', Account.getLogin);

Account_Router.post('/login', Account.login);

Account_Router.post('/forgotpass', Account.get_ForgotPassword);

Account_Router.post('/forgotpassword', Account.post_ForgotPassword);

Account_Router.post('/changePass', middleware, Account.changePassword);

Account_Router.post('/putAccount', middleware, Account.putAccount);

Account_Router.post('/contact', contact);

// auth_Router.post('/logout', auth.logout);

Account_Router.post('/refreshtoken', requestRefreshToken);

Account_Router.get('/upload', upload.get_Uploadfile);

Account_Router.post('/upload', upload.post_Uploadfile);

export default Account_Router;