/**
 * Main JavaScript file
 * Handles language switching, navigation, and global functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  // Language selection functionality
  setupLanguageSelector();
  
  // Sign language toggle
  setupSignLanguageToggle();
  
  // Mobile navigation toggle
  setupMobileNavigation();
  
  // Setup contact form
  setupContactForm();

  // Handle missing images
  handleMissingImages();
  
  // Generate and display tip of the day
  displayTipOfTheDay();
});

/**
 * Sets up language selection functionality
 */
function setupLanguageSelector() {
  const langButtons = document.querySelectorAll('.lang-btn');
  const currentLang = localStorage.getItem('selectedLanguage') || 'en';
  
  // Set initial language
  setLanguage(currentLang);
  
  // Mark the current language button as active
  langButtons.forEach(btn => {
    if (btn.getAttribute('data-lang') === currentLang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Add event listeners to language buttons
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      localStorage.setItem('selectedLanguage', lang);
      
      // Update active class
      langButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Apply translations
      setLanguage(lang);
    });
  });
}

/**
 * Sets the language and updates the UI
 * @param {string} lang - The language code ('en', 'hi', or 'te')
 */
function setLanguage(lang) {
  if (!window.translations || !window.translations[lang]) {
    console.error('Translations not available for language:', lang);
    return;
  }
  
  const translations = window.translations[lang];
  
  // Update all translatable elements
  document.querySelectorAll('[id]').forEach(element => {
    const key = element.id;
    if (translations[key]) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translations[key];
      } else {
        element.textContent = translations[key];
      }
    }
  });
  
  // Update document language
  document.documentElement.lang = lang;
  
  // Dispatch a custom event for other modules to respond to language changes
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

/**
 * Sets up sign language toggle functionality
 */
function setupSignLanguageToggle() {
  const signLanguageToggle = document.getElementById('signLanguageToggle');
  const signLanguageSection = document.getElementById('signLanguageSection');
  
  if (signLanguageToggle && signLanguageSection) {
    // Check if sign language mode was previously enabled
    const signLanguageEnabled = localStorage.getItem('signLanguageEnabled') === 'true';
    
    // Set initial state
    if (signLanguageEnabled) {
      signLanguageSection.classList.remove('hidden');
      signLanguageToggle.classList.add('active');
    }
    
    // Toggle sign language section when button is clicked
    signLanguageToggle.addEventListener('click', () => {
      const isCurrentlyEnabled = !signLanguageSection.classList.contains('hidden');
      
      if (isCurrentlyEnabled) {
        signLanguageSection.classList.add('hidden');
        signLanguageToggle.classList.remove('active');
        localStorage.setItem('signLanguageEnabled', 'false');
      } else {
        signLanguageSection.classList.remove('hidden');
        signLanguageToggle.classList.add('active');
        localStorage.setItem('signLanguageEnabled', 'true');
        
        // Load the appropriate sign language video if on content page
        if (window.loadSignLanguageVideo) {
          window.loadSignLanguageVideo();
        }
      }
    });
  }
}

/**
 * Sets up mobile navigation toggle functionality
 */
function setupMobileNavigation() {
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const nav = document.querySelector('nav');
  
  if (mobileNavToggle && nav) {
    mobileNavToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      
      // Change the icon based on the navigation state
      const icon = mobileNavToggle.querySelector('i');
      if (nav.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  }
}

/**
 * Sets up contact form submission
 */
function setupContactForm() {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form values
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;
      
      // In a real application, you would send this data to a server
      // For now, we'll just show an alert
      alert(`Thank you for your message, ${name}! We will get back to you soon.`);
      
      // Reset the form
      contactForm.reset();
    });
  }
}

/**
 * Helper function to get the current language
 * @returns {string} The current language code
 */
function getCurrentLanguage() {
  return localStorage.getItem('selectedLanguage') || 'en';
}

/**
 * Handles missing images by providing fallbacks
 */
function handleMissingImages() {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    img.onerror = function() {
      const fileName = img.src.split('/').pop().split('.')[0];
      
      // Check if the image is a category image
      if (fileName.includes('rotation') || fileName.includes('planning') || fileName.includes('planting')) {
        this.src = '../images/crop.png';
      } else if (fileName.includes('pest') || fileName.includes('disease')) {
        this.src = '../images/crop.png';
      } else if (fileName.includes('fertilizer') || fileName.includes('soil')) {
        this.src = '../images/soil.png';
      } else if (fileName.includes('harvest')) {
        this.src = '../images/crop.png';
      } else if (fileName.includes('equipment')) {
        this.src = '../images/equipment.png';
      } else if (fileName.includes('irrigation')) {
        this.src = '../images/irrigation.png';
      } else if (fileName.includes('livestock')) {
        this.src = '../images/livestock.png';
      } else if (fileName.includes('organic')) {
        this.src = '../images/organic.png';
      } else {
        // Default fallback
        this.src = '../images/logo.jpeg';
      }
      
      this.onerror = null; // Prevent infinite loop if fallback also fails
    };
  });
}

