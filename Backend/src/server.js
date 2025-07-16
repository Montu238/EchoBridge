import express from "express";
import { connectDB } from "./lib/db.js";
import { COOKIE_OPTIONS, CORS_OPTIONS } from "./constants.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import path from "path";

const PORT = process.env.PORT;
const app = express();

app.use(cors(CORS_OPTIONS));
app.use(morgan("dev")); // Logging middleware for development
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const __dirname = path.resolve();


app.use("/api/auth", authRoutes);
app.use("/api/user",userRoutes);
app.use("/api/chat",chatRoutes);

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

connectDB().then(r =>
    app.listen(PORT, () => {
      console.log(`Server is running at: http://localhost:${PORT}`);
    })

).catch((error)=>{
  console.log("Error connecting database:",error);
  process.exit(1);
});

