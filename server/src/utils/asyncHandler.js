export const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((error)=>{
            return res.json({
                success:false,
                message:error.message,
            })
        })
    }
}

