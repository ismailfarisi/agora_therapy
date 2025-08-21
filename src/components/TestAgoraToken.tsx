"use client";

import { useState } from "react";

export function TestAgoraToken() {
  const [channelName, setChannelName] = useState("");
  const [uid, setUid] = useState("");
  const [result, setResult] = useState("");

  const handleGetToken = async () => {
    if (!channelName || !uid) {
      setResult("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("/api/agora/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelName,
          uid,
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div style={{ border: "1px solid black", padding: "10px", margin: "10px" }}>
      <h2>Test Agora Token</h2>
      <div>
        <label>Channel Name: </label>
        <input
          type="text"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
        />
      </div>
      <div>
        <label>UID: </label>
        <input
          type="text"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
        />
      </div>
      <button onClick={handleGetToken}>Get Token</button>
      <div>
        <strong>Result:</strong> {result}
      </div>
    </div>
  );
}
