#!/bin/bash

PORT=8000
LOGFILE="server.log"

echo "Preparing to run server..."

# Check if python exists
if !command -v python >/dev/null 2>&1; then
    echo "Python is NOT installed, thus we cannot start the server"
    exit 1
fi

# Check if port is already in use
if ss -ltn | grep -q ":$PORT "; then
    echo "Port $PORT is already in use! Cannot start server."
    exit 1
fi

# Get machine IP (first non-local IP)
IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7; exit}')

if [ -z "$IP" ]; then
    IP="127.0.0.1"
fi

echo "Server Started!"
echo "Access it at: http://$IP:$PORT"
echo "Saving logs at $LOGFILE"
echo ""

# Start server
python -m http.server $PORT --bind 0.0.0.0 > "$LOGFILE" 2>&1
