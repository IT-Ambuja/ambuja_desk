// frontend/src/components/DocumentPreview.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader2, FileText, AlertCircle } from 'lucide-react';
import axios from 'axios';

const DocumentPreview = ({ file, url, filename, onClose }) => {
    const actualName = filename || (file ? file.name : (url ? url.split('/').pop() : 'Document'));
    const downloadUrl = file ? URL.createObjectURL(file) : (url || `/uploads/${encodeURIComponent(actualName)}`);
    
    const extMatch = actualName.match(/\.(pdf|docx|doc|xlsx|xls|csv|jpg|jpeg|png|gif|webp)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    const isPdf = ext === 'pdf';

    const handleFileClick = (e) => {
        if (isPdf) {
            window.open(downloadUrl, '_blank');
        } else {
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = actualName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                width: '100%', maxWidth: '650px', backgroundColor: 'var(--bg-card, #ffffff)',
                borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', border: '1px solid var(--border, #cbd5e1)'
            }}>
                {/* HEADER */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 20px', borderBottom: '1px solid var(--border, #e4e4e7)',
                    backgroundColor: 'var(--bg-main, #f4f4f5)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <FileText size={20} color="#3b82f6" />
                        <span style={{ fontWeight: '600', color: 'var(--text-main, #18181b)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {actualName}
                        </span>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a'
                    }} title="Close Preview">
                        <X size={24} />
                    </button>
                </div>

                {/* CONTENT */}
                <div style={{ padding: '30px 24px', backgroundColor: 'var(--bg-card, #ffffff)', textAlign: 'center' }}>
                    {isImage ? (
                        <div style={{ maxHeight: '70vh', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img src={downloadUrl} alt={actualName} style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '6px' }} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '12px',
                                backgroundColor: isPdf ? 'rgba(239,68,68,0.1)' : ['docx','doc'].includes(ext) ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)',
                                border: `1px solid ${isPdf ? '#fca5a5' : ['docx','doc'].includes(ext) ? '#93c5fd' : '#6ee7b7'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '16px', fontWeight: 'bold',
                                color: isPdf ? '#ef4444' : ['docx','doc'].includes(ext) ? '#2563eb' : '#059669'
                            }}>
                                {ext ? ext.toUpperCase() : 'DOC'}
                            </div>

                            <div>
                                <h4
                                    onClick={handleFileClick}
                                    title="Click to download / view file"
                                    style={{
                                        margin: '0 0 8px 0', fontSize: '15px', fontWeight: '600',
                                        color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline',
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    📄 {actualName}
                                </h4>
                                <p style={{ margin: 0, fontSize: '12px', color: '#71717a' }}>
                                    Click the file name above or the button below to {isPdf ? 'view/download' : 'download'} this attachment.
                                </p>
                            </div>

                            <button
                                onClick={handleFileClick}
                                style={{
                                    marginTop: '8px', padding: '10px 24px', backgroundColor: '#3b82f6',
                                    color: '#ffffff', border: 'none', borderRadius: '6px',
                                    fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(59,130,246,0.3)',
                                    display: 'inline-flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                ⬇ Download {actualName}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentPreview;
