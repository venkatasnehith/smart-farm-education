import subprocess
import os
import sys
import platform

def print_header(text):
    """Print a formatted header text"""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60 + "\n")

def run_command(command, description=None):
    """Run a shell command and print its output"""
    if description:
        print(f"{description}...")
    
    try:
        result = subprocess.run(command, shell=True, check=True, 
                               stdout=subprocess.PIPE, stderr=subprocess.PIPE, 
                               text=True, encoding='utf-8')
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        if e.stderr:
            print(f"Details: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is at least 3.8"""
    print_header("Checking Python Version")
    
    ver = sys.version_info
    if ver.major < 3 or (ver.major == 3 and ver.minor < 8):
        print(f"Error: Python 3.8+ is required. Found Python {ver.major}.{ver.minor}")
        print("Please install a newer version of Python and try again.")
        return False
        
    print(f"Python version {ver.major}.{ver.minor}.{ver.micro} detected. ✓")
    return True

def create_virtual_env():
    """Create a virtual environment for the project"""
    print_header("Creating Virtual Environment")
    
    if os.path.exists("venv"):
        print("Virtual environment already exists.")
        activate_venv = input("Do you want to recreate it? (y/n): ").lower()
        if activate_venv == 'y':
            if platform.system() == 'Windows':
                run_command("rmdir /s /q venv", "Removing existing environment")
            else:
                run_command("rm -rf venv", "Removing existing environment")
        else:
            return True
    
    return run_command("python -m venv venv", "Creating new virtual environment")

def install_requirements():
    """Install required packages"""
    print_header("Installing Required Packages")
    
    if platform.system() == 'Windows':
        pip_cmd = ".\\venv\\Scripts\\pip"
    else:
        pip_cmd = "./venv/bin/pip"
    
    # Upgrade pip first
    run_command(f"{pip_cmd} install --upgrade pip", "Upgrading pip")
    
    # Install requirements
    return run_command(f"{pip_cmd} install -r requirements.txt", "Installing dependencies")

def check_models():
    """Check if model files exist"""
    print_header("Checking Model Files")
    
    required_models = ["soilll.pt", "wwww.pt", "watermelon.pt"]
    missing_models = []
    
    for model in required_models:
        if not os.path.exists(model):
            missing_models.append(model)
    
    if missing_models:
        print("The following model files are missing:")
        for model in missing_models:
            print(f"  - {model}")
        print("\nPlease make sure all model files are in the project directory.")
        return False
    
    print("All required model files are present. ✓")
    return True

def print_completion_message():
    """Print information about how to run the application"""
    print_header("Installation Complete!")
    
    print("To run the application, follow these steps:")
    print()
    
    if platform.system() == 'Windows':
        print("1. Activate the virtual environment:")
        print("   > .\\venv\\Scripts\\activate")
        print()
        print("2. Run the application:")
        print("   > python detect_and_open.py")
    else:
        print("1. Activate the virtual environment:")
        print("   $ source ./venv/bin/activate")
        print()
        print("2. Run the application:")
        print("   $ python detect_and_open.py")
    
    print()
    print("This will start the detection system and open the web interface.")
    print("You can view the web application at: http://localhost:8080/index.html")
    print()
    print("Happy farming! 🌱")

def main():
    """Main installation function"""
    print_header("FarmKnowledge Installation")
    
    # Check Python version
    if not check_python_version():
        return
    
    # Create virtual environment
    if not create_virtual_env():
        print("Failed to create virtual environment. Please check if you have venv installed.")
        return
    
    # Install requirements
    if not install_requirements():
        print("Failed to install requirements. Please check your internet connection.")
        return
    
    # Check model files
    check_models()
    
    # Print completion message
    print_completion_message()

if __name__ == "__main__":
    main() 