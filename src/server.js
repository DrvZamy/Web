require('dotenv').config();
const app = require('./app');

const PORT = Number(process.env.PORT || 3000);
const server = app.listen(PORT, () => {
  console.log(`MineFiveID berjalan di http://localhost:${PORT}`);
});

function shutdown() {
  console.log('Menutup MineFiveID...');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
