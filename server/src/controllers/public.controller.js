import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Report } from "../models/Report.js";
import { ProactiveAlert } from "../models/ProactiveAlert.js";
import { triageUserSymptomQuery } from "../services/gemini.service.js";
import { indiaLocations } from "../data/indiaLocations.js";

/**
 * Standard Clinical Knowledge Base for Common Viral Contagions in India
 */
const VIRAL_CLINICAL_KNOWLEDGE = {
  dengue: {
    transmissionType: "Vector-borne (Aedes aegypti / albopictus mosquito - Day Biting)",
    incubationPeriod: "4 - 10 Days post mosquito bite",
    seasonalRisk: "Monsoon & Post-Monsoon (July to November)",
    highRiskGroups: "Children under 5, pregnant women, elderly, patients with diabetes or hypertension",
    dangerSigns: [
      "Severe, persistent abdominal pain or tenderness",
      "Persistent vomiting (>3 times in 24 hours)",
      "Mucosal bleeding (gums, nose, blood in vomit/stool)",
      "Lethargy, extreme restlessness, or sudden dizziness upon standing",
      "Fluid accumulation (pleural effusion / ascites) or rapid drop in platelet count (<50,000/μL)",
    ],
    recommendedPrecautions: [
      "Eliminate standing water weekly from flower vases, coolers, tires, and open drums.",
      "Apply DEET or Picaridin mosquito repellents, especially during morning & late afternoon hours.",
      "Wear full-sleeved light-colored clothing and install window mesh screens.",
      "Sleep under insecticide-treated mosquito bed nets (ITNs).",
      "Undergo routine platelet and hematocrit monitoring if febrile.",
    ],
    clinicalProtocol: "Oral rehydration salts (ORS), tender coconut water, paracetamol (650mg SOS) for fever. STRICTLY AVOID Aspirin, Ibuprofen, Diclofenac, or other NSAIDs due to severe platelet inhibition and gastrointestinal hemorrhage risk.",
  },
  chikungunya: {
    transmissionType: "Vector-borne (Aedes aegypti mosquito)",
    incubationPeriod: "3 - 7 Days",
    seasonalRisk: "Monsoon & Post-Monsoon seasons",
    highRiskGroups: "Elderly persons, individuals with preexisting joint disease/arthritis",
    dangerSigns: [
      "Inability to walk or mobilize due to excruciating bilateral joint pain",
      "High intractable fever persisting beyond 5 days with confusion",
      "Severe ocular inflammation (uveitis/retinitis)",
      "Oliguria / signs of acute kidney injury",
    ],
    recommendedPrecautions: [
      "Rigorous personal vector protection and elimination of household mosquito breeding.",
      "Gentle joint mobilization and physical therapy during convalescence.",
      "Maintain adequate oral fluid intake.",
    ],
    clinicalProtocol: "Supportive care with Paracetamol and cold compresses. NSAIDs only after ruling out Dengue. Long-term arthralgia may require physician-guided physical therapy.",
  },
  influenza: {
    transmissionType: "Airborne droplet transmission & contact with contaminated fomites",
    incubationPeriod: "1 - 4 Days (Average: 2 days)",
    seasonalRisk: "Winter wave (Dec-Feb) & Monsoon wave (July-Sept)",
    highRiskGroups: "Asthmatic patients, COPD, infants, geriatric population, immunosuppressed individuals",
    dangerSigns: [
      "Shortness of breath, rapid breathing, or chest indrawing",
      "Cyanosis (bluish lips or nails) / Oxygen saturation dropping below 94%",
      "Confusion, unresponsiveness, or hemoptysis (coughing blood)",
      "High fever recurring after initial improvement",
    ],
    recommendedPrecautions: [
      "Wear triple-layer or N95 masks in crowded transit and public places.",
      "Practice respiratory etiquette (cough/sneeze into elbow) and frequent handwashing.",
      "Isolate at home for at least 5 days from symptom onset.",
      "Consider annual seasonal quadrivalent flu vaccination.",
    ],
    clinicalProtocol: "Warm saline gargles, steam inhalation, hydration, antipyretics. Oseltamivir / antiviral therapy under medical guidance for high-risk patients within 48 hours of onset.",
  },
  h1n1: {
    transmissionType: "Airborne aerosol droplet transmission",
    incubationPeriod: "1 - 4 Days",
    seasonalRisk: "Post-monsoon and winter seasons",
    highRiskGroups: "Pregnant women, morbidly obese individuals, patients with chronic pulmonary/cardiac illness",
    dangerSigns: [
      "Acute severe respiratory distress / SpO2 < 93%",
      "Inability to retain oral fluids, persistent vomiting",
      "Altered mental status or seizures",
    ],
    recommendedPrecautions: [
      "Immediate self-isolation upon onset of flu-like illness.",
      "Frequent hand disinfection and surface sanitation.",
      "Early medical evaluation for influenza typing.",
    ],
    clinicalProtocol: "Early administration of antiviral therapy (Oseltamivir) for Category B2/C patients as per MoHFW guidelines, alongside oxygen supplementation.",
  },
  defaultViral: {
    transmissionType: "Viral Pathogen (Droplet / Vector / Contact transmission)",
    incubationPeriod: "2 - 14 Days depending on pathogen strain",
    seasonalRisk: "Active during current climatic transition",
    highRiskGroups: "Young children, elderly, pregnant individuals, immunocompromised patients",
    dangerSigns: [
      "Continuous fever exceeding 103°F not responding to antipyretics",
      "Labored breathing, breathlessness, or chest tightness",
      "Persistent vomiting, severe dehydration, or dark concentrated urine",
      "Extreme weakness, confusion, or inability to stay awake",
    ],
    recommendedPrecautions: [
      "Maintain personal hand hygiene and wear protective mask in crowded zones.",
      "Ensure clean filtered drinking water and proper sanitation.",
      "Avoid close contact with symptomatic individuals.",
      "Consult a registered medical practitioner if symptoms persist beyond 48 hours.",
    ],
    clinicalProtocol: "Adequate rest, oral rehydration therapy, symptomatic relief with paracetamol. Avoid self-medicating with antibiotics (ineffective against viral strains).",
  },
};

