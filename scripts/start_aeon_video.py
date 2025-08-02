#!/usr/bin/env python3
"""
AEON Video Platform Startup Script
Production-ready startup script for the AEON Video backend
"""

import os
import sys
import logging
import subprocess
import signal
import time
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('aeon-video.log')
    ]
)
logger = logging.getLogger(__name__)

class AEONVideoStartup:
    """AEON Video Platform Startup Manager"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.backend_dir = self.project_root / "backend"
        self.process = None
        self.running = False
        
    def validate_environment(self):
        """Validate environment setup"""
        logger.info("🔍 Validating environment...")
        
        # Check Python version
        if sys.version_info < (3, 8):
            logger.error("❌ Python 3.8+ required")
            return False
        
        # Check required directories
        if not self.backend_dir.exists():
            logger.error(f"❌ Backend directory not found: {self.backend_dir}")
            return False
        
        # Check environment file
        env_file = self.backend_dir / ".env"
        if not env_file.exists():
            logger.warning(f"⚠️  Environment file not found: {env_file}")
            logger.info("📝 Please create .env file with required variables")
        
        # Check requirements
        requirements_file = self.backend_dir / "requirements.txt"
        if not requirements_file.exists():
            logger.error(f"❌ Requirements file not found: {requirements_file}")
            return False
        
        logger.info("✅ Environment validation passed")
        return True
    
    def install_dependencies(self):
        """Install Python dependencies"""
        logger.info("📦 Installing dependencies...")
        
        try:
            # Change to backend directory
            os.chdir(self.backend_dir)
            
            # Install requirements
            subprocess.run([
                sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
            ], check=True)
            
            logger.info("✅ Dependencies installed successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Failed to install dependencies: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ Error installing dependencies: {e}")
            return False
    
    def validate_configuration(self):
        """Validate backend configuration"""
        logger.info("⚙️  Validating configuration...")
        
        try:
            # Import and validate settings
            sys.path.insert(0, str(self.backend_dir))
            from utils.config import validate_required_settings
            
            settings = validate_required_settings()
            logger.info("✅ Configuration validation passed")
            return True
            
        except ImportError as e:
            logger.error(f"❌ Failed to import configuration: {e}")
            return False
        except ValueError as e:
            logger.error(f"❌ Configuration validation failed: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ Error validating configuration: {e}")
            return False
    
    def start_backend(self):
        """Start the FastAPI backend"""
        logger.info("🚀 Starting AEON Video backend...")
        
        try:
            # Change to backend directory
            os.chdir(self.backend_dir)
            
            # Start the FastAPI server
            self.process = subprocess.Popen([
                sys.executable, "main.py"
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            self.running = True
            logger.info(f"✅ Backend started with PID: {self.process.pid}")
            
            # Wait a moment for startup
            time.sleep(2)
            
            # Check if process is still running
            if self.process.poll() is None:
                logger.info("🎉 AEON Video backend is running!")
                logger.info("📡 API available at: http://159.223.198.119:8000")
                logger.info("📚 API docs at: http://159.223.198.119:8000/docs")
                return True
            else:
                stdout, stderr = self.process.communicate()
                logger.error(f"❌ Backend failed to start")
                logger.error(f"STDOUT: {stdout.decode()}")
                logger.error(f"STDERR: {stderr.decode()}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error starting backend: {e}")
            return False
    
    def stop_backend(self):
        """Stop the backend gracefully"""
        if self.process and self.running:
            logger.info("🛑 Stopping backend...")
            
            try:
                # Send SIGTERM
                self.process.terminate()
                
                # Wait for graceful shutdown
                try:
                    self.process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    logger.warning("⚠️  Force killing backend...")
                    self.process.kill()
                    self.process.wait()
                
                self.running = False
                logger.info("✅ Backend stopped")
                
            except Exception as e:
                logger.error(f"❌ Error stopping backend: {e}")
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info(f"📡 Received signal {signum}, shutting down...")
        self.stop_backend()
        sys.exit(0)
    
    def run(self):
        """Main startup sequence"""
        logger.info("🎬 AEON Video Platform Startup")
        logger.info("=" * 50)
        
        # Register signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        # Validate environment
        if not self.validate_environment():
            logger.error("❌ Environment validation failed")
            sys.exit(1)
        
        # Install dependencies
        if not self.install_dependencies():
            logger.error("❌ Dependency installation failed")
            sys.exit(1)
        
        # Validate configuration
        if not self.validate_configuration():
            logger.error("❌ Configuration validation failed")
            sys.exit(1)
        
        # Start backend
        if not self.start_backend():
            logger.error("❌ Backend startup failed")
            sys.exit(1)
        
        try:
            # Keep the process running
            while self.running and self.process.poll() is None:
                time.sleep(1)
                
        except KeyboardInterrupt:
            logger.info("🛑 Received keyboard interrupt")
        finally:
            self.stop_backend()

def main():
    """Main entry point"""
    startup = AEONVideoStartup()
    startup.run()

if __name__ == "__main__":
    main() 