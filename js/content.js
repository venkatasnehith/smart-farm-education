/**
 * Content page functionality
 * Displays content for a selected farming topic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize content page
  setupContentPage();
  
  // Check if there's an ID parameter in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const topicId = urlParams.get('id');
  
  if (topicId) {
    // Load content for the specified topic
    loadContent(topicId);
  } else {
    // Redirect to search page if no topic ID is provided
    window.location.href = 'search.html';
  }
  
  // Set up text-to-speech functionality
  setupTextToSpeech();
  
  // Set up print functionality
  setupPrintContent();
  
  // Set up share functionality
  setupShareContent();
});

/**
 * Sets up the content page functionality
 */
function setupContentPage() {
  // Show content loader initially
  const contentLoader = document.getElementById('contentLoader');
  const contentArticle = document.getElementById('contentArticle');
  
  if (contentLoader && contentArticle) {
    contentLoader.style.display = 'flex';
    contentArticle.style.display = 'none';
  }
  
  // Listen for language changes
  document.addEventListener('languageChanged', (event) => {
    // Reload content with the new language
    const urlParams = new URLSearchParams(window.location.search);
    const topicId = urlParams.get('id');
    
    if (topicId) {
      loadContent(topicId);
    }
  });
}

/**
 * Loads content for the specified topic
 * @param {string} topicId - The ID of the topic to load
 */
function loadContent(topicId) {
  const contentLoader = document.getElementById('contentLoader');
  const contentArticle = document.getElementById('contentArticle');
  const relatedTopicsContainer = document.querySelector('.related-topics-container');
  const language = getCurrentLanguage();
  
  if (!contentArticle || !contentLoader) return;
  
  // Show loading state
  contentLoader.style.display = 'flex';
  contentArticle.style.display = 'none';
  
  // Simulate loading delay (in real application, this would be a server request)
  setTimeout(() => {
    // Get content from farming data
    const content = window.getFarmingContent(topicId, language);
    
    if (!content) {
      // If content not found, show error
      contentArticle.innerHTML = `
        <div class="content-error">
          <h2>${translateText('content-not-found-title', language)}</h2>
          <p>${translateText('content-not-found-text', language)}</p>
          <a href="search.html" class="btn primary-btn">${translateText('back-to-search', language)}</a>
        </div>
      `;
      
      // Hide loading state
      contentLoader.style.display = 'none';
      contentArticle.style.display = 'block';
      return;
    }
    
    // Set page title
    document.title = content.title + ' - FarmKnowledge';
    
    // Display content
    contentArticle.innerHTML = content.content;
    
    // Load related topics
    if (relatedTopicsContainer) {
      loadRelatedTopics(topicId, relatedTopicsContainer);
    }
    
    // Load sign language video if enabled
    if (localStorage.getItem('signLanguageEnabled') === 'true') {
      loadSignLanguageVideo(topicId);
    }
    
    // Hide loading state
    contentLoader.style.display = 'none';
    contentArticle.style.display = 'block';
  }, 1500); // Simulated 1.5-second delay
}

/**
 * Loads related topics for the specified topic
 * @param {string} topicId - The ID of the current topic
 * @param {HTMLElement} container - The container to display related topics in
 */
function loadRelatedTopics(topicId, container) {
  const language = getCurrentLanguage();
  
  // Get related topics
  const relatedTopics = window.getRelatedTopics(topicId, language);
  
  if (relatedTopics.length > 0) {
    let relatedHTML = '';
    
    relatedTopics.forEach(topic => {
      relatedHTML += `
        <div class="related-topic-card" data-id="${topic.id}">
          <div class="related-topic-image">
            <img src="${topic.image}" alt="${topic.title}">
          </div>
          <div class="related-topic-content">
            <h3>${topic.title}</h3>
            <p>${topic.description}</p>
          </div>
        </div>
      `;
    });
    
    // Update the container with related topics
    container.innerHTML = relatedHTML;
    
    // Add event listeners to related topic cards
    const relatedCards = container.querySelectorAll('.related-topic-card');
    relatedCards.forEach(card => {
      card.addEventListener('click', () => {
        const relatedTopicId = card.getAttribute('data-id');
        if (relatedTopicId) {
          // Redirect to content page with the selected topic
          window.location.href = `content.html?id=${relatedTopicId}`;
        }
      });
    });
    
    // Show the related topics section
    const relatedTopicsSection = document.getElementById('relatedTopics');
    if (relatedTopicsSection) {
      relatedTopicsSection.style.display = 'block';
    }
  } else {
    // Hide the related topics section if no related topics
    const relatedTopicsSection = document.getElementById('relatedTopics');
    if (relatedTopicsSection) {
      relatedTopicsSection.style.display = 'none';
    }
  }
}

