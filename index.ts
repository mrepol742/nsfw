import * as axios from 'axios';
import * as tf from '@tensorflow/tfjs-node';
import * as nsfw from 'nsfwjs';
import * as http from 'http';

let model;

const loadModel = async () => {
  model = await nsfw.load()
}

const server = http.createServer(getRoutes());

loadModel().then(() => server.listen(7421, function () {
  console.log("server_status", "7421")
}))

function getRoutes() {
  return async function (req, res) {
      let ress = req.url;
      let url = ress.split("?")[0].replace("url=", "");
      console.log(req.method, req.headers.origin, url);
      let results = await main(url);
      res.setHeader("Content-Type", "text/json");
      res.writeHead(200);
      res.end(results);
  }
}

async function main(url) {
  const pic = await axios.get(url, {
    responseType: 'arraybuffer',
  })

  const image = await tf.node.decodeImage(pic.data)
  const predictions = await model.classify(image)
  image.dispose()
  if (Math.floor((predictions[0].probability / 1.0) * 100) > 90) {
    return '{result: "Drawing"}';
  } else if (Math.floor((predictions[2].probability / 1.0) * 100) > 90 || Math.floor((predictions[3].probability / 1.0) * 100) > 90
     || Math.floor((predictions[4].probability / 1.0) * 100) > 90) {
    return '{result: "Explicit"}';
  } else {
    return '{result: "Nothing"}';
  }
}