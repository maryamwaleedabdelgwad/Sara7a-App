import express from "express"
import dotenv from "dotenv";
import chalk from "chalk"
import boostrap from "./src/app.controller.js";
import {startDeleteOldUsersCron} from "./src/Utils/CronJobs/hardDelete.utils.js"
dotenv.config({path:"./src/config/.env.dev"})
const port =process.env.PORT || 5000;
const app =express();
await boostrap(app,express)
startDeleteOldUsersCron()
// app.listen(port,()=>{
//     console.log(`server is running at http://localhost:${port}`)
// })
app.listen(port,()=>{
    console.log(chalk.bgGreen(chalk.black(`server is running at http://localhost:${port}`)))
})
