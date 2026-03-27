/* eslint-disable */
// @ts-nocheck
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface Review {
  'id' : string,
  'date' : string,
  'name' : string,
  'text' : string,
  'serverId' : string,
}
export interface Server {
  'id' : string,
  'ip' : string,
  'name' : string,
  'createdAt' : string,
  'tags' : Array<string>,
  'description' : [] | [string],
  'imageUrl' : string,
  'rating' : bigint,
  'ytVideoUrl' : [] | [string],
  'website' : [] | [string],
  'discordUrl' : [] | [string],
  'version' : [] | [string],
  'maxPlayers' : [] | [bigint],
  'location' : [] | [string],
  'gameMode' : [] | [string],
  'status' : [] | [string],
  'featured' : boolean,
  'serverType' : string,
}
export interface UserSubmission {
  'id' : string,
  'name' : string,
  'ip' : string,
  'version' : string,
  'gameMode' : string,
  'description' : string,
  'imageUrl' : string,
  'serverType' : string,
  'submitterName' : string,
  'submittedAt' : string,
  'submissionStatus' : string,
}
export interface SiteSettings { 'heroSubtitle' : string }
export interface _SERVICE {
  'addReview' : ActorMethod<[Review], undefined>,
  'addServer' : ActorMethod<[Server], undefined>,
  'deleteReview' : ActorMethod<[string, string], undefined>,
  'deleteServer' : ActorMethod<[string], undefined>,
  'getAnnouncement' : ActorMethod<[], string>,
  'getLastUpdated' : ActorMethod<[], bigint>,
  'getReviews' : ActorMethod<[string], Array<Review>>,
  'getServers' : ActorMethod<[], Array<Server>>,
  'getSiteSettings' : ActorMethod<[], SiteSettings>,
  'saveSiteSettings' : ActorMethod<[SiteSettings], undefined>,
  'seedSampleServers' : ActorMethod<[], undefined>,
  'setAnnouncement' : ActorMethod<[string], undefined>,
  'updateServer' : ActorMethod<[Server], undefined>,
  'getSubmissionsEnabled' : ActorMethod<[], boolean>,
  'setSubmissionsEnabled' : ActorMethod<[boolean], undefined>,
  'submitServer' : ActorMethod<[UserSubmission], undefined>,
  'getPendingSubmissions' : ActorMethod<[], Array<UserSubmission>>,
  'approveSubmission' : ActorMethod<[string], undefined>,
  'rejectSubmission' : ActorMethod<[string], undefined>,
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
