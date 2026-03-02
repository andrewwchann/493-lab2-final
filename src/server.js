const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const querystring = require('querystring');

const {
  Router,
  wireRegistrationRoutes,
  wireAuthRoutes,
  wireSubmissionRoutes,
  wireReviewRoutes,
  wireNotificationRoutes,
  wireScheduleRoutes,
  wirePricingRoutes,
  wireConferenceRegistrationRoutes,
  wireTicketRoutes,
} = require('./controllers/router');
const { RegisterController } = require('./controllers/register_controller');
const { LoginController } = require('./controllers/login_controller');
const { PasswordController } = require('./controllers/password_controller');
const { SubmissionController } = require('./controllers/submission_controller');
const { ReviewController } = require('./controllers/review_controller');
const { NotificationController } = require('./controllers/notification_controller');
const { ScheduleController } = require('./controllers/schedule_controller');
const { PricingController } = require('./controllers/pricing_controller');
const { RegistrationController } = require('./controllers/registration_controller');
const { TicketController } = require('./controllers/ticket_controller');

const { DataStore } = require('./services/data_store');
const { SessionService } = require('./services/session_service');
const { RegistrationService } = require('./services/registration_service');
const { AuthService } = require('./services/auth_service');
const { FileUploadService } = require('./services/file_upload_service');
const { SubmissionService } = require('./services/submission_service');
const { ReviewService } = require('./services/review_service');
const { NotificationService } = require('./services/notification_service');
const { PublicationService } = require('./services/publication_service');
const { ScheduleService } = require('./services/schedule_service');
const { PricingService } = require('./services/pricing_service');
const { PaymentGatewayService } = require('./services/payment_gateway_service');
const { TicketService } = require('./services/ticket_service');
const { PaymentService } = require('./services/payment_service');

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 3000);
const SESSION_COOKIE = 'sessionToken';
const IS_TEST_RUNTIME = Boolean(process.env.NODE_TEST_CONTEXT) || process.argv.includes('--test');
const DATA_DB_PATH =
  process.env.CMS_DB_PATH ||
  (IS_TEST_RUNTIME ? path.join(os.tmpdir(), `ece493-cms-data-${process.pid}.sqlite`) : path.join(process.cwd(), 'data', 'cms.sqlite'));
const SESSION_DB_PATH =
  process.env.SESSION_DB_PATH ||
  (IS_TEST_RUNTIME
    ? path.join(os.tmpdir(), `ece493-cms-sessions-${process.pid}.sqlite`)
    : path.join(process.cwd(), 'data', 'sessions.sqlite'));
const VIEWS_DIR = path.join(__dirname, 'views');
const ASSETS_DIR = path.join(__dirname, 'assets');
const MAX_BODY_BYTES = 1024 * 1024;

const VIEW_RENDERERS = {
  'login.html': { fn: 'renderLoginErrors', mode: 'errors' },
  'register.html': { fn: 'renderRegistrationErrors', mode: 'errors' },
  'change_password.html': { fn: 'renderPasswordErrors', mode: 'errors' },
  'dashboard.html': { fn: 'renderDashboardContext', mode: 'payload' },
  'assign_reviewers.html': { fn: 'renderAssignReviewers', mode: 'payload' },
  'submit_paper.html': { fn: 'renderSubmissionState', mode: 'payload' },
  'draft_list.html': { fn: 'renderDraftList', mode: 'payload' },
  'schedule_preview.html': { fn: 'renderSchedulePreview', mode: 'payload' },
  'schedule_edit.html': { fn: 'renderScheduleEditResult', mode: 'payload' },
  'schedule_publish.html': { fn: 'renderSchedulePublishResult', mode: 'payload' },
  'public_schedule.html': { fn: 'renderPublicSchedule', mode: 'payload' },
  'pricing.html': { fn: 'renderPricing', mode: 'payload' },
  'registration.html': { fn: 'renderConferenceRegistration', mode: 'payload' },
  'ticket.html': { fn: 'renderTicket', mode: 'payload' },
  'reviewer_invitation.html': { fn: 'renderReviewerInvitation', mode: 'payload' },
  'reviewer_assignments.html': { fn: 'renderReviewerAssignments', mode: 'payload' },
  'review_form.html': { fn: 'renderReviewForm', mode: 'payload' },
  'editor_reviews.html': { fn: 'renderEditorReviews', mode: 'payload' },
  'decision.html': { fn: 'renderDecision', mode: 'payload' },
  'author_notification.html': { fn: 'renderAuthorNotification', mode: 'payload' },
  'update_manuscript.html': { fn: 'renderUpdateManuscript', mode: 'payload' },
};

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((acc, chunk) => {
      const separatorIndex = chunk.indexOf('=');
      if (separatorIndex === -1) {
        return acc;
      }
      const key = chunk.slice(0, separatorIndex).trim();
      const value = chunk.slice(separatorIndex + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function normalizeScalar(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }

  if (trimmed === 'true') {
    return true;
  }
  if (trimmed === 'false') {
    return false;
  }

  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    const parsed = safeJsonParse(trimmed);
    if (parsed !== null) {
      return parsed;
    }
  }

  return value;
}

function normalizeBody(payload) {
  if (Buffer.isBuffer(payload)) {
    return payload;
  }
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeBody(item));
  }
  if (!payload || typeof payload !== 'object') {
    return normalizeScalar(payload);
  }

  const normalized = {};
  for (const [key, value] of Object.entries(payload)) {
    normalized[key] = normalizeBody(value);
  }

  if (typeof normalized.file === 'string' && normalized.file.trim()) {
    normalized.file = {
      name: path.basename(normalized.file.trim()),
      sizeMb: Number(normalized.fileSizeMb || 1),
    };
  }

  if (typeof normalized.reviewerIds === 'string') {
    normalized.reviewerIds = normalized.reviewerIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }

  if (typeof normalized.acceptedSubmissionIds === 'string') {
    normalized.acceptedSubmissionIds = normalized.acceptedSubmissionIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }

  return normalized;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;

    req.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        reject(new Error('Request body too large.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    req.on('error', (error) => reject(error));
  });
}

