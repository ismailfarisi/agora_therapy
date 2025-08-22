/**
 * Test component for debugging Agora token authentication issues
 * This component helps validate the token generation and authentication flow
 */

"use client";

import React, { useState } from "react";
import { agoraService } from "@/lib/services/agora-service";
import { config, validateAgoraCredentials } from "@/lib/config";
import { useAuth } from "@/lib/hooks/useAuth";

export default function TestAgoraDebug() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const testCredentialValidation = () => {
    addLog("🔧 Testing Agora credential validation...");
    try {
      validateAgoraCredentials();
      addLog("✅ Agora credentials validation passed");
    } catch (error) {
      addLog(
        `❌ Agora credentials validation failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const testFirebaseAuth = async () => {
    addLog("🔧 Testing Firebase authentication...");
    if (!user) {
      addLog("❌ No authenticated user found");
      return;
    }

    try {
      const token = await user.getIdToken();
      addLog("✅ Firebase token retrieved successfully");
      addLog(`Token length: ${token.length}`);
    } catch (error) {
      addLog(
        `❌ Firebase token retrieval failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const testTokenGeneration = async () => {
    if (!user) {
      addLog("❌ Must be logged in to test token generation");
      return;
    }

    setIsLoading(true);
    addLog("🔧 Testing token generation...");

    try {
      const response = await fetch("/api/agora/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          channelName: "therapy_session_test_123",
          uid: user.uid,
          role: "publisher",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addLog("✅ Token generation successful");
        addLog(`Token length: ${data.token.length}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        addLog(
          `❌ Token generation failed: ${response.status} ${response.statusText}`
        );
        addLog(`Error details: ${JSON.stringify(errorData, null, 2)}`);
      }
    } catch (error) {
      addLog(
        `❌ Token generation error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const testVideoSessionJoin = async () => {
    if (!user) {
      addLog("❌ Must be logged in to test video session");
      return;
    }

    setIsLoading(true);
    addLog("🔧 Testing video session join...");

    try {
      const firebaseToken = await user.getIdToken();
      await agoraService.joinSession(
        {
          appointmentId: "test_123",
          userId: user.uid,
          userRole: "client",
          channelName: "therapy_session_test_123",
        },
        firebaseToken
      );

      addLog("✅ Video session join successful");

      // Leave the session immediately
      setTimeout(async () => {
        await agoraService.leaveSession();
        addLog("✅ Video session left successfully");
      }, 2000);
    } catch (error) {
      addLog(
        `❌ Video session join failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Agora Debug Test Console</h2>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">
          Current Configuration:
        </h3>
        <div className="text-sm space-y-1">
          <div>App ID: {config.agora.appId}</div>
          <div>
            Has Certificate: {config.agora.appCertificate ? "Yes" : "No"}
          </div>
          <div>User: {user ? user.email || user.uid : "Not authenticated"}</div>
          <div className="text-red-600">
            {config.agora.isPlaceholderAppId && "⚠️ Using placeholder App ID"}
          </div>
          <div className="text-red-600">
            {config.agora.isPlaceholderCertificate &&
              "⚠️ Using placeholder Certificate"}
          </div>
        </div>
      </div>

      <div className="mb-4 space-x-2 space-y-2">
        <button
          onClick={testCredentialValidation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Credentials
        </button>
        <button
          onClick={testFirebaseAuth}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={!user}
        >
          Test Firebase Auth
        </button>
        <button
          onClick={testTokenGeneration}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          disabled={!user || isLoading}
        >
          Test Token Generation
        </button>
        <button
          onClick={testVideoSessionJoin}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          disabled={!user || isLoading}
        >
          Test Video Session
        </button>
        <button
          onClick={clearLogs}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Logs
        </button>
      </div>

      <div className="border rounded p-4 bg-gray-50">
        <h3 className="font-semibold mb-2">Debug Logs:</h3>
        <div className="h-96 overflow-y-auto text-sm font-mono space-y-1">
          {logs.length === 0 ? (
            <div className="text-gray-500">
              No logs yet. Click a test button to start debugging.
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">Next Steps:</h3>
        <ul className="text-sm space-y-1 text-yellow-700">
          <li>1. Replace placeholder Agora credentials in .env.local</li>
          <li>2. Ensure you&apos;re logged in with Firebase authentication</li>
          <li>3. Run tests to validate the fixes</li>
          <li>4. Check browser console for additional debug information</li>
        </ul>
      </div>
    </div>
  );
}
