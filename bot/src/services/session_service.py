"""Session service - manages user sessions for broadcasting"""

from datetime import datetime
from typing import List, Dict, Optional
from src.utils.logger import get_logger

logger = get_logger(__name__)

class SessionService:
    """Service for managing user sessions and broadcasts"""
    
    def __init__(self):
        self.user_chats: Dict[int, int] = {}  # user_id -> chat_id
        self.user_info: Dict[int, dict] = {}  # user_id -> {username, first_name, last_name}
        self.broadcast_queue: List[Dict] = []
    
    def register_user(self, user_id: int, chat_id: int, username: str = None, first_name: str = None, last_name: str = None):
        """Register user's chat_id and info when they authenticate"""
        self.user_chats[user_id] = chat_id
        self.user_info[user_id] = {
            "username": username,
            "first_name": first_name,
            "last_name": last_name
        }
        logger.info(f"📱 User registered: user_id={user_id}, username={username}, name={first_name} {last_name or ''}")
    
    def get_all_chat_ids(self) -> List[int]:
        """Get all chat IDs for broadcasting"""
        return list(self.user_chats.values())
    
    def get_user_count(self) -> int:
        """Get count of registered users"""
        return len(self.user_chats)
    
    def get_user_info(self, user_id: int) -> dict:
        """Get user info by ID"""
        return self.user_info.get(user_id, {})
    
    def get_user_display_name(self, user_id: int) -> str:
        """Get user display name (first_name or username or user_id)"""
        info = self.user_info.get(user_id, {})
        
        # Priority: first_name > username > user_id
        if info.get("first_name"):
            full_name = info["first_name"]
            if info.get("last_name"):
                full_name += f" {info['last_name']}"
            return full_name
        elif info.get("username"):
            return f"@{info['username']}"
        else:
            return f"User {user_id}"
    
    # Broadcast management
    def add_to_queue(
        self,
        reminder_id: int,
        title: str,
        message: str,
        admin_id: str
    ) -> Dict:
        """Add broadcast to queue"""
        broadcast = {
            "id": len(self.broadcast_queue),
            "reminder_id": reminder_id,
            "title": title,
            "message": message,
            "admin_id": admin_id,
            "created_at": datetime.now(),
            "status": "pending",  # pending, sending, completed
            "sent_count": 0,
            "failed_count": 0
        }
        
        self.broadcast_queue.append(broadcast)
        logger.info(f"✅ Broadcast queued: {title}")
        return broadcast
    
    def get_queue(self) -> List[Dict]:
        """Get all broadcasts in queue"""
        return self.broadcast_queue
    
    def get_broadcast(self, broadcast_id: int) -> Optional[Dict]:
        """Get broadcast by ID"""
        for b in self.broadcast_queue:
            if b["id"] == broadcast_id:
                return b
        return None
    
    def start_broadcast(self, broadcast_id: int) -> bool:
        """Start sending broadcast"""
        broadcast = self.get_broadcast(broadcast_id)
        if broadcast:
            broadcast["status"] = "sending"
            logger.info(f"🚀 Starting broadcast {broadcast_id}")
            return True
        return False
    
    def complete_broadcast(self, broadcast_id: int, sent: int, failed: int):
        """Mark broadcast as completed"""
        broadcast = self.get_broadcast(broadcast_id)
        if broadcast:
            broadcast["status"] = "completed"
            broadcast["sent_count"] = sent
            broadcast["failed_count"] = failed
            logger.info(
                f"✅ Broadcast {broadcast_id} completed: "
                f"sent={sent}, failed={failed}"
            )
    
    def remove_broadcast(self, broadcast_id: int) -> bool:
        """Remove broadcast from queue"""
        for i, b in enumerate(self.broadcast_queue):
            if b["id"] == broadcast_id:
                self.broadcast_queue.pop(i)
                logger.info(f"Broadcast {broadcast_id} removed")
                return True
        return False

# Global instance
session_service = SessionService()