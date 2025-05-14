// Simple build script to help with Vercel deployment
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Starting custom build process for Vercel deployment...');

try {
  // Ensure we're using the right Node.js version
  console.log('Node version:', process.version);
  
  // Run the Vite build
  console.log('Running Vite build...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Verify the build output
  const distPath = path.resolve('dist');
  if (fs.existsSync(distPath)) {
    console.log('Build completed successfully. Output directory:', distPath);
    const files = fs.readdirSync(distPath);
    console.log('Files in dist directory:', files);
  } else {
    console.error('Error: dist directory not found after build');
    process.exit(1);
  }
  
  console.log('Build process completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
