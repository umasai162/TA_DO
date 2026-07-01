const CATEGORIES = [
    { id: 'All', icon: '🏠', label: 'All Tasks' },
    { id: 'Today', icon: '⭐', label: 'Today' },
    { id: 'Work', icon: '💼', label: 'Work' },
    { id: 'Personal', icon: '👤', label: 'Personal' },
    { id: 'Shopping', icon: '🛒', label: 'Shopping' },
    { id: 'Health', icon: '💪', label: 'Health' },
    { id: 'Other', icon: '📌', label: 'Other' },
]

function Sidebar({ todos, activeCategory, onSelectCategory }) {
    const safeTodos = Array.isArray(todos) ? todos : []
    const total = safeTodos.length
    const done = safeTodos.filter(t => t.completed).length
    const pct = total === 0 ? 0 : Math.round((done / total) * 100)

    function countFor(catId) {
        if (catId === 'All') return safeTodos.length
        if (catId === 'Today') {
            const today = new Date().toISOString().split('T')[0]
            return safeTodos.filter(t => t.due_date === today).length
        }
        return safeTodos.filter(t => t.category === catId).length
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">✅</div>
                <span>TaskFlow</span>
            </div>

            <div className="sidebar-section-title">Menu</div>

            {CATEGORIES.map(cat => (
                <div
                    key={cat.id}
                    className={`sidebar-item ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => onSelectCategory(cat.id)}
                >
                    <span className="icon">{cat.icon}</span>
                    <span>{cat.label}</span>
                    {countFor(cat.id) > 0 && (
                        <span className="badge">{countFor(cat.id)}</span>
                    )}
                </div>
            ))}

            <div className="sidebar-progress">
                <div className="progress-label">
                    <span>Overall Progress</span>
                    <span>{pct}%</span>
                </div>
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
