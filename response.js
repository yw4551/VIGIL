export function sendResponse(res, statusCode, data, isSuccess = true) {
    res.writeHead(statusCode, { "Content-Type": "application/json" });

    if (isSuccess) {
        if (data && data.meta) {
            res.end(
                JSON.stringify({
                    success: true,
                    data: data.data,
                    meta: data.meta,
                }),
            );
        } else {
            res.end(
                JSON.stringify({
                    success: true,
                    data,
                }),
            );
        }
    } else {
        res.end(
            JSON.stringify({
                success: false,
                message: data,
            }),
        );
    }
}

export function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            if (!body) {
                return resolve({});
            }

            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });

        req.on("error", reject);
    });
}
