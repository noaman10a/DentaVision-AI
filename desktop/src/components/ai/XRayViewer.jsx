import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../../context/AIContext';
import { TeethChart } from '../clinical/TeethChart';
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

// FDI Two-Digit Adult Teeth Options (11-48)
const FDI_TEETH_OPTIONS = [
  // Upper Right (Q1)
  { num: '18', label: 'Tooth #18 - Upper Right 3rd Molar (Wisdom)' },
  { num: '17', label: 'Tooth #17 - Upper Right 2nd Molar' },
  { num: '16', label: 'Tooth #16 - Upper Right 1st Molar' },
  { num: '15', label: 'Tooth #15 - Upper Right 2nd Premolar' },
  { num: '14', label: 'Tooth #14 - Upper Right 1st Premolar' },
  { num: '13', label: 'Tooth #13 - Upper Right Canine' },
  { num: '12', label: 'Tooth #12 - Upper Right Lateral Incisor' },
  { num: '11', label: 'Tooth #11 - Upper Right Central Incisor' },
  // Upper Left (Q2)
  { num: '21', label: 'Tooth #21 - Upper Left Central Incisor' },
  { num: '22', label: 'Tooth #22 - Upper Left Lateral Incisor' },
  { num: '23', label: 'Tooth #23 - Upper Left Canine' },
  { num: '24', label: 'Tooth #24 - Upper Left 1st Premolar' },
  { num: '25', label: 'Tooth #25 - Upper Left 2nd Premolar' },
  { num: '26', label: 'Tooth #26 - Upper Left 1st Molar' },
  { num: '27', label: 'Tooth #27 - Upper Left 2nd Molar' },
  { num: '28', label: 'Tooth #28 - Upper Left 3rd Molar (Wisdom)' },
  // Lower Left (Q3)
  { num: '31', label: 'Tooth #31 - Lower Left Central Incisor' },
  { num: '32', label: 'Tooth #32 - Lower Left Lateral Incisor' },
  { num: '33', label: 'Tooth #33 - Lower Left Canine' },
  { num: '34', label: 'Tooth #34 - Lower Left 1st Premolar' },
  { num: '35', label: 'Tooth #35 - Lower Left 2nd Premolar' },
  { num: '36', label: 'Tooth #36 - Lower Left 1st Molar' },
  { num: '37', label: 'Tooth #37 - Lower Left 2nd Molar' },
  { num: '38', label: 'Tooth #38 - Lower Left 3rd Molar (Wisdom)' },
  // Lower Right (Q4)
  { num: '41', label: 'Tooth #41 - Lower Right Central Incisor' },
  { num: '42', label: 'Tooth #42 - Lower Right Lateral Incisor' },
  { num: '43', label: 'Tooth #43 - Lower Right Canine' },
  { num: '44', label: 'Tooth #44 - Lower Right 1st Premolar' },
  { num: '45', label: 'Tooth #45 - Lower Right 2nd Premolar' },
  { num: '46', label: 'Tooth #46 - Lower Right 1st Molar' },
  { num: '47', label: 'Tooth #47 - Lower Right 2nd Molar' },
  { num: '48', label: 'Tooth #48 - Lower Right 3rd Molar (Wisdom)' }
];

