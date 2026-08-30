import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import app from "../src/app.js";
import { User } from "../src/models/User.js";

const runTests = async () => {
  await connectDB();

  const server = app.listen(5099, async () => {
    console.log("🧪 Test server running on port 5099");
    try {
      const baseUrl = "http://localhost:5099";

      // 1. Test Public Hospital Beds API
      console.log("\n1. Testing GET /api/v1/public/hospital-beds...");
      const publicRes = await fetch(`${baseUrl}/api/v1/public/hospital-beds?state=Maharashtra&district=Pune`);
      const publicData = await publicRes.json();
      console.log("Status:", publicRes.status);
      console.log("Summary:", publicData.data?.summary);
      console.log("Hospitals count:", publicData.data?.hospitals?.length);
      console.log("Sample hospital wards count:", publicData.data?.hospitals?.[0]?.wards?.length);
      if (publicRes.status !== 200 || !publicData.data?.summary) {
        throw new Error("Public hospital beds API failed");
      }

      // 2. Test Hospital Login
      console.log("\n2. Testing Hospital Login...");
      const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "hospital@bharatswasthya.gov.in",
          password: "password123",
        }),
      });
      const loginData = await loginRes.json();
      console.log("Status:", loginRes.status);
      console.log("Role:", loginData.data?.user?.role);
      const hospitalToken = loginData.data?.token;
      if (loginRes.status !== 200 || loginData.data?.user?.role !== "hospital") {
        throw new Error("Hospital login failed");
      }

      // 3. Test Hospital Stats API
      console.log("\n3. Testing GET /api/v1/hospital/stats...");
      const statsRes = await fetch(`${baseUrl}/api/v1/hospital/stats`, {
        headers: { Authorization: `Bearer ${hospitalToken}` },
      });
      const statsData = await statsRes.json();
      console.log("Status:", statsRes.status);
      console.log("Stats:", statsData.data);
      if (statsRes.status !== 200 || statsData.data?.totalWards === undefined) {
        throw new Error("Hospital stats API failed");
      }

      // 4. Test Hospital Create Ward (with 'Other' and customWardName)
      console.log("\n4. Testing POST /api/v1/hospital/wards (Custom Ward)...");
      const createWardRes = await fetch(`${baseUrl}/api/v1/hospital/wards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hospitalToken}`,
        },
        body: JSON.stringify({
          wardType: "Other",
          customWardName: "Automated Test Daycare Ward",
          totalBeds: 10,
          vacantBeds: 4,
          pricePerDay: 1500,
          amenities: ["Oxygen", "AC"],
          notes: "Automated verification ward",
        }),
      });
      const createWardData = await createWardRes.json();
      console.log("Status:", createWardRes.status);
      console.log("Created Ward ID:", createWardData.data?.ward?._id);
      const newWardId = createWardData.data?.ward?._id;
      if (createWardRes.status !== 201 || !newWardId) {
        throw new Error("Create ward failed: " + JSON.stringify(createWardData));
      }

      // 5. Test Hospital Update Ward (Update Vacant Beds & Price)
      console.log("\n5. Testing PUT /api/v1/hospital/wards/:id...");
      const updateWardRes = await fetch(`${baseUrl}/api/v1/hospital/wards/${newWardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hospitalToken}`,
        },
        body: JSON.stringify({
          vacantBeds: 3,
          pricePerDay: 1600,
        }),
      });
      const updateWardData = await updateWardRes.json();
      console.log("Status:", updateWardRes.status);
      console.log("Updated Vacant Beds:", updateWardData.data?.ward?.vacantBeds);
      console.log("Updated Price:", updateWardData.data?.ward?.pricePerDay);
      if (updateWardRes.status !== 200 || updateWardData.data?.ward?.vacantBeds !== 3) {
        throw new Error("Update ward failed");
      }

      // 6. Test Hospital Delete Ward
      console.log("\n6. Testing DELETE /api/v1/hospital/wards/:id...");
      const deleteWardRes = await fetch(`${baseUrl}/api/v1/hospital/wards/${newWardId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${hospitalToken}` },
      });
      console.log("Status:", deleteWardRes.status);
      if (deleteWardRes.status !== 200) {
        throw new Error("Delete ward failed");
      }

      // 7. Test Admin Provisioning Hospital User
      console.log("\n7. Testing Admin Provisioning Hospital Account...");
      const adminLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@bharatswasthya.gov.in",
          password: "password123",
        }),
      });
      const adminLoginData = await adminLoginRes.json();
      const adminToken = adminLoginData.data?.token;

      const testEmail = `test.hospital.${Date.now()}@bharatswasthya.gov.in`;
      const adminCreateRes = await fetch(`${baseUrl}/api/v1/admin/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: "Ruby Hall Clinic & Research Center",
          email: testEmail,
          password: "password123",
          role: "hospital",
          state: "Maharashtra",
          district: "Pune",
          city: "Koregaon Park",
          phone: "+91 20 6645 5100",
          qualification: "NABH Accredited Multi-Organ Transplant Center",
          hospitalOrClinic: "40 Sassoon Road, Pune",
        }),
      });
      const adminCreateData = await adminCreateRes.json();
      console.log("Status:", adminCreateRes.status);
      console.log("Created Hospital Role:", adminCreateData.data?.user?.role);
      console.log("Created Hospital Name:", adminCreateData.data?.user?.name);
      if (adminCreateRes.status !== 201 || adminCreateData.data?.user?.role !== "hospital") {
        throw new Error("Admin hospital creation failed: " + JSON.stringify(adminCreateData));
      }

      // Clean up test user
      await User.deleteOne({ email: testEmail });

      console.log("\n🎉 ALL HOSPITAL & WARD FEATURE TESTS PASSED SUCCESSFULLY! ✅");
      server.close();
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error("\n❌ Test failed with error:", err);
      server.close();
      await mongoose.disconnect();
      process.exit(1);
    }
  });
};

runTests();
