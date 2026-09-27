import { Complaint, COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES } from "../models/complaints.model.js";
import { ComplaintUpdate } from "../models/complaintUpdates.model.js";
import { Notification } from "../models/notifications.model.js";
import { DEPARTMENTS } from "../models/users.model.js";
import dayjs from "dayjs";

// ─────────────────────────────────────────────────────────
// STATIC RESPONSES
// ─────────────────────────────────────────────────────────

const staticResponses = {
  GREETING: [
    "Hello! 👋 I'm your **Smart City Civic Assistant**.\n\nI can help you with:\n• Checking complaint status\n• Viewing complaint history & details\n• Reporting guide & categories\n• Priority & AI classification info\n• Notification updates\n\nHow can I help you today?"
  ],

  ABOUT_SMARTCITY: [
    "**SmartCity** is an AI-powered civic complaint management platform that helps citizens report civic issues, track complaints in real time, and receive updates about their resolution.\n\n" +
    "Key features:\n" +
    "• 📷 **Photo-based reporting** — Upload a picture and our AI auto-classifies the issue\n" +
    "• 🔍 **Real-time tracking** — Follow your complaint from submission to resolution\n" +
    "• 📊 **AI-powered classification** — Automatic category and priority detection\n" +
    "• ✅ **Before/After verification** — Compare photos to confirm resolution\n" +
    "• 🔔 **Instant notifications** — Stay updated at every stage"
  ],

  CREATE_COMPLAINT_HELP: [
    "To report a civic issue:\n\n" +
    "1. Navigate to **'Report Issue'** from your dashboard.\n" +
    "2. Upload a clear photograph of the issue (pothole, garbage, leak, etc.).\n" +
    "3. Our **AI engine** will automatically detect the category and suggest a priority level.\n" +
    "4. Enter a descriptive title, description, and location address.\n" +
    "5. Review the AI suggestion and submit.\n" +
    "6. You'll receive an instant tracking number (e.g. `SC-2026-000001`).\n\n" +
    "You can track your complaint status anytime from your dashboard."
  ],

  COMPLAINT_CATEGORIES: [
    // Built dynamically in handler — this is the fallback
    "SmartCity covers the following municipal categories:\n\n" +
    Object.entries(COMPLAINT_CATEGORIES)
      .map(([cat, subs]) => `• **${cat}**: ${subs.join(", ")}`)
      .join("\n") +
    "\n\nOur AI can automatically classify your photo into the right category, or you can select it manually."
  ],

  REOPEN_COMPLAINT_HELP: [
    "If you are not satisfied with how a complaint was resolved:\n\n" +
    "1. Open the complaint from your dashboard or complaint history.\n" +
    "2. Review the **Before vs After** photographs uploaded by municipal staff.\n" +
    "3. Click **'No, Reopen Complaint'**.\n" +
    "4. Provide a specific reason explaining why the issue remains unresolved.\n\n" +
    "The complaint will be marked **REOPENED** and automatically escalated to the city administration with **HIGH** priority."
  ],

  RESOLUTION_PROCESS: [
    "The SmartCity complaint resolution process follows these stages:\n\n" +
    "1. **SUBMITTED** — Your complaint is received and queued for review.\n" +
    "2. **UNDER_REVIEW** — An administrator is reviewing the issue details.\n" +
    "3. **ASSIGNED** — A municipal field officer has been assigned to your complaint.\n" +
    "4. **IN_PROGRESS** — The field officer has started work on the issue.\n" +
    "5. **RESOLVED** — The issue has been addressed. You'll be asked to verify via Before/After photos.\n" +
    "6. **REOPENED** — If you're not satisfied, the complaint is escalated with HIGH priority.\n\n" +
    "At each stage, you receive a notification with details."
  ],

  PRIORITY_INFORMATION: [
    "SmartCity uses four priority levels for complaints:\n\n" +
    "• 🔴 **CRITICAL** — Immediate public safety hazard requiring urgent attention (e.g., open manholes, major water main breaks).\n" +
    "• 🟠 **HIGH** — Significant issue affecting daily life requiring fast response (e.g., large potholes on main roads, overflowing sewage).\n" +
    "• 🟡 **MEDIUM** — Standard civic issue that needs timely attention (e.g., damaged footpaths, broken street lights).\n" +
    "• 🟢 **LOW** — Minor issue that can be addressed during routine maintenance (e.g., faded signboards, minor cracks).\n\n" +
    "Priority is initially suggested by our AI and can be reviewed or adjusted by city administrators."
  ],

  AI_INFORMATION: [
    "SmartCity uses **AI-assisted analysis** to help process complaints faster:\n\n" +
    "• **Image Classification** — Our AI analyzes uploaded photos to detect the type of civic issue.\n" +
    "• **Text Classification** — The complaint description is analyzed to confirm the category.\n" +
    "• **Priority Suggestion** — AI recommends a priority level based on the issue's apparent severity.\n\n" +
    "The AI suggestion is a **recommendation only** — it can be reviewed and overridden by authorized administrators. " +
    "All final decisions are made by municipal staff."
  ],

  DEPARTMENT_INFORMATION: [
    "SmartCity municipal departments and the issues they handle:\n\n" +
    Object.entries(COMPLAINT_CATEGORIES)
      .map(([dept, issues]) => `• **${dept} Department**: ${issues.join(", ")}`)
      .join("\n") +
    "\n\nWhen you submit a complaint, it is routed to the appropriate department based on its category."
  ],

  CONTACT_SUPPORT: [
    "For additional assistance beyond what this chatbot can provide:\n\n" +
    "• Use the **Report Issue** feature to file a formal civic complaint.\n" +
    "• Check your **Notifications** for updates on existing complaints.\n" +
    "• Review your **Complaint History** for past submissions.\n\n" +
    "All complaints are managed through the SmartCity platform to ensure proper tracking and accountability."
  ],

  THANK_YOU: [
    "You're welcome! 😊 Thank you for using SmartCity to help improve our city. If you need anything else, feel free to ask!"
  ],

  GOODBYE: [
    "Goodbye! 👋 Thank you for using the Smart City Civic Assistant. Stay safe and don't hesitate to report any civic issues you encounter!"
  ],

  UNKNOWN: [
    "I'm currently designed to help with SmartCity complaints, complaint status, complaint history, categories, priorities, and related services.\n\n" +
    "Try asking:\n" +
    "• *\"What is my complaint status?\"*\n" +
    "• *\"Show my complaints\"*\n" +
    "• *\"How do I submit a complaint?\"*\n" +
    "• *\"How do I reopen a complaint?\"*\n" +
    "• *\"What categories are available?\"*\n" +
    "• *\"What do complaint priorities mean?\"*"
  ],

  SECURITY_VIOLATION: [
    "I can only help you with your own SmartCity complaints and account information. I'm not able to provide access to other users' data, internal system details, or administrative credentials.\n\n" +
    "If you need help, try asking:\n" +
    "• *\"What is my complaint status?\"*\n" +
    "• *\"Show my complaints\"*"
  ]
};

