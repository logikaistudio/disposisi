import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sql } from '../lib/db';
import { Loader2, Eye, EyeOff, Lock, User } from 'lucide-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Find user by username
            const users = await sql`
                SELECT * FROM users WHERE username = ${username}
            `;

            if (users.length === 0) {
                setError('Username tidak ditemukan.');
                setLoading(false);
                return;
            }

            const user = users[0];

            // Simple password check (plaintext for prototype as stored in DB)
            // In production usage, this MUST be bcrypted.
            if (user.password !== password) {
                setError('Password salah.');
                setLoading(false);
                return;
            }

            // Success
            // Store user session - utilize sessionStorage so it clears on restart
            sessionStorage.setItem('iwogate_user', JSON.stringify(user));

            // Redirect
            navigate('/');

        } catch (err) {
            console.error("Login failed:", err);
            setError('Terjadi kesalahan koneksi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card animate-fade-in">
                <div className="login-brand">
                    <div className="login-logo">
                        <User size={28} />
                    </div>
                    <div className="brand-text">
                        <h1>iwogate</h1>
                        <p>Sistem Delegasi Tugas Terpadu</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>Username</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                placeholder="Masukkan username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <User size={20} className="input-icon" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Masukkan password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Lock size={20} className="input-icon" />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Masuk'}
                    </button>
                </form>


            </div>
        </div>
    );
};

export default Login;
