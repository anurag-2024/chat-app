const express = require('express');
const { connect } = require('./db/connection');

const app = express();
const cors = require('cors');
const dotenv=require("dotenv");
const morgan=require("morgan");
dotenv.config();
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

app.get('/', (req, res) => {
  res.send("This is Backend");
});
app.use('/api', auth);
app.use('/api', user);
app.use('/api', chat);

const onlineUsers = new Set(); 

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
      return; 
    }

    socket.join(userData.id);    
    onlineUsers.add(userData.id); 
    socket.emit("connected");
    

    socket.broadcast.emit("user status", { userId: userData.id, status: "online" });
  
    socket.emit("online users", Array.from(onlineUsers));
    
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
    onlineUsers.delete(user.id); 
    socket.emit("online users", Array.from(onlineUsers));
  })
})
