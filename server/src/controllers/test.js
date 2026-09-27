
export const testRoute = async (req,res)=>{
    try {
        return res
                .status(200)
                .json({
                    message:"Success",
                    success:true
                })
    } catch (error) {
        return error.message
    }
}