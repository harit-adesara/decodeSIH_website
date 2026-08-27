import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Report } from "../models/Report.js";
import { Advisory } from "../models/Advisory.js";
import { ProactiveAlert } from "../models/ProactiveAlert.js";

const PROACTIVE_LLM_URL =
  process.env.PROACTIVE_LLM_URL || "https://proactivellm.onrender.com/api/v1/proactive-advisory";

/**
 * Runs proactive outbreak analysis.
 * If state/city/area provided in body → single LLM call.
 * If not → extracts distinct states from reports and calls LLM per state.
 */
export const runProactiveOutbreakAnalysis = async ({ state, city, area } = {}) => {
  console.log("[PROACTIVE ENGINE] Fetching reports and advisories...");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const reports = await Report.find({ createdAt: { $gte: thirtyDaysAgo } }).lean();
  const advisories = await Advisory.find({ isActive: true }).lean();

  // If state provided → single targeted call
  if (state) {
    const locations = [{ state, city: city || "All", area: area || "All" }];
    return await processLocations(locations, reports, advisories);
  }

  // Otherwise → extract distinct states from reports
  const distinctStates = [...new Set(reports.map((r) => r.state).filter(Boolean))];
  if (distinctStates.length === 0) {
    distinctStates.push("Maharashtra", "Delhi", "Uttar Pradesh", "Karnataka");
  }

  const locations = distinctStates.map((s) => ({ state: s, city: "All", area: "All" }));
  return await processLocations(locations, reports, advisories);
};

/**
 * Process a list of { state, city, area } → call LLM for each → upsert ProactiveAlert
 */
const processLocations = async (locations, reports, advisories) => {
  const generatedAlerts = [];

  for (const { state, city, area } of locations) {
    try {
      const llmResponse = await fetch(PROACTIVE_LLM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, city, area }),
        signal: AbortSignal.timeout(60000),
      });

      if (!llmResponse.ok) {
        console.warn(`LLM API returned ${llmResponse.status} for: ${state}, ${city}, ${area}`);
        continue;
      }

      const llmData = await llmResponse.json();
      const llmOutput = (llmData.llm_output || llmData.response || llmData.output || "").replace(/\*\*/g, "");

      if (!llmOutput) {
        console.warn(`Empty LLM output for: ${state}, ${city}, ${area}`);
        continue;
      }

      // Build unique identifier for this location
      const diseaseName = city !== "All"
        ? `Outbreak Advisory - ${city}, ${state}`
        : `Outbreak Advisory - ${state}`;

      const existingAlert = await ProactiveAlert.findOne({
        diseaseName,
        state,
      });

      if (existingAlert) {
        existingAlert.summary = llmOutput;
        existingAlert.aiInsights = llmOutput;
        existingAlert.city = city;
        existingAlert.validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        existingAlert.isActive = true;
        existingAlert.sourceDataCount = {
          reportsAnalyzed: reports.filter((r) => r.state === state).length,
          advisoriesAnalyzed: advisories.filter((a) => a.targetState === state || a.targetState === "All").length,
        };
        await existingAlert.save();
        generatedAlerts.push(existingAlert);
      } else {
        const newAlert = await ProactiveAlert.create({
          diseaseName,
          isViral: true,
          riskLevel: "moderate",
          state,
          district: "All",
          city,
          summary: llmOutput,
          symptomsToWatch: [],
          recommendedPrecautions: [],
          aiInsights: llmOutput,
          sourceDataCount: {
            reportsAnalyzed: reports.filter((r) => r.state === state).length,
            advisoriesAnalyzed: advisories.filter((a) => a.targetState === state || a.targetState === "All").length,
          },
          generatedBy: "external_llm",
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        });
        generatedAlerts.push(newAlert);
      }
    } catch (err) {
      console.warn(`Failed to process ${state}, ${city}, ${area}:`, err.message);
    }
  }

  return generatedAlerts;
};

/**
 * @desc    Admin manually triggers proactive analysis
 * @route   POST /api/v1/admin/trigger-proactive-analysis
 * @access  Private (Admin only)
 * @body    { state?, city?, area? } — optional, falls back to report-based discovery
 */
export const triggerProactiveAnalysis = asyncHandler(async (req, res) => {
  const { state, city, area } = req.body || {};
  const alerts = await runProactiveOutbreakAnalysis({ state, city, area });
  return res.status(200).json(
    new ApiResponse(
      200,
      { count: alerts.length, alerts },
      "Proactive AI outbreak analysis executed successfully."
    )
  );
});
