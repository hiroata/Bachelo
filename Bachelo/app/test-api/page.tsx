'use client';

import { useState } from 'react';

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/board/categories');
      const data = await response.json();
      setResult({
        status: response.status,
        ok: response.ok,
        data: data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'N/A'
      });
    } catch (error) {
      setResult({ error: error.toString() });
    }
    setLoading(false);
  };

  const testPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/board/posts?page=1&per_page=10');
      const data = await response.json();
      setResult({
        status: response.status,
        ok: response.ok,
        data: data,
        postsCount: data.posts?.length || 0
      });
    } catch (error) {
      setResult({ error: error.toString() });
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="space-x-4 mb-4">
        <button 
          onClick={testCategories}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Categories API
        </button>
        
        <button 
          onClick={testPosts}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Posts API
        </button>
      </div>

      {result && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}