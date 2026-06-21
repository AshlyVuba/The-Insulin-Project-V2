const ROLE_HOME = {
  filing:   "/filing",
  pharmacy: "/pharmacy",
  admin:    "/admin",
};

export const getHomeRouteForRole = (role) => ROLE_HOME[role] || "/login";

// Strict role check — admin does NOT get blanket access to filing/pharmacy
export const canAccessRoute = (userRole, allowedRoles = []) => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};
