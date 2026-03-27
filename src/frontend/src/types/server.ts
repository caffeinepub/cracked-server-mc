export interface Server {
  id: string;
  ip: string;
  name: string;
  createdAt: string;
  tags: Array<string>;
  description: [] | [string];
  imageUrl: string;
  rating: bigint;
  ytVideoUrl: [] | [string];
  website: [] | [string];
  discordUrl: [] | [string];
  version: [] | [string];
  maxPlayers: [] | [bigint];
  location: [] | [string];
  gameMode: [] | [string];
  status: [] | [string];
  featured: boolean;
  serverType: string;
}

export interface UserSubmission {
  id: string;
  name: string;
  ip: string;
  version: string;
  gameMode: string;
  description: string;
  imageUrl: string;
  serverType: string;
  submitterName: string;
  submittedAt: string;
  submissionStatus: string;
}

export interface Review {
  id: string;
  date: string;
  name: string;
  text: string;
  serverId: string;
}

export interface SiteSettings {
  heroSubtitle: string;
}
