import React, { useState, useEffect, useMemo } from 'react';
import { Zap, ChevronDown, Check, Save, Trash2, Plus } from 'lucide-react';
import { fetchCannedResponses, createCannedResponse, deleteCannedResponse } from '../api';

const DEFAULT_TEMPLATES = [
    { label: 'Issue Resolved & Tested', text: 'Issue resolved & tested successfully. Working as expected.' },
    { label: 'Equipment Replaced', text: 'Part/equipment replaced and recalibrated. Verified operational.' },
    { label: 'Access Provided', text: 'Access credentials and permissions updated. User verified access.' },
    { label: 'Site Cleared', text: 'Site inspection completed and physical obstruction cleared.' },
    { label: 'Awaiting Diagnostic Info', text: 'Inspected issue. Contacted requestor for additional diagnostic details.' },
    { label: 'Material/Part Ordered', text: 'Required material/part has been ordered. Delivery pending.' },
    { label: 'Specialized Expertise Needed', text: 'Handover requested: Requires specialized department technical expertise.' },
    { label: 'Site Access Hold', text: 'Ticket placed on hold pending site access clearance.' },
    { label: 'Duplicate Ticket', text: 'Declined: Duplicate ticket raised for an existing active issue.' }
];

const CannedResponseSelector = ({ onSelect, currentText = '', user = null }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [pgTemplates, setPgTemplates] = useState([]);
    const [savedNotice, setSavedNotice] = useState(false);

    // Load templates from PostgreSQL API on mount
    const fetchPgTemplates = async () => {
        try {
            const data = await fetchCannedResponses();
            setPgTemplates(data);
        } catch (e) {
            console.error("Failed to load canned responses", e);
        }
    };

    useEffect(() => {
        fetchPgTemplates();
    }, []);

    // Combine PostgreSQL templates and DEFAULT_TEMPLATES fallback if DB empty
    const allTemplates = useMemo(() => {
        if (pgTemplates.length > 0) return pgTemplates;
        return DEFAULT_TEMPLATES;
    }, [pgTemplates]);

    // Live filter templates based on what the user is typing
    const filteredTemplates = useMemo(() => {
        const query = String(currentText || '').trim().toLowerCase();
        if (!query) return allTemplates;

        return allTemplates.filter(tpl =>
            (tpl.label || '').toLowerCase().includes(query) ||
            (tpl.text || '').toLowerCase().includes(query)
        );
    }, [allTemplates, currentText]);

    const handleApply = (tpl) => {
        onSelect(tpl.text);
        setSelectedLabel(tpl.label);
        setIsOpen(false);
        setTimeout(() => setSelectedLabel(null), 2000);
    };

    const handleSaveCustom = async () => {
        const trimmed = String(currentText || '').trim();
        if (!trimmed) return;

        const titlePrompt = window.prompt("Enter a title for this new canned template:", trimmed.slice(0, 25) + "...");
        if (!titlePrompt || !titlePrompt.trim()) return;

        try {
            let activeUser = user;
            if (!activeUser) {
                try { activeUser = JSON.parse(sessionStorage.getItem('ticket_user')); } catch (err) {}
            }
            const creatorIdentifier = activeUser ? (activeUser.email || activeUser.employee_id) : 'User';
            await createCannedResponse({
                label: titlePrompt.trim(),
                text: trimmed,
                created_by: creatorIdentifier,
                role: activeUser?.role || 'User'
            });
            await fetchPgTemplates();
            setSavedNotice(true);
            setTimeout(() => setSavedNotice(false), 2500);
        } catch (e) {
            alert(e.response?.data?.error || "Failed to save template.");
        }
    };

    const handleDeleteCustom = async (id, label, e) => {
        e.stopPropagation();
        if (!window.confirm(`Delete custom template "${label}"?`)) return;
        try {
            await deleteCannedResponse(id);
            await fetchPgTemplates();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete template");
        }
    };

    const matchCount = filteredTemplates.length;
    const isTyping = Boolean(currentText && currentText.trim().length > 0);

    return (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: '6px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    title="Select a pre-defined canned remark template"
                    style={{
                        backgroundColor: isTyping && matchCount > 0 ? 'rgba(16, 185, 129, 0.18)' : 'rgba(59, 130, 246, 0.15)',
                        color: isTyping && matchCount > 0 ? '#059669' : '#2563eb',
                        border: isTyping && matchCount > 0 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)',
                        borderRadius: '4px',
                        padding: '2px 7px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        lineHeight: '1.2'
                    }}
                >
                    <Zap size={10} color={isTyping && matchCount > 0 ? '#059669' : '#2563eb'} />
                    <span>
                        {isTyping ? `Templates (${matchCount})` : 'Templates'}
                    </span>
                    <ChevronDown size={10} />
                </button>

                {isTyping && (
                    <button
                        type="button"
                        onClick={handleSaveCustom}
                        title="Save typed text as a custom canned template"
                        style={{
                            backgroundColor: 'rgba(245, 158, 11, 0.18)',
                            color: '#d97706',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            borderRadius: '4px',
                            padding: '2px 7px',
                            fontSize: '9px',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            lineHeight: '1.2'
                        }}
                    >
                        <Save size={10} color="#d97706" />
                        <span>Save as Template</span>
                    </button>
                )}

                {selectedLabel && (
                    <span style={{ fontSize: '9px', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <Check size={9} /> Applied!
                    </span>
                )}

                {savedNotice && (
                    <span style={{ fontSize: '9px', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <Check size={9} /> Saved to DB!
                    </span>
                )}
            </div>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 2000,
                        width: '280px',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        backgroundColor: 'var(--bg-card, #18181b)',
                        border: '1px solid var(--border, #3f3f46)',
                        borderRadius: '6px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                        padding: '4px 0',
                        marginTop: '4px'
                    }}
                >
                    <div style={{ padding: '4px 8px', fontSize: '9px', fontWeight: 'bold', color: '#a1a1aa', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>⚡ {isTyping ? `Matching Templates (${matchCount})` : 'Select Canned Remark'}</span>
                        {isTyping && <span style={{ fontSize: '8px', color: '#3b82f6' }}>Live Filtering</span>}
                    </div>

                    {filteredTemplates.length === 0 ? (
                        <div style={{ padding: '8px', fontSize: '10px', color: '#71717a', textAlign: 'center' }}>
                            No matching templates. Type in remark box to save as custom template!
                        </div>
                    ) : (
                        filteredTemplates.map((tpl, idx) => {
                            const isUserCustom = Boolean(tpl.is_custom ?? tpl.isCustom);
                            return (
                                <div
                                    key={tpl.id || idx}
                                    onClick={() => handleApply(tpl)}
                                    style={{
                                        padding: '6px 10px',
                                        fontSize: '10px',
                                        cursor: 'pointer',
                                        borderBottom: idx < filteredTemplates.length - 1 ? '1px solid var(--border)' : 'none',
                                        transition: 'background-color 0.15s',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)'; }}
                                    onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 'bold', color: isUserCustom ? '#f59e0b' : 'var(--text-main, #fff)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {isUserCustom && <span style={{ fontSize: '8px', backgroundColor: 'rgba(245,158,11,0.2)', color: '#f59e0b', padding: '1px 4px', borderRadius: '3px', fontWeight: 'bold' }}>Custom</span>}
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tpl.label}</span>
                                        </div>
                                        <div style={{ fontSize: '9px', color: '#a1a1aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                                            {tpl.text}
                                        </div>
                                    </div>

                                    {/* Sleek Delete button strictly for user custom templates */}
                                    {isUserCustom && tpl.id && (
                                        <button
                                            type="button"
                                            onClick={(e) => handleDeleteCustom(tpl.id, tpl.label, e)}
                                            title="Delete this custom template"
                                            style={{
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                padding: '3px 4px',
                                                borderRadius: '3px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                opacity: 0.8,
                                                transition: 'opacity 0.15s, background-color 0.15s'
                                            }}
                                            onMouseOver={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'; }}
                                            onMouseOut={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        >
                                            <Trash2 size={11} />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default CannedResponseSelector;
