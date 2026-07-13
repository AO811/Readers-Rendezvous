import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { dbStore, DEMO_AUTHORS, DEMO_STORIES } from "./src/server/dbStore.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini Client to avoid crashing if API key is not set
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is missing. AI matching will use rule-based fallback.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Simple auth middleware updated to be async for Firestore
async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = authHeader.split(" ")[1];
  try {
    const user = await dbStore.getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }
    req.user = user;
    next();
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// ==========================================
// API ROUTES
// ==========================================

// Auth Routes
app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password, bio } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existing = await dbStore.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const user = await dbStore.createUser(username, email, password, bio);
    res.status(201).json({ token: user!.id, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await dbStore.getUserByEmail(email);
    if (!user || user.passwordHash !== password) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    res.json({ token: user.id, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Stories Routes
app.get("/api/stories", async (req, res) => {
  try {
    const stories = await dbStore.getStories();
    res.json({ stories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/stories", requireAuth, async (req, res) => {
  const { title, genre, content } = req.body;
  if (!title || !genre || !content) {
    return res.status(400).json({ error: "Title, genre, and content are required" });
  }

  try {
    // 1. Create the new story
    const story = await dbStore.createStory(req.user.id, title, genre, content);
    if (!story) {
      return res.status(500).json({ error: "Failed to create story" });
    }

    // 2. Fetch candidate stories from other users
    const allStories = await dbStore.getStories();
    const candidates = (allStories || []).filter((s) => s.userId !== req.user.id);

    let connection = null;

    if (candidates.length > 0) {
      const ai = getGeminiClient();
      if (ai) {
        try {
          console.log(`Triggering Gemini AI matching for new story "${title}"...`);
          // Prompt Gemini 3.5 Flash to evaluate story connections and output structured JSON
          const prompt = `You are the master literary matching system of "Reader's Rendezvous".
We have a newly posted story and a list of existing stories. Your task is to find the single best story that matches or resonates most deeply with the new story, based on theme, narrative voice, emotional core, motifs, or genre.

Newly Posted Story:
Title: "${story.title}"
Genre: "${story.genre}"
Author: "${story.username}"
Content:
${story.content}

Candidate Stories for Matching:
${candidates
  .map(
    (c, idx) => `
Candidate #${idx + 1}:
ID: "${c.id}"
Title: "${c.title}"
Genre: "${c.genre}"
Author: "${c.username}"
Content:
${c.content}
`
  )
  .join("\n---")}

Please analyze the newly posted story against all candidates and select the single best match.
Respond with a strict JSON object structure:
{
  "matchedStoryId": "the ID of the selected candidate story",
  "matchedTheme": "A poetic, short theme title (3-5 words) summarizing their connection",
  "matchedReason": "A beautiful, 2-3 sentence evocative literary analysis of why these two stories call out to each other and connect on a deep level",
  "icebreaker": "A warm, open-ended discussion question related to their shared theme to spark a private conversation between the authors",
  "matchScore": 85
}

Note: Select ONLY from the candidate IDs provided. Do not invent an ID. Return ONLY JSON.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  matchedStoryId: { type: Type.STRING },
                  matchedTheme: { type: Type.STRING },
                  matchedReason: { type: Type.STRING },
                  icebreaker: { type: Type.STRING },
                  matchScore: { type: Type.INTEGER },
                },
                required: ["matchedStoryId", "matchedTheme", "matchedReason", "icebreaker", "matchScore"],
              },
            },
          });

          const resultText = response.text?.trim() || "";
          const matchResult = JSON.parse(resultText);

          const matchedStory = (allStories || []).find((s) => s.id === matchResult.matchedStoryId);
          if (matchedStory) {
            connection = await dbStore.createConnection(
              req.user.id,
              matchedStory.userId,
              story.id,
              matchedStory.id,
              matchResult.matchedTheme,
              matchResult.matchedReason,
              matchResult.icebreaker,
              matchResult.matchScore
            );
          }
        } catch (matchErr) {
          console.error("Gemini matching failed, using rule-based fallback", matchErr);
        }
      }

      // Rule-based or fallback matching if Gemini is missing or fails
      if (!connection) {
        // Fallback: match with first demo author's story
        const fallbackStory = candidates[0];
        const matchedTheme = "Parallel Horizons";
        const matchedReason = "Your story explores a profound sense of exploration and longing that mirrors the emotional arc and atmospheric landscape of this tale.";
        const icebreaker = "What inspired you to explore these emotional depths in your writing?";
        
        connection = await dbStore.createConnection(
          req.user.id,
          fallbackStory.userId,
          story.id,
          fallbackStory.id,
          matchedTheme,
          matchedReason,
          icebreaker,
          90
        );
      }
    }

    res.status(201).json({ story, connection });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/stories/me", requireAuth, async (req, res) => {
  try {
    const stories = await dbStore.getUserStories(req.user.id);
    res.json({ stories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Connections Routes
app.get("/api/connections", requireAuth, async (req, res) => {
  try {
    const connections = await dbStore.getConnectionsForUser(req.user.id);
    res.json({ connections });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Messages Routes
app.get("/api/connections/:id/messages", requireAuth, async (req, res) => {
  const connectionId = req.params.id;
  try {
    const connection = await dbStore.getConnectionById(connectionId);
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    if (connection.user1Id !== req.user.id && connection.user2Id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const messages = await dbStore.getMessages(connectionId);
    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/connections/:id/messages", requireAuth, async (req, res) => {
  const connectionId = req.params.id;
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Message text is required" });
  }

  try {
    const connection = await dbStore.getConnectionById(connectionId);
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    if (connection.user1Id !== req.user.id && connection.user2Id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    // 1. Save user's message
    const message = await dbStore.createMessage(connectionId, req.user.id, req.user.username, text);

    // 2. Check if the matched user is an AI Demo Author
    const matchedUserId = connection.user1Id === req.user.id ? connection.user2Id : connection.user1Id;
    const isAiAuthor = DEMO_AUTHORS.some((author) => author.id === matchedUserId);

    if (isAiAuthor) {
      const aiAuthor = DEMO_AUTHORS.find((a) => a.id === matchedUserId)!;
      
      // Look up stories
      const realStoryId = connection.user1Id === req.user.id ? connection.user1StoryId : connection.user2StoryId;
      const aiStoryId = connection.user1Id === req.user.id ? connection.user2StoryId : connection.user1StoryId;
      
      const allStories = await dbStore.getStories();
      const realStory = (allStories || []).find(s => s.id === realStoryId)!;
      const aiStory = DEMO_STORIES.find(s => s.id === aiStoryId)!;

      // Fetch message history for context
      const history = await dbStore.getMessages(connectionId);

      // Trigger asynchronous Gemini generation for in-character response
      const ai = getGeminiClient();
      if (ai) {
        setTimeout(async () => {
          try {
            console.log(`Generating in-character response from AI Author "${aiAuthor.username}"...`);
            const prompt = `You are ${aiAuthor.username}, the fictional author of the story "${aiStory.title}".
Your bio: "${aiAuthor.bio}".
You have been matched in a private rendezvous on the platform "Reader's Rendezvous" with ${req.user.username}, who wrote "${realStory.title}".
Your connection theme is "${connection.matchedTheme}".
Why your stories matched: "${connection.matchedReason}".

Here is the conversation history so far:
${(history || []).map((m) => `${m.senderName}: ${m.text}`).join("\n")}

Respond to ${req.user.username}'s latest message. Keep your response short, warm, highly atmospheric, and deeply in character as ${aiAuthor.username}. Ask them questions about their story, their writing process, or their inspiration. Make it feel like an elegant, comforting literary conversation. Do not use hashtags, emojis, or modern slang. Respond in 1-3 brief paragraphs.`;

            const response = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: prompt,
            });

            const replyText = response.text || "That's deeply intriguing. Let's explore that thought further in our writing.";
            await dbStore.createMessage(connectionId, aiAuthor.id, aiAuthor.username, replyText);
          } catch (replyErr) {
            console.error("AI Author reply generation failed", replyErr);
            await dbStore.createMessage(
              connectionId,
              aiAuthor.id,
              aiAuthor.username,
              "I read your words with deep interest. There is a beautiful resonance in how you write. Tell me more."
            );
          }
        }, 1200); // Small realistic delay for typing effect
      } else {
        // Fallback static reply if no API key
        setTimeout(async () => {
          await dbStore.createMessage(
            connectionId,
            aiAuthor.id,
            aiAuthor.username,
            "Your words bring such a beautiful reflection to my mind. In writing, we truly connect across the spaces."
          );
        }, 1000);
      }
    }

    res.status(201).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// VITE OR STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
