import React, { useState } from 'react';
import { FolderOpen, Folder, Download, AlertCircle } from 'lucide-react';

const FolderPicker = ({ onPathSelected, currentPath, isGenerating }) => {
  const [isPickerSupported, setIsPickerSupported] = useState(true);

  // Check if the File System Access API is supported
  React.useEffect(() => {
    if (!window.showDirectoryPicker) {
      setIsPickerSupported(false);
      console.warn('File System Access API not supported in this browser');
    }
  }, []);

  const handlePickFolder = async () => {
    if (!window.showDirectoryPicker) {
      alert('Folder selection is not supported in your browser. Please use Chrome, Edge, or Opera.');
      return;
    }

    try {
      console.log('📁 Opening folder picker...');
      
      // Request directory access
      const directoryHandle = await window.showDirectoryPicker();
      const path = directoryHandle.name;
      
      console.log('✅ Folder selected:', path);
      
      // Update the UI with selected path
      onPathSelected(path);
      
    } catch (error) {
      // User cancelled the picker or permission denied
      if (error.name !== 'AbortError') {
        console.error('❌ Folder picker error:', error);
        alert('Failed to select folder: ' + error.message);
      }
    }
  };

  const handleManualPath = () => {
    const path = prompt('Enter the full path where you want to create the project:\n\nExample: C:\\Users\\YourName\\Projects', currentPath || '');
    if (path) {
      onPathSelected(path);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-2 mb-4">
        <FolderOpen className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Project Location</h3>
      </div>

      {/* Current Selection */}
      {currentPath && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Folder className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Selected Location:</span>
          </div>
          <p className="text-sm text-green-700 mt-1 font-mono break-all">
            {currentPath}
          </p>
        </div>
      )}

      {/* Browser Not Supported Warning */}
      {!isPickerSupported && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Browser Limitation</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Folder picker not supported. Use Chrome, Edge, or Opera for best experience.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {/* Folder Picker Button */}
        <button
          onClick={handlePickFolder}
          disabled={isGenerating}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FolderOpen className="h-4 w-4" />
          <span>Choose Folder Location</span>
        </button>

        {/* Manual Path Input */}
        <button
          onClick={handleManualPath}
          disabled={isGenerating}
          className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Folder className="h-4 w-4" />
          <span>Enter Path Manually</span>
        </button>

        {/* Info Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 <strong>Tip:</strong> Select an empty folder or create a new one</p>
          <p>🔒 <strong>Note:</strong> We only request access to the selected folder</p>
          {!currentPath && (
            <p className="text-orange-600">⚠️ Please select a folder location before generating</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderPicker;