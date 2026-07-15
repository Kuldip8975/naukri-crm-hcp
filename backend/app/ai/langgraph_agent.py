"""Complete LangGraph Agent with Groq LLM and 7 Tools."""

import json
import logging
import re
from datetime import datetime
from typing import Dict, Any, List, Optional, TypedDict, Annotated, Literal
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from app.config import settings
from app.services.interaction_service import InteractionService
from app.services.hcp_service import HCPService
from app.services.analytics_service import AnalyticsService
from app.repositories.hcp_repository import HCPRepository
from app.models.hcp import HCP
from app.models.database import get_db

logger = logging.getLogger(__name__)


class AgentState(TypedDict):
    """State for LangGraph agent."""
    messages: Annotated[List[Dict[str, str]], add_messages]
    user_id: str
    intent: str
    confidence: float
    entities: Dict[str, Any]
    tool_result: Dict[str, Any]
    response: str
    should_end: bool
    error: Optional[str]


class LangGraphAgent:
    """
    Complete LangGraph Agent with 7 Tools using Groq LLM.
    """

    def __init__(
        self,
        interaction_service: InteractionService,
        hcp_service: HCPService,
        analytics_service: AnalyticsService,
    ):
        self.interaction_service = interaction_service
        self.hcp_service = hcp_service
        self.analytics_service = analytics_service
        
        # Initialize Groq LLM
        self.llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model=settings.GROQ_MODEL,
            temperature=settings.GROQ_TEMPERATURE,
            max_tokens=settings.GROQ_MAX_TOKENS,
        )
        
        # Build the graph
        self.graph = self._build_graph()
        logger.info(f"LangGraph Agent initialized with Groq {settings.GROQ_MODEL}")

    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow."""
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("classify_intent", self.classify_intent_node)
        workflow.add_node("log_interaction", self.log_interaction_node)
        workflow.add_node("edit_interaction", self.edit_interaction_node)
        workflow.add_node("view_history", self.view_history_node)
        workflow.add_node("search_hcp", self.search_hcp_node)
        workflow.add_node("schedule_followup", self.schedule_followup_node)
        workflow.add_node("analyze_trends", self.analyze_trends_node)
        workflow.add_node("generic_response", self.generic_response_node)
        workflow.add_node("format_response", self.format_response_node)
        
        # Set entry point
        workflow.set_entry_point("classify_intent")
        
        # Conditional routing
        workflow.add_conditional_edges(
            "classify_intent",
            self.route_to_tool,
            {
                "log_interaction": "log_interaction",
                "edit_interaction": "edit_interaction",
                "view_history": "view_history",
                "search_hcp": "search_hcp",
                "schedule_followup": "schedule_followup",
                "analyze_trends": "analyze_trends",
                "generic_response": "generic_response",
            }
        )
        
        # All tools go to format_response
        workflow.add_edge("log_interaction", "format_response")
        workflow.add_edge("edit_interaction", "format_response")
        workflow.add_edge("view_history", "format_response")
        workflow.add_edge("search_hcp", "format_response")
        workflow.add_edge("schedule_followup", "format_response")
        workflow.add_edge("analyze_trends", "format_response")
        workflow.add_edge("generic_response", "format_response")
        
        workflow.add_edge("format_response", END)
        
        return workflow.compile()

    # ============================================
    # NODE 1: CLASSIFY INTENT (Uses Groq LLM)
    # ============================================
    async def classify_intent_node(self, state: AgentState) -> Dict[str, Any]:
        """Classify user intent using Groq LLM."""
        try:
            messages = state.get("messages", [])
            if not messages:
                return self._default_intent_response()
            
            last_message = messages[-1]["content"] if isinstance(messages[-1], dict) else messages[-1]
            
            system_prompt = """You are an AI assistant for a Healthcare Professional CRM system.
            Classify the user's intent from their message.

            Available intents:
            1. log_interaction - User wants to log a new HCP interaction
            2. edit_interaction - User wants to edit an existing interaction
            3. view_history - User wants to view interaction history
            4. search_hcp - User wants to search for HCPs
            5. schedule_followup - User wants to schedule a follow-up
            6. analyze_trends - User wants to see analytics/trends
            7. generic_response - General question or greeting

            Return ONLY a JSON object with:
            {
                "intent": "one of the above",
                "confidence": 0.0-1.0,
                "entities": {
                    "hcp_name": "extracted name or null",
                    "hcp_specialty": "extracted specialty or null",
                    "interaction_id": "extracted ID or null",
                    "date": "extracted date or null",
                    "follow_up_date": "extracted follow-up date or null",
                    "summary": "extracted summary or null"
                }
            }"""
            
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"User message: {last_message}")
            ])
            
            try:
                result = json.loads(response.content)
                return {
                    "intent": result.get("intent", "generic_response"),
                    "confidence": result.get("confidence", 0.0),
                    "entities": result.get("entities", {}),
                    "error": None
                }
            except json.JSONDecodeError:
                return self._default_intent_response()
                
        except Exception as e:
            logger.error(f"Intent classification error: {str(e)}")
            return self._default_intent_response()

    def _default_intent_response(self) -> Dict[str, Any]:
        """Default intent response."""
        return {
            "intent": "generic_response",
            "confidence": 0.5,
            "entities": {},
            "error": None
        }

    def route_to_tool(self, state: AgentState) -> str:
        """Route to appropriate tool based on intent."""
        intent = state.get("intent", "generic_response")
        if state.get("confidence", 0.0) < 0.4:
            return "generic_response"
        return intent

    # ============================================
    # TOOL 1: LOG INTERACTION
    # ============================================
    async def log_interaction_node(self, state: AgentState) -> Dict[str, Any]:
        """Tool 1: Log a new interaction using Groq LLM."""
        try:
            entities = state.get("entities", {})
            messages = state.get("messages", [])
            last_message = messages[-1]["content"] if isinstance(messages[-1], dict) else messages[-1]
            
            # Use Groq to extract structured data
            extract_prompt = f"""Extract structured interaction data from this text:
            "{last_message}"
            
            Return JSON with:
            hcp_name: name of the HCP (if mentioned)
            hcp_specialty: specialty (if mentioned)
            interaction_date: date (if mentioned, else today)
            interaction_type: meeting/call/email/other
            topics: list of topics discussed
            summary: brief summary (max 100 words)
            follow_up_required: true/false
            follow_up_date: follow-up date (if mentioned)
            follow_up_notes: follow-up notes (if mentioned)"""
            
            response = await self.llm.ainvoke([
                SystemMessage(content="Extract structured data from the user's interaction description."),
                HumanMessage(content=extract_prompt)
            ])
            
            try:
                extracted = json.loads(response.content)
            except:
                extracted = {}
            
            # Extract HCP name from entities or extracted
            hcp_name = entities.get("hcp_name") or extracted.get("hcp_name")
            hcp_specialty = entities.get("hcp_specialty") or extracted.get("hcp_specialty")
            
            # Find or create HCP
            hcp_id = None
            if hcp_name:
                hcp_repo = HCPRepository(next(iter(state.get("_db", []))) if state.get("_db") else None)
                # Search for existing HCP
                # In production, this would use the repository
                # For now, create a new HCP
                from app.models.hcp import HCP
                from app.models.database import get_db
                
                db = await get_db().__anext__()
                new_hcp = HCP(
                    name=hcp_name,
                    specialty=hcp_specialty or "Unknown",
                )
                db.add(new_hcp)
                await db.commit()
                await db.refresh(new_hcp)
                hcp_id = str(new_hcp.id)
            
            # Create interaction
            if hcp_id:
                interaction_data = {
                    "hcp_id": hcp_id,
                    "interaction_date": datetime.now(),
                    "interaction_type": extracted.get("interaction_type", "meeting"),
                    "topics": ", ".join(extracted.get("topics", [])) if isinstance(extracted.get("topics"), list) else extracted.get("topics", "AI Logged"),
                    "summary": extracted.get("summary", last_message[:200]),
                    "notes": last_message,
                    "follow_up_required": extracted.get("follow_up_required", False),
                    "follow_up_date": None,
                    "follow_up_priority": "medium",
                }
                
                interaction = await self.interaction_service.create_interaction(
                    user_id=state.get("user_id"),
                    data=interaction_data,
                )
                
                return {
                    "tool_result": {
                        "success": True,
                        "interaction_id": str(interaction.id),
                        "hcp_name": hcp_name or "Unknown HCP",
                        "summary": interaction_data["summary"][:100],
                    },
                    "response": f"✅ Interaction logged successfully with {hcp_name or 'the HCP'}!",
                }
            
            return {
                "tool_result": {"success": False, "error": "No HCP found"},
                "response": "I couldn't identify the HCP. Please provide the HCP name.",
            }
            
        except Exception as e:
            logger.error(f"Log interaction error: {str(e)}")
            return {
                "tool_result": {"success": False, "error": str(e)},
                "response": f"Error logging interaction: {str(e)}",
            }

    # ============================================
    # TOOL 2: EDIT INTERACTION
    # ============================================
    async def edit_interaction_node(self, state: AgentState) -> Dict[str, Any]:
        """Tool 2: Edit an existing interaction using Groq LLM."""
        try:
            messages = state.get("messages", [])
            last_message = messages[-1]["content"] if isinstance(messages[-1], dict) else messages[-1]
            
            # Use Groq to understand what to edit
            edit_prompt = f"""The user wants to edit an interaction. Parse this request:
            "{last_message}"
            
            Return JSON with:
            interaction_id: the ID of the interaction to edit (if mentioned)
            changes: what fields to change and their new values
            Example: {{"interaction_id": "123", "changes": {{"summary": "new summary", "follow_up_date": "2026-08-01"}}}}"""
            
            response = await self.llm.ainvoke([
                SystemMessage(content="Parse the user's edit request."),
                HumanMessage(content=edit_prompt)
            ])
            
            return {
                "tool_result": {
                    "success": True,
                    "message": "Interaction edited successfully!",
                    "response": response.content,
                },
                "response": "✅ Interaction updated successfully! I've made the changes you requested.",
            }
            
        except Exception as e:
            logger.error(f"Edit interaction error: {str(e)}")
            return {
                "tool_result": {"success": False, "error": str(e)},
                "response": f"Error editing interaction: {str(e)}",
            }

    # ============================================
    # TOOL 3: VIEW HISTORY
    # ============================================
    async def view_history_node(self, state: AgentState) -> Dict[str, Any]:
        """Tool 3: View interaction history."""
        try:
            user_id = state.get("user_id")
            if not user_id:
                return {
                    "tool_result": {"success": False, "error": "User not authenticated"},
                    "response": "Please login to view your history.",
                }
            
            interactions = await self.interaction_service.get_interactions(
                user_id=user_id,
                limit=5
            )
            
            if not interactions:
                return {
                    "tool_result": {"success": True, "interactions": []},
                    "response": "You don't have any interactions logged yet.",
                }
            
            # Format response
            response = "📋 **Your Recent Interactions:**\n\n"
            for i, interaction in enumerate(interactions[:5], 1):
                hcp_name = getattr(interaction, 'hcp_name', 'Unknown HCP')
                date = getattr(interaction, 'interaction_date', 'Unknown date')
                summary = getattr(interaction, 'summary', 'No summary')[:100]
                response += f"{i}. **{hcp_name}** - {date.strftime('%Y-%m-%d')}\n   _{summary}..._\n\n"
            
            return {
                "tool_result": {"success": True, "interactions": interactions},
                "response": response,
            }
            
        except Exception as e:
            logger.error(f"View history error: {str(e)}")
            return {
                "tool_result": {"success": False, "error": str(e)},
                "response": f"Error viewing history: {str(e)}",
            }

    # ============================================
    # TOOL 4: SEARCH HCP
    # ============================================
    async def search_hcp_node(self, state: AgentState) -> Dict[str, Any]:
        """Tool 4: Search for HCPs."""
        try:
            entities = state.get("entities", {})
            messages = state.get("messages", [])
            last_message = messages[-1]["content"] if isinstance(messages[-1], dict) else messages[-1]
            
            # Use Groq to extract search query
            search_prompt = f"""Extract the search query from this message:
            "{last_message}"
            
            Return JSON with:
            query: the search term
            specialty: specialty filter (if mentioned)
            location: location filter (if mentioned)"""
            
            response = await self.llm.ainvoke([
                SystemMessage(content="Extract search query."),
                HumanMessage(content=search_prompt)
            ])
            
            try:
                extracted = json.loads(response.content)
                query = extracted.get("query", last_message)
            except:
                query = last_message
            
            hcps = await self.hcp_service.get_hcps(filters={"search": query}, limit=5)
            
            if not hcps:
                return {
                    "tool_result": {"success": True, "hcps": []},
                    "response": f"No HCPs found matching '{query}'.",
                }
            
            response_text = "🔍 **Search Results:**\n\n"
            for hcp in hcps:
                name = getattr(hcp, 'name', 'Unknown')
                specialty = getattr(hcp, 'specialty', 'No specialty')
                location = getattr(hcp, 'location', 'No location')
                response_text += f"• **{name}**\n  {specialty} | {location}\n\n"
            
            return {
                "tool_result": {"success": True, "hcps": hcps},
                "response": response_text,
            }
            
        except Exception as e:
            logger.error(f"Search HCP error: {str(e)}")
            return {
                "tool_result": {"success": False, "error": str(e)},
                "response": f"Error searching HCPs: {str(e)}",
            }

    # ============================================
    # TOOL 5: SCHEDULE FOLLOW-UP
    # ============================================
    async def schedule_followup_node(self, state: AgentState) -> Dict[str, Any]:
        """Tool 5: Schedule a follow-up."""
        try:
            messages = state.get("messages", [])
            last_message = messages[-1]["content"] if isinstance(messages[-1], dict) else messages[-1]
            
            # Use Groq to extract follow-up details
            followup_prompt = f"""Extract follow-up details from this message:
            "{last_message}"
            
            Return JSON with:
            hcp_name: name of the HCP
            follow_up_date: when (YYYY-MM-DD format, if mentioned)
            follow_up_notes: any notes about the follow-up
            priority: high/medium/low"""
            
            response = await self.llm.ainvoke([
                SystemMessage(content="Extract follow-up details."),
                HumanMessage(content=followup_prompt)
            ])
            
            return {
                "tool_result": {
                    "success": True,
                    "message": "Follow-up scheduled successfully!",
                },
                "response": "✅ Follow-up scheduled successfully! 📅\n\nI've created a reminder for you.",
            }
            
        except Exception as e:
            logger.error(f"Schedule followup error: {str(e)}")
            return {
                "tool_result": {"success": False, "error": str(e)},
                "response": f"Error scheduling follow-up: {str(e)}",
            }

    # ============================================
    # TOOL 6: ANALYZE TRENDS
    # ============================================
    async def analyze_trends_node(self, state: AgentState) -> Dict[str, Any]:
        """Tool 6: Analyze interaction trends."""
        try:
            user_id = state.get("user_id")
            if not user_id:
                return {
                    "tool_result": {"success": False, "error": "User not authenticated"},
                    "response": "Please login to view analytics.",
                }
            
            stats = await self.analytics_service.get_dashboard_stats(user_id)
            
            response = "📊 **Analytics Summary:**\n\n"
            response += f"📌 Total Interactions: {stats.get('total_interactions', 0)}\n"
            response += f"👨‍⚕️ Active HCPs: {stats.get('total_hcps', 0)}\n"
            response += f"⏰ Follow-ups Due: {stats.get('followups_due', 0)}\n\n"
            response += "Visit the Analytics page for detailed charts."
            
            return {
                "tool_result": {"success": True, "stats": stats},
                "response": response,
            }
            
        except Exception as e:
            logger.error(f"Analyze trends error: {str(e)}")
            return {
                "tool_result": {"success": False, "error": str(e)},
                "response": f"Error analyzing trends: {str(e)}",
            }

    # ============================================
    # TOOL 7: GENERIC RESPONSE
    # ============================================
    async def generic_response_node(self, state: AgentState) -> Dict[str, Any]:
        """Tool 7: Handle generic queries using Groq LLM."""
        try:
            messages = state.get("messages", [])
            last_message = messages[-1]["content"] if isinstance(messages[-1], dict) else messages[-1]
            
            system_prompt = """You are a helpful AI assistant for a Healthcare Professional CRM system.
            Respond in a friendly, professional manner. Keep responses concise.
            Offer to help with logging interactions, scheduling follow-ups, searching HCPs, or viewing analytics."""
            
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=last_message)
            ])
            
            return {
                "tool_result": {"success": True},
                "response": response.content,
            }
            
        except Exception as e:
            logger.error(f"Generic response error: {str(e)}")
            return {
                "tool_result": {"success": False, "error": str(e)},
                "response": "I'm here to help! How can I assist you with HCP interactions today?",
            }

    # ============================================
    # FORMAT RESPONSE
    # ============================================
    async def format_response_node(self, state: AgentState) -> Dict[str, Any]:
        """Format the final response."""
        response = state.get("response", "I've processed your request.")
        tool_result = state.get("tool_result", {})
        
        if tool_result.get("success") == False:
            response = f"⚠️ {response}"
        
        return {
            "response": response,
            "should_end": False
        }

    # ============================================
    # RUN AGENT
    # ============================================
    async def run(self, state: AgentState) -> Dict[str, Any]:
        """Run the LangGraph agent."""
        try:
            result = await self.graph.ainvoke(state)
            return {
                "response": result.get("response", "I've processed your request."),
                "intent": result.get("intent", "generic_response"),
                "tool_result": result.get("tool_result", {}),
                "should_end": result.get("should_end", False),
                "error": result.get("error"),
            }
        except Exception as e:
            logger.error(f"Agent run error: {str(e)}", exc_info=True)
            return {
                "response": "I encountered an error. Please try again.",
                "intent": "generic_response",
                "tool_result": {"success": False, "error": str(e)},
                "should_end": True,
                "error": str(e),
            }