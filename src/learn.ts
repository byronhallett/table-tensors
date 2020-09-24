// ActivationIdentifier = 'elu' | 'hardSigmoid' | 'linear' | 'relu' | 'relu6' | 'selu' | 'sigmoid' | 'softmax' | 'softplus' | 'softsign' | 'tanh' | string;
// export declare type InitializerIdentifier = 'constant' | 'glorotNormal' | 'glorotUniform' | 'heNormal' | 'identity' | 'leCunNormal' | 'ones' | 'orthogonal' | 'randomNormal' | 'randomUniform' | 'truncatedNormal' | 'varianceScaling' | 'zeros' | string;
import * as tf from "@tensorflow/tfjs";

const sequence = tf.sequential({
  layers: [
    tf.layers.dense({
      units: 1,
      kernelInitializer: tf.initializers.ones(),
      batchInputShape: [1, 2],
      useBias: false,
    }),
    // tf.layers.dense({
    //   units: 1,
    //   kernelInitializer: tf.initializers.constant({ value: 1.0 }),
    //   useBias: false,
    // }),
  ],
});
sequence.compile({
  loss: tf.losses.meanSquaredError,
  optimizer: tf.train.adam(0.8),
});
sequence.summary();
printWeights();

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
  // sequence.fit(x, y, {});
  sequence
    .trainOnBatch(x, y)
    .then((r) => {
      // console.log("loss: ", r);
      printWeights();
    })
    .catch((reason) => console.log(reason));
}

function printWeights() {
  sequence.getWeights().map((t) => {
    console.log("Weights:");
    t.data().then((p) => {
      console.log(p);
    });
  });
}
