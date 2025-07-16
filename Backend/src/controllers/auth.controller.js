import { COOKIE_OPTIONS } from "../constants.js";
import { upsertStreamUser } from "../lib/stream.js";
import  User  from "../models/User.model.js";
import jwt from "jsonwebtoken";


export async function signup(req,res){
   const {fullName, email, password} = req.body;
   try {
      if([fullName, email, password].includes(undefined)){
         return res.status(400).json({error: "All fields are required"});
      }
      if(password.length < 6) {
         return res.status(400).json({error: "Password must be at least 6 characters long"});
      }
      const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailregex.test(email)) {
         return res.status(400).json({error: "Invalid email format"});
      }
      const existingUser = await User.findOne({ email });
      if(existingUser) {
         return res.status(400).json({error: "Email already exists"});
      }
     //profile picture placeholder
      const idx = Math.floor(Math.random()*100)+1;// Random index for profile picture between 1 and 100
      const profilePic =`https://avatar.iran.liara.run/public/${idx}.png`; // Placeholder profile picture URL


      // Create a new user
      const newUser = await User.create({
         fullName,
         email,
         password,
         profilePic
      });
   
      if(!newUser) {
         return res.status(500).json({error: "Failed to create user"});
      }

      // create user in stream 
        try{
        await upsertStreamUser({
         id: newUser._id.toString(),
         name: newUser.fullName,
         image: newUser.profilePic || "",
        });
        }
        catch(error){
         console.error("Error upserting Stream user:", error);
        }


      const token = jwt.sign(
         { userId: newUser._id },
         process.env.JWT_SECRET,
         { expiresIn: "7d" }
      );

      // Exclude sensitive data (like password) from the user object
      const userWithoutPassword = excludeSensitiveData(newUser);
      
      res.cookie("jwt",token,COOKIE_OPTIONS);
      res.status(201).json({
         success: true,
         user:userWithoutPassword,
      });

   } catch (error) {
      console.log("Error in signup controller :");
      res.status(500).json({
         success: false,
         message: "Internal server error",
         error: error.message,
      });
   }
};

export async function login(req,res){
   const {email, password} = req.body;
   try {
      if(!email || !password) {
         return res.status(400).json({error: "Email and password are required"});
      }
      const user = await User.findOne({ email });
      if(!user) {
         return res.status(400).json({error: "Invalid email"});
      }

      const isPasswordValid = await user.comparePassword(password);
      if(!isPasswordValid) {
         return res.status(401).json({error: "Invalid password"});
      }

      const token = jwt.sign(
         { userId: user._id },
         process.env.JWT_SECRET,
         { expiresIn: "7d" }
      );

      const userWithoutPassword = excludeSensitiveData(user);
      res.cookie("jwt", token, COOKIE_OPTIONS);
      res.status(200).json({
         success: true,
         user: userWithoutPassword,
      });

   } catch (error) {
      console.log("Error in login controller :",error);
      res.status(500).json({
         success: false,
         message: "Internal server error",
      });
   }
};

 
export function logout(req,res){
    try {
      res.clearCookie("jwt");
      res.status(200).json({
         success: true,
         message: "Logged out successfully",
      });
   } catch (error) {
      console.log("Error in logout controller :",error);
      res.status(500).json({
         success: false,
         message: "Internal server error",
      });
   }
};

function excludeSensitiveData(user) {
   const { password, ...userWithoutPassword } = user.toObject();
   return userWithoutPassword;
}
 
export async function onboard(req,res){
   const {bio,fullName,location,nativeLanguage,learningLanguage} = req.body;
   const user = req.user;
   try{
      if([bio, fullName, location, nativeLanguage, learningLanguage].includes(undefined)){
         return res.status(400)
                  .json(
                     {
                     error: "All fields are required",
                     missingFields:[
                        !bio && "bio",
                        !fullName && "fullName",
                        !location && "location",
                        !nativeLanguage && "nativeLanguage",
                        !learningLanguage && "learningLanguage" 
                     ].filter(Boolean)// Filter out undefined values
                     });
      }
      user.bio= bio;
      user.fullName = fullName;
      user.location = location;
      user.nativeLanguage = nativeLanguage;
      user.learningLanguage = learningLanguage;
      user.isOnboarded = true;
      await user.save();
      // Update user in Stream
      try {
         await upsertStreamUser({
            id: user._id.toString(),
            name: user.fullName,
            image: user.profilePic || "",
         });
      } catch (error) {
         console.error("Error upserting Stream user:", error);
      }
      res.status(200).json({
         success: true,
         user
      });

   }
   catch (error) {
      console.log("Error in onboarding controller :", error);
      return res.status(500).json({
         success: false,
         message: "Internal server error",
      });
   }

};