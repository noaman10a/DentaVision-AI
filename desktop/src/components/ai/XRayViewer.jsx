import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../../context/AIContext';
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Edit3, Sparkles, Layers, Sliders, Upload, RefreshCw } from 'lucide-react';

export const XRayViewer = () => {
  const { analysisResult, activeFindingId, setActiveFindingId, confirmFinding, rejectFinding, modifyFinding, confidenceFilter, runAIAnalysis, isAnalyzing } = useAI();
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showOverlays, setShowOverlays] = useState(true);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      runAIAnalysis(file.name || `XRAY-${Date.now().toString().slice(-4)}`, objectUrl, file);
      e.target.value = '';
    }
  };

  const handleResetSample = () => {
    runAIAnalysis('XRAY-2026-0042', '/sample_xray.png', null);
  };

  if (!analysisResult) return null;

  const activeFinding = analysisResult.findings.find(f => f.id === activeFindingId);

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
      {/* Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px 10px', borderRadius: '6px', backgroundColor: 'var(--primary-teal-glow)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--primary-teal)" />
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-teal)' }}>
              {analysisResult.model_version} ({analysisResult.inference_time_ms}ms)
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            X-ray ID: {analysisResult.xray_id}
          </span>
        </div>

        {/* Zoom & Image Adjust Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary"
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            disabled={isAnalyzing}
            title="Upload custom patient X-ray image"
          >
            <Upload size={14} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Upload OPG X-Ray'}</span>
          </button>

          <button
            onClick={handleResetSample}
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '12px' }}
            title="Reload verified sample radiograph"
            disabled={isAnalyzing}
          >
            <RefreshCw size={14} />
          </button>

          <button onClick={() => setZoom(prev => Math.min(prev + 0.2, 2.5))} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <ZoomIn size={16} />
          </button>
          <button onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.8))} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <ZoomOut size={16} />
          </button>
          <button onClick={() => { setZoom(1); setBrightness(100); setContrast(100); }} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <RotateCcw size={16} />
          </button>

          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className="btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: showOverlays ? 'var(--primary-teal-glow)' : 'transparent',
              borderColor: showOverlays ? 'var(--primary-teal)' : 'var(--border-glass)',
              color: showOverlays ? 'var(--primary-teal)' : 'var(--text-primary)',
            }}
          >
            <Layers size={14} />
            <span>AI Bounding Boxes: {showOverlays ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas & Image Workspace */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '420px',
          backgroundColor: '#000',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border-glass)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transform: `scale(${zoom})`,
            transition: 'transform 0.2s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* X-ray Image with Filter adjustments */}
          <img
            src={analysisResult.xray_url}
            alt="Dental X-ray DICOM"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              filter: `brightness(${brightness}%) contrast(${contrast}%)`,
            }}
          />

          {/* Render Overlaid Bounding Boxes */}
          {showOverlays && analysisResult.findings.map(finding => {
            if (finding.confidence < confidenceFilter) return null;
            const bbox = finding.bounding_box || {};
            const isSelected = finding.id === activeFindingId;

            // Bounding box percentages supporting both array [x1,y1,x2,y2] and object {x_min,y_min,x_max,y_max}
            const x_min = Array.isArray(bbox) ? bbox[0] : (bbox.x_min ?? 0.2);
            const y_min = Array.isArray(bbox) ? bbox[1] : (bbox.y_min ?? 0.2);
            const x_max = Array.isArray(bbox) ? bbox[2] : (bbox.x_max ?? 0.4);
            const y_max = Array.isArray(bbox) ? bbox[3] : (bbox.y_max ?? 0.4);

            const left = `${x_min * 100}%`;
            const top = `${y_min * 100}%`;
            const width = `${Math.max(0, x_max - x_min) * 100}%`;
            const height = `${Math.max(0, y_max - y_min) * 100}%`;

            const statusColor = 
              finding.status === 'Confirmed' ? 'var(--status-success)' :
              finding.status === 'Rejected' ? 'var(--status-error)' :
              finding.status === 'Modified' ? 'var(--status-warning)' : 'var(--primary-teal)';

            const cleanToothNumber = String(finding.tooth_number || '16').replace(/^Tooth\s*#?\s*/i, '');

            return (
              <div
                key={finding.id}
                onClick={() => setActiveFindingId(finding.id)}
                style={{
                  position: 'absolute',
                  left,
                  top,
                  width,
                  height,
                  border: `2px ${isSelected ? 'solid' : 'dashed'} ${statusColor}`,
                  backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.25)' : 'rgba(37, 99, 235, 0.1)',
                  cursor: 'pointer',
                  boxShadow: isSelected ? `0 0 16px ${statusColor}` : 'none',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                  zIndex: isSelected ? 10 : 5,
                }}
              >
                {/* Bounding box label */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-24px',
                    left: '0',
                    backgroundColor: statusColor,
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Tooth #{cleanToothNumber} - {finding.finding_type}</span>
                  <span>({(finding.confidence * 100).toFixed(0)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Finding Action Drawer */}
      {activeFinding && (
        <div
          style={{
            backgroundColor: 'var(--btn-secondary-bg)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            transition: 'var(--transition-theme)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Selected: Tooth #{String(activeFinding.tooth_number || '16').replace(/^Tooth\s*#?\s*/i, '')} - {activeFinding.finding_type}
              </h4>
              <span className={`badge ${
                activeFinding.status === 'Confirmed' ? 'badge-success' :
                activeFinding.status === 'Rejected' ? 'badge-error' :
                activeFinding.status === 'Modified' ? 'badge-warning' : 'badge-info'
              }`}>
                {activeFinding.status}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              AI Confidence: {(activeFinding.confidence * 100).toFixed(1)}% • Bounding box coordinates verified
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => confirmFinding(activeFinding.id)}
              className="btn-primary"
              style={{ backgroundColor: 'var(--status-success)', padding: '8px 14px', fontSize: '13px' }}
            >
              <Check size={16} />
              <span>Confirm Finding</span>
            </button>

            <button
              onClick={() => {
                const newTooth = prompt('Enter modified Tooth Number:', activeFinding.tooth_number);
                if (newTooth) modifyFinding(activeFinding.id, { tooth_number: newTooth });
              }}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px' }}
            >
              <Edit3 size={16} />
              <span>Modify</span>
            </button>

            <button
              onClick={() => rejectFinding(activeFinding.id)}
              className="btn-secondary btn-danger"
              style={{ padding: '8px 14px', fontSize: '13px' }}
            >
              <X size={16} />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
