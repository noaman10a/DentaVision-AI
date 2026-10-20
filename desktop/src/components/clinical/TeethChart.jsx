import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, AlertCircle, CheckCircle, ShieldAlert, ArrowUpRight, X, Info, Activity } from 'lucide-react';
import { useAI } from '../../context/AIContext';

// Anatomic 32-Tooth Adult Dentition Map (FDI Two-Digit Notation)
const ANATOMIC_TOOTH_NAMES = {
  '18': 'Upper Right Third Molar (Wisdom)',
  '17': 'Upper Right Second Molar',
  '16': 'Upper Right First Molar',
  '15': 'Upper Right Second Premolar',
  '14': 'Upper Right First Premolar',
  '13': 'Upper Right Canine',
  '12': 'Upper Right Lateral Incisor',
  '11': 'Upper Right Central Incisor',
  '21': 'Upper Left Central Incisor',
  '22': 'Upper Left Lateral Incisor',
  '23': 'Upper Left Canine',
  '24': 'Upper Left First Premolar',
  '25': 'Upper Left Second Premolar',
  '26': 'Upper Left First Molar',
  '27': 'Upper Left Second Molar',
  '28': 'Upper Left Third Molar (Wisdom)',
  '48': 'Lower Right Third Molar (Wisdom)',
  '47': 'Lower Right Second Molar',
  '46': 'Lower Right First Molar',
  '45': 'Lower Right Second Premolar',
  '44': 'Lower Right First Premolar',
  '43': 'Lower Right Canine',
  '42': 'Lower Right Lateral Incisor',
  '41': 'Lower Right Central Incisor',
  '31': 'Lower Left Central Incisor',
  '32': 'Lower Left Lateral Incisor',
  '33': 'Lower Left Canine',
  '34': 'Lower Left First Premolar',
  '35': 'Lower Left Second Premolar',
  '36': 'Lower Left First Molar',
  '37': 'Lower Left Second Molar',
  '38': 'Lower Left Third Molar (Wisdom)'
};

const upperRight = ['18', '17', '16', '15', '14', '13', '12', '11'];
const upperLeft  = ['21', '22', '23', '24', '25', '26', '27', '28'];
const lowerRight = ['48', '47', '46', '45', '44', '43', '42', '41'];
const lowerLeft  = ['31', '32', '33', '34', '35', '36', '37', '38'];

export const normalizeFindingType = (type) => {
  if (!type) return 'Sound';
  const lower = String(type).toLowerCase();
  if (lower.includes('carie') || lower.includes('cavity')) return 'Caries';
  if (lower.includes('periapical') || lower.includes('abscess') || lower.includes('radiolucency')) return 'Periapical';
  if (lower.includes('demineral') || lower.includes('enamel')) return 'Demineralization';
  if (lower.includes('restoration') || lower.includes('crown') || lower.includes('amalgam') || lower.includes('filling') || lower.includes('composite') || lower.includes('obturat')) return 'Restoration';
  if (lower.includes('impact') || lower.includes('impaction')) return 'Impacted';
  if (lower.includes('bone') || lower.includes('resorb') || lower.includes('periodont')) return 'Bone Loss';
  return type;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Caries':
      return '#ef4444'; // Red
    case 'Demineralization':
      return '#f59e0b'; // Amber
    case 'Periapical':
      return '#a855f7'; // Purple
    case 'Restoration':
      return '#00d2ff'; // Cyan
    case 'Impacted':
      return '#3b82f6'; // Blue
    case 'Bone Loss':
      return '#f97316'; // Orange
    case 'Sound':
    default:
      return 'rgba(255, 255, 255, 0.25)'; // Healthy / Sound
  }
};

const getStatusBg = (status, isSelected) => {
  if (isSelected) return 'rgba(0, 210, 255, 0.28)';
  switch (status) {
    case 'Caries':
      return 'rgba(239, 68, 68, 0.16)';
    case 'Demineralization':
      return 'rgba(245, 158, 11, 0.16)';
    case 'Periapical':
      return 'rgba(168, 85, 247, 0.16)';
    case 'Restoration':
      return 'rgba(0, 210, 255, 0.14)';
    case 'Impacted':
      return 'rgba(59, 130, 246, 0.16)';
    case 'Bone Loss':
      return 'rgba(249, 115, 22, 0.16)';
    default:
      return 'rgba(15, 23, 42, 0.65)';
  }
};

