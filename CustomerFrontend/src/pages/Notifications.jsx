import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api.service';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationAPI.getAll();
            if (response.success) {
                setNotifications(response.data.notifications || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(notifications.map(n =>
                (n._id || n.id) === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        // if (!window.confirm('Are you sure you want to delete this notification?')) return; 
        // Removing confirm for smoother UX, or keeping it? Users usually prefer no confirm for simple delete
        // But let's keep it safe. Actually, let's remove confirm for better "modern" feel, or make it custom modal.
        // For now, standard confirm is safer but annoying. keeping it.
        if (!window.confirm('Delete this notification?')) return;

        try {
            await notificationAPI.delete(id);
            setNotifications(notifications.filter(n => (n._id || n.id) !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getIcon = (type) => {
        const icons = {
            policy: '📄',
            payment: '💳',
            commission: '💰',
            withdrawal: '💸',
            claim: '🏥',
            agent: '👤',
            inquiry: '✉️',
            system: '📢'
        };
        return icons[type] || '🔔';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="notifications-page">
            <div className="notifications-container">
                <header className="page-header">
                    <div className="header-info">
                        <h1>Notifications</h1>
                        <p>Stay updated with your policy status and claims</p>
                    </div>
                    <div className="header-actions">
                        <button
                            className="mark-all-btn"
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                        >
                            Mark All as Read
                        </button>
                    </div>
                </header>

                <div className="filter-tabs">
                    <button
                        className={`tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`tab ${filter === 'unread' ? 'active' : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        Unread
                        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                    </button>
                    <button
                        className={`tab ${filter === 'read' ? 'active' : ''}`}
                        onClick={() => setFilter('read')}
                    >
                        Read
                    </button>
                </div>

                <div className="notifications-list">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading notifications...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map(n => {
                            const id = n._id || n.id;
                            return (
                                <div
                                    key={id}
                                    className={`notification-card ${!n.isRead ? 'unread' : ''}`}
                                    onClick={() => !n.isRead && markAsRead(id)}
                                >
                                    <div className="notification-icon-wrapper">
                                        <div className={`notification-icon type-${n.type || 'system'}`}>
                                            {getIcon(n.type)}
                                        </div>
                                    </div>
                                    <div className="card-content">
                                        <div className="card-header">
                                            <h3>{n.title}</h3>
                                            <span className="time">{formatDate(n.createdAt)}</span>
                                        </div>
                                        <p>{n.message}</p>
                                        {n.actionUrl && (
                                            <a href={n.actionUrl} className="action-link" onClick={e => e.stopPropagation()}>
                                                View Details →
                                            </a>
                                        )}
                                    </div>
                                    <div className="card-actions">
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(id);
                                            }}
                                            title="Delete"
                                        >
                                            ✕
                                        </button>
                                        {!n.isRead && <span className="unread-dot" title="Unread"></span>}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">🔕</div>
                            <h3>No notifications found</h3>
                            <p>You're all caught up! New updates will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
