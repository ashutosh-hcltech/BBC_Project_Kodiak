import React from 'react';

// Define the type for the assessment summary data
type AssessmentSummary = {
  id: number;
  engagement_details: string;
  score: string;
  triage: string;
  explanation: string;
  human_override_score?: string;
  human_override_triage?: string;
  human_override_explanation?: string;
  human_override_reason?: string;
  created_at: string;
};

interface AssessmentDetailsModalProps {
  assessment: AssessmentSummary | null;
  onClose: () => void;
}

const AssessmentDetailsModal: React.FC<AssessmentDetailsModalProps> = ({ assessment, onClose }) => {
  if (!assessment) {
    return null;
  }

  const getScoreColorClass = (score: string): string => {
    if (score === 'High Risk') return 'text-red-600';
    if (score === 'Medium Risk') return 'text-yellow-600';
    if (score === 'Low Risk') return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose} // Close modal on backdrop click
    >
      <div 
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl m-4"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Assessment Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800"
            aria-label="Close modal"
          >
            <span className="material-icons text-2xl">close</span>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <strong className="font-semibold text-gray-700">Assessment ID:</strong>
            <p className="text-gray-600">{assessment.id}</p>
          </div>
          <div>
            <strong className="font-semibold text-gray-700">Date/Time:</strong>
            <p className="text-gray-600">{new Date(assessment.created_at).toLocaleString()}</p>
          </div>
          <div>
            <strong className="font-semibold text-gray-700">AI Risk Score:</strong>
            <p className={`font-bold ${getScoreColorClass(assessment.score)}`}>{assessment.score}</p>
          </div>
          {assessment.human_override_score && (
            <div>
              <strong className="font-semibold text-gray-700">Human Override Score:</strong>
              <p className={`font-bold ${getScoreColorClass(assessment.human_override_score)}`}>{assessment.human_override_score}</p>
            </div>
          )}
          <div>
            <strong className="font-semibold text-gray-700">Engagement Details:</strong>
            <div className="mt-1 p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              <p className="text-gray-800 whitespace-pre-wrap">{assessment.engagement_details || 'No details provided.'}</p>
            </div>
          </div>
          <div>
            <strong className="font-semibold text-gray-700">AI Explanation:</strong>
            <div className="mt-1 p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              <p className="text-gray-800 whitespace-pre-wrap">{assessment.explanation || 'No details provided.'}</p>
            </div>
          </div>
          {assessment.human_override_reason && (
            <div>
              <strong className="font-semibold text-gray-700">Human Override Reason:</strong>
              <div className="mt-1 p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                <p className="text-gray-800 whitespace-pre-wrap">{assessment.human_override_reason}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-right">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDetailsModal;
