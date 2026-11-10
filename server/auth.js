import bcrypt from 'bcryptjs';

// PHP password_hash() normally emits $2y$. bcryptjs handles the equivalent $2b$ variant.
export async function verifyAdminPassword(password, hash) {
  if (typeof password !== 'string' || !password || typeof hash !== 'string') return false;
  return bcrypt.compare(password, hash.replace(/^\$2y\$/, '$2b$'));
}
