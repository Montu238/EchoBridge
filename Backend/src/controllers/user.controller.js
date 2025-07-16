import User from "../models/User.model.js";
import FriendRequest from "../models/FriendRequest.model.js";

export async  function getRecommendedUsers(req,res){
  try{
      const currentUserId = req.user._id;
      const currentUser=req.user;

      const recommendedUsers = await User.find({
          $and:[
              {_id:{$ne:currentUserId}},//exclude current user
              {_id:{$nin:currentUser.friends}},//exclude friends
              {isOnboarded:true}
          ]
      });

      res.status(200).json({recommendedUsers});
  }
  catch (e) {
    console.log("Error in getRecommendedUsers controller :",e.message);
    res.status(500).json({message:"internal server error"});
  }
}

export async function getMyFriends(req,res){
     try{
         const user = await User.findById(req.user._id)
             .select("friends")
             .populate("friends","fullName profilePic nativeLanguage learningLanguage");

         res.status(200).json({friends:user.friends});
     }catch (e) {
          console.log("error in getMyFriends controller :",e.message);
          res.status(500).json({message:"Internal Server Error"});
     }
}

export async function sendFriendRequest(req,res){
   try{
       const myId = req.user._id;
       const {id:recipientId}=req.params;

       //check if not sending to self
       if(myId.toString()===recipientId.toString()){
           return res.status(400).json({error:"Cannot send friend request to yourself"});
       }

       //check if recipientId is valid
       const recipient = await User.findById(recipientId);
       if(!recipient){
           return res.status(404).json({error:"recipient not found!"});
       }

     //check if already friend
       const existingFriends = await FriendRequest.find({
           $or:[
               {sender:myId,recipient:recipientId},
               {sender:recipientId,recipient:myId}
           ]
       });

       if(existingFriends.length > 0){
           return res.status(400).json({message:"friend request already exist between you and this user!"});
       }

       const friendRequest =  await FriendRequest.create({
           sender:myId,
           recipient:recipientId
       });

       res.status(201).json(friendRequest);
   }catch (e) {
       console.log("Error in sendFriendRequest controller :",e.message);
       res.status(500).json({message:"Internal Server Error"});
   }
}

export async function acceptFriendRequest(req,res){
    try{
        const myId = req.user._id;
        const {id:requestId}=req.params;

        //check if the request exists
        const friendRequest = await FriendRequest.findById(requestId);
        if(!friendRequest){
            return res.status(404).json({error:"Friend request not found!"});
        }

        if(friendRequest.recipient.toString()!==myId.toString()){
            return res.status(403).json({error:"you are not authorized to accept this request"});
        }

        friendRequest.status="accepted";
        await friendRequest.save();

        //update friendlist of both sender and receiver

        await User.findByIdAndUpdate(friendRequest.sender,{
            $addToSet:{friends:friendRequest.recipient}
        });

        await User.findByIdAndUpdate(friendRequest.recipient,{
            $addToSet:{friends:friendRequest.sender}
        })
      res.status(200).json({message:"Friend request accepted!"});
    }catch (e) {
        console.log("Error in acceptFriendRequest controller :",e.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export async function getFriendRequests(req,res){
    try{
        const myId = req.user._id;
        const friendRequests = await FriendRequest.find({recipient:myId,status:"pending"},).populate("sender","fullName profilePic nativeLanguage learningLanguage");

        const acceptedRequests = await FriendRequest.find({sender:myId,status:"accepted"}).populate("recipient","fullName profilePic");

        res.status(200).json({friendRequests,acceptedRequests});

    }catch (e) {
        console.log("Error in getFriendRequests controller :",e.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export async function deleteFriendRequest(req,res){
    try{
        const myId = req.user._id;
        const {id:requestId}=req.params;
        const request = await FriendRequest.findById(requestId);

        if(!request){ return res.status(404).json({error:"Friend request not found!"});}
        if(myId.toString()!=request.sender.toString()){
            return res.status(403).json({error:"you are not authorized to delete this request"});
        }

        const deletedReq = await FriendRequest.findByIdAndDelete(requestId);
        if(!deletedReq){
            return res.status(404).json({error:"Friend request not found!"});
        }
        res.status(204).json({message:"Friend request deleted!"});
    }catch (e) {
        console.log("Error in deleteFriendRequest controller :",e.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export async function getOutgoingFriendRequests(req,res){
 try{
     const friendRequests = await FriendRequest.find({sender:req.user._id,status:"pending"}).populate("recipient","fullName profilePic nativeLanguage learningLanguage");
     res.status(200).json({friendRequests});
 }catch (e) {
     console.log("Error in getOutgoingFriendRequests controller :",e.message);
     res.status(500).json({message:"Internal Server Error"});
 }
}