import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { agentAPI } from '../services/api.service';
import SkeletonLoader from '../components/SkeletonLoader';
import { exportToCSV } from '../utils/exportUtils';
import toast from 'react-hot-toast';
import './AgentAnalytics.css';

const AgentAnalytics = () => {
    const navigate = useNavigate();
    const { isAgent } = useAuth();

    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('month'); // week, month, quarter, year
    const [analytics, setAnalytics] = useState({
        salesTrend: [],
        commissionTrend: [],
        topProducts: [],
        conversionRate: 0,
        avgPolicyValue: 0,
        customerGrowth: [],
        teamPerformance: []
    });

    useEffect(() => {
        if (!isAgent) {
            navigate('/');
            return;
        }
        fetchAnalytics();
    }, [isAgent, navigate, timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            // Fetch various data sources
            const [policiesRes, commissionsRes, customersRes, teamRes] = await Promise.all([
                agentAPI.getPolicies(),
                agentAPI.getCommissions(),
                agentAPI.getCustomers(),
                agentAPI.getTeam()
            ]);

            if (policiesRes.success) {
                const policies = policiesRes.data.policies || [];
                const commissions = commissionsRes.success ? commissionsRes.data.commissions || [] : [];
                const customers = customersRes.success ? customersRes.data.customers || [] : [];
                const team = teamRes.success ? teamRes.data.team || [] : [];

                // Process analytics data
                const processedAnalytics = processAnalyticsData(policies, commissions, customers, team);
                setAnalytics(processedAnalytics);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const processAnalyticsData = (policies, commissions, customers, team) => {
        // Sales Trend (last 6 months)
        const salesTrend = generateTrendData(policies, 6, 'month');

        // Commission Trend
        const commissionTrend = generateCommissionTrend(commissions, 6);

        // Top Products
        const topProducts = getTopProducts(policies);

        // Conversion Rate (policies / customers)
        const conversionRate = customers.length > 0
            ? ((policies.length / customers.length) * 100).toFixed(1)
            : 0;

        // Average Policy Value
        const avgPolicyValue = policies.length > 0
            ? policies.reduce((sum, p) => sum + (p.premium || 0), 0) / policies.length
            : 0;

        // Customer Growth
        const customerGrowth = generateTrendData(customers, 6, 'month');

        // Team Performance
        const teamPerformance = team.slice(0, 5).map(member => ({
            name: member.user?.fullName || 'Unknown',
            sales: member.policiesSold || 0,
            earnings: member.totalEarnings || 0
        }));

        return {
            salesTrend,
            commissionTrend,
            topProducts,
            conversionRate,
            avgPolicyValue,
            customerGrowth,
            teamPerformance
        };
    };

    const generateTrendData = (data, periods, type) => {
        const now = new Date();
        const trend = [];

        for (let i = periods - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);

            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            const count = data.filter(item => {
                const itemDate = new Date(item.createdAt || item.startDate);
                return itemDate.getMonth() === date.getMonth() &&
                    itemDate.getFullYear() === date.getFullYear();
            }).length;

            trend.push({ label: monthName, value: count });
        }

        return trend;
    };

    const generateCommissionTrend = (commissions, periods) => {
        const now = new Date();
        const trend = [];

        for (let i = periods - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);

            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            const total = commissions
                .filter(c => {
                    const cDate = new Date(c.createdAt);
                    return cDate.getMonth() === date.getMonth() &&
                        cDate.getFullYear() === date.getFullYear();
                })
                .reduce((sum, c) => sum + (c.amount || 0), 0);

            trend.push({ label: monthName, value: total });
        }

        return trend;
    };

    const getTopProducts = (policies) => {
        const productCounts = {};

        policies.forEach(policy => {
            const type = policy.cattleType || 'Other';
            productCounts[type] = (productCounts[type] || 0) + 1;
        });

        return Object.entries(productCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    };

    const getMaxValue = (data) => {
        return Math.max(...data.map(d => d.value), 1);
    };

    const handleExport = () => {
        try {
            const exportData = [
                { Metric: 'Conversion Rate', Value: `${analytics.conversionRate}%` },
                { Metric: 'Average Policy Value', Value: `₹${analytics.avgPolicyValue.toFixed(2)}` },
                { Metric: 'Total Sales (6 months)', Value: analytics.salesTrend.reduce((sum, t) => sum + t.value, 0) },
                { Metric: 'Total Commission (6 months)', Value: `₹${analytics.commissionTrend.reduce((sum, t) => sum + t.value, 0)}` }
            ];

            exportToCSV(exportData, 'analytics_summary');
            toast.success('Analytics exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export analytics');
        }
    };

    if (loading) {
        return (
            <div className="agent-analytics">
                <div className="analytics-header">
                    <div>
                        <h1>Analytics & Insights</h1>
                        <p>Track your performance and growth</p>
                    </div>
                </div>
                <div className="skeleton-stats-grid">
                    <SkeletonLoader type="stat" count={4} />
                </div>
                <SkeletonLoader type="card" count={4} />
            </div>
        );
    }

    return (
        <div className="agent-analytics">
            <div className="analytics-header">
                <div>
                    <h1>Analytics & Insights</h1>
                    <p>Track your performance and growth</p>
                </div>
                <div className="header-actions">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="time-range-select"
                    >
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="quarter">Last Quarter</option>
                        <option value="year">Last Year</option>
                    </select>
                    <button onClick={handleExport} className="btn btn-primary">
                        📥 Export
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon">📈</div>
                    <div className="metric-content">
                        <h3>Conversion Rate</h3>
                        <p className="metric-value">{analytics.conversionRate}%</p>
                        <small>Policies per customer</small>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon">💰</div>
                    <div className="metric-content">
                        <h3>Avg Policy Value</h3>
                        <p className="metric-value">₹{analytics.avgPolicyValue.toFixed(0)}</p>
                        <small>Average premium</small>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon">📊</div>
                    <div className="metric-content">
                        <h3>Total Sales</h3>
                        <p className="metric-value">{analytics.salesTrend.reduce((sum, t) => sum + t.value, 0)}</p>
                        <small>Last 6 months</small>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon">💵</div>
                    <div className="metric-content">
                        <h3>Total Commission</h3>
                        <p className="metric-value">₹{analytics.commissionTrend.reduce((sum, t) => sum + t.value, 0).toLocaleString()}</p>
                        <small>Last 6 months</small>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Sales Trend Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>📈 Sales Trend</h3>
                        <span className="chart-subtitle">Policies sold per month</span>
                    </div>
                    <div className="bar-chart">
                        {analytics.salesTrend.map((item, index) => {
                            const maxValue = getMaxValue(analytics.salesTrend);
                            const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

                            return (
                                <div key={index} className="bar-item">
                                    <div className="bar-wrapper">
                                        <div
                                            className="bar"
                                            style={{ height: `${height}%` }}
                                            data-value={item.value}
                                        >
                                            <span className="bar-value">{item.value}</span>
                                        </div>
                                    </div>
                                    <span className="bar-label">{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Commission Trend Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>💰 Commission Trend</h3>
                        <span className="chart-subtitle">Earnings per month</span>
                    </div>
                    <div className="bar-chart commission">
                        {analytics.commissionTrend.map((item, index) => {
                            const maxValue = getMaxValue(analytics.commissionTrend);
                            const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

                            return (
                                <div key={index} className="bar-item">
                                    <div className="bar-wrapper">
                                        <div
                                            className="bar"
                                            style={{ height: `${height}%` }}
                                            data-value={`₹${item.value}`}
                                        >
                                            <span className="bar-value">₹{item.value.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <span className="bar-label">{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Products */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>🏆 Top Products</h3>
                        <span className="chart-subtitle">Most sold policies</span>
                    </div>
                    <div className="progress-chart">
                        {analytics.topProducts.length > 0 ? (
                            analytics.topProducts.map((product, index) => {
                                const maxCount = analytics.topProducts[0]?.count || 1;
                                const percentage = (product.count / maxCount) * 100;

                                return (
                                    <div key={index} className="progress-item">
                                        <div className="progress-label">
                                            <span>{product.name}</span>
                                            <strong>{product.count}</strong>
                                        </div>
                                        <div className="progress-bar-bg">
                                            <div
                                                className="progress-bar-fill"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-chart">
                                <p>No product data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Team Performance */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>👥 Team Performance</h3>
                        <span className="chart-subtitle">Top 5 team members</span>
                    </div>
                    <div className="team-performance-list">
                        {analytics.teamPerformance.length > 0 ? (
                            analytics.teamPerformance.map((member, index) => (
                                <div key={index} className="team-member-item">
                                    <div className="member-rank">#{index + 1}</div>
                                    <div className="member-info">
                                        <strong>{member.name}</strong>
                                        <small>{member.sales} sales • ₹{member.earnings.toLocaleString()}</small>
                                    </div>
                                    <div className="member-badge">
                                        {index === 0 && '🥇'}
                                        {index === 1 && '🥈'}
                                        {index === 2 && '🥉'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-chart">
                                <p>No team data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentAnalytics;
