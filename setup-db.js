import { execSync } from 'child_process';

console.log('Setting up database schema...');
try {
  execSync('npx drizzle-kit push', { stdio: 'inherit' });
  console.log('Database schema created successfully!');
} catch (error) {
  console.error('Database setup failed:', error.message);
  process.exit(1);
}
