/**
 * Bharat Swasthya AI - Automated Integration Test Suite
 * Tests Viral Diseases API, Proactive Alerts API, Details Modals Data, and Pan-India Locations
 */

import http from "http";

const BASE_URL = "http://127.0.0.1:5000/api/v1";

const makeRequest = (path, method = "GET", body = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log("🧪 ============================================================");
  console.log("🧪 RUNNING BHARAT SWASTHYA AI API & DETAILS TEST SUITE");
  console.log("🧪 ============================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  };

  try {
    // TEST 1: Pan-India Locations API
    console.log("--- 1. Testing Pan-India Locations API ---");
    const locRes = await makeRequest("/public/locations");
    assert(locRes.status === 200, "Locations endpoint returns 200 OK");
    const locs = locRes.data?.data?.locations;
    assert(locs && typeof locs === "object", "Locations object returned");
    const stateCount = Object.keys(locs || {}).length;
    assert(stateCount >= 28, `Returns comprehensive Pan-India states (Found: ${stateCount} states/UTs)`);
    assert(locs["Maharashtra"]?.districts?.includes("Pune"), "Maharashtra includes Pune district");
    assert(locs["Delhi"]?.districts?.includes("Central Delhi"), "Delhi includes Central Delhi");
    assert(locs["Tamil Nadu"]?.districts?.includes("Chennai"), "Tamil Nadu includes Chennai");

    // TEST 2: Viral Diseases Endpoint
    console.log("\n--- 2. Testing Viral Diseases Surveillance & Details API ---");
    const viralRes = await makeRequest("/public/viral-diseases?state=Maharashtra&district=Pune");
    assert(viralRes.status === 200, "Viral diseases endpoint returns 200 OK");
    const viralData = viralRes.data?.data?.data || [];
    assert(Array.isArray(viralData), "Viral diseases data is an array");
    console.log(`ℹ️  Found ${viralData.length} viral disease strains in Pune, Maharashtra`);

    if (viralData.length > 0) {
      const firstDisease = viralData[0];
      assert(Boolean(firstDisease.diseaseName), `Disease name present: "${firstDisease.diseaseName}"`);
      assert(typeof firstDisease.totalCases === "number", `Total cases counted: ${firstDisease.totalCases}`);
      assert(Array.isArray(firstDisease.symptoms), "Symptoms array populated");
      assert(firstDisease.symptoms.length > 0, `Symptoms listed: [${firstDisease.symptoms.slice(0, 3).join(", ")}]`);
      assert(Boolean(firstDisease.transmissionType), `Transmission type: ${firstDisease.transmissionType}`);
      assert(Boolean(firstDisease.clinicalProtocol), "Clinical protocol guidance attached");
      assert(Array.isArray(firstDisease.dangerSigns), "Emergency danger signs attached");
      assert(Array.isArray(firstDisease.recommendedPrecautions), "Recommended precautions attached");
    }

    // TEST 3: Viral Disease In-depth Details API
    console.log("\n--- 3. Testing Specific Viral Disease Deep Dive Endpoint ---");
    const detailRes = await makeRequest("/public/viral-diseases/details?diseaseName=Dengue&state=Maharashtra&district=Pune");
    assert(detailRes.status === 200, "Viral disease details endpoint returns 200 OK");
    const detailData = detailRes.data?.data;
    assert(detailData && detailData.diseaseName === "Dengue", "Correct disease name returned");
    assert(typeof detailData.totalCases === "number", `Calculated total cases for Dengue: ${detailData.totalCases}`);
    assert(Boolean(detailData.clinicalProfile?.transmissionType), "Detailed clinical profile present");

    // TEST 4: Proactive Outbreak Forecasts API
    console.log("\n--- 4. Testing Proactive AI Outbreak Forecasts API ---");
    const proactiveRes = await makeRequest("/public/proactive-alerts?state=Maharashtra&district=Pune");
    assert(proactiveRes.status === 200, "Proactive alerts endpoint returns 200 OK");
    const alerts = proactiveRes.data?.data?.alerts || [];
    assert(Array.isArray(alerts), "Proactive alerts returned as array");
    console.log(`ℹ️  Found ${alerts.length} proactive AI outbreak forecasts`);

    if (alerts.length > 0) {
      const firstAlert = alerts[0];
      assert(Boolean(firstAlert.diseaseName), `Alert disease name: "${firstAlert.diseaseName}"`);
      assert(["low", "moderate", "high", "severe"].includes(firstAlert.riskLevel), `Risk level valid: ${firstAlert.riskLevel}`);
      assert(Boolean(firstAlert.weatherFactors?.temperature), `Weather temperature: ${firstAlert.weatherFactors?.temperature}`);
      assert(Boolean(firstAlert.weatherFactors?.humidity), `Weather humidity: ${firstAlert.weatherFactors?.humidity}`);
      assert(Array.isArray(firstAlert.symptomsToWatch), "Symptoms to watch list present");
      assert(Array.isArray(firstAlert.recommendedPrecautions), "Precautions checklist present");

      // Test Single Proactive Alert by ID
      console.log("\n--- 5. Testing Proactive Alert by ID Endpoint ---");
      const singleAlertRes = await makeRequest(`/public/proactive-alerts/${firstAlert._id}`);
      assert(singleAlertRes.status === 200, "Single proactive alert by ID returns 200 OK");
      assert(singleAlertRes.data?.data?.alert?.diseaseName === firstAlert.diseaseName, "Fetched exact matching alert");
    }

    // TEST 5: Helplines & Overview Stats
    console.log("\n--- 6. Testing Public Platform Helplines & Overview Stats ---");
    const helplineRes = await makeRequest("/public/helplines");
    assert(helplineRes.status === 200, "Helplines endpoint returns 200 OK");
    assert(helplineRes.data?.data?.helplines?.length >= 5, "Helpline directory contains all national hotlines");

    const statsRes = await makeRequest("/public/overview-stats");
    assert(statsRes.status === 200, "Overview stats returns 200 OK");
    assert(typeof statsRes.data?.data?.totalMonitoredCases === "number", "Total monitored cases calculated");

    console.log("\n============================================================");
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("============================================================\n");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("❌ Test runner error:", err.message);
    process.exit(1);
  }
}

runTests();
