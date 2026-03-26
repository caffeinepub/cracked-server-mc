import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Migration "migration";
import Iter "mo:core/Iter";

(with migration = Migration.run)
actor {
  type Server = {
    id : Text;
    name : Text;
    ip : Text;
    rating : Nat;
    tags : [Text];
    imageUrl : Text;
    description : ?Text;
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

  let servers = Map.empty<Text, Server>();
  let reviews = Map.empty<Text, Review>();

  var announcement : Text = "Welcome to Cracked Server MC!";
  var siteSettings : SiteSettings = { heroSubtitle = "DISCORD INTEGRATED CRACKED SERVERS" };
  var lastUpdated : Int = Time.now();

  func updateTimestamp() {
    lastUpdated := Time.now();
  };

  public query ({ caller }) func getServers() : async [Server] {
    servers.values().toArray();
  };

  public query ({ caller }) func getAnnouncement() : async Text {
    announcement;
  };

  public query ({ caller }) func getSiteSettings() : async SiteSettings {
    siteSettings;
  };

  public query ({ caller }) func getReviews(serverId : Text) : async [Review] {
    reviews.values().filter(
      func(review) {
        review.serverId == serverId;
      }
    ).toArray();
  };

  public query ({ caller }) func getLastUpdated() : async Int {
    lastUpdated;
  };

  public shared ({ caller }) func addServer(server : Server) : async () {
    updateTimestamp();
    let newServer : Server = {
      server with
      rating = 0;
      createdAt = Int.toText(Time.now());
    };
    servers.add(server.id, newServer);
  };

  public shared ({ caller }) func updateServer(server : Server) : async () {
    updateTimestamp();
    let existing = servers.get(server.id);
    switch (existing) {
      case (null) { () };
      case (?oldServer) {
        let updatedServer : Server = {
          server with
          rating = switch (server.rating) {
            case (0) { oldServer.rating };
            case (_) { server.rating };
          };
        };
        servers.add(server.id, updatedServer);
      };
    };
  };

  public shared ({ caller }) func deleteServer(id : Text) : async () {
    updateTimestamp();
    servers.remove(id);
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
    if (servers.isEmpty()) {
      let sampleServers = [
        {
          id = "1";
          name = "Faction Empire";
          ip = "faction.empire.cracked";
          rating = 5;
          tags = ["factions", "survival", "pvp"];
          imageUrl = "https://factions.com/assets/FAQ.png";
          description = ? "Join the ultimate faction wars with custom plugins!";
          createdAt = Int.toText(Time.now());
        },
        {
          id = "2";
          name = "Skyblock Legends";
          ip = "skyblock.legends.mc";
          rating = 4;
          tags = ["skyblock", "economy", "telecoins"];
          imageUrl = "https://factions.com/assets/FAQ.png";
          description = ? "Start your island and conquer the sky!";
          createdAt = Int.toText(Time.now());
        },
      ];
      let moreSampleServers = Array.tabulate(
        8,
        func(i) {
          {
            id = (i + 3).toText();
            name = "Server " # (i + 3).toText();
            ip = "server" # (i + 3).toText() # ".mc";
            rating = 3;
            tags = ["survival"];
            imageUrl = "https://factions.com/assets/FAQ.png";
            description = null;
            createdAt = Int.toText(Time.now());
          };
        },
      );
      let allServers = sampleServers.concat(moreSampleServers);
      for (server in allServers.values()) {
        servers.add(server.id, server);
      };
      updateTimestamp();
    };
  };
};
