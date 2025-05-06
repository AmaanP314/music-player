import React from "react";

// Component to display the currently playing song's title and artist
export default function SongInfo({ currentSong, playlistIsEmpty }) {
  // Determine the title and artist to display based on state
  const title =
    currentSong?.title ||
    (playlistIsEmpty ? "Playlist Empty" : "Select or Add a Song");
  const artist =
    currentSong?.artist ||
    (playlistIsEmpty ? "-" : currentSong ? "Select a song" : "-");
  const displayTitle = currentSong?.title || "No song selected"; // Tooltip title

  return (
    <div
      // Use song ID for key to trigger fade-in animation on song change
      key={currentSong?.id || "no-song"}
      className="song-info text-center space-y-1 animate-fade-in min-h-[4rem]" // Ensure minimum height
    >
      <h2
        id="song-title"
        className="text-xl font-semibold truncate text-cyan-50" // Prevent long titles from breaking layout
        title={displayTitle} // Show full title on hover
      >
        {title}
      </h2>
      <p id="artist" className="text-sm text-gray-400">
        {artist}
      </p>
    </div>
  );
}
