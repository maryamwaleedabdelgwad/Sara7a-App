import { EventEmitter } from "node:events";
import {emailSubject} from "../Email/email.utils.js";
import {sendEmail} from "../Email/email.utils.js";
import { template , loginVerificationTemplate ,suspiciousAttemptTemplate} from "../Email/generateHTML.js";
export const eventEmitter = new EventEmitter()
eventEmitter.on("confirmEmail", async(data)=>{
    await sendEmail({
        to:data.to , 
        subject :data.subject,
        html : template(data.otp , data.firstName ,data.lastName,data.subject)}).catch((error)=>{
            console.log(`Error in sending confirmation email : ${error}`)
        })
})
eventEmitter.on("forgetPassword", async(data)=>{
    await sendEmail({
        to:data.to , 
        subject:data.subject,
        html : template(data.otp , data.firstName ,data.lastName ,data.subject)}).catch((error)=>{
            console.log(`Error in sending confirmation email : ${error}`)
        })
})
eventEmitter.on("loginVerfication", async(data)=>{
    await sendEmail({
        to:data.to , 
        subject:data.subject,
        html : loginVerificationTemplate(data.otp ,data.firstName ,data.lastName,data.subject)}).catch((error)=>{
            console.log(`Error in sending verification email : ${error}`)
        })
})
eventEmitter.on("invalidOtpWarning", async (data) => {
    await sendEmail({
        to: data.to,
        subject: data.subject,
        html: suspiciousAttemptTemplate(data.firstName, data.lastName, data.subject)
    }).catch(err => {
        console.log("Error in sending warning email:", err);
    });
});
