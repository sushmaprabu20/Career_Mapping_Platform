import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">Career.co</Link>
            </div>
            <ul className="navbar-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/career-paths">Career Paths</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                {user && <li><Link to="/dashboard">Dashboard</Link></li>}
            </ul>
            <div className="navbar-auth">
                {user ? (
                    <div className="nav-user">
                        <span>Hi, {user.name.split(' ')[0]}</span>
                        <button onClick={handleLogout} className="btn-logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                ) : (
                    <>
                        <Link to="/login" className="nav-btn">Login</Link>
                        <Link to="/signup" className="nav-btn btn-cta">Signup</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
