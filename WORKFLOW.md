# Intervue Live Polling System - Workflow & Use Cases

## Table of Contents
1. [System Overview](#system-overview)
2. [Workflow](#workflow)
3. [Use Cases](#use-cases)
4. [Architecture](#architecture)
5. [User Flows](#user-flows)
6. [Features](#features)

---

## System Overview

The Intervue Live Polling System is a real-time polling platform that enables teachers to create and manage polls while students participate and vote in real-time. The system is designed for educational environments, live events, and interactive sessions.

**Key Technologies:**
- Frontend: React.js + TypeScript + Tailwind CSS
- Backend: Node.js + Express.js + TypeScript
- Real-time: Socket.io
- Database: MongoDB + Mongoose
- Hosting: Vercel (Frontend), Render/Heroku (Backend)

---

## Workflow

### 1. Application Start
```
User Opens App (http://localhost:5173)
    ↓
Role Selection Screen
    ├─→ Teacher Dashboard
    └─→ Student Onboarding
```

### 2. Teacher Workflow

#### 2.1 Session Initialization
```
Teacher Joins
    ↓
Backend Fetches Active Poll (if exists)
    ↓
Dashboard Loaded
    ├─→ No Active Poll → Show Poll Creation Form
    └─→ Active Poll → Show Live Results
```

#### 2.2 Poll Creation
```
Teacher Fills Form
    ├─→ Question (text input)
    ├─→ Options (add/remove dynamically, min 2)
    ├─→ Duration (30s, 60s, 90s, or custom)
    └─→ Mark Correct Answers (optional)
    ↓
Submit Poll
    ↓
Backend Validates
    ├─→ Check no active poll exists
    ├─→ Save to MongoDB
    └─→ Start Timer
    ↓
Broadcast 'pollStarted' to all connected students
    ↓
Live Results Dashboard
    ├─→ Real-time vote counts
    ├─→ Percentages updated
    ├─→ Timer countdown
    └─→ Participant count
```

#### 2.3 Poll Monitoring
```
Teacher Dashboard Displays
    ├─→ Poll Question
    ├─→ Options with vote bars
    ├─→ Real-time percentages
    ├─→ Total votes count
    ├─→ Timer (MM:SS format)
    └─→ Connected participants list
```

#### 2.4 Poll End
```
Timer Reaches 0
    ↓
Backend Ends Poll (sets active: false)
    ↓
Send Final Results
    ├─→ Total votes
    ├─→ Final percentages
    ├─→ Correct answers (if marked)
    └─→ Timestamp
    ↓
All Users See Results
    ↓
Teacher Can Create New Poll
```

### 3. Student Workflow

#### 3.1 Student Onboarding
```
Student Joins
    ↓
Enter Name Modal
    ├─→ Input: Student name (required)
    ├─→ UUID session generated
    └─→ Stored in localStorage
    ↓
Submit
    ↓
Backend Validates
    ├─→ Check duplicate names in session
    ├─→ Create participant entry
    └─→ Join Socket.io room
    ↓
Broadcast participant list update
```

#### 3.2 Waiting for Poll
```
Student Joins Successfully
    ↓
Waiting Screen
    ├─→ Message: "Wait for teacher to ask..."
    ├─→ Participant count visible
    ├─→ Connection status indicator
    └─→ Pulsing loading animation
    ↓
Teacher Creates Poll
    ↓
Receive 'pollStarted' event
    ↓
Poll Displayed with Timer
```

#### 3.3 Voting
```
Poll Displayed
    ├─→ Question text
    ├─→ Radio button options
    ├─→ Timer countdown
    └─→ Submit button (disabled until selection)
    ↓
Student Selects Option
    ↓
Click Submit
    ↓
Optimistic UI Update
    ├─→ Show selected option highlighted
    ├─→ Temporarily show updated results
    └─→ Disable further selections
    ↓
Backend Processes Vote
    ├─→ Check poll is active
    ├─→ Check student hasn't voted
    ├─→ Add vote to DB
    └─→ Calculate new percentages
    ↓
Broadcast 'voteUpdate' to all users
    ├─→ Update live results
    ├─→ Refresh vote counts
    └─→ Update percentages
    ↓
Student Sees Results
```

#### 3.4 Results View
```
After Voting
    ↓
Results Display
    ├─→ Question
    ├─→ Options with bars
    ├─→ Percentages
    ├─→ Total vote count
    └─→ "Correct Answer" badge (if teacher marked)
    ↓
Wait for Poll to End
    ↓
Final Results
```

#### 3.5 Poll Completion
```
Timer Expires
    ↓
Backend Ends Poll
    ↓
Show Final Results (if not already voting)
    ├─→ Final percentages
    ├─→ Total participants
    ├─→ Correct answers highlighted
    └─→ Discussion/Feedback (if any)
    ↓
Waiting for Next Poll
```

### 4. Resilience & Recovery

#### 4.1 Page Refresh (Student)
```
Student Refreshes Page
    ↓
Frontend Reconnects to Backend
    ↓
Backend Sends Current State
    ├─→ Active Poll → Resume voting/results
    ├─→ Completed Poll → Show final results
    └─→ No Poll → Show waiting screen
    ↓
Timer Synced to Remaining Time
    ↓
Continue Session
```

#### 4.2 Connection Loss
```
Network Disconnected
    ↓
UI Shows "Reconnecting..." indicator
    ↓
Backend Maintains Poll State
    ├─→ Poll continues running
    ├─→ Votes still accepted
    └─→ Timer still active
    ↓
Reconnection
    ↓
Fetch Latest State
    ↓
Sync Timer
    ↓
Resume Normal Operation
```

#### 4.3 Student Removal
```
Teacher Clicks "Remove" on Student
    ↓
Backend Removes from Connected Users
    ↓
Send 'kicked' event to student
    ↓
Student Sees Kicked Screen
    ├─→ Message: "You've been removed"
    └─→ Contact teacher option
    ↓
Socket Disconnected
```

---

## Use Cases

### Use Case 1: Classroom Quiz Session

**Actors:** Teacher, Students (20-30)

**Preconditions:**
- All students have joined the session
- Teacher is logged in

**Flow:**
1. Teacher creates poll: "What is the capital of France?"
   - Options: London, Paris, Berlin, Rome
   - Duration: 60 seconds
   - Correct Answer: Paris

2. Poll starts and timer begins

3. Students see question and select their answer:
   - Alice selects "Paris"
   - Bob selects "London"
   - Charlie selects "Paris"
   - (20 more students...)

4. Real-time results update:
   - Paris: 60%
   - London: 25%
   - Berlin: 10%
   - Rome: 5%

5. Timer expires → Poll ends

6. Teacher reviews results:
   - Can see correct answer (Paris) highlighted
   - Identifies students who selected wrong answers
   - Can proceed to discussion or next question

7. Creates new poll for next topic

**Post-conditions:**
- Poll saved to database
- Results available in poll history
- Session continues for next poll

---

### Use Case 2: Live Event Polling

**Actors:** Event Host, Audience (100+)

**Preconditions:**
- Event has started
- Audience members joined online

**Flow:**
1. Host asks: "Which option do you prefer?"
   - Options: Option A, Option B, Option C
   - Duration: 30 seconds (quick poll)

2. Audience votes in real-time

3. Live results displayed on big screen:
   - Animated bar chart
   - Percentage updates
   - Total vote count

4. After 30 seconds, poll ends

5. Host discusses results with audience

6. Move to next topic/question

**Benefits:**
- Engagement metric
- Audience feedback
- Real-time insights
- Data collection

---

### Use Case 3: Training Session Assessment

**Actors:** Trainer, Trainees (15-20)

**Preconditions:**
- Training session in progress
- All trainees connected

**Flow:**
1. Trainer creates assessment poll after module:
   - Question: "What did you learn from this section?"
   - Options: (Multiple choice answers)
   - Duration: 120 seconds

2. Trainees submit answers

3. Trainer monitors results:
   - Checks if majority understood
   - Identifies weak areas (if multiple choose wrong)
   - Can adjust pacing

4. If >80% correct → Move to next section

5. If <80% correct → Revisit concepts

6. Poll results saved for assessment records

**Data Tracked:**
- Who answered what
- Response time patterns
- Correct vs incorrect ratio
- Individual vs group performance

---

### Use Case 4: Late Student Join

**Actors:** Teacher, Late Student

**Scenario:**
1. Poll is active (started 10 seconds ago, 50 seconds remaining)

2. Late student joins

3. Backend sends:
   - Current poll question
   - Current options
   - Remaining time (50 seconds)
   - Current vote counts

4. Late student can vote immediately

5. Vote is counted in real-time results

6. Poll continues normally

**Key Point:** State is always consistent, late joiners don't miss anything

---

### Use Case 5: Session Recovery

**Actors:** Teacher, Student

**Scenario:**
1. Student is voting during poll

2. Browser crashes/refreshes accidentally

3. Student quickly reloads page

4. Frontend reconnects to backend

5. Backend checks:
   - Is poll still active? **YES**
   - Has this student voted? **NO**

6. Send current poll state back

7. Student can see:
   - Same question
   - Same options
   - Remaining time (synced)
   - Current results

8. Student completes vote

9. Session continues seamlessly

**Benefits:**
- No data loss
- Seamless recovery
- User retains position

---

## Architecture

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)            │
├─────────────────────────────────────────────────────────────┤
│ • App.tsx (Role Selection)                                  │
│ • TeacherDashboard.tsx (Poll Management)                   │
│ • StudentView.tsx (Voting Interface)                       │
│ • PollCard.tsx (Display/Results)                           │
│ • ChatModal.tsx (Communication)                            │
│ • useSocket.ts (Real-time Connection)                      │
│ • usePollTimer.ts (Timer Sync)                             │
└──────────────┬──────────────────────────────────────────────┘
               │ Socket.io
               ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Express + TypeScript)                  │
├─────────────────────────────────────────────────────────────┤
│ • index.ts (Server Setup)                                   │
│ • PollSocketHandler.ts (Real-time Logic)                   │
│ • PollService.ts (Business Logic)                          │
│ • pollRoutes.ts (REST API)                                 │
│ • Poll Model (Database Schema)                             │
│ • Chat Model (Message Storage)                             │
└──────────────┬──────────────────────────────────────────────┘
               │ MongoDB Driver
               ↓
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (MongoDB)                              │
├─────────────────────────────────────────────────────────────┤
│ • Polls Collection (Questions, Options, Votes)             │
│ • Chat Collection (Messages)                               │
│ • Sessions Collection (Metadata)                           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow
```
Browser                  Socket.io                 Server              MongoDB
  │                         │                        │                    │
  ├─── submitVote ─────────→ │                        │                    │
  │                         ├─ Validate ─────────→  │                    │
  │                         │                       ├─ Save Vote ───────→ │
  │                         │                       ├─ Calculate % ──────→ │
  │                         │ ← voteUpdate ────────→ │                    │
  │ ← voteUpdate ──────────→ │                        │                    │
  │                         │                        │                    │
```

---

## User Flows

### Teacher Role Flow
```
Start
  │
  ├─→ Select "Teacher"
  │
  ├─→ Dashboard Loaded
  │   ├─→ Check for active poll
  │   ├─→ Display participants
  │   └─→ Show poll history (if any)
  │
  ├─→ Fill Poll Form
  │   ├─→ Enter question
  │   ├─→ Add options (min 2)
  │   ├─→ Set duration
  │   └─→ Mark correct answers (optional)
  │
  ├─→ Create Poll
  │   ├─→ Timer starts
  │   ├─→ Students see question
  │   └─→ Monitor real-time results
  │
  ├─→ Poll Running
  │   ├─→ See live vote counts
  │   ├─→ See percentages
  │   ├─→ See participant names
  │   └─→ Can remove students
  │
  ├─→ Poll Ends (auto or manual)
  │   ├─→ Show final results
  │   ├─→ Highlight correct answers
  │   └─→ Can save results
  │
  ├─→ Create Next Poll or End Session
  │
  └─→ End
```

### Student Role Flow
```
Start
  │
  ├─→ Select "Student"
  │
  ├─→ Enter Name
  │   └─→ UUID session created
  │
  ├─→ Join Session
  │   ├─→ Check for active poll
  │   ├─→ If poll active → Show question
  │   └─→ If no poll → Waiting screen
  │
  ├─→ Waiting Screen
  │   ├─→ See other participants
  │   ├─→ Connection indicator
  │   └─→ Teacher creates poll
  │
  ├─→ Poll Displayed
  │   ├─→ Question visible
  │   ├─→ Options as radio buttons
  │   ├─→ Timer countdown
  │   └─→ Submit button
  │
  ├─→ Select Option
  │   ├─→ Option highlighted
  │   └─→ Submit button enabled
  │
  ├─→ Submit Vote
  │   ├─→ Optimistic UI update
  │   ├─→ Results refresh
  │   └─→ Vote recorded
  │
  ├─→ View Results
  │   ├─→ Percentages
  │   ├─→ Total votes
  │   ├─→ Correct answer (if applicable)
  │   └─→ Discussion/Feedback
  │
  ├─→ Wait for Next Poll or End
  │
  └─→ End
```

---

## Features

### Core Features

#### 1. Poll Management
- ✅ Create polls with custom questions
- ✅ Add/remove options dynamically
- ✅ Set poll duration (30s, 60s, 90s, custom)
- ✅ Mark correct answers (for quizzes)
- ✅ Auto-end poll on timer expiry
- ✅ Manual poll termination

#### 2. Real-time Voting
- ✅ Live vote counting
- ✅ Real-time percentage updates
- ✅ Animated progress bars
- ✅ Vote validation (no duplicates)
- ✅ Optimistic UI updates

#### 3. Results & Analytics
- ✅ Live results dashboard
- ✅ Vote count per option
- ✅ Percentage breakdown
- ✅ Total participants count
- ✅ Correct answer highlighting
- ✅ Poll history/archive

#### 4. User Management
- ✅ Teacher dashboard
- ✅ Student onboarding
- ✅ Participant list with status
- ✅ Remove students (teacher only)
- ✅ Kick notification (student notification)

#### 5. Communication
- ✅ Chat modal
- ✅ Poll-specific messages
- ✅ Participant monitoring
- ✅ Error notifications
- ✅ Connection status

#### 6. Resilience & Recovery
- ✅ Connection recovery
- ✅ Session state persistence
- ✅ Late join support
- ✅ Page refresh recovery
- ✅ Duplicate prevention
- ✅ Data consistency

### Advanced Features

#### 7. Chat System
- ✅ Poll-based messaging
- ✅ Real-time message delivery
- ✅ User identification
- ✅ Timestamp tracking
- ✅ Message history

#### 8. Timer Synchronization
- ✅ Server-side timer source of truth
- ✅ Client-side countdown
- ✅ Remaining time sync on join
- ✅ Late student timer adjustment
- ✅ Millisecond accuracy

#### 9. Database Persistence
- ✅ Poll questions & options stored
- ✅ Vote records maintained
- ✅ Student participation logged
- ✅ Chat messages archived
- ✅ Session metadata tracked

#### 10. UI/UX
- ✅ Modern, responsive design
- ✅ Gradient backgrounds
- ✅ Smooth animations
- ✅ Loading states
- ✅ Error messages
- ✅ Success feedback

---

## Error Handling

### Common Scenarios

| Scenario | Handling |
|----------|----------|
| Database Down | Show error toast, use in-memory fallback |
| Duplicate Vote | Reject, show error message |
| Late Poll Start | Accept vote, sync timer |
| Invalid Option | Reject, show validation error |
| Student Kicked | Show kicked screen, disconnect |
| Poll Already Active | Show error, prevent creation |
| Network Timeout | Show reconnecting indicator |
| Invalid Session | Redirect to role selection |

---

## Performance Considerations

- **Real-time Updates:** Socket.io room broadcasting (O(1) for connected users)
- **Vote Processing:** MongoDB atomic $push operation (race-condition safe)
- **Timer:** Server-side countdown (single source of truth)
- **Polling:** Event-driven, not polling-based
- **Scalability:** Horizontal scaling with multiple server instances
- **Optimization:** Lazy loading, component memoization, debouncing

---

## Security Measures

- ✅ Role-based access control (Teacher/Student)
- ✅ Session validation on every action
- ✅ Input validation and sanitization
- ✅ Duplicate name prevention
- ✅ Vote audit trail
- ✅ CORS configuration
- ✅ Environment variable protection

---

## Testing Strategy

### Unit Tests
- Vote calculation logic
- Timer countdown
- Duplicate detection

### Integration Tests
- Poll creation flow
- Vote submission flow
- Poll completion

### E2E Tests
- Complete teacher workflow
- Complete student workflow
- Multiple users scenario
- Disconnection recovery

---

## Deployment

### Frontend (Vercel)
```bash
1. Push to GitHub
2. Auto-deploy on main branch
3. Environment: VITE_SOCKET_URL
4. URL: https://intervue-polls.vercel.app
```

### Backend (Render/Heroku)
```bash
1. Push to GitHub
2. Auto-deploy on main branch
3. Environment: MONGODB_URI, PORT
4. URL: https://intervue-polls-api.render.com
```

---

## Summary

The Intervue Live Polling System provides a comprehensive solution for real-time polling with:

- **Resilient architecture** handling connection losses
- **Consistent state** with server-side source of truth
- **Real-time synchronization** via Socket.io
- **Professional UI** with smooth animations
- **Scalable backend** with MongoDB persistence
- **User-friendly** for both teachers and students

Perfect for educational institutions, events, and interactive sessions.

---

**Last Updated:** February 1, 2026
**Version:** 1.0
**Status:** Production Ready
