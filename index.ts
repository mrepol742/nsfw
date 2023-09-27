/*
 *
 * Copyright (c) 2023 Melvin Jones Repol (mrepol742.github.io). All Rights Reserved.
 *
 * License under the GNU GENERAL PUBLIC LICENSE, version 3.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://github.com/mrepol742/nsfw/blob/master/LICENSE
 *
 * Unless required by the applicable law or agreed in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        if (req.method != "GET" || !(corsWhitelist.indexOf(req.headers.origin) !== -1)) {
            res.writeHead(301, { Location: "https://mrepol742.github.io/unauthorized" });
            res.end();
        } else {
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
