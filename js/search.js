/**
 * Search page functionality
 * Handles search interactions and results display
 */

// Search state variables
let isSearching = false;
let searchTimeout = null;
const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_TIME = 300; // milliseconds
let sessionId = generateSessionId(); // Unique session ID for conversation history

document.addEventListener('DOMContentLoaded', () => {
  // Initialize search page
  setupSearchPage();
  
  // Check if there's a query parameter in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('query');
  
  if (searchQuery) {
    // Fill the search input with the query
    document.getElementById('searchInput').value = searchQuery;
    // Perform search
    performSearch(searchQuery);
  }
  
  // Set up voice input functionality
  setupVoiceInput();
  
  // Setup real-time crop recommendations
  setupCropRecommendations();
});

/**
 * Generate a random session ID for tracking conversation history
 */
function generateSessionId() {
  return 'session_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Sets up the search page functionality
 */
function setupSearchPage() {
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const suggestionTags = document.querySelectorAll('.tag');
  
  // Add event listener for search button
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        performSearch(query);
        // Update URL with search query
        updateUrlWithQuery(query);
      }
    });
  }
  
  // Add event listener for Enter key in search input
  if (searchInput) {
    searchInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          performSearch(query);
          // Update URL with search query
          updateUrlWithQuery(query);
        }
      }
    });
  }
  
  // Add event listeners for suggestion tags
  suggestionTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const query = tag.getAttribute('data-search');
      if (query) {
        // Update search input
        searchInput.value = query;
        // Perform search
        performSearch(query);
        // Update URL with search query
        updateUrlWithQuery(query);
      }
    });
  });
  
  // Listen for language changes
  document.addEventListener('languageChanged', (event) => {
    if (event.detail && event.detail.language) {
      // If there's an active search, refresh it with the new language
      const currentQuery = searchInput.value.trim();
      if (currentQuery && document.getElementById('searchResults').innerHTML) {
        performSearch(currentQuery);
      }
    }
  });
}

/**
 * Initializes search functionality
 */
function initSearchFunctionality() {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  
  // Handle form submission
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const query = searchInput.value.trim();
    if (query.length >= MIN_SEARCH_LENGTH) {
      performSearch(query);
    } else if (query.length > 0) {
      showError('Please enter at least ' + MIN_SEARCH_LENGTH + ' characters to search');
    }
  });
  
  // Optional: Real-time suggestions as user types
  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    
    const query = searchInput.value.trim();
    if (query.length >= MIN_SEARCH_LENGTH) {
      // Debounce to avoid too many requests
      searchTimeout = setTimeout(() => {
        // Uncomment to enable auto-search as user types
        // performSearch(query);
      }, DEBOUNCE_TIME);
    } else {
      searchResults.innerHTML = '';
    }
  });
}

/**
 * Sets up voice input functionality
 */
function setupVoiceInput() {
  // Create voice input button
  const searchForm = document.getElementById('searchForm');
  const voiceBtn = document.createElement('button');
  voiceBtn.type = 'button';
  voiceBtn.id = 'voiceSearchButton';
  voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
  voiceBtn.className = 'voice-search-btn';
  
  if (searchForm) {
    searchForm.appendChild(voiceBtn);
    
    // Add speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      const voiceStatus = document.getElementById('voiceStatus');
      const voiceStatusText = document.getElementById('voiceStatusText');
      const language = getCurrentLanguage ? getCurrentLanguage() : 'en';
      
      // Set recognition properties
      recognition.continuous = false;
      recognition.interimResults = false;
      
      // Set language based on current UI language
      switch (language) {
        case 'hi':
          recognition.lang = 'hi-IN';
          break;
        case 'te':
          recognition.lang = 'te-IN';
          break;
        default:
          recognition.lang = 'en-US';
      }
      
      // Handle voice button click
      voiceBtn.addEventListener('click', () => {
        recognition.start();
        if (voiceStatus) voiceStatus.classList.add('listening');
        if (voiceStatusText) voiceStatusText.textContent = getTranslation('voice-status-listening');
      });
      
      // Result handler
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('searchInput').value = transcript;
        if (voiceStatusText) voiceStatusText.textContent = getTranslation('voice-status-processing');
        
        // Perform search with voice input
        performSearch(transcript);
        updateUrlWithQuery(transcript);
      };
      
      // Error handler
      recognition.onerror = (event) => {
        if (voiceStatus) voiceStatus.classList.remove('listening');
        if (voiceStatusText) voiceStatusText.textContent = getTranslation('voice-status-error');
      };
      
      // End handler
      recognition.onend = () => {
        if (voiceStatus) voiceStatus.classList.remove('listening');
        setTimeout(() => {
          if (voiceStatusText) voiceStatusText.textContent = getTranslation('voice-status-idle');
        }, 2000);
      };
      
      // Add styles for the voice button
      const style = document.createElement('style');
      style.textContent = `
        .voice-search-btn {
          background-color: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          width: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 10px;
        }
        
        .voice-search-btn:hover {
          background-color: var(--primary-dark);
          transform: translateY(-2px);
        }
        
        .voice-search-btn i {
          font-size: 1.2rem;
        }
        
        .voice-status.listening {
          color: var(--primary);
          font-weight: 600;
        }
      `;
      document.head.appendChild(style);
    }
  }
}