// ─────────────────────────────────────────────────────────
// INTENT DETECTION — Scoring-based with priority ordering
// ─────────────────────────────────────────────────────────

/**
 * Intent pattern definitions ordered by specificity (most specific first).
 * Each intent has an array of keyword/phrase groups.
 * A match is scored and the highest-scoring intent wins.
 */
const INTENT_PATTERNS = [
  // SECURITY — must be checked first to block malicious queries
  {
    intent: "SECURITY_VIOLATION",
    patterns: [
      "show all complaints", "all complaints", "all users", "all citizens",
      "another user", "other user", "someone else",
      "admin credentials", "admin password", "staff credentials",
      "jwt secret", "jwt token", "access token secret",
      "database record", "database info", "database detail",
      "env variable", "environment variable", ".env",
      "api key", "server config", "server configuration",
      "mongo uri", "mongodb connection", "connection string",
      "give me everything", "dump database", "export data",
      "show admin", "admin info", "show staff info",
      "internal detail", "system info", "server info"
    ],
    priority: 100
  },

  // COMPLAINT_DETAILS — specific complaint by number or "details"
  {
    intent: "COMPLAINT_DETAILS",
    patterns: [
      "tell me more about complaint", "details of complaint",
      "show details", "complaint detail", "more about my complaint",
      "tell me about complaint", "info about complaint",
      "what happened to complaint", "details of my"
    ],
    priority: 95
  },

  // COMPLAINT_TIMELINE — updates/timeline for a complaint
  {
    intent: "COMPLAINT_TIMELINE",
    patterns: [
      "timeline", "updates happened", "complaint updates",
      "what updates", "show updates", "update history",
      "complaint timeline", "track updates", "activity log"
    ],
    priority: 94
  },

  // REOPEN_COMPLAINT_HELP — reopening guidance (checked before status to avoid "reopen" matching status)
  {
    intent: "REOPEN_COMPLAINT_HELP",
    patterns: [
      "reopen", "not satisfied", "not resolved", "still broken",
      "poor work", "reject resolution", "want to reopen",
      "how to reopen", "reopen complaint", "reopen my complaint",
      "reopen issue"
    ],
    priority: 90
  },

  // COMPLAINT_STATUS — check status of complaint
  {
    intent: "COMPLAINT_STATUS",
    patterns: [
      "status of", "check status", "complaint status",
      "where is my complaint", "track my complaint", "progress of",
      "is my complaint resolved", "any update on my complaint",
      "what is happening with", "what's happening with",
      "check my complaint", "my complaint status",
      "where is my issue"
    ],
    priority: 85
  },

  // COMPLAINT_HISTORY — list complaints
  {
    intent: "COMPLAINT_HISTORY",
    patterns: [
      "my complaints", "complaint history", "show complaints",
      "list my issues", "past complaints", "all my complaints",
      "what complaints have i", "complaints i submitted",
      "complaints did i submit", "list my reports",
      "show my complaints", "my complaint history"
    ],
    priority: 80
  },

  // NOTIFICATION_INFORMATION — notification queries
  {
    intent: "NOTIFICATION_INFORMATION",
    patterns: [
      "notification", "notifications", "any new updates",
      "unread notification", "my notifications", "show notification",
      "do i have notification", "any notification",
      "new updates", "show my updates"
    ],
    priority: 75
  },

  // RESOLUTION_PROCESS — how resolution works
  {
    intent: "RESOLUTION_PROCESS",
    patterns: [
      "resolution process", "how does resolution work",
      "complaint resolution", "how is complaint resolved",
      "resolution stages", "complaint stages",
      "complaint lifecycle", "process of complaint"
    ],
    priority: 72
  },

  // CREATE_COMPLAINT_HELP — filing a complaint
  {
    intent: "CREATE_COMPLAINT_HELP",
    patterns: [
      "report", "file a complaint", "new complaint",
      "submit issue", "how to lodge", "create complaint",
      "how do i report", "how can i report",
      "report a pothole", "report garbage", "report an issue",
      "report a leakage", "report a broken", "how to submit",
      "lodge a complaint", "file an issue", "submit a complaint",
      "how to file", "how to create"
    ],
    priority: 70
  },

  // PRIORITY_INFORMATION — priority levels
  {
    intent: "PRIORITY_INFORMATION",
    patterns: [
      "priority", "priorities", "what is high priority",
      "what does high priority mean", "what does medium priority",
      "what does low priority", "what does critical",
      "priority levels", "complaint priority",
      "what are priorities"
    ],
    priority: 65
  },

  // AI_INFORMATION — AI classification
  {
    intent: "AI_INFORMATION",
    patterns: [
      "ai classification", "ai work", "how does ai",
      "machine learning", "image classification",
      "ai analysis", "ai detect", "how does the ai",
      "ai category", "automatic classification",
      "computer vision", "smartcityai", "smart city ai"
    ],
    priority: 63
  },

  // DEPARTMENT_INFORMATION — departments
  {
    intent: "DEPARTMENT_INFORMATION",
    patterns: [
      "department", "which department",
      "who handles", "who is responsible",
      "department handles", "department for",
      "road department", "waste department",
      "drainage department", "water department"
    ],
    priority: 60
  },

  // COMPLAINT_CATEGORIES — available categories
  {
    intent: "COMPLAINT_CATEGORIES",
    patterns: [
      "category", "categories", "what can i report",
      "types of complaints", "which issues",
      "what issues can i report", "what types",
      "available categories", "complaint types"
    ],
    priority: 55
  },

  // ABOUT_SMARTCITY — what is SmartCity
  {
    intent: "ABOUT_SMARTCITY",
    patterns: [
      "what is smartcity", "what is smart city", "about smartcity",
      "about smart city", "about this platform", "about this app",
      "what is this app", "what does smartcity do",
      "tell me about smartcity"
    ],
    priority: 50
  },

  // CONTACT_SUPPORT — support/help
  {
    intent: "CONTACT_SUPPORT",
    patterns: [
      "contact support", "get help", "i need assistance",
      "need help", "customer support", "support team",
      "contact us", "helpline", "how can i get help"
    ],
    priority: 45
  },

  // THANK_YOU
  {
    intent: "THANK_YOU",
    patterns: [
      "thank you", "thanks", "thank u", "thx", "ty",
      "appreciate it", "that was helpful", "great help"
    ],
    priority: 40
  },

  // GOODBYE
  {
    intent: "GOODBYE",
    patterns: [
      "bye", "goodbye", "see you", "good night",
      "take care", "cya", "later", "see ya"
    ],
    priority: 35
  },

  // GREETING — checked last because "hi"/"hello" match many things
  {
    intent: "GREETING",
    patterns: [
      "hello", "hi", "hey", "good morning", "good afternoon",
      "good evening", "howdy", "greetings", "hola",
      "who are you", "how does this work"
    ],
    priority: 30
  }
];

