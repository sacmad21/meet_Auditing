import { useEffect, useRef } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { useMeeting } from "../contexts/MeetingContext";
import { getLanguageCode, translateText } from "../utils/languageUtils";

const TranscriptionHandler = ({ onAudioReady }) => {
  const {
    recordingStatus,
    selectedLanguage,
    addTranscript
  } = useMeeting();

  const recognizerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);

  useEffect(() => {
    console.log(`[useEffect] Recording status: ${recordingStatus}`);

    if (recordingStatus === "recording") {
      startRecording();
    } else if (recordingStatus === "paused") {
      console.log("[useEffect] Pausing transcription");
      stopRecognizer();
    } else if (recordingStatus === "stopped") {
      console.log("[useEffect] Stopping all transcription and recording");
      stopAll();
    }

    return () => {
      console.log("[useEffect Cleanup] Cleaning up on unmount or status change");
      stopAll();
    };
  }, [recordingStatus]);

  const startRecording = async () => {
    console.log("[startRecording] Starting recording and transcription");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioStreamRef.current = stream;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
        console.log("[mediaRecorder] Data available:", e.data.size);
      }
    };

    mediaRecorder.onstop = () => {
      console.log("[mediaRecorder] Stopped recording, finalizing audio");
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const blobUrl = URL.createObjectURL(blob);
      if (onAudioReady) {
        console.log("[mediaRecorder] Audio ready, calling onAudioReady()");
        onAudioReady(blobUrl);
      }
    };

    mediaRecorder.start();
    console.log("[mediaRecorder] Recording started");

    const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const speechRegion = import.meta.env.VITE_AZURE_REGION;

    if (!speechKey || !speechRegion) {
      console.error("❌ Azure Speech key or region is missing");
      return;
    }

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechRecognitionLanguage = "en-US";
    speechConfig.setProperty(
      SpeechSDK.PropertyId.SpeechServiceConnection_ConversationTranscriptionEnabled,
      "true"
    );

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.ConversationTranscriber(speechConfig, audioConfig);
    recognizerRef.current = recognizer;

    recognizer.transcribed = async (s, e) => {
      const text = e.result?.text?.trim();
      const speakerId = e.result?.speakerId ?? 0;

      if (text) {
        console.log(`[SpeechSDK] Transcribed: "${text}" (Speaker ${speakerId})`);
        const langCode = getLanguageCode(selectedLanguage);
        const translatedText = await translateText(text, langCode);
        addTranscript(text, speakerId, translatedText);
      }
    };

    recognizer.canceled = (s, e) => {
      console.warn("[SpeechSDK] Transcription canceled:", e.errorDetails);
    };

    recognizer.sessionStopped = (s, e) => {
      console.log("[SpeechSDK] Transcription session stopped");
    };

    recognizer.startTranscribingAsync(
      () => console.log("[SpeechSDK] Transcription started"),
      (err) => console.error("[SpeechSDK] Error starting transcription:", err)
    );
  };

  const stopRecognizer = () => {
    if (recognizerRef.current) {
      console.log("[stopRecognizer] Stopping Azure recognizer");
      recognizerRef.current.stopTranscribingAsync(
        () => console.log("[stopRecognizer] Recognizer stopped"),
        (err) => console.error("[stopRecognizer] Error stopping recognizer", err)
      );
    }
  };

  const stopAll = () => {
    console.log("[stopAll] Stopping all services");

    stopRecognizer();

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      console.log("[stopAll] Stopping media recorder");
      mediaRecorderRef.current.stop();
    }

    if (audioStreamRef.current) {
      console.log("[stopAll] Stopping audio stream");
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    recognizerRef.current = null;
    mediaRecorderRef.current = null;
    audioStreamRef.current = null;
  };

  return null;
};

export default TranscriptionHandler;

// import { useEffect, useRef } from "react";
// import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
// import { useMeeting } from "../contexts/MeetingContext";
// import { getLanguageCode, translateText } from "../utils/languageUtils";

// const TranscriptionHandler = ({ onAudioReady }) => {
//   const {
//     recordingStatus,
//     selectedLanguage,
//     addTranscript
//   } = useMeeting();

//   const recognizerRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const audioStreamRef = useRef(null);

//   useEffect(() => {
//     console.log(`[useEffect] Recording status: ${recordingStatus}`);

