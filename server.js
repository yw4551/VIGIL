import http from "http";
import { handle } from "./router.js";

const server = http.createServer((req, res) => {
    try {
        handle(req, res);
    } catch (error) {
        res.end("Failed");
    }
});

server.listen(3000, () => {
    console.log("Listening on port 3000...");
});
