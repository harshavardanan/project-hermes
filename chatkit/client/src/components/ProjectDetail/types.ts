export interface ProjectUser {
  displayName?: string;
  isOnline?: boolean;
  lastSeen?: string;
  messageCount?: number;
}

export interface Project {
  _id: string;
  projectName: string;
  projectId: string;
  apiKey: string;
  secret: string;
  createdAt: string;
  endpoint?: string;
  region?: string;
  plan?: {
    name?: string;
    dailyLimit?: number;
    monthlyPrice?: number;
    maxUsers?: number;
    maxRooms?: number;
  };
  usage?: {
    dailyTokens?: number;
    totalTokensAllTime?: number;
    totalUsers?: number;
    activeUsers?: number;
    totalMessages?: number;
    totalRooms?: number;
  };
  users?: ProjectUser[];
  stats?: {
    messagesStats?: Record<string, number>;
    totalUsers?: number;
    activeUsers?: number;
    totalMessages?: number;
    totalRooms?: number;
    avgLatency?: string | number;
    uptime?: string | number;
  };
}