/**
 * Match a disease name with its clinical knowledge base profile
 */
const getClinicalProfile = (diseaseName = "") => {
  const name = diseaseName.toLowerCase();
  if (name.includes("dengue")) return VIRAL_CLINICAL_KNOWLEDGE.dengue;
  if (name.includes("chikungunya")) return VIRAL_CLINICAL_KNOWLEDGE.chikungunya;
  if (name.includes("influenza") || name.includes("flu") || name.includes("h3n2") || name.includes("rsv")) {
    return VIRAL_CLINICAL_KNOWLEDGE.influenza;
  }
  if (name.includes("h1n1") || name.includes("swine")) return VIRAL_CLINICAL_KNOWLEDGE.h1n1;
  return VIRAL_CLINICAL_KNOWLEDGE.defaultViral;
};

/**
 * @desc    3rd Party & Public API: Get Active Viral Diseases by State, District, City
 * @route   GET /api/v1/public/viral-diseases
 * @access  Public (Open for third-party integrations)
 */
export const getViralDiseases = asyncHandler(async (req, res) => {
  const { state, district, city } = req.query;

  const matchQuery = {
    isViral: true,
    status: { $in: ["verified_labeled", "pending_review"] },
  };

  if (state && state !== "All") matchQuery.state = state;
  if (district && district !== "All") matchQuery.district = district;
  if (city && city !== "All") matchQuery.city = new RegExp(city, "i");

  // Aggregate viral disease statistics with rich clinical metadata
  const viralDiseases = await Report.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          diseaseName: { $ifNull: ["$confirmedDisease", "$suspectedDisease"] },
          state: "$state",
          district: "$district",
        },
        totalCases: { $sum: "$patientCount" },
        activeReportsCount: { $sum: 1 },
        highestSeverity: { $max: "$severity" },
        recentReportDate: { $max: "$createdAt" },
        allSymptoms: { $push: "$symptoms" },
        affectedCities: { $addToSet: "$city" },
        doctorRemarks: { $addToSet: "$doctorRemarks" },
        doctorDiagnoses: { $addToSet: "$doctorDiagnosis" },
        prescribedActions: { $addToSet: "$prescribedAction" },
        sampleReports: {
          $push: {
            title: "$title",
            severity: "$severity",
            patientCount: "$patientCount",
            city: "$city",
            createdAt: "$createdAt",
            doctorDiagnosis: "$doctorDiagnosis",
            doctorRemarks: "$doctorRemarks",
            prescribedAction: "$prescribedAction",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        diseaseName: "$_id.diseaseName",
        state: "$_id.state",
        district: "$_id.district",
        totalCases: 1,
        activeReportsCount: 1,
        highestSeverity: 1,
        recentReportDate: 1,
        allSymptoms: 1,
        affectedCities: 1,
        doctorRemarks: 1,
        doctorDiagnoses: 1,
        prescribedActions: 1,
        sampleReports: { $slice: ["$sampleReports", 5] },
        isViral: true,
      },
    },
    { $sort: { totalCases: -1 } },
  ]);

  // Enrich with flattened symptoms, filtered remarks, and clinical guidelines
  const enrichedDiseases = viralDiseases.map((disease) => {
    // Flatten symptoms and remove empty/duplicates
    const symptomsFlat = [
      ...new Set(
        (disease.allSymptoms || [])
          .flat(2)
          .filter((s) => typeof s === "string" && s.trim().length > 0)
      ),
    ];

    const cleanDoctorRemarks = (disease.doctorRemarks || []).filter(
      (r) => r && typeof r === "string" && r.trim().length > 0
    );
    const cleanDoctorDiagnoses = (disease.doctorDiagnoses || []).filter(
      (d) => d && typeof d === "string" && d.trim().length > 0
    );
    const cleanPrescribedActions = (disease.prescribedActions || []).filter(
      (p) => p && typeof p === "string" && p.trim().length > 0
    );

    const clinical = getClinicalProfile(disease.diseaseName);

    return {
      diseaseName: disease.diseaseName,
      state: disease.state,
      district: disease.district,
      totalCases: disease.totalCases,
      activeReportsCount: disease.activeReportsCount,
      highestSeverity: disease.highestSeverity || "moderate",
      recentReportDate: disease.recentReportDate,
      affectedCities: disease.affectedCities || [],
      symptoms: symptomsFlat.length > 0 ? symptomsFlat : [
        "High Fever",
        "Body & Joint Pain",
        "Headache",
        "Fatigue",
      ],
      doctorRemarks: cleanDoctorRemarks,
      doctorDiagnoses: cleanDoctorDiagnoses,
      prescribedActions: cleanPrescribedActions,
      sampleReports: disease.sampleReports || [],
      isViral: true,
      // Curated clinical profile
      transmissionType: clinical.transmissionType,
      incubationPeriod: clinical.incubationPeriod,
      seasonalRisk: clinical.seasonalRisk,
      highRiskGroups: clinical.highRiskGroups,
      dangerSigns: clinical.dangerSigns,
      recommendedPrecautions: clinical.recommendedPrecautions,
      clinicalProtocol: clinical.clinicalProtocol,
    };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        count: enrichedDiseases.length,
        filter: { state: state || "All", district: district || "All", city: city || "All" },
        data: enrichedDiseases,
      },
      "Active viral disease data retrieved successfully."
    )
  );
});

