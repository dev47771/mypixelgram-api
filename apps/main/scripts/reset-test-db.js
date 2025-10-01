const { execSync } = require('child_process');

console.log('Resetting test database...');
try {
  // Команды для сброса тестовой БД
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
  execSync('npx prisma db seed', { stdio: 'inherit' });
  console.log('Test database reset successfully');
} catch (error) {
  console.error('Failed to reset test database:', error);
  process.exit(1);
}