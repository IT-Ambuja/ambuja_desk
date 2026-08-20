// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, resetFirstPassword } from '../api';
import { Mail, Lock, Eye, EyeOff, LogIn, Building2, KeyRound } from 'lucide-react';
import logoImg from '../assets/logo.png';

const Login = ({ setUser }) => {
    const navigate = useNavigate();
    
    // Standard Login State
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    
    // First-Time Reset State
    const [isForceReset, setIsForceReset] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Slideshow State
    const [bgIndex, setBgIndex] = useState(0);
    const backgroundImages = [
        "/login_images/login_image_1.jpeg",
        "/login_images/login_image_2.jpeg",
        "/login_images/login_image_3.jpeg",
        "/login_images/login_image_4.jpeg",
        "/login_images/login_image_5.jpeg",
        "/login_images/login_image_6.jpeg",
        "/login_images/login_image_7.jpeg",
        "/login_images/login_image_8.jpeg",
        "/login_images/login_image_9.jpeg"
    ];

    React.useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex(prev => (prev + 1) % backgroundImages.length);
        }, 5000); // Change image every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await loginUser({ login_id: loginId, password });
            
            if (data.force_reset) {
                setIsForceReset(true);
                setResetEmail(data.email);
            } else {
                sessionStorage.setItem('ticket_user', JSON.stringify(data.user));
                setUser(data.user);
                
                if (data.user.role === 'Admin' || data.user.role === 'Superadmin' || data.user.role === 'Super Admin') navigate('/admin');
                else if (data.user.role === 'User') navigate('/user');
                else if (data.user.role === 'Viewer') navigate('/viewer');
                else navigate('/user');
            }
        } catch (err) {
            setError(err.response?.data?.error || "Login failed. Please try again.");
        }
    };

    const handleForceReset = async (e) => {
        e.preventDefault();
        setError('');
        
        if (newPassword !== confirmPassword) {
            return setError("Passwords do not match.");
        }
        if (newPassword.length < 8) {
            return setError("Password must be at least 8 characters.");
        }

        try {
            await resetFirstPassword({ email: resetEmail, new_password: newPassword });
            alert("Password reset successfully! Please log in with your new password.");
            setIsForceReset(false);
            setPassword('');
        } catch (err) {
            setError(err.response?.data?.error || "Reset failed.");
        }
    };

    return (
        <div style={styles.container}>
            
            {/* LEFT SIDE: SPLIT SCREEN VISUAL WITH SLIDESHOW */}
            <div style={styles.leftPane}>
                {backgroundImages.map((imgUrl, index) => (
                    <div 
                        key={index}
                        style={{
                            ...styles.bgImage,
                            backgroundImage: `url("${imgUrl}")`,
                            opacity: index === bgIndex ? 1 : 0
                        }}
                    ></div>
                ))}
                <div style={styles.overlay}></div>
                <div style={styles.leftContent}>
                    <div style={styles.branding}>
                        <img src={logoImg} alt="Ambuja Neotia Logo" style={styles.brandLogo} />
                        <p style={styles.brandTagline}>Making a difference to the way people live</p>
                    </div>
                    <div style={styles.quoteBox}>
                        <p style={styles.quoteText}>"Our key purpose is to be happy and put a smile on everyone's face, whether it's our customers, employees or contractors."</p>
                        <p style={{...styles.quoteText, fontSize: '13px', marginTop: '8px', fontWeight: '500', fontStyle: 'normal', color: '#14b8a6'}}>- Harshavardhan Neotia</p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: LOGIN FORM */}
            <div style={styles.rightPane}>
                <div style={styles.formContainer}>
                    {/* HEADER SECTION */}
                    <div style={styles.header}>
                        <h2 style={styles.title}>Ambuja Desk</h2>
                        <p style={styles.subtitle}>Enterprise Ticketing Portal</p>
                    </div>

                    {error && (
                        <div style={styles.errorBox}>
                            {error}
                        </div>
                    )}

                    {/* LOGIN FORM */}
                    {!isForceReset ? (
                        <form onSubmit={handleLogin} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Email Address or Phone</label>
                                <div style={styles.inputWrapper}>
                                    <Mail size={18} color="#9ca3af" style={styles.leftIcon} />
                                    <input 
                                        type="text" 
                                        className="login-input"
                                        style={styles.input} 
                                        placeholder="Enter your email or phone"
                                        value={loginId} 
                                        onChange={(e) => setLoginId(e.target.value)} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Password</label>
                                <div style={styles.inputWrapper}>
                                    <Lock size={18} color="#9ca3af" style={styles.leftIcon} />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        className="login-input"
                                        style={styles.input} 
                                        placeholder="Enter your password"
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={styles.rightIconButton}
                                    >
                                        {showPassword ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
                                    </button>
                                </div>
                            </div>



                            <button type="submit" style={styles.submitButton}>
                                <LogIn size={18} /> Sign In
                            </button>
                        </form>
                    ) : (
                        /* FORCE RESET FORM */
                        <form onSubmit={handleForceReset} style={styles.form}>
                            <div style={styles.warningBox}>
                                <strong>First Login Detected.</strong><br/>
                                Please set a secure password to continue.
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>New Password (Min 8 chars)</label>
                                <div style={styles.inputWrapper}>
                                    <KeyRound size={18} color="#9ca3af" style={styles.leftIcon} />
                                    <input 
                                        type={showNewPassword ? "text" : "password"} 
                                        className="login-input"
                                        style={styles.input} 
                                        placeholder="Create new password"
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                        required 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        style={styles.rightIconButton}
                                    >
                                        {showNewPassword ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
                                    </button>
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Confirm Password</label>
                                <div style={styles.inputWrapper}>
                                    <Lock size={18} color="#9ca3af" style={styles.leftIcon} />
                                    <input 
                                        type="password" 
                                        className="login-input"
                                        style={styles.input} 
                                        placeholder="Confirm new password"
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        required 
                                    />
                                </div>
                            </div>

                            <button type="submit" style={styles.submitButton}>
                                <KeyRound size={18} /> Update Password
                            </button>
                        </form>
                    )}
                    
                    <div style={styles.footer}>
                        &copy; {new Date().getFullYear()} Ambuja Neotia Group. All rights reserved.
                    </div>
                </div>
            </div>
            
            {/* CSS ANIMATION STYLES */}
            <style>{`
                .login-input:focus {
                    border-color: #14b8a6 !important;
                    box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1) !important;
                }
            `}</style>
        </div>
    );
};

