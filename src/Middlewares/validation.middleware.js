import { gender } from "../DB/Models/user.model.js";
import joi from "joi"
import { Types } from "mongoose"
import {hash,compare} from "../Utils/Hasing/hasing.utils.js"
export const validation = (schema)=>{
    return (req,res,next)=>{
        const validationError =[];
        for (const key of Object.keys(schema)) {
            const validationResults =schema[key].validate(req[key],{
                abortEarly:false
            });
            if(validationResults.error){
                validationError.push({key,details:validationResults.error.details})
            }
            
        }
        if(validationError.length)
            return res.status(400)
        .json({message:"validation Error" ,details:validationError})

        return next()
    }
}
export const generalFields = {
    firstName :joi.string().min(2).max(20).messages({
            "string.min":"firstName must be at least 2 characters long",
            "string.max":"firstName must be at most 20 characters long",
            "any.required":"firstName is mandatory",
        }),
        lastName:joi.string().min(2).max(20).messages({
            "string.min":"lastName must be at least 2 characters long",
            "string.max":"lastName must be at most 20 characters long",
            "any.required":"lastName is mandatory",
        }),
        email:joi.string().email({
            minDomainSegments:2,
            maxDomainSegments:5,
            tlds:{
                allow :["com","net","io","org"]
            }
        }),
        password:joi.string(),
        confirmPassword:joi.ref("password"),
        gender:joi.string()
        .valid(...Object.values(gender))
        .default(gender.MALE),
        phone:joi.string()
        .pattern(new RegExp(/^01[0125][0-9]{8}$/)),
        otp:joi.string(),
        id :joi.string().custom((value,helper)=>{
                    return (
                        Types.ObjectId.isValid(value) 
                        || helper.message("Invalid ObjectId format")
                    )
                }),
        file:{
            fieldname:joi.string(),
            originalname:joi.string(),
            encoding:joi.string(),
            mimetype:joi.string(),
            size:joi.number().positive(),
            destination:joi.string(),
            filename:joi.string(),
            finalPath:joi.string(),
            path:joi.string()
        }
};
export const validateNewPassword = async (user, newPassword) => {

    const sameCurrent = await compare({
        plainText: newPassword,
        hashedText: user.password
    });

    if (sameCurrent) {
        throw new Error(`New password cannot be the same as your current password`,{cause:404})
    }

    for (const oldHashed of user.oldPasswords) {
        const usedBefore = await compare({
            plainText: newPassword,
            hashedText: oldHashed
        });

        if (usedBefore) {
            throw new Error(`You have used this password before, please choose a new one.`,{cause:404})
        }
    }
};
