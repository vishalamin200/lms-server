import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function getHtmlContent(userName, resetLink) {
    const filePath = path.join(__dirname, 'passwordReset.html');
    let htmlContent = fs.readFileSync(filePath, 'utf8');

    htmlContent = htmlContent.replace('[User]', userName)
        .replace('[reset_link]', resetLink);

    return htmlContent;
}


const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.in',   
    port: 465,
    secure: true, 
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_EMAIL_PASSWORD, 
    },
    tls: {
        rejectUnauthorized: true,
    },
});


async function sendResetEmail(userId, userEmail, userName, token) {
    try {
        const resetPasswordLink = `${process.env.CLIENT_URL}/auth/resetPassword/${userId}/${token}`;
        const htmlContent = getHtmlContent(userName, resetPasswordLink);

        const response = await transporter.sendMail({
            from: `"CodeAcademy" <${process.env.SENDER_EMAIL}>`,
            to: userEmail,
            replyTo: process.env.SENDER_EMAIL, 
            subject: 'Reset Your Password',
            html: htmlContent,
        });

        console.log("Email sent successfully:", info.response);

    } catch (error) {
        console.log("Error in Sending Mail:", error.message);
    }
}

export default sendResetEmail;
