import { Router } from 'express';
import {routeProtector} from "../middlewares/auth.middleware.js";
import {
    getMyFriends,
    getRecommendedUsers,
    getOutgoingFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    deleteFriendRequest, getFriendRequests
} from "../controllers/user.controller.js";

const router = Router();

router.use(routeProtector);

router.get("/",getRecommendedUsers);
router.get("/friends",getMyFriends);
router.post("/friend-request/:id",sendFriendRequest);
router.put("/friend-request/:id/accept",acceptFriendRequest);
router.get("/friend-request",getFriendRequests);
router.get("/outgoing-friend-request",getOutgoingFriendRequests);
router.delete("/friend-request/:id",deleteFriendRequest);

export default router;