import { useState } from 'react';
import './App.css';
import StudentView from './views/StudentView';
import TeacherDashboard from './views/TeacherDashboard';

type Role = 'student' | 'teacher' | null;

function App() {
  const [role, setRole] = useState<Role>(null);

  if (role === 'student') {
    return <StudentView />;
  }

  if (role === 'teacher') {
    return <TeacherDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 animate-fadeIn">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 animate-slideUp rounded-full bg-white px-6 py-2 text-sm font-semibold text-primary shadow-lg">
          🎯 Intervue Poll System
        </div>

        <h1 className="animate-slideUp text-center text-5xl font-extrabold text-gray-900 sm:text-6xl text-shadow">
          Welcome to Live Polling
        </h1>
        <p className="animate-slideUp mt-4 max-w-2xl text-center text-lg text-gray-600">
          Choose your role to continue. Teachers can create polls, students can vote in real-time.
        </p>

        <div className="mt-12 grid w-full max-w-4xl gap-8 md:grid-cols-2">
          <div className="role-card animate-slideUp rounded-3xl border-2 border-purple-200 bg-white p-8 shadow-lg">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-3xl shadow-lg">
              👨‍🎓
            </div>
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-purple-600">
              Student
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Join a Live Poll</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Enter your name and start voting on questions instantly. See results in real-time.
            </p>
            <button
              className="submit-button mt-8 w-full rounded-xl bg-primary px-6 py-3.5 font-bold text-white shadow-lg transition"
              onClick={() => setRole('student')}
            >
              Continue as Student →
            </button>
          </div>

          <div className="role-card animate-slideUp rounded-3xl border-2 border-purple-200 bg-white p-8 shadow-lg">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-3xl shadow-lg">
              👨‍🏫
            </div>
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-indigo-600">
              Teacher
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create Poll Sessions</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Start questions, set timers, and view live results as students respond.
            </p>
            <button
              className="submit-button mt-8 w-full rounded-xl bg-primary px-6 py-3.5 font-bold text-white shadow-lg transition"
              onClick={() => setRole('teacher')}
            >
              Continue as Teacher →
            </button>
          </div>
        </div>

        <div className="mt-12 animate-slideUp text-center text-xs text-gray-500">
          <p>Built with ❤️ for Intervue.io | Real-time Polling System</p>
        </div>
      </div>
    </div>
  );
}

export default App
