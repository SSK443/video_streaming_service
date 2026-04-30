import type { Request, Response, NextFunction } from "express";

type AsyncHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void>


export function Async_Handler(fn: AsyncHandler):any {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise
            .resolve(fn(req, res, next))
            .catch((error: unknown) => next(error))

    }


}

export const async_handler = (fn: AsyncHandler) => async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        await fn(req, res, next);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({
                success: false,
                message: error.message

            })
        } else {
            res.status(500).json({
                success: false,
                message: "unknown error"

            })
        }

    }

}