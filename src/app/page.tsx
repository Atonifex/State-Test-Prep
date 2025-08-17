import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">State Test Prep</h1>
        <p className="text-gray-700 max-w-prose">
          Practice standards-aligned questions for South Carolina English II. Use the navigation to select your assessment and begin practice.
        </p>
        <div className="flex gap-3">
          <Link href="/select" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Get Started</Link>
          <Link href="/standards" className="px-4 py-2 rounded-md border">Browse Standards</Link>
        </div>
      </div>
    </div>
  );
}