// Staff-specific patterns (only matched when user.role === "STAFF")
const STAFF_PATTERNS = [
  {
    intent: "STAFF_TASKS",
    patterns: [
      "my assigned", "assigned complaints", "my tasks",
      "pending tasks", "how many tasks", "assigned to me",
      "my assignments", "show my tasks", "task summary",
      "staff dashboard"
    ],
    priority: 88
  }
];

// Admin-specific patterns (only matched when user.role === "ADMIN")
const ADMIN_PATTERNS = [
  {
    intent: "ADMIN_STATS",
    patterns: [
      "how many complaints", "total complaints", "complaint stats",
      "pending complaints", "resolved complaints", "complaint statistics",
      "high priority complaints", "complaint count", "system stats",
      "dashboard stats", "complaint summary", "admin stats"
    ],
    priority: 88
  }
];

/**
 * Extract complaint number from message text.
 * Supports SC-XXXX-XXXXXX format.
 */
function extractComplaintNumber(text) {
  const match = text.match(/sc-\d{4}-\d{6}/i);
  return match ? match[0].toUpperCase() : null;
}

/**
 * Detect the user's intent from their message using scoring-based pattern matching.
 * Most specific patterns are checked first; highest priority wins.
 */
export function detectIntent(message = "", userRole = "CITIZEN") {
  const text = message.toLowerCase().trim();

  if (!text) {
    return { intent: "UNKNOWN", complaintNumber: null, score: 0 };
  }

  const complaintNumber = extractComplaintNumber(text);

  // If the message is JUST a complaint number, treat as status check
  if (complaintNumber && text.replace(/[^a-z0-9]/g, "") === complaintNumber.toLowerCase().replace(/[^a-z0-9]/g, "")) {
    return { intent: "COMPLAINT_STATUS", complaintNumber, score: 100 };
  }

  // Build pattern list based on role
  let allPatterns = [...INTENT_PATTERNS];
  if (userRole === "STAFF") {
    allPatterns = [...STAFF_PATTERNS, ...allPatterns];
  } else if (userRole === "ADMIN") {
    allPatterns = [...ADMIN_PATTERNS, ...allPatterns];
  }

  let bestMatch = { intent: "UNKNOWN", score: 0 };

  for (const group of allPatterns) {
    let matchCount = 0;

    for (const pattern of group.patterns) {
      if (text.includes(pattern)) {
        // Longer pattern matches score higher (more specific)
        matchCount += pattern.split(" ").length;
      }
    }

    if (matchCount > 0) {
      // Score = match word count * priority weight
      const score = matchCount * (group.priority / 10);

      if (score > bestMatch.score) {
        bestMatch = { intent: group.intent, score };
      }
    }
  }

  // If complaint number is present and intent is ambiguous, default to COMPLAINT_STATUS
  if (complaintNumber && bestMatch.intent === "UNKNOWN") {
    bestMatch = { intent: "COMPLAINT_STATUS", score: 50 };
  }

  return {
    intent: bestMatch.intent,
    complaintNumber,
    score: bestMatch.score
  };
}


