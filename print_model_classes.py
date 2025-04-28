from ultralytics import YOLO

def print_model_classes(model_path):
    """
    Loads a YOLO model and prints all the classes it can detect.
    
    Args:
        model_path (str): Path to the .pt model file
    """
    try:
        # Load the model
        model = YOLO(model_path)
        
        # Get and print the class names
        class_names = model.names
        
        print("\n===== MODEL CLASSES =====")
        for idx, class_name in class_names.items():
            print(f"Class {idx}: {class_name}")
        print("=========================\n")
        
        print(f"Total number of classes: {len(class_names)}")
        
    except Exception as e:
        print(f"Error loading model: {e}")

if __name__ == "__main__":
    # Manually set the model path here
    manual_model_path = "wwww.pt"  # <-- Replace with the actual path to your .pt file
    
    print_model_classes(manual_model_path)
