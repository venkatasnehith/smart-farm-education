from flask import Flask, render_template, request, jsonify
import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
import re

# Load environment variables
load_dotenv()

# Configure the Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use gemini-1.5-flash instead of gemini-pro for improved responses
model = genai.GenerativeModel('gemini-1.5-flash')

# Custom generation config for better responses
generation_config = {
    "temperature": 0.2,  # Lower temperature for more factual responses
    "top_p": 0.8,
    "top_k": 40,
    "max_output_tokens": 2048,  # Longer outputs for comprehensive answers
}

# Create a history store for context-aware conversations
conversation_history = {}

app = Flask(__name__, static_folder=".", template_folder=".")

# Load expert farming knowledge data
def load_farming_knowledge():
    try:
        # This would ideally be a real farming knowledge database
        return {
            "crops": ["rice", "wheat", "maize", "cotton", "sugarcane"],
            "soil_types": ["alluvial", "black", "clay", "red", "sandy"],
            "pests": ["aphids", "bollworms", "stem borers", "leaf folders"],
            "seasons": ["kharif", "rabi", "zaid"]
        }
    except Exception as e:
        print(f"Error loading farming knowledge: {e}")
        return {}

# Load farming knowledge
farming_knowledge = load_farming_knowledge()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search')
def search_page():
    return render_template('search.html')

# Enhanced search API with language support and contextual history
@app.route('/api/search', methods=['POST'])
def search_api():
    data = request.get_json()
    
    if not data or 'query' not in data:
        return jsonify({'error': 'No query provided'}), 400
    
    query = data['query']
    language = data.get('language', 'en')  # Default to English if not specified
    session_id = data.get('session_id', 'default')  # For maintaining conversation context
    
    try:
        # Initialize conversation history if not exists
        if session_id not in conversation_history:
            conversation_history[session_id] = []
        
        # Check if the query is a follow-up question
        is_followup = detect_followup_question(query)
        
        # Format the prompt with advanced prompting techniques
        prompt = create_enhanced_prompt(query, language, is_followup, session_id)
        
        # Get response from Gemini API with custom config
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        # Process the response to enhance it further
        processed_response = process_response(response.text, language)
        
        # Update conversation history
        conversation_history[session_id].append({
            "query": query,
            "response": processed_response
        })
        
        # Limit history to last 5 exchanges to prevent token limits
        if len(conversation_history[session_id]) > 5:
            conversation_history[session_id] = conversation_history[session_id][-5:]
        
        # Return the enhanced response
        return jsonify({
            'query': query,
            'content': processed_response,
            'is_followup': is_followup
        })
    
    except Exception as e:
        print(f"Error calling Gemini API: {str(e)}")
        return jsonify({'error': 'Failed to process search query'}), 500

def detect_followup_question(query):
    """Detect if a query is likely a follow-up question"""
    followup_patterns = [
        r'\b(what|how|why|when|where|who|which) (about|if|is|are|was|were)\b',
        r'\b(and|but|also|then|so)\b',
        r'\b(this|that|these|those|it|they|them)\b',
        r'\?$'
    ]
    
    for pattern in followup_patterns:
        if re.search(pattern, query.lower()):
            return True
    
    return False

def create_enhanced_prompt(query, language, is_followup, session_id):
    """Create an enhanced prompt with farming expertise and contextual awareness"""
    
    # Include previous conversation context if this is a follow-up
    context = ""
    if is_followup and session_id in conversation_history and len(conversation_history[session_id]) > 0:
        context = "Previous conversation:\n"
        for i, exchange in enumerate(conversation_history[session_id][-3:]):  # Last 3 exchanges
            context += f"User: {exchange['query']}\nAssistant: {exchange['response']}\n"
        context += "\n"
    
    # Base expertise instructions
    expertise_instructions = """
    You are an expert agricultural advisor with deep knowledge of farming practices across different regions, crops, soil types, and climates.
    Your expertise includes:
    - Sustainable farming methods and regenerative agriculture
    - Crop selection, rotation, and management
    - Soil health, improvement techniques, and nutrient management
    - Pest and disease identification and organic control methods
    - Water management and irrigation techniques
    - Seasonal planning and climate adaptation strategies
    - Modern agricultural technology integration
    
    IMPORTANT GUIDELINES:
    1. Provide practical, actionable advice that farmers can implement
    2. Include specific quantities, measurements, and timelines when relevant
    3. Mention both traditional knowledge and modern scientific approaches
    4. Adapt your recommendations to be regionally appropriate when possible
    5. When discussing interventions, prioritize ecological and sustainable options first
    6. If uncertain about specific details, acknowledge limitations and provide general guidance
    7. Structure your response with clear sections and bullet points for readability
    8. If the question isn't related to agriculture, politely redirect to farming topics
    """
    
    # Language-specific instructions
    lang_instructions = {
        "en": "Respond in clear, simple English using farming terminology appropriately.",
        "hi": "Respond in Hindi (with English terms for technical concepts when needed). Use simple language accessible to rural farmers.",
        "te": "Respond in Telugu (with English terms for technical concepts when needed). Use simple language accessible to rural farmers."
    }
    
    # Create the complete prompt
    prompt = f"""
    {expertise_instructions}
    
    {lang_instructions.get(language, lang_instructions["en"])}
    
    {context}
    
    User query: {query}
    
    Provide a comprehensive but concise response:
    """
    
    return prompt

def process_response(response_text, language):
    """Process and enhance the AI response"""
    
    # Remove any unwanted artifacts or patterns
    processed = response_text.replace("**", "")  
    
    # Add language-specific enhancements
    if language == "hi":
        processed = f"{processed}\n\n(इस जानकारी को अपने स्थानीय परिस्थितियों के अनुसार अनुकूलित करें)"
    elif language == "te":
        processed = f"{processed}\n\n(ఈ సమాచారాన్ని మీ స్థానిక పరిస్థితులకు అనుగుణంగా సర్దుబాటు చేసుకోండి)"
    
    return processed

# Add a new endpoint for real-time crop recommendations based on soil and weather
@app.route('/api/recommend', methods=['POST'])
def recommend_crops():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    soil_type = data.get('soil_type', '')
    weather = data.get('weather', '')
    region = data.get('region', '')
    language = data.get('language', 'en')
    
    try:
        prompt = f"""
        As an agricultural expert, recommend the best crops to grow based on:
        
        Soil type: {soil_type}
        Weather conditions: {weather}
        Region: {region}
        
        Provide a list of 5 recommended crops with brief explanations on why they would thrive 
        in these conditions. Include planting guidance and expected yield information.
        
        {lang_instructions.get(language, lang_instructions["en"])}
        """
        
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        return jsonify({
            'recommendations': response.text
        })
        
    except Exception as e:
        print(f"Error generating recommendations: {str(e)}")
        return jsonify({'error': 'Failed to generate recommendations'}), 500

if __name__ == '__main__':
    app.run(debug=True) 