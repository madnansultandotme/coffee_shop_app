export function permissionsForRole(role) {
  if (role === "admin") return ["admin:all","orders:manage","menu:manage","staff:manage","inventory:manage","reports:view","settings:manage"];
  if (role === "manager") return ["orders:manage","menu:manage","staff:view","inventory:manage","reports:view"];
  if (role === "barista") return ["orders:view","orders:update_status","inventory:view"];
  if (role === "guest") return ["reviews:create"];
  return ["orders:create","orders:view_own","reviews:create"];
}