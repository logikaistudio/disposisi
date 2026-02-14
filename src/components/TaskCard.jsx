import React from 'react';
import { Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './TaskCard.css';

const TaskCard = ({ task, currentUser, onDelete }) => {
    const canDelete = currentUser?.role === 'admin' || currentUser?.role === 'superuser';

    return (
        <Link to={`/task/${task.id}`} className="task-card-link">
            <div className="task-card group">
                <div className="task-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={`task-status status-${task.status.toLowerCase().replace(' ', '')}`}>
                            {task.status}
                        </span>
                        <span className="task-date">
                            <Calendar size={14} />
                            {task.dueDate}
                        </span>
                    </div>
                    {canDelete && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDelete(task.id);
                            }}
                            className="delete-task-btn"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                display: 'flex'
                            }}
                            title="Hapus Tugas"
                            onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                <h3 className="task-title">{task.title}</h3>
                <p className="task-desc">{task.description}</p>

                <div className="task-footer">
                    <div className="task-meta">
                        <span className="meta-label">Dari:</span>
                        <span className="meta-value">{task.assignedBy}</span>
                    </div>
                    <ArrowRight size={18} className="icon-arrow" />
                </div>
            </div>
        </Link>
    );
};

export default TaskCard;
