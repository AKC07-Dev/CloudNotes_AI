import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MessageSquare, Search, Send, Smile, Paperclip, Trash2, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { wsService } from "@/lib/websocket";
import { getUser, isLoggedIn } from "@/lib/auth";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/messages")({ component: MessagesPage });

interface ChatPreview {
  conversationId: string;
  userId: string;
  fullName: string;
  username: string;
  profileImage: string;
  bio: string;
  lastMessage: string;
  lastSenderId: string;
  lastMessageTime: string;
}

interface FollowUser {
  userId: string;
  fullName: string;
  username: string;
  profileImage: string;
  bio: string;
}

interface Message {
  conversationId: string;
  createdAt: string;
  messageId: string;
  senderId: string;
  receiverId: string;
  message: string;
  status: string;
  deletedFor: string[];
}

function getOtherParticipantId(msg: Message, currentUserId: string): string {
  return msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
}

function messageMatchesActiveChat(
  msg: Message,
  chat: ChatPreview,
  currentUserId: string,
): boolean {
  if (msg.conversationId && chat.conversationId && msg.conversationId === chat.conversationId) {
    return true;
  }

  return getOtherParticipantId(msg, currentUserId) === chat.userId;
}

function findChatIndexForMessage(
  chats: ChatPreview[],
  msg: Message,
  currentUserId: string,
): number {
  const otherUserId = getOtherParticipantId(msg, currentUserId);

  return chats.findIndex(
    (c) =>
      (msg.conversationId && c.conversationId === msg.conversationId) ||
      c.userId === otherUserId,
  );
}

function mergeChatsWithFollowing(
  existingChats: ChatPreview[],
  following: FollowUser[],
): ChatPreview[] {
  const chatByUserId = new Map<string, ChatPreview>();

  for (const chat of existingChats) {
    chatByUserId.set(chat.userId, chat);
  }

  for (const user of following) {
    if (!chatByUserId.has(user.userId)) {
      chatByUserId.set(user.userId, {
        conversationId: "",
        userId: user.userId,
        fullName: user.fullName,
        username: user.username,
        profileImage: user.profileImage,
        bio: user.bio,
        lastMessage: "",
        lastSenderId: "",
        lastMessageTime: "",
      });
    }
  }

  const withConversation: ChatPreview[] = [];
  const withoutConversation: ChatPreview[] = [];

  for (const chat of chatByUserId.values()) {
    if (chat.conversationId) {
      withConversation.push(chat);
    } else {
      withoutConversation.push(chat);
    }
  }

  withConversation.sort(
    (a, b) =>
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime(),
  );

  withoutConversation.sort((a, b) => a.fullName.localeCompare(b.fullName));

  return [...withConversation, ...withoutConversation];
}