export const TeethChart = ({ selectedPatient = null }) => {
  const { analysisResult, activeFindingId, setActiveFindingId } = useAI();
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [filterArch, setFilterArch] = useState('ALL'); // 'ALL', 'UPPER', 'LOWER'

  // Derive findings dynamically from AI analysis result
  const toothFindings = useMemo(() => {
    const map = {};
    // Initialize all 32 teeth as Sound
    Object.keys(ANATOMIC_TOOTH_NAMES).forEach(tooth => {
      map[tooth] = {
        tooth_number: tooth,
        name: ANATOMIC_TOOTH_NAMES[tooth],
        status: 'Sound',
        findingType: 'Sound',
        findingsList: []
      };
    });

    const findings = analysisResult?.findings || [];
    findings.forEach(f => {
      if (f.status === 'Rejected') return; // Ignore rejected/declined findings
      const cleanNum = String(f.tooth_number || '').replace(/^(Tooth\s*#?)/i, '').trim();
      if (map[cleanNum]) {
        const normalizedStatus = normalizeFindingType(f.finding_type);
        map[cleanNum].status = normalizedStatus;
        map[cleanNum].findingType = f.finding_type;
        map[cleanNum].finding = f.notes || `${f.finding_type} identified`;
        map[cleanNum].confidence = typeof f.confidence === 'number' ? `${(f.confidence * 100).toFixed(0)}%` : f.confidence;
        map[cleanNum].severity = f.severity || (f.confidence > 0.85 ? 'High' : 'Moderate');
        map[cleanNum].reviewStatus = f.status || 'Pending Review';
        map[cleanNum].findingId = f.id;
        map[cleanNum].findingsList.push(f);
      }
    });

    return map;
  }, [analysisResult?.findings]);

  // Synchronize selection with activeFindingId in AIContext
  useEffect(() => {
    if (activeFindingId && analysisResult?.findings) {
      const activeF = analysisResult.findings.find(f => f.id === activeFindingId);
      if (activeF && activeF.tooth_number) {
        const cleanNum = String(activeF.tooth_number).replace(/^(Tooth\s*#?)/i, '').trim();
        setSelectedTooth(cleanNum);
      }
    }
  }, [activeFindingId, analysisResult?.findings]);

  // Legend summary counts
  const counts = useMemo(() => {
    let sound = 0, caries = 0, demineralization = 0, periapical = 0, restoration = 0, impacted = 0, boneLoss = 0;
    Object.values(toothFindings).forEach(t => {
      switch (t.status) {
        case 'Sound': sound++; break;
        case 'Caries': caries++; break;
        case 'Demineralization': demineralization++; break;
        case 'Periapical': periapical++; break;
        case 'Restoration': restoration++; break;
        case 'Impacted': impacted++; break;
        case 'Bone Loss': boneLoss++; break;
        default: sound++; break;
      }
    });
    return { sound, caries, demineralization, periapical, restoration, impacted, boneLoss };
  }, [toothFindings]);

  const handleToothClick = (num) => {
    const isCurrentlySelected = selectedTooth === num;
    const newSelected = isCurrentlySelected ? null : num;
    setSelectedTooth(newSelected);

    if (newSelected && toothFindings[newSelected]?.findingId) {
      setActiveFindingId(toothFindings[newSelected].findingId);
    }
  };

  const renderTooth = (num) => {
    const data = toothFindings[num] || { status: 'Sound', name: ANATOMIC_TOOTH_NAMES[num] || `Tooth #${num}` };
    const isSelected = selectedTooth === num;
    const color = getStatusColor(data.status);
    const bg = getStatusBg(data.status, isSelected);
    const hasPathology = data.status !== 'Sound';

    return (
      <button
        key={num}
        onClick={() => handleToothClick(num)}
        style={{
          width: '46px',
          height: '66px',
          padding: '4px',
          borderRadius: '8px',
          border: isSelected ? '2px solid #00d2ff' : `1px solid ${hasPathology ? color : 'rgba(255, 255, 255, 0.12)'}`,
          backgroundColor: bg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.18s ease',
          boxShadow: isSelected ? '0 0 14px rgba(0, 210, 255, 0.6)' : hasPathology ? `0 0 8px ${color}40` : 'none',
        }}
        title={`Tooth #${num} - ${data.name}: ${data.status}`}
      >
        <span style={{ fontSize: '10.5px', fontWeight: '700', color: isSelected ? '#00d2ff' : hasPathology ? color : '#94a3b8' }}>
          #{num}
        </span>

        {/* Anatomic Tooth Graphic */}
        <div style={{ position: 'relative', width: '22px', height: '26px' }}>
          <svg viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <path
              d="M4 8C4 4 7 2 12 2C17 2 20 4 20 8C20 12 19 18 16 26C15 27 13.5 25 12 21C10.5 25 9 27 8 26C5 18 4 12 4 8Z"
              fill={hasPathology ? `${color}35` : 'rgba(255, 255, 255, 0.08)'}
              stroke={color}
              strokeWidth="1.5"
            />
            <path d="M9 8C11 10 13 10 15 8" stroke={color} strokeWidth="1" strokeLinecap="round" />
          </svg>

          {hasPathology && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-4px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: color,
                boxShadow: `0 0 8px ${color}`,
              }}
            />
          )}
        </div>

        <span
          style={{
            fontSize: '8.5px',
            fontWeight: '700',
            color: hasPathology ? color : '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '-0.3px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}
        >
          {data.status === 'Sound' ? 'OK' : data.status.slice(0, 5)}
        </span>
      </button>
    );
  };

  const selectedData = selectedTooth ? toothFindings[selectedTooth] : null;

  return (
    <div
      className="glass-card"
      style={{
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1px solid var(--border-glass)',
        backgroundColor: 'var(--bg-dark-card)',
        borderRadius: '16px',
      }}
    >
      {/* Header with Title, Arch Filter, and Model Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 210, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 210, 255, 0.3)',
            }}
          >
            <Sparkles size={18} color="var(--primary-teal)" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Interactive AI Odontogram & Heat Chart</span>
              <span className="badge badge-info" style={{ fontSize: '10px', padding: '2px 6px' }}>
                FDI System
              </span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
              Dynamic 32-tooth dental arch populated in real time from AI radiograph inference
            </p>
          </div>
        </div>

        {/* Arch Filter Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-dark-surface)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
          {['ALL', 'UPPER', 'LOWER'].map((arch) => (
            <button
              key={arch}
              onClick={() => setFilterArch(arch)}
              style={{
                background: filterArch === arch ? 'var(--primary-teal)' : 'transparent',
                color: filterArch === arch ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 12px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {arch === 'ALL' ? 'Full Dentition' : arch === 'UPPER' ? 'Upper Maxilla' : 'Lower Mandible'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dental Arch Grid */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          padding: '16px 10px',
          backgroundColor: 'rgba(4, 8, 23, 0.65)',
          borderRadius: '12px',
          border: '1px solid rgba(0, 210, 255, 0.12)',
        }}
      >
        {/* UPPER JAW (Maxilla) */}
        {(filterArch === 'ALL' || filterArch === 'UPPER') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.8px', color: '#00d2ff', textTransform: 'uppercase' }}>
              Maxillary Arch (Upper Jaw • Q1 & Q2)
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {/* Q1: Upper Right */}
              <div style={{ display: 'flex', gap: '4px', borderRight: '1px dashed rgba(255, 255, 255, 0.15)', paddingRight: '10px' }}>
                {upperRight.map(renderTooth)}
              </div>
              {/* Q2: Upper Left */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {upperLeft.map(renderTooth)}
              </div>
            </div>
          </div>
        )}

        {/* Midline separator */}
        {filterArch === 'ALL' && (
          <div style={{ width: '80%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />
        )}

        {/* LOWER JAW (Mandible) */}
        {(filterArch === 'ALL' || filterArch === 'LOWER') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {/* Q4: Lower Right */}
              <div style={{ display: 'flex', gap: '4px', borderRight: '1px dashed rgba(255, 255, 255, 0.15)', paddingRight: '10px' }}>
                {lowerRight.map(renderTooth)}
              </div>
              {/* Q3: Lower Left */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {lowerLeft.map(renderTooth)}
              </div>
            </div>
            <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.8px', color: '#38bdf8', textTransform: 'uppercase' }}>
              Mandibular Arch (Lower Jaw • Q4 & Q3)
            </div>
          </div>
        )}
      </div>

      {/* Selected Tooth Detail Banner */}
      {selectedTooth && selectedData && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 18px',
            borderRadius: '10px',
            backgroundColor: 'rgba(10, 17, 36, 0.95)',
            border: `1px solid ${getStatusColor(selectedData.status)}`,
            boxShadow: `0 4px 16px ${getStatusColor(selectedData.status)}26`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: `${getStatusColor(selectedData.status)}22`,
                border: `1px solid ${getStatusColor(selectedData.status)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                fontWeight: '700',
                color: getStatusColor(selectedData.status),
              }}
            >
              #{selectedTooth}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
                  {selectedData.name}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: `${getStatusColor(selectedData.status)}22`,
                    color: getStatusColor(selectedData.status),
                  }}
                >
                  {selectedData.status}
                </span>
                {selectedData.reviewStatus && (
                  <span className={`badge ${
                    selectedData.reviewStatus === 'Confirmed' ? 'badge-success' :
                    selectedData.reviewStatus === 'Modified' ? 'badge-warning' :
                    selectedData.reviewStatus === 'Rejected' ? 'badge-error' : 'badge-info'
                  }`}>
                    {selectedData.reviewStatus}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                {selectedData.finding ? `${selectedData.finding} • Confidence: ${selectedData.confidence || 'N/A'}` : 'Healthy anatomic crown and roots within normal limits. No pathological radiolucency detected.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedData.findingId && (
              <button
                onClick={() => {
                  setActiveFindingId(selectedData.findingId);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                <span>Focus in Radiograph</span>
                <ArrowUpRight size={14} />
              </button>
            )}
            <button
              onClick={() => setSelectedTooth(null)}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              title="Close inspection"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Clinical Legend Footnote with Dynamic Counts */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          paddingTop: '6px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
        }}
      >
        <span style={{ fontWeight: '600' }}>Live Clinical Legend:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }} />
            <span>Sound / Healthy ({counts.sound})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <span style={{ color: '#ef4444' }}>Caries ({counts.caries})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <span style={{ color: '#f59e0b' }}>Demineralization ({counts.demineralization})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7' }} />
            <span style={{ color: '#a855f7' }}>Periapical ({counts.periapical})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00d2ff' }} />
            <span style={{ color: '#00d2ff' }}>Restoration ({counts.restoration})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
            <span style={{ color: '#3b82f6' }}>Impacted ({counts.impacted})</span>
          </div>
          {counts.boneLoss > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }} />
              <span style={{ color: '#f97316' }}>Bone Loss ({counts.boneLoss})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
