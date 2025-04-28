# FarmKnowledge with Multi-Model Detection

This application integrates multiple YOLO models for real-time detection of farming-related elements directly into a web interface.

## Features

- Real-time detection of 3 different categories:
  - Soil types (Alluvial, Black, Clay, Red)
  - Weather conditions (Shine, Cloudy, Rain, Snow, Sunny)
  - Plant diseases (Bacterial Leaf Stripe, Brown Spot, Narrow Brown Spot, Blast, Bacterial Leaf Blight, Tungro)
- Display of detailed information about detected items
- Integration with a comprehensive farming knowledge website
- **NEW: AI-powered search functionality with Google Gemini model**
- **NEW: Smart detection-to-search integration - automatically search for information about detected items**
- **NEW: Direct navigation from detections to detailed content pages**
- **NEW: Multi-language support (English, Hindi, Telugu)**
- **NEW: Accessibility features including sign language support**

## Requirements

- Python 3.8 or higher
- A webcam
- The required model files (soilll.pt, weather.pt, wwww.pt)
- Google Gemini API key (for search functionality)

## Quick Installation

Use the installation script to quickly set up the environment:

```
python install.py
```

This will:
1. Create a virtual environment
2. Install the required packages
3. Check for the required model files
4. Provide instructions to run the application

## Manual Installation

1. Clone this repository
2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```
3. Set up the Google Gemini API key:
   - Create a .env file in the root directory
   - Add your API key: `GEMINI_API_KEY=your_api_key_here`

## Running the Application

### Option 1: Using the Startup Script (Recommended)

Simply run the startup script:

```
python start_farmknowledge.py
```

This script will:
- Check if you're in a virtual environment
- Verify your Gemini API key is set
- Start the Flask server
- Launch the detection system
- Open the web interface automatically

### Option 2: Manual Startup

1. Ensure all model files are in the main directory
2. Start the Flask server:
   ```
   python app.py
   ```
3. In a separate terminal, run the detection script:
   ```
   python detect_and_open.py
   ```

Both methods will:
- Open a webcam window showing detections
- Start a local web server on port 8080
- Open the FarmKnowledge website in your browser automatically

## How It Works

1. The Python script loads all YOLO models and processes the webcam feed
2. Detections are exposed via a simple API endpoint
3. The website fetches detection data and displays it in real-time
4. Information about detected items is shown below the webcam feed
5. AI-powered search functionality allows users to search for farming information
6. Detection results can be automatically converted to search queries
7. Detected items can be directly linked to detailed content pages

## Key Components

- **Detection System**: YOLO models to detect soil types and plant diseases
- **Web Interface**: Responsive frontend with multilingual support
- **AI Search**: Google Gemini-powered search for farming information
- **Content System**: Detailed articles about farming topics
- **Smart Integration**: Connects detections with relevant information

## File Structure

- `detect_and_open.py` - Main detection script
- `app.py` - Flask backend with Gemini AI integration
- `install.py` - Installation helper script
- `project/` - Website files
  - `index.html` - Main webpage
  - `search.html` - Search interface
  - `content.html` - Detailed content pages
  - `js/detection.js` - Handles detection data in the browser
  - `js/search.js` - Search functionality
  - `js/image_to_query.js` - **NEW: Detection to search integration**
  - `js/detection_content.js` - **NEW: Detection to content integration**
  - `js/farmingData.js` - Content database
  - `js/translations.js` - Multilingual support

## Customize

To add new models or detection categories:
1. Add your model files to the main directory
2. Update the MODEL_INFO array in detect_and_open.py
3. Add corresponding information in the getClassInformation function in detection.js
4. Update the DETECTION_SEARCH_PROMPTS in image_to_query.js
5. Update the DETECTION_CONTENT_MAP in detection_content.js 