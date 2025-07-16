import express from "express";
import { signup,login,logout, onboard } from "../controllers/auth.controller.js";
import { routeProtector } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/login",login);

router.post("/signup",signup);

router.post("/logout",logout);

router.put("/onboarding",routeProtector,onboard);

router.get("/me",routeProtector, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
});

export default router;