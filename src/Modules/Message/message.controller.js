import Router from "express"
import * as messageService from "./message.service.js"
import { validation } from "../../Middlewares/validation.middleware.js";
import {sendMessageSchema} from "../Message/message.validation.js"
const messageRouter = Router();
messageRouter.post("/send-message/:receiverId",validation(sendMessageSchema),messageService.sendMessage)
messageRouter.get("/get-message",messageService.getMessages)
export default messageRouter;