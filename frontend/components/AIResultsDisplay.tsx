import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

type AIResults = {
  assessment: Assessment;
  assessment_id: number;
  similar_assessment: any | null;
};

type AIResultsDisplayProps = {
  aiResults: AIResults;
  humanDecision: string;
  setHumanDecision: (value: string) => void;
  overrideReason: string;
  setOverrideReason: (value: string) => void;
  overrideTriage: string;
  setOverrideTriage: (value: string) => void;
  handleApprove: () => void;
  onViewDetails: (assessment: any) => void;
};

const AIResultsDisplay: React.FC<AIResultsDisplayProps> = ({
  aiResults,
  humanDecision,
  setHumanDecision,
  overrideReason,
  setOverrideReason,
  overrideTriage,
  setOverrideTriage,
  handleApprove,
  onViewDetails,
}) => {
  const { assessment, similar_assessment } = aiResults;
  const isOverride = humanDecision.startsWith('override');

  let cardClass = '';
  let icon = '';
  if (assessment.score === 'High Risk') {
    cardClass = 'bg-red-50 border-red-500';
    icon = 'gpp_bad';
  } else if (assessment.score === 'Medium Risk') {
    cardClass = 'bg-yellow-50 border-yellow-500';
    icon = 'warning';
  } else {
    cardClass = 'bg-green-50 border-green-500';
    icon = 'check_circle';
  }

  const getScoreColorClass = (score: string): string => {
    if (score === 'High Risk') return 'text-red-600';
    if (score === 'Medium Risk') return 'text-yellow-600';
    return 'text-green-600';
  };

  const getButtonText = () => {
    if (humanDecision === 'agree') {
      return 'Approve';
    } else if (humanDecision === 'override-low') {
      return 'Override to Low & Approve';
    } else if (humanDecision === 'override-medium') {
      return 'Override to Medium & Approve';
    } else if (humanDecision === 'override-high') {
      return 'Override to High & Approve';
    }
    return 'Approve'; // Default
  };

  return (
    <div className="ai-results-section">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">AI Assessment Results</h2>

      <div className={`assessment-summary-card flex items-center gap-5 p-5 rounded-xl mb-6 shadow-sm border ${cardClass}`}>
        <span className={`material-icons text-4xl p-2 rounded-full ${assessment.score === 'High Risk' ? 'bg-red-600' : assessment.score === 'Medium Risk' ? 'bg-yellow-600' : 'bg-green-600'} text-white`}>
          {icon}
        </span>
        <div className="score-triage flex-grow">
          <div className="score-label text-base text-gray-600 mb-1">AI Risk Score:</div>
          <div className={`score-value text-3xl font-bold ${getScoreColorClass(assessment.score)}`}>{assessment.score}</div>
          <div className="triage-label text-base text-gray-600 mt-2">Recommended Triage:</div>
          <div className={`triage-value text-xl font-semibold ${getScoreColorClass(assessment.score)}`}>{assessment.triage}</div>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">AI Explanation</h3>
      <div className="explanation-section prose prose-sm max-w-none">
        <ReactMarkdown>{assessment.explanation}</ReactMarkdown>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">Relevant HMRC Guideline Sources</h3>
      <div className="guideline-sources">
        <ul className="list-none p-0 m-0 mb-6">
          {Array.isArray(assessment.guideline_sources) && assessment.guideline_sources.length > 0 ? (
            assessment.guideline_sources.map((source, index) => (
              <li key={index} className="mb-2">
                <a href={source} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-base hover:underline">
                  {source.split('/').pop()?.replace(/-/g, ' ').replace('.gov.uk', '').trim()}
                </a>
              </li>
            ))
          ) : (
            <li className="text-gray-600 text-sm">No guideline sources available.</li>
          )}
        </ul>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">
        {similar_assessment ? "Similar Case Found" : "Similar Cases & Override History"}
      </h3>
      <div className="override-history-section">
        {similar_assessment ? (
            <div 
              className="similar-case-item bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 cursor-pointer hover:bg-yellow-100"
              onClick={() => onViewDetails(similar_assessment)}
            >
              <p className="mb-2 text-sm text-gray-700">
                <strong className="font-semibold">Original Case:</strong> "{similar_assessment.original_engagement_details}"
              </p>
              <p className="override-reason italic text-yellow-700 text-sm">
                <strong className="font-semibold">Override Reason:</strong> "{similar_assessment.human_override.reason}"
              </p>
            </div>
        ) : (
          <p className="text-gray-600 text-sm">No similar cases found in override history for this type of scenario.</p>
        )}
      </div>

      <div className="human-decision-section mt-8 pt-6 border-t border-gray-200">
        <label htmlFor="humanDecision" className="block text-base text-gray-800 mb-2 font-medium">
          Your Decision
        </label>
        <select
          id="humanDecision"
          className="w-full p-3 border border-gray-300 rounded-lg text-base mb-4 outline-none focus:border-blue-500"
          value={humanDecision}
          onChange={(e) => setHumanDecision(e.target.value)}
        >
          <option value="agree">Agree with AI Assessment</option>
          <option value="override-low">Override to Low Risk</option>
          <option value="override-medium">Override to Medium Risk</option>
          <option value="override-high">Override to High Risk</option>
        </select>

        {isOverride && (
          <>
            <label htmlFor="overrideTriage" className="block text-base text-gray-800 mb-2 font-medium">
              Override Triage
            </label>
            <select
              id="overrideTriage"
              className="w-full p-3 border border-gray-300 rounded-lg text-base mb-4 outline-none focus:border-blue-500"
              value={overrideTriage}
              onChange={(e) => setOverrideTriage(e.target.value)}
            >
              <option value="Automated">Automated</option>
              <option value="Standard Review">Standard Review</option>
              <option value="Senior Review">Senior Review</option>
            </select>

            <label htmlFor="overrideReason" className="block text-base text-gray-800 mb-2 font-medium">
              Reason for Override
            </label>
            <textarea
              id="overrideReason"
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg text-base resize-y mb-4 outline-none focus:border-blue-500"
              placeholder="Please explain why you are overriding the AI's assessment."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              required={isOverride}
            ></textarea>
          </>
        )}

        <div className="action-buttons flex gap-4 justify-end">
          <button
            onClick={handleApprove}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-semibold cursor-pointer transition-colors duration-200 hover:bg-blue-700"
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIResultsDisplay;