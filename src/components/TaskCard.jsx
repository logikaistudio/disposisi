import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './TaskCard.css';

const TaskCard = ({ task }) => {
    return (
        <Link to={`/task/${task.id}`} className="task-card-link">
            <div className="task-card">
                <div className="task-header">
                    <span className={`task-status status-${task.status.toLowerCase().replace(' ', '')}`}>
                        {task.status}
                    </span>
                    <span className="task-date">
                        <Calendar size={14} />
                        {task.dueDate}
                    </span>
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
