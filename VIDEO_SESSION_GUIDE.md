# Agora Video Session Guide

## Overview
The video session interface allows clients and therapists to have secure, real-time video conversations through Agora RTC.

## How It Works

### 1. Session Page (`/session/[appointmentId]`)
- **Route**: `/session/[appointmentId]`
- **Access**: Both clients and therapists can access this page
- **Authentication**: Automatically determines user role (client or therapist) based on appointment data
- **Status Check**: Only allows joining confirmed or in-progress sessions

### 2. Client Dashboard (`/client/sessions`)
- **Join Button**: Appears for confirmed appointments
- **Active Now**: Green pulsing button when session time is active
- **Upcoming**: Regular button for future confirmed sessions
- **Navigation**: Clicking "Join Session" navigates to `/session/[appointmentId]`

### 3. Therapist Dashboard (`/therapist/appointments`)
- **Join Session Button**: Green button appears when session can be started
- **Timing**: Available 15 minutes before scheduled time
- **Navigation**: Clicking "Join Session" navigates to `/session/[appointmentId]`

## Features

### Video Session Interface
- **Local Video**: Shows your own camera feed
- **Remote Video**: Shows the other participant's camera feed
- **Audio Controls**: Mute/unmute microphone
- **Video Controls**: Turn camera on/off
- **Camera Switch**: Switch between front/back camera (mobile)
- **Connection Status**: Real-time connection quality indicator
- **Participant Count**: Shows number of active participants

### Session Controls
- **Join Session**: Initializes Agora connection and starts video/audio
- **Leave Session**: Ends the session and returns to dashboard
- **Toggle Video**: Turn camera on/off during session
- **Toggle Audio**: Mute/unmute microphone during session

## Technical Details

### Agora Service (`/lib/services/agora-service.ts`)
- Manages Agora RTC client
- Handles video/audio tracks
- Manages connection state
- Provides event listeners for user join/leave

### Video Session Component (`/components/video/VideoSession.tsx`)
- React component for video interface
- Manages local and remote video rendering
- Provides control buttons
- Handles session lifecycle

### Session Page Features
- **Authorization**: Verifies user is part of the appointment
- **Status Validation**: Ensures appointment is confirmed
- **Role Detection**: Automatically determines if user is therapist or client
- **Error Handling**: Shows appropriate errors for unauthorized access
- **Navigation**: Returns to appropriate dashboard after session ends

## Session Guidelines

### For Clients
- Ensure stable internet connection
- Use headphones for better audio quality
- Find a quiet, private space
- Test camera and microphone before starting
- Sessions are confidential and secure

### For Therapists
- Sessions can be started 15 minutes before scheduled time
- Ensure stable internet connection
- Test camera/microphone access before session
- Professional background recommended

## Environment Variables Required

```env
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
```

## Future Enhancements
- [ ] Screen sharing capability
- [ ] Session recording (with consent)
- [ ] Chat messaging during session
- [ ] Virtual backgrounds
- [ ] Session notes/annotations
- [ ] Post-session feedback
- [ ] Session analytics and quality metrics
