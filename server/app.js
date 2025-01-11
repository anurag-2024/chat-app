const express = require('express');
const { connect } = require('./db/connection');

const app = express();
const cors = require('cors');
const dotenv=require("dotenv");
const morgan=require("morgan");
dotenv.config();
// Connect to the database
connect();

// Import models
const auth = require('./routes/auth');
const user = require('./routes/user');
const chat = require('./routes/chat');
// Set up middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const port = process.env.PORT || 8000;

// Routes
app.get('/', (req, res) => {
  res.send("This is Backend");
});
app.use('/api', auth);
app.use('/api', user);
app.use('/api', chat);
// app.post('/api/conversation',async(req,res)=>{
//     try {
//         const {senderId,receiverId}=req.body;
//         const newConversation=new Conversations({members:{senderId,receiverId}});
//         await newConversation.save();
//         res.status(200).json({message:'Conversation Created Successfully'});

//     } catch (error) {
//         console.log(error,'E rror');
//     }
// })

// app.get('/api/conversation/:userId',async(req,res)=>{
//     try {
//         const userId=req.params.userId;
//         const conversations=await Conversations.find({members:{$in:{userId}}});
//         Conversations.map((conversation)=>{
//             console.log(conversation);
//         })
//         console.log("conversations",conversations);
//         const conversationUserData=conversations.map(async(conversation)=>{
//             const receiverId=conversation.members.find((member)=>member!=userId);
//             const user=await Users.findById(receiverId);
//             return {user:{email:user.email,fullName:user.fullName},conversationId:conversation._id}
//         })
//         res.status(200).json(await conversationUserData);
//     } catch (error) {
//         console.log(error);
//     }
// })

// app.post('/api/message',async(req,res)=>{
//     try {
//         const {conversationId,senderId,message,receiverId=''}=req.body;
//         if(!senderId || !message) return res.status(400).send('Please fill all required details');
//         if(!conversationId && receiverId){
//             const newConversation=new Conversations({members:[receiverId,senderId]});
//             await newConversation.save();
//             const newMessage=new Messages({conversationId:newConversation._id,senderId,message});
//             await newMessage.save();
//             return res.status(200).send('Message sent successfully');
//         }else if(!conversationId && !receiverId){
//             return res.status(400).send('Please fill all the required details');
//         }
//         const newMessage=new Messages({conversationId,senderId,message});
//         await newMessage.save();
//         res.status(200).send('Message sent successfully');
//     } catch (error) {
//         console.log(error);
//     }
// })

// app.get('/api/message/:conversationId',async(req,res)=>{
//     try {
//         const conversationId=req.params.conversationId;
//         if(conversationId==='new') return res.status(200).json([]);
//         const messages=await Messages.find({conversationId});
//         const messageUserData=Promise.all(messages.map(async(message)=>{
//             const user=await Users.findById(message.senderId);
//             return{user:{email:user.email,fullName:user.fullName},message:message.message}
//         }));
//         res.status(200).json(await messageUserData)
//     } catch (error) {
//         console.log(error);
//     }
// })

//to create or access chats
// app.post("/", async (req, res) => {
//   const { userId } = req.body;
// })

const onlineUsers = new Set(); // To keep track of online users

const server=app.listen(port, () => {
  console.log('Listening on port ' + port);
});
const io=require("socket.io")(server,{
  pingTimeout:60000,
  cors:{
    origin:"*"
  }
})
io.on("connection",(socket)=>{
  console.log('connected to socket.io');
  socket.on("setup",(userData)=>{
    if (!userData || !userData.id) {
      console.warn("User data is null or invalid. Ignoring setup.");
      return; // Do nothing if userData is null or doesn't have an id
    }

    socket.join(userData.id);    
    onlineUsers.add(userData.id); // Add user to online users
    socket.emit("connected");
    
    // Notify both users in the chat room about the online status
    socket.broadcast.emit("user status", { userId: userData.id, status: "online" });
    
    // Send the list of online users to the newly connected user
    socket.emit("online users", Array.from(onlineUsers));
    
    // Notify others about the new user's online status
    socket.to(userData.id).emit("user status", { userId: userData.id, status: "online" });
  })
  socket.on('join chat',(room)=>{
    socket.join(room);
    console.log('user joined room '+ room);
  })

  socket.on("typing", (data) => {
    console.log("Typing event received", data);
    socket.to(data.chatId).emit("typing", { userId: data.userId });
  });

  socket.on("new message",(newMessageReceived)=>{
    var chat=newMessageReceived.chat;
    console.log("soooooooooooooockkkk");
    if(!chat.users) return console.log('chat.users not defined');

    chat.users.forEach((user)=>{
      if(user._id === newMessageReceived.sender._id) return;
      console.log("------",user);
      socket.in(user._id).emit("message received",newMessageReceived);
    })
  })

  socket.on("disconnect", (user) => {
    console.log("User Disconnected");
    onlineUsers.delete(user.id); // Remove user from online users
    socket.emit("online users", Array.from(onlineUsers));
  })
})
