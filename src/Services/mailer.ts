import nodemailer from "nodemailer";
import { Request, Response } from "express";
import * as fs from "fs";
import * as ejs from "ejs";
import * as path from 'path';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();
import { CONFIG } from "../config/config";

export let randomNumber: number = 0

export let randomNumber_ForgotPassword: number = 0

export const OTPDangki = async function mail(req: Request, res: Response) {
  const email = req.body.email

  function generateRandomNumber(): number {
    return Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
  }
  const random = await generateRandomNumber();

  const templatePath = path.join(__dirname, '../themeEmail/templateEmail.ejs');//
  const htmlMail = fs.readFileSync(templatePath, 'utf-8')//
  const renderedTemplate = ejs.render(htmlMail, { otp: random });//
  const countDownTime = 60 * 1000;
  let countdown = setTimeout(() => {//
    randomNumber = 0;
  }, countDownTime);

  await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: CONFIG.email.emailaddress,
      pass: CONFIG.email.emailpassword
    }
  })

  const msg = {
    to: email, // Change to your recipient
    from: 'websitetinhocnhuy@gmail.com', // Change to your verified sender
    subject: 'CÔNG TY TNHH TM&DV TIN HỌC NHƯ Ý',
    text: 'and easy to do anywhere, even with Node.js',
    html: renderedTemplate,
  }
  await transporter.sendMail(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })
  randomNumber = random
}

export const sendMail_ForgotPassword = async function mail_forgotPass(req: Request, res: Response) {
  const email = req.body.email

  function generateRandomNumber(): number {
    return Math.floor(Math.random() * 1000000);
  }
  const random = generateRandomNumber();
  const templatePath = path.join(__dirname, '../themeEmail/templateEmail_forgotpassword.ejs');
  const htmlMail = fs.readFileSync(templatePath, 'utf-8')
  const renderedTemplate = ejs.render(htmlMail, { otp: random });
  const countDownTime = 60 * 1000;
  let countdown = setTimeout(() => {
    randomNumber_ForgotPassword = 0;
  }, countDownTime);

  await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: CONFIG.email.emailaddress,
      pass: CONFIG.email.emailpassword
    }
  })

  const msg = {
    to: email,
    from: 'websitetinhocnhuy@gmail.com',
    subject: 'SUPORT - CÔNG TY TNHH TM&DV TIN HỌC NHƯ Ý',
    text: 'and easy to do anywhere, even with Node.js',
    html: renderedTemplate,
  }
  await transporter.sendMail(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })

  randomNumber_ForgotPassword = random

}

// export const contact = async function Email(req: Request, res: Response) {
//   const email = req.body.email
//   const subject = req.body.subject
//   const text = req.body.text
//   if (!process.env.EMAIL_API) {
//     throw new Error("Missing EMAIL_API environment variable");
//   }

//   await sgMail.setApiKey(process.env.EMAIL_API)
//   const msg = {
//     to: 'truonglochg0192@gmail.com',
//     from: 'demowebtest68@gmail.com',
//     subject: subject,
//     text: text,
//   }
//   await sgMail.send(msg)
//     .then(() => {
//       return res.json("Đã gửi thành công")
//     })
//     .catch((error) => {
//       return res.json("Lỗi")
//     })
// }

export const contact2 = async function Email2(req: Request, res: Response) {
  const contact = req.body.contact
  const subject = req.body.subject
  const info = req.body.info
  const text = req.body.text

  let testAccount = await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: CONFIG.email.emailaddress,
      pass: CONFIG.email.emailpassword
    }
  });

  let infoemail = await transporter.sendMail({
    from: `"Khách hàng (${contact}) - Tinhocnhuy.com" <sender@gmail.com>`,
    to: "tinhocnhuy@gmail.com",
    subject: subject,
    html: `<b>${info}</b><b>Nội dung:</b><p> ${text}</p>`
  }, (err) => {
    if (err) {
      return res.json({ mess: "loi:", err });
    }
    return res.json({ mess: "da gui thanh cong" })
  }
  );

}