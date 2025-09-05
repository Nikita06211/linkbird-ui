"use client";

import { useState } from "react";

export default function ApiDebug() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testCampaigns = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/campaigns');
      const data = await response.json();
      setTestResult({ campaigns: data });
    } catch (error) {
      setTestResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">API Debug</h3>
      <div className="space-x-2 mb-4">
        <button
          onClick={testApi}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Database
        </button>
        <button
          onClick={testCampaigns}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Campaigns API
        </button>
      </div>
      {testResult && (
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(testResult, null, 2)}
        </pre>
      )}
    </div>
  );
}
