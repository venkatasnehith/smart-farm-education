/**
 * Detection Content Integration
 * Maps detection results to specific content pages
 */

// Mapping of detection results to content IDs
const DETECTION_CONTENT_MAP = {
    disease: {
        'bakteri_daun_bergaris': 'bacterial_leaf_streak',
        'bercak_coklat': 'brown_spot_disease',
        'bercak_coklat_sempit': 'narrow_brown_spot',
        'blas': 'rice_blast',
        'hawar_daun_bakteri': 'bacterial_leaf_blight',
        'tungro': 'rice_tungro'
    },
    soil: {
        'Alluvial': 'alluvial_soil',
        'Black': 'black_soil',
        'Clay': 'clay_soil',
        'Red': 'red_soil'
    }
};

// Translation of detection to content buttons
const DETECTION_CONTENT_TRANSLATIONS = {
    en: {
        'View detailed information': 'View detailed information',
        'More about': 'More about',
        'Learn about': 'Learn about',
        'Detailed guide': 'Detailed guide'
    },
    hi: {
        'View detailed information': 'विस्तृत जानकारी देखें',
        'More about': 'के बारे में और',
        'Learn about': 'के बारे में जानें',
        'Detailed guide': 'विस्तृत गाइड'
    },
    te: {
        'View detailed information': 'వివరణాత్మక సమాచారాన్ని వీక్షించండి',
        'More about': 'గురించి మరింత',
        'Learn about': 'గురించి తెలుసుకోండి',
        'Detailed guide': 'వివరణాత్మక మార్గదర్శి'
    }
};

/**
 * Add content button to result boxes
 */
function addContentButtons() {
    // Find all result boxes
    const resultBoxes = document.querySelectorAll('.result-box');
    
    if (!resultBoxes || resultBoxes.length === 0) {
        // Try again in 1 second if elements aren't loaded yet
        setTimeout(addContentButtons, 1000);
        return;
    }
    
    resultBoxes.forEach(box => {
        // Get the category from the ID
        const resultElement = box.querySelector('[id$="-result"]');
        if (!resultElement) return;
        
        const category = resultElement.id.replace('-result', '');
        
        // Check if content button already exists
        if (box.querySelector('.content-button')) return;
        
        // Create content button container if it doesn't exist
        let actionContainer = box.querySelector('.result-actions');
        if (!actionContainer) {
            actionContainer = document.createElement('div');
            actionContainer.className = 'result-actions';
            box.appendChild(actionContainer);
        }
        
        // Create content button
        const contentBtn = document.createElement('button');
        contentBtn.className = 'content-button';
        contentBtn.innerHTML = `<i class="fas fa-book-open"></i> <span>${getCurrentTranslation('View detailed information')}</span>`;
        contentBtn.style.display = 'none'; // Hide initially
        
        // Add button to container
        actionContainer.appendChild(contentBtn);
        
        // Add click event
        contentBtn.addEventListener('click', () => {
            const detectionClass = box.getAttribute('data-detected-class');
            if (detectionClass) {
                navigateToContent(category, detectionClass);
            }
        });
    });
    
    // Start listening for detection updates
    listenForDetectionUpdates();
}

/**
 * Get current translation based on language
 * @param {string} key - Translation key
 * @returns {string} - Translated text
 */
function getCurrentTranslation(key) {
    const language = getCurrentLanguage ? getCurrentLanguage() : 'en';
    return DETECTION_CONTENT_TRANSLATIONS[language][key] || key;
}

/**
 * Listen for detection updates to show/hide content buttons
 */
function listenForDetectionUpdates() {
    setInterval(() => {
        fetch('http://localhost:8080/api/detections')
            .then(response => response.json())
            .then(data => {
                updateContentButtons(data.detections);
            })
            .catch(error => {
                console.log('Error fetching detection data:', error);
            });
    }, 1500);
}

/**
 * Update content buttons based on current detections
 * @param {Object} detections - Detection results
 */
