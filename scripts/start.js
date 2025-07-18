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

// Support env files that use NEXT_PUBLIC_ prefixed variables
if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
}
if (!process.env.SUPABASE_KEY && process.env.NEXT_PUBLIC_SUPABASE_KEY) {
  process.env.SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;
}

spawn('next', ['start'], { stdio: 'inherit' });
