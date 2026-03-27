import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";


actor {

  // ── Legacy types ──────────────────────────────────────────────────────────
  type ServerV1 = {
    id : Text; name : Text; ip : Text; rating : Nat; tags : [Text];
    imageUrl : Text; description : ?Text; createdAt : Text;
  };

  type ServerV2 = {
    id : Text; name : Text; ip : Text; rating : Nat; tags : [Text];
    imageUrl : Text; description : ?Text; ytVideoUrl : ?Text; createdAt : Text;
  };

  type ServerV3 = {
    id : Text; name : Text; ip : Text; rating : Nat; tags : [Text];
    imageUrl : Text; description : ?Text; ytVideoUrl : ?Text;
    website : ?Text; discordUrl : ?Text; version : ?Text;
    maxPlayers : ?Nat; location : ?Text; gameMode : ?Text;
    status : ?Text; createdAt : Text;
  };

  // ── Current type (V4) ────────────────────────────────────────────────────
  type Server = {
    id : Text; name : Text; ip : Text; rating : Nat; tags : [Text];
    imageUrl : Text; description : ?Text; ytVideoUrl : ?Text;
    website : ?Text; discordUrl : ?Text; version : ?Text;
    maxPlayers : ?Nat; location : ?Text; gameMode : ?Text;
    status : ?Text; createdAt : Text;
    featured : Bool;
    serverType : Text; // "Premium" or "Cracked"
  };

  type UserSubmission = {
    id : Text;
    name : Text;
    ip : Text;
    version : Text;
    gameMode : Text;
    description : Text;
    imageUrl : Text;
    serverType : Text; // "Premium" or "Cracked"
    submitterName : Text;
    submittedAt : Text;
    submissionStatus : Text; // "pending" | "approved" | "rejected"
  };

  type SiteSettings = { heroSubtitle : Text };

  type Review = {
    id : Text; serverId : Text; name : Text; text : Text; date : Text;
  };

  // ── Stable storage ────────────────────────────────────────────────────────
  let servers    = Map.empty<Text, ServerV1>();
  let serversV2  = Map.empty<Text, ServerV2>();
  let serversV3  = Map.empty<Text, ServerV3>();
  let serversV4  = Map.empty<Text, Server>();
  let reviews    = Map.empty<Text, Review>();
  let submissions = Map.empty<Text, UserSubmission>();

  var announcement      : Text         = "Welcome to ZodiacMC!";
  var siteSettings      : SiteSettings = { heroSubtitle = "India's Most Popular Minecraft Server List" };
  var lastUpdated       : Int          = Time.now();
  var migratedV1        : Bool         = false;
  var migratedV2        : Bool         = false;
  var migratedV3        : Bool         = false;
  var submissionsEnabled : Bool        = true;

  // ── Migration helpers ─────────────────────────────────────────────────────
  func runMigrationV1() {
    if (not migratedV1) {
      for (v1 in servers.values()) {
        if (serversV2.get(v1.id) == null) {
          serversV2.add(v1.id, {
            id = v1.id; name = v1.name; ip = v1.ip; rating = v1.rating;
            tags = v1.tags; imageUrl = v1.imageUrl; description = v1.description;
            ytVideoUrl = null; createdAt = v1.createdAt;
          });
        };
      };
      migratedV1 := true;
    };
  };

  func runMigrationV2() {
    if (not migratedV2) {
      for (v2 in serversV2.values()) {
        if (serversV3.get(v2.id) == null) {
          serversV3.add(v2.id, {
            id = v2.id; name = v2.name; ip = v2.ip; rating = v2.rating;
            tags = v2.tags; imageUrl = v2.imageUrl; description = v2.description;
            ytVideoUrl = v2.ytVideoUrl; website = null; discordUrl = null;
            version = null; maxPlayers = null; location = null;
            gameMode = null; status = null; createdAt = v2.createdAt;
          });
        };
      };
      migratedV2 := true;
    };
  };

  func runMigrationV3() {
    if (not migratedV3) {
      for (v3 in serversV3.values()) {
        if (serversV4.get(v3.id) == null) {
          serversV4.add(v3.id, {
            id = v3.id; name = v3.name; ip = v3.ip; rating = v3.rating;
            tags = v3.tags; imageUrl = v3.imageUrl; description = v3.description;
            ytVideoUrl = v3.ytVideoUrl; website = v3.website;
            discordUrl = v3.discordUrl; version = v3.version;
            maxPlayers = v3.maxPlayers; location = v3.location;
            gameMode = v3.gameMode; status = v3.status;
            createdAt = v3.createdAt;
            featured = false;
            serverType = "Cracked";
          });
        };
      };
      migratedV3 := true;
    };
  };

  system func postupgrade() {
    runMigrationV1();
    runMigrationV2();
    runMigrationV3();
  };

  func updateTimestamp() { lastUpdated := Time.now(); };

  // ── Query functions ───────────────────────────────────────────────────────
  public query func getServers() : async [Server] {
    serversV4.values().toArray();
  };

  public query func getAnnouncement() : async Text { announcement; };

  public query func getSiteSettings() : async SiteSettings { siteSettings; };

  public query func getReviews(serverId : Text) : async [Review] {
    reviews.values().filter(func(r) { r.serverId == serverId }).toArray();
  };

  public query func getLastUpdated() : async Int { lastUpdated; };

  public query func getSubmissionsEnabled() : async Bool { submissionsEnabled; };

  public query func getPendingSubmissions() : async [UserSubmission] {
    submissions.values().filter(func(s) { s.submissionStatus == "pending" }).toArray();
  };

  // ── Mutation functions ────────────────────────────────────────────────────
  public shared func addServer(server : Server) : async () {
    updateTimestamp();
    serversV4.add(server.id, {
      server with rating = 0; createdAt = Time.now().toText();
    });
  };

  public shared func updateServer(server : Server) : async () {
    updateTimestamp();
    switch (serversV4.get(server.id)) {
      case (null) { () };
      case (?old) {
        serversV4.add(server.id, {
          server with
          rating = switch (server.rating) {
            case (0) { old.rating };
            case (_) { server.rating };
          };
        });
      };
    };
  };

  public shared func deleteServer(id : Text) : async () {
    updateTimestamp();
    serversV4.remove(id);
  };

  public shared func setAnnouncement(text : Text) : async () {
    updateTimestamp();
    announcement := text;
  };

  public shared func saveSiteSettings(settings : SiteSettings) : async () {
    updateTimestamp();
    siteSettings := settings;
  };

  public shared func addReview(review : Review) : async () {
    updateTimestamp();
    reviews.add(review.id, review);
  };

  public shared func deleteReview(_ : Text, reviewId : Text) : async () {
    updateTimestamp();
    reviews.remove(reviewId);
  };

  public shared func setSubmissionsEnabled(enabled : Bool) : async () {
    updateTimestamp();
    submissionsEnabled := enabled;
  };

  public shared func submitServer(submission : UserSubmission) : async () {
    updateTimestamp();
    submissions.add(submission.id, { submission with submissionStatus = "pending" });
  };

  public shared func approveSubmission(id : Text) : async () {
    updateTimestamp();
    switch (submissions.get(id)) {
      case (null) { () };
      case (?sub) {
        submissions.add(id, { sub with submissionStatus = "approved" });
        // Promote to server listing
        serversV4.add("sub_" # id, {
          id = "sub_" # id;
          name = sub.name;
          ip = sub.ip;
          rating = 0;
          tags = [];
          imageUrl = sub.imageUrl;
          description = if (sub.description == "") { null } else { ?sub.description };
          ytVideoUrl = null;
          website = null;
          discordUrl = null;
          version = if (sub.version == "") { null } else { ?sub.version };
          maxPlayers = null;
          location = null;
          gameMode = if (sub.gameMode == "") { null } else { ?sub.gameMode };
          status = null;
          createdAt = sub.submittedAt;
          featured = false;
          serverType = sub.serverType;
        });
      };
    };
  };

  public shared func rejectSubmission(id : Text) : async () {
    updateTimestamp();
    switch (submissions.get(id)) {
      case (null) { () };
      case (?sub) {
        submissions.add(id, { sub with submissionStatus = "rejected" });
      };
    };
  };

  public shared func seedSampleServers() : async () {
    if (serversV4.isEmpty()) {
      let sample : [Server] = [
        {
          id = "1"; name = "Faction Empire"; ip = "faction.empire.cracked";
          rating = 5; tags = ["factions", "pvp"];
          imageUrl = ""; description = ?"Join the ultimate faction wars with custom plugins!";
          ytVideoUrl = null; website = null; discordUrl = null;
          version = ?"1.8-1.20"; maxPlayers = ?200; location = ?"US";
          gameMode = ?"Factions"; status = ?"Online";
          createdAt = Time.now().toText();
          featured = true; serverType = "Cracked";
        },
        {
          id = "2"; name = "Skyblock Legends"; ip = "skyblock.legends.mc";
          rating = 4; tags = ["skyblock", "economy"];
          imageUrl = ""; description = ?"Start your island and conquer the sky!";
          ytVideoUrl = null; website = null; discordUrl = null;
          version = ?"1.19-1.20"; maxPlayers = ?150; location = ?"EU";
          gameMode = ?"Skyblock"; status = ?"Online";
          createdAt = Time.now().toText();
          featured = false; serverType = "Premium";
        },
      ];
      for (s in sample.vals()) { serversV4.add(s.id, s); };
      updateTimestamp();
    };
  };
};