function updateContentButtons(detections) {
    // Process each category
    for (const category in detections) {
        const detection = detections[category];
        const resultBox = document.querySelector(`.${category}-box`);
        
        if (!resultBox) continue;
        
        const contentBtn = resultBox.querySelector('.content-button');
        if (!contentBtn) continue;
        
        if (detection.detected && detection.confidence > 60) {
            // Show button and update data attribute
            contentBtn.style.display = 'flex';
            resultBox.setAttribute('data-detected-class', detection.class);
            
            // Update button text
            const btnText = contentBtn.querySelector('span');
            if (btnText) {
                const language = getCurrentLanguage ? getCurrentLanguage() : 'en';
                let displayName = detection.class;
                
                // Get display name for diseases
                if (category === 'disease' && window.DISEASE_DISPLAY_NAMES && 
                    window.DISEASE_DISPLAY_NAMES[language] && 
                    window.DISEASE_DISPLAY_NAMES[language][detection.class]) {
                    displayName = window.DISEASE_DISPLAY_NAMES[language][detection.class];
                }
                
                btnText.textContent = `${getCurrentTranslation('Learn about')} ${displayName}`;
            }
        } else {
            // Hide button
            contentBtn.style.display = 'none';
            resultBox.removeAttribute('data-detected-class');
        }
    }
}

/**
 * Navigate to the content page for a specific detection
 * @param {string} category - Detection category
 * @param {string} className - Detected class name
 */
function navigateToContent(category, className) {
    // Get the content ID from the mapping
    let contentId = null;
    
    if (DETECTION_CONTENT_MAP[category] && DETECTION_CONTENT_MAP[category][className]) {
        contentId = DETECTION_CONTENT_MAP[category][className];
    }
    
    if (contentId) {
        // Navigate to content page
        window.location.href = `content.html?id=${contentId}`;
    } else {
        // Fallback to search if mapping doesn't exist
        const searchPrompt = getSearchPromptForClass(category, className);
        window.location.href = `search.html?query=${encodeURIComponent(searchPrompt)}`;
    }
}

/**
 * Get search prompt for a class name if content mapping doesn't exist
 * @param {string} category - Detection category
 * @param {string} className - Detected class name
 * @returns {string} - Search prompt
 */
function getSearchPromptForClass(category, className) {
    // Use the mapping from image_to_query.js if available
    if (window.DETECTION_SEARCH_PROMPTS && 
        window.DETECTION_SEARCH_PROMPTS[category] && 
        window.DETECTION_SEARCH_PROMPTS[category][className]) {
        return window.DETECTION_SEARCH_PROMPTS[category][className];
    }
    
    // Fallback to generic search query
    const language = getCurrentLanguage ? getCurrentLanguage() : 'en';
    let displayName = className;
    
    if (category === 'disease' && window.DISEASE_DISPLAY_NAMES && 
        window.DISEASE_DISPLAY_NAMES[language] && 
        window.DISEASE_DISPLAY_NAMES[language][className]) {
        displayName = window.DISEASE_DISPLAY_NAMES[language][className];
    }
    
    return `Information about ${displayName} in farming`;
}

/**
 * Add button styles
 */
function addContentButtonStyles() {
    if (!document.getElementById('contentButtonStyles')) {
        const style = document.createElement('style');
        style.id = 'contentButtonStyles';
        
        style.textContent = `
            .result-actions {
                display: flex;
                justify-content: flex-end;
                margin-top: 15px;
            }
            
            .content-button {
                display: flex;
                align-items: center;
                background-color: #8D6E63;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s ease;
                font-size: 14px;
            }
            
            .content-button:hover {
                background-color: #6D4C41;
            }
            
            .content-button i {
                margin-right: 8px;
                font-size: 16px;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    addContentButtonStyles();
    // Add a slight delay to ensure detection.js has initialized
    setTimeout(addContentButtons, 1000);
}); 