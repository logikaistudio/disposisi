import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusSquare, Users, User, Menu, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import './Layout.css';

const MobileNav = () => {
    const location = useLocation();
    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/create', label: 'Buat Baru', icon: PlusSquare },
        { path: '/departments', label: 'Divisi', icon: Users },
        { path: '/profile', label: 'Profil', icon: User },
    ];

    return (
        <nav className="mobile-nav">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                    <Link to={item.path} key={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
};

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleNavigate = (path) => {
        setIsMenuOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        if (confirm("Apakah Anda yakin ingin keluar?")) {
            sessionStorage.removeItem('iwogate_user');
            navigate('/login');
        }
    };

    return (
        <header className="app-header">
            <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <div className="logo-icon">i</div>
                <h1 className="app-name">iwogate</h1>
            </div>
            <div style={{ position: 'relative' }}>
                <button className="menu-btn" onClick={toggleMenu}>
                    <Menu size={24} />
                </button>

                {isMenuOpen && (
                    <>
                        <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)}></div>
                        <div className="dropdown-menu animate-fade-in">
                            <button onClick={() => handleNavigate('/profile')} className="dropdown-item">
                                <User size={18} /> Profil Saya
                            </button>
                            <button onClick={() => handleNavigate('/settings')} className="dropdown-item">
                                <Users size={18} /> Pengaturan User
                            </button>
                            <div className="dropdown-divider"></div>
                            <button onClick={handleLogout} className="dropdown-item text-red-600">
                                <LogOut size={18} /> Keluar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
};

const Layout = ({ children }) => {
    return (
        <div className="app-container">
            <Header />
            <main className="app-content">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {children}
                </motion.div>
            </main>
            <MobileNav />
        </div>
    );
};

export default Layout;
