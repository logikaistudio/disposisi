import React, { useState, useEffect } from 'react';
import { sql } from '../lib/db';
import { Loader2, Plus, User, Edit, Trash2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../components/Modal.css';
import './Settings.css';

const Settings = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('users');
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null });

    const [roles, setRoles] = useState([]);
    const [roleForm, setRoleForm] = useState({ name: '', code: '', description: '', permissions: '' });

    // User Form State
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        role: 'user',
        department: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Ensure Roles Table exists
                await sql`
                    CREATE TABLE IF NOT EXISTS roles (
                        id SERIAL PRIMARY KEY,
                        name TEXT NOT NULL,
                        code TEXT NOT NULL UNIQUE,
                        description TEXT,
                        permissions TEXT,
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                `;

                // Seed Default Roles if empty
                const rolesCount = await sql`SELECT COUNT(*) FROM roles`;
                if (parseInt(rolesCount[0].count) === 0) {
                    await sql`INSERT INTO roles (name, code, description, permissions) VALUES 
                    ('Superuser', 'superuser', 'Akses penuh ke seluruh sistem tanpa batasan.', 'all'),
                    ('Admin', 'admin', 'Manajer tingkat departemen atau operasional.', 'view_task, create_task, edit_task, delete_task, manage_users'),
                    ('User', 'user', 'Pengguna standar untuk pelaksana tugas.', 'view_task, update_status, view_profile')`;
                }

                // Fetch current logged in user logic
                const userStr = localStorage.getItem('iwogate_user');
                if (userStr) {
                    const localUser = JSON.parse(userStr);
                    const [dbUser] = await sql`SELECT * FROM users WHERE id = ${localUser.id}`;
                    setCurrentUser(dbUser || localUser);
                }

                // Fetch all data
                const [allUsers, allDepts, allRoles] = await Promise.all([
                    sql`SELECT * FROM users ORDER BY id ASC`,
                    sql`SELECT * FROM departments ORDER BY name ASC`,
                    sql`SELECT * FROM roles ORDER BY id ASC`
                ]);

                setUsers(allUsers);
                setDepartments(allDepts);
                setRoles(allRoles);
            } catch (err) {
                console.error("Failed to load settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const resetForm = () => {
        setFormData({ name: '', username: '', role: 'user', department: departments[0]?.name || '', password: '' });
        setRoleForm({ name: '', code: '', description: '', permissions: '' });
        setShowPassword(false);
    };

    const openModal = (mode, item = null) => {
        setModal({ open: true, mode, data: item });
        resetForm(); // Reset first

        if (mode === 'edit' && item) {
            if (activeTab === 'users') {
                setFormData({
                    name: item.name,
                    username: item.username || '',
                    role: item.role,
                    department: item.department,
                    password: '',
                });
            } else {
                setRoleForm({
                    name: item.name,
                    code: item.code,
                    description: item.description || '',
                    permissions: item.permissions || ''
                });
            }
        }
    };

    const fetchRoles = async () => {
        const allRoles = await sql`SELECT * FROM roles ORDER BY id ASC`;
        setRoles(allRoles);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (activeTab === 'users') {
                if (modal.mode === 'create') {
                    const existing = await sql`SELECT id FROM users WHERE username = ${formData.username}`;
                    if (existing.length > 0) {
                        alert("Username already exists!");
                        setIsSubmitting(false);
                        return;
                    }
                    await sql`
                        INSERT INTO users (name, username, role, department, password, avatar_url)
                        VALUES (${formData.name}, ${formData.username}, ${formData.role}, ${formData.department}, ${formData.password}, ${`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}`})
                    `;
                } else {
                    if (modal.data.username !== formData.username) {
                        const existing = await sql`SELECT id FROM users WHERE username = ${formData.username} AND id != ${modal.data.id}`;
                        if (existing.length > 0) {
                            alert("Username already exists!");
                            setIsSubmitting(false);
                            return;
                        }
                    }
                    if (formData.password) {
                        await sql`UPDATE users SET name=${formData.name}, username=${formData.username}, role=${formData.role}, department=${formData.department}, password=${formData.password} WHERE id=${modal.data.id}`;
                    } else {
                        await sql`UPDATE users SET name=${formData.name}, username=${formData.username}, role=${formData.role}, department=${formData.department} WHERE id=${modal.data.id}`;
                    }
                }
                await fetchUsers();
            } else {
                // Roles Save Logic
                if (modal.mode === 'create') {
                    const existing = await sql`SELECT id FROM roles WHERE code = ${roleForm.code}`;
                    if (existing.length > 0) {
                        alert("Role code already exists!");
                        setIsSubmitting(false);
                        return;
                    }
                    await sql`
                        INSERT INTO roles (name, code, description, permissions)
                        VALUES (${roleForm.name}, ${roleForm.code}, ${roleForm.description}, ${roleForm.permissions})
                    `;
                } else {
                    if (modal.data.code !== roleForm.code) {
                        const existing = await sql`SELECT id FROM roles WHERE code = ${roleForm.code} AND id != ${modal.data.id}`;
                        if (existing.length > 0) {
                            alert("Role code already exists!");
                            setIsSubmitting(false);
                            return;
                        }
                    }
                    await sql`
                        UPDATE roles SET 
                            name=${roleForm.name}, 
                            code=${roleForm.code}, 
                            description=${roleForm.description}, 
                            permissions=${roleForm.permissions}
                        WHERE id=${modal.data.id}
                    `;
                }
                await fetchRoles();
            }

            setModal({ open: false, mode: 'create', data: null });
            resetForm();
            alert("Berhasil disimpan!");
        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRole = async (id) => {
        if (!confirm("Are you sure? This might affect users assigned to this role.")) return;
        try {
            await sql`DELETE FROM roles WHERE id = ${id}`;
            await fetchRoles();
        } catch (err) {
            console.error(err);
            alert("Failed to delete role.");
        }
    };

    if (loading) return <div className="flex justify-center h-screen items-center"><Loader2 className="animate-spin text-primary" /></div>;

    // Permissions
    const isSuperUser = currentUser?.role === 'superuser';
    const isAdmin = currentUser?.role === 'admin';
    const canEdit = isSuperUser || isAdmin;

    return (
        <div className="settings-page animate-fade-in pb-20">
            <header className="page-header simple-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={24} />
                </button>
                <h2>Pengaturan Pengguna & Role</h2>
            </header>

            <div className="p-4">
                <div className="current-user-card">
                    <div className="current-user-icon">
                        <User size={24} />
                    </div>
                    <div className="current-user-info">
                        <div className="current-user-header">
                            <span className="label">Login Sebagai</span>
                            <span className={`role-badge role-${currentUser?.role || 'user'}`}>{currentUser?.role}</span>
                        </div>
                        <h3 className="current-user-name">{currentUser?.name}</h3>
                        <p className="current-user-desc">
                            {isSuperUser ? "Akses penuh (Super Admin)" :
                                isAdmin ? "Akses Admin" : "Akses Terbatas"}
                        </p>
                    </div>
                </div>

                <div className="settings-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Management User
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('roles')}
                    >
                        Role & Permissions
                    </button>
                </div>

                {activeTab === 'users' ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="section-title">Daftar Pengguna</h3>
                            {canEdit && (
                                <button
                                    onClick={() => openModal('create')}
                                    className="add-btn"
                                >
                                    <Plus size={18} /> Tambah User
                                </button>
                            )}
                        </div>

                        <div className="user-list">
                            {users.map(user => (
                                <div key={user.id} className="user-card">
                                    <div className="user-info">
                                        <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} className="user-avatar" alt={user.name} />
                                        <div className="user-details">
                                            <h4 className="user-name">{user.name}</h4>
                                            <div className="user-meta">
                                                <span className={`user-role-badge role-${user.role || 'user'}`}>{user.role}</span>
                                                <span className="dot">•</span>
                                                <span>{user.department}</span>
                                            </div>
                                            <div className="text-xs text-slate-400">@{user.username || '-'}</div>
                                        </div>
                                    </div>

                                    <div className="user-actions">
                                        {(isSuperUser || (isAdmin && user.role === 'user')) && (
                                            <>
                                                <button onClick={() => openModal('edit', user)} className="action-icon-btn" title="Edit User">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(user.id)} className="action-icon-btn delete-btn" title="Hapus User">
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="roles-list animate-fade-in">
                        <div className="flex justify-end mb-4">
                            {canEdit && (
                                <button
                                    onClick={() => openModal('create')}
                                    className="add-btn"
                                >
                                    <Plus size={18} /> Tambah Role
                                </button>
                            )}
                        </div>
                        {roles.map(role => (
                            <div key={role.id} className="role-card relative group">
                                <div className="role-header">
                                    <div className={`role-badge role-${role.code}`}>{role.name}</div>
                                    <span className="role-users-count">{users.filter(u => u.role === role.code).length} Users Assigned</span>
                                </div>
                                <p className="role-desc">{role.description}</p>
                                <ul className="role-permissions">
                                    {role.permissions?.split(',').map((perm, idx) => (
                                        <li key={idx}>✓ {perm.trim()}</li>
                                    ))}
                                </ul>
                                {canEdit && (
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openModal('edit', role)} className="action-icon-btn bg-slate-100" title="Edit Role">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteRole(role.id)} className="action-icon-btn delete-btn bg-red-50" title="Hapus Role">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {modal.open && (
                <div className="modal-overlay">
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {activeTab === 'users'
                                    ? (modal.mode === 'create' ? 'Tambah User Baru' : 'Edit User')
                                    : (modal.mode === 'create' ? 'Tambah Role Baru' : 'Edit Role')
                                }
                            </h3>
                            <button onClick={() => setModal({ ...modal, open: false })} className="modal-close">
                                <span className="sr-only">Tutup</span>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                {activeTab === 'users' ? (
                                    <>
                                        {/* User Form Fields */}
                                        <div className="input-group">
                                            <label className="input-label">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                required
                                                className="input-field"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Nama Lengkap"
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Username</label>
                                            <input
                                                type="text"
                                                required
                                                className="input-field"
                                                value={formData.username}
                                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                                placeholder="username"
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="input-group flex-1">
                                                <label className="input-label">Role</label>
                                                <select
                                                    className="input-field"
                                                    value={formData.role}
                                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                    required
                                                >
                                                    <option value="user">User</option>
                                                    {roles.map(r => (
                                                        <option key={r.id} value={r.code}>{r.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="input-group flex-1">
                                                <label className="input-label">Divisi</label>
                                                <select
                                                    className="input-field"
                                                    value={formData.department}
                                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Pilih Divisi</option>
                                                    {departments.map(dept => (
                                                        <option key={dept.id} value={dept.name}>{dept.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label className="input-label">
                                                Password {modal.mode === 'edit' && <span className="text-secondary font-normal text-xs">(Kosongkan jika tidak ubah)</span>}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className="input-field"
                                                    style={{ paddingRight: '2.5rem' }}
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                    required={modal.mode === 'create'}
                                                    placeholder={modal.mode === 'edit' ? '******' : 'Minimal 6 karakter'}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Role Form Fields */}
                                        <div className="input-group">
                                            <label className="input-label">Nama Role</label>
                                            <input
                                                type="text"
                                                required
                                                className="input-field"
                                                value={roleForm.name}
                                                onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                                                placeholder="Contoh: Supervisor"
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Kode Role (Unik)</label>
                                            <input
                                                type="text"
                                                required
                                                className="input-field"
                                                value={roleForm.code}
                                                onChange={e => setRoleForm({ ...roleForm, code: e.target.value.toLowerCase() })}
                                                placeholder="contoh: supervisor"
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Deskripsi</label>
                                            <textarea
                                                className="input-field"
                                                rows="3"
                                                value={roleForm.description}
                                                onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                                                placeholder="Jelaskan batasan role ini..."
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Permissions (Pisahkan dengan koma)</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={roleForm.permissions}
                                                onChange={e => setRoleForm({ ...roleForm, permissions: e.target.value })}
                                                placeholder="view_task, edit_task, delete_task"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setModal({ ...modal, open: false })}
                                    className="modal-btn cancel"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="modal-btn submit"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