function parseMultipartBody(rawBodyBuffer, contentType) {
  const boundaryMatch = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '');
  const boundary = boundaryMatch && (boundaryMatch[1] || boundaryMatch[2]);
  if (!boundary) {
    return {};
  }

  const source = rawBodyBuffer.toString('binary');
  const parts = source.split(`--${boundary}`);
  const parsed = {};

  for (const rawPart of parts) {
    const trimmed = rawPart.replace(/^\r\n/, '').replace(/\r\n$/, '');
    if (!trimmed || trimmed === '--') {
      continue;
    }

    const headerEnd = trimmed.indexOf('\r\n\r\n');
    if (headerEnd === -1) {
      continue;
    }

    const headerText = trimmed.slice(0, headerEnd);
    let dataText = trimmed.slice(headerEnd + 4);
    dataText = dataText.replace(/\r\n$/, '');

    const dispositionLine = headerText
      .split('\r\n')
      .find((line) => line.toLowerCase().startsWith('content-disposition'));
    if (!dispositionLine) {
      continue;
    }

    const nameMatch = /name="([^"]+)"/i.exec(dispositionLine);
    if (!nameMatch) {
      continue;
    }
    const fieldName = nameMatch[1];

    const filenameMatch = /filename="([^"]*)"/i.exec(dispositionLine);
    if (filenameMatch && filenameMatch[1]) {
      const contentTypeLine = headerText
        .split('\r\n')
        .find((line) => line.toLowerCase().startsWith('content-type:'));
      const mimeType = contentTypeLine ? contentTypeLine.split(':')[1].trim() : 'application/octet-stream';
      const fileBuffer = Buffer.from(dataText, 'binary');
      parsed[fieldName] = {
        name: path.basename(filenameMatch[1]),
        mimeType,
        sizeMb: fileBuffer.length / (1024 * 1024),
        buffer: fileBuffer,
      };
      continue;
    }

    parsed[fieldName] = Buffer.from(dataText, 'binary').toString('utf8');
  }

  return parsed;
}

function parseRequestBody(rawBodyBuffer, contentType = '') {
  if (!rawBodyBuffer || rawBodyBuffer.length === 0) {
    return {};
  }

  const lowerContentType = String(contentType).toLowerCase();
  if (lowerContentType.includes('application/json')) {
    return normalizeBody(safeJsonParse(rawBodyBuffer.toString('utf8')) || {});
  }
  if (lowerContentType.includes('application/x-www-form-urlencoded')) {
    return normalizeBody(querystring.parse(rawBodyBuffer.toString('utf8')));
  }
  if (lowerContentType.includes('multipart/form-data')) {
    return normalizeBody(parseMultipartBody(rawBodyBuffer, contentType));
  }

  return {};
}

function getViewPath(viewName) {
  const safeName = path.basename(viewName || '');
  if (!safeName.endsWith('.html')) {
    return null;
  }
  return path.join(VIEWS_DIR, safeName);
}