//     if (recordingStatus === "recording") {
//       startRecording();
//     } else if (recordingStatus === "paused") {
//       console.log("[useEffect] Pausing transcription");
//       stopRecognizer();
//     } else if (recordingStatus === "stopped") {
//       console.log("[useEffect] Stopping all transcription and recording");
//       stopAll();
//     }

//     return () => {
//       console.log("[useEffect Cleanup] Cleaning up on unmount or status change");
//       stopAll();
//     };
//   }, [recordingStatus]);

//   const startRecording = async () => {
//     console.log("[startRecording] Starting recording and transcription");

//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     audioStreamRef.current = stream;

//     const mediaRecorder = new MediaRecorder(stream);
//     mediaRecorderRef.current = mediaRecorder;
//     audioChunksRef.current = [];

//     mediaRecorder.ondataavailable = (e) => {
//       if (e.data.size > 0) {
//         audioChunksRef.current.push(e.data);
//         console.log("[mediaRecorder] Data available:", e.data.size);
//       }
//     };

//     mediaRecorder.onstop = () => {
//       console.log("[mediaRecorder] Stopped recording, finalizing audio");
//       const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
//       const blobUrl = URL.createObjectURL(blob);
//       if (onAudioReady) {
//         console.log("[mediaRecorder] Audio ready, calling onAudioReady()");
//         onAudioReady(blobUrl);
//       }
//     };

//     mediaRecorder.start();
//     console.log("[mediaRecorder] Recording started");

//     // ✅ Inject forced transcript (test only)
//     addTranscript("This is a test line", 0, "यह एक परीक्षण पंक्ति है");
//     console.log("[DEBUG] Forced transcript injected");

//     const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
//     const speechRegion = import.meta.env.VITE_AZURE_REGION;

//     if (!speechKey || !speechRegion) {
//       console.error("❌ Azure Speech key or region is missing");
//       return;
//     }

//     const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);
//     speechConfig.speechRecognitionLanguage = "en-US";
//     speechConfig.setProperty(
//       SpeechSDK.PropertyId.SpeechServiceConnection_ConversationTranscriptionEnabled,
//       "true"
//     );

//     const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
//     const recognizer = new SpeechSDK.ConversationTranscriber(speechConfig, audioConfig);
//     recognizerRef.current = recognizer;

//     recognizer.transcribed = async (s, e) => {
//       console.log("[DEBUG] Received event in recognizer.transcribed");
//       console.log("[DEBUG] Full result:", e.result);

//       const text = e.result?.text?.trim();
//       const speakerId = e.result?.speakerId ?? 0;

//       if (!text) {
//         console.log("[DEBUG] Result is empty, skipping");
//         return;
//       }

//       const langCode = getLanguageCode(selectedLanguage);
//       const translatedText = await translateText(text, langCode);

//       console.log("[DEBUG] Calling addTranscript with:", { text, speakerId, translatedText });
//       addTranscript(text, speakerId, translatedText);
//     };

//     recognizer.canceled = (s, e) => {
//       console.warn("[SpeechSDK] Transcription canceled:", e.errorDetails);
//     };

//     recognizer.sessionStopped = (s, e) => {
//       console.log("[SpeechSDK] Transcription session stopped");
//     };

//     recognizer.startTranscribingAsync(
//       () => console.log("[SpeechSDK] Transcription started"),
//       (err) => console.error("[SpeechSDK] Error starting transcription:", err)
//     );
//   };

//   const stopRecognizer = () => {
//     if (recognizerRef.current) {
//       console.log("[stopRecognizer] Stopping Azure recognizer");
//       recognizerRef.current.stopTranscribingAsync(
//         () => console.log("[stopRecognizer] Recognizer stopped"),
//         (err) => console.error("[stopRecognizer] Error stopping recognizer", err)
//       );
//     }
//   };

//   const stopAll = () => {
//     console.log("[stopAll] Stopping all services");

//     stopRecognizer();

//     if (
//       mediaRecorderRef.current &&
//       mediaRecorderRef.current.state !== "inactive"
//     ) {
//       console.log("[stopAll] Stopping media recorder");
//       mediaRecorderRef.current.stop();
//     }

//     if (audioStreamRef.current) {
//       console.log("[stopAll] Stopping audio stream");
//       audioStreamRef.current.getTracks().forEach((track) => track.stop());
//     }

//     recognizerRef.current = null;
//     mediaRecorderRef.current = null;
//     audioStreamRef.current = null;
//   };

//   return null;
// };

// export default TranscriptionHandler;
