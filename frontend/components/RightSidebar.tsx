import React from 'react';

interface AssessmentSummary {
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
}

interface RightSidebarProps {
  assessmentHistory: AssessmentSummary[];
  onViewDetails: (assessment: AssessmentSummary) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ assessmentHistory, onViewDetails }) => {
  const getScoreAppearance = (score: string): { color: string; icon: string } => {
    if (score === 'High Risk') return { color: 'text-red-600', icon: 'gpp_bad' };
    if (score === 'Medium Risk') return { color: 'text-yellow-600', icon: 'warning' };
    if (score === 'Low Risk') return { color: 'text-green-600', icon: 'check_circle' };
    return { color: 'text-gray-600', icon: 'help_outline' };
  };

  return (
    <div className="right-sidebar w-full lg:w-[450px] bg-white rounded-xl p-6 shadow-md flex flex-col flex-shrink-0 h-fit">
      <h2 className="text-xl font-semibold text-gray-800 mb-5">Recent Assessments History</h2>
      <div className="recent-assessments-history">
        <ul className="list-none p-0 m-0">
          {assessmentHistory.length > 0 ? (
            assessmentHistory.map((item) => {
              const finalScore = item.human_override_score || item.score;
              const scoreAppearance = getScoreAppearance(finalScore);

              return (
                <li 
                  key={item.id} 
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 text-sm cursor-pointer transition-colors duration-200 hover:bg-gray-100"
                  onClick={() => onViewDetails(item)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-gray-800">Assessment #{item.id}</strong>
                      {item.human_override_score && (
                        <span className="material-icons text-base text-blue-600" title="Human Override">person</span>
                      )}
                    </div>
                    <span className={`material-icons text-xl ${scoreAppearance.color}`}>{scoreAppearance.icon}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2" title={item.engagement_details}>
                    {item.engagement_details}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Triage: {item.human_override_triage || item.triage}</span>
                    <span>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </li>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">No past assessments.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default RightSidebar;
