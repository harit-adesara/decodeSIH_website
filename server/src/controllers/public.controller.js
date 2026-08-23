import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Report } from "../models/Report.js";
import { ProactiveAlert } from "../models/ProactiveAlert.js";
import { triageUserSymptomQuery } from "../services/gemini.service.js";

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

  // Aggregate viral disease statistics
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
        isViral: true,
      },
    },
    { $sort: { totalCases: -1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        count: viralDiseases.length,
        filter: { state: state || "All", district: district || "All", city: city || "All" },
        data: viralDiseases,
      },
      "Active viral disease data retrieved successfully."
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
  const locationHierarchy = {
    Maharashtra: {
      districts: ["Pune", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nashik", "Thane", "Aurangabad", "Kolhapur", "Solapur", "Amravati"],
      cities: {
        Pune: ["Shivajinagar", "Kothrud", "Hadapsar", "Hinjawadi", "Pimpri", "Chinchwad", "Baramati", "Shirur"],
        "Mumbai City": ["Colaba", "Dadar", "Byculla", "Parel", "Worli", "Fort"],
        "Mumbai Suburban": ["Andheri", "Bandra", "Borivali", "Goregaon", "Kurla"],
        Nagpur: ["Sitabuldi", "Dharampeth", "Ramdaspeth", "Manewada", "Kamptee"],
        Nashik: ["Panchavati", "CIDCO", "Satpur", "Indira Nagar", "Deolali"],
        Thane: ["Naupada", "Ghodbunder", "Kalyan", "Dombivli", "Bhiwandi"],
      },
    },
    Delhi: {
      districts: ["Central Delhi", "New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
      cities: {
        "Central Delhi": ["Karol Bagh", "Pahar Ganj", "Rajinder Nagar", "Daryaganj"],
        "New Delhi": ["Connaught Place", "Chanakyapuri", "Lodhi Colony", "Vasant Vihar"],
        "North Delhi": ["Civil Lines", "Model Town", "Narela", "Burari"],
        "South Delhi": ["Saket", "Hauz Khas", "Greater Kailash", "Mehrauli"],
      },
    },
    "Uttar Pradesh": {
      districts: ["Lucknow", "Varanasi", "Kanpur Nagar", "Agra", "Prayagraj", "Gautam Buddha Nagar", "Ghaziabad", "Gorakhpur"],
      cities: {
        Lucknow: ["Hazratganj", "Gomti Nagar", "Alambagh", "Indira Nagar", "Charbagh"],
        Varanasi: ["Lanka", "Sigra", "Godowlia", "Bhelupur", "Shivpur"],
        "Kanpur Nagar": ["Civil Lines", "Kakadeo", "Kidwai Nagar", "Govind Nagar"],
        "Gautam Buddha Nagar": ["Noida Sector 18", "Noida Sector 62", "Greater Noida Alpha", "Dadri"],
      },
    },
    Karnataka: {
      districts: ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi"],
      cities: {
        "Bengaluru Urban": ["Indiranagar", "Koramangala", "Whitefield", "Jayanagar", "Hebbal", "Electronic City"],
        Mysuru: ["Gokulam", "Jayalakshmipuram", "Kuvempunagar", "Vijayanagar"],
        Mangaluru: ["Kadri", "Kankanady", "Urwa", "Bejai", "Surathkal"],
      },
    },
    Kerala: {
      districts: ["Thiruvananthapuram", "Ernakulam", "Kozhikode", "Thrissur", "Malappuram", "Kottayam"],
      cities: {
        Thiruvananthapuram: ["Pattom", "Palayam", "Kowdiar", "Kazhakoottam"],
        Ernakulam: ["Kochi", "Edappally", "Kaloor", "Aluva", "Fort Kochi"],
        Kozhikode: ["Mananchira", "Mavoor", "Chevayur", "Kallai"],
      },
    },
    Gujarat: {
      districts: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Gandhinagar"],
      cities: {
        Ahmedabad: ["Navrangpura", "Satellite", "Maninagar", "Vastrapur", "Bopal"],
        Surat: ["Adajan", "Athwa", "Varachha", "Katargam", "Rander"],
        Vadodara: ["Alkapuri", "Fatehgunj", "Akota", "Manjalpur"],
      },
    },
  };

  return res.status(200).json(
    new ApiResponse(200, { locations: locationHierarchy }, "Locations metadata retrieved.")
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
        activeSurveillanceStates: 6,
      },
      "Public overview statistics retrieved."
    )
  );
});