function injectPayload(html, viewName, payload) {
  const rendererConfig = VIEW_RENDERERS[viewName];
  if (!rendererConfig) {
    return html;
  }

  const payloadWithoutView = { ...payload };
  delete payloadWithoutView.view;
  if (Object.keys(payloadWithoutView).length === 0) {
    return html;
  }

  const serialized = JSON.stringify(payloadWithoutView).replace(/</g, '\\u003c');
  const argExpression =
    rendererConfig.mode === 'errors'
      ? '(window.__CMS_PAYLOAD.errors || {})'
      : 'window.__CMS_PAYLOAD';

  const script = `<script>
window.__CMS_PAYLOAD = ${serialized};
if (typeof window.${rendererConfig.fn} === 'function') {
  window.${rendererConfig.fn}(${argExpression});
}
</script>`;

  if (html.includes('</body>')) {
    return html.replace('</body>', `${script}\n</body>`);
  }
  return `${html}\n${script}`;
}

function injectGlobalStylesheet(html) {
  const stylesheetTag = '<link rel="stylesheet" href="/assets/styles.css">';
  if (html.includes(stylesheetTag) || !html.includes('</head>')) {
    return html;
  }
  return html.replace('</head>', `  ${stylesheetTag}\n</head>`);
}

function sendJson(res, statusCode, body, extraHeaders = {}) {
  const data = JSON.stringify(body || {});
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
    ...extraHeaders,
  });
  res.end(data);
}

function sendHtml(res, statusCode, html, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html),
    ...extraHeaders,
  });
  res.end(html);
}

function serveStaticAsset(res, pathname) {
  const relative = pathname.replace(/^\/assets\//, '');
  const normalized = path.normalize(relative).replace(/^(\.\.[/\\])+/, '');
  const assetPath = path.join(ASSETS_DIR, normalized);
  if (!assetPath.startsWith(ASSETS_DIR)) {
    sendJson(res, 403, { error: 'Forbidden.' });
    return;
  }
  if (!fs.existsSync(assetPath) || !fs.statSync(assetPath).isFile()) {
    sendJson(res, 404, { error: 'Asset not found.' });
    return;
  }

  const extension = path.extname(assetPath).toLowerCase();
  const contentType = CONTENT_TYPES[extension] || 'application/octet-stream';
  const content = fs.readFileSync(assetPath);
  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(content),
  });
  res.end(content);
}

function renderHomePage() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CMS Dev Server</title>
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
  <main>
    <h1>CMS Dev Server</h1>
    <p>Start at <a href="/login">/login</a> or <a href="/register">/register</a>.</p>
    <h2>Demo Accounts</h2>
    <ul>
      <li>author@example.com / Author123!</li>
      <li>editor@example.com / Editor123!</li>
      <li>reviewer1@example.com / Reviewer123!</li>
      <li>attendee@example.com / Attendee123!</li>
    </ul>
  </main>
