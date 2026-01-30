function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12">
        <div className="mb-6 rounded-full border border-purple-200 bg-white px-4 py-1 text-sm font-medium text-purple-700 shadow-sm">
          Intervue Poll
        </div>

        <h1 className="text-center text-4xl font-bold text-gray-900 sm:text-5xl">
          Welcome to Live Polling
        </h1>
        <p className="mt-3 max-w-2xl text-center text-gray-600">
          Choose your role to continue. Teachers can create polls, students can vote in real-time.
        </p>

        <div className="mt-10 grid w-full gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-purple-700">
              Student
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Join a live poll</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your name and start voting instantly.
            </p>
            <button className="mt-6 w-full rounded-xl bg-primary px-4 py-2 font-semibold text-white shadow-md transition hover:opacity-95">
              Continue
            </button>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-purple-700">
              Teacher
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Create a poll session</h2>
            <p className="mt-2 text-sm text-gray-600">
              Start questions and view results live.
            </p>
            <button className="mt-6 w-full rounded-xl bg-primary px-4 py-2 font-semibold text-white shadow-md transition hover:opacity-95">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
