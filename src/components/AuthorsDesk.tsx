import React, { useState } from "react";
import { Story, Connection } from "../types.js";
import { BookOpen, Compass, Feather, MessageSquare, PenTool, Sparkles, Trophy, X } from "lucide-react";

interface AuthorsDeskProps {
  myStories: Story[];
  connections: Connection[];
  onSubmitStory: (title: string, genre: string, content: string) => Promise<void>;
  onSelectConnection: (conn: Connection) => void;
  submittingStory: boolean;
}

const GENRES = ["Gothic Mystery", "Literary Fiction", "Sci-Fi", "Poetry", "Drama", "Fantasy", "Romance"];

export default function AuthorsDesk({
  myStories,
  connections,
  onSubmitStory,
  onSelectConnection,
  submittingStory,
}: AuthorsDeskProps) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [content, setContent] = useState("");
  const [selectedConnectionCard, setSelectedConnectionCard] = useState<Connection | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    await onSubmitStory(title, genre, content);
    setTitle("");
    setContent("");
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-10" id="authors-desk">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Draftsman and Published Stories */}
        <div className="lg:col-span-2 space-y-8 animate-fade-in">
          {/* Draftsman Table Form */}
          <div className="bg-white border border-[#E6E2D3] rounded-[32px] p-6 lg:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#5A5A40]" />
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 bg-[#F9F7F0] text-[#5A5A40] rounded-xl">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#33322E]">The Draftsman's Table</h3>
                <p className="text-xs text-[#7C8363] mt-0.5">Let your thoughts crystallize into narrative paper.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#7C8363] uppercase tracking-wider mb-2">
                    Story Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Whispers of the Clockwork Cellar..."
                    className="w-full px-4 py-2.5 bg-[#F9F7F0] border border-[#E6E2D3] rounded-2xl text-sm text-[#33322E] placeholder-[#9A9587] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7C8363] uppercase tracking-wider mb-2">
                    Primary Genre
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F9F7F0] border border-[#E6E2D3] rounded-2xl text-sm text-[#33322E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] transition-all"
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7C8363] uppercase tracking-wider mb-2">
                  Narrative Content
                </label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your story here... Let the imagery flow. It works best if you describe vivid themes, emotional journeys, or magical realism—allowing the Librarian AI to find deep resonances..."
                  className="w-full p-4 bg-[#F9F7F0] border border-[#E6E2D3] rounded-2xl text-sm text-[#33322E] placeholder-[#9A9587] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] transition-all resize-none font-serif leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingStory}
                  className="bg-[#5A5A40] text-white font-semibold text-xs py-3 px-6 rounded-full hover:bg-[#4A4A34] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A5A40] transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  {submittingStory ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Consulting Librarian AI...</span>
                    </>
                  ) : (
                    <>
                      <Feather className="w-4 h-4" />
                      <span>Publish to Public Wall</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Published Volumes */}
          <div className="bg-white border border-[#E6E2D3] rounded-[32px] p-6 lg:p-8 shadow-sm">
            <h3 className="font-serif text-lg font-semibold text-[#33322E] mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#7C8363]" />
              <span>Your Published Volumes</span>
            </h3>

            {myStories.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#E6E2D3] rounded-2xl">
                <p className="text-sm text-[#7C8363] italic font-serif">No manuscripts written yet.</p>
                <p className="text-xs text-[#9A9587] mt-1">Craft your first story above to populate your catalog.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myStories.map((story) => (
                  <div
                    key={story.id}
                    className="p-5 border border-[#E6E2D3] hover:border-[#5A5A40] rounded-2xl bg-[#F9F7F0]/30 hover:bg-[#F9F7F0]/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-[#C36B4A] bg-[#C36B4A]/10 px-2 py-0.5 rounded-full">
                          {story.genre}
                        </span>
                        <span className="text-[10px] text-[#9A9587]">
                          {new Date(story.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-serif text-base font-medium text-[#33322E] mt-2 leading-tight">
                        {story.title}
                      </h4>
                      <p className="text-xs text-[#7C8363] line-clamp-1 mt-1 leading-relaxed max-w-lg italic">
                        "{story.content}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      {story.matchedStoryId ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#C36B4A]/10 text-[#C36B4A] rounded-full text-xs font-bold">
                          <Sparkles className="w-3.5 h-3.5 fill-[#C36B4A] stroke-none" /> Match Found
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F2ED] text-[#7C8363] rounded-full text-[11px] font-semibold">
                          <span>Awaiting companion...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Connections */}
        <div className="space-y-8 animate-fade-in">
          <div className="bg-[#F5F2ED] rounded-[32px] p-6 lg:p-8 border border-[#E6E2D3] h-full flex flex-col">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#C36B4A] animate-pulse" />
              <h3 className="text-xs uppercase tracking-[0.15em] font-bold text-[#5A5A40] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#5A5A40]" />
                <span>Active Rendezvous</span>
              </h3>
            </div>
            
            <p className="text-xs text-[#7C8363] mb-6 leading-relaxed">
              These are the authors whose stories have spoken to yours. Enter private chat rooms to discuss creative insights.
            </p>

            {connections.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[#E6E2D3] bg-white rounded-[24px] flex-1 flex flex-col items-center justify-center p-6">
                <Sparkles className="w-10 h-10 text-[#9A9587] stroke-1 mb-3 animate-pulse" />
                <p className="text-sm text-[#33322E] font-serif font-medium">Awaiting Connections</p>
                <p className="text-xs text-[#7C8363] mt-2 max-w-[200px] mx-auto leading-relaxed">
                  Submit a story. Our Librarian AI will automatically search the library for a fitting companion.
                </p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1">
                {connections.map((conn) => (
                  <div
                    key={conn.id}
                    className="p-5 bg-white border border-[#E6E2D3] rounded-[24px] hover:border-[#5A5A40] hover:shadow-sm transition-all space-y-3 relative"
                  >
                    {/* Header: Score and Theme */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#C36B4A] tracking-wider truncate max-w-[150px]">
                        {conn.matchedTheme}
                      </span>
                      <div className="flex items-center gap-0.5 text-[10px] font-bold text-[#5A5A40] bg-[#E6E2D3] px-2 py-0.5 rounded-full">
                        <Trophy className="w-3 h-3 text-[#5A5A40]" />
                        <span>{conn.matchScore}%</span>
                      </div>
                    </div>

                    {/* Companion info */}
                    <div className="flex items-center gap-2.5 pt-1">
                      <img
                        src={conn.user1Avatar} // Fallback safety done on backend
                        alt="Companion"
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border border-[#E6E2D3] bg-[#FAF7F2]"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#33322E] truncate">
                          @{conn.user1Username}
                        </h4>
                        <p className="text-[10px] text-[#7C8363] truncate italic mt-0.5">
                          Matched over *{conn.user1StoryTitle}*
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-[#F5F2ED]">
                      <button
                        onClick={() => setSelectedConnectionCard(conn)}
                        className="text-[10px] font-bold py-2 px-2 bg-[#F5F2ED] hover:bg-[#E6E2D3] text-[#7C8363] rounded-full transition-colors cursor-pointer text-center"
                      >
                        Read Match Card
                      </button>
                      <button
                        onClick={() => onSelectConnection(conn)}
                        className="text-[10px] font-bold py-2 px-2 bg-[#5A5A40] hover:bg-[#4A4A34] text-white rounded-full transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Open Chat</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Connection Card Detail Modal */}
      {selectedConnectionCard && (
        <div className="fixed inset-0 bg-[#33322E]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FDFCF8] w-full max-w-lg rounded-[32px] border border-[#E6E2D3] shadow-xl overflow-hidden animate-fade-in relative flex flex-col">
            <div className="bg-[#5A5A40] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4 fill-[#C36B4A] stroke-none" />
                <h3 className="font-serif text-lg text-white font-semibold">Librarian Match Ledger</h3>
              </div>
              <button
                onClick={() => setSelectedConnectionCard(null)}
                className="text-[#E6E2D3] hover:text-white focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div>
                <span className="text-[10px] font-bold text-[#7C8363] uppercase tracking-wider block">Connection Theme</span>
                <h4 className="font-serif text-2xl text-[#C36B4A] mt-1 font-medium">{selectedConnectionCard.matchedTheme}</h4>
                <div className="flex items-center gap-1.5 mt-2.5 text-xs font-bold text-[#5A5A40] bg-[#E6E2D3] w-max px-2.5 py-1 rounded-full">
                  <Trophy className="w-3.5 h-3.5 text-[#5A5A40]" /> Resonance Level: {selectedConnectionCard.matchScore}%
                </div>
              </div>

              <div className="border-t border-[#E6E2D3] pt-4 space-y-2">
                <span className="text-[10px] font-bold text-[#7C8363] uppercase tracking-wider block">Why your stories matched</span>
                <p className="text-sm text-[#33322E] leading-relaxed italic">
                  "{selectedConnectionCard.matchedReason}"
                </p>
              </div>

              <div className="border-t border-[#E6E2D3] pt-4 space-y-2 bg-[#F9F7F0] p-4 rounded-2xl border border-[#E6E2D3]">
                <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider block">Librarian's Conversational Spark</span>
                <p className="text-xs text-[#33322E] font-serif leading-relaxed font-semibold">
                  "{selectedConnectionCard.icebreaker}"
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    const conn = selectedConnectionCard;
                    setSelectedConnectionCard(null);
                    onSelectConnection(conn);
                  }}
                  className="bg-[#5A5A40] hover:bg-[#4A4A34] text-white font-semibold text-xs py-2.5 px-5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Enter Private Chat Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
