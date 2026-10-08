import fs from 'fs';
import path from 'path';

console.log('🔍 Running diagnostics...');

// Check current directory
console.log('📁 Current directory:', process.cwd());
console.log('👤 User:', process.env.USERNAME || process.env.USER);

// Check write permissions
try {
  const testFile = './write-test.txt';
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('✅ Write permissions: OK');
} catch (error) {
  console.log('❌ Write permissions: FAILED -', error.message);
}

// Check if backend can create folders
try {
  const testDir = './test-dir';
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
    console.log('✅ Folder creation: OK');
    fs.rmdirSync(testDir);
  }
} catch (error) {
  console.log('❌ Folder creation: FAILED -', error.message);
}

// Check node version
console.log('🟢 Node.js version:', process.version);

console.log('🔍 Diagnostics completed');