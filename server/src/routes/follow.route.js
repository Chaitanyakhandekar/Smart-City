import { Router } from "express";
import 
{
    followUser,
    unfollowUser,
    getFollowStatus
}
from "../controllers/follow.controller.js"
import { userAuth } from "../middlewares/userAuth.middleware.js";

const router = Router();

router.route("/follow/:id").post(userAuth,followUser)
router.route("/is-followed/:id").get(userAuth,getFollowStatus)
router.route("/unfollow/:id").post(userAuth,unfollowUser)

export default router;
