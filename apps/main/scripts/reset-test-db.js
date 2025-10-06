require('dotenv').config({ path: './apps/main/src/env/.env.testing.local' });

const { execSync } = require('child_process');

console.log('Resetting test database...');
try {
  execSync('npx prisma db push --force-reset --schema=./apps/main/prisma/schema.prisma', {
    stdio: 'inherit'
  });

  console.log('Test database reset successfully');
} catch (error) {
  console.error('Failed to reset test database:', error);
  process.exit(1);
}
