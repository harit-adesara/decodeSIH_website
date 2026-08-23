import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import http from "http";
import app from "../src/app.js";
import { User } from "../src/models/User.js";

const PORT = 5599;
let server;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

const postRequest = async (path, body, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

const getRequest = async (path, token = null) => {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

async function runTests() {
  console.log("🧪 Starting Bharat Swasthya AI Auth, Mail & RBAC Lightweight Test Suite...\n");

  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bharat_swasthya_ai";
  await mongoose.connect(mongoUri);

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`📡 Test Server running on ${PORT}\n`);

  let testsPassed = 0;
  let testsFailed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      testsFailed++;
    }
  };

  const testEmail = `test.citizen.${Date.now()}@example.com`;
  const testPassword = "securePassword123";
  let verificationToken = null;
  let citizenToken = null;

  try {
    // 1. Test Citizen Registration
    console.log("Test 1: Citizen Registration with Mail Service");
    const regRes = await postRequest("/auth/register", {
      name: "Ramesh Test User",
      email: testEmail,
      password: testPassword,
      state: "Maharashtra",
      district: "Pune",
      city: "Kothrud",
    });
    assert(regRes.status === 201, "Citizen registered with status 201");
    assert(regRes.data?.data?.user?.role === "user", "Role is strictly citizen 'user'");
    assert(regRes.data?.data?.user?.isEmailVerified === false, "User account is unverified initially");

    // Fetch token from db
    const createdDbUser = await User.findOne({ email: testEmail });
    assert(!!createdDbUser.emailVerificationToken, "Email verification token generated in DB");

    // 2. Test Login with unverified email
    console.log("\nTest 2: Login constraint for unverified email");
    const unverifiedLoginRes = await postRequest("/auth/login", {
      email: testEmail,
      password: testPassword,
    });
    assert(unverifiedLoginRes.status === 403, "Unverified login is rejected with status 403");

    // 3. Test Email Verification
    console.log("\nTest 3: Email Verification");
    verificationToken = regRes.data?.data?.verificationToken;
    if (!verificationToken) {
      // For dev fallback, generate temporary token from DB
      const { unHashedToken, hashedToken, tokenExpiry } = createdDbUser.generateTemporaryToken();
      createdDbUser.emailVerificationToken = hashedToken;
      createdDbUser.emailVerificationExpiry = tokenExpiry;
      await createdDbUser.save();
      verificationToken = unHashedToken;
    }

    const verifyRes = await postRequest("/auth/verify-email", {
      token: verificationToken,
    });
    assert(verifyRes.status === 200, "Email verified with status 200");
    assert(verifyRes.data?.data?.user?.isEmailVerified === true, "User email marked verified");
    citizenToken = verifyRes.data?.data?.token;

    // 4. Test Login with verified email
    console.log("\nTest 4: Login with verified credentials");
    const loginRes = await postRequest("/auth/login", {
      email: testEmail,
      password: testPassword,
    });
    assert(loginRes.status === 200, "Login successful with status 200");
    assert(!!loginRes.data?.data?.token, "JWT access token returned");
    assert(loginRes.data?.data?.user?.role === "user", "User role returned accurately");
    citizenToken = loginRes.data?.data?.token;

    // 5. Test RBAC: Citizen cannot access Admin or Doctor endpoints
    console.log("\nTest 5: RBAC Authorization - Citizen Restrictions");
    const citizenAdminAccess = await getRequest("/admin/users", citizenToken);
    assert(citizenAdminAccess.status === 403, "Citizen cannot access /admin/users (Status 403)");

    const citizenDoctorAccess = await getRequest("/doctor/reports", citizenToken);
    assert(citizenDoctorAccess.status === 403, "Citizen cannot access /doctor/reports (Status 403)");

    // 6. Test Doctor Login and Staff Creation
    console.log("\nTest 6: Doctor Login & Health Assistant Creation");
    // Ensure seed doctor exists
    let doctor = await User.findOne({ role: "doctor" });
    if (!doctor) {
      doctor = await User.create({
        name: "Dr. Unit Test",
        email: `dr.test.${Date.now()}@bharatswasthya.gov.in`,
        password: "password123",
        role: "doctor",
        isEmailVerified: true,
      });
    }

    const doctorLogin = await postRequest("/auth/login", {
      email: doctor.email,
      password: "password123",
    });
    const doctorToken = doctorLogin.data?.data?.token;
    assert(doctorLogin.status === 200, "Doctor logged in successfully");

    const ashaEmail = `asha.${Date.now()}@bharatswasthya.gov.in`;
    const createAshaRes = await postRequest(
      "/doctor/create-health-assistant",
      {
        name: "Sunita ASHA Worker",
        email: ashaEmail,
        password: "password123",
        state: "Maharashtra",
        district: "Pune",
        city: "Hadapsar",
        phone: "+91 99999 88888",
        hospitalOrClinic: "Hadapsar PHC",
      },
      doctorToken
    );
    assert(createAshaRes.status === 201, "Doctor created Health Assistant account (Status 201)");
    assert(createAshaRes.data?.data?.user?.role === "health_assistant", "New account role is 'health_assistant'");

    // 7. Test Admin Login and Doctor Creation
    console.log("\nTest 7: Admin Login & Doctor Provisioning");
    let admin = await User.findOne({ role: "admin" });
    if (!admin) {
      admin = await User.create({
        name: "Admin Unit Test",
        email: `admin.test.${Date.now()}@bharatswasthya.gov.in`,
        password: "password123",
        role: "admin",
        isEmailVerified: true,
      });
    }

    const adminLogin = await postRequest("/auth/login", {
      email: admin.email,
      password: "password123",
    });
    const adminToken = adminLogin.data?.data?.token;
    assert(adminLogin.status === 200, "Admin logged in successfully");

    const newDrEmail = `dr.created.${Date.now()}@bharatswasthya.gov.in`;
    const createDrRes = await postRequest(
      "/admin/create-user",
      {
        name: "Dr. Admin Created",
        email: newDrEmail,
        password: "password123",
        role: "doctor",
        state: "Maharashtra",
        district: "Pune",
        city: "Kothrud",
        qualification: "MD Medicine",
        hospitalOrClinic: "General Hospital",
      },
      adminToken
    );
    assert(createDrRes.status === 201, "Admin created Doctor account (Status 201)");
    assert(createDrRes.data?.data?.user?.role === "doctor", "New account role is 'doctor'");

    // 8. Test Forgot Password & Reset Flow
    console.log("\nTest 8: Forgot Password & Password Reset Flow");
    const forgotRes = await postRequest("/auth/forgot-password", {
      email: testEmail,
    });
    assert(forgotRes.status === 200, "Forgot password request accepted (Status 200)");

    const userForReset = await User.findOne({ email: testEmail });
    assert(!!userForReset.forgetPasswordToken, "Forgot password token stored in DB");

    // Fetch or generate reset token
    let resetToken = forgotRes.data?.data?.resetToken;
    if (!resetToken) {
      const { unHashedToken, hashedToken, tokenExpiry } = userForReset.generateTemporaryToken(60 * 60 * 1000);
      userForReset.forgetPasswordToken = hashedToken;
      userForReset.forgetPasswordExpiry = tokenExpiry;
      await userForReset.save();
      resetToken = unHashedToken;
    }

    const newCitizenPassword = "myNewPassword2026!";
    const resetRes = await postRequest("/auth/reset-password", {
      token: resetToken,
      newPassword: newCitizenPassword,
    });
    assert(resetRes.status === 200, "Password reset successfully (Status 200)");

    // Test login with new password
    const newPassLogin = await postRequest("/auth/login", {
      email: testEmail,
      password: newCitizenPassword,
    });
    assert(newPassLogin.status === 200, "Logged in with new password successfully");
    citizenToken = newPassLogin.data?.data?.token;

    // 9. Test Profile Update
    console.log("\nTest 9: Profile Update for Authenticated Users");

    const putProfileRes = await fetch(`${BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({
        name: "Ramesh Updated Citizen",
        phone: "+91 9988776655",
        city: "Shivajinagar",
      }),
    });
    const putProfileData = await putProfileRes.json();
    assert(putProfileRes.status === 200, "Profile updated with status 200");
    assert(putProfileData.data?.user?.name === "Ramesh Updated Citizen", "Updated name persisted in database");
    assert(putProfileData.data?.user?.phone === "+91 9988776655", "Updated phone persisted in database");

    // 10. Test Chatbot Endpoint Authentication Security
    console.log("\nTest 10: AI Chatbot Authentication Security");
    const unauthChatRes = await postRequest("/public/chatbot", {
      message: "I have mild fever and headache",
    });
    assert(unauthChatRes.status === 401, "Unauthenticated chatbot request rejected with 401 Unauthorized");

    const authChatRes = await postRequest(
      "/public/chatbot",
      {
        message: "I have mild fever and headache",
        state: "Maharashtra",
        district: "Pune",
      },
      citizenToken
    );
    assert(authChatRes.status === 200, "Authenticated chatbot request allowed with status 200");
    assert(!!authChatRes.data?.data?.reply, "AI tele-health reply returned successfully");

  } catch (error) {
    console.error("❌ Exception during test execution:", error);
    testsFailed++;
  } finally {
    console.log(`\n========================================`);
    console.log(`🏁 Test Summary: ${testsPassed} Passed, ${testsFailed} Failed`);
    console.log(`========================================\n`);

    if (server) server.close();
    await mongoose.disconnect();
    process.exit(testsFailed > 0 ? 1 : 0);
  }
}

runTests();

