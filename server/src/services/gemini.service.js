// Path: server\src\services\gemini.service.js
/**
 * Bharat Swasthya AI - Gemini Intelligence Service
 * Powers conversational tele-health symptom triage (fallback when Python chatbot is unavailable).
 */

/**
 * AI Tele-Health Chatbot Triage
 * Context-aware of user's state, district, city and active outbreaks
 */
export const triageUserSymptomQuery = async ({
  message,
  state = "Maharashtra",
  district = "Pune",
  city = "City",
  history = [],
  activeAlerts = [],
}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  const systemContext = `
You are Bharat Swasthya AI's Virtual Medical Tele-Health Assistant.
User Location: ${city}, ${district}, ${state} (India).
Active Outbreak Alerts in this region: ${activeAlerts.map(a => a.diseaseName).join(", ") || "Dengue, Viral Flu"}

Instructions:
1. Provide empathetic, accurate, preliminary medical triage and health education.
2. Cross-reference their symptoms with active local outbreaks in ${district}, ${state}.
3. Give structured bullet points for: Potential Causes, Immediate Home Care / First-Aid, Danger Signs (Red Flags requiring urgent ER visit).
4. Emphasize that you are an AI assistant and they should consult a registered medical practitioner (MBBS/MD) for formal diagnosis.
5. Provide relevant Indian helpline contacts (National Ambulance 108, National Health Helpline 1075).
`;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemContext}\n\nUser Question: ${message}` },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { reply: text, source: "gemini_ai" };
      }
    } catch (err) {
      console.warn("Gemini chatbot request failed, fallback engine engaged:", err.message);
    }
  }

  // Built-in intelligent conversational triage
  return {
    reply: generateSmartTriageResponse(message, state, district, city, activeAlerts),
    source: "swasthya_smart_engine",
  };
};

function generateSmartTriageResponse(message, state, district, city, activeAlerts) {
  const lower = message.toLowerCase();
  const alertNames = activeAlerts.map(a => a.diseaseName).join(", ") || "Seasonal Viral Fever & Dengue";

  if (lower.includes("fever") || lower.includes("temperature") || lower.includes("bukhar") || lower.includes("body pain")) {
    return `### Symptom Assessment for ${district}, ${state}

**Active Alerts in your area:** ${alertNames}

Based on your symptoms of **fever and body discomfort**:

1. **Possible Causes to Watch:**
   - Viral Influenza / Seasonal Febrile Illness
   - Vector-Borne Infection (Dengue / Chikungunya - elevated in ${district})
   - Upper Respiratory Infection

2. **Immediate Supportive Care:**
   - **Hydration:** Drink plenty of fluids (coconut water, ORS, warm soups).
   - **Rest:** Complete physical rest in a well-ventilated room.
   - **Temperature Control:** Luke-warm sponge baths. Consult a doctor before taking medication. Avoid aspirin/NSAIDs if dengue is suspected.

3. **Danger Signs (Visit Hospital Immediately):**
   - Temperature exceeding 103F (39.4C) not responding to medication
   - Persistent vomiting, severe abdominal pain, or bleeding gums/skin patches
   - Extreme dizziness or difficulty breathing

*Need immediate help? Call National Ambulance at **108** or National Health Helpline at **1075**.*`;
  }

  if (lower.includes("cough") || lower.includes("cold") || lower.includes("throat") || lower.includes("khansi") || lower.includes("breath")) {
    return `### Respiratory Symptom Guide (${district}, ${state})

**Active Air & Health Profile:** Viral Flu surveillance active in ${state}.

1. **Clinical Insights:**
   - Acute viral pharyngitis or seasonal bronchitis.
   - Allergic irritation due to ambient humidity and particulate matter.

2. **Home Relief Recommendations:**
   - **Salt-water gargles:** Warm saline gargles 3-4 times daily for throat inflammation.
   - **Steam inhalation:** 5-10 minutes twice daily.
   - **Honey & Ginger:** Soothes ticklish dry coughs.
   - **Masking:** Wear a 3-ply mask when around family members to prevent viral aerosol spread.

3. **Red Flags:**
   - Rapid breathing (>24 breaths/min) or chest tightness.
   - Blood in sputum or cough lasting longer than 10-14 days.`;
  }

  if (lower.includes("stomach") || lower.includes("vomit") || lower.includes("diarrhea") || lower.includes("loose") || lower.includes("pet")) {
    return `### Gastrointestinal Distress Advice (${district}, ${state})

1. **Primary Concern:** Rapid fluid and electrolyte loss.

2. **Crucial Action Steps:**
   - **Start ORS (Oral Rehydration Salts):** Sip 1 standard packet mixed in 1 liter of clean boiled water throughout the day.
   - **Dietary:** Follow the BRAT diet (Bananas, Rice, Applesauce, Toast) / light khichdi with curd.
   - **Strict Hygiene:** Wash hands with antiseptic soap before eating.

3. **Emergency Red Flags:**
   - Inability to keep fluids down for over 8 hours.
   - High fever accompanied by blood in stool.
   - Extreme thirst, dark urine, or sunken eyes.`;
  }

  return `### Bharat Swasthya AI - Health Guidance (${city}, ${district}, ${state})

Thank you for reaching out. Based on your inquiry regarding *"**${message}**"*:

- **Regional Health Context:** We are actively monitoring health indicators across **${district}, ${state}**. Current surveillance highlights **${alertNames}**.
- **General Health Principle:** Maintain good hydration, consume balanced nutritious home-cooked meals, and practice routine hand sanitation.
- **Preventive Triage:** If you are experiencing unusual pain, persistent fever, respiratory difficulty, or sudden lethargy, we strongly recommend visiting the nearest Primary Health Centre (PHC) or Community Health Centre (CHC).

**Important Helplines:**
- **108** - National Ambulance Emergency
- **1075** - National Health Portal Helpline
- **14416** - Tele-MANAS (Mental Health Support)`;
}

/**
 * Format an immediate viral alert into a polished public health card
 * Returns markdown string or empty string if Gemini fails
 */
export const formatImmediateAlert = async ({
  title,
  diseaseName,
  symptoms = [],
  severity,
  patientCount,
  state,
  district,
  city,
  description,
}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "";

  const prompt = `You are Bharat Swasthya AI's Public Health Alert Formatter.
Format the following raw field report into a clear, actionable public health advisory card for citizens.
Use markdown. Include these sections:
- Disease Overview (1-2 sentences)
- Symptoms to Watch (bullet list)
- Immediate Precautions (bullet list)
- Danger Signs - when to seek emergency help (bullet list)
- Location & Case Count

Keep it concise, citizen-friendly, and medically accurate. Do not hallucinate symptoms or precautions not mentioned below.

Raw Data:
Disease: ${diseaseName}
Location: ${city}, ${district}, ${state}
Cases: ${patientCount}
Severity: ${severity}
Symptoms observed: ${symptoms.join(", ")}
Field notes: ${description}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        signal: AbortSignal.timeout(5000),
      }
    );

    if (response.ok) {
      const json = await response.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    }
  } catch (err) {
    console.warn("Gemini formatting failed for immediate alert:", err.message);
  }

  return "";
};

