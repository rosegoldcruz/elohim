'use client';

import { useState } from 'react';

interface RedisResponse {
  success: boolean;
  key?: string;
  result?: any;
  value?: any;
  deleted?: boolean;
  error?: string;
  timestamp: string;
  ttl?: number | null;
}

export default function RedisTestPage() {
  const [getKey, setGetKey] = useState('item');
  const [setKey, setSetKey] = useState('item');
  const [setValue, setSetValue] = useState('');
  const [setTtl, setSetTtl] = useState('');
  const [deleteKey, setDeleteKey] = useState('');
  const [response, setResponse] = useState<RedisResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGet = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/redis-test?key=${encodeURIComponent(getKey)}`);
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSet = async () => {
    setLoading(true);
    try {
      const body: any = {
        key: setKey,
        value: setValue
      };
      
      if (setTtl && !isNaN(Number(setTtl))) {
        body.ttl = Number(setTtl);
      }

      const res = await fetch('/api/redis-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/redis-test?key=${encodeURIComponent(deleteKey)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Redis Test Interface</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* GET Section */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4 text-green-600">GET Value</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key:
              </label>
              <input
                type="text"
                value={getKey}
                onChange={(e) => setGetKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter key to retrieve"
              />
            </div>
            <button
              onClick={handleGet}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get Value'}
            </button>
          </div>
        </div>

        {/* SET Section */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">SET Value</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key:
              </label>
              <input
                type="text"
                value={setKey}
                onChange={(e) => setSetKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value:
              </label>
              <textarea
                value={setValue}
                onChange={(e) => setSetValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter value (JSON will be stringified)"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TTL (seconds, optional):
              </label>
              <input
                type="number"
                value={setTtl}
                onChange={(e) => setSetTtl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Time to live in seconds"
              />
            </div>
            <button
              onClick={handleSet}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Set Value'}
            </button>
          </div>
        </div>

        {/* DELETE Section */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4 text-red-600">DELETE Value</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key:
              </label>
              <input
                type="text"
                value={deleteKey}
                onChange={(e) => setDeleteKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter key to delete"
              />
            </div>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Delete Key'}
            </button>
          </div>
        </div>
      </div>

      {/* Response Section */}
      {response && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">Response</h2>
          <div className={`p-4 rounded-md ${response.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
            <div className="flex items-center mb-2">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${response.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="font-medium">
                {response.success ? 'Success' : 'Error'}
              </span>
            </div>
            <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Usage Instructions</h2>
        <div className="space-y-2 text-sm text-blue-700">
          <p><strong>GET:</strong> Retrieve a value from Redis by key</p>
          <p><strong>SET:</strong> Store a value in Redis with optional TTL (time to live)</p>
          <p><strong>DELETE:</strong> Remove a key from Redis</p>
          <p><strong>Note:</strong> Values are automatically JSON stringified when stored</p>
        </div>
      </div>
    </div>
  );
}
