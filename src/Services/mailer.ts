import nodemailer from "nodemailer";
import { Request, Response } from "express";
import * as fs from "fs";
import * as ejs from "ejs";
import * as path from 'path';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { error } from "console";
dotenv.config();

export let randomNumber: number = 0

export let randomNumber_ForgotPassword: number = 0

//hàm gửi email
export const OTPDangki = async function mail(req: Request, res: Response) {
const email=req.body.email

  //hàm random mã otp
  function generateRandomNumber(): number {
    return Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
  }
  const random = await generateRandomNumber();

  //trỏ đường dẫn đến file html templatEmail
  const templatePath = path.join(__dirname, '../themeEmail/templateEmail.ejs');//
  const htmlMail = fs.readFileSync(templatePath, 'utf-8')//
  // Render template HTML với dữ liệu OTP
  const renderedTemplate = ejs.render(htmlMail, { otp: random });//

  // Thiết lập thời gian đếm ngược là 60 giây
  const countDownTime = 60 * 1000; // 60 giây tính theo millisecond
  let countdown = setTimeout(() => {//
    // Sau 60 giây, đặt lại biến randomNumber thành 0
   randomNumber = 0;
  }, countDownTime);

  //Hàm gửi email
  if (!process.env.EMAIL_API) {
    throw new Error("Missing EMAIL_API environment variable");
  }

  await sgMail.setApiKey(process.env.EMAIL_API)
  const msg = {
    to: email, // Change to your recipient
    from: 'demowebtest68@gmail.com', // Change to your verified sender
    subject: 'CÔNG TY TNHH TM&DV TIN HỌC NHƯ Ý',
    text: 'and easy to do anywhere, even with Node.js',
    html: renderedTemplate,
  }
 await sgMail.send(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })

    randomNumber = random
    // console.log(randomNumber)
}


//hàm gửi email quên mật khẩu
export const sendMail_ForgotPassword = async function mail_forgotPass(req: Request, res: Response) {
  const email = req.body.email
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  //hàm random mã otp
  function generateRandomNumber(): number {
    return Math.floor(Math.random() * 1000000);
  }
  const random = generateRandomNumber();

  //trỏ đường dẫn đến file html templatEmail
  const templatePath = path.join(__dirname, '../themeEmail/templateEmail_forgotpassword.ejs');
  const htmlMail = fs.readFileSync(templatePath, 'utf-8')
  // Render template HTML với dữ liệu OTP
  const renderedTemplate = ejs.render(htmlMail, { otp: random });

  // Thiết lập thời gian đếm ngược là 30 giây
  const countDownTime = 60 * 1000; // 30 giây tính theo millisecond
  let countdown = setTimeout(() => {
    // Sau 30 giây, đặt lại biến randomNumber thành 0
    randomNumber_ForgotPassword = 0;
  }, countDownTime);

  //GUI EMAIL
  if (!process.env.EMAIL_API) {
    throw new Error("Missing EMAIL_API environment variable");
  }

  await sgMail.setApiKey(process.env.EMAIL_API)
  const msg = {
    to: email, // Change to your recipient
    from: 'demowebtest68@gmail.com', // Change to your verified sender
    subject: 'SUPORT - CÔNG TY TNHH TM&DV TIN HỌC NHƯ Ý',
    text: 'and easy to do anywhere, even with Node.js',
    html: renderedTemplate,
  }
 await sgMail.send(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })

  randomNumber_ForgotPassword = random
}

//CONTACT

//Gửi mail thông qua SendGrid
export const contact = async function Email(req: Request, res: Response) {
  const email = req.body.email
  const subject = req.body.subject
  const text = req.body.text
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  if (!process.env.EMAIL_API) {
    throw new Error("Missing EMAIL_API environment variable");
  }

  await sgMail.setApiKey(process.env.EMAIL_API)
  const msg = {
    to: 'truonglochg0192@gmail.com', // Change to your recipient
    from: 'demowebtest68@gmail.com', // Change to your verified sender
    subject: subject,
    text: text,
  }
 await sgMail.send(msg)
    .then(() => {
      return res.json("Đã gửi thành công")
    })
    .catch((error) => {
      return res.json("Lỗi")
    })
}

//Gửi mail thông qua mật khẩu ứng dụng - nodemailer
export const contact2 = async function Email2(req:Request, res:Response){
  const contact = req.body.contact
  const subject = req.body.subject
  const info=req.body.info
  const text = req.body.text  

  let testAccount = await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "demowebtest68@gmail.com",
      pass: "eczgxgmcrbbsdzed"
    }
  });

  let infoemail = await transporter.sendMail({
    from: `"Khách hàng (${contact}) - Tinhocnhuy.com" <sender@gmail.com>`, // sender address
    to: "tinhocnhuy@gmail.com", // list of receivers
    subject: subject, // Subject line
    // text: "Số điện thoại Khách hàng:  "+ `${phone} - ` + "Nội dung:" + " " + text  , // plain text body
    html: `<b>${info}</b><b>Nội dung:</b><p> ${text}</p>`
  }, (err) => {
    if (err) {
      return res.json({ mess: "loi:", err });
    }
    return res.json({ mess: "da gui thanh cong" })
  }
  );
  
}