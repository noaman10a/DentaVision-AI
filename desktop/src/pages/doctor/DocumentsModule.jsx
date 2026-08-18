import React, { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { FolderOpen, Upload, Download, Trash2, Eye, File, Image, CheckCircle2 } from 'lucide-react';

const initialDocs = [
  { id: 1, name: 'BiteWing_XRay_UpperRight.png', size: '2.4 MB', date: '2026-08-10', type: 'image' },
  { id: 2, name: 'Panoramic_FullMouth_DICOM.dcm', size: '14.8 MB', date: '2026-08-10', type: 'dicom' },
  { id: 3, name: 'Medical_History_Intake.pdf', size: '450 KB', date: '2026-08-05', type: 'pdf' }
];

export const DocumentsModule = () => {
  const { activePatient } = usePatients();
  const [docs, setDocs] = useState(initialDocs);
  const [uploadMsg, setUploadMsg] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDoc = {
      id: Date.now(),
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      date: new Date().toISOString().split('T')[0],
      type: file.name.endsWith('.pdf') ? 'pdf' : 'image'
    };

    setDocs(prev => [newDoc, ...prev]);
    setUploadMsg(`Document "${file.name}" uploaded successfully!`);
    setTimeout(() => setUploadMsg(''), 3000);
  };

  const handleDelete = (id) => {
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FolderOpen size={24} color="var(--primary-teal)" />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Patient Documents Vault
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Store, view, download, and manage DICOM scans, intake forms, and records
            </p>
          </div>
        </div>

        {/* Upload Button */}
        <label className="btn-primary" style={{ cursor: 'pointer' }}>
          <Upload size={18} />
          <span>Upload Document / Scan</span>
          <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {uploadMsg && (
        <div className="badge badge-success" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{uploadMsg}</span>
        </div>
      )}

      {/* Documents Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {docs.map(doc => (
          <div key={doc.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--primary-teal-glow)' }}>
                {doc.type === 'image' ? <Image size={20} color="var(--primary-teal)" /> : <File size={20} color="var(--secondary-cyan)" />}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h5 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {doc.name}
                </h5>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{doc.size} • {doc.date}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
              <button
                onClick={() => setSelectedDoc(doc)}
                className="btn-secondary"
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                <Eye size={14} />
                <span>View</span>
              </button>

              <button
                onClick={() => alert(`Downloading ${doc.name}...`)}
                className="btn-secondary"
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                <Download size={14} />
                <span>Download</span>
              </button>

              <button
                onClick={() => handleDelete(doc.id)}
                style={{ background: 'none', border: 'none', color: 'var(--status-error)', cursor: 'pointer', padding: '4px' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Viewer Modal */}
      {selectedDoc && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px', color: 'var(--text-primary)' }}>Document Preview: {selectedDoc.name}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Size: {selectedDoc.size} • Date Uploaded: {selectedDoc.date}
            </p>
            <button className="btn-secondary" onClick={() => setSelectedDoc(null)} style={{ width: '100%' }}>
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
