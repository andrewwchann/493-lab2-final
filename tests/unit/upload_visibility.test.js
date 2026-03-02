const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const { createServer } = require('../../src/server');

function request({ port, method, urlPath, headers = {}, body = Buffer.alloc(0) }) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        method,
        path: urlPath,
        headers: {
          ...headers,
          'Content-Length': body.length,
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
    if (body.length > 0) {
      req.write(body);
    }
    req.end();
  });
}

function buildMultipartFormData({ fields, fileFieldName, fileName, fileContent, mimeType }) {
  const boundary = `----CMSBoundary${Date.now()}${Math.random().toString(16).slice(2)}`;
  const chunks = [];

  Object.entries(fields).forEach(([key, value]) => {
    chunks.push(Buffer.from(`--${boundary}\r\n`));
    chunks.push(Buffer.from(`Content-Disposition: form-data; name="${key}"\r\n\r\n`));
    chunks.push(Buffer.from(String(value)));
    chunks.push(Buffer.from('\r\n'));
  });

  chunks.push(Buffer.from(`--${boundary}\r\n`));
  chunks.push(
    Buffer.from(
      `Content-Disposition: form-data; name="${fileFieldName}"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`
    )
  );
  chunks.push(fileContent);
  chunks.push(Buffer.from('\r\n'));
  chunks.push(Buffer.from(`--${boundary}--\r\n`));

  return {
    body: Buffer.concat(chunks),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

function parseHydratedPayload(html) {
  const marker = 'window.__CMS_PAYLOAD = ';
  const start = html.indexOf(marker);
  if (start === -1) {
    return null;
  }
  const from = start + marker.length;
  const end = html.indexOf(';\nif (typeof window.', from);
  if (end === -1) {
    return null;
  }
  try {
    return JSON.parse(html.slice(from, end));
  } catch (error) {
    return null;
  }
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

test('uploaded pdf is persisted and visible to editors with actual submission id', async () => {
  const loginAuthor = await request({
    port,
    method: 'POST',
    urlPath: '/login',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: Buffer.from('identifier=author%40example.com&password=Author123!'),
  });
  assert.equal(loginAuthor.statusCode, 302);
  const authorCookie = Array.isArray(loginAuthor.headers['set-cookie'])
    ? loginAuthor.headers['set-cookie'][0]
    : loginAuthor.headers['set-cookie'];

  const pdfBytes = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n', 'utf8');
  const multipart = buildMultipartFormData({
    fields: {
      title: 'Vision Paper',
      authorNames: 'A. Author',
      affiliationOrContact: 'ECE',
      abstract: 'A test abstract',
      keywords: 'ece,test',
    },
    fileFieldName: 'file',
    fileName: 'vision-paper.pdf',
    fileContent: pdfBytes,
    mimeType: 'application/pdf',
  });

  const submit = await request({
    port,
    method: 'POST',
    urlPath: '/submissions',
    headers: {
      'Content-Type': multipart.contentType,
      Cookie: authorCookie,
    },
    body: multipart.body,
  });

  assert.equal(submit.statusCode, 302);
  assert.equal(submit.headers.location, '/dashboard/author?message=paper-submitted');

  const uploadsDir = path.join(__dirname, '../../src/assets/uploads');
  const uploadedFiles = fs.readdirSync(uploadsDir).filter((name) => name.includes('vision-paper.pdf'));
  assert.ok(uploadedFiles.length > 0);

  const loginEditor = await request({
    port,
    method: 'POST',
    urlPath: '/login',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: Buffer.from('identifier=editor%40example.com&password=Editor123!'),
  });
  const editorCookie = Array.isArray(loginEditor.headers['set-cookie'])
    ? loginEditor.headers['set-cookie'][0]
    : loginEditor.headers['set-cookie'];

  const assignPage = await request({
    port,
    method: 'GET',
    urlPath: '/reviews/assign',
    headers: { Cookie: editorCookie },
  });

  assert.equal(assignPage.statusCode, 200);
  assert.match(assignPage.body, /submittedPapers/);
  assert.match(assignPage.body, /Vision Paper/);
  assert.match(assignPage.body, /"id":\d+/);
  assert.match(assignPage.body, /\/assets\/uploads\//);
});

test('draft save persists uploaded pdf and shows manuscript link on drafts page', async () => {
  const loginAuthor = await request({
    port,
    method: 'POST',
    urlPath: '/login',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: Buffer.from('identifier=author%40example.com&password=Author123!'),
  });
  const authorCookie = Array.isArray(loginAuthor.headers['set-cookie'])
    ? loginAuthor.headers['set-cookie'][0]
    : loginAuthor.headers['set-cookie'];

  const multipart = buildMultipartFormData({
    fields: {
      title: `Draft Paper ${Date.now()}`,
      abstract: 'draft abstract',
      keywords: 'draft',
    },
    fileFieldName: 'file',
    fileName: 'draft-paper.pdf',
    fileContent: Buffer.from('%PDF-1.4\nDraft\n%%EOF\n', 'utf8'),
    mimeType: 'application/pdf',
  });

  const saveDraft = await request({
    port,
    method: 'POST',
    urlPath: '/submissions/drafts/save',
    headers: {
      'Content-Type': multipart.contentType,
      Cookie: authorCookie,
    },
    body: multipart.body,
  });

  assert.equal(saveDraft.statusCode, 302);
  assert.equal(saveDraft.headers.location, '/dashboard/author?message=draft-saved');

  const uploadsDir = path.join(__dirname, '../../src/assets/uploads');
  const uploadedDrafts = fs.readdirSync(uploadsDir).filter((name) => name.includes('draft-paper.pdf'));
  assert.ok(uploadedDrafts.length > 0);

  const draftsPage = await request({
    port,
    method: 'GET',
    urlPath: '/submissions/drafts',
    headers: { Cookie: authorCookie },
  });
  assert.equal(draftsPage.statusCode, 200);
  assert.match(draftsPage.body, /draft-paper\.pdf/);
  assert.match(draftsPage.body, /\/assets\/uploads\//);
});

test('reviewer invitation page lists pending invites after editor assignment', async () => {
  const uniqueTitle = `Invite Paper ${Date.now()}`;
  const authorLogin = await request({
    port,
    method: 'POST',
    urlPath: '/login',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: Buffer.from('identifier=author%40example.com&password=Author123!'),
  });
  const authorCookie = Array.isArray(authorLogin.headers['set-cookie'])
    ? authorLogin.headers['set-cookie'][0]
    : authorLogin.headers['set-cookie'];

  const multipart = buildMultipartFormData({
    fields: {
      title: uniqueTitle,
      authorNames: 'Invite Author',
      affiliationOrContact: 'ECE',
      abstract: 'Invitation abstract',
      keywords: 'invite',
    },
    fileFieldName: 'file',
    fileName: 'invite-paper.pdf',
    fileContent: Buffer.from('%PDF-1.4\nInvite\n%%EOF\n', 'utf8'),
    mimeType: 'application/pdf',
  });

  const submit = await request({
    port,
    method: 'POST',
    urlPath: '/submissions',
    headers: {
      'Content-Type': multipart.contentType,
      Cookie: authorCookie,
    },
    body: multipart.body,
  });
  assert.equal(submit.statusCode, 302);

  const editorLogin = await request({
    port,
    method: 'POST',
    urlPath: '/login',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: Buffer.from('identifier=editor%40example.com&password=Editor123!'),
  });
  const editorCookie = Array.isArray(editorLogin.headers['set-cookie'])
    ? editorLogin.headers['set-cookie'][0]
    : editorLogin.headers['set-cookie'];

  const assignPage = await request({
    port,
    method: 'GET',
    urlPath: '/reviews/assign',
    headers: { Cookie: editorCookie },
  });
  const payload = parseHydratedPayload(assignPage.body);
  assert.ok(payload && Array.isArray(payload.submittedPapers));
  const target = payload.submittedPapers.find((paper) => paper.title === uniqueTitle);
  assert.ok(target);

  const assign = await request({
    port,
    method: 'POST',
    urlPath: '/reviews/assign',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: editorCookie,
    },
    body: Buffer.from(
      `submissionId=${encodeURIComponent(target.id)}&reviewerEmails=${encodeURIComponent(
        'reviewer1@example.com,reviewer2@example.com,reviewer3@example.com'
      )}`
    ),
  });
  assert.equal(assign.statusCode, 201);

  const reviewerLogin = await request({
    port,
    method: 'POST',
    urlPath: '/login',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: Buffer.from('identifier=reviewer1%40example.com&password=Reviewer123!'),
  });
  const reviewerCookie = Array.isArray(reviewerLogin.headers['set-cookie'])
    ? reviewerLogin.headers['set-cookie'][0]
    : reviewerLogin.headers['set-cookie'];

  const invitationPage = await request({
    port,
    method: 'GET',
    urlPath: '/reviews/invitation',
    headers: { Cookie: reviewerCookie },
  });

  assert.equal(invitationPage.statusCode, 200);
  assert.match(invitationPage.body, /Pending Invitations/);
  assert.match(invitationPage.body, new RegExp(uniqueTitle));
  assert.match(invitationPage.body, /\/assets\/uploads\//);
});
