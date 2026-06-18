const ROLE_HOME = { filing: "/filing", pharmacy: "/pharmacy", admin: "/admin" };
export const getHomeRouteForRole = (role) => ROLE_HOME[role] || "/login";
export const canAccessRoute = (userRole, allowedRoles = []) => {
  if (!userRole) return false;
  if (userRole === "admin") return true;
  return allowedRoles.includes(userRole);
};