/**
 * Get translation for a key based on current language
 */
function getTranslation(key) {
  const language = getCurrentLanguage ? getCurrentLanguage() : 'en';
  const translations = window.translations || {};
  
  if (translations[language] && translations[language][key]) {
    return translations[language][key];
  }
  
  return key;
}

/**
 * Performs the search by sending request to the Gemini API endpoint
 * @param {string} query - The search query
 */
function performSearch(query) {
  if (isSearching) return;
  
  isSearching = true;
  const searchLoading = document.getElementById('searchLoading');
  const searchResults = document.getElementById('searchResults');
  
  // Show loading indicator
  searchLoading.style.display = 'flex';
  
  // Track analytics (if needed)
  trackSearch(query);
  
  // Get the current language setting
  const language = getCurrentLanguage ? getCurrentLanguage() : 'en';
  
  // Simulate API call with a timeout for realistic behavior
  setTimeout(() => {
    // Provide mock search results based on the query
    const mockResponse = generateMockResponse(query);
    
    // Display the results
    displaySearchResults({
      query: query,
      content: mockResponse,
      is_followup: query.toLowerCase().includes('how') || query.toLowerCase().includes('why')
    });
    
    // Hide loading indicator
    searchLoading.style.display = 'none';
    isSearching = false;
  }, 1000); // Simulate network delay

  // Original API call code (commented out)
  /*
  // Make request to our backend API with enhanced parameters
  fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      query,
      language,
      session_id: sessionId
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    displaySearchResults(data);
  })
  .catch(error => {
    console.error('Error:', error);
    showError('Sorry, there was an error processing your request. Please try again later.');
  })
  .finally(() => {
    searchLoading.style.display = 'none';
    isSearching = false;
  });
  */
}

/**
 * Generate mock response based on the search query
 * @param {string} query - The search query
 * @returns {string} - The mock response
 */
