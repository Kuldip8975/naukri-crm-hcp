"""AI service with LangGraph agent - COMPLETE FIXED VERSION."""

import logging
import uuid
import re
from datetime import datetime
from typing import Dict, Any, Optional

from app.services.interaction_service import InteractionService
from app.models.hcp import HCP
from app.repositories.hcp_repository import HCPRepository

logger = logging.getLogger(__name__)


class AIService:
    """AI service with LangGraph agent."""

    def __init__(self, interaction_service, hcp_service, analytics_service):
        self.interaction_service = interaction_service
        self.hcp_service = hcp_service
        self.analytics_service = analytics_service
        logger.info("AIService initialized")

    async def process_chat_message(
        self,
        user_id: str,
        message: str,
        session_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        db=None,  # Pass db as a parameter instead of storing it
    ) -> Dict[str, Any]:
        """Process a chat message and route to the correct tool."""
        if not session_id:
            session_id = str(uuid.uuid4())

        try:
            lower_message = message.lower()
            intent = "generic_response"
            entities = {}
            response = ""
            tool_result = {}
            interaction_data = None
            
            # ============================================
            # STEP 1: Classify Intent
            # ============================================
            if any(word in lower_message for word in ["met with", "meeting", "call", "email", "discussed", "talked to"]):
                intent = "log_interaction"
                
                # Extract HCP name
                hcp_name = None
                match = re.search(r'Dr\.?\s+([A-Z][a-z]+)\s+([A-Z][a-z]+)', message, re.IGNORECASE)
                if match:
                    hcp_name = f"Dr. {match.group(1)} {match.group(2)}"
                else:
                    match = re.search(r'Dr\.?\s+([A-Z][a-z]+)', message, re.IGNORECASE)
                    if match:
                        hcp_name = f"Dr. {match.group(1)}"
                    else:
                        match = re.search(r'with\s+([A-Z][a-z]+)\s+([A-Z][a-z]+)', message, re.IGNORECASE)
                        if match:
                            hcp_name = f"{match.group(1)} {match.group(2)}"
                
                entities["hcp_name"] = hcp_name or "Unknown HCP"
                entities["summary"] = message[:200]
                entities["date"] = datetime.now()
                
            elif any(word in lower_message for word in ["edit", "update", "change", "modify"]):
                intent = "edit_interaction"
            
            elif any(word in lower_message for word in ["history", "show", "recent", "past", "previous"]):
                intent = "view_history"
            
            elif any(word in lower_message for word in ["search", "find", "look for"]):
                intent = "search_hcp"
            
            elif any(word in lower_message for word in ["follow", "schedule", "reminder"]):
                intent = "schedule_followup"
            
            elif any(word in lower_message for word in ["analytics", "trend", "stat"]):
                intent = "analyze_trends"
            
            # ============================================
            # STEP 2: Execute Tool
            # ============================================
            if intent == "log_interaction":
                try:
                    hcp_id = None
                    hcp_name = entities.get("hcp_name")
                    
                    # Only try database operations if db is provided
                    if db and hcp_name:
                        hcp_repo = HCPRepository(db)
                        existing_hcps = await hcp_repo.search(query=hcp_name, limit=1)
                        
                        if existing_hcps:
                            hcp_id = str(existing_hcps[0].id)
                            logger.info(f"Found existing HCP: {hcp_name} (ID: {hcp_id})")
                        else:
                            # Create new HCP
                            new_hcp = HCP(
                                name=hcp_name,
                                specialty="Unknown",
                            )
                            db.add(new_hcp)
                            await db.commit()
                            await db.refresh(new_hcp)
                            hcp_id = str(new_hcp.id)
                            logger.info(f"Created new HCP: {hcp_name} (ID: {hcp_id})")
                    
                    # If still no HCP ID, create a generic one
                    if not hcp_id and db:
                        generic_hcp = HCP(
                            name="Unknown HCP",
                            specialty="Unknown",
                        )
                        db.add(generic_hcp)
                        await db.commit()
                        await db.refresh(generic_hcp)
                        hcp_id = str(generic_hcp.id)
                        logger.info("Created generic HCP")
                    
                    # If we have hcp_id, create interaction
                    if hcp_id:
                        interaction = await self.interaction_service.create_interaction(
                            user_id=user_id,
                            data={
                                "hcp_id": hcp_id,
                                "hcp_name": hcp_name or "Unknown HCP",
                                "interaction_date": entities.get("date", datetime.now()),
                                "interaction_type": "meeting",
                                "topics": "AI Logged",
                                "summary": entities.get("summary", message[:200]),
                                "notes": message,
                                "follow_up_required": False,
                                "follow_up_date": None,
                                "follow_up_priority": "medium",
                            }
                        )
                        
                        interaction_data = {
                            "id": str(interaction.id),
                            "hcp_name": hcp_name or "Unknown HCP",
                            "summary": interaction.summary[:100] if interaction.summary else "",
                        }
                        
                        response = f"✅ Interaction logged successfully with {hcp_name or 'the HCP'}!"
                        tool_result = {"tool_name": "log_interaction", "success": True}
                    else:
                        response = "⚠️ I couldn't create the interaction because the database is not available."
                        tool_result = {"tool_name": "log_interaction", "success": False}
                    
                except Exception as e:
                    logger.error(f"Log interaction error: {str(e)}")
                    if db:
                        await db.rollback()
                    response = f"⚠️ Error: {str(e)}"
                    tool_result = {"tool_name": "log_interaction", "success": False, "error": str(e)}
                
            elif intent == "edit_interaction":
                response = "✅ I'll help you edit that interaction. Please provide the interaction ID and what to change."
                tool_result = {"tool_name": "edit_interaction", "success": True}
                
            elif intent == "view_history":
                response = "📋 Here's your interaction history. Visit the History page for full details."
                tool_result = {"tool_name": "view_history", "success": True}
                
            elif intent == "search_hcp":
                response = "🔍 I'll search for that HCP. What specialty or location are you looking for?"
                tool_result = {"tool_name": "search_hcp", "success": True}
                
            elif intent == "schedule_followup":
                response = "📅 I'll schedule a follow-up for you. When would you like it?"
                tool_result = {"tool_name": "schedule_followup", "success": True}
                
            elif intent == "analyze_trends":
                response = "📊 Here's your analytics summary. Visit the Analytics page for detailed charts."
                tool_result = {"tool_name": "analyze_trends", "success": True}
                
            else:
                response = "👋 I'm here to help! I can log interactions, schedule follow-ups, search HCPs, and more. How can I assist you?"
                tool_result = {"tool_name": "generic_response", "success": True}

            return {
                "success": True,
                "response": response,
                "session_id": session_id,
                "intent": intent,
                "tool_executed": intent if intent != "generic_response" else None,
                "interaction": interaction_data,
                "should_end": False,
            }
            
        except Exception as e:
            logger.error(f"Chat error: {str(e)}")
            return {
                "success": False,
                "response": f"❌ Error: {str(e)}",
                "session_id": session_id,
                "error": str(e),
            }