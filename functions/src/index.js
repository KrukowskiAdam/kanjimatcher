const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2/options");
const handlerPromise = import("../build/handler.js");

setGlobalOptions({ region: "us-central1" });

exports.ssr = onRequest(async (req, res) => {
    const { handler } = await handlerPromise;
    return handler(req, res);
});