// Premium Split-Screen UI Styles
const styles = {
    container: {
        display: 'flex',
        height: '125vh',
        minHeight: '125vh',
        width: '125vw',
        backgroundColor: '#ffffff',
        fontFamily: "'Montserrat', 'Inter', sans-serif",
        overflow: 'hidden'
    },
    leftPane: {
        flex: '7',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(to right, black 95%, transparent 100%)',
        maskImage: 'linear-gradient(to right, black 95%, transparent 100%)'
    },
    bgImage: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'opacity 1.5s ease-in-out',
        zIndex: 0
    },
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(17, 24, 39, 0.2) 100%)',
        zIndex: 1
    },
    leftContent: {
        position: 'relative',
        zIndex: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start', // Pushes to the very top
        paddingTop: '20px' // Very close to top
    },
    branding: {
        marginBottom: '20px' // Keep tight to quote
    },
    brandLogo: {
        width: '240px', // Scaled down for better balance
        height: 'auto',
        marginBottom: '20px',
        filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.6))'
    },
    brandTagline: {
        fontSize: '18px',
        color: '#f3f4f6',
        fontWeight: '300',
        margin: 0,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap', // Forces single line
        textTransform: 'uppercase' // Premium touch
    },
    quoteBox: {
        marginBottom: '20px',
        borderLeft: '2px solid #14b8a6',
        paddingLeft: '20px'
    },
    quoteText: {
        fontSize: '15px',
        color: '#d1d5db',
        fontStyle: 'italic',
        fontWeight: '300',
        margin: 0,
        maxWidth: '800px', // Allow full width
        lineHeight: '1.6'
    },
    rightPane: {
        flex: '3',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: '40px',
        position: 'relative',
        zIndex: 5,
        boxShadow: '-30px 0 40px 10px #ffffff' // Creates a soft white bleed into the left pane
    },
    formContainer: {
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        marginBottom: '40px'
    },
    title: {
        fontSize: '32px',
        fontWeight: '800',
        color: '#111827',
        margin: '0 0 8px 0',
        letterSpacing: '-0.02em'
    },
    subtitle: {
        fontSize: '15px',
        color: '#6b7280',
        margin: 0
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#374151'
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    leftIcon: {
        position: 'absolute',
        left: '16px'
    },
    rightIconButton: {
        position: 'absolute',
        right: '16px',
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    input: {
        width: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #d1d5db',
        borderRadius: '12px',
        padding: '14px 44px 14px 46px',
        fontSize: '14px',
        color: '#111827',
        outline: 'none',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    checkboxGroup: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '-8px',
        marginBottom: '8px'
    },
    checkbox: {
        width: '16px',
        height: '16px',
        cursor: 'pointer',
        accentColor: '#14b8a6',
        borderRadius: '4px'
    },
    checkboxLabel: {
        fontSize: '13px',
        color: '#4b5563',
        cursor: 'pointer',
        fontWeight: '500'
    },

    submitButton: {
        backgroundColor: '#111827', // Elegant dark button for enterprise
        color: '#ffffff',
        border: 'none',
        borderRadius: '12px',
        padding: '14px 24px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        transition: 'background-color 0.2s, transform 0.1s',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    },
    errorBox: {
        backgroundColor: '#fef2f2',
        color: '#ef4444',
        padding: '14px',
        borderRadius: '10px',
        fontSize: '13px',
        textAlign: 'center',
        marginBottom: '24px',
        border: '1px solid #fecaca',
        fontWeight: '500'
    },
    warningBox: {
        backgroundColor: '#fffbeb',
        color: '#d97706',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '13px',
        textAlign: 'center',
        marginBottom: '16px',
        border: '1px solid #fde68a',
        lineHeight: '1.5',
        fontWeight: '500'
    },
    footer: {
        marginTop: '40px',
        fontSize: '12px',
        color: '#9ca3af',
        textAlign: 'center'
    }
};

export default Login;