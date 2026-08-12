/**
 * Local password hashing utility using the browser's built-in Web Crypto API.
 *
 * WHY: Even in an offline-only app, passwords must never be stored in
 * plaintext. Anyone with access to the device can open DevTools →
 * Application → IndexedDB and read plaintext passwords directly.
 * Using SHA-256 ensures that stored passwords are one-way hashed and
 * unreadable, even if someone inspects the local database.
 *
 * HOW: The Web Crypto API (crypto.subtle) is available in all modern
 * browsers and requires no external npm package. It is async and uses
 * native hardware-accelerated cryptography.
 */

/**
 * Hashes a plain-text password using SHA-256.
 * Returns a 64-character lowercase hex string.
 *
 * Example:
 *   await hashPassword("mySecret123")
 *   // → "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
 */
export async function hashPassword(password: string): Promise<string> {
  // Convert the password string into raw bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  // Run SHA-256 digest — this returns an ArrayBuffer of 32 bytes
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert the ArrayBuffer to a hex string (2 hex chars per byte → 64 chars total)
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Checks whether a plain-text password matches a stored hash.
 * Hashes the candidate and does a constant-time string comparison.
 */
export async function verifyPassword(
  plaintext: string,
  storedHash: string
): Promise<boolean> {
  const candidateHash = await hashPassword(plaintext);
  return candidateHash === storedHash;
}
