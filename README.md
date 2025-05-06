# Music Player

## Overview:

**Music Player Web App** is a modern, interactive music player built using **Next.js** and **Tailwind CSS**. The app allows users to play music from their local device, create and manage custom playlists, and enjoy a seamless music experience with intuitive controls. Whether you're looking to play a single track or curate a personalized playlist, this app provides a sleek, user-friendly interface that makes listening to music online a breeze.

Key features include the ability to drag and drop music files into the player, upload files from your local directory, and control playback with ease—whether you’re skipping to the next song, rewinding, or pausing. All of this is wrapped in a modern UI that’s responsive and visually appealing, making it a great option for users looking for a lightweight but feature-rich music player.

## How the Code Works:

The application is structured with a clean separation of concerns, following Next.js conventions for components and pages. Here's how it works:

1. **Components**:
   The core functionality of the app is split into various React components under the `components/` directory. These include:

   - **Controls.js**: Manages playback controls such as play, pause, rewind, and fast forward.
   - **PlaylistManager.js**: Handles playlist creation, editing, and file management.
   - **ProgressBar.js**: Displays the song’s current position and allows users to seek through the track.
   - **SongInfo.js**: Shows metadata about the current song, such as title and artist.
   - **SongList.js**: Displays a list of songs in the playlist, allowing users to select and play individual tracks.

2. **Pages**:

   - **\_app.js**: Sets up the app-wide settings, including global state and layout management.
   - **index.js**: The home page, where the music player interface is rendered. Here, users can see their playlist, control playback, and interact with the UI.

3. **Public Folder**:
   The `public/` directory contains SVG assets for the UI, such as icons and logos.

4. **Styling**:

   - **globals.css**: Global styles for the app, using Tailwind's utility-first approach for styling.
   - **tailwind.config.js**: Configuration file for Tailwind CSS, which can be customized to fit the design and color scheme of the app.

The app operates with a clean and modular structure, where each component handles a distinct piece of functionality, making it easy to maintain and scale. State management for music playback (e.g., current song, play status, etc.) is likely handled in a global or parent component.

## Features:

- **Drag and Drop Music Upload**: Users can drag music files directly into the app for easy import and playback.
- **Custom Playlist Creation**: Create and manage playlists by adding songs of choice.
- **Song Metadata Display**: See detailed information about the currently playing track, such as title and artist.
- **Responsive UI**: The app’s interface adjusts beautifully to different screen sizes, ensuring a smooth user experience across devices.
- **Playback Controls**:

  - Play, pause, rewind, and fast forward.
  - Adjust the progress of the song through a seekable progress bar.

- **Interactive Song List**: Browse through the songs in your playlist and switch between tracks easily.
- **Tailwind CSS Styling**: The app features a sleek, modern design built using Tailwind, offering a polished, professional look with minimal effort.

## Usage:

1. **Running the App**:
   To get started, clone this repository and install the necessary dependencies:

   ```bash
   git clone https://github.com/AmaanP314/music-player.git
   cd music-player
   npm install
   npm run dev
   ```

   Open your browser and navigate to `http://localhost:3000` to start using the music player.

2. **Uploading Music**:

   - Drag and drop music files directly into the app or click to select from your local directory.
   - Once a song is uploaded, it will appear in the playlist.

3. **Controlling Playback**:

   - Use the play/pause button to start or stop playback.
   - Skip to the next or previous song using the forward and rewind buttons.
   - Adjust the song’s progress by interacting with the progress bar.

4. **Creating Playlists**:

   - Create a playlist by adding songs through the PlaylistManager component.
   - Organize your music and play it as a collection.

## Technologies Used | Tech Stack:

- **Next.js**: A React framework that enables server-side rendering and static site generation for fast performance and SEO.
- **Tailwind CSS**: A utility-first CSS framework used for fast and flexible styling.
- **React**: A JavaScript library for building user interfaces.
- **JavaScript (ES6+)**: The primary language for building the app, enabling modern features such as modules, async/await, and arrow functions.

Additionally, the app relies on React hooks for managing state and effects and ensures a smooth user experience with features like audio controls, playlist management, and real-time playback updates.

## Live App:

**[Music Player](https://music-player-ap.vercel.app/)**
