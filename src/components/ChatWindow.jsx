import React, { useEffect, useRef } from "react";
import { useMeeting } from "../contexts/MeetingContext";
import ChatBubble from "./ChatBubble";

const ChatWindow = () => {
  const { transcripts } = useMeeting();
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  return (
    <div
      ref={scrollRef}
      style={{
        flexGrow: 1,
        overflowY: "auto",
        backgroundColor: "#ece5dd",
        backgroundImage: "url('https://www.transparenttextures.com/patterns/white-wall-3.png')",
        backgroundRepeat: "repeat",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        borderTop: "1px solid #ccc",
        borderBottom: "1px solid #ccc"
      }}
    >
      {transcripts.length === 0 ? (
        <div style={{ color: "#999", fontStyle: "italic", textAlign: "center", marginTop: "2rem" }}>
          Waiting for transcription…
        </div>
      ) : (
        transcripts.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))
      )}
    </div>
  );
};

export default ChatWindow;
