#!/bin/bash

# AEON Video Security Dependencies Installation Script
# Installs new security packages for the hardened backend

echo "🔒 Installing AEON Video Security Dependencies..."

# Update pip
echo "📦 Updating pip..."
pip install --upgrade pip

# Install security dependencies
echo "🔐 Installing security packages..."
pip install slowapi==0.1.9
pip install python-magic==0.4.27

# Install additional security packages
echo "🛡️ Installing additional security packages..."
pip install bcrypt==4.0.1
pip install cryptography==41.0.7
pip install python-jose[cryptography]==3.3.0

# Verify installations
echo "✅ Verifying installations..."
python -c "import slowapi; print('✅ slowapi installed')"
python -c "import magic; print('✅ python-magic installed')"
python -c "import bcrypt; print('✅ bcrypt installed')"
python -c "import cryptography; print('✅ cryptography installed')"

echo "🎉 Security dependencies installed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Restart your backend server"
echo "2. Run the security test: python test_security_patches.py"
echo "3. Check your logs for any security warnings"
echo ""
echo "🔒 Your AEON platform is now hardened with:"
echo "   - Rate limiting (SlowAPI)"
echo "   - File type validation (python-magic)"
echo "   - Secure password hashing (bcrypt)"
echo "   - Cryptographic utilities (cryptography)" 