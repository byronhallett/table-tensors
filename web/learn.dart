@JS()
library main;

import 'package:js/js.dart'; // Pull in our dependency

const sequence = 1;

// // ActivationIdentifier = 'elu' | 'hardSigmoid' | 'linear' | 'relu' | 'relu6' | 'selu' | 'sigmoid' | 'softmax' | 'softplus' | 'softsign' | 'tanh' | string;
// // export declare type InitializerIdentifier = 'constant' | 'glorotNormal' | 'glorotUniform' | 'heNormal' | 'identity' | 'leCunNormal' | 'ones' | 'orthogonal' | 'randomNormal' | 'randomUniform' | 'truncatedNormal' | 'varianceScaling' | 'zeros' | string;

// const sequence = tf.sequential()

// function init() {
//   // INPUT AND 1st HIDDEN LAYER
//   sequence.add(tf.layers.dense({
//     units: 100,
//     // kernelInitializer: tf.initializers.randomUniform({minval: 0.0, maxval: 1.0}),
//     batchInputShape: [1, 2],
//     useBias: false,
//   }));
//   // 2nd HIDDEN LAYER
//   sequence.add(tf.layers.dense({
//     units: 100,
//     useBias: false,
//   }))
//   // 3rd HIDDEN LAYER
//   sequence.add(tf.layers.dense({
//     units: 100,
//     useBias: false,
//   }))
//   // OUTPUT LAYER
//   sequence.add(tf.layers.dense({
//     units: 1,
//     useBias: false,
//   }))
//   sequence.compile({
//     loss: tf.losses.meanSquaredError,
//     optimizer: tf.train.sgd(0.1),
//   });
//   sequence.summary()
//   for (let i = 0; i < 100; i++) {
//     const r = 1/100 * i
//     train(r, r, r)

//   }
//   // train(0.5, 0.5, 0.5)
//   printWeights()
// }

// /**
//  * https://js.tensorflow.org/api/0.14.1/#tf.Sequential.predict
//  * @param {number} paddlePositon
//  * @param {number} ballPosition
//  * @return {number}
//  */
// function predict(paddlePositon, ballPosition) {
//   const posDiff = ballPosition - paddlePositon
//   const prediction = sequence.predict(
//     tf.tensor2d(
//       [paddlePositon, posDiff], [1, 2])).get(0, 0)
//   console.log("predicting from: ", paddlePositon, posDiff, prediction)
//   // printWeights()
//   return prediction
// }
// /**
//  * https://js.tensorflow.org/api/0.14.1/#tf.Sequential.trainOnBatch
//  * @param {number} paddlePositon
//  * @param {number} ballPosition
//  * @param {number} result
//  */
// function train(paddlePositon, ballPosition, result) {
//   // Add to the training using the new input and output
//   const posDiff = ballPosition - paddlePositon
//   console.log("training from: ", paddlePositon, posDiff, result)
//   const x = tf.tensor2d(
//     [paddlePositon, posDiff], [1, 2]);
//   const y = tf.tensor1d([result]);
//   sequence.trainOnBatch(x, y).then(r => {
//     // printWeights()
//   }).catch(reason => console.log(reason))
// }

// function printWeights() {
//   sequence.getWeights().map(t => {
//     console.log("Weights:")
//     t.data().then(p => {
//       console.log(p)
//     })
//   })
// }

// init()
