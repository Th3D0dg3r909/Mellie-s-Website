import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { verifyAdminPassword } from '../server/auth.js';

test('existing PHP bcrypt $2y$ hashes work without changing the admin password', async () => {
  const hash = (await bcrypt.hash('alleen-voor-test', 4)).replace('$2b$', '$2y$');
  assert.equal(await verifyAdminPassword('alleen-voor-test', hash), true);
  assert.equal(await verifyAdminPassword('verkeerd', hash), false);
});
