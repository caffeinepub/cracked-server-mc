import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";

actor {

  // ── Legacy type (V1) kept for stable-variable migration ──────────────────
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

  // ── Current type (V2) ─────────────────────────────────────────────────────
  type Server = {
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
  // `servers` keeps the old V1 shape so existing data loads without error.
  // `serversV2` holds the migrated / new Server records.
  let servers    = Map.empty<Text, ServerV1>();
  let serversV2  = Map.empty<Text, Server>();
  let reviews    = Map.empty<Text, Review>();

  var announcement  : Text          = "Welcome to Cracked Server MC!";
  var siteSettings  : SiteSettings  = { heroSubtitle = "DISCORD INTEGRATED CRACKED SERVERS" };
  var lastUpdated   : Int            = Time.now();
  var migratedV1    : Bool           = false;

  // ── One-time migration helper ─────────────────────────────────────────────
  func runMigration() {
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

  system func postupgrade() {
    runMigration();
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  func updateTimestamp() {
    lastUpdated := Time.now();
  };

  // ── Query functions ───────────────────────────────────────────────────────
  public query ({ caller }) func getServers() : async [Server] {
    serversV2.values().toArray();
  };

  public query ({ caller }) func getAnnouncement() : async Text {
    announcement;
  };

  public query ({ caller }) func getSiteSettings() : async SiteSettings {
    siteSettings;
  };

  public query ({ caller }) func getReviews(serverId : Text) : async [Review] {
    reviews.values().filter(
      func(review) { review.serverId == serverId }
    ).toArray();
  };

  public query ({ caller }) func getLastUpdated() : async Int {
    lastUpdated;
  };

  // ── Mutation functions ────────────────────────────────────────────────────
  public shared ({ caller }) func addServer(server : Server) : async () {
    updateTimestamp();
    serversV2.add(server.id, {
      server with
      rating    = 0;
      createdAt = Int.toText(Time.now());
    });
  };

  public shared ({ caller }) func updateServer(server : Server) : async () {
    updateTimestamp();
    switch (serversV2.get(server.id)) {
      case (null) { () };
      case (?old) {
        serversV2.add(server.id, {
          server with
          rating = switch (server.rating) {
            case (0) { old.rating };
            case (_) { server.rating };
          };
        });
      };
    };
  };

  public shared ({ caller }) func deleteServer(id : Text) : async () {
    updateTimestamp();
    serversV2.remove(id);
  };

  public shared ({ caller }) func setAnnouncement(text : Text) : async () {
    updateTimestamp();
    announcement := text;
  };

  public shared ({ caller }) func saveSiteSettings(settings : SiteSettings) : async () {
    updateTimestamp();
    siteSettings := settings;
  };

  public shared ({ caller }) func addReview(review : Review) : async () {
    updateTimestamp();
    reviews.add(review.id, review);
  };

  public shared ({ caller }) func deleteReview(serverId : Text, reviewId : Text) : async () {
    updateTimestamp();
    reviews.remove(reviewId);
  };

  public shared ({ caller }) func seedSampleServers() : async () {
    if (serversV2.isEmpty()) {
      let sample : [Server] = [
        {
          id = "1"; name = "Faction Empire"; ip = "faction.empire.cracked";
          rating = 5; tags = ["factions", "survival", "pvp"];
          imageUrl = ""; description = ?"Join the ultimate faction wars with custom plugins!";
          ytVideoUrl = null; createdAt = Int.toText(Time.now());
        },
        {
          id = "2"; name = "Skyblock Legends"; ip = "skyblock.legends.mc";
          rating = 4; tags = ["skyblock", "economy", "telecoins"];
          imageUrl = ""; description = ?"Start your island and conquer the sky!";
          ytVideoUrl = null; createdAt = Int.toText(Time.now());
        },
      ];
      let more = Array.tabulate(8, func(i : Nat) : Server {
        {
          id = (i + 3).toText(); name = "Server " # (i + 3).toText();
          ip = "server" # (i + 3).toText() # ".mc";
          rating = 3; tags = ["survival"]; imageUrl = "";
          description = null; ytVideoUrl = null;
          createdAt = Int.toText(Time.now());
        };
      });
      for (s in sample.vals()) { serversV2.add(s.id, s); };
      for (s in more.vals())   { serversV2.add(s.id, s); };
      updateTimestamp();
    };
  };
};