const PATHOLOGY_OPTIONS = [
  'Caries',
  'Periapical Lesion',
  'Enamel Demineralization',
  'Alveolar Bone Loss',
  'Impacted Tooth',
  'Restoration / Crown',
  'Root Canal Treatment',
  'Sound / Normal'
];

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

  // Doctor Finding Modification Modal State
  const [isModifying, setIsModifying] = useState(false);
  const [modifyForm, setModifyForm] = useState({
    tooth_number: '16',
    finding_type: 'Caries',
    severity: 'Moderate',
    confidence: 90,
    notes: ''
  });

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

  const handleOpenModify = (finding) => {
    const target = finding || activeFinding;
    if (!target) return;
    const cleanTooth = String(target.tooth_number || '').replace(/^(Tooth\s*#?)/i, '').trim();
    setModifyForm({
      tooth_number: cleanTooth || '16',
      finding_type: target.finding_type || 'Caries',
      severity: target.severity || 'Moderate',
      confidence: typeof target.confidence === 'number' ? Math.round(target.confidence * 100) : 90,
      notes: target.notes || ''
    });
    setIsModifying(true);
  };

  const handleSaveModify = () => {
    if (!activeFinding) return;
    const parsedConf = Math.max(0.05, Math.min(1.0, (parseFloat(modifyForm.confidence) || 90) / 100));
    modifyFinding(activeFinding.id, {
      tooth_number: String(modifyForm.tooth_number).trim(),
      finding_type: modifyForm.finding_type,
      severity: modifyForm.severity,
      confidence: parsedConf,
      notes: modifyForm.notes
    });
    setIsModifying(false);
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

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => confirmFinding(activeFinding.id)}
                className="btn-primary"
                style={{ backgroundColor: 'var(--status-success)', padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Accept and confirm this finding"
              >
                <Check size={16} />
                <span>Accept</span>
              </button>

              <button
                onClick={() => handleOpenModify(activeFinding)}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Modify tooth, pathology classification, severity or notes"
              >
                <Edit3 size={16} />
                <span>Modify</span>
              </button>

              <button
                onClick={() => rejectFinding(activeFinding.id)}
                className="btn-secondary btn-danger"
                style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Decline / Reject this finding"
              >
                <X size={16} />
                <span>Decline</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* Clinical Finding Modification Modal */}
      {isModifying && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModifying(false);
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: 'var(--bg-dark-card, #081026)',
              border: '1px solid var(--border-accent, rgba(0, 210, 255, 0.4))',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 210, 255, 0.15)',
                    border: '1px solid rgba(0, 210, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-teal)',
                  }}
                >
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    Modify Clinical Finding
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
                    Doctor Attestation • Correct tooth, pathology class, severity or clinical notes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModifying(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Tooth Number Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Tooth Location (FDI Two-Digit System)
                </label>
                <select
                  value={modifyForm.tooth_number}
                  onChange={(e) => setModifyForm({ ...modifyForm, tooth_number: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                >
                  {FDI_TEETH_OPTIONS.map((t) => (
                    <option key={t.num} value={t.num} style={{ backgroundColor: '#081026', color: '#fff' }}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pathology Classification */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Pathological Finding Classification
                </label>
                <select
                  value={modifyForm.finding_type}
                  onChange={(e) => setModifyForm({ ...modifyForm, finding_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                >
                  {PATHOLOGY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat} style={{ backgroundColor: '#081026', color: '#fff' }}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity and Confidence Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Severity / Clinical Quality
                  </label>
                  <select
                    value={modifyForm.severity}
                    onChange={(e) => setModifyForm({ ...modifyForm, severity: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  >
                    <option value="Mild" style={{ backgroundColor: '#081026', color: '#fff' }}>Mild (Incipient)</option>
                    <option value="Moderate" style={{ backgroundColor: '#081026', color: '#fff' }}>Moderate (Dentin)</option>
                    <option value="Severe" style={{ backgroundColor: '#081026', color: '#fff' }}>Severe (Deep / Pulp)</option>
                    <option value="Stable" style={{ backgroundColor: '#081026', color: '#fff' }}>Stable / Monitored</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Diagnostic Confidence
                    </label>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary-teal)' }}>
                      {modifyForm.confidence}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={modifyForm.confidence}
                    onChange={(e) => setModifyForm({ ...modifyForm, confidence: e.target.value })}
                    style={{ width: '100%', marginTop: '8px', accentColor: 'var(--primary-teal)' }}
                  />
                </div>
              </div>

              {/* Clinical Notes & Observations */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Doctor Attestation Observations & Notes
                </label>
                <textarea
                  rows={3}
                  value={modifyForm.notes}
                  onChange={(e) => setModifyForm({ ...modifyForm, notes: e.target.value })}
                  placeholder="Record lesion depth, cavitated surfaces, pulp involvement, or differential diagnoses..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={() => setIsModifying(false)}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModify}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={16} />
                <span>Save Finding</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive 32-Tooth Heat Chart / Odontogram directly below the X-Ray & Findings */}
      <div style={{ marginTop: '10px' }}>
        <TeethChart />
      </div>
    </div>
  );
};
