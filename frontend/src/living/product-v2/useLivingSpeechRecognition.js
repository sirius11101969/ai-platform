import { useEffect, useRef, useState } from "react";

function getRecognitionConstructor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}
export function useLivingSpeechRecognition({ locale, onTranscript }) {
  const recognitionRef = useRef(null);
  const transcriptRef = useRef(onTranscript);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const supported = Boolean(getRecognitionConstructor());

  useEffect(() => {
    transcriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => () => {
    recognitionRef.current?.abort?.();
    recognitionRef.current = null;
  }, []);

  function stop() {
    recognitionRef.current?.stop?.();
    setListening(false);
  }

  function start() {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) {
      setError("unsupported");
      return;
    }

    setError("");
    const recognition = new Recognition();
    recognition.lang = locale === "en" ? "en-US" : "ru-RU";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result?.[0]?.transcript || "")
        .join(" ")
        .trim();
      if (transcript) transcriptRef.current?.(transcript);
    };
    recognition.onerror = (event) => {
      setListening(false);
      setError(event?.error || "recognition");
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (_error) {
      setListening(false);
      setError("start");
    }
  }

  function toggle() {
    if (listening) stop();
    else start();
  }

  return { supported, listening, error, toggle, stop };
}
