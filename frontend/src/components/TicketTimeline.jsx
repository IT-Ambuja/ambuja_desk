// frontend/src/components/TicketTimeline.jsx
import React, { useState } from 'react';
import { PlusCircle, RefreshCw, MessageSquare, CheckCircle, AlertOctagon, ArrowRightLeft, ChevronDown, ChevronRight, Download, Star, ShieldAlert } from 'lucide-react';
import AttachmentBadge from './AttachmentBadge';

const TicketTimeline = ({ logs = [] }) => {
    // --- COLLAPSE STATE ---
    const [isExpanded, setIsExpanded] = useState(true);

    // Helper to dynamically pick the right icon and color based on the EXACT actions in your CSV
    const getEventStyling = (action) => {
        const actionStr = String(action || '').toLowerCase();
        
        if (actionStr.includes('create')) 
            return { icon: <PlusCircle size={16} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' }; // Purple
            
        if (actionStr.includes('handover') || actionStr.includes('reassign')) 
            return { icon: <ArrowRightLeft size={16} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' }; // Blue
            
        if (actionStr.includes('status') || actionStr.includes('update')) 
            return { icon: <RefreshCw size={16} />, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.15)' }; // Light Blue
            
        if (actionStr.includes('rate')) 
            return { icon: <Star size={16} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' }; // Yellow
            
        if (actionStr.includes('manager') || actionStr.includes('override')) 
            return { icon: <ShieldAlert size={16} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' }; // Green
            
        if (actionStr.includes('escalation') || actionStr.includes('breach')) 
            return { icon: <AlertOctagon size={16} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' }; // Red
        
        // Default Fallback
        return { icon: <MessageSquare size={16} />, color: '#a1a1aa', bg: 'rgba(161, 161, 170, 0.15)' }; 
    };

    // --- CSV EXPORT ENGINE ---
    const handleDownloadCSV = (e) => {
        e.stopPropagation(); 
        if (!logs || logs.length === 0) return;
        
        const headers = ['timestamp', 'ticket_id', 'user', 'action', 'details', 'remarks'];
        const csvRows = [headers.join(',')];
        
        for (const log of logs) {
            const values = headers.map(header => {
                const val = log[header] !== null && log[header] !== undefined ? log[header] : '';
                const escaped = ('' + val).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const tId = logs[0]?.ticket_id || 'Audit';
        link.setAttribute('download', `Ticket_${tId}_Logs.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Robust checker to ignore 'NaN', 'None', 'null' string literals from Pandas
    const isValidString = (str) => {
        if (!str) return false;
        const clean = String(str).trim().toLowerCase();
        return clean !== '' && clean !== 'nan' && clean !== 'null' && clean !== 'none';
    };

    if (!logs || logs.length === 0) {
        return (
            <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid rgba(161, 161, 170, 0.2)', textAlign: 'center', color: '#71717a', fontSize: '13px' }}>
                No audit logs available for this ticket yet.
            </div>
        );
    }

    return (
        <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid rgba(161, 161, 170, 0.2)' }}>
            
            {/* COLLAPSIBLE HEADER & DOWNLOAD BUTTON */}
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    cursor: 'pointer', marginBottom: isExpanded ? '20px' : '0',
                    padding: '4px 0', userSelect: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa' }}>
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <h4 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Ticket Audit Trail
                    </h4>
                </div>
                
                <button 
                    onClick={handleDownloadCSV}
                    style={{ 
                        background: '#3b82f6', border: 'none', borderRadius: '6px', 
                        color: '#ffffff', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', 
                        fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s',
                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    title="Download full timeline history as CSV"
                >
                    <Download size={16} /> Download Timeline (CSV)
                </button>
            </div>
            
            {/* TIMELINE CONTENT */}
            {isExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative', marginTop: '15px' }}>
                    <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '20px', width: '2px', backgroundColor: 'rgba(161, 161, 170, 0.2)' }}></div>
                    
                    {logs.map((log, index) => {
                        const style = getEventStyling(log.action);
                        const isLast = index === logs.length - 1;
                        
                        const hasDetails = isValidString(log.details);
                        const hasRemarks = isValidString(log.remarks);
                        
                        return (
                            <div key={index} style={{ display: 'flex', gap: '15px', position: 'relative', paddingBottom: isLast ? '0' : '20px' }}>
                                
                                {/* Icon Node */}
                                <div style={{ 
                                    width: '32px', height: '32px', borderRadius: '50%', 
                                    backgroundColor: style.bg, color: style.color, 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    zIndex: 1, border: `2px solid rgba(161, 161, 170, 0.1)`,
                                    flexShrink: 0
                                }}>
                                    {style.icon}
                                </div>
                                
                                {/* Log Content */}
                                <div style={{ paddingTop: '5px', flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '800', fontSize: '13px', color: style.color }}>
                                            {log.action || 'System Action'}
                                        </span>
                                        <span style={{ fontSize: '11px', color: '#71717a', fontWeight: '500' }}>
                                            {log.timestamp?.split(' ')[0]}
                                        </span>
                                    </div>
                                    
                                    {/* FIX: Inherit color so it perfectly matches Dark/Light mode */}
                                    <div style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: '500' }}>
                                        By: <span style={{ color: 'inherit', fontWeight: '700' }}>{log.user_id || log.user || 'System'}</span>
                                    </div>
                                    
                                    {/* FIX: Use translucent gray background and inherit color for text readability in all modes */}
                                    <div style={{ fontSize: '13px', color: 'inherit', lineHeight: '1.5', backgroundColor: 'rgba(128, 128, 128, 0.1)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(128, 128, 128, 0.2)' }}>
                                        {hasDetails && (
                                            <div style={{ marginBottom: hasRemarks ? '8px' : '0' }}>
                                                <strong style={{ color: '#9ca3af' }}>Details:</strong> {log.details}
                                            </div>
                                        )}
                                        {hasRemarks && (
                                            <div>
                                                <strong style={{ color: '#9ca3af' }}>Remarks:</strong> {log.remarks}
                                            </div>
                                        )}
                                        
                                        {log.attachment && String(log.attachment).toLowerCase() !== 'nan' && String(log.attachment).trim() !== '' && (
                                            <div
                                                style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(128,128,128,0.3)', cursor: 'pointer', position: 'relative', marginTop: '8px' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const fileUrl = String(log.attachment).startsWith('data:') || String(log.attachment).startsWith('http') ? String(log.attachment) : `http://localhost:5001/uploads/${log.attachment}`;
                                                    const extMatch = String(log.attachment).match(/\.(pdf|docx|doc|xlsx|xls|csv|jpg|jpeg|png|gif|webp)$/i);
                                                    const ext = extMatch ? extMatch[1].toLowerCase() : '';
                                                    if (ext === 'pdf') {
                                                        window.open(fileUrl, '_blank');
                                                    } else if (['docx', 'doc', 'xlsx', 'xls', 'csv'].includes(ext)) {
                                                        const link = document.createElement('a');
                                                        link.href = fileUrl;
                                                        link.download = String(log.attachment);
                                                        link.target = '_blank';
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                    } else {
                                                        window.open(fileUrl, '_blank');
                                                    }
                                                }}
                                                title={`Click to ${String(log.attachment).match(/\.(xlsx|xls|doc|docx|csv)$/i) ? 'download' : 'view'} ${log.attachment}`}
                                            >
                                                {String(log.attachment).match(/\.(xlsx|xls|doc|docx|pdf|csv)$/i) ? (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                                        <FileText size={18} color={String(log.attachment).match(/\.pdf$/i) ? '#ef4444' : '#3b82f6'} />
                                                        <span style={{ fontSize: '7px', fontWeight: 'bold', color: String(log.attachment).match(/\.pdf$/i) ? '#ef4444' : '#3b82f6' }}>
                                                            {String(log.attachment).split('.').pop().toUpperCase()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <img src={String(log.attachment).startsWith('data:') || String(log.attachment).startsWith('http') ? String(log.attachment) : `http://localhost:5001/uploads/${log.attachment}`} alt="Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                                )}
                                            </div>
                                        )}
                                        
                                        {!hasDetails && !hasRemarks && (!log.attachment || String(log.attachment).toLowerCase() === 'nan') && (
                                            <div style={{ color: '#71717a', fontStyle: 'italic' }}>System recorded this event automatically.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TicketTimeline;