// Farming tips database
const farmingTips = {
  en: [
    "Rotate your crops annually to prevent soil nutrient depletion and reduce pest problems.",
    "Apply mulch around plants to conserve moisture and suppress weeds.",
    "Test your soil pH before planting to ensure optimal growing conditions for your crops.",
    "Water plants early in the morning to reduce evaporation and fungal problems.",
    "Introduce beneficial insects like ladybugs to naturally control pest populations.",
    "Interplant compatible crops to maximize space and increase biodiversity.",
    "Conserve water by installing a drip irrigation system for targeted watering.",
    "Use organic fertilizers for healthier soil and more nutritious crops.",
    "Start a compost pile to recycle kitchen and garden waste into valuable soil amendment.",
    "Protect seedlings from harsh sun with shade cloth during extreme heat.",
    "Harvest vegetables in the morning when their moisture content is highest.",
    "Keep detailed records of planting dates, yields, and problems for future reference.",
    "Practice deep watering less frequently rather than frequent shallow watering.",
    "Trap slugs and snails with shallow dishes of beer placed around the garden.",
    "Plant aromatic herbs among vegetables to repel certain pests naturally.",
    "Prune tomato plants to improve air circulation and reduce disease risk.",
    "Use row covers to protect crops from insects and extend the growing season.",
    "Apply neem oil as a natural fungicide and insect deterrent.",
    "Encourage pollinators by planting flowers near your vegetable garden.",
    "Save seeds from your best-performing plants for next year's garden."
  ],
  hi: [
    "मिट्टी के पोषक तत्वों को कम होने से रोकने और कीट समस्याओं को कम करने के लिए सालाना अपनी फसलों को बदलें।",
    "नमी बनाए रखने और खरपतवार को दबाने के लिए पौधों के चारों ओर मल्च लगाएं।",
    "बीज लगाने से पहले अपनी मिट्टी का pH परीक्षण करें ताकि आपकी फसलों के लिए इष्टतम उगाने की स्थिति सुनिश्चित हो।",
    "वाष्पीकरण और कवक समस्याओं को कम करने के लिए सुबह जल्दी पौधों को पानी दें।",
    "कीट आबादी को प्राकृतिक रूप से नियंत्रित करने के लिए लेडीबग जैसे लाभकारी कीड़ों को पेश करें।",
    "स्थान को अधिकतम करने और जैव विविधता बढ़ाने के लिए संगत फसलों को एक साथ लगाएं।",
    "लक्षित सिंचाई के लिए ड्रिप सिंचाई प्रणाली स्थापित करके पानी को बचाएं।",
    "स्वस्थ मिट्टी और अधिक पौष्टिक फसलों के लिए जैविक उर्वरकों का उपयोग करें।",
    "रसोई और बगीचे के कचरे को मूल्यवान मिट्टी संशोधन में पुनर्चक्रित करने के लिए एक कम्पोस्ट पाइल शुरू करें।",
    "अत्यधिक गर्मी के दौरान छाया कपड़े से कठोर धूप से रोपाई की रक्षा करें।",
    "सुबह में सब्जियों की कटाई करें जब उनकी नमी सामग्री सबसे अधिक होती है।",
    "भविष्य के संदर्भ के लिए रोपण की तारीखों, उपज और समस्याओं के विस्तृत रिकॉर्ड रखें।",
    "बार-बार उथले पानी देने के बजाय कम बार गहरा पानी देने का अभ्यास करें।",
    "बगीचे के आसपास रखे बीयर के छिछले बर्तनों से घोंघे और कौड़ियों को फंसाएं।",
    "कुछ कीटों को प्राकृतिक रूप से भगाने के लिए सब्जियों के बीच सुगंधित जड़ी-बूटियों को लगाएं।",
    "हवा के संचार को बेहतर बनाने और बीमारी के जोखिम को कम करने के लिए टमाटर के पौधों की छंटाई करें।",
    "कीड़ों से फसलों की रक्षा करने और उगाने के मौसम को बढ़ाने के लिए पंक्ति कवर का उपयोग करें।",
    "प्राकृतिक कवकनाशक और कीट निवारक के रूप में नीम के तेल का प्रयोग करें।",
    "अपने सब्जी उद्यान के पास फूल लगाकर परागणकों को प्रोत्साहित करें।",
    "अगले साल के बगीचे के लिए अपने सबसे अच्छा प्रदर्शन करने वाले पौधों से बीज बचाएं।"
  ],
  te: [
    "మట్టి పోషకాల క్షీణతను నిరోధించడానికి మరియు పురుగు సమస్యలను తగ్గించడానికి మీ పంటలను వార్షికంగా మారుస్తూ ఉండండి.",
    "తేమను సంరక్షించడానికి మరియు కలుపు మొక్కలను అణచడానికి మొక్కల చుట్టూ మల్చ్ ఉంచండి.",
    "మీ పంటలకు అనువైన పెరుగుదల పరిస్థితులను నిర్ధారించడానికి నాటడానికి ముందు మీ మట్టి pH పరీక్ష చేయించండి.",
    "ఆవిరి తగ్గించడానికి మరియు ఫంగల్ సమస్యలను తగ్గించడానికి ఉదయాన్నే మొక్కలకు నీరు పెట్టండి.",
    "పురుగుల జనాభాను సహజంగా నియంత్రించడానికి లేడీబగ్స్ వంటి ప్రయోజనకరమైన కీటకాలను పరిచయం చేయండి.",
    "స్థలాన్ని గరిష్టీకరించడానికి మరియు జైవ వైవిధ్యాన్ని పెంచడానికి అనుకూలమైన పంటలను కలిపి నాటండి.",
    "ఉద్దేశపూర్వక నీటిపారుదలకు డ్రిప్ ఇరిగేషన్ సిస్టమ్‌ను స్థాపించడం ద్వారా నీటిని పొదుపు చేయండి.",
    "ఆరోగ్యకరమైన మట్టి మరియు మరింత పోషకమైన పంటల కోసం జైవిక ఎరువులను ఉపయోగించండి.",
    "వంటగది మరియు తోట వ్యర్థాలను విలువైన మట్టి సవరణగా రీసైకిల్ చేయడానికి కంపోస్ట్ పైల్‌ను ప్రారంభించండి.",
    "తీవ్రమైన వేడి సమయంలో నాజూకైన మొలకలను షేడ్ క్లాత్‌తో కఠినమైన ఎండ నుండి రక్షించండి.",
    "తేమ శాతం అత్యధికంగా ఉన్నప్పుడు ఉదయం సమయంలో కూరగాయలను కోయండి.",
    "భవిష్యత్తు రిఫరెన్స్ కోసం నాటడం తేదీలు, దిగుబడి మరియు సమస్యల గురించి వివరణాత్మక రికార్డులను ఉంచండి.",
    "తరచుగా పైపై నీటిపారుదల కంటే తక్కువ సార్లు లోతైన నీటిపారుదల ప్రాక్టీస్ చేయండి.",
    "తోట చుట్టూ ఉంచిన బీర్ యొక్క పల్చని పాత్రలతో స్లగ్‌లు మరియు స్నెయిల్‌లను ట్రాప్ చేయండి.",
    "కొన్ని పురుగులను సహజంగా దూరంగా ఉంచడానికి కూరగాయల మధ్య సువాసన గల మూలికలను నాటండి.",
    "గాలి ప్రసరణను మెరుగుపరచడానికి మరియు వ్యాధి ప్రమాదాన్ని తగ్గించడానికి టమోటా మొక్కలను కత్తిరించండి.",
    "కీటకాల నుండి పంటలను రక్షించడానికి మరియు పెరుగుదల సీజన్‌ను పొడిగించడానికి వరుస కవర్‌లను ఉపయోగించండి.",
    "సహజ ఫంగిసైడ్ మరియు పురుగు నిరోధకంగా వేప నూనెను వర్తించండి.",
    "మీ కూరగాయల తోట దగ్గర పూలు నాటడం ద్వారా పరాగసంపర్కాన్ని ప్రోత్సహించండి.",
    "మీ తదుపరి తోటకు మీ అత్యుత్తమ ప్రదర్శన ఇచ్చే మొక్కల నుండి విత్తనాలను సేకరించండి."
  ]
};

/**
 * Displays a random farming tip of the day
 */
function displayTipOfTheDay() {
  const tipElement = document.getElementById('tip-text');
  
  if (tipElement) {
    const currentLang = getCurrentLanguage();
    const tips = farmingTips[currentLang] || farmingTips.en;
    
    // Get today's date and use it as a seed for selecting a tip
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    // Generate a pseudo-random number based on the date
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Use the hash to select a tip (ensures same tip for the whole day)
    const tipIndex = Math.abs(hash) % tips.length;
    
    // Display the tip
    tipElement.textContent = tips[tipIndex];
    
    // Update tip when language changes
    document.addEventListener('languageChanged', (event) => {
      const newLang = event.detail.language;
      const newTips = farmingTips[newLang] || farmingTips.en;
      tipElement.textContent = newTips[tipIndex];
    });
  }
}

// Make getCurrentLanguage available globally
window.getCurrentLanguage = getCurrentLanguage;