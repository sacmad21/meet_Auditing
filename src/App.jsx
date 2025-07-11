import React, { useState } from "react";
import ControlPanel from "./components/ControlPanel";
import LanguageSelector from "./components/LanguageSelector";
import ChatWindow from "./components/ChatWindow";
import TranscriptionHandler from "./components/TranscriptionHandler";

function App() {
  const [audioUrl, setAudioUrl] = useState(null);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#e5ddd5",
        fontFamily: "Segoe UI, Roboto, Arial, sans-serif"
      }}
    >
      {/* Start/Pause/Stop/Play buttons */}
      <ControlPanel audioUrl={audioUrl} />

      {/* Language dropdown */}
      <LanguageSelector />

      {/* Chat messages window */}
      <ChatWindow />

      {/* Azure Transcription + AudioRecorder logic */}
      <TranscriptionHandler onAudioReady={(url) => setAudioUrl(url)} />
    </div>
  );
}

export default App;
