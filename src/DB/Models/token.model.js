import mongoose ,{Schema} from "mongoose";

const tokenSchema = new Schema({
    jwtid :{
        type:String,
        required:true,
        unique:true,
    },
    expirseIn :{
        type:Date,
        required:true,
        },
    userId :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        // required:true,
    }
},{timestamps:true})

const TokenModel = mongoose.models.Token || mongoose.model("Token",tokenSchema);

export default TokenModel;