</body>
</html>`;
}

function seedDemoAccounts({ registrationService, dataStore }) {
  const demoUsers = [
    { email: 'author@example.com', password: 'Author123!', roles: ['author'] },
    { email: 'editor@example.com', password: 'Editor123!', roles: ['editor'] },
    { email: 'reviewer1@example.com', password: 'Reviewer123!', roles: ['reviewer'] },
    { email: 'reviewer2@example.com', password: 'Reviewer123!', roles: ['reviewer'] },
    { email: 'reviewer3@example.com', password: 'Reviewer123!', roles: ['reviewer'] },
    { email: 'attendee@example.com', password: 'Attendee123!', roles: ['attendee'] },
  ];

  for (const user of demoUsers) {
    const existing = dataStore.findOne('accounts', (row) => String(row.email).toLowerCase() === user.email);
    if (existing) {
      continue;
    }

    const created = registrationService.register({
      email: user.email,
      password: user.password,
    });
    if (created.ok) {
      dataStore.updateById('accounts', created.account.id, { roles: user.roles });
    }
  }
}

function buildApplicationContext() {
  const dataStore = new DataStore({ dbPath: DATA_DB_PATH });
  const sessionService = new SessionService({ dbPath: SESSION_DB_PATH });
  const registrationService = new RegistrationService({ dataStore });
  const authService = new AuthService({ dataStore, sessionService });
  const fileUploadService = new FileUploadService();
  const submissionService = new SubmissionService({ dataStore, fileUploadService });
  const notificationService = new NotificationService({ dataStore });
  const reviewService = new ReviewService({ dataStore, notificationService });
  const publicationService = new PublicationService();
  const scheduleService = new ScheduleService({ dataStore, publicationService, notificationService });
  const pricingService = new PricingService({ dataStore });
  const paymentGatewayService = new PaymentGatewayService();
  const ticketService = new TicketService({ dataStore, notificationService });
  const paymentService = new PaymentService({
    dataStore,
    paymentGatewayService,
    pricingService,
    ticketService,
  });

  const registerController = new RegisterController({ registrationService });
  const loginController = new LoginController({ authService, dataStore });
  const passwordController = new PasswordController({ authService });
  const submissionController = new SubmissionController({ submissionService });
  const reviewController = new ReviewController({ reviewService });
  const notificationController = new NotificationController({ dataStore, notificationService });
  const scheduleController = new ScheduleController({ scheduleService });
  const pricingController = new PricingController({ pricingService });
  const registrationController = new RegistrationController({ pricingService, paymentService });
  const ticketController = new TicketController({ ticketService });

  const router = new Router({ sessionService });
  wireRegistrationRoutes(router, registerController);
  wireAuthRoutes(router, loginController, passwordController);
  wireSubmissionRoutes(router, submissionController);
  wireReviewRoutes(router, reviewController);
  wireNotificationRoutes(router, notificationController);
  wireScheduleRoutes(router, scheduleController);
  wirePricingRoutes(router, pricingController);
  wireConferenceRegistrationRoutes(router, registrationController);
  wireTicketRoutes(router, ticketController);

  seedDemoAccounts({ registrationService, dataStore });

  return {
    router,
    services: {
      dataStore,
      sessionService,
      registrationService,
      authService,
      fileUploadService,
      submissionService,
      notificationService,
      reviewService,
      publicationService,
      scheduleService,
      pricingService,
      paymentGatewayService,
      ticketService,
      paymentService,
    },
  };
}

async function serveView(res, statusCode, viewName, payload = {}) {
  const viewPath = getViewPath(viewName);
  if (!viewPath || !fs.existsSync(viewPath)) {
    sendJson(res, 500, { error: `View not found: ${viewName}` });
    return;
  }
  const html = fs.readFileSync(viewPath, 'utf8');
  const styled = injectGlobalStylesheet(html);
  const hydrated = injectPayload(styled, viewName, payload);
  sendHtml(res, statusCode, hydrated);
}

function setSessionCookie(res, token) {
  const value = encodeURIComponent(token);
  const cookie = `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax`;
  res.setHeader('Set-Cookie', cookie);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
}

function createServer() {
  const { router, services } = buildApplicationContext();
  const { sessionService } = services;

  return http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const pathname = requestUrl.pathname;
      const method = req.method.toUpperCase();

      if (method === 'GET' && pathname === '/') {
        sendHtml(res, 200, renderHomePage());
        return;
      }

      if (method === 'GET' && pathname.startsWith('/assets/')) {
        serveStaticAsset(res, pathname);
        return;
      }

      if (method === 'POST' && pathname === '/logout') {
        const cookies = parseCookies(req.headers.cookie || '');
        const logoutToken = cookies[SESSION_COOKIE] || req.headers['x-session-token'] || req.headers['X-Session-Token'];
        if (logoutToken) {
          sessionService.deleteSession(logoutToken);
        }
        clearSessionCookie(res);
        res.writeHead(302, { Location: '/login' });
        res.end();
        return;
      }

      if (method === 'GET' && pathname.endsWith('.html')) {
        await serveView(res, 200, path.basename(pathname), {});
        return;
      }

      const rawBody = method === 'GET' ? Buffer.alloc(0) : await readBody(req);
      const parsedBody = parseRequestBody(rawBody, req.headers['content-type'] || '');
      const queryBody = normalizeBody(querystring.parse(requestUrl.search.slice(1)));
      const body = { ...queryBody, ...parsedBody };

      const cookies = parseCookies(req.headers.cookie || '');
      const dispatchHeaders = { ...req.headers };
      if (!dispatchHeaders['x-session-token'] && cookies[SESSION_COOKIE]) {
        dispatchHeaders['x-session-token'] = cookies[SESSION_COOKIE];
      }

      const result = await Promise.resolve(
        router.dispatch({
          method,
          path: pathname,
          body,
          headers: dispatchHeaders,
          params: {},
        })
      );

      const statusCode = result && result.status ? result.status : 500;
      const responseBody = (result && result.body) || {};

      if (responseBody.redirectTo) {
        if (responseBody.sessionToken) {
          setSessionCookie(res, responseBody.sessionToken);
        }
        res.writeHead(302, { Location: responseBody.redirectTo });
        res.end();
        return;
      }

      if (responseBody.sessionToken) {
        setSessionCookie(res, responseBody.sessionToken);
      }

      if (responseBody.view) {
        await serveView(res, statusCode, responseBody.view, responseBody);
        return;
      }

      sendJson(res, statusCode, responseBody);
    } catch (error) {
      sendJson(res, 500, { error: error.message || 'Internal server error.' });
    }
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, HOST, () => {
    /* eslint-disable-next-line no-console */
    console.log(`CMS server running at http://${HOST}:${PORT}`);
  });
}

module.exports = {
  createServer,
  buildApplicationContext,
};
