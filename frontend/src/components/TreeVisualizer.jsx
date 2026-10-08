import React from 'react';
import TreeNode from './TreeNode';

const TreeVisualizer = ({ tree, setTree, selectedNode, setSelectedNode }) => {
  const updateNode = (nodeId, updates) => {
    const updateTree = (currentNode) => {
      if (currentNode.id === nodeId) {
        return { ...currentNode, ...updates };
      }
      
      if (currentNode.children) {
        return {
          ...currentNode,
          children: currentNode.children.map(updateTree)
        };
      }
      
      return currentNode;
    };

    setTree(updateTree(tree));
  };

  const addChildNode = (parentId, newNode) => {
    const addNode = (currentNode) => {
      if (currentNode.id === parentId) {
        return {
          ...currentNode,
          children: [...(currentNode.children || []), newNode]
        };
      }
      
      if (currentNode.children) {
        return {
          ...currentNode,
          children: currentNode.children.map(addNode)
        };
      }
      
      return currentNode;
    };

    setTree(addNode(tree));
  };

  const deleteNode = (nodeId) => {
    const removeNode = (currentNode) => {
      if (currentNode.children) {
        const filteredChildren = currentNode.children
          .filter(child => child.id !== nodeId)
          .map(removeNode);
        
        return {
          ...currentNode,
          children: filteredChildren
        };
      }
      
      return currentNode;
    };

    setTree(removeNode(tree));
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(null);
    }
  };

  return (
    <div className="font-mono text-sm">
      <TreeNode
        node={tree}
        level={0}
        onUpdate={updateNode}
        onAddChild={addChildNode}
        onDelete={deleteNode}
        onSelect={setSelectedNode}
        selectedNode={selectedNode}
      />
    </div>
  );
};

export default TreeVisualizer;

