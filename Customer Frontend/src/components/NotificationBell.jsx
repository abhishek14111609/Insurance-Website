import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationAPI } from '../services/api.service';
import './NotificationBell.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationAPI.getAll({ limit: 10 });
            if (response.success) {
                setNotifications(response.data.notifications || []);
                setUnreadCount(response.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            // Update local state
            const updated = notifications.map(n => {
                const notificationId = n._id || n.id;
                return notificationId === id ? { ...n, isRead: true } : n;
            });
            setNotifications(updated);
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            // Update local state
            const updated = notifications.map(n => ({ ...n, isRead: true }));
            setNotifications(updated);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            policy: '📄',
            payment: '💳',
            commission: '💰',
            withdrawal: '💸',
            claim: '🏥',
            agent: '👤',
            system: '📢'
        };
        return icons[type] || '🔔';
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
                            {loading ? (
                                <div className="notification-loading">
                                    <div className="spinner-small"></div>
                                    <p>Loading...</p>
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.slice(0, 5).map(notification => {
                                    const notificationId = notification._id || notification.id;
                                    return (
                                        <div
                                            key={notificationId}
                                            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                            onClick={() => {
                                                if (notificationId) {
                                                    markAsRead(notificationId);
                                                }
                                                if (notification.actionUrl) {
                                                    window.location.href = notification.actionUrl;
                                                }
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
                                        </div>
                                    );
                                })
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

export default NotificationBell;
