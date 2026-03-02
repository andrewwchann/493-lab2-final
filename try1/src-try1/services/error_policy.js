const SENSITIVE_KEYS = ['password', 'creditCard', 'cardNumber', 'cvv', 'expiry', 'token'];

function redactSensitiveFields(payload) {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const copy = Array.isArray(payload) ? [...payload] : { ...payload };
  for (const key of Object.keys(copy)) {
    if (SENSITIVE_KEYS.includes(key)) {
      copy[key] = '[REDACTED]';
    }
  }
  return copy;
}

function retryLaterError(message = 'Service is temporarily unavailable. Please try again later.') {
  return {
    code: 'RETRY_LATER',
    message,
  };
}

module.exports = {
  redactSensitiveFields,
  retryLaterError,
};