// ─────────────────────────────────────────────────────────
// MAIN QUERY PROCESSOR
// ─────────────────────────────────────────────────────────

/**
 * Process a chat query from an authenticated user.
 * @param {Object} user - Full user object from req.user (has _id, role, name, department)
 * @param {string} message - The user's chat message
 * @returns {Object} { intent, message, data? }
 */
export async function processChatQuery(user, message) {
  const userId = user._id;
  const userRole = user.role || "CITIZEN";
  const { intent, complaintNumber } = detectIntent(message, userRole);

  switch (intent) {

    // ───── SECURITY VIOLATION ─────
    case "SECURITY_VIOLATION": {
      return {
        intent,
        message: staticResponses.SECURITY_VIOLATION[0],
        data: null
      };
    }

    // ───── GREETING ─────
    case "GREETING": {
      const name = user.name ? user.name.split(" ")[0] : "";
      const greeting = name
        ? `Hello, ${name}! 👋 I'm your **Smart City Civic Assistant**.`
        : "Hello! 👋 I'm your **Smart City Civic Assistant**.";

      return {
        intent,
        message: greeting + "\n\nI can help you with:\n• Checking complaint status\n• Viewing complaint history & details\n• Reporting guide & categories\n• Priority & AI classification info\n• Notification updates\n\nHow can I help you today?",
        data: null
      };
    }

    // ───── ABOUT SMARTCITY ─────
    case "ABOUT_SMARTCITY": {
      return { intent, message: staticResponses.ABOUT_SMARTCITY[0], data: null };
    }

    // ───── CREATE COMPLAINT HELP ─────
    case "CREATE_COMPLAINT_HELP": {
      return {
        intent,
        message: staticResponses.CREATE_COMPLAINT_HELP[0],
        data: { actionUrl: "/citizen/report" }
      };
    }

    // ───── COMPLAINT CATEGORIES ─────
    case "COMPLAINT_CATEGORIES": {
      return {
        intent,
        message: staticResponses.COMPLAINT_CATEGORIES[0],
        data: { categories: Object.keys(COMPLAINT_CATEGORIES) }
      };
    }

    // ───── COMPLAINT STATUS ─────
    case "COMPLAINT_STATUS": {
      if (userRole === "CITIZEN") {
        return await handleCitizenComplaintStatus(userId, complaintNumber, intent);
      } else if (userRole === "STAFF") {
        // Staff asking about complaint status — show their assigned complaint
        return await handleStaffComplaintStatus(userId, complaintNumber, intent);
      } else {
        // Admin — show specific complaint if number given
        return await handleAdminComplaintStatus(complaintNumber, intent);
      }
    }

    // ───── COMPLAINT HISTORY ─────
    case "COMPLAINT_HISTORY": {
      return await handleComplaintHistory(userId, intent);
    }

    // ───── COMPLAINT DETAILS ─────
    case "COMPLAINT_DETAILS": {
      return await handleComplaintDetails(userId, userRole, complaintNumber, message, intent);
    }

    // ───── COMPLAINT TIMELINE ─────
    case "COMPLAINT_TIMELINE": {
      return await handleComplaintTimeline(userId, userRole, complaintNumber, message, intent);
    }

    // ───── REOPEN COMPLAINT HELP ─────
    case "REOPEN_COMPLAINT_HELP": {
      // Check if user has a resolved complaint to make the response contextual
      const resolvedComplaint = await Complaint.findOne({ citizen: userId, status: "RESOLVED" })
        .sort({ updatedAt: -1 });

      if (resolvedComplaint) {
        return {
          intent,
          message: `If you are dissatisfied with the resolution of complaint **${resolvedComplaint.complaintNumber}** (or any other):\n\n` +
            staticResponses.REOPEN_COMPLAINT_HELP[0].split(":\n\n")[1],
          data: { complaintNumber: resolvedComplaint.complaintNumber, complaintId: resolvedComplaint._id }
        };
      }

      return { intent, message: staticResponses.REOPEN_COMPLAINT_HELP[0], data: null };
    }

    // ───── RESOLUTION PROCESS ─────
    case "RESOLUTION_PROCESS": {
      return { intent, message: staticResponses.RESOLUTION_PROCESS[0], data: null };
    }

    // ───── PRIORITY INFORMATION ─────
    case "PRIORITY_INFORMATION": {
      return { intent, message: staticResponses.PRIORITY_INFORMATION[0], data: null };
    }

    // ───── AI INFORMATION ─────
    case "AI_INFORMATION": {
      return { intent, message: staticResponses.AI_INFORMATION[0], data: null };
    }

    // ───── DEPARTMENT INFORMATION ─────
    case "DEPARTMENT_INFORMATION": {
      return { intent, message: staticResponses.DEPARTMENT_INFORMATION[0], data: null };
    }

    // ───── NOTIFICATION INFORMATION ─────
    case "NOTIFICATION_INFORMATION": {
      return await handleNotificationInfo(userId, intent);
    }

    // ───── CONTACT SUPPORT ─────
    case "CONTACT_SUPPORT": {
      return { intent, message: staticResponses.CONTACT_SUPPORT[0], data: null };
    }

    // ───── THANK YOU ─────
    case "THANK_YOU": {
      return { intent, message: staticResponses.THANK_YOU[0], data: null };
    }

    // ───── GOODBYE ─────
    case "GOODBYE": {
      return { intent, message: staticResponses.GOODBYE[0], data: null };
    }

    // ───── STAFF TASKS ─────
    case "STAFF_TASKS": {
      return await handleStaffTasks(userId, intent);
    }

    // ───── ADMIN STATS ─────
    case "ADMIN_STATS": {
      return await handleAdminStats(intent);
    }

    // ───── UNKNOWN ─────
    default: {
      return { intent: "UNKNOWN", message: staticResponses.UNKNOWN[0], data: null };
    }
  }
}


