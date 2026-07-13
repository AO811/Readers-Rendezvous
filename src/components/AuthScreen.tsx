import React, { useState } from "react";
import { api, setStoredToken } from "../lib/api.js";
import { User } from "../types.js";
import { BookOpen, Feather, Lock, Mail, Sparkles, User as UserIcon } from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.login({ email, password });
        setStoredToken(data.token);
        onAuthSuccess(data.user);
      } else {
        const data = await api.signup({ username, email, password, bio });
        setStoredToken(data.token);
        onAuthSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FDFCF8] text-[#33322E] w-full" id="auth-screen">
      {/* Editorial Welcome Column */}
      <div className="lg:w-1/2 flex flex-col justify-between p-8 lg:p-16 bg-[#5A5A40] text-[#FAF7F2] relative overflow-hidden">
        {/* Abstract book art glow background */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#C36B4A]/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-[#C36B4A] p-2.5 rounded-2xl text-white shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-[#FAF7F2]">
            Reader's Rendezvous
          </span>
        </div>

        <div className="relative z-10 my-16 lg:my-0 max-w-lg">
          <h1 className="font-serif text-4xl lg:text-5xl font-normal leading-tight text-white tracking-tight">
            Every story is a <span className="italic text-[#E6E2D3] font-light">bridge</span> waiting to be crossed.
          </h1>
          <p className="mt-6 text-[#FAF7F2]/80 leading-relaxed text-sm">
            Welcome to a social storytelling sanctuary. Here, we believe words are more than ink on a page—they are connections. Share your tales, let our Librarian AI trace the threads of your narratives, and discover matched private rooms with fellow writers.
          </p>

          <div className="mt-10 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded bg-white/15 text-white mt-1">
                <Feather className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Craft Your Narrative</h4>
                <p className="text-xs text-[#FAF7F2]/70 mt-0.5">Post short stories, vignettes, or poems on the Public Wall.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded bg-white/15 text-white mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Librarian AI Matchmaking</h4>
                <p className="text-xs text-[#FAF7F2]/70 mt-0.5">Our deep backend analyzes emotional undertones, themes, and motifs to match you.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-[#FAF7F2]/50">
          © 2026 Reader's Rendezvous • An Editorial Storytelling Experiment
        </div>
      </div>

      {/* Form Form Column */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md bg-white border border-[#E6E2D3] rounded-[32px] p-8 relative shadow-sm">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#C36B4A] rounded-b-md" />

          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-medium text-[#33322E] tracking-tight">
              {isLogin ? "Sign In to Your Desk" : "Register Your Alias"}
            </h2>
            <p className="text-xs text-[#7C8363] mt-2">
              {isLogin
                ? "Enter your credentials to return to your writing cabinet."
                : "Create your unique storytelling alias and join the circle."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl mb-6 leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-[#7C8363] uppercase tracking-wider mb-2">
                  Alias / Username
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9587]" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g., Samuel_Stone"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F0] border border-[#E6E2D3] rounded-2xl text-sm text-[#33322E] placeholder-[#9A9587] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#7C8363] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9587]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="writer@storyhouse.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F0] border border-[#E6E2D3] rounded-2xl text-sm text-[#33322E] placeholder-[#9A9587] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7C8363] uppercase tracking-wider mb-2">
                Private Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9587]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F0] border border-[#E6E2D3] rounded-2xl text-sm text-[#33322E] placeholder-[#9A9587] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] transition-all"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-[#7C8363] uppercase tracking-wider mb-2">
                  Author's Biography (Optional)
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Tell us about the landscapes you enjoy writing..."
                  className="w-full px-4 py-2.5 bg-[#F9F7F0] border border-[#E6E2D3] rounded-2xl text-sm text-[#33322E] placeholder-[#9A9587] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] transition-all resize-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5A5A40] text-white font-medium text-sm py-3 rounded-full hover:bg-[#4A4A34] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A5A40] transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : isLogin ? (
                "Enter the Sanctuary"
              ) : (
                "Begin Your Journey"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#F5F2ED] text-center text-xs">
            <span className="text-[#7C8363]">
              {isLogin ? "New to the platform?" : "Already have an alias?"}
            </span>{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-[#C36B4A] font-bold hover:underline hover:text-[#5A5A40] focus:outline-none cursor-pointer"
            >
              {isLogin ? "Create an account" : "Sign in here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
