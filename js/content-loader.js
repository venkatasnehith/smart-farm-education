document.addEventListener('DOMContentLoaded', function() {
    const contentLoader = document.getElementById('contentLoader');
    const mainContent = document.querySelector('main');

    // Show loading animation
    function showLoader() {
        contentLoader.style.display = 'flex';
    }

    // Hide loading animation
    function hideLoader() {
        contentLoader.style.display = 'none';
    }

    // Display error message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        mainContent.appendChild(errorDiv);
    }

    // Function to load content
    async function loadContent(url) {
        showLoader();
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to load content');
            }
            const content = await response.text();
            mainContent.innerHTML = content;
        } catch (error) {
            showError('Error loading content. Please try again later.');
            console.error('Content loading error:', error);
        } finally {
            hideLoader();
        }
    }

    // Handle read more buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('read-more-btn')) {
            e.preventDefault();
            const url = e.target.getAttribute('href');
            if (url) {
                loadContent(url);
            }
        }
    });

    // Initialize by hiding the loader
    hideLoader();
}); 