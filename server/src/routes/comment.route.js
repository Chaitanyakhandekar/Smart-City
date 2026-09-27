import {Router} from "express"
import { userAuth } from "../middlewares/userAuth.middleware.js";
import
 {
    addComment,
    getAllBlogComments
} 
from "../controllers/comment.controller.js";

const router = Router();


router.route("/").post(userAuth,addComment);
router.route("/:id").get(userAuth,getAllBlogComments);

export default router;