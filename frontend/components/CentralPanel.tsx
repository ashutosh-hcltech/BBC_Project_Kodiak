import React from 'react';
import ScenarioInputForm from './ScenarioInputForm';
import AIResultsDisplay from './AIResultsDisplay';
import LoadingOverlay from './LoadingOverlay';

type CentralPanelProps = {
  currentStep: number;
  isLoading: boolean;
  scenarioInput: any;
  setScenarioInput: (input: any) => void;
  aiResults: any;
  humanDecision: any;
  setHumanDecision: (decision: any) => void;
  overrideReason: string;
  setOverrideReason: (reason: string) => void;
  overrideTriage: string;
  setOverrideTriage: (triage: string) => void;
  handleApprove: () => void;
  handleStartNew: () => void; // Add new prop
  onViewDetails: (assessment: any) => void;
};

const CentralPanel: React.FC<CentralPanelProps> = ({
  currentStep,
  isLoading,
  scenarioInput,
  setScenarioInput,
  aiResults,
  humanDecision,
  setHumanDecision,
  overrideReason,
  setOverrideReason,
  overrideTriage,
  setOverrideTriage,
  handleApprove,
  handleStartNew, // Destructure new prop
  onViewDetails,
}) => {
  return (
    <div className="central-content-panel flex-grow bg-white rounded-xl p-8 shadow-md flex flex-col relative">
      {isLoading && <LoadingOverlay />}
      {currentStep === 2 && (
        <ScenarioInputForm
          scenarioInput={scenarioInput}
          setScenarioInput={setScenarioInput}
        />
      )}
      {currentStep === 3 && aiResults && (
        <AIResultsDisplay
          aiResults={aiResults}
          humanDecision={humanDecision}
          setHumanDecision={setHumanDecision}
          overrideReason={overrideReason}
          setOverrideReason={setOverrideReason}
          overrideTriage={overrideTriage}
          setOverrideTriage={setOverrideTriage}
          handleApprove={handleApprove}
          onViewDetails={onViewDetails}
        />
      )}
      {currentStep === 4 && (
        <div className="text-center py-10 flex flex-col items-center">
          <h2 className="text-3xl font-semibold text-green-600 mb-4">Assessment Finalized!</h2>
          <p className="text-lg text-gray-600 mb-8">Your assessment has been successfully processed and saved.</p>
          <button
            onClick={handleStartNew}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start New Assessment
          </button>
        </div>
      )}
    </div>
  );
};

export default CentralPanel;