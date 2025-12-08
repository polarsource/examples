import { type RouteConfig, route } from "@react-router/dev/routes";

export default [route("/checkout", "routes/checkout.tsx"), route("/portal", "routes/portal.tsx"), route("/webhooks", "routes/webhooks.tsx")] satisfies RouteConfig;
