'use client';

import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Header from '../components/Header';
import StepsSidebar from '../components/StepsSidebar';
import CentralPanel from '../components/CentralPanel';
import RightSidebar from '../components/RightSidebar';
import AssessmentDetailsModal from '../components/AssessmentDetailsModal'; // Import the modal

// Define types for our data structures
type Assessment = {
  score: string;
  triage: string;
  explanation: string;
  guideline_sources: string[];
};

type AIResults = {
  assessment: Assessment;
  assessment_id: number;
  similar_assessment: AssessmentSummary | null;
};

type AssessmentSummary = {
  chroma_id: string;
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

export default function Home() {
  const [currentStep, setCurrentStep] = useState(2);
  const [scenarioInput, setScenarioInput] = useState('');
  const [aiResults, setAiResults] = useState<AIResults | null>(null);
  const [humanDecision, setHumanDecision] = useState('agree');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideTriage, setOverrideTriage] = useState('');
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);

  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentSummary[]>([]);
  
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentSummary | null>(null);

  const fetchAssessmentHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/assessments');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setAssessmentHistory(data);
    } catch (error) {
      console.error("Error fetching assessment history:", error);
    }
  };

  const handleAnalyzeScenario = async () => {
    if (scenarioInput.trim() === '') {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engagement_details: scenarioInput }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data: AIResults = await response.json();
      console.log("Received from backend:", data);

      setAiResults(data);
      setAssessmentId(data.assessment_id);
      setOverrideTriage(data.assessment.triage); // Set initial triage
      setCurrentStep(3);
    } catch (error) {
      console.error("Error fetching AI assessment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeAndRecordAssessment = (finalStatus: string, overrideScore?: string) => {
    setCurrentStep(4);
  };

  const handleFinalizeAssessment = async () => {
    if (humanDecision.startsWith('override') && overrideReason.trim() === '') {
      console.error("Override reason is required.");
      return;
    }

    let statusText = 'Approved';
    let overrideScore: string | undefined = undefined;

    if (humanDecision.startsWith('override')) {
      const score = humanDecision.replace('override-', ''); // "low", "medium", "high"
      overrideScore = score.charAt(0).toUpperCase() + score.slice(1) + ' Risk'; // "Low Risk", etc.
      statusText = `Overridden to ${overrideScore} and Approved`;
      
      const overridePayload = {
        chroma_id: `override_${assessmentId}`,
        assessment_id: assessmentId,
        original_engagement_details: scenarioInput,
        ai_assessment: aiResults?.assessment,
        human_override: {
          score: overrideScore,
          triage: overrideTriage,
          explanation: aiResults?.assessment.explanation || '',
          reason: overrideReason,
        },
      };

      try {
        const response = await fetch('http://localhost:8000/override', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(overridePayload),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        console.log("Override successfully sent to backend.");
      } catch (error) {
        console.error("Error sending override:", error);
        return;
      }
    }
    
    finalizeAndRecordAssessment(statusText, overrideScore);
    fetchAssessmentHistory();
  };

  const handleBack = () => {
    if (currentStep > 2) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleApprove = () => {
    handleFinalizeAssessment();
  };

  const handleStartNew = () => {
    setCurrentStep(2);
    setScenarioInput('');
    setAiResults(null);
    setHumanDecision('agree');
    setOverrideReason('');
  };

  // Modal handlers
  const handleViewDetails = (assessment: AssessmentSummary) => {
    setSelectedAssessment(assessment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAssessment(null);
  };

  useEffect(() => {
    fetchAssessmentHistory();
  }, []);

  const pageTitle =
    currentStep === 2
      ? 'Enter New Assessment Scenario'
      : currentStep === 3
        ? 'AI Assessment Results'
        : 'Assessment Finalized';

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      <NavBar />
      <div className="flex flex-col flex-grow p-8 box-border">
        <Header pageTitle={pageTitle} />

        <div className="flex flex-grow gap-8 mt-4 md:mt-0 flex-col lg:flex-row">
          <StepsSidebar
            currentStep={currentStep}
            onBack={handleBack}
            scenarioInput={scenarioInput}
            handleAnalyzeScenario={handleAnalyzeScenario}
            handleFinalizeAssessment={handleFinalizeAssessment}
          />
          <CentralPanel
            currentStep={currentStep}
            isLoading={isLoading}
            scenarioInput={scenarioInput}
            setScenarioInput={setScenarioInput}
            aiResults={aiResults}
            humanDecision={humanDecision}
            setHumanDecision={setHumanDecision}
            overrideReason={overrideReason}
            setOverrideReason={setOverrideReason}
            overrideTriage={overrideTriage}
            setOverrideTriage={setOverrideTriage}
            handleApprove={handleApprove}
            handleStartNew={handleStartNew}
            onViewDetails={handleViewDetails}
          />
          <RightSidebar 
            assessmentHistory={assessmentHistory}
            onViewDetails={handleViewDetails} // Pass handler to sidebar
          />
        </div>
      </div>
      
      {isModalOpen && (
        <AssessmentDetailsModal 
          assessment={selectedAssessment}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

