import jwt from "jsonwebtoken"
import { v4 as uuid } from "uuid"
import { roleEnum } from "../../DB/Models/user.model.js"

export const signatureEnum ={
    USER:"USER",
    ADMIN:"ADMIN"
}
export const generateToken = ({
    payload , 
    secretKey, 
    options = {expiresIn : process.env.ACCESS_TOKEN_EXPRISE_IN}
})=>{
    return jwt.sign(payload , secretKey, options)
}
export const verfiyToken =({token ,secretKey = process.env.TOKEN_ACCESS_USER_SECRET })=>{
    return jwt.verify(token ,secretKey)
}
export const getSignature =async({signatureLevel = signatureEnum.USER}) =>{
    let signatures ={accessSignature:undefined,refreshSignature:undefined}

    switch(signatureLevel){
        case signatureEnum.ADMIN:
            signatures.accessSignature = process.env.TOKEN_ACCESS_ADMIN_SECRET
            signatures.refreshSignature=process.env.TOKEN_REFRESH_ADMIN_SECRET
            break;
        default:
            signatures.accessSignature = process.env.TOKEN_ACCESS_USER_SECRET
            signatures.refreshSignature=process.env.TOKEN_REFRESH_USER_SECRET
            break;
    }
    console.log(signatures)
    return signatures
}
export const getNewLoginCredientials =async(user)=>{
    const signatures = await getSignature({
        signatureLevel: user.role != roleEnum.USER?signatureEnum.ADMIN:signatureEnum.USER})
    const jwtid = uuid()
    const accessToken = generateToken({
        payload:{id:user._id , email:user.email},
        secretKey:signatures.accessSignature,
        options:{
            expiresIn:Number(process.env.ACCESS_TOKEN_EXPRISE_IN),
            // issuer:"http://localhost:3000",
            // audience:"http://localhost:4000",
            jwtid,
        }
    })
    const refreshToken = generateToken({
        payload:{id:user._id , email:user.email},
        secretKey:signatures.refreshSignature,
        options:{
            expiresIn : Number(process.env.REFRESH_TOKEN_EXPRISE_IN),
            jwtid,
        }
    })
    return {accessToken,refreshToken}
}