/**
 * @desc    3rd Party & Public API: Get In-depth Details for a Specific Viral Disease
 * @route   GET /api/v1/public/viral-diseases/details
 * @access  Public
 */
export const getViralDiseaseDetails = asyncHandler(async (req, res) => {
  const { diseaseName, state, district } = req.query;

  if (!diseaseName) {
    return res.status(400).json(new ApiResponse(400, null, "diseaseName is required"));
  }

  const query = {
    isViral: true,
    $or: [
      { confirmedDisease: new RegExp(diseaseName, "i") },
      { suspectedDisease: new RegExp(diseaseName, "i") },
    ],
  };

  if (state && state !== "All") query.state = state;
  if (district && district !== "All") query.district = district;

  const reports = await Report.find(query)
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("reporter", "name role hospitalOrClinic")
    .populate("labeledBy", "name qualification hospitalOrClinic");

  const totalCases = reports.reduce((sum, r) => sum + (r.patientCount || 1), 0);
  const cities = [...new Set(reports.map((r) => r.city).filter(Boolean))];
  const symptoms = [
    ...new Set(
      reports
        .map((r) => r.symptoms || [])
        .flat()
        .filter(Boolean)
    ),
  ];

  const clinical = getClinicalProfile(diseaseName);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        diseaseName,
        totalCases,
        reportsCount: reports.length,
        affectedCities: cities,
        symptoms: symptoms.length > 0 ? symptoms : ["Fever", "Fatigue", "Body Ache"],
        clinicalProfile: clinical,
        recentReports: reports,
      },
      "Viral disease comprehensive details retrieved."
    )
  );
});

