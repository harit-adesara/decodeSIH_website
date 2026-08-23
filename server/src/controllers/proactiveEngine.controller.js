import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Report } from "../models/Report.js";
import { Advisory } from "../models/Advisory.js";
import { ProactiveAlert } from "../models/ProactiveAlert.js";
import { analyzeProactiveOutbreaks } from "../services/gemini.service.js";

/**
 * Runs proactive outbreak analysis across active states and districts.
 * Aggregates all reports & advisories + simulated/real weather indices,
 * feeds into Gemini AI (or built-in rule engine) and saves ProactiveAlert models.
 */
export const runProactiveOutbreakAnalysis = async () => {
  console.log("🔍 [PROACTIVE ENGINE] Aggregating doctor & health assistant reports with weather indicators...");

  // Fetch recent reports from the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const reports = await Report.find({ createdAt: { $gte: thirtyDaysAgo } }).lean();
  const advisories = await Advisory.find({ isActive: true }).lean();

  // Distinct states in the dataset
  const distinctStates = [...new Set(reports.map((r) => r.state).filter(Boolean))];
  if (distinctStates.length === 0) {
    distinctStates.push("Maharashtra", "Delhi", "Uttar Pradesh", "Karnataka");
  }

  const generatedAlerts = [];

  for (const state of distinctStates) {
    const stateReports = reports.filter((r) => r.state === state);
    const stateAdvisories = advisories.filter((a) => a.targetState === state || a.targetState === "All");

    const weatherData = {
      state,
      temperature: "31°C",
      humidity: "79%",
      monsoonCondition: "Active South-West Monsoon",
      rainfallRisk: "Moderate to Heavy Inundation",
      season: "Monsoon",
    };

    const aiAlerts = await analyzeProactiveOutbreaks({
      reports: stateReports,
      advisories: stateAdvisories,
      weatherData,
      state,
      district: "All",
    });

    for (const alertData of aiAlerts) {
      // Upsert proactive alert in database
      const existingAlert = await ProactiveAlert.findOne({
        diseaseName: alertData.diseaseName,
        state: alertData.state,
      });

      if (existingAlert) {
        existingAlert.riskLevel = alertData.riskLevel;
        existingAlert.isViral = alertData.isViral;
        existingAlert.summary = alertData.summary;
        existingAlert.symptomsToWatch = alertData.symptomsToWatch;
        existingAlert.recommendedPrecautions = alertData.recommendedPrecautions;
        existingAlert.aiInsights = alertData.aiInsights;
        existingAlert.weatherFactors = alertData.weatherFactors || weatherData;
        existingAlert.validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        existingAlert.isActive = true;
        await existingAlert.save();
        generatedAlerts.push(existingAlert);
      } else {
        const newAlert = await ProactiveAlert.create({
          ...alertData,
          weatherFactors: alertData.weatherFactors || weatherData,
          sourceDataCount: {
            reportsAnalyzed: stateReports.length,
            advisoriesAnalyzed: stateAdvisories.length,
          },
          generatedBy: process.env.GEMINI_API_KEY ? "gemini_ai" : "rule_engine",
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        });
        generatedAlerts.push(newAlert);
      }
    }
  }

  return generatedAlerts;
};

/**
 * @desc    Admin or Cron manually triggers proactive analysis
 * @route   POST /api/v1/admin/trigger-proactive-analysis
 * @access  Private (Admin only)
 */
export const triggerProactiveAnalysis = asyncHandler(async (req, res) => {
  const alerts = await runProactiveOutbreakAnalysis();
  return res.status(200).json(
    new ApiResponse(
      200,
      { count: alerts.length, alerts },
      "Proactive AI outbreak analysis executed successfully."
    )
  );
});
