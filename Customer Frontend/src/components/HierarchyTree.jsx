import React from 'react';
import PropTypes from 'prop-types';
import './HierarchyTree.css';

/**
 * HierarchyTree Component
 * Displays agent hierarchy in a tree structure
 */
const HierarchyTree = ({ agents, currentAgentId, onAgentClick }) => {
    // Build tree structure from flat array
    const buildTree = (parentId = null, depth = 0) => {
        return agents
            .filter(agent => agent.parentId === parentId)
            .map(agent => ({
                ...agent,
                depth,
                children: buildTree(agent.id, depth + 1)
            }));
    };

    const tree = buildTree();

    const renderNode = (node) => {
        const isCurrentAgent = node.id === currentAgentId;
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div key={node.id} className="tree-node">
                <div
                    className={`node-content ${isCurrentAgent ? 'current' : ''} level-${node.level}`}
                    onClick={() => onAgentClick && onAgentClick(node)}
                >
                    <div className="node-header">
                        <div className="node-icon">
                            {hasChildren ? '👥' : '👤'}
                        </div>
                        <div className="node-info">
                            <div className="node-name">
                                {node.name}
                                {isCurrentAgent && <span className="you-badge">You</span>}
                            </div>
                            <div className="node-code">{node.code}</div>
                        </div>
                        <div className={`node-level level-${node.level}`}>
                            L{node.level}
                        </div>
                    </div>

                    <div className="node-stats">
                        <div className="stat-item">
                            <span className="stat-icon">👥</span>
                            <span className="stat-value">{node.customersCount || 0}</span>
                            <span className="stat-label">Customers</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon">📄</span>
                            <span className="stat-value">{node.policiesSold || 0}</span>
                            <span className="stat-label">Policies</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon">💰</span>
                            <span className="stat-value">₹{(node.totalEarnings || 0).toLocaleString('en-IN')}</span>
                            <span className="stat-label">Earnings</span>
                        </div>
                    </div>
                </div>

                {hasChildren && (
                    <div className="node-children">
                        {node.children.map(child => renderNode(child))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="hierarchy-tree">
            {tree.length > 0 ? (
                tree.map(node => renderNode(node))
            ) : (
                <div className="empty-tree">
                    <div className="empty-icon">🌳</div>
                    <div className="empty-text">No team members yet</div>
                    <div className="empty-subtext">Add sub-agents to build your team</div>
                </div>
            )}
        </div>
    );
};

HierarchyTree.propTypes = {
    agents: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        code: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        parentId: PropTypes.string,
        level: PropTypes.number.isRequired,
        customersCount: PropTypes.number,
        policiesSold: PropTypes.number,
        totalEarnings: PropTypes.number
    })).isRequired,
    currentAgentId: PropTypes.string,
    onAgentClick: PropTypes.func
};

export default HierarchyTree;
