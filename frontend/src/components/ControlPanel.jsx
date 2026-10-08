import React, { useState } from 'react';
import { Settings, FolderPlus, FilePlus, Trash2 } from 'lucide-react';

const ControlPanel = ({ tree, setTree, selectedNode, setSelectedNode }) => {
  const [newNodeName, setNewNodeName] = useState('');

  const addNode = (type) => {
    if (!newNodeName.trim()) return;

    const newNode = {
      id: Math.random().toString(36).substr(2, 9),
      name: newNodeName.trim() + (type === 'file' ? '.jsx' : ''),
      type: type,
      children: type === 'folder' ? [] : undefined
    };

    if (selectedNode && selectedNode.type === 'folder') {
      const addNodeToTree = (currentNode) => {
        if (currentNode.id === selectedNode.id) {
          return {
            ...currentNode,
            children: [...(currentNode.children || []), newNode]
          };
        }
        
        if (currentNode.children) {
          return {
            ...currentNode,
            children: currentNode.children.map(addNodeToTree)
          };
        }
        
        return currentNode;
      };

      setTree(addNodeToTree(tree));
    } else {
      // Add to root if no folder is selected
      setTree({
        ...tree,
        children: [...(tree.children || []), newNode]
      });
    }

    setNewNodeName('');
  };

  const deleteSelectedNode = () => {
    if (selectedNode && selectedNode.id !== tree.id) {
      const deleteFromTree = (currentNode) => {
        if (currentNode.children) {
          const filteredChildren = currentNode.children
            .filter(child => child.id !== selectedNode.id)
            .map(deleteFromTree);
          
          return {
            ...currentNode,
            children: filteredChildren
          };
        }
        
        return currentNode;
      };

      setTree(deleteFromTree(tree));
      setSelectedNode(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Controls</h3>
      </div>

      <div className="space-y-4">
        {/* Selected Node Info */}
        {selectedNode && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900">Selected:</p>
            <p className="text-sm text-blue-700 truncate">
              {selectedNode.type === 'folder' ? '📁' : '📄'} {selectedNode.name}
            </p>
          </div>
        )}

        {/* Add New Node */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add New Node
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              placeholder="Node name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') addNode('file');
              }}
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => addNode('folder')}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
            >
              <FolderPlus className="h-4 w-4" />
              <span>Add Folder</span>
            </button>
            <button
              onClick={() => addNode('file')}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              <FilePlus className="h-4 w-4" />
              <span>Add File</span>
            </button>
          </div>
        </div>

        {/* Delete Selected */}
        {selectedNode && selectedNode.id !== tree.id && (
          <button
            onClick={deleteSelectedNode}
            className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Selected</span>
          </button>
        )}

        {/* Project Info */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Project Info</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Double-click to rename nodes</p>
            <p>• Click folders to expand/collapse</p>
            <p>• Select nodes to manage them</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;