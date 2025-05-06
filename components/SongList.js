import React from "react";
import { Music2, Trash2 } from "lucide-react";

// Component to display the list of songs in the current playlist
export default function SongList({
  songs, // Array of song objects in the current playlist
  currentSongIndex, // Index of the currently selected/playing song
  isPlaying, // Boolean indicating if audio is currently playing
  onPlaySong, // Callback when a song item is clicked (to play/select it)
  onRemoveSong, // Callback when the remove button is clicked
  playlistName, // Name of the current playlist (used for empty message)
}) {
  // If no songs, display an empty state message
  if (!songs || songs.length === 0) {
    return (
      <div className="playlist-container max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600/70 scrollbar-track-gray-700/50 pr-1">
        <div className="text-center text-gray-500 text-sm py-6">
          Playlist "{playlistName}" is empty. Add some songs!
        </div>
      </div>
    );
  }

  return (
    // Container for the song list with scrolling
    <div className="playlist-container max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600/70 scrollbar-track-gray-700/50 pr-1 space-y-1.5">
      {songs.map((song, index) => (
        <div
          // Use song ID or index as key for React list rendering
          key={song.id || `${playlistName}-${index}`}
          onClick={() => onPlaySong(index)} // Trigger play/select on click
          // Dynamic classes for styling based on selection and hover state
          className={`group px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out text-sm flex justify-between items-center relative overflow-hidden ${
            index === currentSongIndex
              ? "bg-green-600/30 text-green-100 font-medium shadow-inner" // Active song style
              : "hover:bg-gray-700/60 text-gray-300 hover:text-white" // Inactive song style
          }`}
        >
          {/* Left side: Icon, Title, Artist */}
          <div className="flex items-center gap-2 truncate mr-4">
            {/* Music Icon */}
            <Music2
              size={14}
              className={`flex-shrink-0 transition-colors ${
                index === currentSongIndex
                  ? "text-green-300" // Active color
                  : "text-gray-500 group-hover:text-gray-400" // Inactive color
              }`}
            />
            {/* Song Title (truncated) */}
            <span
              className="truncate"
              title={`${song.title} - ${song.artist}`} // Show full info on hover
            >
              {song.title}
            </span>
            {/* Artist (truncated, hidden on small screens) */}
            <span className="text-gray-400 text-xs truncate hidden sm:inline">
              - {song.artist}
            </span>
          </div>

          {/* Right side: Playing indicator and Remove button */}
          <div className="flex items-center flex-shrink-0">
            {/* Show playing indicator only for the current song */}
            {index === currentSongIndex && (
              <div
                // Fade in/out based on playing state
                className={`mr-2 transition-opacity duration-300 ${
                  isPlaying ? "opacity-100" : "opacity-50"
                }`}
              >
                {/* Animated sound bars */}
                <div className="flex items-end h-3 space-x-0.5">
                  <span
                    className={`w-0.5 ${
                      isPlaying ? "animate-bar1" : "h-1" // Animate if playing, static height if paused
                    } bg-green-400`}
                  ></span>
                  <span
                    className={`w-0.5 ${
                      isPlaying ? "animate-bar2" : "h-2"
                    } bg-green-400`}
                  ></span>
                  <span
                    className={`w-0.5 ${
                      isPlaying ? "animate-bar3" : "h-1"
                    } bg-green-400`}
                  ></span>
                </div>
              </div>
            )}
            {/* Remove Song Button (appears on hover) */}
            <button
              onClick={(e) => onRemoveSong(index, e)} // Trigger remove callback
              className="p-1 text-gray-500 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100 absolute right-1 top-1/2 transform -translate-y-1/2 bg-gray-700/50 hover:bg-gray-600/80 rounded-md"
              title={`Remove ${song.title}`}
              aria-label={`Remove ${song.title}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
