import connectDB from "./DB/connection.js";
import cors from "cors";
import {corsOption} from "./Utils/Cors/cors.utils.js"
import {rateLimit} from "express-rate-limit"
import morgan from "morgan"
import helmet from "helmet"
import path from "node:path"
import authRouter from "./Modules/Auth/auth.controller.js"
import userRouter from "./Modules/User/user.controller.js";
import messageRouter from "./Modules/Message/message.controller.js"
import  {globalErrorHandler} from "./Utils/globalErrorHandler.utils.js";
import { attachRouterWithLogger } from "./Utils/Logger/logger.utils.js";
const boostrap = async(app,express)=>{
app.use(express.json());
app.use(cors(corsOption()));
app.use(helmet())
const limiter = rateLimit({
    windowMs:2*60*1000,
    limit:5,
    message:{
        statusCode:429,
        message:"Too Many Requests ,please try later"
    },
    legacyHeaders:true
})
app.use(limiter)
await connectDB();

// for logs 
attachRouterWithLogger(app,"/api/v1/auth",authRouter,"auth.logs")
attachRouterWithLogger(app,"/api/v1/user",userRouter,"users.logs")
attachRouterWithLogger(app,"/api/v1/message",messageRouter,"message.logs")

app.get("/",(req,res)=>{
    return res.status(200).json({message:"Welcome"})
});

app.use("/Uploads",express.static(path.resolve("./src/Uploads")))
app.use("/api/v1/auth",authRouter)
app.use("/api/v1/user",userRouter)
app.use("/api/v1/message",messageRouter)
app.all("/*dummy",(req,res)=>{
    return res.status(500).json({message:"not found handler!!!!!!!"})
})

app.use(globalErrorHandler)
}
export default  boostrap;