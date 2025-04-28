/**
 * Image to Query Conversion
 * Connects the AI detection system to the search functionality
 */

// Detection categories and their search prompts
const DETECTION_SEARCH_PROMPTS = {
    soil: {
        'Alluvial': 'How to cultivate crops in alluvial soil? Best practices and recommendations',
        'Black': 'Black soil farming techniques and suitable crops',
        'Clay': 'How to improve clay soil for better crop growth?',
        'Red': 'Farming in red soil - crops and management techniques'
    },
    disease: {
        'bakteri_daun_bergaris': 'How to treat bacterial leaf streak in rice plants?',
        'bercak_coklat': 'Brown spot disease treatment and prevention in rice',
        'bercak_coklat_sempit': 'How to manage narrow brown spot in rice cultivation?',
        'blas': 'Rice blast disease management and prevention methods',
        'hawar_daun_bakteri': 'Treatment for bacterial leaf blight in rice plants',
        'tungro': 'How to control rice tungro disease and prevent spread?'
    }
};

// Translation of detection categories
const CATEGORY_TRANSLATIONS = {
    en: {
        soil: 'Soil Type',
        disease: 'Plant Disease',
        'Search for information': 'Search for information',
        'Learn more about': 'Learn more about',
        'Detection converted to search': 'Detection converted to search'
    },
    hi: {
        soil: 'मिट्टी का प्रकार',
        disease: 'पौधों का रोग',
        'Search for information': 'जानकारी के लिए खोजें',
        'Learn more about': 'के बारे में और जानें',
        'Detection converted to search': 'खोज में परिवर्तित किया गया'
    },
    te: {
        soil: 'నేల రకం',
        disease: 'మొక్క వ్యాధి',
        'Search for information': 'సమాచారం కోసం శోధించండి',
        'Learn more about': 'గురించి మరింత తెలుసుకోండి',
        'Detection converted to search': 'శోధనకు మార్చబడింది'
    }
};

// Disease name translations 
const DISEASE_DISPLAY_NAMES = {
    en: {
        'bakteri_daun_bergaris': 'Bacterial Leaf Streak',
        'bercak_coklat': 'Brown Spot Disease',
        'bercak_coklat_sempit': 'Narrow Brown Spot',
        'blas': 'Rice Blast Disease',
        'hawar_daun_bakteri': 'Bacterial Leaf Blight',
        'tungro': 'Rice Tungro Disease'
    },
    hi: {
        'bakteri_daun_bergaris': 'बैक्टीरियल लीफ स्ट्रीक',
        'bercak_coklat': 'भूरे धब्बे का रोग',
        'bercak_coklat_sempit': 'संकरा भूरा धब्बा',
        'blas': 'चावल का ब्लास्ट रोग',
        'hawar_daun_bakteri': 'बैक्टीरियल लीफ ब्लाइट',
        'tungro': 'धान का टुंग्रो रोग'
    },
    te: {
        'bakteri_daun_bergaris': 'బ్యాక్టీరియల్ లీఫ్ స్ట్రీక్',
        'bercak_coklat': 'బ్రౌన్ స్పాట్ వ్యాధి',
        'bercak_coklat_sempit': 'నారో బ్రౌన్ స్పాట్',
        'blas': 'వరి బ్లాస్ట్ వ్యాధి',
        'hawar_daun_bakteri': 'బ్యాక్టీరియల్ లీఫ్ బ్లైట్',
        'tungro': 'వరి టుంగ్రో వ్యాధి'
    }
};

/**
 * Initialize the detection to search integration
 */
function initDetectionToSearch() {
    // Create detection notification area
    createDetectionNotificationArea();
    
    // Start polling for detection results
    pollDetectionResults();
}

/**
 * Create the detection notification area in the UI
 */
