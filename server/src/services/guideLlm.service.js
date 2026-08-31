// Path: server/src/services/guideLlm.service.js
/**
 * Bharat Swasthya AI - Website Guide LLM Service
 * Answers questions about website navigation, where features are located, how to use tools,
 * in multiple Indian languages and English.
 * Enforces 1-day (24-hour) chat history filtering.
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const WEBSITE_CONTEXT = `
BHARATSWASTHYA AI — CITIZEN & USER NAVIGATION GUIDE

BharatSwasthya AI is India's National Epidemiological Outbreak Intelligence & Digital Health Platform. It provides citizens with real-time contagious disease tracking across Indian states and districts, AI-powered regional outbreak advisories, 24x7 emergency helplines, and an AI Tele-Health symptom triage chatbot.

==================================================
1. TOP NAVIGATION BAR (Available on all pages)
==================================================
- "BharatSwasthya AI" Logo: Click to return to the Home page.
- "Home" Button: Returns to the main Citizen Dashboard / Regional Surveillance Feed.
- "Emergency 108" Button (Red with phone icon): Opens the 24x7 Emergency Helplines drawer from anywhere without requiring login.
- "AI Health Chatbot" / "Chatbot" Button (Teal): Opens the AI Tele-Health Chatbot modal. (If not logged in, redirects to the Sign In page).
- "Website Guide" Button (with Compass/Sparkles): Opens this Website Navigation Guide assistant.
- "APIs" Button: Opens the Interactive Public REST API Explorer for health telemetry and developers.
- "Sign In / Register" Button (When not logged in): Opens the Authentication portal.
- "Profile & Avatar" Button (When logged in): Displays user name and "Citizen" badge. Clicking opens the Edit Profile modal.
- "Sign Out" Icon Button: Logs out the user securely.

==================================================
2. HOME / CITIZEN HEALTH RADAR
==================================================
The Home dashboard contains:
- Hero Section:
  • "Talk to AI Health Assistant" button: Launches the AI tele-health symptom triage chatbot.
  • "Emergency Help (108 Ambulance)" button: Opens the 24x7 emergency directory.
  • "Edit Profile" button: Allows logged-in citizens to update their profile and jurisdiction.
  • Live Statistics Counters: Monitored Cases, Active High Alerts, Surveillance Districts, Emergency Hotlines.
- Regional Disease Surveillance Filter:
  • State, District, and City dropdown pickers to inspect health risks anywhere in India.
- Regional Advisory Engine:
  • "Get AI Advisory for [City/District]" button: Synthesizes live weather, contagion alerts, and public health directives for the selected region.
- Contagious & Viral Diseases Spread in Your Area:
  • Real-time disease cards (e.g. Dengue, Chikungunya, Influenza H3N2, H1N1).
  • Click "View Details" on any card to open the Viral Disease Details Modal.
- Immediate Health Alerts Section:
  • Local outbreaks, case counts, and alerts issued by verified doctors and health workers.
- Bottom Hero Banner:
  • "Launch Health Chatbot Now →" button: Direct shortcut to symptom triage.

==================================================
3. VIRAL DISEASE DETAILS MODAL
==================================================
Opened by clicking any viral disease card on the Home page. Features 4 tabs:
1. "Epidemiological Overview": Pathogen transmission mode, vulnerable high-risk cohorts, and household precautions.
2. "Symptoms & Red Flags": List of reported symptoms and urgent emergency danger signs.
3. "Clinical Protocol & Remarks": Medical treatment protocols, doctor field notes, and prescribed interventions.
4. "Field Reports": Grassroots patient count and clinical diagnoses from local health centers.
Modal Actions:
- "Copy Advisory": Copies the verified disease summary to clipboard.
- "108 Ambulance Hotline": Opens the 24x7 emergency dialer.
- "Triage with AI Assistant": Opens the AI Health Chatbot with a pre-filled query about that specific disease.

==================================================
4. AI TELE-HEALTH SYMPTOM CHATBOT
==================================================
- Accessed by:
  1. Clicking "AI Health Chatbot" in the top navbar.
  2. Clicking "Talk to AI Health Assistant" on the Home hero.
  3. Clicking "Triage with AI Assistant" inside any disease modal.
  4. Clicking "Launch Health Chatbot Now →" on the bottom banner.
- Requirement: User must be signed in (Citizen account). If not logged in, user is directed to Sign In.
- Chatbot Features:
  • Multi-conversation sidebar ("New Chat" button and past conversation history with delete options).
  • Location Context indicator: Displays district & state context, with a pencil icon to customize location for that chat.
  • Suggested quick prompt pills (e.g. "High fever with joint pain & headache", "Dry cough, sore throat & breathlessness").
  • Markdown-rendered medical triage recommendations (causes, home care, red flags).
  • Direct Emergency 108 button inside the chat header.

==================================================
5. 24x7 EMERGENCY HELPLINES DRAWER
==================================================
- Accessed by clicking "Emergency 108" / "Emergency Hotlines (108)" in navbar, hero, or footer.
- Open to all visitors (No sign-in required).
- Includes one-click phone dialers:
  • 108: National Emergency Ambulance Dispatch (Trauma/Accident/Cardiac)
  • 102: Maternal & Child Health Care (Janani Shishu Suraksha Karyakram - JSSK)
  • 1075: National Health Portal Helpline (MoHFW pan-India communicable disease guidance)
  • 104: State Medical & Tele-Advice Helpline
  • 14416: Tele-MANAS (Mental Health & Psychological Counseling in 20+ languages)
  • 112: Unified Pan-India Emergency (Police, Fire, Medical)

==================================================
6. USER ACCOUNT & AUTHENTICATION
==================================================
- Accessed via "Sign In / Register" in the top navbar or footer.
- 4 Auth Modes:
  1. "Sign In": Email and password login.
  2. "Register Citizen": Free citizen registration with Name, Email, Password, Phone, State, District, and City.
  3. "Verify Email": Enter the verification token sent to email to activate account.
  4. "Forgot Password": Reset password using email verification code.
- Profile Management:
  • When signed in, click the Profile avatar in the top navbar to open "Edit Profile Modal".
  • Allows updating Name, Phone number, Home State, District, and City / Locality.

==================================================
7. PUBLIC REST API EXPLORER
==================================================
- Accessed via "APIs" in the top navbar or "Open APIs" in the footer.
- Interactive API documentation for developers and third-party hospital management systems.
- Allows testing live GET/POST requests for viral diseases, outbreak alerts, stats, and helplines.

==================================================
8. WEBSITE GUIDE AI (Voice & Text Assistant)
==================================================
- Accessible via the floating Guide Bot button on the bottom corner or the "Website Guide" button in Navbar.
- Supports typed text and Voice input in Indian languages powered by Sarvam AI Speech-to-Text.
- Retains 1-day chat history for continuity.
`;

export const SYSTEM_PROMPT = `
You are the official BharatSwasthya AI Website Guide.

Your sole purpose is to help citizens and visitors understand, navigate, and use the BharatSwasthya AI website features.

RULES & GUIDELINES:
1. Always respond in the language used by the user (Hindi, English, Gujarati, Marathi, Bengali, Tamil, Telugu, Kannada, Malayalam, etc.).
2. If the user asks in Hindi, answer in polite, clear Hindi (using Devanagari script).
3. If the user asks in English or another language, answer in that language.
4. Give concise, step-by-step numbered instructions for navigation.
5. Bold the exact button and page names so they are easy to spot (e.g. "**Talk to AI Health Assistant**", "**Emergency 108**", "**Sign In / Register**").
6. Always explain login requirements clearly when mentioning the AI Health Chatbot or Profile editing.
7. Remind users of the **Emergency 108** button if they mention critical symptoms or emergencies.
8. If the user asks for medical diagnosis, treatment, or drug prescriptions, gently inform them: "I am the Website Guide assistant. For preliminary medical symptom triage, please use our **AI Health Chatbot**, or consult a registered doctor. For medical emergencies, call **108**."
9. If asked about features not present on BharatSwasthya AI, politely state that the feature is not available.
10. Return clean markdown formatted text.
`;

/**
 * Filter chat history to retain only messages from the last 24 hours (1 day).
 */
