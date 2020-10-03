// ActivationIdentifier = 'elu' | 'hardSigmoid' | 'linear' | 'relu' | 'relu6' | 'selu' | 'sigmoid' | 'softmax' | 'softplus' | 'softsign' | 'tanh' | string;
// export declare type InitializerIdentifier = 'constant' | 'glorotNormal' | 'glorotUniform' | 'heNormal' | 'identity' | 'leCunNormal' | 'ones' | 'orthogonal' | 'randomNormal' | 'randomUniform' | 'truncatedNormal' | 'varianceScaling' | 'zeros' | string;
import * as tf from "@tensorflow/tfjs";
import { gameState } from "./state";

const sequence = tf.sequential({
  layers: [
    tf.layers.dense({
      units: 1,
      kernelInitializer: tf.initializers.randomNormal({
        mean: 1.0,
        stddev: 0.3,
      }),
      activation: "tanh",
      batchInputShape: [1, 2],
      useBias: false,
    }),
    tf.layers.dense({
      units: 1,
      kernelInitializer: tf.initializers.randomNormal({
        mean: 1.0,
        stddev: 0.01,
      }),
      trainable: false,
      useBias: false,
    }),
  ],
});
sequence.compile({
  loss: tf.losses.absoluteDifference,
  optimizer: tf.train.adam(0.5),
});

sequence.summary();
setDisplayWeights();

var xs: number[][] = [];
var ys: number[] = [];

export function predict(paddlePositon: number, ballPosition: number): number {
  const posDiff = ballPosition - paddlePositon;
  const prediction = sequence.predict(
    tf.tensor2d([[paddlePositon, posDiff]], [1, 2])
  ) as tf.Tensor;
  const result = prediction.dataSync();
  // console.log("predicting from: ", paddlePositon, posDiff, " result: ", result);
  return result[0];
}

export function train(
  paddlePositon: number,
  ballPosition: number,
  result: number
) {
  // Add to the training using the new input and output
  const posDiff = ballPosition - paddlePositon;
  // console.log("training from: ", paddlePositon, posDiff, result);

  xs.push([1, posDiff]);
  ys.push(result);

  // const x = tf.tensor2d(xs, [xs.length, 2]);
  // const y = tf.tensor2d(ys, [ys.length, 1]);
  const x = tf.tensor2d([[paddlePositon, posDiff]], [1, 2]);
  const y = tf.tensor2d([result], [1, 1]);
  // sequence.fit(x, y);
  sequence
    .fit(x, y)
    .then((r) => {
      setDisplayWeights();
    })
    .catch((reason) => console.log(reason));
}

function average(nums: Float32Array, weights: Float32Array) {
  const weighted = nums.map((x, idx) => x * weights[idx]);
  return weighted.reduce((a, b) => a + b) / weighted.length;
}

function setDisplayWeights() {
  printWeights();
  const weights = sequence.getWeights()[0].dataSync();
  const vs = sequence.getWeights()[1].dataSync() as Float32Array;
  const midpoint = weights.length / 2;
  const w0 = weights.slice(0, midpoint) as Float32Array;
  const w1 = weights.slice(midpoint) as Float32Array;

  gameState.displayWeights.w0 = average(w0, vs);
  gameState.displayWeights.w1 = average(w1, vs);
}

function printWeights() {
  sequence.getWeights().map((t) => {
    console.log("Weights:");
    t.data().then((p) => {
      console.log(p);
    });
  });
}
