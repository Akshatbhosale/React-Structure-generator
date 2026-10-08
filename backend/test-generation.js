import fs from 'fs-extra';
import path from 'path';

// Test tree structure
const testTree = {
  name: 'test-project',
  type: 'folder',
  children: [
    {
      name: 'src',
      type: 'folder',
      children: [
        { name: 'App.jsx', type: 'file' },
        { name: 'main.jsx', type: 'file' }
      ]
    },
    { name: 'package.json', type: 'file' }
  ]
};

function createFileStructure(node, basePath) {
  const nodePath = path.join(basePath, node.name);
  
  console.log(`Creating: ${nodePath} (${node.type})`);
  
  try {
    if (node.type === 'folder') {
      if (!fs.existsSync(nodePath)) {
        fs.mkdirSync(nodePath, { recursive: true });
        console.log(`✅ Created folder: ${nodePath}`);
      }
      if (node.children) {
        node.children.forEach(child => createFileStructure(child, nodePath));
      }
    } else {
      const content = `// ${node.name}\n// Test file`;
      fs.writeFileSync(nodePath, content);
      console.log(`✅ Created file: ${nodePath}`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

console.log('🧪 Testing file generation...');
createFileStructure(testTree, './test-output');
console.log('🧪 Test completed. Check ./test-output folder');