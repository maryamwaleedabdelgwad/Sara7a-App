import * as dbService from "../../DB/dbService.js"
import UserModel, { roleEnum } from "../../DB/Models/user.model.js"
import { decrypt } from "../../Utils/Encryption/encryption.utils.js"
import { cloudinaryConfig } from "../../Utils/Multer/cloudinary.config.js"
import { successResponse } from "../../Utils/successResponse.utils.js"

export const listAllUsers = async(req,res,next)=>{
    let users = await dbService.find({
        model:UserModel,
        populate:[{path:"messages",select:"content -receiverId"}]
    })
    users = users.map((user)=>{
        return{...user._doc ,phone:decrypt(user.phone)}
    })
    return successResponse({
        res,
        statusCode:200,
        message:"Users Fetched Successfully",
        data:{users}
    })
}
export const updateUserProfile =async(req,res,next)=>{
    const {firstName , lastName ,phone} =req.body;

    if(!req.user) return next (new Error("Token is revoked , please, login again", {cause:400}))
    const userProfile = await dbService.findByIdAndUpdate({
        model:UserModel ,  
        id:req.user._id, 
        data :{firstName , lastName ,phone,$inc:{__v :1}} ,
    })
    return successResponse({
        res,
        statusCode:200,
        message:"User Profile Updated Successfully",
        data:{userProfile}
    })
}

export const uploadProfileImage =async(req,res,next)=>{
    const user = await dbService.findOneAndUpdate({
        model:UserModel,
        filter:{_id:req.user._id},
        data:{profileImage: req.file.finalPath}
    })
    return successResponse({
        res,
        statusCode:200,
        message:"Profile Image Uploaded Successfully",
        data:{user}
    })
}

export const uploadProfileImageWithCloudinary =async(req,res,next)=>{
    const {public_id,secure_url} = await cloudinaryConfig().uploader.upload(req.file.path,{
        folder:`Sara7aApp/Users/${req.user._id}`
    })
    const user = await dbService.findOneAndUpdate({
        model:UserModel,
        filter:{_id:req.user._id},
        data:{cloudProfileImage: {public_id,secure_url} }
    })
    if(req.user.cloudProfileImage?.public_id){
        await cloudinaryConfig().uploader.destroy(
            req.user.cloudProfileImage.public_id
        )
    }
    return successResponse({
        res,
        statusCode:200,
        message:"Profile Image Uploaded Successfully",
        data:{user}
    })
}
export const uploadCoverImages =async(req,res,next)=>{
    const user = await dbService.findOneAndUpdate({
        model:UserModel,
        filter:{_id:req.user._id},
        data:{coverImages: req.files.map((file)=> file.finalPath)}
    })
    return successResponse({
        res,
        statusCode:200,
        message:"Cover Images Uploaded Successfully",
        data:{file:req.file}
    })
}
export const uploadCoverImagesWithCloudinary =async(req,res,next)=>{
    const attachments =[];
    for (const file of req.files) {
        const {public_id,secure_url} = await cloudinaryConfig().uploader.upload(file.path,{
        folder:`Sara7aApp/Users/${req.user._id}`
    })
    attachments.push({public_id,secure_url})
    }
    
    const user = await dbService.findOneAndUpdate({
        model:UserModel,
        filter:{_id:req.user._id},
        data:{cloudCoverImages: attachments }
    })

    for (const image of req.user.cloudCoverImages) {
        await cloudinaryConfig().uploader.destroy(
            image.public_id
        )
    }
    return successResponse({
        res,
        statusCode:200,
        message:"Cover Images Uploaded Successfully",
        data:{user}
    })
}
export const freezeAccount= async(req,res,next)=>{ 
    const {userId}= req.params
    if(userId && req.user.role !== roleEnum.ADMIN){
        return next(new Error("Only admin can freeze another user's account"))
    }
    const updateUser = await dbService.findOneAndUpdate({
        model:UserModel,
        filter:{
            _id:userId || req.user._id,
            freezedAt:{$exists:false}
        },
        data:{
            freezedAt:Date.now(),
            freezedBy:req.user._id,
            freezedByRole:req.user.role
        }
    });
    return updateUser? 
    successResponse({
        res,
        statusCode:200,
        message:"Account Freezed Successfully",
        data:{user: updateUser}}) : next(new Error("Invaild Account"))
}
export const restoreAccount= async(req,res,next)=>{ 
    const {userId}= req.params

    const user = await UserModel.findById(userId);
    if (!user) return next(new Error("User not found"));

    if (!user.freezedAt || !user.freezedBy || !user.freezedByRole) {
        return next(new Error("Account is not frozen"));
    }
    if (user.freezedByRole !== req.user.role) {
        return next(new Error("You are not allowed to restore this account (role mismatch)"));
    }
    const updateUser = await dbService.findOneAndUpdate({
        model:UserModel,
        filter:{
            _id:userId ,
            freezedAt:{$exists:true},
            freezedBy:{$exists:true}
        },
        data:{
            $unset:{freezedAt:true , freezedBy:true},
            restoredAt:Date.now(),
            restoredBy:req.user._id
        }
    });
    return updateUser? 
    successResponse({
        res,
        statusCode:200,
        message:"Account Restored Successfully",
        data:{user:updateUser}}) 
        : next(new Error("Invaild Account"))
}