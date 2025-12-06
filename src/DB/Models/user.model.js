// import { string } from "joi";
import mongoose ,{Schema} from "mongoose";

export const gender ={
    MALE:"MALE",
    FEMALE:"FEMALE"
}
export const providerEnum={
    SYSTEM:"SYSTEM",
    GOOGLE:"GOOGLE"
}
export const roleEnum={
    USER:"USER",
    ADMIN:"ADMIN"
}
const userSchema = new Schema({
    firstName :{
        type:String,
        required:true,
        trim:true,
        minLength:[2,"first name must be at least 2 character long"],
        maxLength:[20,"first name must be at most 20 character long"]
    },
    lastName :{
        type:String,
        required:true,
        trim:true,
        minLength:[2,"last name must be at least 2 character long"],
        maxLength:[20,"last name must be at most 20 character long"]
    },
    email :{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password :{
        type:String,
        required: function () {
        return this.provider === providerEnum.SYSTEM;
    },
    },
    gender :{
        type:String,
        enum:{
        values:Object.values(gender),
        message:"{VALUE} is not vaild gender",
        },
        default:gender.MALE
    },
    provider:{
        type:String,
        enum:{
        values:Object.values(providerEnum),
        message:"{VALUE} is not vaild provider",
        },
        default:providerEnum.SYSTEM
    },
    role:{
        type:String,
        enum:{
        values:Object.values(roleEnum),
        message:"{VALUE} is not vaild role",
        },
        default:roleEnum.USER
    },
    oldPasswords:{
        type:[String],
        default:[]
    }
    ,
    profileImage:String,
    coverImages:[String],
    cloudProfileImage:{public_id:String,secure_url:String},
    cloudCoverImages:[{public_id:String,secure_url:String}],
    phone:String,
    confirmEmail:Date,
    confirmEmailOtp:String,
    otpExpiresAt:Date,
    otpLogin:String,
    otpLoginExpiresAt:Date,
    forgetPasswordOtp:String,
    forgetPasswordOtpExpires:Date,
    freezedAt:Date,
    freezedByRole: {
    type: String,
    enum: Object.values(roleEnum)
    },
    freezedBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" },
    restoredAt:Date,
    restoredBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    trustedDevices: [
    {
        deviceId: String,
        ip: String,
        lastUsed: Date
    } ],
    loginOTP: String,
    loginOTPExpires: Date

},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals: true}
})

userSchema.virtual("message",{
    localField:"_id",
    foreignField:"receiverId",
    ref: "Message"
})
const UserModel = mongoose.models.user || mongoose.model("User",userSchema);

export default UserModel;