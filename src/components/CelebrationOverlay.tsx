import React from "react";
import { Connection } from "../types.js";
import { BookOpen, Sparkles, Trophy } from "lucide-react";

interface CelebrationOverlayProps {
  connection: Connection;
  onEnterChat: () => void;
  onClose: () => void;
}

export default function CelebrationOverlay({ connection, onEnterChat, onClose }: CelebrationOverlayProps) {
  return (
    <div className="fixed inset-0 bg-[#33322E]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Decorative ambient spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#5A5A40]/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#C36B4A]/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-2xl bg-[#FDFCF8] border border-[#E6E2D3] rounded-[32px] p-6 lg:p-12 text-center relative shadow-2xl overflow-hidden my-auto">
        {/* Top border strip */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#5A5A40]" />

        {/* Floating sparkles animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="p-4 bg-[#F9F7F0] rounded-full text-[#C36B4A] border border-[#E6E2D3] animate-bounce">
              <Sparkles className="w-8 h-8 fill-[#C36B4A] stroke-none" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C36B4A]/50 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C36B4A]"></span>
            </span>
          </div>
        </div>

        <h2 className="font-serif text-3xl lg:text-4xl text-[#33322E] font-normal leading-tight">
          A Literary Rendezvous is <span className="italic font-light text-[#C36B4A]">Found!</span>
        </h2>
        <p className="text-xs text-[#7C8363] tracking-wider uppercase font-bold mt-3">
          Our Librarian AI has woven your threads together
        </p>

        {/* Two Manuscripts Merging Animation Graphic */}
        <div className="my-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 relative">
          
          {/* User Story Manuscript */}
          <div className="w-48 p-5 bg-white border border-[#E6E2D3] rounded-[24px] shadow-sm rotate-[-4deg] hover:rotate-0 transition-transform">
            <div className="h-1 bg-[#E6E2D3] rounded w-1/3 mb-3" />
            <span className="text-[9px] uppercase font-bold text-[#7C8363]">Your Work</span>
            <h4 className="font-serif text-xs font-semibold text-[#33322E] line-clamp-2 mt-1 leading-snug">
              "{connection.user1StoryTitle}"
            </h4>
            <div className="mt-4 space-y-1">
              <div className="h-1.5 bg-[#F9F7F0] rounded w-full" />
              <div className="h-1.5 bg-[#F9F7F0] rounded w-5/6" />
              <div className="h-1.5 bg-[#F9F7F0] rounded w-4/5" />
            </div>
          </div>

          {/* Connection Bridge Ring */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 bg-[#E6E2D3] text-[#5A5A40] border border-[#E6E2D3] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-inner">
              <Trophy className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>{connection.matchScore}% Resonance</span>
            </div>
            {/* Dashed connecting bridge */}
            <div className="h-6 md:h-px md:w-16 border-t-2 border-dashed border-[#C36B4A]/30 my-2" />
          </div>

          {/* Companion Story Manuscript */}
          <div className="w-48 p-5 bg-white border border-[#E6E2D3] rounded-[24px] shadow-sm rotate-[4deg] hover:rotate-0 transition-transform">
            <div className="h-1 bg-[#C36B4A]/30 rounded w-1/3 mb-3" />
            <span className="text-[9px] uppercase font-bold text-[#C36B4A]">@{connection.user2Username}</span>
            <h4 className="font-serif text-xs font-semibold text-[#33322E] line-clamp-2 mt-1 leading-snug">
              "{connection.user2StoryTitle}"
            </h4>
            <div className="mt-4 space-y-1">
              <div className="h-1.5 bg-[#F9F7F0] rounded w-full" />
              <div className="h-1.5 bg-[#F9F7F0] rounded w-5/6" />
              <div className="h-1.5 bg-[#F9F7F0] rounded w-4/5" />
            </div>
          </div>
        </div>

        {/* Match Card Details */}
        <div className="bg-[#F5F2ED] border border-[#E6E2D3] rounded-[24px] p-5 text-left max-w-lg mx-auto mb-8 space-y-4 shadow-sm">
          <div>
            <span className="text-[10px] uppercase text-[#7C8363] font-bold block">Shared Narrative Horizon</span>
            <h4 className="font-serif text-xl text-[#C36B4A] mt-0.5 font-semibold">"{connection.matchedTheme}"</h4>
          </div>
          <div>
            <span className="text-[10px] uppercase text-[#7C8363] font-bold block">The Librarian's Insight</span>
            <p className="text-xs text-[#33322E] leading-relaxed mt-1 italic font-serif">
              "{connection.matchedReason}"
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 bg-[#F5F2ED] hover:bg-[#E6E2D3] text-[#7C8363] font-bold text-xs rounded-full transition-colors cursor-pointer"
          >
            Go to My Desk
          </button>
          <button
            onClick={onEnterChat}
            className="w-full sm:w-auto px-8 py-3 bg-[#5A5A40] hover:bg-[#4A4A34] text-white font-bold text-xs rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Enter Private Discussion Room</span>
          </button>
        </div>
      </div>
    </div>
  );
}
