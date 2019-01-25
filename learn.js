// import tf from "@tensorflow/tfjs";
// ActivationIdentifier = 'elu' | 'hardSigmoid' | 'linear' | 'relu' | 'relu6' | 'selu' | 'sigmoid' | 'softmax' | 'softplus' | 'softsign' | 'tanh' | string;

const sequence = tf.sequential();

function init() {
  sequence.add(tf.layers.dense({
    units: 10,
    activation: 'relu6',
    batchInputShape: [1, 2],
    useBias: false,
  }));
  sequence.add(tf.layers.dense({
    units: 1,
    activation: 'relu6',
  }))
  sequence.compile({
    loss: 'meanSquaredError',
    optimizer: 'sgd',
  });
  sequence.summary()
}

/**
 * https://js.tensorflow.org/api/0.14.1/#tf.Sequential.predict
 * @param {number} paddlePositon
 * @param {number} ballPosition
 * @return {number}
 */
function predict(paddlePositon, ballPosition) {
  console.log("predicting from: ", paddlePositon, ballPosition)
  const prediction = sequence.predict(
    tf.tensor2d(
      [paddlePositon, ballPosition], [1, 2])).get(0,0)
  console.log(prediction)
  printWeights()
  return prediction
}
/**
 * https://js.tensorflow.org/api/0.14.1/#tf.Sequential.trainOnBatch
 * @param {number} paddlePositon
 * @param {number} ballPosition
 * @param {number} result
 */
function train(paddlePositon, ballPosition, result) {
  // Add to the training using the new input and output
  console.log("training...", paddlePositon, ballPosition, result)
   const x = tf.tensor2d(
     [paddlePositon, ballPosition], [1,2]);
   const y = tf.tensor1d([result]);
  sequence.trainOnBatch(x, y).then( r => {
    console.log("trained...")
    printWeights()
  }).catch( reason => console.log(reason))
}

function printWeights() {
      sequence.getWeights().map(t => {
        t.data().then(p => {
          console.log(p)
        })
      })
}

init()
