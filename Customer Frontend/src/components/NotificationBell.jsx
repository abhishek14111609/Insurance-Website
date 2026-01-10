import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './NotificationBell.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Load notifications from localStorage (will be from API later)
        const loadNotifications = () => {
            const saved = JSON.parse(localStorage.getItem('customer_notifications') || '[]');
            setNotifications(saved);
            setUnreadCount(saved.filter(n => !n.isRead).length);
        };

        loadNotifications();

        // Listen for new notifications
        window.addEventListener('storage', loadNotifications);
        return () => window.removeEventListener('storage', loadNotifications);
    }, []);

    const markAsRead = (id) => {
        const updated = notifications.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        );
        setNotifications(updated);
        localStorage.setItem('customer_notifications', JSON.stringify(updated));
        setUnreadCount(updated.filter(n => !n.isRead).length);
    };

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, isRead: true }));
        setNotifications(updated);
        localStorage.setItem('customer_notifications', JSON.stringify(updated));
        setUnreadCount(0);
    };

    const getNotificationIcon = (type) => {
        const icons = {
            POLICY: '📄',
            PAYMENT: '💳',
            CLAIM: '🏥',
            RENEWAL: '🔄',
            ADMIN: '⚙️'
        };
        return icons[type] || '📢';
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="notification-bell">
            <button
                className="bell-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="notification-overlay" onClick={() => setIsOpen(false)} />
                    <div className="notification-dropdown">
                        <div className="notification-header">
                            <h4>Notifications</h4>
                            <div className="notification-actions">
                                {unreadCount > 0 && (
                                    <button
                                        className="mark-all-read"
                                        onClick={markAllAsRead}
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    className="close-button"
                                    onClick={() => setIsOpen(false)}
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="notification-list">
                            {notifications.length > 0 ? (
                                notifications.slice(0, 5).map(notification => (
                                    <Link
                                        key={notification.id}
                                        to={notification.link || '#'}
                                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                        onClick={() => {
                                            markAsRead(notification.id);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <div className="notification-icon">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="notification-content">
                                            <strong>{notification.title}</strong>
                                            <p>{notification.message}</p>
                                            <span className="notification-time">
                                                {getTimeAgo(notification.createdAt)}
                                            </span>
                                        </div>
                                        {!notification.isRead && <span className="unread-dot"></span>}
                                    </Link>
                                ))
                            ) : (
                                <div className="notification-empty">
                                    <span className="empty-icon">🔕</span>
                                    <p>No notifications</p>
                                </div>
                            )}
                        </div>

                        {notifications.length > 5 && (
                            <Link
                                to="/notifications"
                                className="view-all-link"
                                onClick={() => setIsOpen(false)}
                            >
                                View All Notifications
                            </Link>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

NotificationBell.propTypes = {};

export default NotificationBell;