/**
 * Loads sign language video for the current topic
 * @param {string} topicId - The ID of the current topic
 */
function loadSignLanguageVideo(topicId) {
  const signLanguageVideo = document.getElementById('signLanguageVideo');
  const signLanguageSection = document.getElementById('signLanguageSection');
  const language = getCurrentLanguage();
  
  if (!signLanguageVideo || !signLanguageSection) return;
  
  // Get the sign language video URL
  const videoUrl = window.getSignLanguageVideo(topicId, language);
  
  if (videoUrl) {
    // Set the video source
    signLanguageVideo.querySelector('source').src = videoUrl;
    // Load the video
    signLanguageVideo.load();
    // Show the sign language section
    signLanguageSection.classList.remove('hidden');
  } else {
    // Hide the sign language section if no video available
    signLanguageSection.classList.add('hidden');
  }
}

/**
 * Sets up text-to-speech functionality
 */
function setupTextToSpeech() {
  const textToSpeechButton = document.getElementById('textToSpeech');
  
  if (!textToSpeechButton) return;
  
  // Check if the browser supports speech synthesis
  if ('speechSynthesis' in window) {
    textToSpeechButton.addEventListener('click', () => {
      // Get the content to read
      const contentArticle = document.getElementById('contentArticle');
      if (!contentArticle) return;
      
      // Extract text from the content (ignoring HTML tags)
      const textToRead = contentArticle.textContent.trim();
      
      // Create a new SpeechSynthesisUtterance
      const speech = new SpeechSynthesisUtterance(textToRead);
      
      // Set the language based on the current language
      const language = getCurrentLanguage();
      switch (language) {
        case 'hi':
          speech.lang = 'hi-IN'; // Hindi
          break;
        case 'te':
          speech.lang = 'te-IN'; // Telugu
          break;
        default:
          speech.lang = 'en-US'; // English
      }
      
      // Speak the text
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      window.speechSynthesis.speak(speech);
      
      // Update button text
      const originalText = textToSpeechButton.innerHTML;
      textToSpeechButton.innerHTML = `<i class="fas fa-volume-mute"></i> ${translateText('stop-reading', language)}`;
      
      // Reset button when speech ends
      speech.onend = () => {
        textToSpeechButton.innerHTML = originalText;
      };
      
      // Add a click event to stop speech
      const stopSpeech = () => {
        window.speechSynthesis.cancel();
        textToSpeechButton.innerHTML = originalText;
        textToSpeechButton.removeEventListener('click', stopSpeech);
        // Re-add the original event listener
        setTimeout(() => {
          textToSpeechButton.addEventListener('click', textToSpeechHandler);
        }, 100);
      };
      
      // Store the original handler
      const textToSpeechHandler = textToSpeechButton.onclick;
      
      // Remove the original event listener and add the stop speech listener
      textToSpeechButton.removeEventListener('click', textToSpeechHandler);
      textToSpeechButton.addEventListener('click', stopSpeech);
    });
  } else {
    // Hide text-to-speech button if not supported
    textToSpeechButton.style.display = 'none';
  }
}

/**
 * Sets up print content functionality
 */
function setupPrintContent() {
  const printContentButton = document.getElementById('printContent');
  
  if (!printContentButton) return;
  
  printContentButton.addEventListener('click', () => {
    window.print();
  });
}

/**
 * Sets up share content functionality
 */
function setupShareContent() {
  const shareContentButton = document.getElementById('shareContent');
  
  if (!shareContentButton) return;
  
  shareContentButton.addEventListener('click', () => {
    // Check if Web Share API is supported
    if (navigator.share) {
      const urlParams = new URLSearchParams(window.location.search);
      const topicId = urlParams.get('id');
      const content = window.getFarmingContent(topicId, getCurrentLanguage());
      
      // Share the content
      navigator.share({
        title: content ? content.title : 'FarmKnowledge',
        text: content ? content.description : 'Learn about farming',
        url: window.location.href
      }).catch(error => {
        console.error('Sharing failed:', error);
      });
    } else {
      // Copy URL to clipboard as fallback
      const dummyInput = document.createElement('input');
      document.body.appendChild(dummyInput);
      dummyInput.value = window.location.href;
      dummyInput.select();
      document.execCommand('copy');
      document.body.removeChild(dummyInput);
      
      // Show a message
      alert(translateText('url-copied', getCurrentLanguage()));
    }
  });
}

/**
 * Translates text based on the current language
 * @param {string} key - The translation key
 * @param {string} language - The current language
 * @returns {string} - The translated text
 */
function translateText(key, language) {
  if (!window.translations || !window.translations[language]) {
    return key;
  }
  
  return window.translations[language][key] || window.translations['en'][key] || key;
}

// Make loadSignLanguageVideo available globally
window.loadSignLanguageVideo = loadSignLanguageVideo;