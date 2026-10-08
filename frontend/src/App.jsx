import React, { useState, useEffect } from 'react';
import TreeVisualizer from './components/TreeVisualizer';
import ControlPanel from './components/ControlPanel';
import TemplateSelector from './components/TemplateSelector';
import AIPrompt from './components/AIPrompt';
import FolderPicker from './components/FolderPicker';
import { FolderTree, Code2, Download, Brain, Bug, FolderOpen } from 'lucide-react';

function App() {
  const [tree, setTree] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const [selectedPath, setSelectedPath] = useState('');
  const [generationHistory, setGenerationHistory] = useState([]);

  // Initialize with empty structure
  useEffect(() => {
    const emptyStructure = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'my-react-app',
      type: 'folder',
      children: []
    };
    setTree(emptyStructure);
    
    // Load last used path from localStorage
    const savedPath = localStorage.getItem('lastProjectPath');
    if (savedPath) {
      setSelectedPath(savedPath);
    }
  }, []);

  const loadTemplate = async (templateType) => {
    try {
      console.log(`📂 Loading template: ${templateType}`);
      const response = await fetch(`/api/templates/${templateType}`);
      const template = await response.json();
      console.log('✅ Template loaded:', template);
      setTree(template);
      setSelectedNode(null);
    } catch (error) {
      console.error('❌ Failed to load template:', error);
      alert('Failed to load template: ' + error.message);
    }
  };

  const generateStructure = async () => {
    if (!tree) {
      console.error('❌ No tree to generate');
      alert('No project structure to generate. Please create a structure first.');
      return;
    }

    if (!selectedPath) {
      alert('Please select a folder location first using the "Choose Folder Location" button.');
      return;
    }

    setIsGenerating(true);
    console.log('🔄 Starting generation process...');
    console.log('📦 Tree being sent:', JSON.stringify(tree, null, 2));
    console.log('📁 Target path:', selectedPath);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          tree,
          customPath: selectedPath
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      const result = await response.json();
      console.log('📨 Response data:', result);
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }
      
      if (result.success) {
        // Save successful path to localStorage
        localStorage.setItem('lastProjectPath', selectedPath);
        
        // Add to generation history
        const historyItem = {
          id: Date.now(),
          path: result.path,
          timestamp: new Date().toISOString(),
          projectName: tree.name
        };
        setGenerationHistory(prev => [historyItem, ...prev.slice(0, 4)]); // Keep last 5
        
        alert(`✅ Project structure generated successfully!\n\nLocation: ${result.path}`);
        console.log('🎉 Generation success:', result);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('❌ Generation error:', error);
      alert(`❌ Failed to generate structure: ${error.message}\n\nCheck browser console for details.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePathSelected = (path) => {
    console.log('📍 Path selected:', path);
    setSelectedPath(path);
  };

  // Test function for debugging
  const testSimpleGeneration = async () => {
    const simpleTree = {
      id: 'test-123',
      name: 'test-simple-project',
      type: 'folder',
      children: [
        {
          id: 'test-456',
          name: 'src',
          type: 'folder',
          children: [
            { id: 'test-789', name: 'App.jsx', type: 'file' },
            { id: 'test-012', name: 'main.jsx', type: 'file' }
          ]
        },
        { id: 'test-345', name: 'package.json', type: 'file' }
      ]
    };

    const testPath = selectedPath || './test-simple-project';
    
    console.log('🧪 Testing with simple tree:', simpleTree);
    console.log('🧪 Test path:', testPath);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          tree: simpleTree,
          customPath: testPath
        }),
      });

      const result = await response.json();
      console.log('🧪 Test result:', result);
      
      if (result.success) {
        alert('✅ Simple test passed! Check the selected folder for test-simple-project');
      } else {
        alert('❌ Simple test failed: ' + result.error);
      }
    } catch (error) {
      console.error('🧪 Test error:', error);
      alert('❌ Test failed: ' + error.message);
    }
  };

  const handleAIStructure = (aiStructure) => {
    console.log('🤖 AI Structure received:', aiStructure);
    setTree(aiStructure);
    setSelectedNode(null);
  };

  // Log tree changes for debugging
  useEffect(() => {
    if (tree) {
      console.log('🌳 Tree updated:', tree);
    }
  }, [tree]);

  if (!tree) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <FolderTree className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  React Structure Visualizer
                </h1>
                <p className="text-sm text-gray-600">
                  AI-Powered Project Structure Generator
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Debug button - only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={testSimpleGeneration}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  title="Test simple generation"
                >
                  <Bug className="h-4 w-4" />
                  <span>Test</span>
                </button>
              )}
              <button
                onClick={generateStructure}
                disabled={isGenerating || !selectedPath}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>{isGenerating ? 'Generating...' : 'Generate Project'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Folder Picker */}
            <FolderPicker 
              onPathSelected={handlePathSelected}
              currentPath={selectedPath}
              isGenerating={isGenerating}
            />

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border p-1">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'ai'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Brain className="h-4 w-4" />
                  <span>AI Generator</span>
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'templates'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Code2 className="h-4 w-4" />
                  <span>Templates</span>
                </button>
              </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'ai' ? (
              <AIPrompt onStructureGenerated={handleAIStructure} />
            ) : (
              <TemplateSelector onTemplateSelect={loadTemplate} />
            )}

            <ControlPanel 
              tree={tree}
              setTree={setTree}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
            />

            {/* Generation History */}
            {generationHistory.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FolderOpen className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-medium text-blue-800">Recent Projects</h3>
                </div>
                <div className="space-y-2">
                  {generationHistory.map((item) => (
                    <div key={item.id} className="text-xs text-blue-700 p-2 bg-blue-100 rounded">
                      <div className="font-medium">{item.projectName}</div>
                      <div className="text-blue-600 truncate">{item.path}</div>
                      <div className="text-blue-500 text-xs">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debug Info Panel */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Bug className="h-4 w-4 text-yellow-600" />
                <h3 className="text-sm font-medium text-yellow-800">Debug Info</h3>
              </div>
              <div className="text-xs text-yellow-700 space-y-1">
                <p>• Open Browser Console (F12)</p>
                <p>• Check backend logs</p>
                <p>• Selected Path: {selectedPath || 'None'}</p>
                <button 
                  onClick={() => {
                    console.log('🌳 Current Tree:', tree);
                    console.log('🎯 Selected Node:', selectedNode);
                    console.log('📍 Selected Path:', selectedPath);
                  }}
                  className="text-blue-600 hover:underline mt-2"
                >
                  Log Current State
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Code2 className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Project Structure
                  </h2>
                </div>
                <div className="text-sm text-gray-500">
                  {tree.children && tree.children.length > 0 ? (
                    <span>📊 {tree.children.length} top-level items</span>
                  ) : (
                    <span>Use AI or templates to generate a structure</span>
                  )}
                </div>
              </div>
              <TreeVisualizer
                tree={tree}
                setTree={setTree}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
              />
            </div>

            {/* Tree JSON Preview for Debugging */}
            <div className="mt-6 bg-gray-100 rounded-lg p-4">
              <details>
                <summary className="cursor-pointer font-medium text-gray-700">
                  📋 Tree JSON (Debug View)
                </summary>
                <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-auto max-h-40">
                  {JSON.stringify(tree, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;