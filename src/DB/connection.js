import mongoose from "mongoose"
const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.DB_URI,{
            serverSelectionTimeoutMS:5000
        });
        console.log("mongoDB connected successfully");
    } catch (error) {
        console.log("mongoDB connection error :",error);
    }
}
//mongodb+srv://waleedmaryam:<db_password>@cluster0.apxzuyu.mongodb.net/

export default  connectDB;