import React, { createContext, useContext, useState } from "react";
import { getSpeakerColor } from "../utils/speakerColorMap";

const MeetingContext = createContext();

export function MeetingProvider({ children }) {
  const [transcripts, setTranscripts] = useState([]); // { text, speakerId, translatedText, timestamp }
  const [recordingStatus, setRecordingStatus] = useState("idle"); // idle, recording, paused, stopped
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const getSpeakerLabel = (id) => `Speaker ${id + 1}`;
  const getColorForSpeaker = (speakerId) => getSpeakerColor(speakerId);

  const addTranscript = (text, speakerId, translatedText = "") => {
    if (recordingStatus !== "recording") return;

    setTranscripts(prev => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
        text,
        speakerId,
        translatedText,
        timestamp: new Date().toLocaleTimeString(),
        speakerLabel: getSpeakerLabel(speakerId)
      }
    ]);
  };

  const clearTranscripts = () => setTranscripts([]);

  return (
    <MeetingContext.Provider value={{
      transcripts,
      addTranscript,
      clearTranscripts,
      recordingStatus,
      setRecordingStatus,
      selectedLanguage,
      setSelectedLanguage,
      getColorForSpeaker
    }}>
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeeting() {
  return useContext(MeetingContext);
}
