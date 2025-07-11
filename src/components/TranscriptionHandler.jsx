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
      stopRecognizer();
    } else if (recordingStatus === "stopped") {
      stopAll();
    }

    return () => {
      console.log("[useEffect Cleanup] Cleaning up");
      stopAll();
    };
  }, [recordingStatus]);

  const startRecording = async () => {
    console.log("[startRecording] Starting new session");

    // 🧹 Ensure all previous refs are clean
    stopAll();

    // 🎤 Mic access
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
      console.log("[mediaRecorder] Stopped, finalizing audio");
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const blobUrl = URL.createObjectURL(blob);
      if (onAudioReady) {
        console.log("[mediaRecorder] Audio ready, calling onAudioReady()");
        onAudioReady(blobUrl);
      }
    };

    mediaRecorder.start();
    console.log("[mediaRecorder] Recording started");

    // 🧠 Azure SDK setup
    const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const speechRegion = import.meta.env.VITE_AZURE_REGION;

    if (!speechKey || !speechRegion) {
      console.error("❌ Azure Speech key or region missing");
      return;
    }

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechRecognitionLanguage = "en-US";

    // Enable diarization
    speechConfig.setProperty(
      SpeechSDK.PropertyId.SpeechServiceConnection_ConversationTranscriptionEnabled,
      "true"
    );

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.ConversationTranscriber(speechConfig, audioConfig);
    recognizerRef.current = recognizer;

    // 🔊 Intermediate results
    recognizer.recognizing = (s, e) => {
      console.log("[recognizing] Partial:", e.result?.text);
    };

    // 🧾 Final transcription
    recognizer.transcribed = async (s, e) => {
      console.log("[transcribed] Full result:", e.result);
      const text = e.result?.text?.trim();
      const speakerId = e.result?.speakerId ?? 0;

      if (!text) {
        console.log("[transcribed] Empty result, skipping");
        return;
      }

      const langCode = getLanguageCode(selectedLanguage);
      const translatedText = await translateText(text, langCode);

      console.log("[transcribed] Saving transcript:", { text, speakerId, translatedText });
      addTranscript(text, speakerId, translatedText);
    };

    recognizer.canceled = (s, e) => {
      console.warn("[recognizer] Canceled:", e.errorDetails);
    };

    recognizer.sessionStopped = () => {
      console.log("[recognizer] Session stopped");
    };

    recognizer.startTranscribingAsync(
      () => console.log("[recognizer] Transcription started"),
      (err) => console.error("[recognizer] Failed to start:", err)
    );
  };

  const stopRecognizer = () => {
    if (recognizerRef.current) {
      console.log("[stopRecognizer] Stopping recognizer");
      recognizerRef.current.stopTranscribingAsync(
        () => console.log("[stopRecognizer] Recognizer stopped"),
        (err) => console.error("[stopRecognizer] Error stopping", err)
      );
    }
  };

  const stopAll = () => {
    console.log("[stopAll] Cleaning up recognizer + mic");

    stopRecognizer();

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      console.log("[stopAll] Stopping media recorder");
      mediaRecorderRef.current.stop();
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    recognizerRef.current = null;
    mediaRecorderRef.current = null;
    audioStreamRef.current = null;
  };

  return null;
};

export default TranscriptionHandler;
