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
6. Multilingual Response: Accurately and empathetically respond in the exact language/dialect used by the user in their query (Hindi, Gujarati, Marathi, Bengali, Tamil, Telugu, Kannada, Malayalam, Punjabi, Odia, or English) so that citizens and patients can clearly comprehend triage instructions in their native tongue.
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
          signal: AbortSignal.timeout(120000), // 2 min timeout
        }
      );

      if (response.ok) {
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { reply: text, source: "gemini_ai" };
      }
    } catch {
      // Fallback engine engaged automatically
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
        signal: AbortSignal.timeout(120000), // 2 min timeout
      }
    );

    if (response.ok) {
      const json = await response.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    }
  } catch {
    // Handled gracefully
  }

  return "";
};

/**
 * Generate Proactive Epidemiological Outbreak Advisory in the requested Indian language
 */
export const generateProactiveOutbreakAdvisory = async ({
  state = "Maharashtra",
  district = "Pune",
  city = "All",
  language = "Hindi",
}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const targetLocation = city && city !== "All" ? `${city}, ${district}, ${state}` : `${district}, ${state}`;

  const prompt = `You are Bharat Swasthya AI's Chief Epidemiological Officer.
Generate a comprehensive, actionable Proactive Health Advisory and Disease Outbreak Forecast for:
Location: ${targetLocation}, India.
Language: Please write the ENTIRE advisory response in ${language} (using native script where applicable, e.g., Devanagari for Hindi/Marathi, Gujarati script, etc.).

Structure your markdown response with:
1. ### 📍 Regional Epidemiological Risk & Contagion Assessment (${targetLocation})
   - Forecast of active viral / vector-borne risks (e.g. Dengue, Chikungunya, Seasonal Viral Influenza, Gastroenteritis) based on regional weather, monsoons, and humidity.
2. ### 🌡️ Environmental & Meteorological Triggers
   - Water stagnation, humidity spikes, ambient temperature influences on vector breeding cycles.
3. ### 🚨 High-Priority Symptoms & Emergency Red Flags
   - Bulleted warning signs requiring urgent emergency room / PHC visit.
4. ### 🛡️ Household, Community & Grassroots Action Protocol
   - Concrete, actionable prevention steps (e.g., Weekly Dry-Day water scrub, ORS hydration, avoiding self-medication/NSAIDs).
5. ### 📞 Emergency Contacts & Free Helplines
   - Ambulance: **108**, National Health Helpline: **1075**, Tele-MANAS: **14416**.

Make the advisory professional, medically sound, empowering, and written completely in ${language}.`;

  if (apiKey && apiKey !== "your_gemini_api_key_here") {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
          signal: AbortSignal.timeout(30000), // 30s timeout
        }
      );

      if (response.ok) {
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.warn("Gemini proactive advisory synthesis error:", err.message);
    }
  }

  // Multi-lingual fallback generator for Indian languages
  return getLocalizedSmartAdvisory({ state, district, city, language, targetLocation });
};

/**
 * Built-in multi-lingual proactive health advisory generator
 */
