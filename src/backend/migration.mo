import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
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

  type OldActor = {}; // empty old actor

  type NewActor = {
    servers : Map.Map<Text, Server>;
    announcement : Text;
    siteSettings : SiteSettings;
    reviews : Map.Map<Text, Review>;
    lastUpdated : Int;
  };

  public func run(_ : OldActor) : NewActor {
    {
      servers = Map.empty<Text, Server>();
      announcement = "Welcome to Cracked Server MC!";
      siteSettings = { heroSubtitle = "DISCORD INTEGRATED CRACKED SERVERS" };
      reviews = Map.empty<Text, Review>();
      lastUpdated = Time.now();
    };
  };
};
