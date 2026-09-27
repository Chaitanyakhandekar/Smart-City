import e from 'express';
import Router from 'express';
import {
     verifyUser,
     registerUser,
     isVerifiedUser,
     loginUser,
     isLoggedInUser,
     logoutUser,
     uploadAvatar,
     getUserAvatar,
     getUserProfile,
     updateUserProfile,
     deleteUserAvatar,
     updateUserAvatar,
     getPublicUserProfile,
     sendOTP,
     resetPassword,
     resendEmailVerification

 } from '../controllers/user.controller.js';
 import { sendVerificationToken } from '../services/sendVerificationToken.js';
 import { userAuth } from '../middlewares/userAuth.middleware.js';
 import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route("/register").post(registerUser, sendVerificationToken)
router.route("/login").post(loginUser)
router.route("/logout").get(userAuth,logoutUser)
router.route("/avatar").post(userAuth,upload.single("avatar"),uploadAvatar)
router.route("/avatar").patch(userAuth,upload.single("newAvatar"),updateUserAvatar)
router.route("/password/reset/otp").post(sendOTP)
router.route("/password/reset").post(resetPassword)
router.route("/avatar").get(userAuth,getUserAvatar)
router.route("/avatar").delete(userAuth,deleteUserAvatar)
router.route("/profile").get(userAuth,getUserProfile)
router.route("/profile/:id").get(userAuth,getPublicUserProfile)
router.route("/profile").patch(userAuth,updateUserProfile)
router.route("/email/verify/:token").get(verifyUser)
router.route("/email/is-verify/:email").get(isVerifiedUser)
router.route("/is-logged-in").get(userAuth,isLoggedInUser)
router.route("/email/resend-verification").post(resendEmailVerification)

export default router;