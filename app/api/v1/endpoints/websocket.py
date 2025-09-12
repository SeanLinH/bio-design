"""
WebSocket endpoints for real-time debate monitoring
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, Set
import json
import asyncio

router = APIRouter()

# Store active WebSocket connections
active_connections: Dict[str, Set[WebSocket]] = {}

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()
        self.active_connections[session_id].add(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].discard(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def broadcast_to_session(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[session_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    disconnected.add(connection)
            
            # Remove disconnected connections
            for connection in disconnected:
                self.active_connections[session_id].discard(connection)

manager = ConnectionManager()

@router.websocket("/debate/{session_id}")
async def websocket_debate_updates(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time debate updates"""
    await manager.connect(websocket, session_id)
    try:
        # Send initial connection confirmation
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "session_id": session_id,
            "message": "Connected to debate session"
        }))
        
        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Wait for messages from client (if any)
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "ping":
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": message.get("timestamp")
                    }))
                elif message.get("type") == "request_status":
                    # Send current debate status
                    await websocket.send_text(json.dumps({
                        "type": "status_update",
                        "session_id": session_id,
                        "status": "active",
                        "current_round": 3,
                        "active_agent": "medical_expert"
                    }))
                    
            except asyncio.TimeoutError:
                # Send periodic heartbeat
                await websocket.send_text(json.dumps({
                    "type": "heartbeat",
                    "session_id": session_id
                }))
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, session_id)

async def broadcast_debate_update(session_id: str, update_data: dict):
    """Utility function to broadcast updates to all connected clients"""
    await manager.broadcast_to_session(session_id, {
        "type": "debate_update",
        "session_id": session_id,
        **update_data
    })

async def broadcast_agent_message(session_id: str, agent_id: str, message: str, round_number: int):
    """Broadcast when an agent makes a statement"""
    await manager.broadcast_to_session(session_id, {
        "type": "agent_message",
        "session_id": session_id,
        "agent_id": agent_id,
        "message": message,
        "round": round_number,
        "timestamp": "2025-09-11T10:30:00Z"
    })

async def broadcast_consensus_update(session_id: str, consensus_level: float):
    """Broadcast consensus level changes"""
    await manager.broadcast_to_session(session_id, {
        "type": "consensus_update",
        "session_id": session_id,
        "consensus_level": consensus_level,
        "timestamp": "2025-09-11T10:30:00Z"
    })
