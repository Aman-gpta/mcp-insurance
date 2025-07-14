#!/bin/bash

# Test health endpoints
echo "Testing health endpoints..."

echo "1. Testing root endpoint:"
curl -s http://localhost:3000/ | jq '.' || echo "Server not responding"

echo -e "\n2. Testing health endpoint:"
curl -s http://localhost:3000/health | jq '.' || echo "Server not responding"

echo -e "\n3. Testing 404 endpoint:"
curl -s http://localhost:3000/nonexistent | jq '.' || echo "Server not responding"

echo -e "\nHealth tests completed."
