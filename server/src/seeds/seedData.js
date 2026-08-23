import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Report } from "../models/Report.js";
import { Advisory } from "../models/Advisory.js";
import { ProactiveAlert } from "../models/ProactiveAlert.js";

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bharat_swasthya_ai";
    await mongoose.connect(mongoUri);
    console.log("🌱 Connected to MongoDB for seeding...");

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Report.deleteMany({}),
      Advisory.deleteMany({}),
      ProactiveAlert.deleteMany({}),
    ]);
    console.log("🧹 Cleared existing database records.");

    // 1. Create Users for all 4 Roles
    console.log("👤 Creating seed users...");

    const admin = await User.create({
      name: "National Health Director (Admin)",
      email: "admin@bharatswasthya.gov.in",
      password: "password123",
      role: "admin",
      state: "All",
      district: "All",
      city: "New Delhi",
      phone: "+91 11 2306 1823",
      qualification: "IAS / Public Health Policy",
      hospitalOrClinic: "Ministry of Health & Family Welfare",
      isEmailVerified: true,
    });

    const doctor1 = await User.create({
      name: "Dr. Rajesh Sharma, MD",
      email: "doctor@bharatswasthya.gov.in",
      password: "password123",
      role: "doctor",
      state: "Maharashtra",
      district: "Pune",
      city: "Shivajinagar",
      phone: "+91 98230 45678",
      qualification: "MD Internal Medicine, DNB Epidemiology",
      hospitalOrClinic: "Sassoon General Hospital & Medical College",
      createdBy: admin._id,
      isEmailVerified: true,
    });

    const doctor2 = await User.create({
      name: "Dr. Sunita Patel, MBBS, MD",
      email: "dr.patel@bharatswasthya.gov.in",
      password: "password123",
      role: "doctor",
      state: "Gujarat",
      district: "Ahmedabad",
      city: "Satellite",
      phone: "+91 98790 12345",
      qualification: "MD Infectious Diseases",
      hospitalOrClinic: "Civil Hospital Ahmedabad",
      createdBy: admin._id,
      isEmailVerified: true,
    });

    const healthAssistant1 = await User.create({
      name: "Anita Deshmukh (ASHA / Field Worker)",
      email: "assistant@bharatswasthya.gov.in",
      password: "password123",
      role: "health_assistant",
      state: "Maharashtra",
      district: "Pune",
      city: "Hadapsar",
      phone: "+91 98221 98765",
      qualification: "Auxiliary Nurse Midwife (ANM / ASHA Lead)",
      hospitalOrClinic: "Hadapsar Primary Health Centre (PHC)",
      createdBy: doctor1._id,
      isEmailVerified: true,
    });

    const healthAssistant2 = await User.create({
      name: "Ramesh Pawar (Health Inspector)",
      email: "ramesh.ha@bharatswasthya.gov.in",
      password: "password123",
      role: "health_assistant",
      state: "Maharashtra",
      district: "Mumbai Suburban",
      city: "Andheri",
      phone: "+91 98200 11223",
      qualification: "Certified Sanitary Inspector",
      hospitalOrClinic: "BMC Ward Health Post K-East",
      createdBy: doctor1._id,
      isEmailVerified: true,
    });

    const citizenUser = await User.create({
      name: "Rohan Kulkarni (Citizen)",
      email: "user@bharatswasthya.gov.in",
      password: "password123",
      role: "user",
      state: "Maharashtra",
      district: "Pune",
      city: "Kothrud",
      phone: "+91 97654 32100",
      isEmailVerified: true,
    });

    console.log("✅ Created 6 seed user accounts across all 4 roles.");

    // 2. Create Disease Reports (Grassroots Field Reports + Labeled Cases)
    console.log("📋 Seeding realistic Indian medical field reports...");

    const reportsData = [
      {
        title: "Cluster of High Febrile Illness with Severe Joint Pain in Ward 14",
        description: "Encountered 6 household members with sudden onset 103°F fever, severe behind-eye pain, petechial rashes on forearms, and platelet counts dropping below 85,000/μL. Stagnant rainwater collected in open construction barrels nearby.",
        symptoms: ["High Fever", "Retro-orbital Pain", "Severe Joint Pain", "Forearm Rash", "Thrombocytopenia"],
        suspectedDisease: "Dengue Fever",
        confirmedDisease: "Dengue Fever (DENV-2 Strain)",
        isViral: true,
        severity: "high",
        patientCount: 6,
        image: null,
        state: "Maharashtra",
        district: "Pune",
        city: "Hadapsar",
        reporter: healthAssistant1._id,
        reporterRole: "health_assistant",
        status: "verified_labeled",
        doctorDiagnosis: "Confirmed Dengue Viral Hemorrhagic Suspect via NS1 Antigen test.",
        doctorRemarks: "Urgent vector control larvicide spray dispatched to Ward 14. Daily platelet monitoring initiated.",
        prescribedAction: "Hydration with ORS, Paracetamol 650mg SOS. Strictly avoid Ibuprofen/Aspirin.",
        isPublicAlert: true,
        labeledBy: doctor1._id,
        labeledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Pediatric Upper Respiratory Cough & Wheezing Spike",
        description: "Examined 12 children aged 3-10 presenting with harsh barking cough, low-grade fever, rhinorrhea, and audible wheezing. Rapid throat swabs negative for strep.",
        symptoms: ["Barking Cough", "Sore Throat", "Fever 101°F", "Runny Nose", "Wheezing"],
        suspectedDisease: "Viral Influenza / RSV",
        confirmedDisease: "Influenza A (H3N2 Subtype)",
        isViral: true,
        severity: "moderate",
        patientCount: 12,
        image: null,
        state: "Maharashtra",
        district: "Pune",
        city: "Shivajinagar",
        reporter: doctor1._id,
        reporterRole: "doctor",
        status: "verified_labeled",
        doctorDiagnosis: "Seasonal H3N2 Influenza post-monsoon wave.",
        doctorRemarks: "Common in school clusters. Advised 5-day home isolation.",
        prescribedAction: "Steam inhalation, saline nasal drops, symptomatic antipyretics.",
        isPublicAlert: true,
        labeledBy: doctor1._id,
        labeledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Water Contamination & Acute Watery Diarrhea Outbreak in Slum Pocket",
        description: "15 individuals from 4 adjacent tenements reported violent watery loose motions and vomiting within 24 hours. Municipal water pipeline observed leaking near drainage canal.",
        symptoms: ["Watery Diarrhea", "Vomiting", "Severe Dehydration", "Abdominal Cramps", "Hypotension"],
        suspectedDisease: "Acute Gastroenteritis / Suspected Cholera",
        confirmedDisease: "Acute Bacterial Gastroenteritis (E. Coli / Vibrio suspect)",
        isViral: false,
        severity: "critical",
        patientCount: 15,
        image: null,
        state: "Maharashtra",
        district: "Mumbai Suburban",
        city: "Andheri",
        reporter: healthAssistant2._id,
        reporterRole: "health_assistant",
        status: "verified_labeled",
        doctorDiagnosis: "Water-borne acute diarrheal disease with moderate to severe dehydration.",
        doctorRemarks: "Notified BMC water department for immediate super-chlorination of community tanks.",
        prescribedAction: "IV Ringer Lactate for 3 severe cases, oral ORS + Zinc supplementation for others.",
        isPublicAlert: true,
        labeledBy: doctor1._id,
        labeledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        title: "High Febrile Illness with Chills and Rigors in Rural Sector",
        description: "3 farm workers presented with intermittent high fevers occurring every alternate day, accompanied by intense shivering, rigors, and profuse night sweating.",
        symptoms: ["Intermittent High Fever", "Severe Chills & Shivering", "Profuse Sweating", "Headache"],
        suspectedDisease: "Malaria",
        confirmedDisease: "",
        isViral: false,
        severity: "moderate",
        patientCount: 3,
        image: null,
        state: "Maharashtra",
        district: "Pune",
        city: "Baramati",
        reporter: healthAssistant1._id,
        reporterRole: "health_assistant",
        status: "pending_review",
      },
      {
        title: "Sudden Erythematous Rash and Polyarthritis in Elderly Patients",
        description: "4 senior citizens suffering from excruciating ankle and wrist joint pains, incapacitating movement. Red macular rash spread across trunk.",
        symptoms: ["Incapacitating Joint Pain", "Macular Trunk Rash", "Fever 102°F", "Headache"],
        suspectedDisease: "Chikungunya Fever",
        confirmedDisease: "Chikungunya Viral Infection",
        isViral: true,
        severity: "high",
        patientCount: 4,
        image: null,
        state: "Gujarat",
        district: "Ahmedabad",
        city: "Satellite",
        reporter: doctor2._id,
        reporterRole: "doctor",
        status: "verified_labeled",
        doctorDiagnosis: "Serologically confirmed Chikungunya virus IgM positive.",
        doctorRemarks: "Supportive physiotherapy and pain management recommended.",
        prescribedAction: "Rest, Paracetamol, non-steroidal topical gels, gentle joint mobilizations.",
        isPublicAlert: true,
        labeledBy: doctor2._id,
        labeledAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Stepladder Fever with Rose Spots and Bradycardia",
        description: "2 college students presenting with 8-day escalating evening fevers, coated tongue, mild hepatosplenomegaly, and abdominal tenderness.",
        symptoms: ["Step-ladder Fever", "Coated White Tongue", "Abdominal Pain", "Lethargy", "Loss of Appetite"],
        suspectedDisease: "Enteric Fever (Typhoid)",
        confirmedDisease: "Enteric Fever (Salmonella Typhi)",
        isViral: false,
        severity: "moderate",
        patientCount: 2,
        image: null,
        state: "Maharashtra",
        district: "Pune",
        city: "Kothrud",
        reporter: healthAssistant1._id,
        reporterRole: "health_assistant",
        status: "verified_labeled",
        doctorDiagnosis: "Widal & Blood Culture positive for Salmonella enterica serotype Typhi.",
        doctorRemarks: "Advised boiled food and strict hand hygiene.",
        prescribedAction: "Oral Azithromycin / Cefixime course under physician supervision.",
        isPublicAlert: false,
        labeledBy: doctor1._id,
        labeledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];

    await Report.insertMany(reportsData);
    console.log(`✅ Seeded ${reportsData.length} comprehensive medical reports.`);

    // 3. Create Doctor Health Advisories & Regional Bulletins
    console.log("📢 Seeding doctor regional health advisories...");

    const advisoriesData = [
      {
        title: "Vector-Borne Disease Surge Alert: Dengue & Chikungunya Protocol",
        message: "All Primary Health Centers and ASHA workers across Pune District are directed to intensify door-to-door larval surveys. Ensure distribution of Abate larvicide and inspect overhead water tanks every Friday ('Dry Day'). Direct all febrile cases with platelet count <100k to Sassoon Hospital triage.",
        diseaseCategory: "Vector-Borne (Viral)",
        priority: "urgent",
        targetState: "Maharashtra",
        targetDistrict: "Pune",
        targetCity: "All",
        doctor: doctor1._id,
        isActive: true,
      },
      {
        title: "Monsoon Safe Drinking Water Advisory & Chlorine Tablet Distribution",
        message: "Due to localized water pipe damage near suburban railway transit zones, all health workers must conduct spot testing for free residual chlorine (>0.5 ppm). Distribute Halazone chlorine tablets and demonstrate 1-packet-per-liter ORS preparation in community centers.",
        diseaseCategory: "Water-Borne Illness",
        priority: "critical",
        targetState: "Maharashtra",
        targetDistrict: "Mumbai Suburban",
        targetCity: "Andheri",
        doctor: doctor1._id,
        isActive: true,
      },
      {
        title: "Seasonal Respiratory Viral Surveillance & Flu Vaccination Push",
        message: "Elevated H3N2 influenza cases noted in civic schools. Please educate parents on respiratory etiquette, warm saline gargling, and encourage high-risk geriatric patients to receive the annual quadrivalent flu vaccine.",
        diseaseCategory: "Respiratory Viral",
        priority: "warning",
        targetState: "Gujarat",
        targetDistrict: "Ahmedabad",
        targetCity: "All",
        doctor: doctor2._id,
        isActive: true,
      },
    ];

    await Advisory.insertMany(advisoriesData);
    console.log(`✅ Seeded ${advisoriesData.length} doctor health advisories.`);

    // 4. Create Proactive AI Outbreak Forecasts
    console.log("🧠 Seeding proactive AI outbreak alerts...");

    const proactiveAlertsData = [
      {
        diseaseName: "Dengue Viral Fever (DENV-2)",
        isViral: true,
        riskLevel: "high",
        state: "Maharashtra",
        district: "Pune",
        city: "All",
        summary: "High vector transmission probability in Pune metropolitan due to sustained 82% relative humidity and intermittent rainfall patterns fostering Aedes mosquito breeding.",
        symptomsToWatch: [
          "Sudden high fever (103°F - 104°F)",
          "Intense headache & retro-orbital (behind eye) pain",
          "Severe bone, joint & muscle pain ('Breakbone fever')",
          "Mild bleeding manifestations (nose/gums) or petechiae",
          "Persistent vomiting and severe abdominal pain",
        ],
        recommendedPrecautions: [
          "Inspect coolers, flowerpots, and AC drain trays every 3 days; empty stagnant water.",
          "Use DEET or Odomos repellents, especially during dawn and dusk feeding hours.",
          "Sleep inside mosquito nets; install window mesh screens.",
          "Undergo immediate CBC / Platelet check if fever lasts longer than 48 hours.",
          "Avoid taking Aspirin or Brufen; consult a doctor for Paracetamol dosing.",
        ],
        weatherFactors: {
          temperature: "29°C",
          humidity: "82%",
          rainfallRisk: "Moderate to Heavy Showers",
          airQualityIndex: "Moderate (AQI 98)",
          season: "Monsoon",
        },
        aiInsights: "Correlated 12 field reports of sudden febrile illness with satellite humidity telemetry (82%), projecting a 42% rise in Aedes vector density over the next 10 days.",
        sourceDataCount: { reportsAnalyzed: 18, advisoriesAnalyzed: 4 },
        generatedBy: "gemini_ai",
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        diseaseName: "Viral Respiratory Influenza (H3N2 / Seasonal Flu)",
        isViral: true,
        riskLevel: "moderate",
        state: "Maharashtra",
        district: "Mumbai Suburban",
        city: "All",
        summary: "Clustering of viral upper respiratory tract infections projected across coastal urban belts due to temperature fluctuations and high commuter density.",
        symptomsToWatch: [
          "Dry cough and scratchy sore throat",
          "Fever with chills (100°F - 102°F)",
          "Nasal congestion, rhinorrhea, and sneezing",
          "Fatigue and generalized muscle soreness",
        ],
        recommendedPrecautions: [
          "Wear a protective mask in crowded local trains, buses, and public markets.",
          "Wash hands frequently with soap or carry an alcohol-based sanitizer.",
          "Gargle with warm salt water twice daily at initial sign of throat irritation.",
          "Stay home and isolate during the fever period to avoid spreading to peers.",
        ],
        weatherFactors: {
          temperature: "31°C",
          humidity: "86%",
          rainfallRisk: "Intermittent Drizzle",
          airQualityIndex: "Satisfactory (AQI 82)",
          season: "Monsoon",
        },
        aiInsights: "Aggregated syndromic pediatric cough records and meteorological barometric pressure shifts indicating seasonal airborne transmission window.",
        sourceDataCount: { reportsAnalyzed: 14, advisoriesAnalyzed: 3 },
        generatedBy: "gemini_ai",
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        diseaseName: "Acute Gastroenteritis & Food/Water-Borne Illness",
        isViral: false,
        riskLevel: "high",
        state: "Maharashtra",
        district: "Mumbai Suburban",
        city: "Andheri",
        summary: "Critical water contamination warning for low-lying sectors following drainage overflows. Risk of acute diarrheal disease and food poisoning.",
        symptomsToWatch: [
          "Frequent watery stools (>3 times/day)",
          "Repeated nausea and vomiting",
          "Abdominal cramping and spasms",
          "Signs of dehydration: extreme thirst, dry tongue, low urine output",
        ],
        recommendedPrecautions: [
          "Boil all drinking water vigorously for at least 1 minute before consumption.",
          "Consume Oral Rehydration Solution (ORS) immediately at onset of diarrhea.",
          "Avoid street-side cut fruits, unpasteurized juices, and raw ice.",
          "Seek emergency care at hospital if unable to retain fluids or passing blood in stool.",
        ],
        weatherFactors: {
          temperature: "30°C",
          humidity: "88%",
          rainfallRisk: "Heavy Inundation & Waterlogging",
          airQualityIndex: "Good (AQI 45)",
          season: "Monsoon",
        },
        aiInsights: "Correlated water pipeline turbidity alerts with 15 acute diarrheal admissions across K-East municipal ward.",
        sourceDataCount: { reportsAnalyzed: 16, advisoriesAnalyzed: 2 },
        generatedBy: "gemini_ai",
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        diseaseName: "Chikungunya Arthritic Viral Infection",
        isViral: true,
        riskLevel: "moderate",
        state: "Gujarat",
        district: "Ahmedabad",
        city: "All",
        summary: "Active surveillance for daytime Aedes mosquito bites causing sudden polyarthritis and febrile episodes across western districts.",
        symptomsToWatch: [
          "Excruciating, debilitating joint pain (especially hands, wrists, ankles)",
          "Sudden onset high fever",
          "Skin rashes across chest and limbs",
          "Morning stiffness and periarticular swelling",
        ],
        recommendedPrecautions: [
          "Apply repellent creams on exposed limbs during daylight hours.",
          "Participate in neighborhood fumigation and elimination of water containers.",
          "Gentle warm compresses on inflamed joints; avoid strenuous physical exertion.",
          "Consult an authorized physician for supervised pain management.",
        ],
        weatherFactors: {
          temperature: "34°C",
          humidity: "65%",
          rainfallRisk: "Isolated Showers",
          airQualityIndex: "Moderate (AQI 110)",
          season: "Post-Monsoon",
        },
        aiInsights: "AI model matched 4 confirmed Chikungunya IgM positive reports from Ahmedabad civil hospital with warm daytime thermal indices.",
        sourceDataCount: { reportsAnalyzed: 8, advisoriesAnalyzed: 2 },
        generatedBy: "gemini_ai",
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ];

    await ProactiveAlert.insertMany(proactiveAlertsData);
    console.log(`✅ Seeded ${proactiveAlertsData.length} proactive AI disease outbreak forecasts.`);

    console.log(`
============================================================
🎉 BHARAT SWASTHYA AI - SEED DATA POPULATED SUCCESSFULLY!
============================================================
🔑 DEMO LOGIN CREDENTIALS:
------------------------------------------------------------
1. ADMIN:
   Email:    admin@bharatswasthya.gov.in
   Password: password123

2. DOCTOR (Maharashtra):
   Email:    doctor@bharatswasthya.gov.in
   Password: password123

3. HEALTH ASSISTANT (Pune):
   Email:    assistant@bharatswasthya.gov.in
   Password: password123

4. CITIZEN USER:
   Email:    user@bharatswasthya.gov.in
   Password: password123
============================================================
    `);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
