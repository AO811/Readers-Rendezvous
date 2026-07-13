import fs from "fs";
import path from "path";
import { User, Story, Connection, Message } from "../types.js";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  query,
  where,
  getDocFromServer
} from "firebase/firestore";

// Seed Authors (Fictional companion accounts)
export const DEMO_AUTHORS = [
  {
    id: "author_evelyn",
    username: "Evelyn Reed",
    email: "evelyn@rendezvous.demo",
    passwordHash: "demo_password",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    bio: "Archivist of forgotten gothic tales, clockwork mysteries, and yellowed diaries. Finding magic in the quiet dust of ancient libraries.",
    createdAt: new Date("2026-01-10").toISOString(),
  },
  {
    id: "author_julian",
    username: "Julian Vance",
    email: "julian@rendezvous.demo",
    passwordHash: "demo_password",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    bio: "Coastal poet and wanderer. Writing about tides, wind-swept cliffs, acoustic strings, and letters in glass bottles carried away by the deep salt sea.",
    createdAt: new Date("2026-02-15").toISOString(),
  },
  {
    id: "author_clara",
    username: "Clara Thorne",
    email: "clara@rendezvous.demo",
    passwordHash: "demo_password",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    bio: "Celestial cartographer and sci-fi romanticist. Gazing at alien desert dunes, silver comets, and dreaming of the quiet spaces between distant stars.",
    createdAt: new Date("2026-03-01").toISOString(),
  },
];

export const DEMO_STORIES: Story[] = [
  {
    id: "story_evelyn_1",
    userId: "author_evelyn",
    username: "Evelyn Reed",
    userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    title: "The Clockmaker's Hour",
    genre: "Gothic Mystery",
    content: `Deep within the narrow alleys of Prague, Master Josef operated a dusty workshop where clocks did not measure the passage of time, but its weight. 
He had spent forty years building the 'Aethelgard Clock', a delicate brass structure of overlapping rings and celestial gears. 

One stormy winter evening, a young woman arrived carrying a broken pocket watch belonging to her late grandfather. As Josef opened the casing, he discovered a tiny key made of dark, unpolished meteor steel. When placed into the Aethelgard Clock, the brass rings began to rotate backwards. 

For seven minutes, the workshop filled with the warmth of a forgotten summer. The smell of fresh-cut hay and the distant sound of childhood laughter washed over them. In those brief minutes, she saw her grandfather sitting by the fireplace, smiling, and whispering a secret she had long since forgotten. Time is not a straight road, Josef realized, but a grand library, where every yesterday is a shelf waiting to be reached.`,
    createdAt: new Date("2026-05-10T12:00:00Z").toISOString(),
  },
  {
    id: "story_julian_1",
    userId: "author_julian",
    username: "Julian Vance",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    title: "Whispers of the Saltwater",
    genre: "Literary Fiction",
    content: `Every Tuesday, when the tide retreated to expose the ribbed sandbanks of Blackwood Bay, Samuel walked the shoreline with a canvas satchel. For forty-two years, he had been the sole keeper of the lighthouse on the northern reef, a solitary tower of white stone that watched over the treacherous passage.

But Samuel's true calling was not just the light; it was the letters. Whenever the autumn wind blew fiercely from the east, Samuel wrote. He did not write to anyone living, but to the sea itself, detailing the shapes of the storm clouds, the color of the kelp, and the sorrow of cold tea.

He folded the papers into tiny paper boats, dipping their hulls in melted candle wax to keep them buoyant, and cast them into the foaming surf. 

Yesterday, as he walked the sands, he found a tiny paper boat wedged inside a cluster of barnacles. It was not his. Written in faded blue ink on the damp parchment was a single sentence: 'The light reached the shore, and for a moment, the dark was friendly. Thank you.' Samuel held the small paper boat to his chest, the salt air suddenly tasting sweet.`,
    createdAt: new Date("2026-06-18T16:45:00Z").toISOString(),
  },
  {
    id: "story_clara_1",
    userId: "author_clara",
    username: "Clara Thorne",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    title: "Dune of the Silver Comet",
    genre: "Sci-Fi",
    content: `The desert moon of Oros III smelled of cold brass and dried lavender. Zephyr, a cartographer for the Stellar Cartography Guild, sat on the crest of a shifting obsidian dune, adjusting the filters on her optical visor. Above her, the great rings of Oros III spun like a slow, glowing record.

She was waiting for the 'Silver Comet', a wanderer of the deep void that visited this coordinate once every seventy years.

As the sky began to turn a deep, metallic violet, a soft hum vibrated through the sand. A fine spray of sparkling silver dust began to rise from the dunes, defying gravity and floating upwards. Then, the comet arrived. It tore across the atmosphere, a brilliant brushstroke of silver fire.

Zephyr began mapping the comet's tail, but as she zoomed in, she realized the light was pulsing in structured intervals—not random debris, but a repeating sequence of glowing radio frequencies. It was a melody. A simple, melancholic lullaby played in the language of cosmic radiation. She recorded the song, knowing she was the only ears in a million light-years to ever hear it.`,
    createdAt: new Date("2026-07-01T08:30:00Z").toISOString(),
  },
];

