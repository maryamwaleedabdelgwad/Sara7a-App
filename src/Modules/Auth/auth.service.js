import UserModel, { providerEnum } from "../../DB/Models/user.model.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import * as dbService from "../../DB/dbService.js"
import {hash} from "../../Utils/Hasing/hasing.utils.js"
import { compare } from "../../Utils/Hasing/hasing.utils.js";
import { encrypt } from "../../Utils/Encryption/encryption.utils.js";
import { sendEmail } from "../../Utils/Email/email.utils.js";
import { emailSubject } from "../../Utils/Email/email.utils.js";
import { eventEmitter } from "../../Utils/Events/email.events.utils.js";
import { customAlphabet } from "nanoid";
import { generateToken, verfiyToken ,getNewLoginCredientials} from "../../Utils/Tokens/token.utils.js";
import TokenModel from "../../DB/Models/token.model.js";
import {OAuth2Client} from 'google-auth-library';
import {validateNewPassword} from "../../Middlewares/validation.middleware.js"

export const signUp = async(req,res,next)=>{
    console.log("before create");
    const {firstName , lastName , email , password ,gender , phone , ip}=req.body;
    const checkUser =await dbService.findOne({model:UserModel,filter:{email}});
    if(checkUser){
        return next(new Error("User Already Exist",{cause:409}))
    }
    const otp = customAlphabet("0123456789AQZWSXEDCRFVTGBYHNUJMIKOLP",6)();
    const otpExpiresAt = Date.now() + 5 * 60 * 1000;
    const user =await dbService.create({model:UserModel ,
        data :[{
            firstName ,
            lastName ,
            email ,
            password:await hash({plainText:password}) ,
            gender , 
            phone:encrypt(phone),
            confirmEmailOtp :await hash({plainText:otp}),
            otpExpiresAt,
            $push: { 
            trustedDevices: {
                deviceId: crypto.randomUUID(),
                ip,
                lastUsed: new Date()
            }
        }
        }]})
    eventEmitter.emit("confirmEmail",
        {   to:email , 
            otp,
            subject:emailSubject.confirmEmail,
            firstName: firstName ,
            lastName:lastName})
    return successResponse({
        res,
        statusCode:200,
        message:"User Created Successfully",
        data :{user}})
};

