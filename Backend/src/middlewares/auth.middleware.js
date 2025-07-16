import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export async function routeProtector(req, res, next) {
   const token = req.cookies.jwt;
   if (!token) {
      return res.status(401).json({ error: "Unauthorized access - token not provided" });
   }
   try{
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if(!decoded){
            return res.status(401).json({ error: "Unauthorized access - invalid token" });
      }
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
         return res.status(401).json({ error: "Unauthorized access - user not found" });
      }
      req.user = user; // Attach user to request object
      next(); // Proceed to the next middleware or route handler
   }
   catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ error: "Internal server error" });
   }
}