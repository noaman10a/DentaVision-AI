import React, { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { 
  FolderOpen, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  File, 
  Image as ImageIcon, 
  CheckCircle2, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  FileText,
  Calendar,
  HardDrive
} from 'lucide-react';

const defaultDocs = [
  { 
    id: 1, 
    name: 'BiteWing_XRay_UpperRight.png', 
    size: '2.4 MB', 
    date: '2026-08-10', 
    type: 'image',
    url: '/sample_xray.png',
    description: 'High-resolution digital bitewing radiograph of right posterior quadrant.'
  },
  { 
    id: 2, 
    name: 'Panoramic_FullMouth_OPG.png', 
    size: '14.8 MB', 
    date: '2026-08-10', 
    type: 'image',
    url: '/sample_xray.png',
    description: 'Orthopantomogram (OPG) full-mouth scan for dental arch analysis.'
  },
  { 
    id: 3, 
    name: 'Medical_History_Intake.pdf', 
    size: '450 KB', 
    date: '2026-08-05', 
    type: 'pdf',
    description: 'Initial intake questionnaire, systemic health questionnaire & signed consent.'
  }
];

export const DocumentsModule = () => {
  const { activePatient } = usePatients();
  const [docs, setDocs] = useState(() => {
    if (activePatient?.documents?.length > 0) {
      return [...activePatient.documents, ...defaultDocs];
    }
    return defaultDocs;
  });
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(file.name);
    const objectUrl = URL.createObjectURL(file);

    const newDoc = {
      id: Date.now(),
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      date: new Date().toISOString().split('T')[0],
      type: isPdf ? 'pdf' : 'image',
      url: objectUrl,
      description: `Uploaded from local storage on ${new Date().toLocaleDateString()}`
    };

    setDocs(prev => [newDoc, ...prev]);
    setFeedbackMsg(`Document "${file.name}" uploaded to patient vault!`);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleDelete = (id) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    setFeedbackMsg('Document removed from current view.');
    setTimeout(() => setFeedbackMsg(''), 2500);
  };

  const handleDownload = (doc) => {
    try {
      if (doc.url) {
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Generate formatted text/data download for clinical records without binary file URL
        const content = [
          '========================================================================',
          'DENTAVISION AI - CLINICAL VAULT EXPORT',
          '========================================================================',
          `Document:   ${doc.name}`,
          `Category:   ${doc.type?.toUpperCase() || 'CLINICAL'}`,
          `Patient:    ${activePatient?.name || 'Amina Rahmani'} (${activePatient?.id || 'PT-2026-0705'})`,
          `Record Date: ${doc.date}`,
          `File Size:  ${doc.size}`,
          `Attending:  Dr. Twahir Mohammed (DCI-KA-2021-08491)`,
          '------------------------------------------------------------------------',
          'Clinical Attestation:',
          doc.description || 'Verified in local clinic PACS archive and audit trail.',
          '========================================================================'
        ].join('\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = doc.name.replace(/\.[^/.]+$/, '') + '_Export.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
      setFeedbackMsg(`Downloading "${doc.name}" to your local downloads folder...`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      console.error('Download error:', err);
      setFeedbackMsg(`Failed to initiate download for ${doc.name}`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    }
  };

  const openViewer = (doc) => {
    setSelectedDoc(doc);
    setZoomLevel(1);
    setRotation(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FolderOpen size={24} color="var(--primary-teal)" />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Patient Documents & Radiographs Vault
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Patient: <strong>{activePatient?.name || 'Unassigned'}</strong> • Store, view, and download radiographs, DICOM scans, and intake forms
            </p>
          </div>
        </div>

        {/* Upload Button */}
        <label className="btn-primary" style={{ cursor: 'pointer' }}>
          <Upload size={18} />
          <span>Upload Document / Scan</span>
          <input type="file" onChange={handleFileUpload} accept="image/*,.pdf,.dcm" style={{ display: 'none' }} />
        </label>
      </div>

      {feedbackMsg && (
        <div className="badge badge-success fade-in" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
          <CheckCircle2 size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Documents Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {docs.map(doc => (
          <div key={doc.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div 
                style={{ 
                  padding: '12px', 
                  borderRadius: '10px', 
                  backgroundColor: doc.type === 'image' ? 'var(--primary-teal-glow)' : 'var(--btn-secondary-bg)',
                  border: '1px solid var(--border-glass)',
                  flexShrink: 0
                }}
              >
                {doc.type === 'image' ? (
                  <ImageIcon size={22} color="var(--primary-teal)" />
                ) : (
                  <FileText size={22} color="var(--secondary-cyan)" />
                )}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <h5 
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: 'var(--text-primary)', 
                    whiteSpace: 'nowrap', 
                    textOverflow: 'ellipsis', 
                    overflow: 'hidden' 
                  }}
                  title={doc.name}
                >
                  {doc.name}
                </h5>
                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>{doc.date}</span>
                </div>
                {doc.description && (
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                    {doc.description}
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => openViewer(doc)}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Eye size={14} />
                  <span>View</span>
                </button>

                <button
                  onClick={() => handleDownload(doc)}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-teal)', borderColor: 'var(--primary-teal)' }}
                  title="Download actual file to disk"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              </div>

              <button
                onClick={() => handleDelete(doc.id)}
                style={{ background: 'none', border: 'none', color: 'var(--status-error)', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}
                title="Remove file"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive File Previewer Modal */}
      {selectedDoc && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            backgroundColor: 'rgba(15, 23, 42, 0.85)', 
            backdropFilter: 'blur(6px)',
            zIndex: 100, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '24px' 
          }}
          onClick={() => setSelectedDoc(null)}
        >
          <div 
            className="glass-card" 
            style={{ 
              maxWidth: '820px', 
              width: '100%', 
              maxHeight: '90vh',
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              border: '1px solid var(--border-accent)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {selectedDoc.type === 'image' ? <ImageIcon size={20} color="var(--primary-teal)" /> : <FileText size={20} color="var(--secondary-cyan)" />}
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {selectedDoc.name}
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Size: {selectedDoc.size} • Uploaded: {selectedDoc.date}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => handleDownload(selectedDoc)}
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  <Download size={14} />
                  <span>Download File</span>
                </button>
                <button
                  onClick={() => setSelectedDoc(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Viewer Body */}
            <div 
              style={{ 
                flex: 1, 
                minHeight: '360px', 
                backgroundColor: '#0a0f1d', 
                borderRadius: '8px', 
                border: '1px solid var(--border-glass)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                padding: '16px'
              }}
            >
              {selectedDoc.type === 'image' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', justifyContent: 'center' }}>
                  <img
                    src={selectedDoc.url || '/sample_xray.png'}
                    alt={selectedDoc.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '400px',
                      objectFit: 'contain',
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease',
                      borderRadius: '4px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}
                  />
                  {/* Floating Controls for Image */}
                  <div 
                    style={{ 
                      position: 'absolute', 
                      bottom: '16px', 
                      display: 'flex', 
                      gap: '8px', 
                      backgroundColor: 'rgba(15, 23, 42, 0.85)', 
                      padding: '6px 12px', 
                      borderRadius: '20px',
                      border: '1px solid var(--border-glass)'
                    }}
                  >
                    <button 
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
                      style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Zoom In"
                    >
                      <ZoomIn size={16} />
                    </button>
                    <button 
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                      style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Zoom Out"
                    >
                      <ZoomOut size={16} />
                    </button>
                    <button 
                      onClick={() => setRotation(prev => (prev + 90) % 360)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Rotate 90°"
                    >
                      <RotateCw size={16} />
                    </button>
                    <span style={{ fontSize: '11px', color: 'var(--primary-teal)', alignSelf: 'center', marginLeft: '4px' }}>
                      {Math.round(zoomLevel * 100)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 16px', maxWidth: '480px' }}>
                  <FileText size={48} color="var(--primary-teal)" style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {selectedDoc.name}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                    {selectedDoc.description || 'Verified clinical document in DentaVision archive.'}
                  </p>
                  <div style={{ display: 'inline-flex', gap: '10px' }}>
                    <button 
                      onClick={() => handleDownload(selectedDoc)} 
                      className="btn-primary"
                    >
                      <Download size={16} />
                      <span>Download Clean Document</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setSelectedDoc(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
