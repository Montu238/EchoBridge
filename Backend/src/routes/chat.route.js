import {Router} from "express";
import {routeProtector} from "../middlewares/auth.middleware.js";
import {getStreamToken} from "../controllers/chat.controller.js";
const router = Router();

router.get("/token",routeProtector,getStreamToken);
export default router;