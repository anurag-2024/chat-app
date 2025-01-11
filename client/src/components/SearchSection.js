import React, { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { ChatState } from "../context/ChatProvider";
import { BASE_URL } from "../utils/url";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2, Search } from 'lucide-react';

export const SearchSection = () => {
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')));
  const { setSelectedChat, chats, setChats } = ChatState();

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
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("An error occurred while searching");
    } finally {
      setSearchLoading(false);
    }
  }

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
  }

  return (
    <div className="flex w-full flex-col space-y-4">
      <div className="flex w-full space-x-2">
        <Input
          type="text"
          className="flex-1 space-x-11 h-12"
          placeholder="Search users"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
        <Button onClick={searchUser}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      <ScrollArea className="w-full">
        {searchLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
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
      </ScrollArea>
    </div>
  );
};

