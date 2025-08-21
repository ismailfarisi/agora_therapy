"use client";

import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";

export function TestBooking() {
  const { user, loading } = useAuth();
  const [therapistId, setTherapistId] = useState("");
  const [timeSlotId, setTimeSlotId] = useState("");
  const [date, setDate] = useState("");
  const [result, setResult] = useState("");
  const [clientId, setClientId] = useState("");

  useEffect(() => {
    console.log("TestBooking component mounted");
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to use this feature.</div>;
  }

  const handleCreateAppointment = async () => {
    if (!therapistId || !timeSlotId || !date || !clientId) {
      setResult("Please fill in all fields to create an appointment.");
      return;
    }

    const { AppointmentService } = await import(
      "@/lib/services/appointment-service"
    );
    const selectedDate = new Date(date);
    const bookingRequest = {
      therapistId,
      clientId,
      date: selectedDate,
      timeSlotId,
      duration: 60,
      sessionType: "video" as const,
    };

    const result = await AppointmentService.createAppointment(bookingRequest);
    setResult(`Appointment creation result: ${JSON.stringify(result)}`);
  };

  const handleCheckConflict = async () => {
    if (!therapistId || !timeSlotId || !date) {
      setResult("Please fill in all fields.");
      return;
    }

    const { realtimeService } = await import("@/lib/services/realtime-service");
    const selectedDate = new Date(date);
    const conflicts = await realtimeService.detectAvailabilityConflicts(
      therapistId,
      timeSlotId,
      selectedDate
    );

    if (conflicts.length > 0) {
      setResult(`Conflict detected: ${JSON.stringify(conflicts)}`);
    } else {
      setResult("No conflicts detected.");
    }
  };

  return (
    <div style={{ border: "1px solid black", padding: "10px", margin: "10px" }}>
      <h2>Test Booking Conflict</h2>
      <div>
        <label>Therapist ID: </label>
        <input
          type="text"
          value={therapistId}
          onChange={(e) => setTherapistId(e.target.value)}
        />
      </div>
      <div>
        <label>Time Slot ID: </label>
        <input
          type="text"
          value={timeSlotId}
          onChange={(e) => setTimeSlotId(e.target.value)}
        />
      </div>
      <div>
        <label>Date: </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div>
        <label>Client ID: </label>
        <input
          type="text"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        />
      </div>
      <button onClick={handleCheckConflict}>Check for Conflicts</button>
      <button onClick={handleCreateAppointment}>Create Appointment</button>
      <div>
        <strong>Result:</strong> {result}
      </div>
    </div>
  );
}