// ─────────────────────────────────────────────────────────
// HANDLER: Citizen Complaint Status
// ─────────────────────────────────────────────────────────

async function handleCitizenComplaintStatus(userId, complaintNumber, intent) {
  // If a specific complaint number is given
  if (complaintNumber) {
    const complaint = await Complaint.findOne({ citizen: userId, complaintNumber })
      .populate("assignedStaff", "name department designation");

    if (!complaint) {
      return {
        intent,
        message: `No complaint found matching **${complaintNumber}** under your account. Please check the complaint number and try again.`,
        data: null
      };
    }

    return {
      intent,
      message: formatComplaintStatus(complaint),
      data: { complaintId: complaint._id, complaintNumber: complaint.complaintNumber, status: complaint.status }
    };
  }

  // No specific number — show all complaints as a list
  const complaints = await Complaint.find({ citizen: userId })
    .sort({ createdAt: -1 })
    .limit(10);

  if (complaints.length === 0) {
    return {
      intent,
      message: "You don't have any complaints registered yet. You can submit one via the **'Report Issue'** page.",
      data: null
    };
  }

  if (complaints.length === 1) {
    // Only one complaint — show full status
    const complaint = await Complaint.findById(complaints[0]._id)
      .populate("assignedStaff", "name department designation");
    return {
      intent,
      message: formatComplaintStatus(complaint),
      data: { complaintId: complaint._id, complaintNumber: complaint.complaintNumber, status: complaint.status }
    };
  }

  // Multiple complaints — show list
  const listText = complaints
    .map((c, i) => `${i + 1}. **${c.complaintNumber}** — ${c.title}\n   Status: **${c.status}** | Priority: ${c.priority}`)
    .join("\n\n");

  return {
    intent,
    message: `You have **${complaints.length}** complaint(s). Here are your recent ones:\n\n${listText}\n\nAsk about a specific complaint by its number, e.g. *"Status of ${complaints[0].complaintNumber}"*`,
    data: { totalCount: complaints.length }
  };
}

