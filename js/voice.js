/**
 * Voice search functionality
 * Uses Web Speech API for voice recognition
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if the browser supports speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (SpeechRecognition) {
    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    // Set language initially to English, will be updated based on selected language
    recognition.lang = 'en-US';
    // Allow for partial results to show users their speech is being recognized
    recognition.interimResults = true;
    // Set to continuous to allow for longer speaking sessions
    recognition.continuous = false;
    
    // Initialize voice search
    initVoiceSearch(recognition);
    
    // Listen for language changes to update recognition language
    document.addEventListener('languageChanged', (event) => {
      updateRecognitionLanguage(recognition, event.detail.language);
    });
  } else {
    // Hide voice search button if speech recognition is not supported
    const voiceSearchButton = document.getElementById('voiceSearchButton');
    if (voiceSearchButton) {
      voiceSearchButton.style.display = 'none';
    }
    
    // Update voice status to show that voice search is not available
    const voiceStatus = document.getElementById('voiceStatus');
    if (voiceStatus) {
      voiceStatus.innerHTML = `<p class="voice-status-error">Voice search is not supported in this browser.</p>`;
    }
  }
});

/**
 * Initializes voice search functionality
 * @param {SpeechRecognition} recognition - The speech recognition object
 */
function initVoiceSearch(recognition) {
  const voiceSearchButton = document.getElementById('voiceSearchButton');
  const voiceStatus = document.getElementById('voiceStatus');
  const searchInput = document.getElementById('searchInput');
  
  if (!voiceSearchButton || !voiceStatus || !searchInput) return;
  
  // Set initial language based on selected language
  updateRecognitionLanguage(recognition, getCurrentLanguage());
  
  // Add event listener for voice search button
  voiceSearchButton.addEventListener('click', () => {
    if (recognition.isListening) {
      // If already listening, stop recognition
      recognition.stop();
      recognition.isListening = false;
      voiceSearchButton.innerHTML = '<i class="fas fa-microphone"></i>';
      updateVoiceStatus('voice-status-idle');
    } else {
      // Start voice recognition
      recognition.start();
      recognition.isListening = true;
      voiceSearchButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
      updateVoiceStatus('voice-status-listening');
    }
  });
  
  // Event handlers for speech recognition
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('');
    
    // Update search input with recognized speech
    searchInput.value = transcript;
    
    // If final result, perform search
    if (event.results[0].isFinal) {
      updateVoiceStatus('voice-status-processing');
      
      // Perform search
      const searchButton = document.getElementById('searchButton');
      if (searchButton) {
        searchButton.click();
      }
      
      // Reset voice search button
      recognition.isListening = false;
      voiceSearchButton.innerHTML = '<i class="fas fa-microphone"></i>';
    }
  };
  
  recognition.onstart = () => {
    updateVoiceStatus('voice-status-listening');
  };
  
  recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
    updateVoiceStatus('voice-status-error');
    
    // Reset voice search button
    recognition.isListening = false;
    voiceSearchButton.innerHTML = '<i class="fas fa-microphone"></i>';
  };
  
  recognition.onend = () => {
    // If not processing a final result, update status to idle
    if (!recognition.isListening && voiceStatus.classList.contains('voice-status-listening')) {
      updateVoiceStatus('voice-status-idle');
    }
    
    // Reset voice search button
    recognition.isListening = false;
    voiceSearchButton.innerHTML = '<i class="fas fa-microphone"></i>';
  };
}

/**
 * Updates the speech recognition language based on the selected language
 * @param {SpeechRecognition} recognition - The speech recognition object
 * @param {string} language - The selected language code
 */
function updateRecognitionLanguage(recognition, language) {
  switch (language) {
    case 'hi':
      recognition.lang = 'hi-IN'; // Hindi
      break;
    case 'te':
      recognition.lang = 'te-IN'; // Telugu
      break;
    default:
      recognition.lang = 'en-US'; // English (default)
  }
}

/**
 * Updates the voice status display
 * @param {string} statusKey - The key for the status message
 */
function updateVoiceStatus(statusKey) {
  const voiceStatus = document.getElementById('voiceStatus');
  if (!voiceStatus) return;
  
  const language = getCurrentLanguage();
  let statusText = '';
  
  // Remove all status classes
  voiceStatus.classList.remove('voice-status-idle', 'voice-status-listening', 'voice-status-processing', 'voice-status-error');
  
  // Add the appropriate status class
  voiceStatus.classList.add(statusKey);
  
  // Set the status text based on the key
  switch (statusKey) {
    case 'voice-status-idle':
      statusText = window.translations[language]['voice-status-idle'] || 'Press the microphone to start voice search';
      break;
    case 'voice-status-listening':
      statusText = window.translations[language]['voice-status-listening'] || 'Listening... Speak now';
      break;
    case 'voice-status-processing':
      statusText = window.translations[language]['voice-status-processing'] || 'Processing your query...';
      break;
    case 'voice-status-error':
      statusText = window.translations[language]['voice-status-error'] || 'Could not recognize speech. Try again.';
      break;
  }
  
  voiceStatus.innerHTML = `<p id="voiceStatusText">${statusText}</p>`;
}