function generateMockResponse(query) {
  // Lowercase the query for easier matching
  const q = query.toLowerCase();
  
  // Common farming terms to match against
  const topics = {
    'soil': `<h3>Soil Management</h3>
      <p>Healthy soil is the foundation of successful farming. Here are key practices for soil management:</p>
      <ul>
        <li><strong>Soil Testing:</strong> Regular testing helps understand pH levels and nutrient content</li>
        <li><strong>Crop Rotation:</strong> Prevents soil depletion and breaks pest cycles</li>
        <li><strong>Cover Crops:</strong> Protect soil from erosion and add organic matter</li>
        <li><strong>Organic Matter:</strong> Add compost and manure to improve soil structure</li>
        <li><strong>Minimal Tillage:</strong> Reduces soil disturbance and preserves soil biology</li>
      </ul>
      <p>Different soil types require different management approaches. Clay soils benefit from organic matter to improve drainage, while sandy soils need organic matter to improve water retention.</p>`,
    
    'crop': `<h3>Crop Management</h3>
      <p>Successful crop management involves careful planning and monitoring throughout the growing season:</p>
      <ul>
        <li><strong>Crop Selection:</strong> Choose varieties suited to your climate and soil</li>
        <li><strong>Planting Time:</strong> Follow recommended planting calendars for your region</li>
        <li><strong>Spacing:</strong> Proper spacing ensures good air flow and resource access</li>
        <li><strong>Irrigation:</strong> Water deeply but infrequently to encourage deep root growth</li>
        <li><strong>Integrated Pest Management:</strong> Use multiple strategies to manage pests</li>
      </ul>
      <p>Regular monitoring helps identify issues early when they're easier to address. Keep detailed records to improve practices year after year.</p>`,
    
    'pest': `<h3>Pest Management</h3>
      <p>Effective pest management uses multiple approaches to minimize crop damage while protecting the environment:</p>
      <ul>
        <li><strong>Prevention:</strong> Use resistant varieties and maintain plant health</li>
        <li><strong>Identification:</strong> Correctly identifying pests is crucial for effective control</li>
        <li><strong>Monitoring:</strong> Regular scouting helps catch problems early</li>
        <li><strong>Biological Control:</strong> Beneficial insects can help control pest populations</li>
        <li><strong>Cultural Practices:</strong> Crop rotation and sanitation reduce pest pressure</li>
      </ul>
      <p>When chemical controls are necessary, choose the least toxic options and apply them correctly to minimize environmental impact.</p>`,
    
    'water': `<h3>Water Management</h3>
      <p>Efficient water management is critical for sustainable farming, especially in water-scarce regions:</p>
      <ul>
        <li><strong>Drip Irrigation:</strong> Delivers water directly to plant roots with minimal waste</li>
        <li><strong>Scheduling:</strong> Water based on plant needs and soil moisture levels</li>
        <li><strong>Mulching:</strong> Reduces evaporation and suppresses weeds</li>
        <li><strong>Rainwater Harvesting:</strong> Collects and stores rainwater for later use</li>
        <li><strong>Soil Health:</strong> Improved soil structure increases water retention</li>
      </ul>
      <p>Technologies like soil moisture sensors can help optimize irrigation timing and amounts, reducing water usage while maintaining crop health.</p>`,
    
    'organic': `<h3>Organic Farming</h3>
      <p>Organic farming focuses on building healthy soil and ecosystems without synthetic inputs:</p>
      <ul>
        <li><strong>Natural Fertilizers:</strong> Compost, manure, and cover crops provide nutrients</li>
        <li><strong>Biological Pest Control:</strong> Beneficial insects and natural predators</li>
        <li><strong>Crop Diversity:</strong> Polycultures reduce pest pressure and improve resilience</li>
        <li><strong>Mechanical Weed Control:</strong> Cultivation, mulching, and hand weeding</li>
        <li><strong>Certification:</strong> Official organic certification can increase product value</li>
      </ul>
      <p>Transitioning to organic practices typically takes 3 years, during which time farmers develop new skills and rebuild soil health. The premium prices for organic products can offset potentially lower yields.</p>`
  };
  
  // Default response if no specific match is found
  let response = `<h3>Farming Information</h3>
    <p>Farming is the practice of cultivating plants and livestock for food, fiber, medicinal plants, and other products used to sustain and enhance human life.</p>
    <p>Modern farming methods include sustainable agriculture, precision farming, vertical farming, and hydroponics. These approaches aim to increase efficiency while reducing environmental impact.</p>
    <p>For more specific information, try searching for topics like soil management, crop rotation, pest control, irrigation techniques, or organic farming methods.</p>`;
  
  // Check for matches in our topics database
  for (const [keyword, content] of Object.entries(topics)) {
    if (q.includes(keyword)) {
      response = content;
      break;
    }
  }
  
  // For more specific common queries
  if (q.includes('rice') || q.includes('paddy')) {
    response = `<h3>Rice Cultivation</h3>
      <p>Rice is a staple crop for more than half the world's population. Here are key aspects of rice cultivation:</p>
      <ul>
        <li><strong>Growing Conditions:</strong> Rice thrives in warm, humid climates with temperatures between 20-35°C</li>
        <li><strong>Water Requirements:</strong> Paddy fields are flooded with 5-10cm of water during the growing season</li>
        <li><strong>Land Preparation:</strong> Fields should be leveled and puddled to retain water</li>
        <li><strong>Planting:</strong> Either direct seeding or transplanting seedlings from nurseries</li>
        <li><strong>Fertilization:</strong> Apply balanced NPK fertilizers according to soil test results</li>
      </ul>
      <p>Common rice pests include stem borers, leaf folders, and rice blast disease. Integrated pest management and resistant varieties can help manage these challenges.</p>`;
  }
  
  if (q.includes('fertilizer') || q.includes('nutrient')) {
    response = `<h3>Fertilizers and Soil Nutrients</h3>
      <p>Plants require various nutrients for healthy growth and productive yields:</p>
      <ul>
        <li><strong>Macronutrients:</strong> Nitrogen (N), Phosphorus (P), and Potassium (K) are needed in larger amounts</li>
        <li><strong>Secondary Nutrients:</strong> Calcium, Magnesium, and Sulfur are required in moderate amounts</li>
        <li><strong>Micronutrients:</strong> Iron, Manganese, Zinc, Copper, Boron, and Molybdenum are needed in small amounts</li>
      </ul>
      <p>Soil testing helps determine which nutrients are deficient. Organic sources include compost, manure, and cover crops, while inorganic sources include synthetic fertilizers.</p>
      <p>Proper timing and placement of fertilizers maximize benefits while minimizing environmental impacts like runoff and leaching.</p>`;
  }
  
  if (q.includes('weather') || q.includes('climate')) {
    response = `<h3>Weather and Climate in Agriculture</h3>
      <p>Weather and climate significantly impact agricultural productivity:</p>
      <ul>
        <li><strong>Temperature:</strong> Affects plant growth rates, flowering, and fruiting</li>
        <li><strong>Precipitation:</strong> Determines water availability and irrigation needs</li>
        <li><strong>Sunshine:</strong> Drives photosynthesis and influences crop development</li>
        <li><strong>Wind:</strong> Can cause physical damage and increase evaporation</li>
        <li><strong>Climate Change:</strong> Shifting patterns require adaptation strategies</li>
      </ul>
      <p>Weather forecasting tools help farmers make informed decisions about planting, harvesting, and protecting crops from extreme events. Climate-smart agriculture practices can improve resilience to changing conditions.</p>`;
  }
  
  return response;
}

