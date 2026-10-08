import React from 'react';
import { LayoutTemplate, Zap, Package } from 'lucide-react';

const TemplateSelector = ({ onTemplateSelect }) => {
  const templates = [
    {
      id: 'basic',
      name: 'Basic React App',
      description: 'Simple React project structure',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      id: 'dashboard',
      name: 'Dashboard App',
      description: 'Structured for admin dashboards',
      icon: LayoutTemplate,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Templates</h3>
      </div>

      <div className="space-y-3">
        {templates.map((template) => {
          const IconComponent = template.icon;
          return (
            <button
              key={template.id}
              onClick={() => onTemplateSelect(template.id)}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <IconComponent className={`h-5 w-5 ${template.color}`} />
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-900">
                    {template.name}
                  </p>
                  <p className="text-xs text-gray-600 group-hover:text-blue-700">
                    {template.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Select a template to start with a pre-defined structure
        </p>
      </div>
    </div>
  );
};

export default TemplateSelector;