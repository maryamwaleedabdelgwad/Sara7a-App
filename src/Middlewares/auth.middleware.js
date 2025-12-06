import UserModel from "../DB/Models/user.model.js"
import * as dbService from "../DB/dbService.js"
import TokenModel from "../DB/Models/token.model.js"
import { getSignature, verfiyToken } from "../Utils/Tokens/token.utils.js"

export const tokenTypeEnum={
    ACCESS:"ACCESS",
    REFRESH:"REFRESH"
}
const decodedToken = async({authorization,tokenType=tokenTypeEnum.ACCESS,next}={})=>{
        const [Bearer,token] = authorization.split(" ") || [];
        if(!Bearer || !token) 
            return next(new Error("Invaild Token format , please enter vaild format",
            {cause:400}))
        
        let signatures = await getSignature ({signatureLevel:Bearer})
        const decoded = verfiyToken({
            token, 
            secretKey: tokenType ===tokenTypeEnum.ACCESS ? 
            signatures.accessSignature : signatures.refreshSignature
        })
        if(!decoded.jti)
        return next(new Error("Invaild token , please enter vaild token",{cause:401}))

    const revokedToken = await dbService.findOne({
            model:TokenModel,
            filter:{
                jwtid : decoded.jti
            }
        })
    if(revokedToken)
        return next(new Error("Token is Revoked",{cause:400}))
    const user = await dbService.findById({
        model:UserModel,
        id: decoded.id
    })
    if(!user) 
        return next(new Error("User Not Found",{cause:404}))
    return {user , decoded}

}
export const authentication = ({tokenType = tokenTypeEnum.ACCESS})=>{
    return async (req,res,next)=>{
        const {user, decoded} =
            ( await decodedToken({
                authorization:req.headers.authorization ,
                tokenType,
                next})) || {}
    req.user = user;
    req.decoded = decoded;
    return next()
    }
}
export const authorization = ({accessRole=[]}={})=>{
    return (req,res,next)=>{
        if(!accessRole.includes(req.user.role)){
            return next(new Error("Unauthorized Access",{cause:403}))
        }
        return next()
    }
}