/**
 * Displays the search results on the page
 * @param {Object} data - The response data from the API
 */
function displaySearchResults(data) {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = '';
  
  if (!data || !data.content || data.content.trim() === '') {
    showError('No results found for your query. Please try different keywords.');
    return;
  }
  
  // Create result container
  const resultElement = document.createElement('div');
  resultElement.className = 'search-result';
  
  // Add follow-up indicator if this was a follow-up question
  if (data.is_followup) {
    const followupBadge = document.createElement('div');
    followupBadge.className = 'followup-badge';
    followupBadge.innerHTML = '<i class="fas fa-reply"></i> Follow-up Question';
    resultElement.appendChild(followupBadge);
  }
  
  // Process the content for better display
  const processedContent = processMarkdownLike(data.content);
  
  // Add the AI response
  const responseElement = document.createElement('div');
  responseElement.className = 'ai-response';
  responseElement.innerHTML = processedContent;
  resultElement.appendChild(responseElement);
  
  // Add footer with attribution and actions
  const footerElement = document.createElement('div');
  footerElement.className = 'result-footer';
  
  // Add query information
  const queryElement = document.createElement('div');
  queryElement.className = 'query-info';
  queryElement.innerHTML = `<small>${getTranslation('results-for')}: <strong>${data.query}</strong></small>`;
  footerElement.appendChild(queryElement);
  
  // Add action buttons
  const actionsElement = document.createElement('div');
  actionsElement.className = 'action-buttons';
  
  // Copy button
  const copyButton = document.createElement('button');
  copyButton.className = 'btn-action';
  copyButton.innerHTML = '<i class="fas fa-copy"></i> ' + getTranslation('copy');
  copyButton.addEventListener('click', () => copyToClipboard(data.content));
  actionsElement.appendChild(copyButton);
  
  // Listen button (Text-to-speech)
  const listenButton = document.createElement('button');
  listenButton.className = 'btn-action';
  listenButton.innerHTML = '<i class="fas fa-volume-up"></i> ' + getTranslation('listen');
  listenButton.addEventListener('click', () => speakText(data.content));
  actionsElement.appendChild(listenButton);
  
  footerElement.appendChild(actionsElement);
  resultElement.appendChild(footerElement);
  
  // Add suggestion questions for follow-up
  addFollowUpSuggestions(resultElement, data.query);
  
  // Add the result to the page
  searchResults.appendChild(resultElement);
  
  // Scroll to results
  searchResults.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Add follow-up question suggestions
 */
function addFollowUpSuggestions(resultElement, originalQuery) {
  // Create suggestion container
  const suggestionsContainer = document.createElement('div');
  suggestionsContainer.className = 'followup-suggestions';
  
  // Add title
  const suggestionsTitle = document.createElement('h4');
  suggestionsTitle.textContent = getTranslation('ask-followup');
  suggestionsContainer.appendChild(suggestionsTitle);
  
  // Generate follow-up questions based on the original query
  const followUps = generateFollowUpQuestions(originalQuery);
  
  // Create suggestions list
  const suggestionsList = document.createElement('div');
  suggestionsList.className = 'followup-tags';
  
  followUps.forEach(question => {
    const tag = document.createElement('span');
    tag.className = 'followup-tag';
    tag.textContent = question;
    tag.addEventListener('click', () => {
      document.getElementById('searchInput').value = question;
      performSearch(question);
      updateUrlWithQuery(question);
    });
    suggestionsList.appendChild(tag);
  });
  
  suggestionsContainer.appendChild(suggestionsList);
  resultElement.appendChild(suggestionsContainer);
}

/**
 * Generate follow-up question suggestions
 */
function generateFollowUpQuestions(query) {
  // Simple rule-based follow-up question generation
  let followUps = [];
  
  // Extract keywords
  const keywords = extractKeywords(query);
  
  // Generic follow-up templates
  if (query.toLowerCase().includes('how to') || query.toLowerCase().includes('method')) {
    followUps.push(`What equipment is needed for this method?`);
    followUps.push(`How much does it cost to implement?`);
  }
  
  if (keywords.includes('soil') || keywords.includes('ground') || keywords.includes('dirt')) {
    followUps.push(`How can I improve this soil type?`);
    followUps.push(`What crops grow best in this soil?`);
  }
  
  if (keywords.includes('pest') || keywords.includes('disease') || keywords.includes('insect')) {
    followUps.push(`What are organic methods to control this?`);
    followUps.push(`How do I prevent this in the future?`);
  }
  
  if (keywords.includes('crop') || keywords.includes('plant') || keywords.includes('cultivation')) {
    followUps.push(`What is the growing season for this crop?`);
    followUps.push(`How much water does it require?`);
  }
  
  // If we don't have enough specific follow-ups, add generic ones
  if (followUps.length < 3) {
    followUps.push(`What are the best practices for this?`);
    followUps.push(`Are there any alternatives to consider?`);
    followUps.push(`What are common problems to watch for?`);
  }
  
  // Limit to 3 suggestions
  return followUps.slice(0, 3);
}

/**
 * Extract keywords from a query
 */
function extractKeywords(query) {
  // Simple keyword extraction
  const stopwords = ['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 'through', 'over', 'before', 'between', 'after', 'since', 'without', 'under', 'how', 'what', 'why', 'where', 'who', 'which', 'when', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'will', 'would', 'should', 'may', 'might', 'must', 'of', 'and', 'or', 'but', 'if', 'while', 'because'];
  
  return query.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 2 && !stopwords.includes(word)); // Filter out stopwords and short words
}

/**
 * Speak text using the Web Speech API
 */
function speakText(text) {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language based on current UI language
    const language = getCurrentLanguage ? getCurrentLanguage() : 'en';
    switch (language) {
      case 'hi':
        utterance.lang = 'hi-IN';
        break;
      case 'te':
        utterance.lang = 'te-IN';
        break;
      default:
        utterance.lang = 'en-US';
    }
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
    } else {
    alert('Text-to-speech is not supported in your browser.');
  }
}

