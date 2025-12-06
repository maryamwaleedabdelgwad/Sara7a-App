import mongoose ,{Schema} from "mongoose";

const messageSchema = new Schema({
    content :{
        type:String,
        required:true,
        minLength:[2,"Message at must be at least 2 characters long"],
        maxLength:[500,"Message at must be at most 500 characters long"]
    },
    receiverId :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
},{timestamps:true})

const MessageModel = mongoose.models.message || mongoose.model("Message",messageSchema);

export default MessageModel;