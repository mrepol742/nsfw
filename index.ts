import * as axios from "axios";
import * as tf from "@tensorflow/tfjs-node";
import * as nsfw from "nsfwjs";
import * as http from "http";

let model;
const corsWhitelist = ["https://mrepol742.github.io"];

const loadModel = async () => {
    model = await nsfw.load();
};

const server = http.createServer(getRoutes());

loadModel().then(() =>
    server.listen(7421, function () {
        console.log("server_status", "7421");
    })
);

function getRoutes() {
    return async function (req, res) {
        let ress = req.url;
        console.log(req.method + " " + req.headers.origin + " " + ress);
        if (req.method != "GET" && !(corsWhitelist.indexOf(req.headers.origin) !== -1)) {
            res.writeHead(301, { Location: "https://mrepol742.github.io/unauthorized" });
            res.end();
            return;
        }
        if (ress.includes("?url=")) {
            let url = ress.split("?url=")[1];
            console.log(req.method, req.headers.origin, ress);
            let results = await main(url);
            res.setHeader("Content-Type", "text/json");
            res.writeHead(200);
            res.end(results);
        } else {
            res.writeHead(301, { Location: "https://mrepol742.github.io/404.html" });
            res.end();
        }
    };
}

async function main(url) {
    const pic = await axios.get(url, {
        responseType: "arraybuffer",
    });

    const image = await tf.node.decodeImage(pic.data);
    const predictions = await model.classify(image);
    image.dispose();
    return JSON.stringify(predictions);
}