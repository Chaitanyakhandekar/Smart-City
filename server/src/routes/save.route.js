import Router from 'express';
import { Save } from '../models/saves.model.js';
import 
{
    toggleBlogSave,
    isSavedToBlog,
    getAllSavedBlogsOfUser
} from '../controllers/save.controller.js';
import { userAuth } from '../middlewares/userAuth.middleware.js';

const router = Router();

router.route("/all-saved").get(userAuth, getAllSavedBlogsOfUser);
router.route("/toggle/:id").get(userAuth, toggleBlogSave);
router.route("/is-saved/:id").get(userAuth, isSavedToBlog);

export default router;