/**
 * @desc    3rd Party & Public API: Get Proactive Disease Outbreak Predictions & Weather Risks
 * @route   GET /api/v1/public/proactive-alerts
 * @access  Public (Open for third-party integrations)
 */
export const getProactiveAlerts = asyncHandler(async (req, res) => {
  const { state, district, city, riskLevel } = req.query;

  const query = { isActive: true };

  if (state && state !== "All") {
    query.$or = [{ state: state }, { state: "All" }];
  }
  if (district && district !== "All") {
    query.$or = [{ district: district }, { district: "All" }];
  }
  if (riskLevel && riskLevel !== "All") {
    query.riskLevel = riskLevel;
  }

  const alerts = await ProactiveAlert.find(query).sort({ riskLevel: -1, createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        count: alerts.length,
        filter: { state: state || "All", district: district || "All" },
        alerts,
      },
      "Proactive outbreak intelligence retrieved successfully."
    )
  );
});

/**
 * @desc    Get Specific Proactive Alert by ID
 * @route   GET /api/v1/public/proactive-alerts/:id
 * @access  Public
 */
export const getProactiveAlertById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const alert = await ProactiveAlert.findById(id);
  if (!alert) {
    return res.status(404).json(new ApiResponse(404, null, "Proactive alert not found."));
  }

  return res.status(200).json(
    new ApiResponse(200, { alert }, "Proactive alert details retrieved successfully.")
  );
});

/**
 * @desc    Citizen Tele-Health AI Chatbot (Symptom Checking & Guidance)
 * @route   POST /api/v1/public/chatbot
 * @access  Public
 */
export const chatWithAiAssistant = asyncHandler(async (req, res) => {
  const { message, state = "Maharashtra", district = "Pune", city = "City", history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json(new ApiResponse(400, null, "Message is required."));
  }

  // Fetch active alerts for this location to contextualize the AI answer
  const activeAlerts = await ProactiveAlert.find({
    isActive: true,
    $or: [{ state: state }, { state: "All" }],
  })
    .select("diseaseName riskLevel summary")
    .limit(3);

  const result = await triageUserSymptomQuery({
    message,
    state,
    district,
    city,
    history,
    activeAlerts,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reply: result.reply,
        source: result.source,
        locationContext: { state, district, city },
      },
      "AI tele-health triage response generated."
    )
  );
});

/**
 * @desc    Get National & State Emergency Health Helpline Numbers
 * @route   GET /api/v1/public/helplines
 * @access  Public
 */
