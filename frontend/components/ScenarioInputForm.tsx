import React from 'react';

interface ScenarioInputFormProps {
  scenarioInput: string;
  setScenarioInput: (value: string) => void;
}

const ScenarioInputForm: React.FC<ScenarioInputFormProps> = ({ scenarioInput, setScenarioInput }) => {
  return (
    <div className="scenario-input-section">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Enter New Assessment Scenario</h2>
      <label htmlFor="engagementDetails" className="block text-base text-gray-800 mb-2 font-medium">
        Engagement Details / Scenario Description
      </label>
      <textarea
        id="engagementDetails"
        className="w-full h-52 p-4 border border-gray-300 rounded-lg text-base resize-y box-border outline-none focus:border-blue-500 transition-colors duration-200"
        placeholder="e.g., Contractual worker can send substitute and works in 3 companies. Employee earns 45% of income from 2 of 3 companies. Employee brings his own personal laptop to do work."
        value={scenarioInput}
        onChange={(e) => setScenarioInput(e.target.value)}
      ></textarea>
      <p className="text-sm text-gray-600 mt-2">
        Provide as much detail as possible to ensure accurate AI assessment.
      </p>
    </div>
  );
};

export default ScenarioInputForm;