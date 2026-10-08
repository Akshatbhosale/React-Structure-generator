import React, { useState } from 'react';
import { Sparkles, Loader, Zap, Copy, Check } from 'lucide-react';

const AIPrompt = ({ onStructureGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState('checking');
  const [copied, setCopied] = useState(false);

  // Update the examplePrompts array with context-specific examples
  const examplePrompts = [
    "Create a car parking management system with slot booking and payment",
    "Build a restaurant food delivery app with menu and order tracking",
    "Make a library management system for books and member tracking",
    "Develop a hotel booking platform with room availability and reservations",
    "Create a school management system for students and teachers",
    "Build a hospital appointment booking system with doctor schedules",
    "Make a real estate property listing website with filters",
    "Develop a fitness tracking app with workouts and progress",
    "Create a music streaming service with playlists and search",
    "Build a task management app with projects and deadlines"
  ];
  // Check AI status on component mount
  React.useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      const response = await fetch('/api/ai/health');
      const data = await response.json();
      setAiStatus(data.status);
    } catch (error) {
      setAiStatus('disconnected');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        onStructureGenerated(result.structure);
        setPrompt('');
      } else {
        throw new Error(result.error || 'Failed to generate structure');
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      alert(`❌ ${error.message}. Using fallback template instead.`);
      // Fallback will be handled by the backend
    } finally {
      setIsGenerating(false);
    }
  };

  const copyExample = (example) => {
    setPrompt(example);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = () => {
    switch (aiStatus) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusText = () => {
    switch (aiStatus) {
      case 'connected': return 'AI Connected';
      case 'disconnected': return 'AI Offline (Using Templates)';
      default: return 'Checking AI...';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Project Generator</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Describe your project
          </label>
          <textarea
            id="ai-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'I need a React dashboard for analytics with charts, user management, and dark mode support'"
            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows="4"
            disabled={isGenerating}
          />
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isGenerating ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Generating with AI...</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              <span>Generate Project Structure</span>
            </>
          )}
        </button>
      </form>

      {/* Example Prompts */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Try these examples:</h4>
        <div className="space-y-2">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => copyExample(example)}
              className="w-full text-left p-3 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="flex-1">{example}</span>
                {copied && prompt === example ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 <strong>Pro Tip:</strong> Be specific about features, libraries, and project type</p>
          {aiStatus === 'disconnected' && (
            <p>⚡ <strong>Setup AI:</strong> Install <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ollama</a> and run: <code className="bg-gray-100 px-1 rounded">ollama pull llama2</code></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPrompt;