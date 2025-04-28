/**
 * Animated Background and Particles Effects
 */

document.addEventListener('DOMContentLoaded', () => {
  // Create gradient background
  createAnimatedBackground();
  
  // Create floating particles
  createParticles();
  
  // Add night mode toggle
  setupNightModeToggle();
});

/**
 * Create the animated gradient background
 */
function createAnimatedBackground() {
  const gradientElement = document.createElement('div');
  gradientElement.className = 'animated-gradient';
  document.body.prepend(gradientElement);
  
  // Wrap main content in container for styling
  const main = document.querySelector('main');
  if (main) {
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-wrapper';
    
    // Move main content into wrapper
    main.parentNode.insertBefore(contentWrapper, main);
    contentWrapper.appendChild(main);
  }
}

/**
 * Create floating particles
 */
function createParticles() {
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles';
  document.body.prepend(particlesContainer);
  
  // Create particles
  const particleCount = 30; // Adjust based on performance
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random positions
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    
    // Random sizes
    const size = 3 + Math.random() * 8;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random animation delay
    particle.style.animationDelay = `${Math.random() * 20}s`;
    
    // Random animation duration
    particle.style.animationDuration = `${15 + Math.random() * 30}s`;
    
    particlesContainer.appendChild(particle);
  }
}

/**
 * Setup night mode toggle
 */
function setupNightModeToggle() {
  // Create night mode toggle button
  const nightModeToggle = document.createElement('button');
  nightModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  nightModeToggle.className = 'night-mode-toggle';
  nightModeToggle.setAttribute('title', 'Toggle Night Mode');
  
  // Add toggle functionality
  nightModeToggle.addEventListener('click', toggleNightMode);
  
  // Add to document
  document.body.appendChild(nightModeToggle);
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .night-mode-toggle {
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: var(--primary);
      color: white;
      border: none;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      cursor: pointer;
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    
    .night-mode-toggle:hover {
      transform: scale(1.1);
      background-color: var(--primary-dark);
    }
    
    body.night-mode .night-mode-toggle {
      background-color: #FFC107;
    }
    
    body.night-mode .night-mode-toggle i {
      transform: rotate(180deg);
    }
  `;
  document.head.appendChild(style);
  
  // Check for saved preference
  const nightModeEnabled = localStorage.getItem('nightMode') === 'true';
  if (nightModeEnabled) {
    document.body.classList.add('night-mode');
    nightModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

/**
 * Toggle night mode
 */
function toggleNightMode() {
  const body = document.body;
  body.classList.toggle('night-mode');
  
  const isNightMode = body.classList.contains('night-mode');
  localStorage.setItem('nightMode', isNightMode);
  
  // Update toggle icon
  const toggle = document.querySelector('.night-mode-toggle');
  if (toggle) {
    toggle.innerHTML = isNightMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
} 