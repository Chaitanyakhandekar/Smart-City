import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import
 { 
    createDraft,
    getAllUserDrafts,
    getDraftById,
    deleteDraft
 } from "../controllers/draft.controller.js";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { draftImage } from "../middlewares/draftImage.middleware.js";
import { draftOwner } from "../middlewares/draftOwner.middleware.js";


const router = Router()


router.route("/").post(userAuth,upload.array("images",5), createDraft)
router.route("/user-drafts").get(userAuth,getAllUserDrafts)
router.route("/:id").get(userAuth,draftOwner,getDraftById)
router.route("/:id").delete(userAuth,draftOwner,deleteDraft)

export default router;
