
import { gender, roleEnum } from "../../DB/Models/user.model.js";
import joi from "joi"
import { generalFields } from "../../Middlewares/validation.middleware.js";
console.log("validation middleware reached");
export const signUpSchema ={
    body:joi.object({
    firstName:generalFields.firstName.required(),
    lastName:generalFields.lastName.required(),
    email:generalFields.email.required(),
    password:generalFields.password.required(),
    confirmPassword:generalFields.confirmPassword,
    gender:generalFields.gender,
    phone:generalFields.phone,
    ip :joi.string().required(),
    role:joi.string().valid(...Object.values(roleEnum)).default(roleEnum.USER)
})
}
export const logInSchema ={
    body:joi.object({
    email:generalFields.email.required(),
    password:generalFields.password.required(),
})
}
export const confirmEmailSchema ={
    body:joi.object({
    email:generalFields.email.required(),
    otp:generalFields.otp.required(),
})
}
export const forgetPasswordSchema ={
    body:joi.object({
    email:generalFields.email.required(),
})
}
export const resetPasswordSchema={
        body:joi.object({
    email:generalFields.email.required(),
    otp:generalFields.otp.required(),
    password:generalFields.password.required(),
    confirmPassword:generalFields.confirmPassword
})
}
export const updatePasswordSchema={
        body:joi.object({
    email:generalFields.email.required(),
    oldPassword:generalFields.password.required(),
    newPassword:generalFields.password.required(),
    confirmPassword: joi.valid(joi.ref('newPassword')).messages({
    'any.only': 'newPassword and confirmPassword do not match'
}).required()


})
}
export const twoStepVerificationLogInSchema={
    body:joi.object({
    email:generalFields.email.required(),
    password:generalFields.password.required(),
    ip :joi.string().required()
})
}
export const verifyLogInOtpSchema={
    body:joi.object({
    email:generalFields.email.required(),
    otp:generalFields.otp.required(),
    ip :joi.string().required()
})
}
