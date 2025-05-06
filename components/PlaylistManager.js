import React, { useState, useRef } from "react";
import { UploadCloud, ListMusic, X } from "lucide-react";

// Component responsible for creating, selecting, deleting playlists and uploading files
export default function PlaylistManager({
  playlists,
  currentPlaylistIndex,
  onSelectPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
  onFilesAdded, // Callback to notify parent about added files
}) {
  // Local state for the new playlist name input
  const [newPlaylistName, setNewPlaylistName] = useState("");
  // Local state for drag-and-drop visual feedback
  const [isDragging, setIsDragging] = useState(false);
  // Ref for the hidden file input
  const fileInputRef = useRef(null);

  // Handler for creating a new playlist
  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName.trim());
      setNewPlaylistName(""); // Clear input after creation
    }
  };

  // --- File Handling ---
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(e.target.files); // Pass files to parent
      e.target.value = null; // Reset file input
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(e.dataTransfer.files); // Pass dropped files to parent
      e.dataTransfer.clearData(); // Clear drag data
    }
  };

  // Programmatically trigger the file input click
  const triggerFileInput = () => {
    // Only trigger if a valid playlist is selected
    if (currentPlaylistIndex >= 0 && currentPlaylistIndex < playlists.length) {
      fileInputRef.current?.click();
    } else {
      alert("Please select or create a playlist first.");
    }
  };

  return (
    <div className="playlist-management space-y-4">
      {/* Section Title */}
      <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2 border-b border-gray-700 pb-2 mb-3">
        <ListMusic size={20} strokeWidth={2} /> Playlists
      </h3>

      {/* Playlist Creation Input and Button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleCreatePlaylist()} // Allow Enter key submission
          placeholder="New playlist name"
          className="flex-grow text-cyan-50 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-400"
        />
        <button
          onClick={handleCreatePlaylist}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed shadow hover:shadow-md"
          disabled={!newPlaylistName.trim()} // Disable if input is empty
        >
          Create
        </button>
      </div>

      {/* Display Playlist Tags */}
      <div className="flex flex-wrap gap-2 pt-2">
        {playlists.map((playlist, index) => (
          <div
            key={index}
            onClick={() => onSelectPlaylist(index)} // Select playlist on click
            className={`relative group px-3 py-1 rounded-full cursor-pointer text-xs font-medium transition-all duration-200 ease-in-out border ${
              index === currentPlaylistIndex
                ? "bg-green-500 text-white border-green-500 shadow-md scale-105" // Active style
                : "bg-gray-700/60 border-gray-600/80 hover:bg-gray-600/80 hover:border-gray-500" // Inactive style
            }`}
          >
            {playlist.name}
            {/* Show delete button only if there's more than one playlist */}
            {playlists.length > 1 && (
              <button
                onClick={(e) => onDeletePlaylist(index, e)} // Delete playlist on click
                className={`absolute -top-1.5 -right-1.5 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700 hover:scale-110 ${
                  index === currentPlaylistIndex ? "opacity-100" : "" // Make visible if active
                }`}
                aria-label={`Delete playlist ${playlist.name}`}
                title={`Delete playlist ${playlist.name}`}
              >
                <X size={10} strokeWidth={3} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* File Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput} // Trigger file input on click
        className={`upload-container border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all duration-300 ease-in-out ${
          isDragging
            ? "border-green-500 bg-green-900/30 scale-105" // Dragging style
            : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/30" // Default style
        } ${
          // Add disabled style if no playlist is selected
          currentPlaylistIndex < 0 || currentPlaylistIndex >= playlists.length
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
      >
        {/* Hidden actual file input */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={
            currentPlaylistIndex < 0 || currentPlaylistIndex >= playlists.length
          } // Disable if no valid playlist
        />
        {/* Visual cue for upload */}
        <UploadCloud
          size={28}
          className={`mx-auto mb-2 transition-colors duration-300 ${
            isDragging ? "text-green-400" : "text-gray-500"
          }`}
        />
        <p className="text-xs text-gray-400">
          {isDragging
            ? "Drop files to add to playlist"
            : "Drag & drop audio files or "}
          {/* Make "click to upload" part interactive */}
          <span className="text-green-400 font-medium hover:underline">
            {!isDragging && "click to upload"}
          </span>
        </p>
        {/* Show warning if no playlist is selected */}
        {(currentPlaylistIndex < 0 ||
          currentPlaylistIndex >= playlists.length) &&
          !isDragging && (
            <p className="text-xs text-red-400 mt-2">
              Select or create a playlist first.
            </p>
          )}
      </div>
    </div>
  );
}
