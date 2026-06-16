const ROLE_HOME_ROUTES = {
  filing: "/filing",
  pharmacy: "/pharmacy",
  admin: "/admin",
};

export function getHomeRouteForRole(role) {
  return ROLE_HOME_ROUTES[role] || "/login";
}

export function canAccessRoute(userRole, allowedRoles = []) {
  if (!userRole) return false;
  if (userRole === "admin") return true;
  return allowedRoles.includes(userRole);
}