export const filterOneDayHistory = (history = []) => {
  if (!Array.isArray(history)) return [];
  const now = Date.now();
  return history.filter((item) => {
    if (!item) return false;
    if (!item.timestamp) return true; // Keep session messages if timestamp omitted
    const msgTime = new Date(item.timestamp).getTime();
    if (isNaN(msgTime)) return true;
    return now - msgTime <= ONE_DAY_MS;
  });
};

/**
 * Main Guide LLM Generator
 * Strictly sends requests to GUIDE_LLM_URL without fallback LLMs.
 */
export const generateWebsiteGuideResponse = async ({ message, chat_history = [] }) => {
  if (!message || typeof message !== "string") {
    return {
      success: false,
      response: "Please provide a valid query.",
    };
  }

  const trimmedMessage = message.trim();
  const filteredHistory = filterOneDayHistory(chat_history);
  const guideLlmUrl = process.env.GUIDE_LLM_URL;

  if (!guideLlmUrl || !guideLlmUrl.trim()) {
    return {
      success: false,
      response: "GUIDE_LLM_URL is not configured in server/.env. Please specify your Guide LLM API URL in server/.env file.",
      source: "configuration_error",
    };
  }

  try {
    const payload = {
      message: trimmedMessage,
      chat_history: filteredHistory,
    };

    const externalRes = await fetch(guideLlmUrl.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(120000), // 2 min timeout
    });

    if (!externalRes.ok) {
      const errorText = await externalRes.text().catch(() => "");
      return {
        success: false,
        response: `Guide LLM service returned HTTP ${externalRes.status}: ${errorText || externalRes.statusText}`,
        source: "external_guide_llm_error",
      };
    }

    const data = await externalRes.json();

    const guideText =
      data?.response ??
      data?.reply ??
      data?.output ??
      data?.message ??
      data?.text ??
      (typeof data === "string" ? data : "");

    if (guideText) {
      return {
        success: true,
        response: guideText,
        source: "external_guide_llm",
      };
    }

    return {
      success: data?.success ?? true,
      response: JSON.stringify(data),
      source: "external_guide_llm",
    };
  } catch {
    return {
      success: false,
      response: `Failed to connect to Guide LLM`,
      source: "network_error",
    };
  }
};


