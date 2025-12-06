import Router from "express"
import * as authService from "./auth.service.js"
import {authentication, tokenTypeEnum} from "../../Middlewares/auth.middleware.js"
import { validation } from "../../Middlewares/validation.middleware.js";
import { confirmEmailSchema, logInSchema, signUpSchema ,forgetPasswordSchema ,resetPasswordSchema 
    ,updatePasswordSchema ,twoStepVerificationLogInSchema ,verifyLogInOtpSchema} from "./auth.validation.js";
const authRouter = Router();
authRouter.post(
    "/signUp",
    validation(signUpSchema)
    ,authService.signUp)
    
authRouter.post(
    "/logIn",
    validation(logInSchema),
    authService.logIn)
authRouter.patch("/confirm-email",
    validation(confirmEmailSchema),
    authService.confirmEmail)

authRouter.post("/resend-otp",authService.resendOtp)
authRouter.post(
    "/revoke-token"
    ,authentication({tokenType:tokenTypeEnum.ACCESS})
    ,authService.logOut)

authRouter.post("/refresh-token",
    authentication({tokenType:tokenTypeEnum.REFRESH})
    ,authService.refreshToken)

authRouter.post("/social-login",authService.loginWithGmail)
authRouter.patch(
    "/forget-password",
    validation(forgetPasswordSchema),
    authService.forgetPassword)

authRouter.patch("/reset-password",
    validation(resetPasswordSchema),
    authService.resetPassword)

authRouter.patch(
    "/update-password",
    validation(updatePasswordSchema),
    authService.updatePassword)

authRouter.patch(
    "/two-step-verification-logIn",
    validation(twoStepVerificationLogInSchema),
    authService.twoStepVerificationLogIn
)
authRouter.patch(
    "/verify-logIn-otp",
    validation(verifyLogInOtpSchema),
    authService.verifyLogInOtp
)
export default authRouter;