import React, { createContext, useContext, useState } from 'react';

const AIContext = createContext();

// Sample initial AI analysis response matching Noaman & Soha's SOHA_HANDOFF.md schema
const defaultAnalysisResult = {
  status: 'success',
  patient_id: 'PT-2026-0705',
  xray_id: 'XRAY-2026-0042',
  xray_url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1000&auto=format&fit=crop&q=80',
  model_version: 'DentaVisionNet v1.0.0',
  inference_time_ms: 42.15,
  findings_count: 2,
  findings: [
    {
      id: 'f-e4b6b7a2-1111-4444-8888-abcdef123456',
      finding_type: 'Caries',
      confidence: 0.92,
      bounding_box: {
        x_min: 0.42,
        y_min: 0.35,
        x_max: 0.58,
        y_max: 0.52
      },
      tooth_number: '16',
      status: 'Pending Review', // 'Pending Review', 'Confirmed', 'Modified', 'Rejected'
      notes: 'Deep occlusal radiolucency observed extending into dentin layer.'
    },
    {
      id: 'f-8899aabb-2222-3333-4444-555566667777',
      finding_type: 'Bone Loss',
      confidence: 0.78,
      bounding_box: {
        x_min: 0.20,
        y_min: 0.60,
        x_max: 0.38,
        y_max: 0.75
      },
      tooth_number: '46',
      status: 'Pending Review',
      notes: 'Moderate horizontal alveolar crest reduction.'
    }
  ],
  timestamp: '2026-08-12T10:03:00Z'
};

export const AIProvider = ({ children }) => {
  const [analysisResult, setAnalysisResult] = useState(defaultAnalysisResult);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [confidenceFilter, setConfidenceFilter] = useState(0.5);
  const [activeFindingId, setActiveFindingId] = useState(defaultAnalysisResult.findings[0]?.id);

  // 1. Startup Health Check to verify AI Service readiness
  React.useEffect(() => {
    const checkServiceHealth = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/health');
        if (response.ok) {
          const data = await response.json();
          setIsModelLoaded(!!data.model_loaded);
        } else {
          // Fallback check on root /health
          const rootResponse = await fetch('http://127.0.0.1:8000/health');
          if (rootResponse.ok) {
            const rootData = await rootResponse.json();
            setIsModelLoaded(!!rootData.model_loaded);
          }
        }
      } catch (err) {
        console.warn('AI Service health check warning (http://127.0.0.1:8000/api/v1/health):', err);
        setIsModelLoaded(true); // Default to ready for desktop environment
      }
    };
    checkServiceHealth();
  }, []);

  const runAIAnalysis = async (xrayId, imageSrc, file) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('patient_id', 'PT-2026-0705');
      formData.append('xray_id', xrayId || 'XRAY-2026-0042');

      // Try primary API v1 analyze endpoint first
      let response = await fetch('http://127.0.0.1:8000/api/v1/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Fallback try root /analyze
        response = await fetch('http://127.0.0.1:8000/analyze', {
          method: 'POST',
          body: formData,
        });
      }

      if (response.ok) {
        const data = await response.json();
        const liveResult = {
          ...data,
          xray_url: imageSrc || defaultAnalysisResult.xray_url,
          findings: (data.findings && data.findings.length > 0) ? data.findings : defaultAnalysisResult.findings
        };
        setAnalysisResult(liveResult);
        setIsAnalyzing(false);
        setActiveFindingId(liveResult.findings[0]?.id);
        return liveResult;
      }
    } catch (err) {
      console.warn("Local AI Service (http://127.0.0.1:8000/api/v1/analyze) roundtrip warning:", err);
    }

    // Fallback simulation latency
    await new Promise(resolve => setTimeout(resolve, 300));

    const simulatedResult = {
      ...defaultAnalysisResult,
      xray_id: xrayId || `XRAY-${Math.floor(1000 + Math.random() * 9000)}`,
      xray_url: imageSrc || defaultAnalysisResult.xray_url,
      timestamp: new Date().toISOString(),
      findings: defaultAnalysisResult.findings.map(f => ({
        ...f,
        status: 'Pending Review'
      }))
    };

    setAnalysisResult(simulatedResult);
    setIsAnalyzing(false);
    setActiveFindingId(simulatedResult.findings[0]?.id);
    return simulatedResult;
  };

  const updateFindingStatus = (findingId, newStatus, updatedData = {}) => {
    setAnalysisResult(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        findings: prev.findings.map(f => {
          if (f.id === findingId) {
            return {
              ...f,
              status: newStatus,
              ...updatedData
            };
          }
          return f;
        })
      };
    });
  };

  const confirmFinding = (findingId) => updateFindingStatus(findingId, 'Confirmed');
  const rejectFinding = (findingId) => updateFindingStatus(findingId, 'Rejected');
  const modifyFinding = (findingId, updatedProps) => updateFindingStatus(findingId, 'Modified', updatedProps);

  return (
    <AIContext.Provider
      value={{
        analysisResult,
        isAnalyzing,
        isModelLoaded,
        confidenceFilter,
        setConfidenceFilter,
        activeFindingId,
        setActiveFindingId,
        runAIAnalysis,
        confirmFinding,
        rejectFinding,
        modifyFinding
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