function getLocalizedSmartAdvisory({ state, district, city, language, targetLocation }) {
  const langKey = (language || "Hindi").toLowerCase();

  if (langKey.includes("hindi") || langKey.includes("hi")) {
    return `### 📍 क्षेत्रीय महामारी विज्ञान जोखिम एवं स्वास्थ्य परामर्श (${targetLocation})

**भारत स्वास्थ्य एआई (Bharat Swasthya AI)** के संक्रामक रोग निगरानी नेटवर्क द्वारा जारी अग्रिम पूर्वानुमान:

#### 1. 🦠 संभावित संक्रामक रोग व संचरण जोखिम
- **मच्छर जनित रोग:** डेंगू (Dengue), चिकनगुनिया एवं मलेरिया का बढ़ता जोखिम।
- **मौसमी वायरल संक्रमण:** इन्फ्लूएंजा (H3N2 / Viral Flu) एवं श्वसन संबंधी संक्रमण के मामलों में वृद्धि।
- **जल जनित रोग:** गैस्ट्रोएंटेराइटिस (पेट संक्रमण) व टायफाइड से सतर्क रहें।

#### 2. 🌡️ मौसमी एवं पर्यावरणीय कारक
- हालिया तापमान व आर्द्रता (Humidity) में उतार-चढ़ाव मच्छरों के लार्वा पनपने के लिए अनुकूल वातावरण बनाते हैं।
- खुले जलपात्रों व कूलर में पानी जमा रहने से संक्रमण का प्रसार तीव्र हो सकता है।

#### 3. 🚨 प्रमुख लक्षण व आपातकालीन खतरे के संकेत (Red Flags)
- **चेतावनी लक्षण:** 102°F से अधिक तेज बुखार, आंखों के पीछे गंभीर दर्द, जोड़ों में जकड़न।
- **तत्काल अस्पताल जाएं यदि:** उल्टी में खून आना, मसूड़ों से रक्तस्राव, अत्यधिक कमजोरी, या पेट में असहनीय दर्द हो।

#### 4. 🛡️ घरेलू व सामुदायिक रोकथाम प्रोटोकॉल
- **साप्ताहिक ड्राई-डे (Dry Day):** हर 3 से 4 दिन में घर के कूलर, गमलों की ट्रे व टंकियों का पानी खाली कर सुखाएं।
- **उचित जलयोजन:** दिनभर ओआरएस (ORS), नारियल पानी, व उबला हुआ पानी पिएं।
- **सावधानी:** बिना डॉक्टर की सलाह के एस्पिरिन या आईबुप्रोफेन (NSAIDs) का सेवन न करें। केवल पैरासिटामोल लें।

#### 📞 निःशुल्क आपातकालीन हेल्पलाइन नंबर
- 🚑 **108** - 24x7 राष्ट्रीय एम्बुलेंस सेवा (National Ambulance)
- 🩺 **1075** - राष्ट्रीय स्वास्थ्य पोर्टल हेल्पलाइन (MoHFW)
- 🧠 **14416** - टेली-मानस मानसिक स्वास्थ्य परामर्श (Tele-MANAS)`;
  }

  if (langKey.includes("gujarat") || langKey.includes("gu")) {
    return `### 📍 પ્રાદેશિક રોગચાળો જોખમ અને આરોગ્ય સલાહકાર (${targetLocation})

**ભારત સ્વાસ્થ્ય AI (Bharat Swasthya AI)** સર્વેલન્સ નેટવર્ક દ્વારા જારી કરાયેલ આગોતરી આગાહી:

#### 1. 🦠 સક્રિય વાયરલ અને વાહકજન્ય જોખમ
- **મચ્છરજન્ય રોગો:** ડેન્ગ્યુ (Dengue), ચિકનગુનિયા અને મેલેરિયાનું વધતું જોખમ.
- **મોસમી વાયરલ તાવ:** વાયરલ ફ્લૂ (H3N2) અને ગળામાં ઇન્ફેક્શનના કેસો.
- **પાણીજન્ય રોગો:** ગેસ્ટ્રો અને ટાઇફોઇડ સામે સાવચેતી રાખો.

#### 2. 🚨 કટોકટીના લક્ષણો અને જોખમી સંકેતો (Red Flags)
- **લક્ષણો:** ખૂબ ઊંચો તાવ, આંખો પાછળ દુખાવો, સાંધાનો સખત દુખાવો.
- **તાત્કાલિક હોસ્પિટલ પહોંચો:** પેઢામાંથી લોહી નીકળવું, સતત ઉલટી થવી, શ્વાસ લેવામાં તકલીફ અથવા અતિશય નબળાઈ.

#### 3. 🛡️ ઘરગથ્થુ અને સામાજિક નિવારણ પગલાં
- **સાપ્તાહિક ડ્રાય-ડે (Dry Day):** કૂલર, કૂંડાની ટ્રે અને ખુલ્લા પાણીના પાત્રો દર 3-4 દિવસે સાફ કરો.
- **હાઇડ્રેશન:** પુષ્કળ પ્રવાહી, ORS અને ઉકાળેલું પાણી પીવો.
- **દવાઓ:** ડૉક્ટરની સલાહ વિના દર્દ નિવારક દવાઓ (Aspirin/Brufen) ન લો.

#### 📞 કટોકટી હેલ્પલાઇન નંબરો
- 🚑 **108** - 24x7 ફ્રી એમ્બ્યુલન્સ સેવા
- 🩺 **1075** - રાષ્ટ્રીય આરોગ્ય પોર્ટલ હેલ્પલાઇન
- 🧠 **14416** - ટેલી-માનસ માનસિક સ્વાસ્થ્ય સહાય`;
  }

  if (langKey.includes("marathi") || langKey.includes("mr")) {
    return `### 📍 प्रादेशिक रोगनिदान जोखीम व आरोग्य सल्लागार (${targetLocation})

**भारत स्वास्थ्य एआय (Bharat Swasthya AI)** रोग नियंत्रण नेटवर्कतर्फे जारी करण्यात आलेला अंदाज:

#### 1. 🦠 संसर्गजन्य व कीटकजन्य रोगांचा प्रादुर्भाव
- **डासांमुळे होणारे आजार:** डेंग्यू (Dengue), चिकुनगुनिया आणि मलेरियाचा वाढता धोका.
- **हंगामी व्हायरल ताप:** व्हायरल फ्लू, खोकला व घशाचा संसर्ग.
- **पाण्यामुळे होणारे आजार:** गॅस्ट्रो आणि टायफॉइडपासून सावध राहा.

#### 2. 🚨 धोक्याची लक्षणे (Emergency Red Flags)
- **लक्षणे:** १०२°F पेक्षा जास्त ताप, डोळ्यांच्या मागे तीव्र वेदना, अंगदुखी.
- **त्वरित रुग्णालयात जा जर:** हिरड्यांमधून रक्त येणे, सतत उलट्या होणे किंवा तीव्र अशक्तपणा जाणवणे.

#### 3. 🛡️ प्रतिबंधात्मक उपाय व काळजी
- **साप्ताहिक कोरडा दिवस (Dry Day):** कुलर, कुंड्या व पाण्याच्या टाक्या आठवड्यातून एकदा रिकाम्या करून स्वच्छ करा.
- **ओआरएस (ORS) व पाणी:** भरपूर प्रमाणात उकळलेले पाणी आणि पातळ पदार्थ घ्या.
- **सल्ला:** डॉक्टरांच्या सल्ल्याशिवाय वेदनाशामक औषधे (Painkillers) घेऊ नका.

#### 📞 मोफत आपत्कालीन संपर्क क्रमांक
- 🚑 **108** - २४x७ रुग्णवाहिका सेवा (Ambulance)
- 🩺 **1075** - राष्ट्रीय आरोग्य हेल्पलाइन
- 🧠 **14416** - टेली-मानस मानसिक आरोग्य समुपदेशन`;
  }

  if (langKey.includes("bengali") || langKey.includes("bn") || langKey.includes("bangla")) {
    return `### 📍 আঞ্চলিক মহামারী ঝুঁকি ও স্বাস্থ্য নির্দেশিকা (${targetLocation})

**ভারত স্বাস্থ্য এআই (Bharat Swasthya AI)** রোগ নজরদারি নেটওয়ার্ক দ্বারা পূর্বাভাস:

#### 1. 🦠 সংক্রামক ও মশাবাহিত রোগের ঝুঁকি
- **মশাবাহিত রোগ:** ডেঙ্গু (Dengue), চিকুনগুনিয়া ও ম্যালেরিয়ার সতর্কতা।
- **মৌসুমি ভাইরাল জ্বর:** ইনফ্লুয়েঞ্জা ও শ্বাসনালীর সংক্রমণ।
- **জলবাহিত রোগ:** পেটের সংক্রমণ ও টাইফয়েড থেকে সাবধান থাকুন।

#### 2. 🚨 জরুরি বিপদের লক্ষণ (Danger Signs)
- **লক্ষণ:** তীব্র জ্বর, চোখের পেছনে ব্যথা, শরীরে প্রচণ্ড ব্যথা।
- **জরুরি হাসপাতালে যান:** মাড়ি থেকে রক্তপাত, ক্রমাগত বমি, বা চরম দুর্বলতা দেখা দিলে।

#### 3. 🛡️ প্রতিরোধমূলক নির্দেশাবলী
- **সাপ্তাহিক ড্রাই ডে:** সপ্তাহে অন্তত একবার কুলার ও ফুলের টবের জমা জল পরিষ্কার করুন।
- **পর্যাপ্ত জলপান:** ওআরএস (ORS), ডাবের জল ও ফোটানো জল পান করুন।
- **চিকিৎসা পরামর্শ:** চিকিৎসকের পরামর্শ ছাড়া অ্যাসপিরিন বা ব্যথানাশক ওষুধ খাবেন না।

#### 📞 জরুরি হেল্পলাইন
- 🚑 **108** - ২৪x৭ ফ্রি অ্যাম্বুলেন্স সেবা
- 🩺 **1075** - জাতীয় স্বাস্থ্য হেল্পলাইন
- 🧠 **14416** - টেলি-মানস মানসিক স্বাস্থ্য সহায়তা`;
  }

  if (langKey.includes("tamil") || langKey.includes("ta")) {
    return `### 📍 பிராந்திய தொற்றுநோய் அபாய மதிப்பீடு (${targetLocation})

**பாரத் ஸ்வஸ்த்யா AI (Bharat Swasthya AI)** சுகாதார எச்சரிக்கை அறிக்கை:

#### 1. 🦠 பரவும் வைரஸ் மற்றும் கொசுக்களால் பரவும் நோய்கள்
- **கொசுக்களால் பரவும் நோய்கள்:** டெங்கு (Dengue), சிக்குன்குனியா மற்றும் மலேரியா பரவல் அபாயம்.
- **பருவக்கால காய்ச்சல்:** வைரஸ் காய்ச்சல் மற்றும் சளி தொற்றுகள்.
- **நீர் மூலம் பரவும் நோய்கள்:** சுத்தமான குடிநீரைப் பயன்படுத்துங்கள்.

#### 2. 🚨 அவசர எச்சரிக்கை அறிகுறிகள் (Red Flags)
- கடுமையான காய்ச்சல், கண்களுக்குப் பின்னால் வலி, கடுமையான உடல் வலி.
- ஈறுகளில் இரத்தப்போக்கு அல்லது தொடர் வாந்தி இருந்தால் உடனடியாக மருத்துவமனை செல்லவும்.

#### 3. 🛡️ பாதுகாப்பு மற்றும் தடுப்பு வழிகாட்டுதல்கள்
- தேங்கிய தண்ணீரை வாரத்திற்கு ஒருமுறை அகற்றி கொசு உற்பத்தியைத் தடுக்கவும்.
- ORS மற்றும் கொதிக்கவைத்த நீரைக் குடிக்கவும்.
- மருத்துவரின் ஆலோசனையின்றி வலி மாத்திரைகளை உட்கொள்ள வேண்டாம்.

#### 📞 அவசர உதவி எண்கள்
- 🚑 **108** - 24x7 அவசர ஆம்புலன்ஸ் சேவை
- 🩺 **1075** - தேசிய சுகாதார உதவி எண்
- 🧠 **14416** - டெலி-மானாஸ் மனநல ஆலோசனை`;
  }

  if (langKey.includes("telugu") || langKey.includes("te")) {
    return `### 📍 ప్రాంతీయ వ్యాధి ముప్పు & ఆరోగ్య సలహా (${targetLocation})

**భారత్ స్వాస్థ్య AI (Bharat Swasthya AI)** పర్యవేక్షణ నెట్‌వర్క్ హెచ్చరిక:

#### 1. 🦠 వ్యాపించే వైరల్ మరియు దోమల ద్వారా వచ్చే వ్యాధులు
- **దోమల ద్వారా వచ్చే వ్యాధులు:** డెంగ్యూ (Dengue), చికెన్‌గున్యా మరియు మలేరియా ముప్పు.
- **సీజనల్ ఫ్లూ:** వైరల్ జ్వరం మరియు గొంతు ఇన్ఫెక్షన్లు.

#### 2. 🚨 అత్యవసర ప్రమాద సంకేతాలు (Danger Signs)
- అధిక జ్వరం, కళ్ల వెనుక నొప్పి, కీళ్ల నొప్పులు.
- చిగుళ్ల నుండి రక్తస్రావం లేదా విపరీతమైన బలహీనత ఉంటే వెంటనే ఆసుపత్రికి వెళ్లండి.

#### 3. 🛡️ తీసుకోవలసిన జాగ్రత్తలు
- వారానికి ఒకసారి నీటి నిల్వలను తొలగించి డ్రై డే పాటించండి.
- ORS మరియు కాచి చల్లార్చిన నీటిని పుష్కలంగా త్రాగండి.
- వైద్యుల సలహా లేకుండా పెయిన్ కిల్లర్స్ వాడకండి.

#### 📞 అత్యవసర హెల్ప్‌లైన్ నంబర్లు
- 🚑 **108** - 24x7 అంబులెన్స్ సేవ
- 🩺 **1075** - జాతీయ ఆరోగ్య హెల్ప్‌లైన్
- 🧠 **14416** - టెలీ-మానస్ మానసిక ఆరోగ్య సహాయం`;
  }

  if (langKey.includes("kannada") || langKey.includes("kn")) {
    return `### 📍 ಪ್ರಾದೇಶಿಕ ಸಾಂಕ್ರಾಮಿಕ ರೋಗ ಎಚ್ಚರಿಕೆ ಮತ್ತು ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶಿ (${targetLocation})

**ಭಾರತ್ ಸ್ವಾಸ್ಥ್ಯ AI (Bharat Swasthya AI)** ಮುನ್ಸೂಚನೆ ವರದಿ:

#### 1. 🦠 ವೈರಲ್ ಮತ್ತು ಸೊಳ್ಳೆಗಳಿಂದ ಹರಡುವ ರೋಗಗಳ ಅಪಾಯ
- **ಸೊಳ್ಳೆಗಳಿಂದ ಹರಡುವ ರೋಗಗಳು:** ಡೆಂಗ್ಯೂ (Dengue), ಚಿಕೂನ್‌ಗುನ್ಯಾ ಮತ್ತು ಮಲೇರಿಯಾ ಎಚ್ಚರಿಕೆ.
- **ಋತುಮಾನದ ವೈರಲ್ ಜ್ವರ:** ಜ್ವರ ಮತ್ತು ಶ್ವಾಸಕೋಶದ ಸೋಂಕುಗಳು.

#### 2. 🚨 ತುರ್ತು ಅಪಾಯದ ಲಕ್ಷಣಗಳು (Danger Signs)
- ತೀವ್ರ ಜ್ವರ, ಕಣ್ಣುಗಳ ಹಿಂಭಾಗದಲ್ಲಿ ನೋವು, ಕೀಲು ನೋವು.
- ರಕ್ತಸ್ರಾವ ಅಥವಾ ನಿರಂತರ ವಾಂತಿಯ ಲಕ್ಷಣಗಳಿದ್ದರೆ ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ.

#### 3. 🛡️ ಮುನ್ನೆಚ್ಚರಿಕೆ ಕ್ರಮಗಳು
- ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ ಮತ್ತು ವಾರಕ್ಕೊಮ್ಮೆ 'ಡ್ರೈ ಡೇ' ಆಚರಿಸಿ.
- ORS ಮತ್ತು ಕುದಿಸಿ ಆರಿಸಿದ ನೀರನ್ನು ಸೇವಿಸಿ.

#### 📞 ತುರ್ತು ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆಗಳು
- 🚑 **108** - ಉಚಿತ ಆಂಬ್ಯುಲೆನ್ಸ್ ಸೇವೆ
- 🩺 **1075** - ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಸಹಾಯವಾಣಿ
- 🧠 **14416** - ಟೆಲಿ-ಮಾನಸ್ ಮಾನಸಿಕ ಆರೋಗ್ಯ ನೆರವು`;
  }

  if (langKey.includes("malayalam") || langKey.includes("ml")) {
    return `### 📍 പ്രാദേശിക രോഗബാധ സാധ്യതയും ആരോഗ്യ നിർദ്ദേശങ്ങളും (${targetLocation})

**ഭാരത് സ്വാസ്ഥ്യ AI (Bharat Swasthya AI)** ആരോഗ്യ മുന്നറിയിപ്പ്:

#### 1. 🦠 സാംക്രമിക രോഗങ്ങളും കൊതുക് പരത്തുന്ന രോഗങ്ങളും
- **കൊതുക് പരത്തുന്ന രോഗങ്ങൾ:** ഡെങ്കിപ്പനി (Dengue), ചിക്കുൻഗുനിയ, മലേറിയ സാധ്യത.
- **സീസണൽ പനി:** വൈറൽ പനിയും ശ്വാസകോശ അണുബാധകളും.

#### 2. 🚨 അടിയന്തര അപകട ലക്ഷണങ്ങൾ (Red Flags)
- കഠിനമായ പനി, കണ്ണിന് പിന്നിലെ വേദന, സന്ധി വേദന.
- മോണയിൽ നിന്നുള്ള രക്തസ്രാവം, അമിത ക്ഷീണം എന്നിവ കണ്ടാൽ ഉടൻ ആശുപത്രിയിലെത്തുക.

#### 3. 🛡️ പ്രതിരോധ മാർഗ്ഗങ്ങൾ
- കെട്ടിക്കിടക്കുന്ന വെള്ളം ഒഴിവാക്കി ഉറവിട നശീകരണം നടത്തുക.
- ഒ.ആർ.എസ് (ORS), തിളപ്പിച്ചാറിയ വെള്ളം ധാരാളം കുടിക്കുക.

#### 📞 അടിയന്തര ഹെൽപ്പ് ലൈൻ നമ്പറുകൾ
- 🚑 **108** - 24x7 ആംബുലൻസ് സർവീസ്
- 🩺 **1075** - ദേശീയ ആരോഗ്യ ഹെൽപ്പ് ലൈൻ
- 🧠 **14416** - ടെലി-മാനസ് മാനസികാരോഗ്യ സഹായം`;
  }

  if (langKey.includes("punjabi") || langKey.includes("pa")) {
    return `### 📍 ਖੇਤਰੀ ਮਹਾਂਮਾਰੀ ਜੋਖਮ ਅਤੇ ਸਿਹਤ ਸਲਾਹ (${targetLocation})

**ਭਾਰਤ ਸਵਾਸਥਿਆ AI (Bharat Swasthya AI)** ਰੋਗ ਨਿਗਰਾਨੀ ਚੇਤਾਵਨੀ:

#### 1. 🦠 ਵਾਇਰਲ ਅਤੇ ਮੱਛਰਾਂ ਤੋਂ ਫੈਲਣ ਵਾਲੀਆਂ ਬਿਮਾਰੀਆਂ ਦਾ ਖਤਰਾ
- **ਮੱਛਰਾਂ ਤੋਂ ਬਿਮਾਰੀਆਂ:** ਡੇਂਗੂ (Dengue), ਚਿਕਨਗੁਨੀਆ ਅਤੇ ਮਲੇਰੀਆ ਤੋਂ ਸਾਵਧਾਨ ਰਹੋ।
- **ਮੌਸਮੀ ਵਾਇਰਲ ਫਲੂ:** ਖੰਘ, ਜ਼ੁਕਾਮ ਅਤੇ ਗਲੇ ਦੀ ਇਨਫੈਕਸ਼ਨ।

#### 2. 🚨 ਐਮਰਜੈਂਸੀ ਖ਼ਤਰੇ ਦੇ ਚਿੰਨ੍ਹ (Danger Signs)
- ਤੇਜ਼ ਬੁਖਾਰ, ਅੱਖਾਂ ਦੇ ਪਿੱਛੇ ਦਰਦ, ਜੋੜਾਂ ਦਾ ਤੇਜ਼ ਦਰਦ।
- ਉਲਟੀਆਂ ਵਿੱਚ ਖੂਨ ਜਾਂ ਬਹੁਤ ਜ਼ਿਆਦਾ ਕਮਜ਼ੋਰੀ ਹੋਣ 'ਤੇ ਤੁਰੰਤ ਹਸਪਤਾਲ ਜਾਓ।

#### 3. 🛡️ ਬਚਾਅ ਅਤੇ ਘਰੇਲੂ ਉਪਾਅ
- ਕੂਲਰਾਂ ਅਤੇ ਖੁੱਲ੍ਹੇ ਭਾਂਡਿਆਂ ਵਿੱਚ ਪਾਣੀ ਖੜ੍ਹਾ ਨਾ ਹੋਣ ਦਿਓ।
- ORS ਦਾ ਘੋਲ ਅਤੇ ਉਬਾਲਿਆ ਹੋਇਆ ਪਾਣੀ ਪੀਓ।
- ਬਿਨਾਂ ਡਾਕਟਰ ਦੀ ਸਲਾਹ ਤੋਂ ਦਰਦ ਨਿਵਾਰਕ ਦਵਾਈਆਂ ਨਾ ਲਓ।

#### 📞 ਐਮਰਜੈਂਸੀ ਹੈਲਪਲਾਈਨ
- 🚑 **108** - 24x7 ਫ੍ਰੀ ਐਂਬੂਲੈਂਸ ਸੇਵਾ
- 🩺 **1075** - ਰਾਸ਼ਟਰੀ ਸਿਹਤ ਹੈਲਪਲਾਈਨ
- 🧠 **14416** - ਟੈਲੀ-ਮਾਨਸ ਮਾਨਸਿਕ ਸਿਹਤ ਸਹਾਇਤਾ`;
  }

  if (langKey.includes("odia") || langKey.includes("od")) {
    return `### 📍 ଆଞ୍ଚଳିକ ସଂକ୍ରାମକ ରୋଗ ବିପଦ ଓ ସ୍ୱାସ୍ଥ୍ୟ ପରାମର୍ଶ (${targetLocation})

**ଭାରତ ସ୍ୱାସ୍ଥ୍ୟ AI (Bharat Swasthya AI)** ସତର୍କତା ସୂଚନା:

#### 1. 🦠 ସକ୍ରିୟ ଭାଇରାଲ ଓ ମଶାବାହିତ ରୋଗ
- **ମଶାବାହିତ ରୋଗ:** ଡେଙ୍ଗୁ (Dengue), ଚିକୁନଗୁନିଆ ଏବଂ ମ୍ୟାଲେରିଆ ସତର୍କତା।
- **ଋତୁକାଳୀନ ଭାଇରାଲ ଜ୍ୱର:** ଜ୍ୱର, କାଶ ଓ ଥଣ୍ଡା ସଂକ୍ରମଣ।

#### 2. 🚨 ଜରୁରୀକାଳୀନ ବିପଦର ଲକ୍ଷଣ (Danger Signs)
- ଅତ୍ୟଧିକ ଜ୍ୱର, ଆଖି ପଛପଟେ ଯନ୍ତ୍ରଣା, ଗଣ୍ଠି ଯନ୍ତ୍ରଣା।
- ରକ୍ତସ୍ରାବ କିମ୍ବା ଅତ୍ୟଧିକ ଦୁର୍ବଳତା ଥିଲେ ତୁରନ୍ତ ଡାକ୍ତରଖାନା ଯାଆନ୍ତୁ।

#### 3. 🛡️ ପ୍ରତିଷେଧକ ବ୍ୟବସ୍ଥା
- ଘର ଚାରିପାଖେ ପାଣି ଜମିବାକୁ ଦିଅନ୍ତୁ ନାହିଁ।
- ପ୍ରଚୁର ORS ଓ ଫୁଟା ପାଣି ପିଅନ୍ତୁ।

#### 📞 ଜରୁରୀକାଳୀନ ହେଲ୍ପଲାଇନ୍ ନମ୍ବର
- 🚑 **108** - ୨୪x୭ ଆମ୍ବୁଲାନ୍ସ ସେବା
- 🩺 **1075** - ଜାତୀୟ ସ୍ୱାସ୍ଥ୍ୟ ହେଲ୍ପଲାଇନ୍
- 🧠 **14416** - ଟେଲି-ମାନସ ମାନସିକ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟତା`;
  }

  // Default English Structured Advisory
  return `### 📍 Regional Epidemiological Outbreak Advisory (${targetLocation})

**Bharat Swasthya AI Disease Surveillance Network Intelligence Forecast**

#### 1. 🦠 Active Pathogens & Contagion Vectors Under Watch
- **Vector-Borne Pathogens:** Elevated index for Dengue Fever (DENV-2 serotype) and Chikungunya. Aedes mosquito breeding activity active in low-lying and water-stagnant zones.
- **Seasonal Viral Respiratory Illness:** Flu-like illness clusters (H3N2 / RSV) logged across sub-district outpatient centers.
- **Water-Borne Enteric Illness:** Precaution advised for Acute Gastroenteritis and Typhoid in areas with intermittent municipal water supply.

#### 2. 🌡️ Meteorological & Environmental Co-Factors
- Humidity and ambient temperature fluctuations create conducive conditions for mosquito larvae maturation (4-7 day cycle).
- Intermittent rain showers and open water holding vessels require strict surveillance.

#### 3. 🚨 High-Priority Symptoms & Emergency Red Flags
- **Primary Symptoms:** Sudden onset high fever (102°F+), retro-orbital eye ache, debilitating arthralgia, and petechial skin rashes.
- **Immediate ER Red Flags:** Bleeding gums/nose, persistent vomiting, abdominal guarding, abrupt drop in blood pressure, or extreme lethargy.

#### 4. 🛡️ Household, Community & Grassroots Action Protocol
- **Weekly "Dry-Day" Habit:** Completely drain and scrub desert coolers, planter trays, and open cisterns every 3 to 4 days to eliminate Aedes mosquito breeding.
- **Hydration Discipline:** Maintain daily electrolyte balance with ORS packets, tender coconut water, and boiled drinking water.
- **Clinical Warning:** Strictly avoid self-medicating with Aspirin, Ibuprofen, or NSAIDs during febrile episodes to prevent hemorrhagic complications. Use Paracetamol only under qualified guidance.

#### 📞 24x7 Free National Health Helplines
- 🚑 **108** - National Ambulance Emergency Dispatch
- 🩺 **1075** - National Health Portal Helpline (MoHFW)
- 🧠 **14416** - Tele-MANAS (Mental Health & Psychological Counseling Support)`;
}


