import { Response, NextFunction, Request } from "express"
import ErrorHandler from "../utils/utility-class.js";
import { ControllerType } from "../types/types.js";


export const errorMiddleware = (err : ErrorHandler ,req: Request , res: Response, next: NextFunction) => {

    err.message ||= "Khela Hobe!";
    err.statusCode ||= 400;

    if(err.name === "CastError"){
        err.message = "Invalid ID"
    }
    return res.status(err.statusCode).json({
        success: false,
        message:`Error! ${err.message}`
    })
}

export const TryCatch = (func: ControllerType) => 
    (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req,res,next)).catch(next);
};