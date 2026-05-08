import { execSync } from 'child_process';

export default async function globalSetup() {
  // Ensure admin user exists for E2E tests
  execSync('cd .. && npm run seed:admin', {
    stdio: 'inherit',
    env: { ...process.env },
  });
}
