import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SiteSettings {
    heroSubtitle: string;
}
export interface Review {
    id: string;
    date: string;
    name: string;
    text: string;
    serverId: string;
}
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
export interface backendInterface {
    addReview(review: Review): Promise<void>;
    addServer(server: Server): Promise<void>;
    deleteReview(serverId: string, reviewId: string): Promise<void>;
    deleteServer(id: string): Promise<void>;
    getAnnouncement(): Promise<string>;
    getLastUpdated(): Promise<bigint>;
    getReviews(serverId: string): Promise<Array<Review>>;
    getServers(): Promise<Array<Server>>;
    getSiteSettings(): Promise<SiteSettings>;
    saveSiteSettings(settings: SiteSettings): Promise<void>;
    seedSampleServers(): Promise<void>;
    setAnnouncement(text: string): Promise<void>;
    updateServer(server: Server): Promise<void>;
    getSubmissionsEnabled(): Promise<boolean>;
    setSubmissionsEnabled(enabled: boolean): Promise<void>;
    submitServer(submission: UserSubmission): Promise<void>;
    getPendingSubmissions(): Promise<Array<UserSubmission>>;
    approveSubmission(id: string): Promise<void>;
    rejectSubmission(id: string): Promise<void>;
}
