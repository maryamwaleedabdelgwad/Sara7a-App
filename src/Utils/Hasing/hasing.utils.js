import bcrypt from "bcrypt"

export const hash = async({plainText = "" ,saltRound=Number(process.env.SALT_ROUND)})=>{
    return await bcrypt.hash(plainText,saltRound)
}
export const compare = async({plainText  ,hashedText})=>{
    return await bcrypt.compare(plainText,hashedText)
}