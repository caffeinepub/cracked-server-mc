/* eslint-disable */
// @ts-nocheck
import { IDL } from '@icp-sdk/core/candid';

export const Review = IDL.Record({
  'id' : IDL.Text,
  'date' : IDL.Text,
  'name' : IDL.Text,
  'text' : IDL.Text,
  'serverId' : IDL.Text,
});
export const Server = IDL.Record({
  'id' : IDL.Text,
  'ip' : IDL.Text,
  'name' : IDL.Text,
  'createdAt' : IDL.Text,
  'tags' : IDL.Vec(IDL.Text),
  'description' : IDL.Opt(IDL.Text),
  'imageUrl' : IDL.Text,
  'rating' : IDL.Nat,
  'ytVideoUrl' : IDL.Opt(IDL.Text),
  'website' : IDL.Opt(IDL.Text),
  'discordUrl' : IDL.Opt(IDL.Text),
  'version' : IDL.Opt(IDL.Text),
  'maxPlayers' : IDL.Opt(IDL.Nat),
  'location' : IDL.Opt(IDL.Text),
  'gameMode' : IDL.Opt(IDL.Text),
  'status' : IDL.Opt(IDL.Text),
  'featured' : IDL.Bool,
  'serverType' : IDL.Text,
});
export const UserSubmission = IDL.Record({
  'id' : IDL.Text,
  'name' : IDL.Text,
  'ip' : IDL.Text,
  'version' : IDL.Text,
  'gameMode' : IDL.Text,
  'description' : IDL.Text,
  'imageUrl' : IDL.Text,
  'serverType' : IDL.Text,
  'submitterName' : IDL.Text,
  'submittedAt' : IDL.Text,
  'submissionStatus' : IDL.Text,
});
export const SiteSettings = IDL.Record({ 'heroSubtitle' : IDL.Text });

export const idlService = IDL.Service({
  'addReview' : IDL.Func([Review], [], []),
  'addServer' : IDL.Func([Server], [], []),
  'deleteReview' : IDL.Func([IDL.Text, IDL.Text], [], []),
  'deleteServer' : IDL.Func([IDL.Text], [], []),
  'getAnnouncement' : IDL.Func([], [IDL.Text], ['query']),
  'getLastUpdated' : IDL.Func([], [IDL.Int], ['query']),
  'getReviews' : IDL.Func([IDL.Text], [IDL.Vec(Review)], ['query']),
  'getServers' : IDL.Func([], [IDL.Vec(Server)], ['query']),
  'getSiteSettings' : IDL.Func([], [SiteSettings], ['query']),
  'saveSiteSettings' : IDL.Func([SiteSettings], [], []),
  'seedSampleServers' : IDL.Func([], [], []),
  'setAnnouncement' : IDL.Func([IDL.Text], [], []),
  'updateServer' : IDL.Func([Server], [], []),
  'getSubmissionsEnabled' : IDL.Func([], [IDL.Bool], ['query']),
  'setSubmissionsEnabled' : IDL.Func([IDL.Bool], [], []),
  'submitServer' : IDL.Func([UserSubmission], [], []),
  'getPendingSubmissions' : IDL.Func([], [IDL.Vec(UserSubmission)], ['query']),
  'approveSubmission' : IDL.Func([IDL.Text], [], []),
  'rejectSubmission' : IDL.Func([IDL.Text], [], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const Review = IDL.Record({
    'id' : IDL.Text, 'date' : IDL.Text, 'name' : IDL.Text,
    'text' : IDL.Text, 'serverId' : IDL.Text,
  });
  const Server = IDL.Record({
    'id' : IDL.Text, 'ip' : IDL.Text, 'name' : IDL.Text,
    'createdAt' : IDL.Text, 'tags' : IDL.Vec(IDL.Text),
    'description' : IDL.Opt(IDL.Text), 'imageUrl' : IDL.Text,
    'rating' : IDL.Nat, 'ytVideoUrl' : IDL.Opt(IDL.Text),
    'website' : IDL.Opt(IDL.Text), 'discordUrl' : IDL.Opt(IDL.Text),
    'version' : IDL.Opt(IDL.Text), 'maxPlayers' : IDL.Opt(IDL.Nat),
    'location' : IDL.Opt(IDL.Text), 'gameMode' : IDL.Opt(IDL.Text),
    'status' : IDL.Opt(IDL.Text), 'featured' : IDL.Bool,
    'serverType' : IDL.Text,
  });
  const UserSubmission = IDL.Record({
    'id' : IDL.Text, 'name' : IDL.Text, 'ip' : IDL.Text,
    'version' : IDL.Text, 'gameMode' : IDL.Text, 'description' : IDL.Text,
    'imageUrl' : IDL.Text, 'serverType' : IDL.Text,
    'submitterName' : IDL.Text, 'submittedAt' : IDL.Text,
    'submissionStatus' : IDL.Text,
  });
  const SiteSettings = IDL.Record({ 'heroSubtitle' : IDL.Text });

  return IDL.Service({
    'addReview' : IDL.Func([Review], [], []),
    'addServer' : IDL.Func([Server], [], []),
    'deleteReview' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'deleteServer' : IDL.Func([IDL.Text], [], []),
    'getAnnouncement' : IDL.Func([], [IDL.Text], ['query']),
    'getLastUpdated' : IDL.Func([], [IDL.Int], ['query']),
    'getReviews' : IDL.Func([IDL.Text], [IDL.Vec(Review)], ['query']),
    'getServers' : IDL.Func([], [IDL.Vec(Server)], ['query']),
    'getSiteSettings' : IDL.Func([], [SiteSettings], ['query']),
    'saveSiteSettings' : IDL.Func([SiteSettings], [], []),
    'seedSampleServers' : IDL.Func([], [], []),
    'setAnnouncement' : IDL.Func([IDL.Text], [], []),
    'updateServer' : IDL.Func([Server], [], []),
    'getSubmissionsEnabled' : IDL.Func([], [IDL.Bool], ['query']),
    'setSubmissionsEnabled' : IDL.Func([IDL.Bool], [], []),
    'submitServer' : IDL.Func([UserSubmission], [], []),
    'getPendingSubmissions' : IDL.Func([], [IDL.Vec(UserSubmission)], ['query']),
    'approveSubmission' : IDL.Func([IDL.Text], [], []),
    'rejectSubmission' : IDL.Func([IDL.Text], [], []),
  });
};

export const init = ({ IDL }) => { return []; };
