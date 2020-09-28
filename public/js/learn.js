"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var tfjs_1 = __importDefault(require("@tensorflow/tfjs"));
// ActivationIdentifier = 'elu' | 'hardSigmoid' | 'linear' | 'relu' | 'relu6' | 'selu' | 'sigmoid' | 'softmax' | 'softplus' | 'softsign' | 'tanh' | string;
// export declare type InitializerIdentifier = 'constant' | 'glorotNormal' | 'glorotUniform' | 'heNormal' | 'identity' | 'leCunNormal' | 'ones' | 'orthogonal' | 'randomNormal' | 'randomUniform' | 'truncatedNormal' | 'varianceScaling' | 'zeros' | string;
var sequence = tfjs_1.default.sequential();
function init() {
    // INPUT AND 1st HIDDEN LAYER
    sequence.add(tfjs_1.default.layers.dense({
        units: 100,
        // kernelInitializer: tf.initializers.randomUniform({minval: 0.0, maxval: 1.0}),
        batchInputShape: [1, 2],
        useBias: false
    }));
    // 2nd HIDDEN LAYER
    sequence.add(tfjs_1.default.layers.dense({
        units: 100,
        useBias: false
    }));
    // 3rd HIDDEN LAYER
    sequence.add(tfjs_1.default.layers.dense({
        units: 100,
        useBias: false
    }));
    // OUTPUT LAYER
    sequence.add(tfjs_1.default.layers.dense({
        units: 1,
        useBias: false
    }));
    sequence.compile({
        loss: tfjs_1.default.losses.meanSquaredError,
        optimizer: tfjs_1.default.train.sgd(0.1)
    });
    sequence.summary();
    for (var i = 0; i < 100; i++) {
        var r = (1 / 100) * i;
        train(r, r, r);
    }
    // train(0.5, 0.5, 0.5)
    printWeights();
}
/**
 * https://js.tensorflow.org/api/0.14.1/#tf.Sequential.predict
 */
function predict(paddlePositon, ballPosition) {
    var posDiff = ballPosition - paddlePositon;
    var prediction = sequence.predict(tfjs_1.default.tensor2d([paddlePositon, posDiff], [1, 2])).get(0, 0);
    console.log('predicting from: ', paddlePositon, posDiff, prediction);
    // printWeights()
    return prediction;
}
exports.predict = predict;
/**
 * https://js.tensorflow.org/api/0.14.1/#tf.Sequential.trainOnBatch
 */
function train(paddlePositon, ballPosition, result) {
    // Add to the training using the new input and output
    var posDiff = ballPosition - paddlePositon;
    console.log('training from: ', paddlePositon, posDiff, result);
    var x = tfjs_1.default.tensor2d([paddlePositon, posDiff], [1, 2]);
    var y = tfjs_1.default.tensor1d([result]);
    sequence
        .trainOnBatch(x, y)
        .then(function (r) {
        // printWeights()
    })
        .catch(function (reason) { return console.log(reason); });
}
exports.train = train;
function printWeights() {
    sequence.getWeights().map(function (t) {
        console.log('Weights:');
        t.data().then(function (p) {
            console.log(p);
        });
    });
}
init();
