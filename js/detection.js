/**
 * Detection handler for integrating webcam feed and model detections
 */

// Disease name translations from original to English
const DISEASE_TRANSLATIONS = {
    'bakteri_daun_bergaris': 'Bacterial Leaf Streak',
    'bercak_coklat': 'Brown Spot Disease',
    'bercak_coklat_sempit': 'Narrow Brown Spot',
    'blas': 'Rice Blast Disease',
    'hawar_daun_bakteri': 'Bacterial Leaf Blight',
    'tungro': 'Rice Tungro Disease'
};

// Suggestions database for different categories
const SUGGESTIONS = {
    soil: {
        'Alluvial': {
            properties: 'Highly fertile soil with good water retention and nutrient content.',
            recommendations: [
                'Ideal for crops like rice, wheat, and sugarcane',
                'Maintain organic matter through mulching',
                'Regular but moderate irrigation needed',
                'Good for most vegetable crops'
            ]
        },
        'Black': {
            properties: 'High in minerals, poor in nitrogen, good water retention.',
            recommendations: [
                'Add nitrogen-rich fertilizers',
                'Best for cotton, wheat, and oilseeds',
                'Practice crop rotation to maintain fertility',
                'Avoid overwatering as it becomes sticky'
            ]
        },
        'Clay': {
            properties: 'Dense, high water retention, rich in nutrients but poor drainage.',
            recommendations: [
                'Add organic matter to improve structure',
                'Install proper drainage systems',
                'Avoid working soil when too wet',
                'Best moisture level: 20-30%',
                'Add sand or gypsum to improve texture'
            ]
        },
        'Red': {
            properties: 'Low in nitrogen and phosphorus, good for aeration.',
            recommendations: [
                'Regular fertilization needed',
                'Suitable for drought-resistant crops',
                'Add organic compost regularly',
                'Frequent but light irrigation recommended'
            ]
        }
    },
    disease: {
        'bakteri_daun_bergaris': {
            symptoms: 'Yellow or brown streaks along leaf veins that eventually merge and cause leaf wilting.',
            prevention: [
                'Use disease-resistant varieties',
                'Practice crop rotation',
                'Apply copper-based bactericides',
                'Maintain field sanitation',
                'Remove infected plants immediately'
            ],
            severity: 'Moderate to high'
        },
        'bercak_coklat': {
            symptoms: 'Oval-shaped brown spots with yellow halos on leaves. Spots may merge in severe infections.',
            prevention: [
                'Apply appropriate fungicides',
                'Ensure proper plant spacing',
                'Avoid overhead irrigation',
                'Remove infected debris',
                'Improve air circulation'
            ],
            severity: 'Moderate'
        },
        'bercak_coklat_sempit': {
            symptoms: 'Narrow, elongated brown lesions on leaves that run parallel to the leaf veins.',
            prevention: [
                'Use resistant varieties',
                'Maintain field sanitation',
                'Apply preventive fungicides',
                'Practice crop rotation',
                'Monitor humidity levels'
            ],
            severity: 'Low to moderate'
        },
        'blas': {
            symptoms: 'Diamond-shaped gray or white lesions with dark borders on leaves, stems, and panicles.',
            prevention: [
                'Plant resistant varieties',
                'Balance nitrogen fertilization',
                'Apply fungicides preventively',
                'Improve air circulation',
                'Avoid excessive nitrogen'
            ],
            severity: 'Very high'
        },
        'hawar_daun_bakteri': {
            symptoms: 'Water-soaked yellowish stripes that start at leaf tips and edges, eventually turning gray to white.',
            prevention: [
                'Use hot water seed treatment',
                'Apply copper-based bactericides',
                'Plant resistant varieties',
                'Avoid overhead irrigation',
                'Maintain field sanitation'
            ],
            severity: 'High'
        },
        'tungro': {
            symptoms: 'Yellow to orange discoloration of leaves, stunted growth, and reduced tillering.',
            prevention: [
                'Control leafhopper vectors',
                'Use resistant varieties',
                'Practice synchronous planting',
                'Remove infected plants',
                'Maintain weed-free fields'
            ],
            severity: 'Very high'
        }
    }
};

/**
 * Update detection feed and results from API data
 */
function updateDetectionFeed() {
    fetch('http://localhost:8080/api/detections')
        .then(response => response.json())
        .then(data => {
            // Update video feed
            if (data.frame) {
                document.getElementById('videoFeed').src = 'data:image/jpeg;base64,' + data.frame;
                
                // Update detection status message
                const statusElement = document.querySelector('.detection-status');
                if (statusElement) {
                    const hasDetections = Object.values(data.detections).some(item => item.detected);
                    if (hasDetections) {
                        statusElement.textContent = 'Objects detected in video feed';
                        statusElement.className = 'detection-status detection-active';
    } else {
                        statusElement.textContent = 'AI analyzing video feed...';
                        statusElement.className = 'detection-status';
                    }
                }
            }
            
            // Update detection results
            updateResultBox('soil-result', data.detections.soil, 'soil');
            updateResultBox('disease-result', data.detections.disease, 'disease');
        })
        .catch(error => console.error('Error:', error));
}

/**
 * Translate a disease name to English
 * @param {string} diseaseName - Original disease name
 * @returns {string} - Translated disease name
 */
function translateDiseaseName(diseaseName) {
    return DISEASE_TRANSLATIONS[diseaseName] || diseaseName;
}

/**
 * Get confidence level color based on confidence value
 * @param {number} confidence - Confidence value (0-100)
 * @returns {string} - CSS color value
 */
