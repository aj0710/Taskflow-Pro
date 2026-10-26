const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(publicDir, 'index.html'));
fs.cpSync(path.join(__dirname, 'css'), path.join(publicDir, 'css'), { recursive: true });
fs.cpSync(path.join(__dirname, 'js'), path.join(publicDir, 'js'), { recursive: true });

console.log('✓ Build complete: static bundle generated in public/');
