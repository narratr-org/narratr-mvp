const fs = require('fs');
const { config } = require('dotenv');
const { spawn } = require('child_process');

const envFiles = [
  '.env.local',
  '.vercel/.env.preview.local',
  '.vercel/.env.production.local',
];

for (const file of envFiles) {
  if (fs.existsSync(file)) {
    config({ path: file, override: false });
  }
}

spawn('next', ['start'], { stdio: 'inherit' });
