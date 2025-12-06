import * as dbService from "../../DB/dbService.js";
import UserModel from "../../DB/Models/user.model.js";
import MessageModel from "../../DB/Models/message.model.js";
import { successResponse } from "../../Utils/successResponse.utils.js"
export const sendMessage =async(req ,res ,next )=>{
    const {content}=req.body;
    const {receiverId}=req.params;

    const user = await dbService.findById({
        model:UserModel,
        id:receiverId
    })
    if(!user) 
        return next(new Error("User you want to send a message to is not found",{cause:404}))
    const message = await dbService.create({
        model:MessageModel,
        data:[{
            content,
            receiverId:user._id
        }]
    })
    return successResponse({
            res,
            statusCode:200,
            message:"Message Sent Successfully",
            data:{message}
        })

}
export const getMessages =async(req ,res ,next )=>{

    const messages = await dbService.find({
        model:MessageModel,
        populate:[
            {
                path:"receiverId",
                select: " firstName lastName email gender -_id"
            }
        ]
    })

    return successResponse({
            res,
            statusCode:200,
            message:"Message Fetched Successfully",
            data:{messages}
        })

}