// Error handling configuration conforming to FirestoreErrorInfo
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Read Firebase Config and initialize SDK
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test Connection immediately on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export class DBStore {
  constructor() {
    this.seed();
  }

  public async seed() {
    try {
      // Seed Demo Users
      for (const author of DEMO_AUTHORS) {
        const userRef = doc(db, "users", author.id);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const userObj = {
            id: author.id,
            username: author.username,
            email: author.email,
            passwordHash: author.passwordHash,
            avatar: author.avatar,
            bio: author.bio,
            createdAt: author.createdAt,
          };
          await setDoc(userRef, userObj);
        }
      }

      // Seed Demo Stories
      for (const story of DEMO_STORIES) {
        const storyRef = doc(db, "stories", story.id);
        const storySnap = await getDoc(storyRef);
        if (!storySnap.exists()) {
          await setDoc(storyRef, story);
        }
      }
      console.log("Firebase Firestore seeding completed successfully.");
    } catch (e) {
      console.error("Failed to seed Firebase Firestore:", e);
    }
  }

  // --- Auth operations ---
  public async getUserByEmail(email: string) {
    const qPath = "users";
    try {
      const q = query(collection(db, qPath), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      return querySnapshot.docs[0].data() as User & { passwordHash: string };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, qPath);
    }
  }

  public async getUserById(id: string) {
    const docPath = `users/${id}`;
    try {
      const docSnap = await getDoc(doc(db, "users", id));
      if (!docSnap.exists()) return null;
      return docSnap.data() as User & { passwordHash: string };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  }

  public async createUser(username: string, email: string, passwordHash: string, bio?: string) {
    const id = "user_" + Math.random().toString(36).substring(2, 11);
    const avatar = `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(username)}`;
    const user: User & { passwordHash: string } = {
      id,
      username,
      email,
      passwordHash,
      avatar,
      bio: bio || "A curious reader and storyteller.",
      createdAt: new Date().toISOString(),
    };
    const docPath = `users/${id}`;
    try {
      await setDoc(doc(db, "users", id), user);
      return user;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }

  // --- Stories operations ---
  public async getStories() {
    const qPath = "stories";
    try {
      const q = query(collection(db, qPath));
      const querySnapshot = await getDocs(q);
      const stories: Story[] = [];
      querySnapshot.forEach((doc) => {
        stories.push(doc.data() as Story);
      });
      return stories.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, qPath);
    }
  }

  public async getUserStories(userId: string) {
    const qPath = "stories";
    try {
      const q = query(collection(db, qPath), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const stories: Story[] = [];
      querySnapshot.forEach((doc) => {
        stories.push(doc.data() as Story);
      });
      return stories.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, qPath);
    }
  }

  public async createStory(userId: string, title: string, genre: string, content: string) {
    const user = await this.getUserById(userId);
    if (!user) throw new Error("User not found");

    const id = "story_" + Math.random().toString(36).substring(2, 11);
    const story: Story = {
      id,
      userId,
      username: user.username,
      userAvatar: user.avatar,
      title,
      genre,
      content,
      createdAt: new Date().toISOString(),
    };

    const docPath = `stories/${id}`;
    try {
      await setDoc(doc(db, "stories", id), story);
      return story;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }

  public async updateStoryMatch(storyId: string, matchedStoryId: string, matchedUserId: string, connectionId: string) {
    const docPath = `stories/${storyId}`;
    try {
      const storyRef = doc(db, "stories", storyId);
      const storySnap = await getDoc(storyRef);
      if (storySnap.exists()) {
        const existingData = storySnap.data();
        await setDoc(storyRef, {
          ...existingData,
          matchedStoryId,
          matchedUserId,
          connectionId,
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }

  // --- Connections operations ---
  public async getConnectionsForUser(userId: string) {
    const qPath = "connections";
    try {
      const q1 = query(collection(db, qPath), where("user1Id", "==", userId));
      const q2 = query(collection(db, qPath), where("user2Id", "==", userId));

      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const connectionsMap = new Map<string, Connection>();

      snap1.forEach((doc) => {
        const c = doc.data() as Connection;
        connectionsMap.set(c.id, c);
      });
      snap2.forEach((doc) => {
        const c = doc.data() as Connection;
        connectionsMap.set(c.id, c);
      });

      return Array.from(connectionsMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, qPath);
    }
  }

  public async getConnectionById(id: string) {
    const docPath = `connections/${id}`;
    try {
      const docSnap = await getDoc(doc(db, "connections", id));
      if (!docSnap.exists()) return null;
      return docSnap.data() as Connection;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  }

  public async createConnection(
    user1Id: string,
    user2Id: string,
    user1StoryId: string,
    user2StoryId: string,
    matchedTheme: string,
    matchedReason: string,
    icebreaker: string,
    matchScore: number
  ) {
    const user1 = await this.getUserById(user1Id);
    const user2 = await this.getUserById(user2Id);

    const story1Ref = doc(db, "stories", user1StoryId);
    const story2Ref = doc(db, "stories", user2StoryId);
    const [story1Snap, story2Snap] = await Promise.all([getDoc(story1Ref), getDoc(story2Ref)]);

    if (!user1 || !user2 || !story1Snap.exists() || !story2Snap.exists()) {
      throw new Error("Invalid users or stories for connection");
    }

    const story1 = story1Snap.data() as Story;
    const story2 = story2Snap.data() as Story;

    const id = "conn_" + Math.random().toString(36).substring(2, 11);
    const connection: Connection = {
      id,
      user1Id,
      user2Id,
      user1StoryId,
      user2StoryId,
      user1Username: user1.username,
      user2Username: user2.username,
      user1Avatar: user1.avatar,
      user2Avatar: user2.avatar,
      user1StoryTitle: story1.title,
      user2StoryTitle: story2.title,
      matchedTheme,
      matchedReason,
      icebreaker,
      matchScore,
      createdAt: new Date().toISOString(),
    };

    const docPath = `connections/${id}`;
    try {
      await setDoc(doc(db, "connections", id), connection);

      // Link stories to connection
      await Promise.all([
        this.updateStoryMatch(user1StoryId, user2StoryId, user2Id, id),
        this.updateStoryMatch(user2StoryId, user1StoryId, user1Id, id)
      ]);

      // Seed welcoming system message
      await this.createMessage(
        id,
        "system",
        "Librarian AI",
        `✨ **Rendezvous Found!** **${user1.username}** (author of *${story1.title}*) and **${user2.username}** (author of *${story2.title}*) have been brought together by their stories.
      
**Shared Theme:** ${matchedTheme}

**Why your stories call out to each other:**
${matchedReason}

**Conversational Spark:**
"${icebreaker}"`,
        true
      );

      return connection;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }

  // --- Messages operations ---
  public async getMessages(connectionId: string) {
    const qPath = `connections/${connectionId}/messages`;
    try {
      const q = query(collection(db, "connections", connectionId, "messages"));
      const querySnapshot = await getDocs(q);
      const messages: Message[] = [];
      querySnapshot.forEach((doc) => {
        messages.push(doc.data() as Message);
      });
      return messages.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, qPath);
    }
  }

  public async createMessage(
    connectionId: string,
    senderId: string,
    senderName: string,
    text: string,
    isSystem: boolean = false
  ) {
    const user = await this.getUserById(senderId);
    const id = "msg_" + Math.random().toString(36).substring(2, 11);
    const message: Message = {
      id,
      connectionId,
      senderId,
      senderName,
      senderAvatar: user?.avatar || "",
      text,
      createdAt: new Date().toISOString(),
      isSystem,
    };

    const docPath = `connections/${connectionId}/messages/${id}`;
    try {
      await setDoc(doc(db, "connections", connectionId, "messages", id), message);
      return message;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }
}

export const dbStore = new DBStore();
