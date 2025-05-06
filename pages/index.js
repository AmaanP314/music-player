import React, { useState, useRef, useEffect, useCallback } from "react";

// Import child components
import PlaylistManager from "../components/PlaylistManager";
import SongInfo from "../components/SongInfo";
import ProgressBar from "../components/ProgressBar";
import Controls from "../components/Controls";
import SongList from "../components/SongList";

// The main page component, now acting as the container and state manager
export default function HomePage() {
  // --- State Definitions ---
  const [playlists, setPlaylists] = useState(() => {
    // Load playlists from localStorage on initial render (client-side only)
    if (typeof window !== "undefined") {
      const savedPlaylists = localStorage.getItem("musicPlayerPlaylists");
      try {
        if (savedPlaylists) {
          const parsed = JSON.parse(savedPlaylists);
          if (Array.isArray(parsed)) {
            // Restore playlist structure, ensuring 'songs' is always an array
            return parsed.map((p) => ({
              name: p.name || "Untitled Playlist",
              songs: Array.isArray(p.songs)
                ? p.songs.map((s) => ({
                    title: s.title || "Unknown Title",
                    artist: s.artist || "Unknown Artist",
                    file: null, // ObjectURLs are temporary and not stored
                    id: s.id || `${Date.now()}-${Math.random()}`,
                  }))
                : [],
            }));
          }
        }
      } catch (e) {
        console.error("Failed to parse playlists from localStorage", e);
        localStorage.removeItem("musicPlayerPlaylists"); // Clear corrupted data
      }
    }
    // Default playlist if localStorage is empty or invalid
    return [{ name: "My Music", songs: [] }];
  });

  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0); // Index of the active playlist
  const [currentSongIndex, setCurrentSongIndex] = useState(0); // Index of the active song within the playlist
  const [isPlaying, setIsPlaying] = useState(false); // Playback status
  const [currentTime, setCurrentTime] = useState(0); // Current playback time
  const [duration, setDuration] = useState(0); // Total duration of the current song

  // Ref for the <audio> element
  const audioRef = useRef(null);

  // --- Derived State ---
  // Get the current playlist object based on the index
  const currentPlaylist = playlists[currentPlaylistIndex] || {
    name: "Unknown",
    songs: [],
  };
  // Get the current song object based on the playlist and song index
  const currentSong = currentPlaylist.songs[currentSongIndex]; // Can be undefined

  // --- LocalStorage Persistence ---
  useEffect(() => {
    // Save playlists to localStorage whenever the playlists state changes (client-side only)
    if (typeof window !== "undefined") {
      try {
        // Prepare playlists for saving: only store metadata (name, title, artist, id)
        const savablePlaylists = playlists.map((p) => ({
          name: p.name,
          songs: p.songs.map((s) => ({
            title: s.title,
            artist: s.artist,
            id: s.id,
          })),
        }));
        localStorage.setItem(
          "musicPlayerPlaylists",
          JSON.stringify(savablePlaylists)
        );
      } catch (e) {
        console.error("Failed to save playlists to localStorage", e);
      }
    }
  }, [playlists]); // Re-run effect when playlists array changes

  // --- Playlist Management Callbacks ---
  const handleCreatePlaylist = useCallback(
    (name) => {
      const newPlaylist = { name, songs: [] };
      const newPlaylists = [...playlists, newPlaylist];
      setPlaylists(newPlaylists);
      setCurrentPlaylistIndex(newPlaylists.length - 1); // Select the new playlist
      // Reset player state for the new empty playlist
      setCurrentSongIndex(0);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ""; // Clear audio source
      }
    },
    [playlists]
  ); // Dependency: playlists array

  const handleSelectPlaylist = useCallback(
    (index) => {
      // Prevent unnecessary updates if the same playlist is selected or index is invalid
      if (
        index === currentPlaylistIndex ||
        index < 0 ||
        index >= playlists.length
      ) {
        return;
      }

      setCurrentPlaylistIndex(index);
      const selectedPlaylist = playlists[index];
      // Reset player state when changing playlists
      setCurrentSongIndex(0); // Start from the first song
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      // Load the first song of the newly selected playlist (if any)
      if (audioRef.current) {
        audioRef.current.pause();
        const firstSong = selectedPlaylist?.songs[0];
        if (firstSong?.file) {
          audioRef.current.src = firstSong.file; // Load the file URL
          // Duration will be set by the 'loadedmetadata' event listener
        } else {
          audioRef.current.src = ""; // Clear source if no song or file URL
          console.warn(
            "First song in selected playlist is missing file URL or playlist is empty."
          );
        }
      }
    },
    [currentPlaylistIndex, playlists]
  ); // Dependencies: current index and playlists array

  const handleDeletePlaylist = useCallback(
    (indexToDelete, event) => {
      event.stopPropagation(); // Prevent triggering playlist selection
      if (playlists.length <= 1) {
        alert("Cannot delete the last playlist."); // Prevent deleting the only playlist
        return;
      }
      const deletedPlaylistName = playlists[indexToDelete].name;
      if (
        !confirm(
          `Are you sure you want to delete the playlist "${deletedPlaylistName}"?`
        )
      ) {
        return; // User cancelled deletion
      }

      // Filter out the playlist to delete
      const newPlaylists = playlists.filter(
        (_, index) => index !== indexToDelete
      );

      // Determine the next playlist index to select
      let nextPlaylistIndex = currentPlaylistIndex;
      if (currentPlaylistIndex === indexToDelete) {
        // If deleting the active playlist, select the first one
        nextPlaylistIndex = 0;
      } else if (currentPlaylistIndex > indexToDelete) {
        // If deleting a playlist before the active one, adjust the index
        nextPlaylistIndex = currentPlaylistIndex - 1;
      }
      // If deleting after the active one, the index remains the same

      setPlaylists(newPlaylists); // Update the playlists state

      // If the active playlist index changed, update it and reset the player
      if (nextPlaylistIndex !== currentPlaylistIndex) {
        setCurrentPlaylistIndex(nextPlaylistIndex);
        setCurrentSongIndex(0);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        if (audioRef.current) {
          audioRef.current.pause();
          // Load the first song of the *new* active playlist
          const newCurrentPlaylist = newPlaylists[nextPlaylistIndex];
          audioRef.current.src = newCurrentPlaylist?.songs[0]?.file || "";
        }
      }
    },
    [playlists, currentPlaylistIndex]
  ); // Dependencies: playlists and current index

  // --- Song Management Callbacks ---
  const handleFilesAdded = useCallback(
    (files) => {
      // Ensure a valid playlist is selected
      if (
        currentPlaylistIndex < 0 ||
        currentPlaylistIndex >= playlists.length
      ) {
        alert("Please create or select a valid playlist first!");
        return;
      }

      // Filter for audio files only
      const audioFiles = Array.from(files).filter((file) =>
        file.type.startsWith("audio/")
      );
      if (audioFiles.length === 0) return; // No valid audio files found

      const playlistBeforeUpdate = playlists[currentPlaylistIndex]; // Snapshot before update

      // Create new song objects from the files
      const newSongs = audioFiles.map((file) => {
        let title = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "); // Basic title cleaning
        let artist = "Unknown Artist";
        const parts = title.split(" - "); // Attempt basic "Artist - Title" extraction
        if (parts.length > 1) {
          artist = parts[0].trim();
          title = parts.slice(1).join(" - ").trim();
        }
        return {
          title,
          artist,
          file: URL.createObjectURL(file), // Create temporary URL for playback
          id: `${Date.now()}-${Math.random()}`, // Generate a unique ID
        };
      });

      // Update the playlists state immutably
      const updatedPlaylists = playlists.map((playlist, index) => {
        if (index === currentPlaylistIndex) {
          // Add new songs to the current playlist
          return { ...playlist, songs: [...playlist.songs, ...newSongs] };
        }
        return playlist;
      });
      setPlaylists(updatedPlaylists);

      // If the playlist was empty before adding, load the first new song
      if (
        playlistBeforeUpdate.songs.length === 0 &&
        newSongs.length > 0 &&
        audioRef.current
      ) {
        setCurrentSongIndex(0); // Select the first song
        audioRef.current.src = newSongs[0].file; // Load its source
        // Don't auto-play, just load it.
      }
    },
    [currentPlaylistIndex, playlists]
  ); // Dependencies: current index and playlists

  const handleRemoveSong = useCallback(
    (songIndexToRemove, event) => {
      event.stopPropagation(); // Prevent triggering song playback

      const playlistToUpdate = playlists[currentPlaylistIndex];
      if (!playlistToUpdate?.songs[songIndexToRemove]) return; // Safety check

      const songToRemove = playlistToUpdate.songs[songIndexToRemove];
      if (
        !confirm(`Are you sure you want to remove "${songToRemove.title}"?`)
      ) {
        return; // User cancelled
      }

      // --- Plan state updates ---
      let nextSongIndex = currentSongIndex;
      let shouldStopAndResetPlayer = false;
      let shouldLoadNextSong = false;

      // Create the updated songs array
      const updatedSongs = playlistToUpdate.songs.filter(
        (_, index) => index !== songIndexToRemove
      );

      if (updatedSongs.length === 0) {
        // Playlist becomes empty
        shouldStopAndResetPlayer = true;
        nextSongIndex = 0;
      } else if (songIndexToRemove === currentSongIndex) {
        // Removing the currently selected/playing song
        shouldStopAndResetPlayer = true; // Stop current playback
        shouldLoadNextSong = true; // Load the next song in sequence
        // Determine the index of the song that should become current
        nextSongIndex =
          songIndexToRemove >= updatedSongs.length ? 0 : songIndexToRemove;
      } else if (songIndexToRemove < currentSongIndex) {
        // Removing a song *before* the current one, adjust index
        nextSongIndex = currentSongIndex - 1;
      }
      // If removing *after* the current one, index remains the same

      // --- Apply state updates ---
      const updatedPlaylists = playlists.map((playlist, index) => {
        if (index === currentPlaylistIndex) {
          return { ...playlist, songs: updatedSongs };
        }
        return playlist;
      });

      setPlaylists(updatedPlaylists); // Update playlists first
      setCurrentSongIndex(nextSongIndex); // Update the song index

      // Update the audio player state if needed
      if (shouldStopAndResetPlayer && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        setCurrentTime(0);
        // Load the new song source if necessary, or clear if playlist is empty
        audioRef.current.src = updatedSongs[nextSongIndex]?.file || "";
        if (!updatedSongs[nextSongIndex]) {
          setDuration(0); // Explicitly reset duration if empty
        }
        // Note: isPlaying remains false unless explicitly started again
      }
    },
    [playlists, currentPlaylistIndex, currentSongIndex]
  ); // Dependencies

  // --- Audio Playback Callbacks ---

  // FIX: Define handleTogglePlay *before* handlePlaySong
  const handleTogglePlay = useCallback(() => {
    if (!currentSong || !audioRef.current) return; // No song or audio element

    // Ensure the correct audio source is loaded
    if (!audioRef.current.src && currentSong.file) {
      audioRef.current.src = currentSong.file;
    } else if (audioRef.current.src !== currentSong.file) {
      // If src is wrong (e.g., after removing/adding songs without selecting)
      audioRef.current.src = currentSong.file;
    }

    if (isPlaying) {
      audioRef.current.pause();
      // isPlaying state is set to false by the 'pause' event listener
    } else {
      // Try to play, might need to wait for 'canplay' if src just changed
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false); // Revert state if play fails immediately
      });
      // isPlaying state is set to true by the 'play' event listener
    }
  }, [isPlaying, currentSong]); // Dependencies

  const handlePlaySong = useCallback(
    (index) => {
      const targetPlaylist = playlists[currentPlaylistIndex];
      if (!targetPlaylist?.songs[index]) return; // Song doesn't exist

      if (index === currentSongIndex) {
        // If clicking the already selected song, toggle play/pause
        handleTogglePlay(); // Now handleTogglePlay is defined
      } else {
        // Clicking a different song: select it and start playing
        setCurrentSongIndex(index);
        setIsPlaying(true); // Set intent to play
        // Loading and actual playback is handled by the useEffect hook below
      }
    },
    [currentPlaylistIndex, playlists, currentSongIndex, handleTogglePlay]
  ); // Dependencies

  const handleNextSong = useCallback(() => {
    if (!currentPlaylist || currentPlaylist.songs.length === 0) return;
    // Calculate next index, wrapping around to the beginning
    const nextIndex = (currentSongIndex + 1) % currentPlaylist.songs.length;
    setCurrentSongIndex(nextIndex);
    setIsPlaying(true); // Intend to play the next song
  }, [currentPlaylist, currentSongIndex]); // Dependencies

  const handlePrevSong = useCallback(() => {
    if (!currentPlaylist || currentPlaylist.songs.length === 0) return;
    // Calculate previous index, wrapping around to the end
    const prevIndex =
      (currentSongIndex - 1 + currentPlaylist.songs.length) %
      currentPlaylist.songs.length;
    setCurrentSongIndex(prevIndex);
    setIsPlaying(true); // Intend to play the previous song
  }, [currentPlaylist, currentSongIndex]); // Dependencies

  const handleSeek = useCallback((seekTime) => {
    if (audioRef.current && isFinite(seekTime)) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime); // Update state immediately for responsiveness
    }
  }, []); // No dependencies needed

  // --- Audio Element Effects ---

  // Effect to load/play/pause audio when currentSong or isPlaying state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentSong && currentSong.file) {
      // Load new source only if it's different or wasn't set
      if (audio.src !== currentSong.file) {
        audio.src = currentSong.file;
        // Reset times when source changes
        setCurrentTime(0);
        setDuration(0);
        // If intending to play, pause first to ensure clean state before load
        if (isPlaying && !audio.paused) {
          audio.pause(); // Pause briefly while loading new src
        }
      }

      // Play or pause based on isPlaying state
      if (isPlaying) {
        // Attempt to play. The 'play' event listener will confirm isPlaying=true.
        // 'canplay' listener helps ensure playback starts after src change.
        audio.play().catch((error) => {
          console.error("Error attempting to play song in useEffect:", error);
          setIsPlaying(false); // Correct state if play fails
        });
      } else {
        audio.pause();
      }
    } else {
      // No current song or file URL, ensure player is stopped and reset
      audio.pause();
      audio.src = "";
      setCurrentTime(0);
      setDuration(0);
      if (isPlaying) setIsPlaying(false); // Correct state if it was true
    }
  }, [currentSong, isPlaying]); // Re-run when song or play state changes

  // Effect to set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Event handlers
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => handleNextSong(); // Go to next song when current one ends
    const handlePlay = () => setIsPlaying(true); // Sync state with audio element playing
    const handlePause = () => setIsPlaying(false); // Sync state with audio element paused
    const handleError = (e) => {
      console.error("Audio Error:", e);
      setIsPlaying(false); // Stop playback on error
    };
    // Handle 'canplay': ensures playback starts if isPlaying was set before audio was ready
    const handleCanPlay = () => {
      if (isPlaying && audio.paused) {
        audio.play().catch(handleError);
      }
      // Update duration if it wasn't available on loadedmetadata (e.g., streaming)
      if (
        !isNaN(audio.duration) &&
        isFinite(audio.duration) &&
        audio.duration > 0 &&
        duration !== audio.duration
      ) {
        setDuration(audio.duration);
      }
    };

    // Add event listeners
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay); // Important for robust playback start

    // Cleanup function to remove listeners when component unmounts or dependencies change
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
    };
    // Dependencies: Callbacks and state needed within the listeners
  }, [handleNextSong, isPlaying, duration]);

  // --- Render ---
  return (
    // Main container centering the player
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-800">
      {/* Player card with background, blur, border animation, etc. */}
      <div className="player-container w-full max-w-md bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 space-y-6 border-2 border-transparent rgb-border-anim player-container-background">
        {/* Playlist Management Component */}
        <PlaylistManager
          playlists={playlists}
          currentPlaylistIndex={currentPlaylistIndex}
          onSelectPlaylist={handleSelectPlaylist}
          onCreatePlaylist={handleCreatePlaylist}
          onDeletePlaylist={handleDeletePlaylist}
          onFilesAdded={handleFilesAdded}
        />

        {/* Current Song Information Component */}
        <SongInfo
          currentSong={currentSong}
          playlistIsEmpty={currentPlaylist?.songs.length === 0}
        />

        {/* Progress Bar Component */}
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
        />

        {/* Playback Controls Component */}
        <Controls
          isPlaying={isPlaying}
          onPlayPause={handleTogglePlay}
          onNext={handleNextSong}
          onPrev={handlePrevSong}
          // Disable buttons based on conditions
          isPlayPauseDisabled={!currentSong || !currentSong.file}
          isNextDisabled={!currentPlaylist || currentPlaylist.songs.length < 2}
          isPrevDisabled={!currentPlaylist || currentPlaylist.songs.length < 2}
        />

        {/* Song List Component */}
        <SongList
          songs={currentPlaylist.songs}
          currentSongIndex={currentSongIndex}
          isPlaying={isPlaying}
          onPlaySong={handlePlaySong}
          onRemoveSong={handleRemoveSong}
          playlistName={currentPlaylist.name}
        />

        {/* Hidden Audio Element */}
        <audio ref={audioRef} className="hidden"></audio>
      </div>
    </div>
  );
}
