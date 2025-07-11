import React from "react";
import { useMeeting } from "../contexts/MeetingContext";
import { SUPPORTED_LANGUAGES } from "../utils/languageUtils";

const LanguageSelector = () => {
  const {
    selectedLanguage,
    setSelectedLanguage,
    recordingStatus
  } = useMeeting();

  const handleChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const isDisabled = recordingStatus === "recording" || recordingStatus === "replaying"; // optional

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0.75rem 1rem",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #ccc",
        borderTop: "1px solid #eee"
      }}
    >
      <label htmlFor="lang" style={{ marginRight: "0.75rem", fontWeight: "bold" }}>
        🌐 Current Language:
      </label>
      <select
        id="lang"
        value={selectedLanguage}
        onChange={handleChange}
        disabled={isDisabled}
        style={{
          padding: "0.5rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          fontSize: "1rem",
          backgroundColor: isDisabled ? "#f5f5f5" : "white",
          cursor: isDisabled ? "not-allowed" : "pointer"
        }}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.name}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
