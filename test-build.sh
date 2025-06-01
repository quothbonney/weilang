#!/bin/bash

echo "🧪 Testing Android build in EAS-like environment..."
echo "This simulates the exact ubuntu-22.04-jdk-17-ndk-r26b image"

# Build the Docker image
echo "📦 Building Docker test image..."
docker build -f Dockerfile.test-eas -t eas-test-build . 

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully"
    echo "🚀 Running build test..."
    
    # Run the test build
    docker run --rm eas-test-build
    
    if [ $? -eq 0 ]; then
        echo "🎉 BUILD TEST PASSED! Should work on EAS"
    else
        echo "❌ BUILD TEST FAILED - same issue will happen on EAS"
        echo "💡 Check the error above to fix before pushing to EAS"
    fi
else
    echo "❌ Failed to build Docker image"
fi 