import * as axios from 'axios'; //you can use any http client
import * as tf from '@tensorflow/tfjs-node';
import * as nsfw from'nsfwjs';

async function fn() {
  const pic = await axios.get("https://mrepol742.github.io/images/webvium22.png", {
    responseType: 'arraybuffer',
  })

  const model = await nsfw.load() // To load a local model, nsfw.load('file://./path/to/model/')
  // Image must be in tf.tensor3d format
  // you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)
  const image = await tf.node.decodeImage(pic.data)
  const predictions = await model.classify(image)
  image.dispose() // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
  console.log(predictions)
}
fn()