function getConfidenceColor(confidence) {
    if (confidence >= 90) return '#4CAF50'; // High confidence - green
    if (confidence >= 70) return '#8BC34A'; // Good confidence - light green
    if (confidence >= 50) return '#FFC107'; // Medium confidence - yellow
    return '#FF5722'; // Low confidence - orange/red
}

/**
 * Format confidence value with descriptive text
 * @param {number} confidence - Confidence value (0-100)
 * @returns {string} - Formatted confidence text
 */
function formatConfidence(confidence) {
    if (confidence >= 90) return 'Very High';
    if (confidence >= 70) return 'High';
    if (confidence >= 50) return 'Medium';
    return 'Low';
}

/**
 * Get severity indicator HTML based on severity level
 * @param {string} severity - Severity level text
 * @returns {string} - HTML for severity indicator
 */
function getSeverityIndicator(severity) {
    let color = '';
    let icon = '';
    
    switch(severity.toLowerCase()) {
        case 'low':
            color = '#4CAF50';
            icon = 'info';
            break;
        case 'low to moderate':
            color = '#8BC34A';
            icon = 'info';
            break;
        case 'moderate':
            color = '#FFC107';
            icon = 'exclamation';
            break;
        case 'moderate to high':
            color = '#FF9800';
            icon = 'exclamation';
            break;
        case 'high':
            color = '#F44336';
            icon = 'exclamation-triangle';
            break;
        case 'very high':
            color = '#D32F2F';
            icon = 'exclamation-circle';
            break;
        default:
            color = '#757575';
            icon = 'info';
    }
    
    return `<span class="severity-indicator" style="background-color: ${color};">
                <i class="fas fa-${icon}"></i> ${severity} risk
            </span>`;
}

/**
 * Update a result box with detection data and suggestions
 * @param {string} elementId - ID of the HTML element to update
 * @param {Object} result - Detection result object
 * @param {string} category - Category of the detection (soil, disease)
 */
function updateResultBox(elementId, result, category) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Update parent result box with active class if detected
    const resultBox = element.closest('.result-box');
    if (resultBox) {
        if (result.detected) {
            resultBox.classList.add('active-detection');
        } else {
            resultBox.classList.remove('active-detection');
        }
    }
    
    if (result.detected) {
        const confidence = result.confidence * 100;
        const displayName = category === 'disease' ? translateDiseaseName(result.class) : result.class;
        const suggestions = SUGGESTIONS[category][result.class];
        const confidenceColor = getConfidenceColor(confidence);
        const confidenceText = formatConfidence(confidence);
        
        let suggestionHtml = '';
        if (suggestions) {
            if (category === 'soil') {
                suggestionHtml = `
                    <div class="suggestions-box">
                        <h4><i class="fas fa-info-circle"></i> Soil Properties:</h4>
                        <p>${suggestions.properties}</p>
                        <h4><i class="fas fa-lightbulb"></i> Farming Recommendations:</h4>
                        <ul>
                            ${suggestions.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                `;
            } else if (category === 'disease') {
                const severityIndicator = getSeverityIndicator(suggestions.severity);
                
                suggestionHtml = `
                    <div class="suggestions-box">
                        <div class="disease-info-header">
                            <h4><i class="fas fa-exclamation-triangle"></i> Symptoms:</h4>
                            ${severityIndicator}
                        </div>
                        <p>${suggestions.symptoms}</p>
                        
                        <h4><i class="fas fa-shield-alt"></i> Prevention & Control:</h4>
                        <ul>
                            ${suggestions.prevention.map(prev => `<li>${prev}</li>`).join('')}
                        </ul>
                        
                        <div class="disease-note">
                            <p><small><i class="fas fa-language"></i> Original name: ${result.class}</small></p>
                        </div>
                    </div>
                `;
            }
        }

        element.innerHTML = `
            <div class="detection-result">
                <div class="result-header-info">
                    <div class="detected-class">
                        <strong>${displayName}</strong>
                    </div>
                    <div class="confidence-badge" style="background-color: ${confidenceColor}">
                        ${confidenceText} confidence (${confidence.toFixed(1)}%)
                    </div>
                </div>
                <div class="confidence-bar">
                    <div class="confidence-level" style="width: ${confidence}%; background-color: ${confidenceColor}"></div>
                </div>
                ${suggestionHtml}
            </div>
        `;
    } else {
        element.innerHTML = `
            <div class="waiting-container">
                <p class="waiting-text">
                    <i class="fas fa-search"></i> 
                    Waiting for ${category === 'soil' ? 'soil type' : 'plant disease'} detection...
                </p>
            </div>
        `;
    }
}

// Start updating the detection feed when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS for enhanced detection results
    addEnhancedStyles();
    
    // Update every 50ms
    setInterval(updateDetectionFeed, 50);
});

/**
 * Add enhanced CSS styles for detection results
 */
function addEnhancedStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .active-detection {
            border-top-width: 5px;
            transform: translateY(-5px);
        }
        
        .result-header-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .detected-class {
            font-size: 1.2rem;
            color: var(--secondary-dark);
        }
        
        .confidence-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            color: white;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .waiting-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100px;
        }
        
        .detection-status.detection-active {
            color: var(--primary);
            font-weight: 600;
        }
        
        .suggestions-box h4 i {
            margin-right: 5px;
        }
        
        .disease-info-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .severity-indicator {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            color: white;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .severity-indicator i {
            margin-right: 4px;
        }
        
        .disease-note {
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px dashed #e0e0e0;
            color: #757575;
        }
    `;
    document.head.appendChild(style);
} 