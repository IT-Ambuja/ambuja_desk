import os

files = [
    'e:/ambuja_desk_3/frontend/src/pages/RequestorDashboard.jsx',
    'e:/ambuja_desk_3/frontend/src/pages/SolverDashboard.jsx'
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. State hook for advSeverity
    content = content.replace(
        "const [advStatus, setAdvStatus] = useState('');",
        "const [advStatus, setAdvStatus] = useState('');\n    const [advSeverity, setAdvSeverity] = useState('');"
    )

    # 2. tempFilters state initialization
    content = content.replace(
        "{ search: '', dept: '', location: '', issueCat: '', activityCat: '', assignedTo: '', status: '' }",
        "{ search: '', dept: '', location: '', issueCat: '', activityCat: '', assignedTo: '', status: '', severity: '' }"
    )
    content = content.replace(
        "{ search: '', dept: '', activityCat: '', issueCat: '', location: '', assignedTo: '', status: '' }",
        "{ search: '', dept: '', activityCat: '', issueCat: '', location: '', assignedTo: '', status: '', severity: '' }"
    )


    # 3. Modal Grid Column for Severity
    # We'll inject it right after the Status select block.
    status_block = """                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Status</label>
                                    <select className="form-control" style={{ fontSize: '12px', padding: '8px' }} value={tempFilters.status} onChange={e => setTempFilters({ ...tempFilters, status: e.target.value })}>
                                        <option value="">All Statuses</option>
                                        {[...new Set(myRequests.map(a => a.status).filter(Boolean))].sort().map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>"""
    
    status_block_solver = """                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Status</label>
                                    <select className="form-control" style={{ fontSize: '12px', padding: '8px' }} value={tempFilters.status} onChange={e => setTempFilters({...tempFilters, status: e.target.value})}>
                                        <option value="">All Statuses</option>
                                        {[...new Set(myTasks.map(a => a.status).filter(Boolean))].sort().map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>"""

    severity_block_req = """
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Severity</label>
                                    <select className="form-control" style={{ fontSize: '12px', padding: '8px' }} value={tempFilters.severity} onChange={e => setTempFilters({ ...tempFilters, severity: e.target.value })}>
                                        <option value="">All Severities</option>
                                        {[...new Set(myRequests.map(a => a.severity).filter(Boolean))].sort().map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>"""

    severity_block_solver = """
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Severity</label>
                                    <select className="form-control" style={{ fontSize: '12px', padding: '8px' }} value={tempFilters.severity} onChange={e => setTempFilters({...tempFilters, severity: e.target.value})}>
                                        <option value="">All Severities</option>
                                        {[...new Set(myTasks.map(a => a.severity).filter(Boolean))].sort().map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>"""

    if 'myRequests' in content:
        content = content.replace(status_block, status_block + severity_block_req)
    elif 'myTasks' in content:
        content = content.replace(status_block_solver, status_block_solver + severity_block_solver)


    # 4. Apply Filters
    content = content.replace(
        "setAdvStatus(tempFilters.status);",
        "setAdvStatus(tempFilters.status);\n                                    setAdvSeverity(tempFilters.severity);"
    )

    # 5. Clear & Reset
    content = content.replace(
        "setAdvStatus('');",
        "setAdvStatus('');\n                                    setAdvSeverity('');"
    )

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