/**
 * Set up real-time crop recommendations
 */
function setupCropRecommendations() {
  // Create recommendation form if on search page
  if (window.location.pathname.includes('search.html')) {
    const recommendSection = document.createElement('section');
    recommendSection.className = 'recommendation-section';
    recommendSection.innerHTML = `
      <h3>${getTranslation('crop-recommendation-title')}</h3>
      <p>${getTranslation('crop-recommendation-subtitle')}</p>
      <form id="recommendForm" class="recommend-form">
        <div class="form-row">
          <div class="form-group">
            <label for="soilType">${getTranslation('soil-type')}</label>
            <select id="soilType" required>
              <option value="">${getTranslation('select-option')}</option>
              <option value="alluvial">Alluvial</option>
              <option value="black">Black</option>
              <option value="clay">Clay</option>
              <option value="red">Red</option>
              <option value="sandy">Sandy</option>
            </select>
          </div>
          <div class="form-group">
            <label for="weather">${getTranslation('weather-condition')}</label>
            <select id="weather" required>
              <option value="">${getTranslation('select-option')}</option>
              <option value="hot">Hot</option>
              <option value="rainy">Rainy</option>
              <option value="cold">Cold</option>
              <option value="dry">Dry</option>
              <option value="humid">Humid</option>
            </select>
          </div>
          <div class="form-group">
            <label for="region">${getTranslation('region')}</label>
            <input type="text" id="region" placeholder="${getTranslation('enter-region')}">
          </div>
        </div>
        <button type="submit" class="btn primary-btn">${getTranslation('get-recommendations')}</button>
      </form>
      <div id="recommendResults" class="recommend-results"></div>
    `;
    
    // Add to page after search results
    const searchResults = document.querySelector('.search-results');
    if (searchResults) {
      searchResults.parentNode.insertBefore(recommendSection, searchResults.nextSibling);
      
      // Add event listener to form
      const recommendForm = document.getElementById('recommendForm');
      if (recommendForm) {
        recommendForm.addEventListener('submit', (e) => {
          e.preventDefault();
          
          const soilType = document.getElementById('soilType').value;
          const weather = document.getElementById('weather').value;
          const region = document.getElementById('region').value;
          
          if (!soilType || !weather) {
            alert(getTranslation('please-select-required'));
            return;
          }
          
          // Send to API
          getCropRecommendations(soilType, weather, region);
        });
      }
      
      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        .recommendation-section {
          padding: var(--spacing-xl);
          background-color: var(--primary-light);
          border-radius: var(--radius-md);
          margin: 20px 0;
        }
        
        .recommendation-section h3 {
          color: var(--primary-dark);
          margin-bottom: var(--spacing-sm);
        }
        
        .recommend-form {
          margin-top: var(--spacing-md);
        }
        
        .form-row {
          display: flex;
          gap: var(--spacing-md);
          flex-wrap: wrap;
        }
        
        .form-group {
          flex: 1;
          min-width: 200px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: var(--spacing-xs);
          font-weight: 600;
          color: var(--secondary-dark);
        }
        
        .form-group select,
        .form-group input {
          width: 100%;
          padding: var(--spacing-sm);
          border: 1px solid var(--light-gray);
          border-radius: var(--radius-sm);
          margin-bottom: var(--spacing-md);
        }
        
        .recommend-results {
          margin-top: var(--spacing-lg);
          background-color: white;
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
          display: none;
        }
        
        .recommend-results.show {
          display: block;
        }
        
        .followup-suggestions {
          margin-top: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--off-white);
          border-radius: var(--radius-md);
        }
        
        .followup-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-sm);
        }
        
        .followup-tag {
          background-color: white;
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: var(--radius-round);
          font-size: 0.9rem;
          border: 1px solid var(--light-gray);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .followup-tag:hover {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        
        .followup-badge {
          display: inline-block;
          padding: var(--spacing-xs) var(--spacing-sm);
          background-color: var(--accent-light);
          color: var(--accent-dark);
          border-radius: var(--radius-round);
          font-size: 0.8rem;
          margin-bottom: var(--spacing-sm);
        }
      `;
      document.head.appendChild(style);
    }
  }
}

/**
 * Get crop recommendations from the API
 */
function getCropRecommendations(soilType, weather, region) {
  const recommendResults = document.getElementById('recommendResults');
  
  // Show loading
  recommendResults.className = 'recommend-results show';
  recommendResults.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>${getTranslation('loading-recommendations')}</p>
    </div>
  `;
  
  // Get the current language setting
  const language = getCurrentLanguage ? getCurrentLanguage() : 'en';
  
  // Make request to new API endpoint
  fetch('/api/recommend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      soil_type: soilType,
      weather: weather,
      region: region,
      language: language
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data.recommendations) {
      recommendResults.innerHTML = `
        <h4>${getTranslation('recommended-crops')}</h4>
        <div class="recommendations-content">
          ${processMarkdownLike(data.recommendations)}
        </div>
      `;
    } else {
      recommendResults.innerHTML = `
        <div class="error-message">
          <p>${getTranslation('recommendation-error')}</p>
        </div>
      `;
    }
  })
  .catch(error => {
    console.error('Error:', error);
    recommendResults.innerHTML = `
      <div class="error-message">
        <p>${getTranslation('recommendation-error')}</p>
      </div>
    `;
  });
}

