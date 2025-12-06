// not used in version 5 from express
// export const asyncHandler = (fn) =>{
//     return (req,res,next)=>{
//         fn(req,res,next).catch((error)=>{
//             return res
//             .status(error.status)
//             .json({
//                 message:"Internal Server Error :",
//                 error: error.message,
//                 stack : error.stack})
//         })
//     }
// }

export const globalErrorHandler =(err,req,res,next)=>{
    const status = err.cause || 500;
        return res
            .status(status)
            .json({
                message:"something went wrong :",
                error: err.message,
                stack : err.stack})
}