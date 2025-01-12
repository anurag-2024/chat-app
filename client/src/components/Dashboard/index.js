import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChatState } from "../../context/ChatProvider";
import { getSender, getSenderFull, getSenderImg } from "../../config/ChatLogics";
import io from "socket.io-client";
import { BASE_URL ,URL} from "../../utils/url";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button"
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Loader2, LogOut, Phone, Search, Send, Menu } from 'lucide-react';
import { toast } from "react-hot-toast";
const Dashboard = () => {
  const navigate = useNavigate();
  const {
    selectedChat,
    setSelectedChat,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const [socketConnected, setSocketConnected] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [sendNewMessage, setSendNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')));
  const messagesEndRef = useRef(null);
  const [userStatus, setUserStatus] = useState({});
  const [onlineUsers,setOnlineUsers]=useState();
  console.log(onlineUsers);
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    if (!user) {
      navigate("/users/sign_in");
    }
  }, [user]);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    fetchMessages();
    const newsocket = io(URL);
    setSocket(newsocket);
    newsocket.emit("setup", user);
    newsocket.on('connected', () => {
      setSocketConnected(true);
      console.log("Socket connected");
    });

    return () => {
      newsocket.disconnect();
    };
  }, [selectedChat]);
  useEffect(() => {
    if (socket) {
      socket.on("typing", (data) => {
        console.log("Typing event received", data);
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
        }, 4000);
      });
    }
  }, [socket]);
  useEffect(() => {
    if (socket) {
      socket.on("message received", (newMessageReceived) => {
        if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
          // Handle notification
          if (!notification.includes(newMessageReceived)) {
            setNotification([newMessageReceived, ...notification]);
            // Update chats if the message is from a new chat
            setChats((prevChats) => {
              const chatIndex = prevChats.findIndex(chat => chat._id === newMessageReceived.chat._id);
              if (chatIndex !== -1) {
                const updatedChats = [...prevChats];
                updatedChats[chatIndex].latestMessage = newMessageReceived;
                return updatedChats;
              }
              return prevChats;
            });
          }
        } else {
          setMessages(prevMessages => [...prevMessages, newMessageReceived]);
        }
        scrollToBottom();
      });
    }
  }, [socket, selectedChat, notification]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const userLogout = () => {
    if (socket) {
      socket.disconnect(user);
    }
    localStorage.removeItem('user:token');
    localStorage.removeItem('user:detail');
    navigate("/users/sign_in");
  };

  const fetchChats = async () => {
    try {
      const { data } = await axios.post(`${BASE_URL}/fetchchat`, { userId: user.id });
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setChatLoading(true);
      const { data } = await axios.get(`${BASE_URL}/message/${selectedChat._id}`);
      setMessages(data);
      setChatLoading(false);
      socket.emit('join chat', selectedChat?._id);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setChatLoading(false);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!sendNewMessage.trim()) return;

    try {
      const sendData = {
        senderId: user.id,
        chatId: selectedChat._id,
        content: sendNewMessage
      };
      setSendNewMessage("");
      const { data } = await axios.post(`${BASE_URL}/message`, sendData);
      socket.emit("new message", data);
      setMessages([...messages, data]);
      // Update the latest message in chats
      setChats(prevChats =>
        prevChats.map(chat =>
          chat._id === selectedChat._id ? { ...chat, latestMessage: data } : chat
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = () => {
    if (socket && selectedChat) {
      socket.emit("typing", { chatId: selectedChat._id, userId: user.id });
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (socket && selectedChat) {
      socket.emit('join chat', selectedChat._id);
    }
  }, [socket, selectedChat]);

  useEffect(() => {
    if (socket) {
      socket.on("user status", (data) => {
        setUserStatus((prevStatus) => ({
          ...prevStatus,
          [data.userId]: data.status,
        }));
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("online users", (users) => {
        console.log(users);
        setOnlineUsers(users);
      });
      // Clean up the event listener on component unmount
      return () => {
        socket.off("online users");
      };
    }
  }, [socket]);

  const searchUser = async () => {
    if (!searchText) {
      toast.error("Enter a name to search");
      return;
    }
    setSearchLoading(true);
    const userId = {
      "userId": user.id,
    };
    try {
      const { data } = await axios.post(`${BASE_URL}/user?search=${searchText}`, userId);
      setSearchResult(data);
      setShowModal(true);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("An error occurred while searching");
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearchResults = () => {
    setSearchResult([]);
    setSearchText("");
    setShowModal(false);
  };

  const accessChat = async (userId) => {
    try {
      setSearchLoading(true);
      const datatransfer = {
        "userId": userId,
        "senderId": user.id
      };
      const { data } = await axios.post(`${BASE_URL}/chat`, datatransfer);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setSearchLoading(false);
    } catch (error) {
      console.error("Error accessing chat:", error);
      toast.error("Failed to access chat");
      setSearchLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex w-full lg:w-[70%] h-[100%]">
      {/* Hamburger Icon for Mobile */}
      <div className="lg:hidden p-3">
        <Button onClick={toggleSidebar} className="p-1">
          <Menu className="w-10 h-10" />
        </Button>
      </div>

      {/* Sidebar */}
      {((isMobileView&&sidebarOpen)||!isMobileView)&&
        <div className="w-2/8 border-r border-border bg-gray-100">
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user?.imageUrl} alt={user?.fullName} />
                <AvatarFallback>{user?.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{user?.fullName}</h3>
                <p className="text-sm text-muted-foreground">My Account</p>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full" onClick={userLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
          <div className="p-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search users..."
                className="pl-8"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button onClick={searchUser} className="pl-8">
                <Search />
                Search
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-300px)] mt-4">
              <div className="space-y-2">
                {chats?.map((chat) => (
                  <div
                    key={chat._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedChat === chat
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    onClick={() => {
                      setSelectedChat(chat);
                      setSidebarOpen(false);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={!chat.isGroupChat ? getSenderImg(user.id, chat.users) : chat.chatName}
                          alt={!chat.isGroupChat ? getSender(user.id, chat.users) : chat.chatName}
                        />
                        <AvatarFallback>{(!chat.isGroupChat ? getSender(user.id, chat.users) : chat.chatName).charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">
                          {!chat.isGroupChat ? getSender(user.id, chat.users) : chat.chatName}
                          {onlineUsers?.includes(chat.users[0]._id) && (
                            <span className="text-green-500 ml-1 text-lg">●</span>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.latestMessage?.content || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      }
    

      {/* Modal for Search Results */}
      {showModal && (
        <div className="absolute left-[calc(15%+calc(100%/8))] max-md:left-[calc(5%+calc(100%/8))] max-md:mt-[calc(40%)] top-16 z-50 w-80 bg-white rounded-lg shadow-lg p-4">
          <button onClick={clearSearchResults} className="absolute top-2 right-2">X</button>
          <h3 className="font-semibold mb-4">Search Results</h3>
          {searchLoading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <div className="space-y-4">
              {searchResult?.map((result) => (
                <div
                  key={result._id}
                  className="flex items-center space-x-4 p-2 rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => accessChat(result._id)}
                >
                  <Avatar>
                    <AvatarImage src={result.pic} alt={result.fullName} />
                    <AvatarFallback>{result.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{result.fullName}</h3>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Email:</span> {result.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button onClick={clearSearchResults} className="mt-4">Clear</Button>
        </div>
      )}

      {/* Main Chat Area */}
      {((isMobileView&&!sidebarOpen)||!isMobileView)&&
      <div className={`flex-1 flex flex-col bg-white`}>
        {selectedChat ? (
          <>
            <div className="bg-gray-200 border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage
                    src={getSenderFull(user.id, selectedChat.users)?.pic}
                    alt={getSenderFull(user.id, selectedChat.users)?.fullName}
                  />
                  <AvatarFallback>{getSenderFull(user.id, selectedChat.users)?.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {getSenderFull(user.id, selectedChat.users)?.fullName}
                  </h3>
                  {typing ? (
                    <p className="text-muted-foreground">Typing...</p>
                  ) : onlineUsers?.includes(selectedChat.users[0]._id) ? (
                    <span className="text-green-500 ml-1">Online</span>
                  ) : (
                    <span className="text-yellow-500 ml-1">Offline</span>
                  )}

                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Phone className="w-5 h-5" />
              </Button>
            </div>
            {chatLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="overflow-y-auto h-[calc(100vh-200px)]">
                <ScrollArea className="flex-1 p-4 scroll-behaviour-smooth">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`max-w-[70%] p-3 rounded-lg ${message.sender._id === user.id
                          ? "ml-auto bg-[#0056b3] text-white"
                          : "bg-[#e0e0e0]"
                          }`}
                      >
                        {message.content}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>
            )}
            <form onSubmit={sendMessage} className="p-4 bg-background border-t border-border">
              <div className="flex space-x-2 border border-border rounded-md">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 border-none bg-slate-100"
                  value={sendNewMessage}
                  onChange={(e) => {
                    setSendNewMessage(e.target.value);
                    handleTyping(); // Emit typing event
                  }}
                />
                <Button type="submit" className="hover:bg-gray-200">
                  <Send className="w-4 h-4 mr-2 " />
                  Send
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a chat to start messaging
          </div>
        )}
      </div>
      }

      {/* Search Users Section */}
        {/* <div className="w-4/13 border-l border-border p-4 hidden lg:block bg-gray-50">
          <h3 className="font-semibold mb-4">Search Users</h3>
          <SearchSection />
        </div> */}
    </div>
  );
};

export default Dashboard;
