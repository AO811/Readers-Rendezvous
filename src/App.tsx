import React, { useState, useEffect, useRef } from "react";
import { User, Story, Connection } from "./types.js";
import { api, removeStoredToken, getStoredToken } from "./lib/api.js";
import AuthScreen from "./components/AuthScreen.js";
import PublicWall from "./components/PublicWall.js";
import AuthorsDesk from "./components/AuthorsDesk.js";
import ChatRoom from "./components/ChatRoom.js";
import CelebrationOverlay from "./components/CelebrationOverlay.js";
import { BookOpen, LogOut, PenTool, Sparkles, User as UserIcon } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  
  // Navigation & Tab States
  const [activeTab, setActiveTab] = useState<"public" | "desk">("public");
  const [activeConnection, setActiveConnection] = useState<Connection | null>(null);
  const [celebrationConnection, setCelebrationConnection] = useState<Connection | null>(null);

  // Data States
  const [stories, setStories] = useState<Story[]>([]);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  
  // Load States
  const [loadingStories, setLoadingStories] = useState(false);
  const [submittingStory, setSubmittingStory] = useState(false);

  const backgroundPollRef = useRef<NodeJS.Timeout | null>(null);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = getStoredToken();
      if (token) {
        try {
          const data = await api.me();
          setCurrentUser(data.user);
        } catch (e) {
          console.error("Session restoration failed", e);
          removeStoredToken();
        }
      }
      setAppLoading(false);
    };
    restoreSession();
  }, []);

  // Fetch all app data when logged in
  const fetchAllData = async (silent = false) => {
    if (!currentUser) return;
    if (!silent) setLoadingStories(true);

    try {
      const [storiesData, myStoriesData, connectionsData] = await Promise.all([
        api.getStories(),
        api.getUserStories(),
        api.getConnections(),
      ]);

      setStories(storiesData.stories);
      setMyStories(myStoriesData.stories);
      setConnections(connectionsData.connections);
    } catch (e) {
      console.error("Failed to fetch library data", e);
    } finally {
      if (!silent) setLoadingStories(false);
    }
  };

  // Trigger data fetches on login or screen transition
  useEffect(() => {
    if (currentUser) {
      fetchAllData();

      // Setup occasional polling for background matching notifications
      backgroundPollRef.current = setInterval(() => {
        fetchAllData(true);
      }, 8000);
    } else {
      setStories([]);
      setMyStories([]);
      setConnections([]);
      if (backgroundPollRef.current) {
        clearInterval(backgroundPollRef.current);
      }
    }

    return () => {
      if (backgroundPollRef.current) {
        clearInterval(backgroundPollRef.current);
      }
    };
  }, [currentUser]);

  const handleLogout = () => {
    removeStoredToken();
    setCurrentUser(null);
    setActiveConnection(null);
    setCelebrationConnection(null);
    setActiveTab("public");
  };

  const handleSubmitStory = async (title: string, genre: string, content: string) => {
    setSubmittingStory(true);
    try {
      const result = await api.createStory({ title, genre, content });
      
      // Update local state instantly
      setMyStories((prev) => [result.story, ...prev]);
      setStories((prev) => [result.story, ...prev]);

      // If matching successfully triggered and a Connection is established
      if (result.connection) {
        setCelebrationConnection(result.connection);
        setConnections((prev) => [result.connection, ...prev]);
      }
    } catch (e) {
      console.error("Failed to publish story", e);
      alert("Failed to publish your manuscript. Please try again.");
    } finally {
      setSubmittingStory(false);
    }
  };

  if (appLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center justify-center text-[#33322E]">
        <div className="w-12 h-12 border-4 border-[#E6E2D3] border-t-[#5A5A40] rounded-full animate-spin" />
        <p className="mt-4 font-serif italic text-[#7C8363]">Unlocking the library vault...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="w-full h-screen bg-[#FDFCF8] text-[#33322E] flex font-sans overflow-hidden">
      
      {/* Immersive Matching Celebration Screen */}
      {celebrationConnection && (
        <CelebrationOverlay
          connection={celebrationConnection}
          onClose={() => setCelebrationConnection(null)}
          onEnterChat={() => {
            const conn = celebrationConnection;
            setCelebrationConnection(null);
            setActiveConnection(conn);
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-[#E6E2D3] bg-[#F9F7F0] flex flex-col p-6 flex-shrink-0">
        <div className="mb-10">
          <h1 
            onClick={() => { setActiveConnection(null); setActiveTab("public"); }}
            className="text-2xl font-serif italic text-[#5A5A40] font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
          >
            Reader's<br/>Rendezvous
          </h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => { setActiveConnection(null); setActiveTab("public"); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "public" && !activeConnection
                ? "bg-[#E6E2D3] text-[#5A5A40]"
                : "text-[#7C8363] hover:bg-[#F0EEE4]"
            }`}
          >
            <BookOpen className="w-5 h-5 flex-shrink-0" />
            <span>Library Wall</span>
          </button>
          
          <button
            onClick={() => { setActiveConnection(null); setActiveTab("desk"); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "desk" && !activeConnection
                ? "bg-[#E6E2D3] text-[#5A5A40]"
                : "text-[#7C8363] hover:bg-[#F0EEE4]"
            }`}
          >
            <PenTool className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left">My Stories & Desk</span>
            {connections.length > 0 && (
              <span className="w-2 h-2 bg-[#C36B4A] rounded-full animate-pulse" />
            )}
          </button>

          {activeConnection && (
            <button
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold bg-[#E6E2D3] text-[#5A5A40] transition-all cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-[#C36B4A] flex-shrink-0" />
              <span className="truncate">Active Rendezvous</span>
            </button>
          )}
        </nav>

        {/* User profile section at the bottom */}
        <div className="mt-auto pt-6 border-t border-[#E6E2D3]">
          <div className="p-3 bg-white rounded-2xl border border-[#E6E2D3] flex items-center space-x-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.username}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border border-[#E6E2D3] bg-[#FAF7F2]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#33322E] truncate">{currentUser.username}</p>
              <p className="text-[10px] text-[#7C8363] truncate">Storyteller Alias</p>
            </div>
            <button
              onClick={handleLogout}
              title="Leave Platform"
              className="p-1.5 rounded-lg hover:bg-[#F0EEE4] text-[#7C8363] hover:text-[#5A5A40] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Dynamic Header */}
        <header className="h-20 border-b border-[#E6E2D3] flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm flex-shrink-0">
          <div>
            <h2 className="text-lg font-serif italic text-[#33322E]">
              {activeConnection 
                ? "Resonance Sanctuary" 
                : activeTab === "public" 
                  ? "The Library Wall" 
                  : "The Author's Desk"}
            </h2>
            <p className="text-xs text-[#7C8363]">
              {activeConnection 
                ? `Private dialogue with ${activeConnection.user1Id === currentUser.id ? activeConnection.user2Username : activeConnection.user1Username}`
                : activeTab === "public"
                  ? "Discover voices and matched narratives from around the world"
                  : "Compose manuscripts and check literary alignments"}
            </p>
          </div>

          {activeTab === "public" && !activeConnection && (
            <button 
              onClick={() => setActiveTab("desk")}
              className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#4A4A34] text-white rounded-full font-medium text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Share a New Story</span>
            </button>
          )}
        </header>

        {/* Content body with custom overflow layout */}
        <main className="flex-1 overflow-y-auto">
          {activeConnection ? (
            <ChatRoom
              connection={activeConnection}
              currentUser={currentUser}
              onBack={() => {
                setActiveConnection(null);
                setActiveTab("desk");
                fetchAllData(true);
              }}
            />
          ) : activeTab === "public" ? (
            <PublicWall
              stories={stories}
              loading={loadingStories}
              onRefresh={() => fetchAllData()}
            />
          ) : (
            <AuthorsDesk
              myStories={myStories}
              connections={connections}
              onSubmitStory={handleSubmitStory}
              onSelectConnection={(conn) => setActiveConnection(conn)}
              submittingStory={submittingStory}
            />
          )}
        </main>
      </div>

    </div>
  );
}
