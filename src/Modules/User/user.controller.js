import {Router} from "express"
import * as userService from "./user.service.js"
import {authentication,authorization, tokenTypeEnum} from "../../Middlewares/auth.middleware.js"
import {fileValidation, localFileUpload} from "../../Utils/Multer/local.multer.js"
import {magicNumberValidationSingle,magicNumberValidationMulti,multerErrorHandler} from "../../Middlewares/magicNumbers.validation.middleware.js"
import { validation } from "../../Middlewares/validation.middleware.js"
import {profileImageSchema,coverImagesSchema, freezeAccountSchema,restoreAccountSchema} from "../User/user.validation.js"
import { cloudFileUpload } from "../../Utils/Multer/cloud.multer.js"
import { roleEnum } from "../../DB/Models/user.model.js"
const userRouter = Router();

userRouter.get("/",
    authentication({tokenType: tokenTypeEnum.ACCESS}),
    authorization({ accessRole: [roleEnum.ADMIN] }),
    userService.listAllUsers)

userRouter.patch("/update",
    authentication({tokenType: tokenTypeEnum.ACCESS}),
    authorization({ accessRole: [roleEnum.USER] })
    ,userService.updateUserProfile)

userRouter.patch(
    "/profile-image",
    authentication({tokenType: tokenTypeEnum.ACCESS}), 
    authorization({accessRole:[roleEnum.USER,roleEnum.ADMIN]}),
    localFileUpload({customPath:"User",validation:fileValidation.images}).single("profileImage")
    ,magicNumberValidationSingle(fileValidation.images),
    validation(profileImageSchema)
    ,userService.uploadProfileImage)

userRouter.patch(
    "/profile-image/with-cloudinary",
    authentication({tokenType:tokenTypeEnum.ACCESS}), 
    authorization({accessRole:[roleEnum.USER]}), 
    cloudFileUpload({validation:[...fileValidation.images]}).single("profileImage")
    ,userService.uploadProfileImageWithCloudinary)

userRouter.patch(
    "/cover-images",
    authentication({tokenType:tokenTypeEnum.ACCESS}), 
    authorization({accessRole:[roleEnum.USER]}),
    localFileUpload({ customPath: "User", validation: fileValidation.images }).array("coverImages", 4),
    magicNumberValidationMulti(fileValidation.images),
    multerErrorHandler,
    validation(coverImagesSchema),
    userService.uploadCoverImages
);

userRouter.patch(
    "/cover-images/with-cloudinary",
    authentication({tokenType:tokenTypeEnum.ACCESS}), 
    authorization({accessRole:[roleEnum.USER]}),
    cloudFileUpload({validation:[...fileValidation.images]}).array("coverImages",2),
    multerErrorHandler
    ,userService.uploadCoverImagesWithCloudinary)

userRouter.delete(
    "{/:userId}/freeze-account",
    authentication({tokenType:tokenTypeEnum.ACCESS}),
    authorization({accessRole:[roleEnum.USER,roleEnum.ADMIN]}),
    validation(freezeAccountSchema),
    userService.freezeAccount)

userRouter.patch(
    "/:userId/restore-account",
    authentication({tokenType:tokenTypeEnum.ACCESS}),
    authorization({accessRole:[roleEnum.USER,roleEnum.ADMIN]}),
    validation(restoreAccountSchema),
    userService.restoreAccount
)

export default userRouter;