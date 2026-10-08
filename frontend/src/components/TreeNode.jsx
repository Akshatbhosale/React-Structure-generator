import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File, Plus, Trash2, Edit3 } from 'lucide-react';

const TreeNode = ({ 
  node, 
  level, 
  onUpdate, 
  onAddChild, 
  onDelete, 
  onSelect, 
  selectedNode 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);

  const isSelected = selectedNode && selectedNode.id === node.id;

  const handleAddChild = (type) => {
    const newChild = {
      id: Math.random().toString(36).substr(2, 9),
      name: type === 'folder' ? 'new-folder' : 'new-file.jsx',
      type: type,
      children: type === 'folder' ? [] : undefined
    };
    onAddChild(node.id, newChild);
    setIsExpanded(true);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      onUpdate(node.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditName(node.name);
      setIsEditing(false);
    }
  };

  const indent = level * 20;

  return (
    <div>
      {/* Node */}
      <div 
        className={`
          flex items-center space-x-2 py-1 px-3 rounded cursor-pointer
          ${isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100'}
          transition-colors
        `}
        style={{ marginLeft: `${indent}px` }}
        onClick={() => onSelect(node)}
      >
        {/* Expand/Collapse Button */}
        {node.type === 'folder' && node.children && node.children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        )}

        {/* Placeholder for non-folder or empty folders */}
        {(!node.children || node.children.length === 0) && (
          <div className="w-5"></div>
        )}

        {/* Icon */}
        {node.type === 'folder' ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 text-blue-500" />
          )
        ) : (
          <File className="h-4 w-4 text-green-500" />
        )}

        {/* Name or Input */}
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyPress}
            className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm"
            autoFocus
          />
        ) : (
          <span 
            className="flex-1 select-none"
            onDoubleClick={() => setIsEditing(true)}
          >
            {node.name}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
          {!isEditing && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-1 hover:bg-gray-200 rounded"
                title="Rename"
              >
                <Edit3 className="h-3 w-3" />
              </button>
              
              {node.type === 'folder' && (
                <div className="relative group">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddChild('folder');
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Add Folder"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddChild('file');
                }}
                className="p-1 hover:bg-gray-200 rounded"
                title="Add File"
              >
                <File className="h-3 w-3" />
              </button>

              {level > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node.id);
                  }}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onSelect={onSelect}
              selectedNode={selectedNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;