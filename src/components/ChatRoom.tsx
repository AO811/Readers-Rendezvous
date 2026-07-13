import React, { useState, useEffect, useRef } from "react";
import { Connection, Message, User } from "../types.js";
import { api } from "../lib/api.js";
import { ArrowLeft, BookOpen, Send, Sparkles, Trophy } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatRoomProps {
  connection: Connection;
  currentUser: User;
  onBack: () => void;
}

export default function ChatRoom({ connection, currentUser, onBack }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isCompanionTyping, setIsCompanionTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Identify companion user details
  const companionId = connection.user1Id === currentUser.id ? connection.user2Id : connection.user1Id;
  const companionName = connection.user1Id === currentUser.id ? connection.user2Username : connection.user1Username;
  const companionAvatar = connection.user1Id === currentUser.id ? connection.user2Avatar : connection.user1Avatar;
  const companionStoryTitle = connection.user1Id === currentUser.id ? connection.user2StoryTitle : connection.user1StoryTitle;
  const myStoryTitle = connection.user1Id === currentUser.id ? connection.user1StoryTitle : connection.user2StoryTitle;

  const isCompanionAi = companionId.startsWith("author_");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.getMessages(connection.id);
      const messageList = data.messages || [];
      
      // Determine if companion is typing
      if (isCompanionAi && messageList.length > 0) {
        const lastMsg = messageList[messageList.length - 1];
        if (lastMsg.senderId === currentUser.id) {
          setIsCompanionTyping(true);
        } else {
          setIsCompanionTyping(false);
        }
      }

      setMessages(messageList);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Poll for messages
  useEffect(() => {
    fetchMessages();
    
    // Set up rapid polling
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages(true);
    }, 2500);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [connection.id]);

  // Scroll on message updates
  useEffect(() => {
    scrollToBottom();
  }, [messages, isCompanionTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      // Optimistically append message
      const tempId = "temp_" + Date.now();
      const optimisticMsg: Message = {
        id: tempId,
        connectionId: connection.id,
        senderId: currentUser.id,
        senderName: currentUser.username,
        senderAvatar: currentUser.avatar,
        text,
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, optimisticMsg]);
      if (isCompanionAi) {
        setIsCompanionTyping(true);
      }

      await api.sendMessage(connection.id, text);
      await fetchMessages(true);
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] max-w-6xl mx-auto px-8 py-6 flex flex-col" id="chat-room">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-[#E6E2D3] pb-4 mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-[#F5F2ED] text-[#7C8363] transition-colors focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <img
              src={companionAvatar}
              alt={companionName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border border-[#E6E2D3]"
            />
            <div>
              <h3 className="font-serif text-lg font-bold text-[#33322E]">{companionName}</h3>
              <p className="text-xs text-[#7C8363]">
                {isCompanionAi ? "Librarian Match (Online)" : "Wanderer (Online)"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-[#5A5A40] bg-[#E6E2D3] px-3 py-1.5 rounded-full">
          <Trophy className="w-4 h-4 text-[#5A5A40] animate-pulse" />
          <span>{connection.matchScore}% Resonance</span>
        </div>
      </div>

      {/* Main Grid: Split Ledger and Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        
        {/* Left Side: Ledger/Match details */}
        <div className="hidden lg:flex flex-col bg-[#F9F7F0] border border-[#E6E2D3] rounded-[32px] p-6 overflow-y-auto max-h-full space-y-5 scrollbar-thin">
          <div className="flex items-center gap-2 text-[#C36B4A]">
            <Sparkles className="w-4 h-4 fill-[#C36B4A] stroke-none animate-pulse" />
            <h4 className="font-serif font-bold tracking-wide text-xs uppercase text-[#5A5A40]">Rendezvous Ledger</h4>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#7C8363] tracking-wider">Shared Theme</span>
            <p className="font-serif text-lg font-medium text-[#C36B4A] mt-0.5">{connection.matchedTheme}</p>
          </div>

          <div className="h-px bg-[#E6E2D3]" />

          <div>
            <span className="text-[10px] uppercase font-bold text-[#7C8363] tracking-wider">Matched Manuscripts</span>
            <div className="mt-2 space-y-2 text-xs">
              <div className="p-3 bg-white border border-[#E6E2D3] rounded-2xl">
                <span className="font-bold block text-[#7C8363]">Your Story:</span>
                <span className="font-serif font-semibold text-[#33322E] block mt-0.5">"{myStoryTitle}"</span>
              </div>
              <div className="p-3 bg-white border border-[#E6E2D3] rounded-2xl">
                <span className="font-bold block text-[#7C8363]">{companionName}'s Story:</span>
                <span className="font-serif font-semibold text-[#33322E] block mt-0.5">"{companionStoryTitle}"</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#E6E2D3]" />

          <div>
            <span className="text-[10px] uppercase font-bold text-[#7C8363] tracking-wider">The Resonance Card</span>
            <p className="text-xs text-[#33322E] leading-relaxed mt-2 italic bg-white p-3 rounded-2xl border border-[#E6E2D3]">
              "{connection.matchedReason}"
            </p>
          </div>

          <div className="h-px bg-[#E6E2D3]" />

          <div className="bg-[#C36B4A]/10 p-4 rounded-2xl border border-[#C36B4A]/20">
            <span className="text-[10px] uppercase font-bold text-[#C36B4A] tracking-wider block">Conversational Spark</span>
            <p className="font-serif text-xs text-[#33322E] leading-relaxed mt-1.5 font-semibold">
              "{connection.icebreaker}"
            </p>
          </div>
        </div>

        {/* Right Side: Message Feed */}
        <div className="lg:col-span-2 flex flex-col bg-white border border-[#E6E2D3] rounded-[32px] overflow-hidden h-full">
          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 scrollbar-thin">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-8 h-8 border-3 border-[#E6E2D3] border-t-[#5A5A40] rounded-full animate-spin" />
                <p className="text-xs text-[#7C8363] mt-2 italic font-serif">Opening cabinet letters...</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  if (msg.isSystem) {
                    return (
                      <div key={msg.id} className="mx-auto max-w-md my-6 text-center animate-fade-in">
                        <div className="bg-[#F9F7F0] border border-[#E6E2D3] rounded-2xl p-5 shadow-sm relative">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#5A5A40] text-white rounded-full flex items-center justify-center -translate-y-1/2 border-2 border-white">
                            <BookOpen className="w-3.5 h-3.5" />
                          </div>
                          <div className="markdown-body text-xs text-[#33322E] leading-relaxed space-y-2 text-center mt-2">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mt-1 leading-relaxed">{children}</p>,
                                strong: ({ children }) => <strong className="font-bold text-[13px] text-[#C36B4A] block md:inline mt-0.5">{children}</strong>,
                              }}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const isMe = msg.senderId === currentUser.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2.5 max-w-[85%] animate-fade-in ${
                        isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      {!isMe && (
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full border border-[#E6E2D3] mb-1 bg-[#FAF7F2]"
                        />
                      )}
                      
                      <div>
                        {/* Sender Label */}
                        <span className={`text-[9px] font-bold text-[#7C8363] block mb-1 ${isMe ? "text-right" : ""}`}>
                          {isMe ? "You" : `@${msg.senderName}`}
                        </span>
                        
                        {/* Bubble */}
                        <div
                          className={`px-4 py-2.5 rounded-[20px] text-xs leading-relaxed ${
                            isMe
                              ? "bg-[#5A5A40] text-white rounded-br-none font-sans"
                              : "bg-[#F5F2ED] text-[#33322E] rounded-bl-none font-serif italic"
                          }`}
                        >
                          <div className="markdown-body">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <span className="block whitespace-pre-wrap">{children}</span>,
                                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                              }}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Animated Typing Indicator */}
                {isCompanionTyping && (
                  <div className="flex items-end gap-2.5 max-w-[80%] mr-auto animate-fade-in">
                    <img
                      src={companionAvatar}
                      alt={companionName}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full border border-[#E6E2D3] mb-1"
                    />
                    <div>
                      <span className="text-[9px] font-bold text-[#7C8363] block mb-1">
                        {companionName}
                      </span>
                      <div className="bg-[#F5F2ED] text-[#7C8363] rounded-[20px] rounded-bl-none px-4 py-3 flex items-center gap-2 text-xs font-serif italic">
                        <div className="flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 bg-[#7C8363] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#7C8363] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#7C8363] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span>writing in ledger...</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form message input */}
          <form onSubmit={handleSend} className="p-4 border-t border-[#E6E2D3] bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Send a letter to ${companionName}...`}
                className="flex-1 px-5 py-3 bg-[#F9F7F0] border border-[#E6E2D3] rounded-full text-xs text-[#33322E] placeholder-[#9A9587] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] transition-all font-serif"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="p-3 bg-[#5A5A40] hover:bg-[#4A4A34] text-white rounded-full transition-all focus:outline-none cursor-pointer flex-shrink-0 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