function createDetectionNotificationArea() {
    // Create the notification container if it doesn't exist
    if (!document.getElementById('detectionNotification')) {
        const notificationArea = document.createElement('div');
        notificationArea.id = 'detectionNotification';
        notificationArea.className = 'detection-notification hidden';
        
        notificationArea.innerHTML = `
            <div class="detection-notification-content">
                <div class="detection-icon">
                    <i class="fas fa-camera"></i>
                </div>
                <div class="detection-info">
                    <h4 class="detection-title">Detection Found</h4>
                    <p class="detection-description"></p>
                </div>
                <div class="detection-actions">
                    <button class="detection-search-btn">
                        <i class="fas fa-search"></i> <span>Search</span>
                    </button>
                    <button class="detection-dismiss-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add to the body
        document.body.appendChild(notificationArea);
        
        // Add event listeners
        const searchBtn = notificationArea.querySelector('.detection-search-btn');
        const dismissBtn = notificationArea.querySelector('.detection-dismiss-btn');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', handleDetectionSearch);
        }
        
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                notificationArea.classList.add('hidden');
            });
        }
        
        // Add styles
        addDetectionNotificationStyles();
    }
}

/**
 * Poll for detection results from the API
 */
function pollDetectionResults() {
    // Only poll if we're on the home page or search page
    if (!window.location.pathname.includes('content.html')) {
        fetchDetectionResults();
        setTimeout(pollDetectionResults, 2000); // Poll every 2 seconds
    } else {
        setTimeout(pollDetectionResults, 5000); // Poll less frequently if we're on a content page
    }
}

/**
 * Fetch detection results from the API
 */
function fetchDetectionResults() {
    fetch('http://localhost:8080/api/detections')
        .then(response => response.json())
        .then(data => {
            processDetectionResults(data.detections);
        })
        .catch(error => {
            console.log('Error fetching detection results:', error);
        });
}

/**
 * Process the detection results and show notification if needed
 * @param {Object} detections - Detection results object
 */
function processDetectionResults(detections) {
    // Check if any detection has occurred
    let highestConfidence = 0;
    let bestDetection = null;
    let bestCategory = null;
    
    // Find the detection with the highest confidence
    for (const category in detections) {
        const detection = detections[category];
        if (detection.detected && detection.confidence > highestConfidence) {
            highestConfidence = detection.confidence;
            bestDetection = detection;
            bestCategory = category;
        }
    }
    
    // If we have a detection with high confidence, show notification
    if (bestDetection && highestConfidence > 70) {
        showDetectionNotification(bestCategory, bestDetection.class);
    }
}

/**
 * Show a notification for a detected object
 * @param {string} category - Detection category (soil, disease)
 * @param {string} className - Detected class name
 */
function showDetectionNotification(category, className) {
    const notificationArea = document.getElementById('detectionNotification');
    if (!notificationArea) return;
    
    // Get current language
    const language = getCurrentLanguage ? getCurrentLanguage() : 'en';
    
    // Get the display name for the detected class
    let displayName = className;
    if (category === 'disease' && DISEASE_DISPLAY_NAMES[language] && DISEASE_DISPLAY_NAMES[language][className]) {
        displayName = DISEASE_DISPLAY_NAMES[language][className];
    }
    
    // Set notification content
    const categoryText = CATEGORY_TRANSLATIONS[language][category] || category;
    const title = document.querySelector('.detection-title');
    const description = document.querySelector('.detection-description');
    const searchBtnText = notificationArea.querySelector('.detection-search-btn span');
    
    if (title) title.textContent = categoryText;
    if (description) description.textContent = displayName;
    if (searchBtnText) searchBtnText.textContent = CATEGORY_TRANSLATIONS[language]['Search for information'];
    
    // Store the detection info for search action
    notificationArea.dataset.category = category;
    notificationArea.dataset.className = className;
    
    // Show the notification
    notificationArea.classList.remove('hidden');
    
    // Auto-hide after 15 seconds
    setTimeout(() => {
        notificationArea.classList.add('hidden');
    }, 15000);
}

/**
 * Handle the detection search button click
 */
function handleDetectionSearch() {
    const notificationArea = document.getElementById('detectionNotification');
    if (!notificationArea) return;
    
    const category = notificationArea.dataset.category;
    const className = notificationArea.dataset.className;
    
    if (category && className) {
        // Get the search prompt
        const searchPrompt = getSearchPromptForDetection(category, className);
        
        // Redirect to search page with the query
        window.location.href = `search.html?query=${encodeURIComponent(searchPrompt)}`;
    }
    
    // Hide the notification
    notificationArea.classList.add('hidden');
}

/**
 * Get the search prompt for a detection
 * @param {string} category - Detection category
 * @param {string} className - Detected class name
 * @returns {string} - Search prompt
 */
function getSearchPromptForDetection(category, className) {
    // Get the predefined prompt if available
    if (DETECTION_SEARCH_PROMPTS[category] && DETECTION_SEARCH_PROMPTS[category][className]) {
        return DETECTION_SEARCH_PROMPTS[category][className];
    }
    
    // Fallback to a generic prompt
    const language = getCurrentLanguage ? getCurrentLanguage() : 'en';
    const displayName = (category === 'disease' && DISEASE_DISPLAY_NAMES[language][className]) 
        ? DISEASE_DISPLAY_NAMES[language][className] 
        : className;
    
    return `${CATEGORY_TRANSLATIONS[language]['Learn more about']} ${displayName}`;
}

/**
 * Add styles for the detection notification
 */
function addDetectionNotificationStyles() {
    if (!document.getElementById('detectionNotificationStyles')) {
        const style = document.createElement('style');
        style.id = 'detectionNotificationStyles';
        
        style.textContent = `
            .detection-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                width: 350px;
                z-index: 1000;
                overflow: hidden;
                transition: all 0.3s ease;
                border-left: 4px solid #4CAF50;
            }
            
            .detection-notification.hidden {
                transform: translateX(400px);
                opacity: 0;
            }
            
            .detection-notification-content {
                display: flex;
                align-items: center;
                padding: 15px;
            }
            
            .detection-icon {
                width: 40px;
                height: 40px;
                background-color: #E8F5E9;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                flex-shrink: 0;
            }
            
            .detection-icon i {
                color: #4CAF50;
                font-size: 18px;
            }
            
            .detection-info {
                flex: 1;
            }
            
            .detection-title {
                margin: 0 0 5px 0;
                font-size: 14px;
                color: #757575;
            }
            
            .detection-description {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #212121;
            }
            
            .detection-actions {
                display: flex;
                align-items: center;
                margin-top: 12px;
            }
            
            .detection-search-btn {
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                margin-right: 10px;
                font-size: 14px;
                display: flex;
                align-items: center;
                transition: background-color 0.2s ease;
            }
            
            .detection-search-btn:hover {
                background-color: #388E3C;
            }
            
            .detection-search-btn i {
                margin-right: 5px;
            }
            
            .detection-dismiss-btn {
                background-color: transparent;
                border: none;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #757575;
                transition: background-color 0.2s ease;
            }
            
            .detection-dismiss-btn:hover {
                background-color: #f1f1f1;
                color: #212121;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDetectionToSearch); 