function MessagesPage() {
  const navigate = useNavigate();
  const currentUser = getUser();

  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [activeChat, setActiveChat] = useState<ChatPreview | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChatRef = useRef<ChatPreview | null>(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate({ to: "/auth" });
      return;
    }
  
    loadChats();
    wsService.connect();
  
    const handleWsMessage = (payloadRaw: unknown) => {
      const payload = payloadRaw as { type: string; data: Message };

      if (payload.type !== "message" || !payload.data) return;

      const msg = payload.data;
      const currentUserId = getUser()?.userId ?? "";

      console.log("MESSAGE RECEIVED FROM SOCKET", payload);
      console.log("ACTIVE CHAT", activeChatRef.current);

      if (
        activeChatRef.current &&
        messageMatchesActiveChat(msg, activeChatRef.current, currentUserId)
      ) {
        if (!activeChatRef.current.conversationId && msg.conversationId) {
          const updatedChat = {
            ...activeChatRef.current,
            conversationId: msg.conversationId,
          };
          activeChatRef.current = updatedChat;
          setActiveChat(updatedChat);
        }

        setMessages((prev) => {
          console.log("ADDING MESSAGE", msg);

          if (prev.some((m) => m.messageId === msg.messageId)) {
            return prev;
          }

          return [...prev, msg];
        });
      }

      setChats((prev) => {
        const chatIndex = findChatIndexForMessage(prev, msg, currentUserId);
        const newChats = [...prev];

        if (chatIndex !== -1) {
          const chat = newChats[chatIndex];

          if (!chat.conversationId && msg.conversationId) {
            chat.conversationId = msg.conversationId;
          }

          chat.lastMessage = msg.message;
          chat.lastMessageTime = msg.createdAt;
          chat.lastSenderId = msg.senderId;

          newChats.splice(chatIndex, 1);
          newChats.unshift(chat);
        } else {
          loadChats();
        }

        return newChats;
      });
    };
  
  
    wsService.addMessageHandler(handleWsMessage);
  
  
    return () => {
      wsService.removeMessageHandler(handleWsMessage);
  
      // REMOVE THIS
      // wsService.disconnect();
    };
  
  }, []);
          


  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.userId);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChats = async () => {
    try {
      setIsLoadingChats(true);
      const [chatsRes, followingRes] = await Promise.all([
        api.getChats(),
        api.getFollowing(),
      ]);

      const existingChats: ChatPreview[] =
        chatsRes.success && chatsRes.chats ? chatsRes.chats : [];
      const following: FollowUser[] = followingRes.data ?? [];

      setChats(mergeChatsWithFollowing(existingChats, following));
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to load chats");
    } finally {
      setIsLoadingChats(false);
    }
  };

  const loadMessages = async (receiverId: string) => {
    try {
      setIsLoadingMessages(true);
      const res = await api.getMessages(receiverId);
      if (res.success && res.messages) {
        // Sort chronologically (assuming createdAt is ISO string)
        const sorted = res.messages.sort(
          (a: Message, b: Message) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        setMessages(sorted);
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat || !currentUser?.userId) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    // Optimistically create the message object
    const optimisticMessage: Message = {
      conversationId: activeChat.conversationId,
      createdAt: new Date().toISOString(),
      messageId: Math.random().toString(36).substring(7),
      senderId: currentUser.userId,
      receiverId: activeChat.userId,
      message: messageText,
      status: "sent",
      deletedFor: [],
    };

    // Append locally
    setMessages((prev) => [...prev, optimisticMessage]);

    // Update sidebar immediately
    setChats((prev) => {
      const chatIndex = prev.findIndex(
        (c) =>
          (activeChat.conversationId && c.conversationId === activeChat.conversationId) ||
          c.userId === activeChat.userId,
      );
      const newChats = [...prev];
      if (chatIndex !== -1) {
        const chat = newChats[chatIndex];
        chat.lastMessage = messageText;
        chat.lastMessageTime = optimisticMessage.createdAt;
        chat.lastSenderId = currentUser.userId || "";
        newChats.splice(chatIndex, 1);
        newChats.unshift(chat);
      }
      return newChats;
    });

    // Send via WebSocket
    wsService.sendMessage(activeChat.userId, messageText);
  };

  const handleDeleteMessage = async (msg: Message) => {
    try {
      // Optimistically remove from UI
      setMessages((prev) => prev.filter((m) => m.createdAt !== msg.createdAt));

      // Update sidebar if it was the last message
      setChats((prev) => {
        const chatIndex = prev.findIndex((c) => c.conversationId === msg.conversationId);
        if (chatIndex !== -1) {
          const chat = prev[chatIndex];
          if (chat.lastMessage === msg.message) {
            chat.lastMessage = "Message deleted";
          }
        }
        return [...prev];
      });

      await api.deleteMessage(msg.conversationId, msg.createdAt);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to delete message");
      // Ideally we would revert the optimistic deletion here, but we'll leave it for simplicity
      if (activeChat) {
        loadMessages(activeChat.userId);
      }
    }
  };

  return (
    <AppShell>
      <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto animate-fade-up">
        <div className="glass rounded-3xl overflow-hidden flex flex-col md:grid md:grid-cols-[320px_1fr] h-[calc(100vh-120px)] min-h-[560px]">
          {/* List Sidebar - hide on mobile if chat is active */}
          <div
            className={`border-r border-white/5 flex-col ${activeChat ? "hidden md:flex" : "flex"} h-full`}
          >
            <div className="p-4 border-b border-white/5">
              <h2 className="font-semibold text-lg font-display">Messages</h2>
              <div className="mt-3 glass rounded-xl px-3 h-10 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search chats…"
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoadingChats ? (
                <div className="flex justify-center items-center h-full">
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : chats.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-sm p-6 text-center h-full">
                  <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-40" />
                  <p>No conversations yet.</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <button
                    key={chat.userId}
                    onClick={() => setActiveChat(chat)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left mb-1
                      ${activeChat?.userId === chat.userId ? "bg-white/10" : "hover:bg-white/5"}
                    `}
                  >
                    {chat.profileImage ? (
                      <img
                        src={chat.profileImage}
                        alt={chat.fullName}
                        className="h-12 w-12 rounded-full object-cover bg-white/10"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {chat.fullName.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-medium truncate">{chat.fullName}</h3>
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                          {chat.lastMessageTime
                            ? format(new Date(chat.lastMessageTime), "HH:mm")
                            : ""}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {chat.lastMessage
                          ? `${chat.lastSenderId === currentUser?.userId ? "You: " : ""}${chat.lastMessage}`
                          : "Start conversation"}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Conversation Area - hide on mobile if no chat is active */}
          <div className={`flex-col ${!activeChat ? "hidden md:flex" : "flex"} h-full bg-black/20`}>
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-sm p-6 text-center">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Select a conversation</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-black/20 backdrop-blur-md z-10 shrink-0">
                  <button
                    className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg glass"
                    onClick={() => setActiveChat(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  {activeChat.profileImage ? (
                    <img
                      src={activeChat.profileImage}
                      alt={activeChat.fullName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {activeChat.fullName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{activeChat.fullName}</h3>
                    {activeChat.username && (
                      <p className="text-xs text-muted-foreground">@{activeChat.username}</p>
                    )}
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
                  {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <span className="text-sm text-muted-foreground">Loading messages...</span>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, index) => {
                        const isMe = msg.senderId === currentUser?.userId;
                        const showAvatar =
                          !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);

                        return (
                          <div
                            key={msg.createdAt}
                            className={`flex gap-3 max-w-[85%] ${isMe ? "self-end" : "self-start"} group`}
                          >
                            {!isMe && (
                              <div className="w-8 shrink-0 flex items-end">
                                {showAvatar &&
                                  (activeChat.profileImage ? (
                                    <img
                                      src={activeChat.profileImage}
                                      alt=""
                                      className="h-8 w-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
                                      {activeChat.fullName.charAt(0)}
                                    </div>
                                  ))}
                              </div>
                            )}

                            <div className="flex flex-col gap-1">
                              <div
                                className={`relative px-4 py-2.5 rounded-2xl text-sm
                                ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "glass rounded-bl-sm"}
                              `}
                              >
                                <p className="break-words whitespace-pre-wrap">{msg.message}</p>
                              </div>

                              <div
                                className={`flex items-center gap-2 text-[10px] text-muted-foreground ${isMe ? "justify-end" : "justify-start"}`}
                              >
                                <span>{format(new Date(msg.createdAt), "HH:mm")}</span>
                                {isMe && (
                                  <button
                                    onClick={() => handleDeleteMessage(msg)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                                    title="Delete for me"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-3 border-t border-white/5 bg-black/20 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="glass rounded-xl flex items-center gap-2 px-3 h-12"
                  >
                    <button
                      type="button"
                      className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10 text-muted-foreground transition-colors"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message…"
                      className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50"
                    />
                    <button
                      type="button"
                      className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10 text-muted-foreground transition-colors"
                    >
                      <Smile className="h-4 w-4" />
                    </button>
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="h-8 w-8 grid place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
