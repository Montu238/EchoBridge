import { StreamChat } from "stream-chat";
import "dotenv/config";


const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;
if (!apiKey || !apiSecret) {
  throw new Error("Stream API key and secret is missing.");
}
const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData)=>{
     try {
       await streamClient.upsertUsers([userData]);
       return userData;
     } catch (error) {
            console.error("Error upserting Stream user:", error);
            throw new Error("Failed to upsert Stream user");
     }
}


//TODO
export const generateStreamToken = (userId) => {
    try{
        userId = userId.toString();//userId must be string to generate token
        return streamClient.createToken(userId);
    }
    catch (e) {
        throw new Error(e.message);
    }
};

export default streamClient;
