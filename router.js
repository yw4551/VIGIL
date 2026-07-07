import { routes } from "./routes.js";

const router = (req, res) => {
    const url = new URL(req.url, "http://localhost:3000");
    const method = req.method;
    const path = url.pathname;
    const route = routes.find((r) => r.method === method && r.path === path);

    if (route) {
        route.handler(req, res);
    } else {
        res.statusCode = 400;
        res.end("Route Not Found!");
    }
};
