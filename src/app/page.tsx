import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Linkbird</h1>
        <p className="text-gray-600 mb-6">Please login or create an account to continue.</p>

        <div className="flex flex-col gap-4">
          <Link
            href="/login"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-medium transition"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="w-full border border-gray-300 hover:bg-gray-100 py-2 rounded-xl font-medium transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
