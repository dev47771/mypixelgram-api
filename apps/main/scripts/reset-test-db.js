const { execSync } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

const SERVICE_ROOT = path.resolve(__dirname, '..');
const ENV = path.join(SERVICE_ROOT, 'src', 'env', '.env');
const ENV_TESTING = path.join(SERVICE_ROOT, 'src', 'env', '.env.testing');
const ENV_TESTING_LOCAL = path.join(SERVICE_ROOT, 'src', 'env', '.env.testing.local');

if (fs.existsSync(ENV)) {
  dotenv.config({ path: ENV });
}
if (fs.existsSync(ENV_TESTING)) {
  dotenv.config({ path: ENV_TESTING, override: true });
}
if (fs.existsSync(ENV_TESTING_LOCAL)) {
  dotenv.config({ path: ENV_TESTING_LOCAL, override: true });
}

try {
  console.log('Resetting test DB and applying migrations...');
  execSync('npx prisma migrate reset --force', {
    stdio: 'inherit',
    env: process.env,
    cwd: SERVICE_ROOT,
  });
  console.log('Test DB is ready.');
} catch (error) {
  console.error('Error while resetting test DB:', error);
  process.exit(1);
}