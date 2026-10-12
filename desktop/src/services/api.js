/**
 * DentaVision AI — Desktop API Client Service
 * Owner: Noaman (Tech Lead) / Sneha (Frontend Lead)
 *
 * Bridges the Electron React desktop UI to the Node.js Express backend
 * at http://localhost:5000/api/v1.
 */

export const API_BASE_URL = 'http://localhost:5000/api/v1';
export const AI_DIRECT_URL = 'http://localhost:8000/api/v1';

/**
 * Checks backend and AI service health status.
 */
export async function checkSystemHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (res.ok) {
      const data = await res.json();
      return { backend: true, ...data };
    }
  } catch (err) {
    console.warn('[API] Backend health check failed:', err.message);
  }
  return { backend: false, status: 'offline' };
}

/**
 * Fetches all registered patients from the database.
 */
export async function fetchPatients() {
  try {
    const res = await fetch(`${API_BASE_URL}/patients`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[API] Could not fetch patients from backend:', err.message);
  }
  return null;
}

/**
 * Registers a new patient in the database.
 */
export async function registerPatientApi(patientData) {
  try {
    const res = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: patientData.name,
        dob: patientData.dob,
        gender: patientData.gender,
        phone: patientData.phone,
        email: patientData.email || undefined,
        address: patientData.address || undefined,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[API] Error registering patient via backend:', err.message);
  }
  return null;
}

/**
 * Records a clinical consultation visit.
 */
export async function createVisitApi(visitData) {
  try {
    const res = await fetch(`${API_BASE_URL}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitData),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[API] Error saving visit to backend:', err.message);
  }
  return null;
}

/**
 * Sends a panoramic radiograph to the AI service (via backend proxy or direct).
 *
 * @param {File|Blob} file - The image file to analyze
 * @param {string} patientId - Patient UUID or display ID
 * @param {string} [visitId] - Associated visit ID
 */
export async function analyzeXrayApi(file, patientId, visitId = null) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('patient_id', patientId || 'PT-DEFAULT');
  if (visitId) formData.append('visit_id', visitId);

  // Strategy 1: Attempt via Node.js Backend Proxy (Port 5000)
  try {
    const res = await fetch(`${API_BASE_URL}/xrays/analyze`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          status: 'success',
          source: 'backend_proxy',
          patient_id: json.data.patient_id,
          xray_id: json.data.xray_record_id,
          xray_url: json.data.storage_url,
          model_version: json.data.model_version,
          inference_time_ms: json.data.inference_time_ms,
          findings_count: json.data.findings_count,
          findings: json.data.findings.map((f, idx) => ({
            id: f.id || `finding-${idx}`,
            finding_type: f.finding_type,
            confidence: f.confidence,
            bounding_box: {
              x_min: f.bounding_box?.[0] ?? f.bounding_box?.x_min ?? 0.2,
              y_min: f.bounding_box?.[1] ?? f.bounding_box?.y_min ?? 0.2,
              x_max: f.bounding_box?.[2] ?? f.bounding_box?.x_max ?? 0.4,
              y_max: f.bounding_box?.[3] ?? f.bounding_box?.y_max ?? 0.4,
            },
            tooth_number: f.tooth_number ? f.tooth_number.replace('Tooth #', '') : '16',
            status: 'Pending Review',
            notes: `${f.finding_type} detected with ${(f.confidence * 100).toFixed(1)}% confidence.`,
          })),
          timestamp: json.data.timestamp || new Date().toISOString(),
        };
      }
    }
  } catch (backendErr) {
    console.warn('[API] Backend proxy analyze error, trying direct local AI service:', backendErr.message);
  }

  // Strategy 2: Direct local FastAPI Service fallback (Port 8000)
  try {
    const aiFormData = new FormData();
    aiFormData.append('file', file);
    aiFormData.append('patient_id', patientId || 'PT-DEFAULT');

    const res = await fetch(`${AI_DIRECT_URL}/analyze`, {
      method: 'POST',
      body: aiFormData,
    });
    if (res.ok) {
      const json = await res.json();
      return {
        status: 'success',
        source: 'fastapi_direct',
        patient_id: json.patient_id,
        xray_id: json.xray_id || `XRAY-${Date.now()}`,
        xray_url: null,
        model_version: json.model_version,
        inference_time_ms: json.inference_time_ms,
        findings_count: json.findings_count,
        findings: (json.findings || []).map((f, idx) => ({
          id: f.id || `f-${idx}`,
          finding_type: f.finding_type,
          confidence: f.confidence,
          bounding_box: {
            x_min: f.bounding_box?.[0] ?? f.bounding_box?.x_min ?? 0.2,
            y_min: f.bounding_box?.[1] ?? f.bounding_box?.y_min ?? 0.2,
            x_max: f.bounding_box?.[2] ?? f.bounding_box?.x_max ?? 0.4,
            y_max: f.bounding_box?.[3] ?? f.bounding_box?.y_max ?? 0.4,
          },
          tooth_number: f.tooth_number ? f.tooth_number.replace('Tooth #', '') : '16',
          status: 'Pending Review',
          notes: `${f.finding_type} localized on ${f.tooth_number || 'tooth'}.`,
        })),
        timestamp: json.timestamp || new Date().toISOString(),
      };
    }
  } catch (aiErr) {
    console.warn('[API] Direct AI service analyze failed:', aiErr.message);
  }

  return null;
}

/**
 * Saves a clinical diagnostic report.
 */
export async function saveReportApi(reportData) {
  try {
    const res = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[API] Error saving report to backend:', err.message);
  }
  return null;
}