/**
 * Processes markdown-like formatting in text
 * @param {string} text - The text to process
 * @returns {string} - HTML formatted text
 */
function processMarkdownLike(text) {
  if (!text) return '';
  
  // Replace newlines with <br> tags
  let processed = text.replace(/\n/g, '<br>');
  
  // Bold text between **text**
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic text between *text*
  processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Headers (# Header)
  processed = processed.replace(/^# (.*?)$/gm, '<h2>$1</h2>');
  processed = processed.replace(/^## (.*?)$/gm, '<h3>$1</h3>');
  processed = processed.replace(/^### (.*?)$/gm, '<h4>$1</h4>');
  
  // Bullet points
  processed = processed.replace(/^- (.*?)$/gm, '• $1<br>');
  
  return processed;
}

/**
 * Shows an error message in the results area
 * @param {string} message - The error message to display
 */
function showError(message) {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = `
    <div class="search-error">
      <i class="fas fa-exclamation-circle"></i>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Copies text to clipboard and shows a notification
 * @param {string} text - The text to copy
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = getTranslation('copied-to-clipboard');
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after animation completes
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

/**
 * Tracks search in analytics
 * @param {string} query - The search query
 */
function trackSearch(query) {
  // Implement analytics tracking here if needed
  console.log('Search tracked:', query);
}

/**
 * Updates the URL with the search query parameter
 * @param {string} query - The search query
 */
function updateUrlWithQuery(query) {
  const url = new URL(window.location.href);
  url.searchParams.set('query', query);
  window.history.pushState({}, '', url);
}

// Add styles for search results and modal
const style = document.createElement('style');
style.textContent = `
    .search-result {
        background: white;
        padding: 20px;
        margin-bottom: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .search-result h3 {
        color: #2c3e50;
        margin-bottom: 10px;
    }
    
    .search-result .category {
        color: #7f8c8d;
        font-size: 0.9em;
        margin-bottom: 10px;
    }
    
    .search-result .description {
        color: #34495e;
        margin-bottom: 15px;
    }
    
    .result-content {
        max-height: 150px;
        overflow: hidden;
        margin-bottom: 15px;
    }
    
    .read-more-btn {
        background: #27ae60;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .read-more-btn:hover {
        background: #219a52;
    }
    
    .no-results {
        text-align: center;
        padding: 40px;
        color: #7f8c8d;
    }
    
    .no-results i {
        font-size: 48px;
        margin-bottom: 20px;
    }
    
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    }
    
    .close-btn {
        position: absolute;
        right: 20px;
        top: 20px;
        font-size: 24px;
        cursor: pointer;
    }
`;
document.head.appendChild(style);