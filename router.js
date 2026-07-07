import { routes } from "./routes.js";

function matchPath(routePath, path) {
    const params = {};
    const routeParts = routePath.split("/");
    const requestParts = path.split("/");

    if (requestParts.length !== routeParts.length) {
        return false;
    }

    for (let i = 0; i < routeParts.length; i++) {
        const routePart = routeParts[i];
        const requestPart = requestParts[i];

        if (routePart.startsWith(":")) {
            const paramName = routePart.slice(1);
            params[paramName] = requestPart;
            continue;
        }

        if (routePart !== requestPart) {
            return false;
        }
    }

    return params;
}

function findRoute(method, requestPath) {
    for (const route of routes) {
        if (route.method !== method) {
            continue;
        }

        const params = matchPath(route.path, requestPath);

        if (params !== false) {
            return {
                route,
                params,
            };
        }
    }

    return null;
}

export function handle(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const result = findRoute(req.method, url.pathname);

    if (!result) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Route Not Found." }));
        return;
    }

    req.params = result.params;
    req.query = Object.fromEntries(url.searchParams);
    result.route.handler(req, res);
}