function formatComplaintStatus(complaint) {
  const staffInfo = complaint.assignedStaff
    ? `${complaint.assignedStaff.name} (${complaint.assignedStaff.department || "Municipal Staff"})`
    : "Pending assignment by city administrator";

  let msg = `**Complaint ${complaint.complaintNumber}**\n` +
    `*"${complaint.title}"*\n\n` +
    `• **Status**: ${complaint.status}\n` +
    `• **Category**: ${complaint.category}${complaint.subcategory ? ` (${complaint.subcategory})` : ""}\n` +
    `• **Priority**: ${complaint.priority}\n` +
    `• **Assigned To**: ${staffInfo}\n` +
    `• **Location**: ${complaint.locationAddress}\n` +
    `• **Filed On**: ${dayjs(complaint.createdAt).format("DD MMM YYYY, hh:mm A")}`;

  if (complaint.resolvedAt) {
    msg += `\n• **Resolved On**: ${dayjs(complaint.resolvedAt).format("DD MMM YYYY, hh:mm A")}`;
  }

  if (complaint.status === "RESOLVED") {
    msg += `\n\n✅ Please review the Before/After photos and confirm or reopen the complaint from your dashboard.`;
  }

  return msg;
}


// ─────────────────────────────────────────────────────────
// HANDLER: Complaint History
// ─────────────────────────────────────────────────────────

async function handleComplaintHistory(userId, intent) {
  const complaints = await Complaint.find({ citizen: userId })
    .sort({ createdAt: -1 })
    .limit(10);

  const totalCount = await Complaint.countDocuments({ citizen: userId });
  const resolvedCount = await Complaint.countDocuments({ citizen: userId, status: "RESOLVED" });
  const activeCount = totalCount - resolvedCount;

  if (totalCount === 0) {
    return {
      intent,
      message: "You haven't filed any civic complaints yet. Click **'Report Issue'** to submit your first complaint.",
      data: { totalCount: 0 }
    };
  }

  const summaryList = complaints
    .map((c, i) =>
      `${i + 1}. **${c.complaintNumber}** — ${c.title}\n` +
      `   Category: ${c.category} | Status: **${c.status}** | Priority: ${c.priority}\n` +
      `   📍 ${c.locationAddress} | 📅 ${dayjs(c.createdAt).format("DD MMM YYYY")}`
    )
    .join("\n\n");

  return {
    intent,
    message: `You have filed **${totalCount}** total complaint(s) (${resolvedCount} resolved, ${activeCount} active).\n\n${summaryList}\n\nView full details in your **Complaint History** tab.`,
    data: { totalCount, resolvedCount, activeCount }
  };
}


// ─────────────────────────────────────────────────────────
// HANDLER: Complaint Details
// ─────────────────────────────────────────────────────────

async function handleComplaintDetails(userId, userRole, complaintNumber, message, intent) {
  let complaint = null;

  if (complaintNumber) {
    // Look up by complaint number
    complaint = await Complaint.findOne({ complaintNumber })
      .populate("citizen", "name")
      .populate("assignedStaff", "name department designation");

    if (!complaint) {
      return {
        intent,
        message: `No complaint found with number **${complaintNumber}**. Please check the number and try again.`,
        data: null
      };
    }

    // Security: verify ownership
    const isOwner = complaint.citizen._id.toString() === userId.toString();
    const isAssignedStaff = userRole === "STAFF" && complaint.assignedStaff && complaint.assignedStaff._id.toString() === userId.toString();
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isAssignedStaff && !isAdmin) {
      return {
        intent,
        message: "I can't access that complaint because it does not belong to your account.",
        data: null
      };
    }
  } else {
    // No complaint number — show most recent complaint's details
    complaint = await Complaint.findOne({ citizen: userId })
      .sort({ createdAt: -1 })
      .populate("assignedStaff", "name department designation");

    if (!complaint) {
      return {
        intent,
        message: "You don't have any complaints yet. Submit one via the **'Report Issue'** page.",
        data: null
      };
    }
  }

  const staffInfo = complaint.assignedStaff
    ? `${complaint.assignedStaff.name} (${complaint.assignedStaff.department || "Staff"} — ${complaint.assignedStaff.designation || "Field Officer"})`
    : "Pending assignment";

  let details = `**Complaint Details — ${complaint.complaintNumber}**\n\n` +
    `• **Title**: ${complaint.title}\n` +
    `• **Description**: ${complaint.description}\n` +
    `• **Category**: ${complaint.category}${complaint.subcategory ? ` → ${complaint.subcategory}` : ""}\n` +
    `• **Status**: ${complaint.status}\n` +
    `• **Priority**: ${complaint.priority}\n` +
    `• **Location**: ${complaint.locationAddress}\n` +
    `• **Assigned To**: ${staffInfo}\n` +
    `• **Filed On**: ${dayjs(complaint.createdAt).format("DD MMM YYYY, hh:mm A")}`;

  if (complaint.aiCategory) {
    details += `\n• **AI Classification**: ${complaint.aiCategory} (${Math.round((complaint.aiConfidence || 0) * 100)}% confidence)`;
  }

  if (complaint.resolvedAt) {
    details += `\n• **Resolved On**: ${dayjs(complaint.resolvedAt).format("DD MMM YYYY, hh:mm A")}`;
  }

  if (complaint.reopenReason) {
    details += `\n• **Reopen Reason**: ${complaint.reopenReason}`;
  }

  details += `\n\nYou can ask *"Show timeline for ${complaint.complaintNumber}"* to see the full activity log.`;

  return {
    intent,
    message: details,
    data: { complaintId: complaint._id, complaintNumber: complaint.complaintNumber }
  };
}


