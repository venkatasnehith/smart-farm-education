from flask import Flask, request, jsonify
import os
from google import genai
import json

app = Flask(__name__)

# Initialize the Gemini API client
API_KEY = "AIzaSyCDR4dt8x8F-TFUMFTXLNv3rR3auhLq0C4"
genai.configure(api_key=API_KEY)

@app.route('/api/search', methods=['POST'])
def search():
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({'error': 'No query provided'}), 400
            
        query = data['query']
        
        # Configure the model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Add farming context to the query
        farming_context = """You are an agricultural expert assistant. 
        Provide helpful, accurate, and practical information for farmers.
        Focus on sustainable farming practices, crop management, soil health, 
        pest control, and modern agricultural technologies.
        Keep responses concise, practical and farmer-friendly."""
        
        enhanced_query = f"{farming_context}\n\nUser query: {query}"
        
        # Generate content
        response = model.generate_content(enhanced_query)
        
        # Process and format the response
        response_text = response.text
        
        return jsonify({
            'result': response_text,
            'query': query
        })
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 