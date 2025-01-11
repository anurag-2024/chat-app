const User=require("../models/userModel");
const Chat=require("../models/chatModel");
const Message=require("../models/messageModel");

const chat=async (req, res) => {
    const { userId, senderId } = req.body;
    console.log("vgwfjkdl;sfd",userId," ",senderId);
  
    if (!userId) {
      console.log("UserId param not sent with request");
      return res.sendStatus(400);
    }
  
    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: senderId } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
  
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
  
    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [senderId, userId],
      };
  
      try {
        const createdChat = await Chat.create(chatData);
        const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
          "users",
          "-password"
        );
        res.status(200).json(FullChat);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
    }
  }

const fetchchat =async (req, res) => {
    try {
      const { userId } = req.body;
      // console.log("5467fgjh",userId);
      Chat.find({ users: { $elemMatch: { $eq: userId } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .then(async (results) => {
          results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name pic email",
          });
          res.status(200).send(results);
        })
    } catch (error) {
      console.log(error);
      res.status(400);
      throw new Error(error.message);
    }
  }

  const groupChat=async (req, res) => {
    if (!req.body.users || !req.body.name) {
      return res.status(400).send({ message: "Please Fill all the feilds" });
    }
  
    var users = JSON.parse(req.body.users);
    var user = JSON.parse(req.body.user);
    if (users.length < 2) {
      return res
        .status(400)
        .send("More than 2 users are required to form a group chat");
    }
  
    users.push(user);
  
    try {
      const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.user,
      });
  
      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
  
      res.status(200).json(fullGroupChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  
  }

  const renamegroup=async (req, res) => {
    const { chatId, chatName } = req.body;
  
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
  
    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(updatedChat);
    }
  }

  const removeGroup=async (req, res) => {
    const { chatId, userId } = req.body;
    //userId is the id which we want to add
  
    // check if the requester is admin
  
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
  
    if (!removed) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(removed);
    }
  }

const addtogroup=async (req, res) => {
    const { chatId, userId } = req.body;
  
    // check if the requester is admin
  
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
  
    if (!added) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(added);
    }
  }

  const createmessage=async(req,res)=>{
    const {senderId,content,chatId}=req.body;
  
    if(!content || !chatId){
      console.log("Invalid data passed into request");
      return res.status(400);
    }
  
    var newMessage={
      sender:senderId,
      content:content,
      chat:chatId
    }
  
    try {
      var message=await Message.create(newMessage);
      message =await message.populate("sender","name pic");
      message =await message.populate("chat");
      message=await User.populate(message,{
        path:'chat.users',
        select:"name pic email"
      });
  
      await Chat.findByIdAndUpdate(req.body.chatId,{
        latestMessage:message,
      });
  
      res.json(message);
  
    } catch (error) {
      console.log(error);
    }
  }

  const getmessage=async(req,res)=>{
    try {
      const messages=await Message.find({chat:req.params.chatId}).populate("sender","name pic email").populate("chat");
      res.json(messages);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
  module.exports ={chat,fetchchat,groupChat,renamegroup,removeGroup,addtogroup,createmessage,getmessage};