// ─────────────────────────────────────────────────────────
// HANDLER: Complaint Timeline
// ─────────────────────────────────────────────────────────

async function handleComplaintTimeline(userId, userRole, complaintNumber, message, intent) {
  let complaint = null;

  if (complaintNumber) {
    complaint = await Complaint.findOne({ complaintNumber })
      .populate("citizen", "name");

    if (!complaint) {
      return {
        intent,
        message: `No complaint found with number **${complaintNumber}**.`,
        data: null
      };
    }

    // Security: verify access
    const isOwner = complaint.citizen._id.toString() === userId.toString();
    const isAssignedStaff = userRole === "STAFF" && complaint.assignedStaff && complaint.assignedStaff.toString() === userId.toString();
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isAssignedStaff && !isAdmin) {
      return {
        intent,
        message: "I can't access that complaint because it does not belong to your account.",
        data: null
      };
    }
  } else {
    // Default to most recent complaint
    complaint = await Complaint.findOne({ citizen: userId })
      .sort({ createdAt: -1 });

    if (!complaint) {
      return {
        intent,
        message: "You don't have any complaints yet.",
        data: null
      };
    }
  }

  const updates = await ComplaintUpdate.find({ complaint: complaint._id })
    .populate("user", "name role")
    .sort({ createdAt: 1 });

  if (updates.length === 0) {
    return {
      intent,
      message: `No timeline updates found for complaint **${complaint.complaintNumber}**.`,
      data: null
    };
  }

  const timelineText = updates
    .map((u) => {
      const date = dayjs(u.createdAt).format("DD MMM YYYY, hh:mm A");
      const actor = u.user ? `${u.user.name} (${u.user.role})` : "System";
      return `**${date}** — ${u.status || "Update"}\n${u.message}`;
    })
    .join("\n\n");

  return {
    intent,
    message: `**Timeline — ${complaint.complaintNumber}**\n*"${complaint.title}"*\n\n${timelineText}`,
    data: { complaintId: complaint._id, complaintNumber: complaint.complaintNumber, updateCount: updates.length }
  };
}


// ─────────────────────────────────────────────────────────
// HANDLER: Notification Information
// ─────────────────────────────────────────────────────────

async function handleNotificationInfo(userId, intent) {
  const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });
  const totalCount = await Notification.countDocuments({ recipient: userId });

  const recentNotifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("complaint", "complaintNumber");

  if (totalCount === 0) {
    return {
      intent,
      message: "You don't have any notifications yet. You'll receive notifications when your complaints are updated.",
      data: { unreadCount: 0, totalCount: 0 }
    };
  }

  const notifList = recentNotifications
    .map((n, i) => {
      const icon = n.isRead ? "📭" : "📬";
      const date = dayjs(n.createdAt).format("DD MMM, hh:mm A");
      const ref = n.complaint ? ` (${n.complaint.complaintNumber})` : "";
      return `${icon} **${n.title}**${ref}\n   ${n.message}\n   _${date}_`;
    })
    .join("\n\n");

  return {
    intent,
    message: `You have **${unreadCount}** unread notification(s) out of ${totalCount} total.\n\nRecent notifications:\n\n${notifList}\n\nView all notifications in your **Notifications** page.`,
    data: { unreadCount, totalCount }
  };
}


// ─────────────────────────────────────────────────────────
// HANDLER: Staff Tasks (role-specific)
// ─────────────────────────────────────────────────────────

