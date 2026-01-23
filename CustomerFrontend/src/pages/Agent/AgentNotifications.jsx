import { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/api.service';
import './AgentNotifications.css';

const AgentNotifications = () => {
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

    return (
        <div className="agent-notifications">
            <div className="notifications-header">
                <div>
                    <h1>Notifications</h1>
                    <p>Keep track of your commissions, team, and account status</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-outline"
                        onClick={markAllAsRead}
                        disabled={!notifications.some(n => !n.isRead)}
                    >
                        Mark All as Read
                    </button>
                </div>
            </div>

            <div className="notifications-container-box">
                <div className="filter-tabs">
                    <button
                        className={`tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Notifications
                    </button>
                    <button
                        className={`tab ${filter === 'unread' ? 'active' : ''}`}
                        onClick={() => setFilter('unread')}
                        data-count={notifications.filter(n => !n.isRead).length}
                    >
                        Unread
                    </button>
                </div>

                <div className="notifications-list">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading your notifications...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map(n => {
                            const id = n._id || n.id;
                            return (
                                <div
                                    key={id}
                                    className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                                    onClick={() => !n.isRead && markAsRead(id)}
                                >
                                    <div className="notification-icon-wrapper">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="notification-main">
                                        <div className="notification-head">
                                            <h3>{n.title}</h3>
                                            <span className="notification-date">{formatDate(n.createdAt)}</span>
                                        </div>
                                        <p className="notification-msg">{n.message}</p>
                                        {n.actionUrl && (
                                            <a href={n.actionUrl} className="view-action">Action required →</a>
                                        )}
                                    </div>
                                    <div className="notification-ctrl">
                                        <button
                                            className="del-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(id);
                                            }}
                                            title="Remove"
                                        >
                                            🗑️
                                        </button>
                                        {!n.isRead && <div className="unread-blob"></div>}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="empty-notifications">
                            <div className="empty-icon">🔕</div>
                            <h3>No notifications yet</h3>
                            <p>We'll notify you about new sales, earnings, and updates.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentNotifications;
