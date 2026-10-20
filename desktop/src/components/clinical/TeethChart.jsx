import React, { useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle, ShieldAlert, ArrowRight, X, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeethChart = ({ selectedPatient = null }) => {
  const navigate = useNavigate();
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [filterArch, setFilterArch] = useState('ALL'); // 'ALL', 'UPPER', 'LOWER'

  // Anatomic 32-Tooth Adult Dentition Map (FDI Two-Digit Notation)
  // Upper Right (Q1): 18 down to 11
  // Upper Left  (Q2): 21 up to 28
  // Lower Right (Q4): 48 down to 41
  // Lower Left  (Q3): 31 up to 38
  const defaultToothFindings = {
    '18': { status: 'Sound', name: 'Upper Right Third Molar (Wisdom)' },
    '17': { status: 'Sound', name: 'Upper Right Second Molar' },
    '16': { status: 'Caries', name: 'Upper Right First Molar', finding: 'Deep Occlusal Caries (D3 Lesion)', confidence: '94%', severity: 'High' },
    '15': { status: 'Sound', name: 'Upper Right Second Premolar' },
    '14': { status: 'Restoration', name: 'Upper Right First Premolar', finding: 'Composite Restoration (MOD)', confidence: '91%', severity: 'Stable' },
    '13': { status: 'Sound', name: 'Upper Right Canine' },
    '12': { status: 'Sound', name: 'Upper Right Lateral Incisor' },
    '11': { status: 'Sound', name: 'Upper Right Central Incisor' },
    '21': { status: 'Sound', name: 'Upper Left Central Incisor' },
    '22': { status: 'Sound', name: 'Upper Left Lateral Incisor' },
    '23': { status: 'Sound', name: 'Upper Left Canine' },
    '24': { status: 'Demineralization', name: 'Upper Left First Premolar', finding: 'Early Enamel Demineralization (E2)', confidence: '87%', severity: 'Watch' },
    '25': { status: 'Sound', name: 'Upper Left Second Premolar' },
    '26': { status: 'Periapical', name: 'Upper Left First Molar', finding: 'Periapical Radiolucency (Apical Periodontitis)', confidence: '89%', severity: 'Moderate' },
    '27': { status: 'Sound', name: 'Upper Left Second Molar' },
    '28': { status: 'Sound', name: 'Upper Left Third Molar (Wisdom)' },
    '48': { status: 'Impacted', name: 'Lower Right Third Molar', finding: 'Mesioangular Impaction against #47', confidence: '96%', severity: 'Moderate' },
    '47': { status: 'Sound', name: 'Lower Right Second Molar' },
    '46': { status: 'Restoration', name: 'Lower Right First Molar', finding: 'Amalgam Crown / Core', confidence: '93%', severity: 'Stable' },
    '45': { status: 'Sound', name: 'Lower Right Second Premolar' },
    '44': { status: 'Sound', name: 'Lower Right First Premolar' },
    '43': { status: 'Sound', name: 'Lower Right Canine' },
    '42': { status: 'Sound', name: 'Lower Right Lateral Incisor' },
    '41': { status: 'Sound', name: 'Lower Right Central Incisor' },
    '31': { status: 'Sound', name: 'Lower Left Central Incisor' },
    '32': { status: 'Sound', name: 'Lower Left Lateral Incisor' },
    '33': { status: 'Sound', name: 'Lower Left Canine' },
    '34': { status: 'Sound', name: 'Lower Left First Premolar' },
    '35': { status: 'Sound', name: 'Lower Left Second Premolar' },
    '36': { status: 'Caries', name: 'Lower Left First Molar', finding: 'Interproximal Cavitation (Distal)', confidence: '92%', severity: 'High' },
    '37': { status: 'Sound', name: 'Lower Left Second Molar' },
    '38': { status: 'Sound', name: 'Lower Left Third Molar (Wisdom)' }
  };

  const upperRight = ['18', '17', '16', '15', '14', '13', '12', '11'];
  const upperLeft  = ['21', '22', '23', '24', '25', '26', '27', '28'];
  const lowerRight = ['48', '47', '46', '45', '44', '43', '42', '41'];
  const lowerLeft  = ['31', '32', '33', '34', '35', '36', '37', '38'];

  const getStatusColor = (status) => {
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
      default:
        return 'rgba(255, 255, 255, 0.2)'; // Healthy / Sound
    }
  };

  const getStatusBg = (status, isSelected) => {
    if (isSelected) return 'rgba(0, 210, 255, 0.25)';
    switch (status) {
      case 'Caries':
        return 'rgba(239, 68, 68, 0.15)';
      case 'Demineralization':
        return 'rgba(245, 158, 11, 0.15)';
      case 'Periapical':
        return 'rgba(168, 85, 247, 0.15)';
      case 'Restoration':
        return 'rgba(0, 210, 255, 0.12)';
      case 'Impacted':
        return 'rgba(59, 130, 246, 0.15)';
      default:
        return 'rgba(15, 23, 42, 0.6)';
    }
  };

  const renderTooth = (num) => {
    const data = defaultToothFindings[num] || { status: 'Sound', name: `Tooth #${num}` };
    const isSelected = selectedTooth === num;
    const color = getStatusColor(data.status);
    const bg = getStatusBg(data.status, isSelected);
    const hasPathology = data.status !== 'Sound';

    return (
      <button
        key={num}
        onClick={() => setSelectedTooth(isSelected ? null : num)}
        style={{
          width: '44px',
          height: '62px',
          padding: '4px',
          borderRadius: '8px',
          border: isSelected ? '2px solid #00d2ff' : `1px solid ${color}`,
          backgroundColor: bg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.15s ease',
          boxShadow: isSelected ? '0 0 12px rgba(0, 210, 255, 0.5)' : hasPathology ? `0 0 8px ${color}33` : 'none',
        }}
        title={`${num} - ${data.name}: ${data.status}`}
      >
        <span style={{ fontSize: '10px', fontWeight: '700', color: isSelected ? '#00d2ff' : '#94a3b8' }}>
          #{num}
        </span>

        {/* Anatomic Tooth Crown Graphic */}
        <div style={{ position: 'relative', width: '22px', height: '26px' }}>
          <svg viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            {/* Tooth Crown & Root Outline */}
            <path
              d="M4 8C4 4 7 2 12 2C17 2 20 4 20 8C20 12 19 18 16 26C15 27 13.5 25 12 21C10.5 25 9 27 8 26C5 18 4 12 4 8Z"
              fill={hasPathology ? `${color}33` : 'rgba(255, 255, 255, 0.08)'}
              stroke={color}
              strokeWidth="1.5"
            />
            {/* Occlusal fissure line */}
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
                boxShadow: `0 0 6px ${color}`,
              }}
            />
          )}
        </div>

        <span
          style={{
            fontSize: '8.5px',
            fontWeight: '600',
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

  const selectedData = selectedTooth ? defaultToothFindings[selectedTooth] : null;

  return (
    <div
      className="glass-card"
      style={{
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        border: '1px solid var(--border-glass)',
        backgroundColor: 'var(--bg-dark-card)',
        borderRadius: '16px',
      }}
    >
      {/* Header with Title, Arch Filter, and Finding Counters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 210, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 210, 255, 0.3)',
            }}
          >
            <Sparkles size={16} color="var(--primary-teal)" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              Adult Clinical Teeth Chart (FDI Odontogram)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
              Interactive 32-tooth dental arch with AI-synchronized pathological detections
            </p>
          </div>
        </div>

        {/* View Switchers */}
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
          backgroundColor: 'rgba(4, 8, 23, 0.6)',
          borderRadius: '12px',
          border: '1px solid rgba(0, 210, 255, 0.1)',
        }}
      >
        {/* UPPER JAW (Maxilla) */}
        {(filterArch === 'ALL' || filterArch === 'UPPER') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.8px', color: '#00d2ff', textTransform: 'uppercase' }}>
              Maxillary Arch (Upper Jaw)
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
              Mandibular Arch (Lower Jaw)
            </div>
          </div>
        )}
      </div>

      {/* Selected Tooth Detail Banner / Quick Action Card */}
      {selectedTooth && selectedData && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 18px',
            borderRadius: '10px',
            backgroundColor: 'rgba(10, 17, 36, 0.9)',
            border: `1px solid ${getStatusColor(selectedData.status)}`,
            boxShadow: `0 4px 16px ${getStatusColor(selectedData.status)}26`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
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
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                {selectedData.finding ? `${selectedData.finding} • Confidence: ${selectedData.confidence}` : 'No pathological findings. Anatomic crown & roots within normal limits.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => navigate('/workspace')}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              <span>View in AI Radiograph</span>
              <ArrowRight size={14} />
            </button>
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

      {/* Clinical Legend Footnote */}
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
        <span style={{ fontWeight: '600' }}>Clinical Legend:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }} />
            <span>Sound / Healthy (28)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <span style={{ color: '#ef4444' }}>Caries (2)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <span style={{ color: '#f59e0b' }}>Demineralization (1)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7' }} />
            <span style={{ color: '#a855f7' }}>Periapical (1)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00d2ff' }} />
            <span style={{ color: '#00d2ff' }}>Restoration (2)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
            <span style={{ color: '#3b82f6' }}>Impacted (1)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
