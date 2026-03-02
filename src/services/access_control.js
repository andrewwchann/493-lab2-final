function isAuthorizedUser(session) {
  return Boolean(session && session.accountId);
}

function hasAnyRole(session, allowedRoles = []) {
  if (!allowedRoles.length) {
    return true;
  }
  if (!session || !Array.isArray(session.roles)) {
    return false;
  }
  return allowedRoles.some((role) => session.roles.includes(role));
}

function canAccessRoute({ session, allowedRoles = [], isPublic = false }) {
  if (isPublic) {
    return true;
  }
  return isAuthorizedUser(session) && hasAnyRole(session, allowedRoles);
}

module.exports = {
  isAuthorizedUser,
  hasAnyRole,
  canAccessRoute,
};
