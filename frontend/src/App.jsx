import { useState, useEffect, useMemo } from 'react'
import Sidebar from './components/Sidebar'
import TodoItem from './components/TodoItem'
import AddTaskModal from './components/AddTaskModal'
import api from './api'

const TITLE_MAP = {
    All: 'All Tasks', Today: 'Today', Work: 'Work',
    Personal: 'Personal', Shopping: 'Shopping', Health: 'Health', Other: 'Other',
}

const normalizeTodos = (value) => Array.isArray(value) ? value : []

export default function App() {
    const [todos, setTodos] = useState([])
    const [activeCategory, setActiveCategory] = useState('All')
    const [filter, setFilter] = useState('All')     // All | Active | Completed
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('created')  // created | priority | due
    const [showModal, setShowModal] = useState(false)

    useEffect(() => { fetchTodos() }, [])

    const fetchTodos = async () => {
        try {
            const res = await api.get('/todos/')
            const data = normalizeTodos(res.data);
            setTodos(data);
        } catch (e) { 
            console.error('Failed to fetch todos:', e);
            setTodos([]);
        }
    }

    const handleAdd = async (formData) => {
        try {
            const res = await api.post('/todos/', formData)
            if (res?.data && typeof res.data === 'object') {
                setTodos(prev => [res.data, ...normalizeTodos(prev)])
            }
        } catch (e) { console.error(e) }
    }

    const handleToggle = async (id, completed) => {
        try {
            const res = await api.put(`/todos/${id}`, { completed: !completed })
            setTodos(prev => normalizeTodos(prev).map(t => t.id === id ? res.data : t))
        } catch (e) { console.error(e) }
    }

    const handleDelete = async (id) => {
        try {
            await api.delete(`/todos/${id}`)
            setTodos(prev => normalizeTodos(prev).filter(t => t.id !== id))
        } catch (e) { console.error(e) }
    }

    // Derived / filtered list
    const visible = useMemo(() => {
        const today = new Date().toISOString().split('T')[0]
        let list = [...todos]

        // Category filter
        if (activeCategory === 'Today')
            list = list.filter(t => t.due_date === today)
        else if (activeCategory !== 'All')
            list = list.filter(t => t.category === activeCategory)

        // Search
        if (search.trim())
            list = list.filter(t =>
                t.title.toLowerCase().includes(search.toLowerCase()) ||
                (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
            )

        // Status filter
        if (filter === 'Active') list = list.filter(t => !t.completed)
        if (filter === 'Completed') list = list.filter(t => t.completed)

        // Sort
        const pOrder = { high: 0, medium: 1, low: 2 }
        if (sortBy === 'priority')
            list.sort((a, b) => (pOrder[a.priority] ?? 1) - (pOrder[b.priority] ?? 1))
        else if (sortBy === 'due')
            list.sort((a, b) => {
                if (!a.due_date) return 1
                if (!b.due_date) return -1
                return a.due_date.localeCompare(b.due_date)
            })

        return list
    }, [todos, activeCategory, search, filter, sortBy])

    const total = normalizeTodos(todos).length
    const done = normalizeTodos(todos).filter(t => t.completed).length

    return (
        <div className="layout">
            {/* ── Sidebar ── */}
            <Sidebar
                todos={todos}
                activeCategory={activeCategory}
                onSelectCategory={cat => { setActiveCategory(cat); setFilter('All') }}
            />

            {/* ── Main ── */}
            <div className="main-panel">

                {/* Top bar */}
                <div className="topbar">
                    <h2>{TITLE_MAP[activeCategory] || activeCategory}</h2>

                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            placeholder="Search tasks..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="topbar-actions">
                        <button className="btn-primary" onClick={() => setShowModal(true)}>
                            + Add Task
                        </button>
                    </div>
                </div>

                {/* Filter row */}
                <div className="filter-row">
                    {['All', 'Active', 'Completed'].map(f => (
                        <button
                            key={f}
                            className={`filter-tab ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}

                    <select
                        className="sort-select"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                    >
                        <option value="created">Sort: Recent</option>
                        <option value="priority">Sort: Priority</option>
                        <option value="due">Sort: Due Date</option>
                    </select>
                </div>

                {/* Task list */}
                <div className="todo-body">
                    {visible.length === 0 ? (
                        <div className="empty-state">
                            <div className="big-icon">
                                {search ? '🔍' : filter === 'Completed' ? '🏆' : '✨'}
                            </div>
                            <h3>
                                {search
                                    ? 'No matching tasks'
                                    : filter === 'Completed'
                                        ? 'No completed tasks yet'
                                        : activeCategory === 'Today'
                                            ? 'Nothing due today!'
                                            : 'No tasks here'}
                            </h3>
                            <p>
                                {!search && filter !== 'Completed'
                                    ? 'Click "+ Add Task" to create one.'
                                    : ''}
                            </p>
                        </div>
                    ) : (
                        visible.map(todo => (
                            <TodoItem
                                key={todo.id}
                                todo={todo}
                                onToggle={() => handleToggle(todo.id, todo.completed)}
                                onDelete={() => handleDelete(todo.id)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <AddTaskModal
                    defaultCategory={activeCategory}
                    onClose={() => setShowModal(false)}
                    onAdd={handleAdd}
                />
            )}
        </div>
    )
}
