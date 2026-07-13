export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  title: string;
  genre: string;
  content: string;
  createdAt: string;
  matchedStoryId?: string;
  matchedUserId?: string;
  connectionId?: string;
}

export interface Connection {
  id: string;
  user1Id: string;
  user2Id: string;
  user1StoryId: string;
  user2StoryId: string;
  user1Username: string;
  user2Username: string;
  user1Avatar?: string;
  user2Avatar?: string;
  user1StoryTitle: string;
  user2StoryTitle: string;
  matchedTheme: string;
  matchedReason: string;
  icebreaker: string;
  matchScore: number;
  createdAt: string;
}

export interface Message {
  id: string;
  connectionId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  createdAt: string;
  isSystem?: boolean;
}
