import { sendResponse } from "../response.js";

export function checkServerHealth(req, res) {
    sendResponse(res, 200, { status: "OK" });
}
