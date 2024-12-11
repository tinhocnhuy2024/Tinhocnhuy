import { Request, Response } from "express";
import AccountModel from "../Model/Account_Model";
import bcrypt from "bcrypt";
import { sendMail_ForgotPassword, OTPDangki } from "../Services/mailer";
import { randomNumber, randomNumber_ForgotPassword } from "../Services/mailer";
import { generateAccessToken, generateRefreshToken } from "../middleware/jwt"

//ĐĂNG KÝ TÀI KHOẢN
var username: string
var fullname: string
var password: string
var email: string
async function get_Register(req: Request, res: Response) {
    try {
        username = req.body.username
        fullname = req.body.fullname
        email = req.body.email
        password = req.body.password
        var repassword = req.body.repassword
        const usernameRegex = /^[a-zA-Z0-9_.]{3,20}$/;
        const passwordRegex = /^.{8,}$/;
        const emailRegex = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
        let errRgt = 0;
        const user_username = await AccountModel.findOne({ username: username })
        const user_email = await AccountModel.findOne({ email: email })
        if (username == '' || password == '' || repassword == '') {
            errRgt++;
            return res.json("Vui lòng điền đẩy đủ thông tin");
        }
        if (!usernameRegex.test(username)) {
            errRgt++;
            return res.json("Tên đăng nhập không hợp lệ");

        }
        if (!emailRegex.test(email)) {
            errRgt++;
            return res.json("Email không đúng định dạng");
        }
        if (!passwordRegex.test(password)) {
            errRgt++;
            return res.json("Mật khẩu ít nhất 8 ký tự");
        }
        if (user_username) {
            errRgt++;
            return res.json("Tên đăng nhập đã được sử dụng");
        }
        if (user_email) {
            errRgt++;
            return res.json("Email đã được sử dụng");
        }
        if (password !== repassword) {
            errRgt++;
            return res.json("Mật khẩu không khớp");
        }
        if (errRgt == 0) {
           await OTPDangki(req, res);
            // sendMail(req, res);
            // console.log(randomNumber);
            res.json({ message: "Vui lòng kiểm tra Email của bạn" })
        }
    } catch (error) {
        res.status(500).json(error)
        console.log(error)
    }
}

async function post_Register(req: Request, res: Response) {
    try {
        const otp = req.body.otp
        if (otp != randomNumber) {
            return res.json({ message: "Mã OTP không đúng" })
        }
        if (randomNumber == 0) {
            return res.json({ message: "Mã OTP đã hết hạn" })
        } else {
            //mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            //lưu user đã được mã hóa mk
            await AccountModel.create({
                username: username,
                fullname: fullname,
                email: email,
                password: hashedPassword
            })
            return res.json({ message: "Đăng ký thành công" })
        }
    } catch (error) {
        res.json({ message: "Lỗi server" })
        console.log(error)
    }
}

async function getLogin(res: Response) {
    res.send('login')
}
//bien username luu vao post
export var authorization: string;
//ĐĂNG NHẬP
async function login(req: Request, res: Response) {
    var username = req.body.username;
    var password = req.body.password;
    const err = 0;
    const user = await AccountModel.findOne({
        username: username
    })
    if (!user) {
        err + 1;
        return res.status(500).json({ message: "Người dùng không tồn tại" })
    } else {
        const isMatch = await bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            err + 1;
            return res.status(500).json({ message: "Mật khẩu không đúng" })
        }
        //truong hop dang nhap thanh cong
        if (err == 0) {
            const accesstoken = generateAccessToken(username);
            const refreshtoken = generateRefreshToken(username);

            await AccountModel.findOneAndUpdate(
                { username: username },
                { $set: { refreshtoken: refreshtoken } }
            )
            // authorization = username
            // console.log("id:=====" + req.userId + "==" + authorization)
            return res.json({ message: "Đăng nhập thành công", accesstoken, refreshtoken })
        }
    }
}

//RESET PASSWORD 8 KI TU
function generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }
    return result;
}

const randomString = generateRandomString(8);

