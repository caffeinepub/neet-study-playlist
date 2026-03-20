import Time "mo:core/Time";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";

actor {
  // Data Types
  type Subject = {
    id : Nat;
    name : Text;
    description : Text;
    color : Text;
  };

  type Chapter = {
    id : Nat;
    subjectId : Nat;
    name : Text;
    number : Nat;
    description : Text;
  };

  type Playlist = {
    id : Nat;
    chapterId : Nat;
    name : Text;
    description : Text;
    createdAt : Time.Time;
  };

  type PlaylistItem = {
    id : Nat;
    playlistId : Nat;
    title : Text;
    description : Text;
    resourceUrl : Text;
    notes : Text;
    order : Nat;
    isCompleted : Bool;
  };

  // Storage
  let subjects = Map.empty<Nat, Subject>();
  let chapters = Map.empty<Nat, Chapter>();
  let playlists = Map.empty<Nat, Playlist>();
  let playlistItems = Map.empty<Nat, PlaylistItem>();

  // CRUD Operations
  public shared ({ caller }) func createSubject(_id : Nat, name : Text, desc : Text, color : Text) : async () {
    let subject : Subject = {
      id = _id;
      name;
      description = desc;
      color;
    };
    subjects.add(_id, subject);
  };

  public shared ({ caller }) func createChapter(_id : Nat, subjectId : Nat, name : Text, number : Nat, desc : Text) : async () {
    if (not subjects.containsKey(subjectId)) { Runtime.trap("No subject with subjectId found. ") };

    let chapter : Chapter = {
      id = _id;
      subjectId;
      name;
      number;
      description = desc;
    };
    chapters.add(_id, chapter);
  };

  public shared ({ caller }) func createPlaylist(_id : Nat, chapterId : Nat, name : Text, desc : Text) : async () {
    let playlist : Playlist = {
      id = _id;
      chapterId;
      name;
      description = desc;
      createdAt = Time.now();
    };
    playlists.add(_id, playlist);
  };

  public shared ({ caller }) func createPlaylistItem(_id : Nat, playlistId : Nat, title : Text, desc : Text, resourceUrl : Text, notes : Text, order : Nat) : async () {
    let item : PlaylistItem = {
      id = _id;
      playlistId;
      title;
      description = desc;
      resourceUrl;
      notes;
      order;
      isCompleted = false;
    };
    playlistItems.add(_id, item);
  };

  // Query Filtering Functions
  public query ({ caller }) func getChaptersBySubject(subjectId : Nat) : async [Chapter] {
    chapters.values().toArray().filter(func(chapter) { chapter.subjectId == subjectId });
  };

  public query ({ caller }) func getPlaylistsByChapter(chapterId : Nat) : async [Playlist] {
    playlists.values().toArray().filter(func(playlist) { playlist.chapterId == chapterId });
  };

  public query ({ caller }) func getItemsByPlaylist(playlistId : Nat) : async [PlaylistItem] {
    playlistItems.values().toArray().filter(func(item) { item.playlistId == playlistId });
  };

  // State Update Function
  public shared ({ caller }) func markItemStatus(itemId : Nat, isCompleted : Bool) : async () {
    switch (playlistItems.get(itemId)) {
      case (null) { Runtime.trap("No playlist item with itemId found. ") };
      case (?item) {
        let updatedItem = { item with isCompleted };
        playlistItems.add(itemId, updatedItem);
      };
    };
  };

  // Search Function
  public query ({ caller }) func searchPlaylistsByName(searchText : Text) : async [Playlist] {
    playlists.values().toArray().filter(func(playlist) { playlist.name.contains(#text searchText) });
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Analyze Telegram channel and organize ALL content into subjects, chapters, and playlists
  public shared ({ caller }) func analyzeAndOrganizeTelegram(telegramUrl : Text, geminiApiKey : Text) : async Text {
    let htmlContent = await OutCall.httpGetRequest(telegramUrl, [], transform);

    let geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" # geminiApiKey;

    let prompt = "You are analyzing HTML content from a Telegram study group for NEET exam preparation. Extract ALL lecture/video posts and organize them strictly by subject (Physics, Chemistry, Biology) and then by chapter within each subject. Return ONLY valid JSON in this exact format with no extra text or markdown: {\"subjects\":[{\"name\":\"Physics\",\"description\":\"Physics lectures\",\"color\":\"#3b82f6\",\"chapters\":[{\"name\":\"Laws of Motion\",\"number\":1,\"description\":\"Chapter description\",\"playlists\":[{\"name\":\"Laws of Motion Lectures\",\"description\":\"Video playlist\",\"items\":[{\"title\":\"Lecture title\",\"description\":\"Brief description\",\"resourceUrl\":\"https://t.me/example\",\"order\":1}]}]}]}]} Analyze this Telegram channel HTML and extract all study content: ";

    let escapedHtml = htmlContent.replace(#text "\"", "\\\"");
    let escapedPrompt = prompt.replace(#text "\"", "\\\"");

    let geminiRequestBody = "{\"contents\":[{\"parts\":[{\"text\":\"" # escapedPrompt # " " # escapedHtml # "\"}]}]}";

    await OutCall.httpPostRequest(geminiApiUrl, [{name = "Content-Type"; value = "application/json"}], geminiRequestBody, transform);
  };

  // Legacy single-playlist generator (kept for compatibility)
  public shared ({ caller }) func generatePlaylistFromTelegram(telegramUrl : Text, _chapterId : Nat, geminiApiKey : Text) : async Text {
    let htmlContent = await OutCall.httpGetRequest(telegramUrl, [], transform);
    let geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" # geminiApiKey;
    let prompt = "Extract educational video/lecture titles and organize them as a JSON array with fields: title, description, resourceUrl, order. Return ONLY JSON, no markdown. ";
    let escapedHtml = htmlContent.replace(#text "\"", "\\\"");
    let geminiRequestBody = "{\"contents\":[{\"parts\":[{\"text\":\"" # prompt # escapedHtml # "\"}]}]}";
    await OutCall.httpPostRequest(geminiApiUrl, [{name = "Content-Type"; value = "application/json"}], geminiRequestBody, transform);
  };
};
