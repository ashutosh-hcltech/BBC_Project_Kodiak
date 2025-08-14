'use client';

import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import Header from '../../components/Header';

type Override = {
  chroma_id: string;
  assessment_id: number;
  original_engagement_details: string;
  ai_assessment: {
    score: string;
    triage: string;
    explanation: string;
  };
  human_override: {
    score: string;
    triage: string;
    explanation: string;
    reason: string;
  };
};

export default function OverridesPage() {
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverrides = async () => {
      try {
        const response = await fetch('http://localhost:8000/overrides');
        if (!response.ok) throw new Error('Failed to fetch overrides');
        const data = await response.json();
        setOverrides(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOverrides();
  }, []);

  const handleDelete = async (overrideId: string) => {
    if (window.confirm('Are you sure you want to delete this override?')) {
      try {
        const response = await fetch(`http://localhost:8000/overrides/${overrideId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete override');
        setOverrides(overrides.filter(o => o.chroma_id !== overrideId));
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      <NavBar />
      <div className="flex flex-col flex-grow p-8 box-border">
        <Header pageTitle="Override Management" />
        <div className="mt-4">
          {isLoading ? (
            <p>Loading overrides...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overrides.map(override => (
                <div key={override.chroma_id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-bold">Assessment ID: {override.assessment_id}</h3>
                  <p className="text-sm text-gray-600">{override.original_engagement_details}</p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button className="text-sm bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                    <button 
                      onClick={() => handleDelete(override.chroma_id)}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
