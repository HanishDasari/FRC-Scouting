export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl w-full p-10 bg-white rounded-3xl shadow-lg text-center">
        <h1 className="text-4xl font-black mb-4">FRC Scouting</h1>
        <p className="text-gray-600 mb-6">
          Use the sidebar to navigate. Start by configuring matches in Setup and then scout from the Dashboard.
        </p>
        <div className="inline-flex gap-3">
          <a
            href="/setup"
            className="px-6 py-3 rounded-full bg-black text-white font-bold hover:bg-gray-900 transition"
          >
            Setup
          </a>
          <a
            href="/dashboard"
            className="px-6 py-3 rounded-full border border-black font-bold hover:bg-black hover:text-white transition"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
