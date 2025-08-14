import React from 'react';

type StepsSidebarProps = {
  currentStep: number;
  onBack: () => void;
  scenarioInput: string;
  handleAnalyzeScenario: () => void;
  handleFinalizeAssessment: () => void;
};

const StepsSidebar: React.FC<StepsSidebarProps> = ({ currentStep, onBack, scenarioInput, handleAnalyzeScenario, handleFinalizeAssessment }) => {
  const isAnalyzeButtonDisabled = currentStep === 2 && scenarioInput.trim() === '';
  const isFinalizeButtonVisible = currentStep === 3;
  const isBackButtonVisible = currentStep === 3;
  const mainButtonText = currentStep === 2 ? 'Analyze Scenario' : 'Finalize Assessment';
  let footerSummary = '';
  if (currentStep === 2) {
    footerSummary = 'Ready to enter a new scenario.';
  } else if (currentStep === 3) {
    footerSummary = 'Review AI assessment and make your decision.';
  } else if (currentStep === 4) {
    footerSummary = 'Assessment saved successfully.';
  }


  interface StepIndicatorProps {
    stepNumber: number;
    stepStatus: 'completed' | 'active' | 'inactive';
  }

  const renderStepIndicator = (
    stepNumber: StepIndicatorProps['stepNumber'],
    stepStatus: StepIndicatorProps['stepStatus']
  ): React.ReactNode => {
    if (stepStatus === 'completed') {
      return (
        <div className="step-indicator w-6 h-6 rounded-full bg-green-500 flex justify-center items-center text-sm text-white mr-4 transition-all duration-300">
          <span className="material-icons text-base">check</span>
        </div>
      );
    } else if (stepStatus === 'active') {
      return (
        <div className="step-indicator w-6 h-6 rounded-full border-2 border-blue-500 bg-blue-500 flex justify-center items-center text-sm text-white mr-4 transition-all duration-300">
          {stepNumber}
        </div>
      );
    } else {
      return (
        <div className="step-indicator w-6 h-6 rounded-full border-2 border-gray-300 flex justify-center items-center text-sm text-gray-600 bg-white mr-4 transition-all duration-300">
          {stepNumber}
        </div>
      );
    }
  };

  return (
    <div className="steps-sidebar w-full lg:w-64 bg-white rounded-xl p-6 shadow-md flex flex-col flex-shrink-0 h-fit">
      <div className="text-sm text-gray-600 uppercase mb-4 font-medium">Steps</div>
      <div className={`step-item flex items-center mb-5 text-gray-600 text-base cursor-default transition-colors duration-200 ${currentStep === 1 ? 'active font-semibold text-gray-800' : currentStep > 1 ? 'completed' : ''}`}>
        {renderStepIndicator(1, currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'inactive')}
        <div className="step-text leading-tight">
          Configuration
          <div className="sub-step text-sm text-gray-400 mt-1">Define parameters for AI assessment (optional).</div>
        </div>
      </div>
      <div className={`step-item flex items-center mb-5 text-gray-600 text-base cursor-default transition-colors duration-200 ${currentStep === 2 ? 'active font-semibold text-gray-800' : currentStep > 2 ? 'completed' : ''}`}>
        {renderStepIndicator(2, currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'inactive')}
        <div className="step-text leading-tight">
          Scenario Input
          <div className="sub-step text-sm text-gray-400 mt-1">Enter details of the contingent worker engagement.</div>
        </div>
      </div>
      <div className={`step-item flex items-center mb-5 text-gray-600 text-base cursor-default transition-colors duration-200 ${currentStep === 3 ? 'active font-semibold text-gray-800' : currentStep > 3 ? 'completed' : ''}`}>
        {renderStepIndicator(3, currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'inactive')}
        <div className="step-text leading-tight">
          Review Assessment Results
          <div className="sub-step text-sm text-gray-400 mt-1">Analyze AI's findings and make decisions.</div>
        </div>
      </div>
      <div className={`step-item flex items-center mb-5 text-gray-600 text-base cursor-default transition-colors duration-200 ${currentStep === 4 ? 'completed font-semibold text-gray-800' : ''}`}>
        {renderStepIndicator(4, currentStep === 4 ? 'completed' : 'inactive')}
        <div className="step-text leading-tight">
          Finalize & Save
        </div>
      </div>

      <div className="sidebar-action-group mt-auto pt-6 border-t border-gray-200 flex flex-col items-center gap-4 w-full px-0">
        {isBackButtonVisible && (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-[calc(100%-20px)] py-3 px-4 rounded-lg text-base cursor-pointer transition-colors duration-200 bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
          >
            <span className="material-icons text-xl mr-2">arrow_back</span>
            Back
          </button>
        )}
        <div className="sidebar-summary-info text-sm text-gray-600 text-center px-2 leading-snug">
          {footerSummary}
        </div>
        {(currentStep !== 4 && (currentStep === 2 || isFinalizeButtonVisible)) && (
          <button
            onClick={currentStep === 2 ? handleAnalyzeScenario : handleFinalizeAssessment}
            disabled={isAnalyzeButtonDisabled}
            className={`w-[calc(100%-20px)] py-3 px-4 rounded-lg text-base font-semibold text-white cursor-pointer transition-colors duration-200
              ${isAnalyzeButtonDisabled ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {mainButtonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default StepsSidebar;