async function handleStaffTasks(staffId, intent) {
  const assignedCount = await Complaint.countDocuments({ assignedStaff: staffId, status: "ASSIGNED" });
  const inProgressCount = await Complaint.countDocuments({ assignedStaff: staffId, status: "IN_PROGRESS" });
  const resolvedCount = await Complaint.countDocuments({ assignedStaff: staffId, status: "RESOLVED" });
  const reopenedCount = await Complaint.countDocuments({ assignedStaff: staffId, status: "REOPENED" });
  const highPriorityCount = await Complaint.countDocuments({
    assignedStaff: staffId,
    status: { $in: ["ASSIGNED", "IN_PROGRESS"] },
    priority: { $in: ["HIGH", "CRITICAL"] }
  });

  const recentTasks = await Complaint.find({
    assignedStaff: staffId,
    status: { $in: ["ASSIGNED", "IN_PROGRESS", "REOPENED"] }
  })
    .sort({ priority: -1, updatedAt: -1 })
    .limit(5)
    .populate("citizen", "name");

  let msg = `**Your Task Summary** 📋\n\n` +
    `• **Assigned**: ${assignedCount}\n` +
    `• **In Progress**: ${inProgressCount}\n` +
    `• **Resolved**: ${resolvedCount}\n` +
    `• **Reopened**: ${reopenedCount}\n` +
    `• **High/Critical Priority**: ${highPriorityCount}`;

  if (recentTasks.length > 0) {
    msg += "\n\n**Active Tasks:**\n\n";
    msg += recentTasks
      .map((t, i) => `${i + 1}. **${t.complaintNumber}** — ${t.title}\n   Status: ${t.status} | Priority: ${t.priority} | 📍 ${t.locationAddress}`)
      .join("\n\n");
  }

  return {
    intent,
    message: msg,
    data: { assignedCount, inProgressCount, resolvedCount, highPriorityCount }
  };
}


// ─────────────────────────────────────────────────────────
// HANDLER: Staff Complaint Status
// ─────────────────────────────────────────────────────────

async function handleStaffComplaintStatus(staffId, complaintNumber, intent) {
  if (complaintNumber) {
    const complaint = await Complaint.findOne({ complaintNumber })
      .populate("citizen", "name phone")
      .populate("assignedStaff", "name department");

    if (!complaint) {
      return { intent, message: `No complaint found with number **${complaintNumber}**.`, data: null };
    }

    // Staff can only see complaints assigned to them
    const isAssigned = complaint.assignedStaff && complaint.assignedStaff._id.toString() === staffId.toString();
    if (!isAssigned) {
      return { intent, message: "This complaint is not assigned to you.", data: null };
    }

    return {
      intent,
      message: formatComplaintStatus(complaint),
      data: { complaintId: complaint._id, complaintNumber: complaint.complaintNumber, status: complaint.status }
    };
  }

  // No specific number — redirect to STAFF_TASKS
  return await handleStaffTasks(staffId, intent);
}


// ─────────────────────────────────────────────────────────
// HANDLER: Admin Complaint Status
// ─────────────────────────────────────────────────────────

async function handleAdminComplaintStatus(complaintNumber, intent) {
  if (complaintNumber) {
    const complaint = await Complaint.findOne({ complaintNumber })
      .populate("citizen", "name email")
      .populate("assignedStaff", "name department designation");

    if (!complaint) {
      return { intent, message: `No complaint found with number **${complaintNumber}**.`, data: null };
    }

    return {
      intent,
      message: formatComplaintStatus(complaint),
      data: { complaintId: complaint._id, complaintNumber: complaint.complaintNumber, status: complaint.status }
    };
  }

  // No specific number — show admin stats
  return await handleAdminStats(intent);
}


// ─────────────────────────────────────────────────────────
// HANDLER: Admin Stats (role-specific)
// ─────────────────────────────────────────────────────────

async function handleAdminStats(intent) {
  const total = await Complaint.countDocuments();
  const submitted = await Complaint.countDocuments({ status: "SUBMITTED" });
  const underReview = await Complaint.countDocuments({ status: "UNDER_REVIEW" });
  const assigned = await Complaint.countDocuments({ status: "ASSIGNED" });
  const inProgress = await Complaint.countDocuments({ status: "IN_PROGRESS" });
  const resolved = await Complaint.countDocuments({ status: "RESOLVED" });
  const reopened = await Complaint.countDocuments({ status: "REOPENED" });
  const rejected = await Complaint.countDocuments({ status: "REJECTED" });
  const highPriority = await Complaint.countDocuments({ priority: { $in: ["HIGH", "CRITICAL"] } });

  return {
    intent: "ADMIN_STATS",
    message: `**System-wide Complaint Statistics** 📊\n\n` +
      `• **Total Complaints**: ${total}\n` +
      `• **Submitted** (awaiting review): ${submitted}\n` +
      `• **Under Review**: ${underReview}\n` +
      `• **Assigned**: ${assigned}\n` +
      `• **In Progress**: ${inProgress}\n` +
      `• **Resolved**: ${resolved}\n` +
      `• **Reopened**: ${reopened}\n` +
      `• **Rejected**: ${rejected}\n` +
      `• **High/Critical Priority**: ${highPriority}\n\n` +
      `View detailed analytics on your **Admin Dashboard**.`,
    data: { total, submitted, underReview, assigned, inProgress, resolved, reopened, rejected, highPriority }
  };
}


// ─────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────

export default {
  detectIntent,
  processChatQuery
};
