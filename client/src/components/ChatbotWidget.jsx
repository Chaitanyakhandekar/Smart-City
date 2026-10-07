import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/authContex";
import { chatApi } from "../api/client";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  ClipboardList,
  FolderOpen,
  PlusCircle,
  RotateCcw,
  Bell,
  Info,
  BarChart3,
  AlertTriangle,
  ListChecks,
  Layers
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// ─────────────────────────────────────────────────────────
// Quick action definitions per role
// ─────────────────────────────────────────────────────────

const CITIZEN_QUICK_ACTIONS = [
  { label: "📋 Complaint Status", message: "What is my complaint status?", icon: ClipboardList },
  { label: "📂 My Complaints", message: "Show my complaints", icon: FolderOpen },
  { label: "➕ How to Report", message: "How do I submit a complaint?", icon: PlusCircle },
  { label: "🔄 How to Reopen", message: "How do I reopen my complaint?", icon: RotateCcw },
  { label: "📑 Categories", message: "What categories are available?", icon: Layers },
  { label: "🔔 Notifications", message: "Do I have notifications?", icon: Bell },
  { label: "ℹ️ About SmartCity", message: "What is SmartCity?", icon: Info }
];

const STAFF_QUICK_ACTIONS = [
  { label: "📋 My Tasks", message: "Show my assigned tasks", icon: ListChecks },
  { label: "📊 Task Summary", message: "How many tasks are pending?", icon: BarChart3 },
  { label: "📑 Categories", message: "What categories are available?", icon: Layers },
  { label: "ℹ️ About SmartCity", message: "What is SmartCity?", icon: Info }
];

const ADMIN_QUICK_ACTIONS = [
  { label: "📊 Complaint Stats", message: "How many complaints are pending?", icon: BarChart3 },
  { label: "⚠️ High Priority", message: "How many high priority complaints?", icon: AlertTriangle },
  { label: "📑 Categories", message: "What categories are available?", icon: Layers },
  { label: "ℹ️ About SmartCity", message: "What is SmartCity?", icon: Info }
];

function getQuickActions(role) {
  switch (role) {
    case "STAFF": return STAFF_QUICK_ACTIONS;
    case "ADMIN": return ADMIN_QUICK_ACTIONS;
    default: return CITIZEN_QUICK_ACTIONS;
  }
}

// ─────────────────────────────────────────────────────────
// Typing indicator component
// ─────────────────────────────────────────────────────────

const TypingIndicator = () => (
  <div className="flex items-center gap-2 pl-2">
    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-bold">
      <Bot className="w-4 h-4" />
    </div>
    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl rounded-bl-xs px-4 py-3 shadow-md">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
        <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
// ChatbotWidget Component
// ─────────────────────────────────────────────────────────

export const ChatbotWidget = () => {
  const { user, isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Build personalized welcome message
  const firstName = user?.name ? user.name.split(" ")[0] : "";
  const welcomeText = firstName
    ? `Hello, ${firstName}! 👋 I'm your **Smart City Civic Assistant**.\n\nI can check your complaints, provide status updates, guide you through filing reports, or explain municipal categories. How can I help you today?`
    : "Hello! 👋 I'm your **Smart City Civic Assistant**.\n\nI can check your active complaints, provide status updates, guide you through filing reports, or explain municipal categories. How can I help you today?";

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: welcomeText,
      time: new Date()
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when chat opens
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [messages, isOpen]);

  if (!isLoggedIn) return null; // Chatbot only active for authenticated users

  const quickActions = getQuickActions(user?.role);

  const handleSend = async (messageToSend) => {
    const text = (messageToSend || inputMessage).trim();
    if (!text || loading) return;

    // Add user message
    const userMsg = { sender: "user", text, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const res = await chatApi.sendMessage(text);
      const botResponse = res.data?.data?.message || "I could not process your request at this moment.";
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botResponse,
          intent: res.data?.data?.intent,
          time: new Date()
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I couldn't process that request right now. Please try again.",
          time: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-50">
      {/* Chat Window */}
      {isOpen ? (
        <div className="w-[calc(100vw-24px)] sm:w-[400px] max-w-[400px] h-[min(540px,calc(100dvh-110px))] bg-[#0F172A] rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-6">
          {/* Header */}
          <div className="bg-[#0B1120] text-white p-4 flex items-center justify-between border-b border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5 text-white" id="chatbot-header-title">
                  Smart City Assistant <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </h3>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Connected to Municipal DB
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Close chat"
              id="chatbot-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#070B14] text-xs sm:text-sm" id="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-br-xs shadow-md"
                      : "bg-[#0F172A] text-slate-200 border border-slate-800 rounded-bl-xs shadow-md"
                  }`}
                >
                  <div className="prose prose-xs prose-invert max-w-none text-current [&_strong]:text-teal-300 [&_a]:text-cyan-400">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 bg-[#0B1120] border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar" id="chatbot-quick-actions">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(action.message)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#0F172A] hover:bg-teal-500/10 text-slate-300 hover:text-teal-300 hover:border-teal-500/50 text-[11px] font-medium transition-colors border border-slate-700/80 disabled:opacity-40"
                id={`chatbot-quick-${idx}`}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#0B1120] border-t border-slate-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your complaints, status..."
              disabled={loading}
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 bg-[#070B14] border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl focus:outline-none focus:border-teal-500 disabled:opacity-60 transition-colors"
              id="chatbot-input"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 hover:brightness-110 disabled:opacity-40 transition-all shadow-md font-bold"
              aria-label="Send message"
              id="chatbot-send-btn"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Button */
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#0F172A]/90 backdrop-blur-md hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-teal-500/30 group"
          aria-label="Open Smart City Assistant"
          id="chatbot-open-btn"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
            <span className="absolute -top-1 -right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-teal-400 rounded-full animate-ping"></span>
          </div>
          <span className="tracking-tight whitespace-nowrap text-slate-100">Smart Assistant</span>
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;
