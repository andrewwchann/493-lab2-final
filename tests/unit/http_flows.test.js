const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const { createServer } = require('../../src/server');

function request({ port, method, path, headers = {}, body = '' }) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        method,
        path,
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

let server;
let port;

test.before(async () => {
  server = createServer();
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      port = server.address().port;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('login page renders and includes shared stylesheet', async () => {
  const res = await request({ port, method: 'GET', path: '/login' });
  assert.equal(res.statusCode, 200);
  assert.match(res.body, /<form method="post" action="\/login"/);
  assert.match(res.body, /<link rel="stylesheet" href="\/assets\/styles.css">/);
});

test('static stylesheet is served', async () => {
  const res = await request({ port, method: 'GET', path: '/assets/styles.css' });
  assert.equal(res.statusCode, 200);
  assert.match(String(res.headers['content-type'] || ''), /text\/css/);
  assert.match(res.body, /--accent/);
});

test('register redirects to login', async () => {
  const body = 'email=tester%40example.com&password=ValidPass123!';
  const res = await request({
    port,
    method: 'POST',
    path: '/register',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  assert.equal(res.statusCode, 302);
  assert.equal(res.headers.location, '/login');
});

test('unauthenticated protected route redirects to login', async () => {
  const res = await request({ port, method: 'GET', path: '/dashboard/author' });
  assert.equal(res.statusCode, 302);
  assert.equal(res.headers.location, '/login');
});

test('pricing is public but conference registration requires authorized login', async () => {
  const pricing = await request({ port, method: 'GET', path: '/pricing' });
  assert.equal(pricing.statusCode, 200);
  assert.match(pricing.body, /Conference Pricing/);

  const register = await request({ port, method: 'GET', path: '/conference/register' });
  assert.equal(register.statusCode, 302);
  assert.equal(register.headers.location, '/login');
});

test('authorized users can access conference registration after login', async () => {
  const loginBody = 'identifier=attendee%40example.com&password=Attendee123!';
  const login = await request({
    port,
    method: 'POST',
    path: '/login',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: loginBody,
  });
  assert.equal(login.statusCode, 302);
  assert.equal(login.headers.location, '/dashboard/attendee');

  const cookieHeader = Array.isArray(login.headers['set-cookie'])
    ? login.headers['set-cookie'][0]
    : login.headers['set-cookie'];
  assert.ok(cookieHeader && cookieHeader.includes('sessionToken='));

  const register = await request({
    port,
    method: 'GET',
    path: '/conference/register',
    headers: { Cookie: cookieHeader },
  });
  assert.equal(register.statusCode, 200);
  assert.match(register.body, /Pay and Register/);

  const authorLogin = await request({
    port,
    method: 'POST',
    path: '/login',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'identifier=author%40example.com&password=Author123!',
  });
  assert.equal(authorLogin.statusCode, 302);
  assert.equal(authorLogin.headers.location, '/dashboard/author');
  const authorCookie = Array.isArray(authorLogin.headers['set-cookie'])
    ? authorLogin.headers['set-cookie'][0]
    : authorLogin.headers['set-cookie'];

  const authorRegister = await request({
    port,
    method: 'GET',
    path: '/conference/register',
    headers: { Cookie: authorCookie },
  });
  assert.equal(authorRegister.statusCode, 200);
});

test('successful login sets cookie and redirects to role dashboard', async () => {
  const body = 'identifier=author%40example.com&password=Author123!';
  const login = await request({
    port,
    method: 'POST',
    path: '/login',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  assert.equal(login.statusCode, 302);
  assert.equal(login.headers.location, '/dashboard/author');
  const cookieHeader = Array.isArray(login.headers['set-cookie'])
    ? login.headers['set-cookie'][0]
    : login.headers['set-cookie'];
  assert.ok(cookieHeader && cookieHeader.includes('sessionToken='));

  const dashboard = await request({
    port,
    method: 'GET',
    path: '/dashboard/author',
    headers: { Cookie: cookieHeader },
  });

  assert.equal(dashboard.statusCode, 200);
  assert.match(dashboard.body, /Submit Paper/);
  assert.match(dashboard.body, /Register and Pay/);
  assert.match(dashboard.body, /View Published Schedule/);
});

test('editor can open decision page via GET route', async () => {
  const body = 'identifier=editor%40example.com&password=Editor123!';
  const login = await request({
    port,
    method: 'POST',
    path: '/login',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const cookieHeader = Array.isArray(login.headers['set-cookie'])
    ? login.headers['set-cookie'][0]
    : login.headers['set-cookie'];

  const page = await request({
    port,
    method: 'GET',
    path: '/editor/decision',
    headers: { Cookie: cookieHeader },
  });

  assert.equal(page.statusCode, 200);
  assert.match(page.body, /Final Paper Decision/);
  assert.match(page.body, /name="submissionId"/);
});
