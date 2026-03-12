import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("kksort", "routes/kksort.tsx"),
] satisfies RouteConfig;
