import mongoose from "mongoose";

export const connectDB = async()=>{
   try {
      const con = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`Mongodb Connected :${con.connection.host}`);
   } catch (error) {
      console.log("Error connecting to mongodb:",error);
      process.exit(1);
   }
};