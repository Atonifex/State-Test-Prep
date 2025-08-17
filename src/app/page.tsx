import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">State Test Prep</h1>
        <p className="text-gray-700 max-w-prose">
          Practice standards-aligned questions for South Carolina English II. Use the navigation to select your assessment and begin practice.
        </p>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <Link href="/select" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Get Started</Link>
            <Link href="/dashboard-1" className="px-4 py-2 rounded-md border hover:bg-gray-50">Dashboard v1</Link>
          </div>
          
          {/* Dashboard Testing Section */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Dashboard Versions (Testing)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link 
                href="/dashboard-1" 
                className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-blue-100"
              >
                <h3 className="font-semibold text-blue-900 mb-2">Dashboard 1.0</h3>
                <p className="text-sm text-blue-700">Modern, colorful layout with practice cards and stats</p>
              </Link>
              
              <Link 
                href="/dashboard-2" 
                className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-pink-100"
              >
                <h3 className="font-semibold text-purple-900 mb-2">Dashboard 2.0</h3>
                <p className="text-sm text-purple-700">Gamified experience with XP, leaderboards, and rewards</p>
              </Link>
              
              <Link 
                href="/dashboard-3" 
                className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-emerald-100"
              >
                <h3 className="font-semibold text-green-900 mb-2">Dashboard 3.0</h3>
                <p className="text-sm text-green-700">Coming soon - AI-powered personalization</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
