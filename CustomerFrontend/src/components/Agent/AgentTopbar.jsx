import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api.service';
import './AgentTopbar.css';

const AgentTopbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return 'A';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationAPI.getAll({ limit: 5 });
            if (response.success) {
                setNotifications(response.data.notifications);
                setUnreadCount(response.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Refresh every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                await notificationAPI.markAsRead(notification.id);
                setNotifications(notifications.map(n =>
                    n.id === notification.id ? { ...n, isRead: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }

        if (notification.actionUrl) {
            navigate(notification.actionUrl);
            setShowDropdown(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'policy': return '📄';
            case 'payment': return '💳';
            case 'commission': return '💰';
            case 'withdrawal': return '💸';
            case 'claim': return '🏥';
            case 'agent': return '👤';
            case 'inquiry': return '✉️';
            case 'system': return '📢';
            default: return '🔔';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <header className="agent-topbar">
            {/* <div className="topbar-search">
                <input type="text" placeholder="Search policies, customers..." />
            </div> */}

            <div className="topbar-actions">
                <div className="notification-wrapper" ref={dropdownRef}>
                    <button
                        className={`icon-btn ${unreadCount > 0 ? 'has-notifications' : ''}`}
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        🔔
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </button>

                    {showDropdown && (
                        <div className="notification-dropdown">
                            <div className="dropdown-header">
                                <h3>Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllAsRead} className="mark-all-btn">
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="dropdown-content">
                                {loading && notifications.length === 0 ? (
                                    <div className="dropdown-empty">Loading...</div>
                                ) : notifications.length === 0 ? (
                                    <div className="dropdown-empty">No notifications</div>
                                ) : (
                                    notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="notification-icon">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="notification-info">
                                                <p className="notification-title">{notification.title}</p>
                                                <p className="notification-message">{notification.message}</p>
                                                <span className="notification-time">{formatTime(notification.createdAt)}</span>
                                            </div>
                                            {!notification.isRead && <div className="unread-dot"></div>}
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="dropdown-footer">
                                <button
                                    className="view-all-btn"
                                    onClick={() => {
                                        navigate('/agent/notifications');
                                        setShowDropdown(false);
                                    }}
                                >
                                    View All Notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="user-profile">
                    <div className="user-info">
                        <span className="user-name">{user?.fullName || 'Agent'}</span>
                        <span className="user-role">
                            {user?.level ? `Level ${user.level} Agent` : 'Agent Partner'}
                        </span>
                    </div>
                    <div className="user-avatar">
                        {getInitials(user?.fullName)}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AgentTopbar;

