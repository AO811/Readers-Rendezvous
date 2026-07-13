import React, { useState } from "react";
import { Story } from "../types.js";
import { Book, Calendar, Filter, Sparkles, User, X } from "lucide-react";

interface PublicWallProps {
  stories: Story[];
  loading: boolean;
  onRefresh: () => void;
}

const GENRES = ["All", "Gothic Mystery", "Literary Fiction", "Sci-Fi", "Poetry", "Drama", "Fantasy", "Romance"];

export default function PublicWall({ stories, loading, onRefresh }: PublicWallProps) {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [readingStory, setReadingStory] = useState<Story | null>(null);

  const filteredStories = selectedGenre === "All"
    ? stories
    : stories.filter((s) => s.genre === selectedGenre);

  return (
    <div className="max-w-6xl mx-auto px-8 py-10" id="public-wall">
      {/* Literary Introduction Header */}
      <div className="text-center mb-10 animate-fade-in">
        <h2 className="font-serif text-3xl lg:text-4xl text-[#33322E] font-normal tracking-tight">
          The Grand Public Library
        </h2>
        <p className="text-[#7C8363] max-w-xl mx-auto mt-3 text-xs leading-relaxed">
          Step into our sanctuary of shared experiences. Here lie the stories of wanderers, dreamers, and quiet observers. Read their words, find pieces of yourself, and connect.
        </p>
        <div className="h-px bg-[#E6E2D3] w-24 mx-auto mt-6" />
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E6E2D3]">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-[#9A9587] flex-shrink-0" />
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedGenre === genre
                  ? "bg-[#5A5A40] text-white shadow-sm"
                  : "bg-[#F5F2ED] text-[#7C8363] hover:bg-[#E6E2D3] hover:text-[#5A5A40]"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-[#9A9587] self-end md:self-auto font-mono uppercase tracking-wider">
          Showing {filteredStories.length} of {stories.length} stories
        </div>
      </div>

      {/* Grid of stories */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#E6E2D3] border-t-[#5A5A40] rounded-full animate-spin" />
          <p className="text-xs text-[#7C8363] mt-4 font-serif italic">Unrolling scrolls...</p>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E6E2D3] rounded-[32px]">
          <Book className="w-12 h-12 text-[#9A9587] mx-auto stroke-1" />
          <h3 className="font-serif text-lg text-[#33322E] mt-4 font-normal">Silence in the Hall</h3>
          <p className="text-xs text-[#7C8363] mt-2 max-w-md mx-auto">
            No stories have been written in this genre yet. Be the first to grace this category with your words!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredStories.map((story) => (
            <article
              key={story.id}
              className="bg-white border border-[#E6E2D3] hover:border-[#5A5A40] hover:shadow-md rounded-[32px] p-6 transition-all flex flex-col justify-between group h-80 relative overflow-hidden"
            >
              {/* Corner bookmark decoration for matches */}
              {story.matchedStoryId && (
                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
                  <div className="absolute transform rotate-45 bg-[#C36B4A]/10 text-[#C36B4A] text-[9px] font-bold text-center py-1 right-[-28px] top-[14px] w-[90px] flex items-center justify-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 fill-[#C36B4A] stroke-none" /> Matched
                  </div>
                </div>
              )}

              <div>
                {/* Story Metadata */}
                <div className="flex items-center gap-2.5 mb-4">
                  <img
                    src={story.userAvatar || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(story.username)}`}
                    alt={story.username}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-[#E6E2D3] bg-[#FAF7F2]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#33322E] tracking-wide">@{story.username}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#9A9587] mt-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{new Date(story.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                </div>

                {/* Genre Badge */}
                <span className="inline-block bg-[#C36B4A]/10 text-[#C36B4A] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-3">
                  {story.genre}
                </span>

                {/* Title & Excerpt */}
                <h3 className="font-serif text-lg font-medium text-[#33322E] line-clamp-1 group-hover:text-[#5A5A40] transition-colors leading-tight">
                  {story.title}
                </h3>
                <p className="text-[#5C584F] text-xs leading-relaxed mt-2.5 line-clamp-4 italic">
                  "{story.content}"
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-[#F5F2ED] flex items-center justify-between">
                <button
                  onClick={() => setReadingStory(story)}
                  className="text-[#7C8363] hover:text-[#5A5A40] text-xs font-bold tracking-wide flex items-center gap-1.5 focus:outline-none cursor-pointer group-hover:underline"
                >
                  <Book className="w-3.5 h-3.5" /> Read Narrative
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Cozy overlay story reader modal */}
      {readingStory && (
        <div className="fixed inset-0 bg-[#33322E]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FDFCF8] w-full max-w-2xl rounded-[32px] border border-[#E6E2D3] shadow-xl overflow-hidden animate-fade-in relative max-h-[85vh] flex flex-col">
            {/* Top decorative library tag */}
            <div className="bg-[#5A5A40] p-4 text-[#F9F7F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider bg-[#C36B4A] text-white px-2 py-0.5 rounded-full font-bold">
                  {readingStory.genre}
                </span>
                <span className="text-xs text-[#E6E2D3] italic">written by {readingStory.username}</span>
              </div>
              <button
                onClick={() => setReadingStory(null)}
                className="text-[#E6E2D3] hover:text-white focus:outline-none cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Book Page Content */}
            <div className="overflow-y-auto p-8 lg:p-12 flex-1 scrollbar-thin">
              <div className="max-w-xl mx-auto">
                <header className="text-center mb-8 border-b border-[#E6E2D3] pb-6">
                  <h1 className="font-serif text-3xl lg:text-4xl text-[#33322E] font-normal leading-tight">
                    {readingStory.title}
                  </h1>
                  <div className="flex items-center justify-center gap-2.5 mt-4">
                    <img
                      src={readingStory.userAvatar || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(readingStory.username)}`}
                      alt={readingStory.username}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full border border-[#E6E2D3] bg-[#FAF7F2]"
                    />
                    <span className="text-xs font-semibold text-[#33322E]">@{readingStory.username}</span>
                    <span className="text-[#E6E2D3]">•</span>
                    <span className="text-xs text-[#7C8363]">{new Date(readingStory.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                </header>

                {/* Main Text Content */}
                <div className="font-serif text-base lg:text-lg text-[#33322E]/95 leading-relaxed space-y-6 whitespace-pre-wrap select-text selection:bg-[#E6E2D3] selection:text-[#5A5A40]">
                  {readingStory.content}
                </div>

                {/* Book Footer Ornament */}
                <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-[#E6E2D3] text-[#E6E2D3]">
                  <div className="h-px bg-[#E6E2D3] w-12" />
                  <span className="text-xs italic font-serif text-[#7C8363]">Finis</span>
                  <div className="h-px bg-[#E6E2D3] w-12" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
