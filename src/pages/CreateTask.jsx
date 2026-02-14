import React, { useState, useEffect } from 'react';
import { Upload, X, ArrowLeft, Paperclip, Loader2, Plus, Users, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sql } from '../lib/db';
import './CreateTask.css';

const CreateTask = () => {
    const navigate = useNavigate();

    // Task Rows State: [{ id, title, assigneeId, assigneeType, deadline }]
    const [taskRows, setTaskRows] = useState([
        { id: 1, title: '', assigneeDesc: '', deadline: '' }
    ]);

    const [desc, setDesc] = useState('');
    const [refNo, setRefNo] = useState('');
    const [docDate, setDocDate] = useState('');
    const [sender, setSender] = useState('');
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Assignees List (Departments + Users)
    const [assignees, setAssignees] = useState([]);

    useEffect(() => {
        const fetchAssignees = async () => {
            try {
                // Fetch Departments (Hardcoded) + Users (From DB) if needed
                // For simplicity, let's mix users and dept
                // Actually, let's just use departments for now, plus specific users from DB
                const result = await sql`SELECT id, name, department, role FROM users WHERE id != 1`; // exclude self

                const userOptions = result.map(u => ({
                    value: `user:${u.id}`,
                    label: `${u.name} (${u.department})`,
                    type: 'user',
                    dept: u.department
                }));

                const deptOptions = [
                    { value: 'dept:Finance', label: 'Departemen Keuangan', type: 'dept', dept: 'Finance' },
                    { value: 'dept:Marketing', label: 'Departemen Pemasaran', type: 'dept', dept: 'Marketing' },
                    { value: 'dept:IT', label: 'Departemen IT', type: 'dept', dept: 'IT' },
                    { value: 'dept:HR', label: 'Departemen SDM', type: 'dept', dept: 'HR' },
                    { value: 'dept:Ops', label: 'Departemen Operasional', type: 'dept', dept: 'Ops' }
                ];

                setAssignees([...deptOptions, ...userOptions]);
            } catch (err) {
                console.error("Failed to fetch assignees:", err);
            }
        };
        fetchAssignees();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files) {
            const rawFiles = Array.from(e.target.files);
            const validFiles = rawFiles.filter(file => {
                if (file.size > 5 * 1024 * 1024) {
                    alert(`File ${file.name} terlalu besar (>5MB).`);
                    return false;
                }
                return true;
            });
            setFiles([...files, ...validFiles]);
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const fileToDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const addTaskRow = () => {
        setTaskRows([...taskRows, { id: Date.now(), title: '', assigneeDesc: '', deadline: '' }]);
    };

    const removeTaskRow = (id) => {
        if (taskRows.length > 1) {
            setTaskRows(taskRows.filter(r => r.id !== id));
        }
    };

    const updateTaskRow = (id, field, value) => {
        setTaskRows(taskRows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        const invalidRow = taskRows.find(r => !r.title || !r.assigneeDesc || !r.deadline);
        if (invalidRow) {
            alert("Mohon lengkapi semua baris tugas (Judul, Penerima, Tenggat).");
            return;
        }

        setIsSubmitting(true);

        try {
            // Collect attachments data efficiently once
            const attachmentData = [];
            if (files.length > 0) {
                for (const file of files) {
                    let fileType = 'doc';
                    if (file.type.includes('pdf')) fileType = 'pdf';
                    else if (file.type.includes('image')) fileType = 'img';

                    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
                    let fileUrl = '#';

                    if (file.size < 5 * 1024 * 1024) {
                        try {
                            fileUrl = await fileToDataURL(file);
                        } catch (readErr) { }
                    }

                    attachmentData.push({
                        name: file.name,
                        type: fileType,
                        size: sizeInMB + ' MB',
                        url: fileUrl
                    });
                }
            }

            // Loop through each task row and create delegation
            for (const row of taskRows) {
                // Parse assignee
                const assigneeOption = assignees.find(a => a.value === row.assigneeDesc);
                let assignedToDept = '';
                let assignedToUserId = null;

                if (assigneeOption) {
                    assignedToDept = assigneeOption.dept;
                    if (assigneeOption.type === 'user') {
                        assignedToUserId = assigneeOption.value.split(':')[1];
                    }
                } else {
                    // Fallback or custom entry? Assuming validation prevents this, 
                    // but if using custom text, default to General/Unknown dept
                    assignedToDept = 'General';
                }

                const [newTask] = await sql`
                INSERT INTO tasks (
                    title, 
                    description, 
                    assigned_by_user_id, 
                    assigned_to_dept,
                    assigned_to_user_id,
                    status, 
                    due_date, 
                    type,
                    reference_no,
                    document_date,
                    sender_info
                ) VALUES (
                    ${row.title},
                    ${desc},
                    1, 
                    ${assignedToDept},
                    ${assignedToUserId},
                    'Pending',
                    ${row.deadline},
                    'outgoing',
                    ${refNo},
                    ${docDate || null},
                    ${sender}
                )
                RETURNING id
            `;

                // Insert attachments for THIS task
                if (newTask && attachmentData.length > 0) {
                    for (const att of attachmentData) {
                        await sql`
                        INSERT INTO attachments (
                            task_id, file_name, file_type, file_size, file_url
                        ) VALUES (
                            ${newTask.id}, ${att.name}, ${att.type}, ${att.size}, ${att.url}
                        )
                    `;
                    }
                }
            }

            navigate('/history'); // Redirect to history list to see the bulk creation

        } catch (err) {
            console.error("Failed to create tasks:", err);
            alert("Gagal membuat tugas. Silakan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-page animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <header className="page-header simple-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={24} />
                </button>
                <h2>Delegasi Multi-Tugas</h2>
            </header>

            <form className="create-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="form-group">
                        <label>No. Surat / Diagenda</label>
                        <input
                            type="text"
                            placeholder="Contoh: 001/HR/2026"
                            value={refNo}
                            onChange={(e) => setRefNo(e.target.value)}
                            className="bg-white"
                        />
                    </div>
                    <div className="form-group">
                        <label>Tanggal Surat</label>
                        <input
                            type="date"
                            value={docDate}
                            onChange={(e) => setDocDate(e.target.value)}
                            className="bg-white"
                        />
                    </div>
                    <div className="form-group">
                        <label>Pengirim (Asal Surat)</label>
                        <input
                            type="text"
                            placeholder="Contoh: Kementerian Kesehatan"
                            value={sender}
                            onChange={(e) => setSender(e.target.value)}
                            className="bg-white"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Deskripsi & Instruksi Umum (Opsional)</label>
                    <textarea
                        rows="3"
                        placeholder="Deskripsi ini akan diterapkan untuk semua tugas di bawah..."
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        style={{ fontSize: '0.9rem' }}
                    ></textarea>
                </div>

                <div className="form-group">
                    <label>Daftar Tugas</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {taskRows.map((row, index) => (
                            <div key={row.id} className="task-row-card" style={{
                                background: '#f8fafc',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                position: 'relative'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--secondary)' }}>Tugas #{index + 1}</span>
                                    {taskRows.length > 1 && (
                                        <button type="button" onClick={() => removeTaskRow(row.id)} style={{ color: '#ef4444' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Judul Tugas"
                                        value={row.title}
                                        onChange={(e) => updateTaskRow(row.id, 'title', e.target.value)}
                                        required
                                        style={{ background: 'white' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <select
                                            value={row.assigneeDesc}
                                            onChange={(e) => updateTaskRow(row.id, 'assigneeDesc', e.target.value)}
                                            required
                                            style={{ background: 'white', fontSize: '0.85rem' }}
                                        >
                                            <option value="">Pilih Penerima</option>
                                            <optgroup label="Satu Departemen">
                                                {assignees.filter(a => a.type === 'dept').map(a => (
                                                    <option key={a.value} value={a.value}>{a.label}</option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="Staff Spesifik">
                                                {assignees.filter(a => a.type === 'user').map(a => (
                                                    <option key={a.value} value={a.value}>{a.label}</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div style={{ width: '130px' }}>
                                        <input
                                            type="date"
                                            value={row.deadline}
                                            onChange={(e) => updateTaskRow(row.id, 'deadline', e.target.value)}
                                            required
                                            style={{ background: 'white', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="button" onClick={addTaskRow} className="btn-secondary" style={{
                    width: '100%',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    borderStyle: 'dashed'
                }}>
                    <Plus size={18} /> Tambah Baris Tugas
                </button>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Lampiran (Untuk Semua Tugas)</label>
                    <div className="upload-area" style={{ padding: '1rem' }}>
                        <input
                            type="file"
                            multiple
                            accept="image/*,.pdf"
                            id="file-upload"
                            onChange={handleFileChange}
                            hidden
                        />
                        <label htmlFor="file-upload" className="upload-label" style={{ flexDirection: 'row', gap: '1rem' }}>
                            <div className="upload-icon-wrapper" style={{ width: '32px', height: '32px', marginBottom: 0 }}>
                                <Upload className="text-primary" size={18} />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <span className="upload-text" style={{ fontSize: '0.9rem', marginBottom: 0 }}>Upload File</span>
                                <small className="upload-hint" style={{ display: 'block' }}>PDF, JPG, PNG</small>
                            </div>
                        </label>
                    </div>
                </div>

                {files.length > 0 && (
                    <div className="file-list">
                        {files.map((file, idx) => (
                            <div key={idx} className="file-item">
                                <div className="file-info">
                                    <Paperclip size={16} className="text-muted" />
                                    <span className="file-name">{file.name}</span>
                                </div>
                                <button type="button" onClick={() => removeFile(idx)} className="remove-btn">
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                    disabled={isSubmitting}
                    style={{ position: 'fixed', bottom: '1rem', left: '1rem', right: '1rem', width: 'auto', zIndex: 50, shadow: 'var(--shadow-lg)' }}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2 justify-center">
                            <Loader2 className="animate-spin" size={20} /> Mengirim {taskRows.length} Tugas...
                        </span>
                    ) : `Kirim ${taskRows.length} Delegasi`}
                </button>
            </form>
        </div>
    );
};

export default CreateTask;
