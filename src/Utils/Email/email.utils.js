//         iitt xfut lxkg hkya
import nodemailer from "nodemailer";
export async function sendEmail({
    to = "",
    text ="",
    html ="",
    subject ="",
    attachments = [],
    cc ="",
    bcc =""
}){
    const transporter = nodemailer.createTransport({
        service :"gmail",
        auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD,
    },
    tls: {
    rejectUnauthorized: false, 
    }
});
const info = await transporter.sendMail({
    from: `"Maryam AbdelGwad (•_•) " <${process.env.USER_EMAIL}>`,
    to,
    subject,
    text, 
    html, 
    attachments,
    cc,
    bcc,
    });

console.log("Message sent:", info.messageId);

}

export const emailSubject = {
    confirmEmail:"Confirm Your Email",
    resetPassword:"Reset Your Pasword",
    loginVerfication:"Your Verification Code",
    invalidOtpWarning:"Warning Email"
}