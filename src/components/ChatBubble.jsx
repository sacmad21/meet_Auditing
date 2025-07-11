import React from "react";
import { useMeeting } from "../contexts/MeetingContext";

const ChatBubble = ({ message }) => {
  const { getColorForSpeaker } = useMeeting();

  const {
    speakerId,
    text,
    translatedText,
    timestamp,
    speakerLabel
  } = message;

  const isUser = speakerId % 2 !== 0;
  const bubbleColor = getColorForSpeaker(speakerId);
  const alignment = isUser ? "flex-end" : "flex-start";

  console.log("[DEBUG] Rendering ChatBubble:", message);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: alignment,
        padding: "4px 12px"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
        <div style={{
          backgroundColor: bubbleColor,
          borderRadius: "16px",
          padding: "10px 14px",
          maxWidth: "80%",
          position: "relative",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
        }}>
          <div style={{
            position: "absolute",
            bottom: 0,
            [isUser ? 'right' : 'left']: "-8px",
            width: 0,
            height: 0,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            [isUser ? 'borderLeft' : 'borderRight']: `8px solid ${bubbleColor}`
          }} />

          <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 4 }}>
            {speakerLabel}
          </div>

          <div style={{ fontSize: "1rem", fontWeight: 500, color: "#111" }}>
            {translatedText || text}
          </div>

          {translatedText && (
            <div style={{ fontSize: "0.9rem", fontStyle: "italic", color: "#555", marginTop: 4 }}>
              ({text})
            </div>
          )}

          <div style={{ fontSize: "0.7rem", color: "#999", textAlign: "right", marginTop: 6 }}>
            {timestamp}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
