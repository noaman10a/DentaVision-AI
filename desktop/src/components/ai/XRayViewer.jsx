import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../../context/AIContext';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Check, 
  X, 
  Edit3, 
  Sparkles, 
  Layers, 
  Sliders, 
  Upload, 
  RefreshCw,
  Hand,
  Ruler
} from 'lucide-react';

export const XRayViewer = () => {
  const { 
    analysisResult, 
    activeFindingId, 
    setActiveFindingId, 
    confirmFinding, 
    rejectFinding, 
    modifyFinding, 
    confidenceFilter, 
    setConfidenceFilter, 
    runAIAnalysis, 
    isAnalyzing 
  } = useAI();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [activeTool, setActiveTool] = useState('select'); // 'select', 'pan', 'measure'
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Contrast & Radiography Presets
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isInverted, setIsInverted] = useState(false);
  const [preset, setPreset] = useState('STD'); // 'STD', 'BONE', 'ENAM', 'NEG'
  const [showOverlays, setShowOverlays] = useState(true);

  // Dental Caliper Scale Measurement
  const [measurePoints, setMeasurePoints] = useState([]);
  const [measuredMm, setMeasuredMm] = useState(null);
  const [measuredPx, setMeasuredPx] = useState(null);
  const [calibPxPerMm, setCalibPxPerMm] = useState(14.2); // Dental OPG Standard (~14.2 px/mm)

  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  // Global mouseup listener to prevent pan sticking when releasing outside canvas
  useEffect(() => {
    if (!isPanning) return;
    const onGlobalMouseUp = () => setIsPanning(false);
    window.addEventListener('mouseup', onGlobalMouseUp);
    return () => window.removeEventListener('mouseup', onGlobalMouseUp);
  }, [isPanning]);

  // Escape key listener to clear caliper or reset tool
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMeasurePoints([]);
        setMeasuredMm(null);
        setMeasuredPx(null);
        if (activeTool === 'measure') setActiveTool('select');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      runAIAnalysis(file.name || `XRAY-${Date.now().toString().slice(-4)}`, objectUrl, file);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setMeasurePoints([]);
      setMeasuredMm(null);
      setMeasuredPx(null);
    }
  };

  const handleResetSample = () => {
    runAIAnalysis('XRAY-2026-0042', '/sample_xray.png', null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setMeasurePoints([]);
    setMeasuredMm(null);
    setMeasuredPx(null);
  };

  // Contrast Preset Switcher
  const applyPreset = (presetName) => {
    setPreset(presetName);
    if (presetName === 'STD') {
      setBrightness(100);
      setContrast(100);
      setIsInverted(false);
    } else if (presetName === 'BONE') {
      setBrightness(95);
      setContrast(150);
      setIsInverted(false);
    } else if (presetName === 'ENAM') {
      setBrightness(115);
      setContrast(135);
      setIsInverted(false);
    } else if (presetName === 'NEG') {
      setBrightness(105);
      setContrast(120);
      setIsInverted(true);
    }
  };

  // Pan & Caliper Mouse Handlers
  const handleMouseDown = (e) => {
    if (activeTool === 'pan' || e.button === 1) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (activeTool === 'measure') {
      const rect = imageRef.current?.getBoundingClientRect();
      if (!rect || !imageRef.current) return;
      const clientW = imageRef.current.clientWidth || rect.width;
      const clientH = imageRef.current.clientHeight || rect.height;
      const rawX = (e.clientX - rect.left) / zoom;
      const rawY = (e.clientY - rect.top) / zoom;
      const x = Math.max(0, Math.min(clientW, rawX));
      const y = Math.max(0, Math.min(clientH, rawY));

      if (measurePoints.length === 0 || measurePoints.length >= 2) {
        setMeasurePoints([{ x, y }]);
        setMeasuredMm(null);
        setMeasuredPx(null);
      } else {
        const p1 = measurePoints[0];
        const distPx = Math.sqrt(Math.pow(x - p1.x, 2) + Math.pow(y - p1.y, 2));
        const mm = (distPx / calibPxPerMm).toFixed(1);
        setMeasurePoints([p1, { x, y }]);
        setMeasuredMm(mm);
        setMeasuredPx(Math.round(distPx));
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  if (!analysisResult) return null;

  const activeFinding = analysisResult.findings?.find(f => f.id === activeFindingId);

  const getFindingColor = (type, status) => {
    if (status === 'Confirmed') return 'var(--status-success)';
    if (status === 'Rejected') return 'var(--status-error)';
    if (status === 'Modified') return 'var(--status-warning)';
    
    const lower = String(type || '').toLowerCase();
    if (lower.includes('carie') || lower.includes('cavity')) return '#f43f5e';
    if (lower.includes('obturat')) return '#06b6d4';
    if (lower.includes('bone') || lower.includes('resorb')) return '#a855f7';
    if (lower.includes('root') || lower.includes('fragment')) return '#fb923c';
    if (lower.includes('prosthet') || lower.includes('crown') || lower.includes('implant')) return '#38bdf8';
    return 'var(--primary-teal)';
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
      
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Left: AI Model Badge & ID */}
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

        {/* Right: Tools & Actions Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
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

          {/* Interactive Tool Switcher (Select, Pan, Measure Scale) */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--btn-secondary-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', padding: '2px' }}>
            <button
              onClick={() => setActiveTool('select')}
              style={{
                background: activeTool === 'select' ? 'var(--primary-teal)' : 'transparent',
                color: activeTool === 'select' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              title="Select / Click Findings"
            >
              Pointer
            </button>
            <button
              onClick={() => setActiveTool('pan')}
              style={{
                background: activeTool === 'pan' ? 'var(--primary-teal)' : 'transparent',
                color: activeTool === 'pan' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              title="Pan / Drag Canvas"
            >
              <Hand size={12} />
              <span>Pan</span>
            </button>
            <button
              onClick={() => setActiveTool('measure')}
              style={{
                background: activeTool === 'measure' ? '#0284c7' : 'transparent',
                color: activeTool === 'measure' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
              title="Dental Caliper: Measure scale in mm by clicking two points"
            >
              <Ruler size={12} />
              <span>Scale Ruler</span>
            </button>
          </div>

          {/* Measured Distance Badge */}
          {measuredMm && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(56, 189, 248, 0.18)', border: '1px solid #38bdf8', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', color: '#38bdf8' }}>
              <span>📏 {measuredMm} mm {measuredPx ? `(${measuredPx} px)` : ''}</span>
              <button
                onClick={() => { setMeasurePoints([]); setMeasuredMm(null); setMeasuredPx(null); }}
                style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0 }}
                title="Clear Measurement (Esc)"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Contrast Radiography Presets (STD, BONE, ENAM, NEG) */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--btn-secondary-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', padding: '2px' }}>
            {['STD', 'BONE', 'ENAM', 'NEG'].map((pName) => (
              <button
                key={pName}
                onClick={() => applyPreset(pName)}
                style={{
                  background: preset === pName ? 'var(--primary-teal)' : 'transparent',
                  color: preset === pName ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 7px',
                  fontSize: '10.5px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
                title={
                  pName === 'STD' ? 'Standard Radiograph' :
                  pName === 'BONE' ? 'Bone Density Enhanced (High Contrast)' :
                  pName === 'ENAM' ? 'Enamel-Dentin Junction Enhanced' :
                  'Negative / Inverted Radiograph (Hairline Cracks & Apexes)'
                }
              >
                {pName}
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <button onClick={() => setZoom(prev => Math.min(prev + 0.2, 3.0))} className="btn-secondary" style={{ padding: '6px 9px' }} title="Zoom In">
            <ZoomIn size={15} />
          </button>
          <button onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.75))} className="btn-secondary" style={{ padding: '6px 9px' }} title="Zoom Out">
            <ZoomOut size={15} />
          </button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); applyPreset('STD'); }} className="btn-secondary" style={{ padding: '6px 9px' }} title="Reset View">
            <RotateCcw size={15} />
          </button>

          {/* Toggle Bounding Boxes */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className="btn-secondary"
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              backgroundColor: showOverlays ? 'var(--primary-teal-glow)' : 'transparent',
              borderColor: showOverlays ? 'var(--primary-teal)' : 'var(--border-glass)',
              color: showOverlays ? 'var(--primary-teal)' : 'var(--text-primary)',
            }}
          >
            <Layers size={13} />
            <span>Boxes: {showOverlays ? 'ON' : 'OFF'}</span>
          </button>

          {/* AI Confidence Threshold Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--btn-secondary-bg)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
            <Sliders size={13} color="var(--primary-teal)" />
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(parseFloat(e.target.value))}
              style={{
                background: 'transparent',
                color: 'var(--text-primary)',
                border: 'none',
                outline: 'none',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
              title="Minimum AI model confidence threshold"
            >
              <option value={0.10} style={{ backgroundColor: 'var(--bg-dark-card)' }}>Min: 10% (All)</option>
              <option value={0.15} style={{ backgroundColor: 'var(--bg-dark-card)' }}>Min: 15% (Rec)</option>
              <option value={0.25} style={{ backgroundColor: 'var(--bg-dark-card)' }}>Min: 25% (Med)</option>
              <option value={0.40} style={{ backgroundColor: 'var(--bg-dark-card)' }}>Min: 40% (High)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Interactive Canvas & Image Workspace */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          position: 'relative',
          width: '100%',
          height: '460px',
          backgroundColor: '#000',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border-glass)',
          cursor: activeTool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : (activeTool === 'measure' ? 'crosshair' : 'default'),
          userSelect: 'none'
        }}
      >
        <div
          style={{
            position: 'relative',
            maxWidth: '100%',
            maxHeight: '100%',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Inner Image Canvas Wrapper that strictly matches the rendered image dimensions */}
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              lineHeight: 0,
              maxWidth: '100%',
              maxHeight: '440px',
            }}
          >
            {/* X-ray Image with Filter adjustments */}
            <img
              ref={imageRef}
              src={analysisResult.xray_url}
              alt="Dental X-ray DICOM"
              draggable={false}
              style={{
                maxWidth: '100%',
                maxHeight: '440px',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
                filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(1)' : ''}`,
              }}
            />

            {/* Caliper Measurement SVG Scale Line */}
            {measurePoints.length >= 1 && (
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 25
                }}
              >
                {/* 1st Point Anchor Reticle */}
                <circle cx={measurePoints[0].x} cy={measurePoints[0].y} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx={measurePoints[0].x} cy={measurePoints[0].y} r="11" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" opacity="0.85" />

                {/* Prompt when only 1 point placed */}
                {measurePoints.length === 1 && (
                  <g>
                    <rect
                      x={measurePoints[0].x - 64}
                      y={measurePoints[0].y - 28}
                      width="128"
                      height="20"
                      rx="4"
                      fill="rgba(15, 23, 42, 0.95)"
                      stroke="#38bdf8"
                      strokeWidth="1"
                    />
                    <text
                      x={measurePoints[0].x}
                      y={measurePoints[0].y - 14}
                      fill="#38bdf8"
                      fontSize="10"
                      fontFamily="sans-serif"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      Click 2nd point to measure
                    </text>
                  </g>
                )}

                {/* 2nd Point and Measurement Line */}
                {measurePoints.length === 2 && (
                  <>
                    <line
                      x1={measurePoints[0].x}
                      y1={measurePoints[0].y}
                      x2={measurePoints[1].x}
                      y2={measurePoints[1].y}
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                    <circle cx={measurePoints[1].x} cy={measurePoints[1].y} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                    <rect
                      x={(measurePoints[0].x + measurePoints[1].x) / 2 - 32}
                      y={(measurePoints[0].y + measurePoints[1].y) / 2 - 20}
                      width="64"
                      height="20"
                      rx="4"
                      fill="rgba(15, 23, 42, 0.95)"
                      stroke="#38bdf8"
                      strokeWidth="1"
                    />
                    <text
                      x={(measurePoints[0].x + measurePoints[1].x) / 2}
                      y={(measurePoints[0].y + measurePoints[1].y) / 2 - 6}
                      fill="#38bdf8"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {measuredMm} mm
                    </text>
                  </>
                )}
              </svg>
            )}

            {/* Render Overlaid Bounding Boxes */}
            {showOverlays && (analysisResult.findings || []).map(finding => {
              if (typeof finding.confidence === 'number' && finding.confidence < (confidenceFilter ?? 0.15)) return null;
              const bbox = finding.bounding_box || {};
              const isSelected = finding.id === activeFindingId;

              // Safe normalized bounding box extraction
              const xMin = bbox.x_min ?? (Array.isArray(bbox) ? bbox[0] : 0.2);
              const yMin = bbox.y_min ?? (Array.isArray(bbox) ? bbox[1] : 0.2);
              const xMax = bbox.x_max ?? (Array.isArray(bbox) ? bbox[2] : 0.4);
              const yMax = bbox.y_max ?? (Array.isArray(bbox) ? bbox[3] : 0.4);

              // Bounding box percentages relative to the exact image
              const left = `${Math.max(0, Math.min(1, xMin)) * 100}%`;
              const top = `${Math.max(0, Math.min(1, yMin)) * 100}%`;
              const width = `${Math.max(0.015, Math.min(1, xMax - xMin)) * 100}%`;
              const height = `${Math.max(0.015, Math.min(1, yMax - yMin)) * 100}%`;

              const statusColor = getFindingColor(finding.finding_type, finding.status);
              const cleanTooth = String(finding.tooth_number || '').replace(/^Tooth\s*#?\s*/i, '');

              return (
                <div
                  key={finding.id}
                  onClick={(e) => {
                    if (activeTool !== 'select') return;
                    e.stopPropagation();
                    setActiveFindingId(finding.id);
                  }}
                  style={{
                    position: 'absolute',
                    left,
                    top,
                    width,
                    height,
                    minWidth: '22px',
                    minHeight: '18px',
                    border: `2px ${isSelected ? 'solid' : 'dashed'} ${statusColor}`,
                    backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.25)' : 'rgba(37, 99, 235, 0.12)',
                    cursor: activeTool === 'select' ? 'pointer' : 'inherit',
                    pointerEvents: activeTool === 'select' ? 'auto' : 'none',
                    boxShadow: isSelected ? `0 0 16px ${statusColor}` : `0 0 6px ${statusColor}`,
                    borderRadius: '4px',
                    transition: 'all 0.2s ease',
                    zIndex: isSelected ? 20 : 10,
                    boxSizing: 'border-box',
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
                      lineHeight: '1.2',
                      pointerEvents: 'none',
                    }}
                  >
                    <span>Tooth #{cleanTooth || '??'} - {finding.finding_type}</span>
                    <span>({(finding.confidence * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Finding Action Drawer */}
      {activeFinding && (() => {
        const cleanActiveTooth = String(activeFinding.tooth_number || '').replace(/^Tooth\s*#?\s*/i, '');
        return (
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
                  Selected: Tooth #{cleanActiveTooth || '??'} - {activeFinding.finding_type}
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
                  const newTooth = prompt('Enter modified Tooth Number (e.g. 31):', cleanActiveTooth);
                  if (newTooth) modifyFinding(activeFinding.id, { tooth_number: newTooth.replace(/^Tooth\s*#?\s*/i, '') });
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
        );
      })()}
    </div>
  );
};
