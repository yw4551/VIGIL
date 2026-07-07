import { sendResponse } from "../response.js";

export function checkServerHealth(req, res) {
    return sendResponse(res, 200, { status: "OK" });
}
