import nodemailer from "nodemailer";
import { Request, Response } from "express";
import * as fs from "fs";
import * as ejs from "ejs";
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config();


function generateRandomNumber(): number {
  return Math.floor(Math.random() * 1000000);
}

nodemailer.createTestAccount();
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.emailAddress,
    pass: process.env.emailPassword
  }
});

export let randomNumber: number = 0

export let randomNumber_ForgotPassword: number = 0

export const OTPDangki = async function mail(req: Request, res: Response) {
  const email = req.body.email

  const random = await generateRandomNumber();

  const templatePath = path.join(__dirname, '../themeEmail/templateEmail.ejs');
  const htmlMail = fs.readFileSync(templatePath, 'utf-8')
  const renderedTemplate = ejs.render(htmlMail, { otp: random });
  const countDownTime = 60 * 1000;
  setTimeout(() => {
    randomNumber = 0;
  }, countDownTime);

  const msg = {
    to: email,
    from: 'websitetinhocnhuy@gmail.com',
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

  const random = generateRandomNumber();
  const templatePath = path.join(__dirname, '../themeEmail/templateEmail_forgotpassword.ejs');
  const htmlMail = fs.readFileSync(templatePath, 'utf-8')
  const renderedTemplate = ejs.render(htmlMail, { otp: random });
  const countDownTime = 60 * 1000;
  setTimeout(() => {
    randomNumber_ForgotPassword = 0;
  }, countDownTime);

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

export const contact = async function Email(req: Request, res: Response) {
  const contact = req.body.contact
  const info = req.body.info
  const text = req.body.text

  await transporter.sendMail({
    from: `"Khách hàng ${contact} - Tinhocnhuy.com"<sender@gmail.com>`,
    to: "tinhocnhuy@gmail.com",
    subject: "YÊU CẦU TƯ VẤN",
    html: `<b>${info}</b><p><b> Nội dung:</b></p><p> ${text}</p>`
  }, (err) => {
    if (err) {
      return res.json({ mess: "loi:", err });
    }
    return res.json({ mess: "da gui thanh cong" })
  }
  );

}