const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { readState, isNetlifyRuntime } = require('./data-store');

const COOKIE_NAME = 'mf_auth';
const CSRF_COOKIE = 'mf_csrf';

function isProduction() {
  return process.env.NODE_ENV === 'production' || isNetlifyRuntime();
}

function createCsrfToken() {
  const nonce = crypto.randomBytes(24).toString('hex');
  const signature = crypto.createHmac('sha256', process.env.CSRF_SECRET).update(nonce).digest('hex');
  return `${nonce}.${signature}`;
}

function verifyCsrfToken(token) {
  const [nonce, signature] = String(token || '').split('.');
  if (!nonce || !signature) return false;
  const expected = crypto.createHmac('sha256', process.env.CSRF_SECRET).update(nonce).digest('hex');
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function issueAuth(res, user) {
  const token = jwt.sign(
    { sub: user.id, role: user.role_name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d', issuer: 'minefiveid-store', audience: 'minefiveid-user' }
  );
  const secure = isProduction();
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });

  const csrf = createCsrfToken();
  res.cookie(CSRF_COOKIE, csrf, {
    httpOnly: false,
    secure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
  return csrf;
}

function clearAuth(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.clearCookie(CSRF_COOKIE, { path: '/' });
}

async function attachUser(req, _res, next) {
  req.user = null;
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'minefiveid-store',
      audience: 'minefiveid-user'
    });
    const state = await readState();
    const user = state.users.find((item) => item.id === Number(payload.sub));
    if (user && user.status === 'active') {
      req.user = {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        whatsapp: user.whatsapp,
        status: user.status,
        role_name: user.role_name
      };
    }
  } catch (_) {
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Silakan login terlebih dahulu.' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Silakan login terlebih dahulu.' });
  if (!['admin', 'superadmin'].includes(req.user.role_name)) {
    return res.status(403).json({ error: 'Akses admin ditolak.' });
  }
  next();
}

function requireSuperAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Silakan login terlebih dahulu.' });
  if (req.user.role_name !== 'superadmin') {
    return res.status(403).json({ error: 'Hanya superadmin yang dapat melakukan tindakan ini.' });
  }
  next();
}

function csrfProtection(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.path.startsWith('/api/plugin/') || req.path === '/api/discord/interactions') return next();
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get('x-csrf-token');
  if (
    !cookieToken ||
    !headerToken ||
    cookieToken.length !== headerToken.length ||
    !crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken)) ||
    !verifyCsrfToken(cookieToken)
  ) {
    return res.status(403).json({ error: 'Token keamanan tidak valid. Muat ulang halaman lalu coba lagi.' });
  }
  next();
}

function ensureCsrfCookie(req, res, next) {
  if (!req.cookies?.[CSRF_COOKIE]) {
    res.cookie(CSRF_COOKIE, createCsrfToken(), {
      httpOnly: false,
      secure: isProduction(),
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
  }
  next();
}

module.exports = {
  attachUser,
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  csrfProtection,
  ensureCsrfCookie,
  issueAuth,
  clearAuth
};
