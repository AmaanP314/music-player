import React, { useRef } from "react";

// Component for the audio progress bar and time display
export default function ProgressBar({
  currentTime,
  duration,
  onSeek, // Callback function when user clicks/drags on the progress bar
}) {
  // Ref for the progress bar container to calculate click position
  const progressContainerRef = useRef(null);

  // Utility function to format time in M:SS format
  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate the progress percentage
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  // Handle clicks on the progress bar to seek
  const handleSeek = (e) => {
    if (!onSeek || !progressContainerRef.current || !duration || duration <= 0)
      return;

    const container = progressContainerRef.current;
    const rect = container.getBoundingClientRect();
    // Calculate click position relative to the container start
    const x = e.clientX - rect.left;
    // Calculate the percentage clicked, clamping between 0 and 1
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    // Calculate the target time based on percentage and duration
    const seekTime = percentage * duration;

    // Call the parent's seek handler if the time is valid
    if (isFinite(seekTime)) {
      onSeek(seekTime);
    }
  };

  return (
    <div className="space-y-1.5">
      {/* Progress bar container */}
      <div
        ref={progressContainerRef}
        className="progress-container bg-gray-600/50 h-2 rounded-full cursor-pointer group relative"
        onClick={handleSeek} // Seek on click
        title="Seek"
      >
        {/* Filled portion of the progress bar */}
        <div
          className="progress-bar bg-green-500 h-full rounded-full transition-all duration-100 ease-linear relative"
          style={{ width: `${progressPercent}%` }} // Width driven by progress
        >
          {/* Optional: small glow effect at the end of the progress */}
          <div className="absolute right-0 top-0 bottom-0 w-2 rounded-full bg-green-400/50 blur-sm"></div>
        </div>
      </div>
      {/* Time display (current time / total duration) */}
      <div className="time-display flex justify-between text-xs text-gray-400 px-1">
        <span id="current-time">{formatTime(currentTime)}</span>
        <span id="duration">{formatTime(duration)}</span>
      </div>
    </div>
  );
}