var emailForgotpass: string
//QUÊN MẬT KHẨU
async function get_ForgotPassword(req: Request, res: Response) {
    try {
        const email = req.body.email;
        const findEmail = await AccountModel.findOne({ email: email })
        if (!findEmail) {
            return res.json({ message: "Email đã đăng ký không đúng" });
        } else {
           await sendMail_ForgotPassword(req, res);
            res.json({ message: "Vui lòng kiểm tra email của bạn" });
            emailForgotpass = email
            console.log(emailForgotpass)
            // console.log(randomString)
        }

    } catch (error) {
        res.status(505).json(error)
    }
}

async function post_ForgotPassword(req: Request, res: Response) {
    try {
        const otp = req.body.otp;
        if (randomNumber_ForgotPassword == 0) {
            return res.json({ message: "Mã OTP đã hết hạn" })
        } if (otp != randomNumber_ForgotPassword || otp == null) {
            return res.json({ message: "Mã OTP không đúng" })
            //    console.log(randomNumber + "-------" + otp)
        } else {
            //mã hóa mật khẩu
            // randomString
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomString, salt);
            await AccountModel.findOneAndUpdate({ email: emailForgotpass }, { password: hashedPassword })
            res.json({ message: "Mật khẩu mới của bạn là " + randomString })
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

//ĐỔI MẬT KHẨU
async function changePassword(req: Request, res: Response) {
    const password = req.body.password;
    const newpassword = req.body.newpassword;
    const renewpassword = req.body.renewpassword;

    let err = 0;
    if (password == '' || newpassword == '' || renewpassword == '') {
        err++
        res.status(500).json({ message: "Vui lòng nhập đầy đủ thông tin" })
    }
    if (newpassword != renewpassword) {
        err++
        res.status(500).json({ message: "Mật khẩu mới không khớp" })
    }
    const findPass: any = await AccountModel.findOne({ username: req.userId })
    const isMatch = await bcrypt.compareSync(password, findPass.password);
    if (!isMatch) {
        err++
        res.status(500).json({ message: "Mật khẩu không đúng" })
    }
    if (err == 0) {
        //mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(renewpassword, salt);
        await AccountModel.findOneAndUpdate({ username: req.userId }, { password: hashedPassword })
        res.json({ message: "Đổi mật khẩu thành công" })
    }
}

//CẬP NHẬT TÀI KHOẢN
async function putAccount(req: Request, res: Response) {
    const fullname = req.body.fullname;
    const email = req.body.email;
    const emailRegex = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
    if (fullname == '' || email == '') {
        res.status(500).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }
    if (!emailRegex.test(email)) {
        res.status(500).json({ message: "Email không hợp lệ" });
    } else {
        await AccountModel.findOneAndUpdate({ username: req.userId }, {
            fullname: fullname,
            email: email
        })
        res.json({ message: "Cập nhật thành công" });
    }
}

//ĐĂNG XUẤT TÀI KHOẢN
// async function logout(req:Request, res:Response) {
//     try {
//         const refreshToken=req.headers.authorization?.split(" ")[1];

//         // Kiểm tra xem refreshToken có tồn tại hay không
//         if (!refreshToken) {
//             return res.status(400).json({ message: "Không tìm thấy refresh token" });
//         }

//         // Hủy bỏ refreshToken bằng cách xóa nó khỏi cơ sở dữ liệu
//         await AccountModel.findOneAndUpdate(
//             { refreshToken: refreshToken },
//             { $unset: { refreshToken: "" } }
//         );

//         res.status(200).json({ message: "Đăng xuất thành công" });
//     } catch (error) {
//         console.error("Lỗi trong quá trình đăng xuất:", error);
//         res.status(500).json({ message: "Lỗi trong quá trình đăng xuất" });
//     }
// }

async function getUploadDemo(req: Request, res: Response) {
    res.render('demo.ejs')
}

export const Account = {
    get_Register,
    getLogin,
    login,
    post_Register,
    get_ForgotPassword,
    post_ForgotPassword,
    changePassword,
    putAccount,
    // logout
    // getUploadDemo,
};