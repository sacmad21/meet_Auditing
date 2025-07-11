// import React from "react";
// import { useMeeting } from "../contexts/MeetingContext";

// const ControlPanel = ({ audioUrl }) => {
//     {audioUrl && (
//   <audio
//     src={audioUrl}
//     controls
//     style={{ marginTop: "1rem", width: "100%" }}
//   />
// )}
//   const {
//     recordingStatus,
//     setRecordingStatus,
//     transcripts,
//     clearTranscripts,
//     addTranscript
//   } = useMeeting();

//   const [isPlaying, setIsPlaying] = React.useState(false);
//   const [replayBuffer, setReplayBuffer] = React.useState([]);

//   const handleStart = () => {
//     if (recordingStatus === "idle" || recordingStatus === "paused") {
//       setRecordingStatus("recording");
//     }
//   };

//   const handlePause = () => {
//     if (recordingStatus === "recording") {
//       setRecordingStatus("paused");
//     }
//   };

//   const handleStop = () => {
//     setRecordingStatus("stopped");
//     setReplayBuffer([...transcripts]); // backup for replay
//   };

//   const handleReplay = async () => {
//     if (!replayBuffer.length) return;
//     setIsPlaying(true);
//     clearTranscripts(); // clear current messages

//     for (let i = 0; i < replayBuffer.length; i++) {
//       addTranscript(
//         replayBuffer[i].text,
//         replayBuffer[i].speakerId,
//         replayBuffer[i].translatedText
//       );
//       await new Promise(res => setTimeout(res, 1000)); // 1 sec delay
//     }

//     setIsPlaying(false);
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         gap: "1rem",
//         padding: "1rem",
//         borderBottom: "1px solid #ccc",
//         backgroundColor: "#ffffff"
//       }}
//     >
//       <button onClick={handleStart} disabled={recordingStatus === "recording"}>
//         ▶️ Record
//       </button>
//       <button onClick={handlePause} disabled={recordingStatus !== "recording"}>
//         ⏸️ Pause
//       </button>
//       <button onClick={handleStop} disabled={recordingStatus === "idle" || recordingStatus === "stopped"}>
//         ⏹️ Stop
//       </button>
//       <button onClick={handleReplay} disabled={isPlaying || !replayBuffer.length}>
//         🔁 Play
//       </button>
//     </div>
//   );
// };

// export default ControlPanel;


import React from "react";
import { useMeeting } from "../contexts/MeetingContext";

const ControlPanel = ({ audioUrl }) => {
  const {
    recordingStatus,
    setRecordingStatus,
    transcripts,
    clearTranscripts,
    addTranscript
  } = useMeeting();

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [replayBuffer, setReplayBuffer] = React.useState([]);

  const handleStart = () => {
    if (recordingStatus !== "recording") {
      setRecordingStatus("recording");
    }
  };

  const handlePause = () => {
    if (recordingStatus === "recording") {
      setRecordingStatus("paused");
    }
  };

  const handleStop = () => {
    if (recordingStatus === "recording" || recordingStatus === "paused") {
      setRecordingStatus("stopped");
      setReplayBuffer([...transcripts]); // backup for replay

      // Reset back to idle after cleanup
      setTimeout(() => {
        setRecordingStatus("idle");
      }, 500); // small delay to allow TranscriptionHandler cleanup
    }
  };

  const handleReplay = async () => {
    if (!replayBuffer.length) return;
    setIsPlaying(true);
    clearTranscripts();

    for (let i = 0; i < replayBuffer.length; i++) {
      addTranscript(
        replayBuffer[i].text,
        replayBuffer[i].speakerId,
        replayBuffer[i].translatedText
      );
      await new Promise(res => setTimeout(res, 1000));
    }

    setIsPlaying(false);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        padding: "1rem",
        borderBottom: "1px solid #ccc",
        backgroundColor: "#ffffff"
      }}
    >
      <button onClick={handleStart} disabled={recordingStatus === "recording"}>
        ▶️ Record
      </button>
      <button onClick={handlePause} disabled={recordingStatus !== "recording"}>
        ⏸️ Pause
      </button>
      <button
        onClick={handleStop}
        disabled={recordingStatus === "idle" || recordingStatus === "stopped"}
      >
        ⏹️ Stop
      </button>
      <button onClick={handleReplay} disabled={isPlaying || !replayBuffer.length}>
        🔁 Play
      </button>

      {audioUrl && (
        <audio
          src={audioUrl}
          controls
          style={{ marginLeft: "auto", width: "200px" }}
        />
      )}
    </div>
  );
};

export default ControlPanel;