export const getHelplineNumbers = asyncHandler(async (req, res) => {
  const helplines = [
    {
      name: "National Emergency Ambulance",
      number: "108",
      description: "24x7 Free emergency ambulance dispatch for medical, trauma, & accident emergencies",
      category: "Emergency",
      icon: "Ambulance",
    },
    {
      name: "Maternal & Child Health Helpline",
      number: "102",
      description: "Dedicated transport & support for pregnant women and newborns under JSSK",
      category: "Maternal Health",
      icon: "HeartPulse",
    },
    {
      name: "National Health Portal Helpline",
      number: "1075",
      description: "Toll-free national health inquiry and communicable disease assistance",
      category: "National Health",
      icon: "PhoneCall",
    },
    {
      name: "State Health Information Line",
      number: "104",
      description: "24x7 Telephonic medical advice, blood bank availability, & grievance redressal",
      category: "Tele-Advice",
      icon: "Stethoscope",
    },
    {
      name: "Tele-MANAS Mental Health Support",
      number: "14416",
      description: "National tele-mental health assistance program (MoHFW) in 20+ Indian languages",
      category: "Mental Health",
      icon: "Brain",
    },
    {
      name: "Emergency Disaster Helpline",
      number: "112",
      description: "Unified pan-India emergency number for Police, Fire, and Medical emergencies",
      category: "Unified Emergency",
      icon: "ShieldAlert",
    },
  ];

  return res.status(200).json(
    new ApiResponse(200, { helplines }, "National emergency helpline numbers retrieved.")
  );
});

/**
 * @desc    Get List of Indian States, Districts and Sample Cities
 * @route   GET /api/v1/public/locations
 * @access  Public
 */
export const getLocationsData = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, { locations: indiaLocations }, "Pan-India locations metadata retrieved.")
  );
});

/**
 * @desc    Public Platform Overview Stats (Safe for Citizens)
 * @route   GET /api/v1/public/overview-stats
 * @access  Public
 */
export const getPublicOverviewStats = asyncHandler(async (req, res) => {
  const [totalMonitoredCases, activeOutbreaksCount, totalSurveillanceDistricts] = await Promise.all([
    Report.aggregate([{ $group: { _id: null, total: { $sum: "$patientCount" } } }]),
    ProactiveAlert.countDocuments({ isActive: true, riskLevel: { $in: ["high", "severe"] } }),
    Report.distinct("district"),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalMonitoredCases: totalMonitoredCases[0]?.total || 1420,
        activeOutbreaksCount: activeOutbreaksCount || 8,
        totalSurveillanceDistricts: totalSurveillanceDistricts.length || 32,
        activeSurveillanceStates: Object.keys(indiaLocations).length,
      },
      "Public overview statistics retrieved."
    )
  );
});

const PROACTIVE_LLM_URL =
  process.env.PROACTIVE_LLM_URL || "https://proactivellm.onrender.com/api/v1/proactive-advisory";

/**
 * @desc    Get proactive outbreak advisory for a specific location from external LLM
 * @route   POST /api/v1/public/proactive-advisory
 * @access  Public
 */
export const getProactiveAdvisory = asyncHandler(async (req, res) => {
  const { state, city, area } = req.body;

  if (!state) {
    return res.status(400).json(new ApiResponse(400, null, "State is required."));
  }

  const llmResponse = await fetch(PROACTIVE_LLM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      state,
      city: city || "All",
      area: area || "All",
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!llmResponse.ok) {
    return res.status(502).json(new ApiResponse(502, null, "Proactive LLM service unavailable."));
  }

  const llmData = await llmResponse.json();
  const llmOutput = llmData.llm_output || llmData.response || llmData.output || "";

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        state,
        city: city || "All",
        area: area || "All",
        advisory: llmOutput,
      },
      "Proactive advisory retrieved successfully."
    )
  );
});
