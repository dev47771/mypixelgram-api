const { execSync } = require('child_process');

console.log('Resetting test database...');
try {
  execSync('dotenv -e ./apps/main/src/env/.env.testing.local -- npx prisma db push --force-reset --schema=./apps/main/prisma/schema.prisma', {
    stdio: 'inherit'
  });

  console.log('Test database reset successfully');
} catch (error) {
  console.error('Failed to reset test database:', error);
  process.exit(1);
}
