import React from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

// Component for playback control buttons (Prev, Play/Pause, Next)
export default function Controls({
  isPlaying,
  onPlayPause, // Function to toggle play/pause
  onNext, // Function to go to the next song
  onPrev, // Function to go to the previous song
  isNextDisabled, // Boolean to disable the 'Next' button
  isPrevDisabled, // Boolean to disable the 'Previous' button
  isPlayPauseDisabled, // Boolean to disable the 'Play/Pause' button
}) {
  return (
    <div className="controls flex justify-center items-center gap-6">
      {/* Previous Song Button */}
      <button
        onClick={onPrev}
        title="Previous Song"
        className="text-gray-400 hover:text-white transition duration-200 ease-in-out transform hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
        disabled={isPrevDisabled} // Disable based on prop
      >
        <SkipBack size={22} strokeWidth={1.5} />
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        title={isPlaying ? "Pause" : "Play"}
        className={`bg-gradient-to-br from-green-500 to-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:bg-gradient-to-br disabled:from-gray-600 disabled:to-gray-700`}
        disabled={isPlayPauseDisabled} // Disable based on prop
      >
        {/* Animate icon change */}
        <div key={isPlaying ? "pause" : "play"} className="animate-pop-in">
          {isPlaying ? (
            <Pause size={24} />
          ) : (
            // Add slight margin-left to center the play icon visually
            <Play size={24} className="ml-1" />
          )}
        </div>
      </button>

      {/* Next Song Button */}
      <button
        onClick={onNext}
        title="Next Song"
        className="text-gray-400 hover:text-white transition duration-200 ease-in-out transform hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
        disabled={isNextDisabled} // Disable based on prop
      >
        <SkipForward size={22} strokeWidth={1.5} />
      </button>
    </div>
  );
}
