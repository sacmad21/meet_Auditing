import axios from "axios";
import { AZURE_TRANSLATOR_KEY, AZURE_TRANSLATOR_REGION, AZURE_TRANSLATOR_ENDPOINT } from "./azureConfig";

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { name: "English", code: "en" },
  { name: "Hindi", code: "hi" },
  { name: "Marathi", code: "mr" },
  { name: "Gujarati", code: "gu" },
  { name: "Tamil", code: "ta" },
  { name: "Telugu", code: "te" },
  { name: "Bengali", code: "bn" },
  { name: "Punjabi", code: "pa" }
];

// Convert language name to Azure language code
export function getLanguageCode(name) {
  const lang = SUPPORTED_LANGUAGES.find(l => l.name === name);
  return lang ? lang.code : "en";
}

// Translate text using Azure Translator API
export async function translateText(text, targetLanguageCode) {
  if (!text || targetLanguageCode === "en") return text;

  try {
    const response = await axios.post(
      `${AZURE_TRANSLATOR_ENDPOINT}/translate?api-version=3.0&to=${targetLanguageCode}`,
      [{ Text: text }],
      {
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_TRANSLATOR_KEY,
          "Ocp-Apim-Subscription-Region": AZURE_TRANSLATOR_REGION,
          "Content-Type": "application/json"
        }
      }
    );

    const translatedText = response.data[0]?.translations[0]?.text;
    console.log("[DEBUG] Translation successful:", translatedText);
    return translatedText || text;
  } catch (error) {
    console.error("Translation failed:", error.message);
    return text;
  }
}
