import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";

export function composeRoutes(featureRoutes) {
  const guest = [];
  const protectedRoutes = [];
  const publicRoutes = [];

  featureRoutes.forEach(({ access, route }) => {
    if (access === "guest") guest.push(route);
    else if (access === "protected") protectedRoutes.push(route);
    else publicRoutes.push(route);
  });

  return [
    guest.length && {
      element: <GuestRoute />,
      children: guest,
    },

    protectedRoutes.length && {
      element: <ProtectedRoute />,
      children: protectedRoutes,
    },

    ...publicRoutes,
  ].filter(Boolean);
}
