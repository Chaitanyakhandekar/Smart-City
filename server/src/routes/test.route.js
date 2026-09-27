import { Router } from "express";
import { testRoute } from "../controllers/test.js";

const router = Router();

router.route("/test-1").get(testRoute)
router.route("/ping").get((req, res) => res.send("pong"))

export default router;