
export const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    window.speechSynthesis.cancel(); // Cancel any previous speech
    window.speechSynthesis.speak(utterance);
  } else {
    console.error("Browser does not support Speech Synthesis.");
    alert("Bu özellik tarayıcınız tarafından desteklenmiyor.");
  }
};
