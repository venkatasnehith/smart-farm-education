import cv2
from ultralytics import YOLO
import time
import os
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading
import socketserver
import webbrowser
import base64

# Define the model paths and their categories
MODEL_INFO = [
    {"path": "soilll.pt", "category": "soil", "classes": {0: "Alluvial", 1: "Black", 2: "Clay", 3: "Red"}},
    {"path": "wwww.pt", "category": "disease", "classes": {
        0: "bakteri_daun_bergaris", 1: "bercak_coklat", 2: "bercak_coklat_sempit", 
        3: "blas", 4: "hawar_daun_bakteri", 5: "tungro"
    }}
]

# Global variables for detection results and current frame
detection_results = {model["category"]: {"detected": False, "class": None, "confidence": 0} for model in MODEL_INFO}
current_frame_jpeg = None

class DetectionHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='project', **kwargs)
    
    def do_GET(self):
        if self.path == '/api/detections':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response_data = {
                'detections': detection_results,
                'frame': current_frame_jpeg.decode('utf-8') if current_frame_jpeg else None
            }
            self.wfile.write(json.dumps(response_data).encode())
            return
        return super().do_GET()

def start_webserver():
    port = 8080
    handler = DetectionHandler
    
    class ThreadedHTTPServer(socketserver.ThreadingMixIn, HTTPServer):
        pass
    
    server = ThreadedHTTPServer(("", port), handler)
    print(f"Starting web server on port {port}")
    
    # Open the web browser automatically
    webbrowser.open(f'http://localhost:{port}/index.html')
    
    server.serve_forever()

def process_frame(frame, models):
    annotated_frame = frame.copy()
    
    # Process with all models
    for model_data in models:
        model = model_data["model"]
        model_info = model_data["info"]
        category = model_info["category"]
        
        # Run YOLO detection on the frame
        results = model(frame)
        
        # Process results
        for result in results:
            if len(result.boxes) > 0:
                # Get the highest confidence detection
                confidences = result.boxes.conf.cpu().numpy()
                highest_conf_idx = confidences.argmax()
                highest_conf = confidences[highest_conf_idx]
                
                # Get the class of the highest confidence detection
                cls = int(result.boxes.cls[highest_conf_idx].item())
                
                if highest_conf > 0.5:  # Threshold for considering a detection valid
                    # Update detection results
                    detection_results[category] = {
                        "detected": True,
                        "class": model_info["classes"].get(cls, "Unknown"),
                        "confidence": float(highest_conf)
                    }
                else:
                    detection_results[category] = {
                        "detected": False,
                        "class": None,
                        "confidence": 0
                    }
        
        # Get the annotated frame
        annotated_frame = results[0].plot()
    
    return annotated_frame

def main():
    global current_frame_jpeg
    
    # Load all YOLO models
    models = []
    for model_info in MODEL_INFO:
        try:
            model = YOLO(model_info["path"])
            models.append({"model": model, "info": model_info})
            print(f"Loaded model: {model_info['path']}")
        except Exception as e:
            print(f"Error loading model {model_info['path']}: {e}")
    
    # Start web server in a separate thread
    server_thread = threading.Thread(target=start_webserver)
    server_thread.daemon = True
    server_thread.start()
    
    # Initialize the webcam
    cap = cv2.VideoCapture(0)
    
    while True:
        # Read frame from webcam
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break
            
        # Process the frame with all models
        annotated_frame = process_frame(frame, models)
        
        # Convert the frame to JPEG format
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        current_frame_jpeg = base64.b64encode(buffer)
        
        # Small delay to prevent excessive CPU usage
        time.sleep(0.03)
    
    # Release resources
    cap.release()

if __name__ == "__main__":
    main()
