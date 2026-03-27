import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";


actor {

  // ── Legacy type (V1) ─────────────────────────────────────────────────────
  type ServerV1 = {
    id : Text;
    name : Text;
    ip : Text;
    rating : Nat;
    tags : [Text];
    imageUrl : Text;
    description : ?Text;
    createdAt : Text;
  };

  // ── V2 type ───────────────────────────────────────────────────────────────
  type ServerV2 = {
    id : Text;
    name : Text;
    ip : Text;
    rating : Nat;
    tags : [Text];
    imageUrl : Text;
    description : ?Text;
    ytVideoUrl : ?Text;
    createdAt : Text;
  };

  // ── Current type (V3) ────────────────────────────────────────────────────
  type Server = {
    id : Text;
    name : Text;
    ip : Text;
    rating : Nat;
    tags : [Text];
    imageUrl : Text;
    description : ?Text;
    ytVideoUrl : ?Text;
    website : ?Text;
    discordUrl : ?Text;
    version : ?Text;
    maxPlayers : ?Nat;
    location : ?Text;
    gameMode : ?Text;
    status : ?Text;
    createdAt : Text;
  };

  type SiteSettings = {
    heroSubtitle : Text;
  };

  type Review = {
    id : Text;
    serverId : Text;
    name : Text;
    text : Text;
    date : Text;
  };

  // ── Stable storage ────────────────────────────────────────────────────────
  let servers    = Map.empty<Text, ServerV1>();
  let serversV2  = Map.empty<Text, ServerV2>();
  let serversV3  = Map.empty<Text, Server>();
  let reviews    = Map.empty<Text, Review>();

  var announcement  : Text          = "Welcome to Cracked Server MC!";
  var siteSettings  : SiteSettings  = { heroSubtitle = "DISCORD INTEGRATED CRACKED SERVERS" };
  var lastUpdated   : Int            = Time.now();
  var migratedV1    : Bool           = false;
  var migratedV2    : Bool           = false;

  // ── Migration helpers ─────────────────────────────────────────────────────
  func runMigrationV1() {
    if (not migratedV1) {
      for (v1 in servers.values()) {
        if (serversV2.get(v1.id) == null) {
          serversV2.add(v1.id, {
            id          = v1.id;
            name        = v1.name;
            ip          = v1.ip;
            rating      = v1.rating;
            tags        = v1.tags;
            imageUrl    = v1.imageUrl;
            description = v1.description;
            ytVideoUrl  = null;
            createdAt   = v1.createdAt;
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
            id          = v2.id;
            name        = v2.name;
            ip          = v2.ip;
            rating      = v2.rating;
            tags        = v2.tags;
            imageUrl    = v2.imageUrl;
            description = v2.description;
            ytVideoUrl  = v2.ytVideoUrl;
            website     = null;
            discordUrl  = null;
            version     = null;
            maxPlayers  = null;
            location    = null;
            gameMode    = null;
            status      = null;
            createdAt   = v2.createdAt;
          });
        };
      };
      migratedV2 := true;
    };
  };

  system func postupgrade() {
    runMigrationV1();
    runMigrationV2();
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  func updateTimestamp() {
    lastUpdated := Time.now();
  };

  // ── Query functions ───────────────────────────────────────────────────────
  public query func getServers() : async [Server] {
    serversV3.values().toArray();
  };

  public query func getAnnouncement() : async Text {
    announcement;
  };

  public query func getSiteSettings() : async SiteSettings {
    siteSettings;
  };

  public query func getReviews(serverId : Text) : async [Review] {
    reviews.values().filter(
      func(review) { review.serverId == serverId }
    ).toArray();
  };

  public query func getLastUpdated() : async Int {
    lastUpdated;
  };

  // ── Mutation functions ────────────────────────────────────────────────────
  public shared func addServer(server : Server) : async () {
    updateTimestamp();
    serversV3.add(server.id, {
      server with
      rating    = 0;
      createdAt = Time.now().toText();
    });
  };

  public shared func updateServer(server : Server) : async () {
    updateTimestamp();
    switch (serversV3.get(server.id)) {
      case (null) { () };
      case (?old) {
        serversV3.add(server.id, {
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
    serversV3.remove(id);
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

  public shared func seedSampleServers() : async () {
    if (serversV3.isEmpty()) {
      let sample : [Server] = [
        {
          id = "1"; name = "Faction Empire"; ip = "faction.empire.cracked";
          rating = 5; tags = ["factions", "survival", "pvp"];
          imageUrl = ""; description = ?"Join the ultimate faction wars with custom plugins!";
          ytVideoUrl = null; website = null; discordUrl = null;
          version = ?"1.8-1.20"; maxPlayers = ?200; location = ?"US";
          gameMode = ?"Factions"; status = ?"Online";
          createdAt = Time.now().toText();
        },
        {
          id = "2"; name = "Skyblock Legends"; ip = "skyblock.legends.mc";
          rating = 4; tags = ["skyblock", "economy"];
          imageUrl = ""; description = ?"Start your island and conquer the sky!";
          ytVideoUrl = null; website = null; discordUrl = null;
          version = ?"1.19-1.20"; maxPlayers = ?150; location = ?"EU";
          gameMode = ?"Skyblock"; status = ?"Online";
          createdAt = Time.now().toText();
        },
      ];
      let more = Array.tabulate(8, func(i : Nat) : Server {
        {
          id = (i + 3).toText(); name = "Server " # (i + 3).toText();
          ip = "server" # (i + 3).toText() # ".mc";
          rating = 3; tags = ["survival"]; imageUrl = "";
          description = null; ytVideoUrl = null; website = null;
          discordUrl = null; version = null; maxPlayers = null;
          location = null; gameMode = null; status = null;
          createdAt = Time.now().toText();
        };
      });
      for (s in sample.vals()) { serversV3.add(s.id, s); };
      for (s in more.vals())   { serversV3.add(s.id, s); };
      updateTimestamp();
    };
  };
};
