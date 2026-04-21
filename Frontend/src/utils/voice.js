// ── Speech Recognition ──────────────────────────────────────────
export const listen = () =>
  new Promise((resolve, reject) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      reject(new Error("Speech recognition not supported in this browser."));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = (e) => {
      reject(new Error(`Speech error: ${e.error}`));
    };

    recognition.onend = () => {
      // auto-resolves or rejects via above handlers
    };
  });

// ── Text-to-Speech ──────────────────────────────────────────────
export const speak = (text, options = {}) => {
  if (!window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown for cleaner speech
  const clean = text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = options.lang || "en-US";
  utterance.rate = options.rate || 0.95;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;

  // Try to use a good voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) =>
      v.name.includes("Google") ||
      v.name.includes("Samantha") ||
      v.name.includes("Daniel")
  );
  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.speak(utterance);
};

// ── Stop Speaking ───────────────────────────────────────────────
export const stopSpeaking = () => {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
};