export const logIn = async(req,res,next)=>{

    const { email , password}=req.body;
    const checkUser = await dbService.findOne({model:UserModel , filter:{email}})
    // const checkUser =await UserModel.findOne({email,password});
    if(!checkUser){
        return next(new Error("User Not Exist , you must signUp first",{cause:404}))
    }

    if(!(await compare({plainText:password,hashedText:checkUser.password})))
        return next(new Error("Invaild email or password",{cause:400}))

    if(!checkUser.confirmEmail)
        return next(new Error("not happen confirmation on your email ,yet",{cause:400}))
    
    const creidentials =  await getNewLoginCredientials(checkUser)
    return successResponse({
    res,
    statusCode:200,
    message:"User LoggedIn Successfully",
    data :{creidentials}})
};
export const confirmEmail = async(req,res,next)=>{

    const { email , otp}=req.body;
    const checkUser = await dbService.findOne({
        model:UserModel , 
        filter:{
            email,
            confirmEmail : {$exists:false},
            confirmEmailOtp :{$exists:true}
        }})
    if(!checkUser){
        return next(new Error("User Not Exist or Email Already Confirmed , enter invaild info",{cause:404}))
    }
    if (Date.now() > checkUser.otpExpiresAt) {
    return next(new Error("OTP expired, please request a new one", { cause: 400 }));
    }
    const isValid = await compare({ plainText: otp, hashedText: checkUser.confirmEmailOtp });
    if (!isValid) {
    return next(new Error("Invalid OTP", { cause: 400 }));
    }
    if(!(await compare({plainText:otp,hashedText:checkUser.confirmEmailOtp})))
        return next(new Error("Invaild OTP",{cause:400}))
    await dbService.updateOne({
        model:UserModel,
        filter :{
            email
        },
        data :{
            confirmEmail: Date.now(),
            $unset :{confirmEmailOtp:true , otpExpiresAt:true},
            $inc:{__v:1}
        }
    })
    return successResponse({
        res,
        statusCode:200,
        message:"Email Confirmed Successfully",
        data :{checkUser}})
};
export const resendOtp = async (req, res, next) => {
    const { email } = req.body;
    const user = await dbService.findOne({ model: UserModel, filter: { email } });
    if (!user) return next(new Error("User not found", { cause: 404 }));

    const newOtp = customAlphabet("0123456789AQZWSXEDCRFVTGBYHNUJMIKOLP", 6)();
    user.confirmEmailOtp = await hash({ plainText: newOtp });
    user.otpExpiresAt = Date.now() + 5 * 60 * 1000;
    await user.save();

    eventEmitter.emit("confirmEmail", {
    to: email,
    otp: newOtp,
    firstName: user.firstName,
    lastName: user.lastName
    });

    return successResponse({
    res,
    statusCode: 200,
    message: "New OTP sent successfully"
    });
};
export const logOut = async(req,res,next)=>{
    
    await dbService.create({
        model:TokenModel,
        data :[{
            jwtid : req.decoded.jti ,
            expirseIn: new Date (req.decoded.exp * 1000),
            userId:req.user._id
        }]
    })
    return successResponse({
        res,
        statusCode:200,
        message:"Logged Out Successfully"
})
};
export const refreshToken = async(req,res,next)=>{
    
    const user = req.user
    const credientials =  await getNewLoginCredientials(user)
    return successResponse({
        res,
        statusCode:200,
        message:"Token Refreshed Successfully",
        data:{credientials}
})
};
export const forgetPassword= async(req,res,next)=>{
    const {email}=req.body;
    const otp = customAlphabet("0123456789AQZWSXEDCRFVTGBYHNUJMIKOLP",6)();

    const expiryTime = Date.now() + 5 * 60 * 1000
    const user = await dbService.findOneAndUpdate({
        model:UserModel,
        filter:{
            email,
            confirmEmail:{$exists:true}
        },
        data :{
            forgetPasswordOtp: await hash({plainText:otp}),
            forgetPasswordOtpExpires:expiryTime,
            $inc :{__v:1}
        }
    
    })
    if(!user) return next(new Error("User not found or email not confirmed",{cause:404}))
    
    eventEmitter.emit("forgetPassword",
        {   to:email , 
            otp,
            subject:emailSubject.resetPassword,
            firstName: user.firstName ,
            lastName:user.lastName})
    return successResponse({
    res,
    statusCode:200,
    message:`Check Your Box ${user.firstName}`,
})
};
export const resetPassword= async(req,res,next)=>{
    const {email ,otp , password }=req.body;

    const user = await dbService.findOne({
        model:UserModel,
        filter:{
            email,
            confirmEmail:{$exists:true}
        }
    })
    if(!user) return next(new Error("User or Email not found ",{cause:404}))
    
    if(Date.now() > user.forgetPasswordOtpExpires)
        return next(new Error("OTP expired",{cause:400}))
    if(!(await compare({plainText:otp,hashedText:user.forgetPasswordOtp})))
        return next(new Error("Invaild OTP ",{cause:400}))
    await validateNewPassword(user, password);
    const updatedOldPasswords = [...user.oldPasswords, user.password];
    await dbService.findOneAndUpdate({
        model:UserModel,
        filter:{
            email},
        data:{
            password:await hash({plainText:password}),
            oldPasswords: updatedOldPasswords,
            $unset:{forgetPasswordOtp:true,forgetPasswordOtpExpires:true},
            $inc:{__v:1}
        }
    })
    return successResponse({
    res,
    statusCode:200,
    message:`Password Reset Successfully`,
})
};
export const updatePassword= async(req,res,next)=>{
    const {email ,oldPassword ,newPassword , confirmPassword }=req.body;

    const user = await dbService.findOne({
        model:UserModel,
        filter:{
            email},
    })
    if(!user) return next(new Error("User or Email not found ",{cause:404}))

    const isMatch =await compare({plainText:oldPassword,hashedText:user.password})
    if(!isMatch)
        return next(new Error("Old Password in incorrect",{cause:400}))

    await validateNewPassword(user, newPassword);

    // this code to prevent store different hash for same password
    let duplicate = false;
    for (const hashed of user.oldPasswords) {
    if (await compare({ plainText: oldPassword, hashedText: hashed })) {
        duplicate = true;
        break;
    }
    }
    if (!duplicate) user.oldPasswords.push(user.password);
    ///////////////////////////////////////////////////////

    const updateUser =await dbService.findOneAndUpdate({
        model:UserModel,
        filter:{
            email},
        data:{
            password:await hash({plainText:newPassword}),
            oldPasswords:user.oldPasswords,
            $inc:{__v:1}
        },
        options:{
            new:true
        }
    })
    return successResponse({
    res,
    statusCode:200,
    message:`Password Updated Successfully`,
    data:{updateUser}
})
};
async function verifyGoogleAccount({idToken}){
    const client = new OAuth2Client(process.env.CLIENT_ID);
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID,  
    });
    const payload = ticket.getPayload();
    return payload
}
export const loginWithGmail= async(req,res,next)=>{
    const {idToken}=req.body
    // const {email ,email_verified ,given_name ,family_name ,picture}= await verifyGoogleAccount({idToken})
    const payload = await verifyGoogleAccount({ idToken });

    if (!payload) return next(new Error("Invalid Google token", { cause: 401 }));

    const {
        email,
        email_verified,
        given_name,
        family_name
    } = payload;
    if(!email_verified) return next(new Error("Email not verified",{cause:401}))

    const user = await dbService.findOne({
        model:UserModel,
        filter:{email}
    })
    if(user){
        if(user.provider === providerEnum.GOOGLE){
        const credientials =  await getNewLoginCredientials(user)
    return successResponse({
    res,
    statusCode:200,
    message:"User LoggedIn Successfully",
    data :{credientials}})
        }
    return next(new Error("Email already exists but not Google account", { cause: 400 }));
    }


    const newUser = await dbService.create({
        model:UserModel,
        data:[{
            firstName:given_name,
            lastName:family_name,
            email,
            confirmEmail: Date.now(),
            provider:providerEnum.GOOGLE
        }]
    });
    const credientials =  await getNewLoginCredientials(newUser)
    return successResponse({
    res,
    statusCode:200,
    message:`User Logged In  Successfully`,
    data:{credientials}
})
};
export const twoStepVerificationLogIn = async(req,res,next)=>{
    const { email , password,ip}=req.body;
    const checkUser = await dbService.findOne({model:UserModel , filter:{email}})
    if(!checkUser){
        return next(new Error("User Not Exist , you must signUp first",{cause:404}))
    }
    if(!(await compare({plainText:password,hashedText:checkUser.password})))
        return next(new Error("Invaild email or password",{cause:400}))

    if(!checkUser.confirmEmail)
        return next(new Error("not happen confirmation on your email ,yet",{cause:400}))
    
    const isExist = checkUser.trustedDevices?.some(
    (device) => device.ip === ip);
    if(!isExist){
        const otpLogin = customAlphabet("0123456789",3)();
        const otpLoginExpiresAt = Date.now() + 5 * 60 * 1000;
        eventEmitter.emit("loginVerfication",
        {   to:email , 
            otp:otpLogin,
            firstName: checkUser.firstName ,
            lastName:checkUser.lastName,
            subject:emailSubject.loginVerfication,
        })
        await dbService.findOneAndUpdate({
            model:UserModel,
            filter:{
                email,
            },
            data:{
                otpLogin: await hash({plainText:otpLogin}),
                otpLoginExpiresAt: otpLoginExpiresAt,
            }
        })
        return successResponse({
            res,
            statusCode: 200,
            message: "OTP sent to your email, please verify it",
        });
    }
    const creidentials =  await getNewLoginCredientials(checkUser)
    return successResponse({
    res,
    statusCode:200,
    message:"User LoggedIn Successfully",
    data :{creidentials}})
}
export const verifyLogInOtp =async (req,res,next)=>{
        const {email,otp,ip} = req.body
        const checkUser =  await dbService.findOne({
            model:UserModel,
            filter:{
                email,
                otpLogin: { $exists: true },
                otpLoginExpiresAt: { $exists: true }
            }
        })
        if(!checkUser){
        return next(new Error("User Not Exist ,Invaild email or OTP",{cause:404}))
        }
    if (Date.now() > checkUser.otpLoginExpiresAt) {
    return next(new Error("OTP expired, please request a new one", { cause: 400 }));
    }
    const isValid = await compare({ plainText: otp, hashedText: checkUser.otpLogin});
    if (!isValid) {
    eventEmitter.emit("invalidOtpWarning",
        {   to:email , 
            firstName: checkUser.firstName ,
            lastName:checkUser.lastName,
            subject:emailSubject.invalidOtpWarning,
        })
    return next(new Error("Invalid OTP", { cause: 400 }));
    }
    await dbService.findOneAndUpdate({
        model: UserModel,
        filter: { email },
        data: {
            $push: { 
            trustedDevices: {
                deviceId: crypto.randomUUID(),
                ip,
                lastUsed: new Date()
            }
        },
            $unset: { otpLogin:true, otpLoginExpiresAt:true }
        }
    });
    const creidentials =  await getNewLoginCredientials(checkUser)
    return successResponse({
    res,
    statusCode:200,
    message:"User LoggedIn Successfully",
    data :{creidentials}})

}