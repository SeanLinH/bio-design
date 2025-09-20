#!/bin/bash

echo "=== Frontend-Backend Connection Test ==="
echo

# 測試後端API直接連接
echo "1. Testing Backend API directly:"
echo "   Health Check:"
curl -s "http://localhost:8000/health" | jq '.' 2>/dev/null || curl -s "http://localhost:8000/health"
echo
echo "   API Ready:"
curl -s "http://localhost:8000/api/v1/ready" | jq '.' 2>/dev/null || curl -s "http://localhost:8000/api/v1/ready"
echo
echo "   Agents List (first agent):"
curl -s "http://localhost:8000/api/v1/agents/" | jq '.agents[0]' 2>/dev/null || curl -s "http://localhost:8000/api/v1/agents/" | head -5
echo

# 測試前端是否可訪問
echo "2. Testing Frontend access:"
echo "   Frontend Home Page:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
if [ "$STATUS" -eq 200 ]; then
    echo "   ✅ Frontend accessible at http://localhost:3000 (Status: $STATUS)"
else
    echo "   ❌ Frontend not accessible (Status: $STATUS)"
fi

echo "   Connection Test Page:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/connection-test")
if [ "$STATUS" -eq 200 ]; then
    echo "   ✅ Connection test page accessible (Status: $STATUS)"
else
    echo "   ❌ Connection test page not accessible (Status: $STATUS)"
fi

echo

# 測試前端代理配置
echo "3. Testing Frontend proxy configuration:"
echo "   Test proxy to backend through frontend:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/health")
if [ "$STATUS" -eq 200 ]; then
    echo "   ✅ Frontend proxy working (Status: $STATUS)"
    curl -s "http://localhost:3000/health" | jq '.' 2>/dev/null || curl -s "http://localhost:3000/health"
else
    echo "   ❌ Frontend proxy not working (Status: $STATUS)"
fi

echo
echo "=== Test Complete ==="

# 提供有用的鏈接
echo
echo "Useful links:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API Docs: http://localhost:8000/docs"
echo "- Connection Test: http://localhost:3000/connection-test"
echo "- Health Check: http://localhost:8000/health"
