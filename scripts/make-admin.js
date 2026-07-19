require('dotenv').config();
const { mutateState } = require('../src/data-store');

const email = String(process.argv[2] || '').trim().toLowerCase();
const role = String(process.argv[3] || 'superadmin').trim().toLowerCase();

if (!email || !['admin', 'superadmin', 'user'].includes(role)) {
  console.error('Pemakaian: npm run make-admin -- email@contoh.com superadmin');
  process.exit(1);
}

mutateState((state) => {
  const user = state.users.find((item) => item.email.toLowerCase() === email);
  if (!user) {
    const error = new Error(`Akun ${email} tidak ditemukan. Register terlebih dahulu.`);
    error.status = 404;
    throw error;
  }
  user.role_name = role;
  user.updated_at = new Date().toISOString();
  return { id: user.id, email: user.email, role: user.role_name };
}).then((user) => {
  console.log(`Berhasil: ${user.email} sekarang memiliki role ${user.role}.`);
}).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
