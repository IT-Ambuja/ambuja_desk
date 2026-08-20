import React from 'react';

export const AttachmentBadge = ({ attachment, style = {} }) => {
    if (!attachment || String(attachment).toLowerCase() === 'nan' || String(attachment).trim() === '') {
        return <span style={{ color: 'var(--text-muted, #71717a)', fontSize: '10px' }}>-</span>;
    }

    const filename = String(attachment);
    const fileUrl = filename.startsWith('data:') || filename.startsWith('http') ? filename : `http://localhost:5001/uploads/${filename}`;
    const extMatch = filename.match(/\.(pdf|docx|doc|xlsx|xls|csv|jpg|jpeg|png|gif|webp)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';

    const handleDownload = (e) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePdfClick = (e) => {
        e.stopPropagation();
        window.open(fileUrl, '_blank');
    };

    if (ext === 'pdf') {
        return (
            <div
                onClick={handlePdfClick}
                title={`Open PDF in new tab: ${filename}`}
                style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '3px 8px', borderRadius: '4px', border: '1px solid #fca5a5',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444',
                    fontSize: '9px', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none',
                    lineHeight: '1.2', ...style
                }}
            >
                📄 PDF
            </div>
        );
    }

    if (['docx', 'doc'].includes(ext)) {
        return (
            <div
                onClick={handleDownload}
                title={`Download ${filename}`}
                style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '3px 8px', borderRadius: '4px', border: '1px solid #93c5fd',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#2563eb',
                    fontSize: '9px', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none',
                    lineHeight: '1.2', ...style
                }}
            >
                📝 {ext.toUpperCase()}
            </div>
        );
    }

    if (['xlsx', 'xls', 'csv'].includes(ext)) {
        return (
            <div
                onClick={handleDownload}
                title={`Download ${filename}`}
                style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '3px 8px', borderRadius: '4px', border: '1px solid #6ee7b7',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#059669',
                    fontSize: '9px', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none',
                    lineHeight: '1.2', ...style
                }}
            >
                📊 {ext.toUpperCase()}
            </div>
        );
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return (
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    window.open(fileUrl, '_blank');
                }}
                title={`View Image: ${filename}`}
                style={{ width: '24px', height: '24px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border, #cbd5e1)', cursor: 'pointer', margin: '0 auto', ...style }}
            >
                <img src={fileUrl} alt="Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
        );
    }

    return (
        <div
            onClick={handleDownload}
            title={`Download ${filename}`}
            style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1',
                backgroundColor: 'rgba(100, 116, 139, 0.15)', color: '#475569',
                fontSize: '9px', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none',
                lineHeight: '1.2', ...style
            }}
        >
            📎 {ext ? ext.toUpperCase() : 'FILE'}
        </div>
    );
};

export default AttachmentBadge;
