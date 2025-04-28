class ContentLoader {
    constructor() {
        this.loader = document.getElementById('contentLoader');
        this.errorTemplate = document.getElementById('errorTemplate');
    }

    show() {
        if (this.loader) {
            this.loader.style.display = 'flex';
        }
    }

    hide() {
        if (this.loader) {
            this.loader.style.display = 'none';
        }
    }

    showError(container, customMessage = null) {
        if (this.errorTemplate) {
            const errorContent = this.errorTemplate.content.cloneNode(true);
            if (customMessage) {
                const errorText = errorContent.querySelector('p');
                if (errorText) {
                    errorText.textContent = customMessage;
                }
            }
            container.innerHTML = '';
            container.appendChild(errorContent);
        }
    }

    async loadContent(url) {
        try {
            this.show();
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const content = await response.text();
            if (this.mainContent) {
                this.mainContent.innerHTML = content;
            }
        } catch (error) {
            console.error('Error loading content:', error);
            this.showError(this.mainContent);
        } finally {
            this.hide();
        }
    }
}

// Export the ContentLoader class
export default ContentLoader; 