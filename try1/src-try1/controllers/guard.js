const { canAccessRoute } = require('../services/access_control');

function enforceRouteAccess({ session, routeConfig }) {
  const permitted = canAccessRoute({
    session,
    allowedRoles: routeConfig.allowedRoles,
    isPublic: routeConfig.isPublic,
  });

  if (!permitted) {
    return {
      allowed: false,
      status: 403,
      error: 'Access denied for this route.',
    };
  }

  return { allowed: true };
}

module.exports = {
  enforceRouteAccess,
};
