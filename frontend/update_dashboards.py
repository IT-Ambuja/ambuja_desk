import os

# Files to modify
files = [
    'e:/ambuja_desk_3/frontend/src/pages/AdminDashboard.jsx',
    'e:/ambuja_desk_3/frontend/src/pages/ViewerDashboard.jsx',
    'e:/ambuja_desk_3/frontend/src/pages/SolverDashboard.jsx',
    'e:/ambuja_desk_3/frontend/src/pages/SuperAdminDashboard.jsx',
    'e:/ambuja_desk_3/frontend/src/pages/RequestorDashboard.jsx'
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. State hook for advAgeingSeverity
    content = content.replace(
        "const [advAgeingLevel, setAdvAgeingLevel] = useState('');",
        "const [advAgeingLevel, setAdvAgeingLevel] = useState('');\n    const [advAgeingSeverity, setAdvAgeingSeverity] = useState('');"
    )

    # 2. tempFilters state initialization
    content = content.replace(
        "{ search: '', dept: '', status: '', location: '', issueCat: '', level: '' }",
        "{ search: '', dept: '', status: '', location: '', issueCat: '', level: '', severity: '' }"
    )

    # 3. Filtering logic
    content = content.replace(
        "        const matchIssueCat = !advAgeingIssueCat || (a.issue_category && a.issue_category.toLowerCase() === advAgeingIssueCat.toLowerCase());\n\n        return matchBasic && matchDept && matchStatus && matchLevel && matchLocation && matchIssueCat;",
        "        const matchIssueCat = !advAgeingIssueCat || (a.issue_category && a.issue_category.toLowerCase() === advAgeingIssueCat.toLowerCase());\n        const matchSeverity = !advAgeingSeverity || (a.severity && a.severity.toLowerCase() === advAgeingSeverity.toLowerCase());\n\n        return matchBasic && matchDept && matchStatus && matchLevel && matchLocation && matchIssueCat && matchSeverity;"
    )

    # 4. Modal Grid Column
    content = content.replace(
        """                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Escalation Level</label>
                                    <select className="form-control" style={{ fontSize: '13px', padding: '8px' }} value={tempFilters.level} onChange={e => setTempFilters({...tempFilters, level: e.target.value})}>
                                        <option value="">All Levels</option>
                                        {[...new Set(ageingData.map(a => a.escalation_level).filter(Boolean))].sort().map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>""",
        """                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Escalation Level</label>
                                    <select className="form-control" style={{ fontSize: '13px', padding: '8px' }} value={tempFilters.level} onChange={e => setTempFilters({...tempFilters, level: e.target.value})}>
                                        <option value="">All Levels</option>
                                        {[...new Set(ageingData.map(a => a.escalation_level).filter(Boolean))].sort().map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Severity</label>
                                    <select className="form-control" style={{ fontSize: '13px', padding: '8px' }} value={tempFilters.severity} onChange={e => setTempFilters({...tempFilters, severity: e.target.value})}>
                                        <option value="">All Severities</option>
                                        {[...new Set(ageingData.map(a => a.severity).filter(Boolean))].sort().map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>"""
    )

    # 5. Apply Filters
    content = content.replace(
        """                                    setAdvAgeingLevel(tempFilters.level);
                                    setShowAdvancedAgeing(true);""",
        """                                    setAdvAgeingLevel(tempFilters.level);
                                    setAdvAgeingSeverity(tempFilters.severity);
                                    setShowAdvancedAgeing(true);"""
    )

    # 6. Clear & Reset
    content = content.replace(
        """                                    setAdvAgeingLevel('');
                                    setShowAdvancedAgeing(false);""",
        """                                    setAdvAgeingLevel('');
                                    setAdvAgeingSeverity('');
                                    setShowAdvancedAgeing(false);"""
    )

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
