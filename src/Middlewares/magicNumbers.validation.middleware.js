import fs from "node:fs"
import { fileTypeFromBuffer } from "file-type"
import multer from "multer";

export const magicNumberValidationSingle =( allowedTypes=[])=>{
        return async (req,res,next)=>{
            try {
                if(!req.file)
                    return next(new Error(" No File Uploaded",{cause:400}))

                const filePath = req.file.path

                const  buffer =  fs.readFileSync(filePath)

                const type = await fileTypeFromBuffer(buffer)

                if (!type || !allowedTypes.includes(type.mime)){
                    fs.unlinkSync(filePath);
                    return next(new Error("Invalid file type / magic number not match",{cause:404}));
                }
                    
                return next()

            } catch (error) {
                return next(error);
            }
        }
};
export const magicNumberValidationMulti = (allowedTypes = []) => {
    return async (req, res, next) => {
        try {
            if (!req.files || req.files.length === 0)
                return next(new Error("No Files Uploaded", { cause: 400 }));

            for (const file of req.files) {
                const filePath = file.path;

                const buffer = fs.readFileSync(filePath);
                const type = await fileTypeFromBuffer(buffer);
                if (!type || !allowedTypes.includes(type.mime)) {
                    req.files.forEach(file => fs.unlinkSync(file.path));
                    return next(new Error("Invalid file type / magic number mismatch", { cause: 404 }))
        }}
            return next();
    } catch (error) {
        return next(error);
    }
}
};
export const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {

        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                message: `You can upload a maximum of 2 files`,
                maxAllowed:2
            });
        }

        return res.status(400).json({
            message: "Multer error",
            error: err.message
        });
    }

    next(err);
};


