#!/usr/bin/env python3
"""
Environment setup script for the Advanced Multi-Agent Debate System
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def run_command(command: str, check: bool = True):
    """Run a shell command"""
    print(f"Running: {command}")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if check and result.returncode != 0:
        print(f"Error running command: {command}")
        print(f"stdout: {result.stdout}")
        print(f"stderr: {result.stderr}")
        sys.exit(1)
    return result

def check_dependencies():
    """Check if required dependencies are installed"""
    print("Checking dependencies...")
    
    # Check Python version
    if sys.version_info < (3, 10):
        print("Error: Python 3.10 or higher is required")
        sys.exit(1)
    
    # Check UV
    if not shutil.which("uv"):
        print("Error: UV package manager is required. Install from: https://github.com/astral-sh/uv")
        sys.exit(1)
    
    # Check Docker (optional)
    if not shutil.which("docker"):
        print("Warning: Docker not found. Docker is recommended for development.")
    
    print("✓ Dependencies check passed")

def setup_environment():
    """Setup the development environment"""
    print("Setting up environment...")
    
    # Create .env file if it doesn't exist
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if not env_file.exists() and env_example.exists():
        shutil.copy(env_example, env_file)
        print("✓ Created .env file from .env.example")
        print("  Please edit .env file and add your API keys")
    
    # Install dependencies
    print("Installing Python dependencies...")
    run_command("uv sync")
    print("✓ Python dependencies installed")

def setup_database():
    """Setup development database"""
    print("Setting up development database...")
    
    # Check if docker is available
    if shutil.which("docker") and shutil.which("docker-compose"):
        print("Starting database with Docker Compose...")
        run_command("docker-compose up -d db redis")
        print("✓ Database services started")
    else:
        print("Warning: Docker not available. Please set up PostgreSQL and Redis manually.")
        print("  PostgreSQL: localhost:5432, database: biodesign")
        print("  Redis: localhost:6379")

def run_tests():
    """Run the test suite"""
    print("Running tests...")
    run_command("uv run pytest tests/ -v")
    print("✓ Tests passed")

def start_development_server():
    """Start the development server"""
    print("Starting development server...")
    print("Server will be available at: http://localhost:8000")
    print("API documentation: http://localhost:8000/docs")
    run_command("uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000", check=False)

def main():
    """Main setup function"""
    print("🚀 Advanced Multi-Agent Debate System Setup")
    print("=" * 50)
    
    # Change to script directory
    script_dir = Path(__file__).parent.parent
    os.chdir(script_dir)
    
    try:
        check_dependencies()
        setup_environment()
        
        # Ask user what to do
        while True:
            print("\nWhat would you like to do?")
            print("1. Setup database (Docker)")
            print("2. Run tests")
            print("3. Start development server")
            print("4. All of the above")
            print("5. Exit")
            
            choice = input("\nEnter your choice (1-5): ").strip()
            
            if choice == "1":
                setup_database()
            elif choice == "2":
                run_tests()
            elif choice == "3":
                start_development_server()
                break
            elif choice == "4":
                setup_database()
                run_tests()
                start_development_server()
                break
            elif choice == "5":
                print("Setup complete!")
                break
            else:
                print("Invalid choice. Please enter 1-5.")
    
    except KeyboardInterrupt:
        print("\nSetup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
