/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 */

//==============================================================================
// Welcome to scripting in Spark AR Studio! Helpful links:
//
// Scripting Basics - https://fb.me/spark-scripting-basics
// Reactive Programming - https://fb.me/spark-reactive-programming
// Scripting Object Reference - https://fb.me/spark-scripting-reference
// Changelogs - https://fb.me/spark-changelog
//
// For projects created with v87 onwards, JavaScript is always executed in strict mode.
//==============================================================================

// How to load in modules
const Scene = require('Scene');
const Time = require('Time');
const Touch = require('TouchGestures');
const Reactive = require('Reactive');
const FaceTracking = require('FaceTracking');

// Use export keyword to make a symbol available in scripting debug console
export const Diagnostics = require('Diagnostics');

let _objs = {};
let snapChannels = {};
let _value = {};

// Enables async/await in JS [part 1]
(async function() {
    _objs.camReference = await Scene.root.findFirst('Camera');
    _objs.anchor = await Scene.root.findFirst('anchor');
    _objs.faceAnchor = await Scene.root.findFirst('face-anchor');
    _objs.testFaceWorld = await Scene.root.findFirst('test-face-world');
    _objs.face = FaceTracking.face(0);

    snapChannels.anchorX = _objs.anchor.worldTransform.position.x;
    snapChannels.anchorY = _objs.anchor.worldTransform.position.y;
    snapChannels.anchorZ = _objs.anchor.worldTransform.position.z;

    snapChannels.camX = _objs.camReference.worldTransform.position.x;
    snapChannels.camY = _objs.camReference.worldTransform.position.y;
    snapChannels.camZ = _objs.camReference.worldTransform.position.z;

    snapChannels.faceX = _objs.faceAnchor.worldTransform.position.x;
    snapChannels.faceY = _objs.faceAnchor.worldTransform.position.y;
    snapChannels.faceZ = _objs.faceAnchor.worldTransform.position.z;

    snapChannels.isFace = _objs.face.isTracked;

    Time.setIntervalWithSnapshot(snapChannels, Update, 50);
})();

function Update (time, data) {
    _value.anchorX = NYFloor(data.anchorX, 1000);
    _value.anchorY = NYFloor(data.anchorY, 1000);
    _value.anchorZ = NYFloor(data.anchorZ, 1000);

    _value.camX = NYFloor(data.camX, 1000);
    _value.camY = NYFloor(data.camY, 1000);
    _value.camZ = NYFloor(data.camZ, 1000);

    _value.faceX = NYFloor(data.faceX, 1000);
    _value.faceY = NYFloor(data.faceY, 1000);
    _value.faceZ = NYFloor(data.faceZ, 1000);

    _value.isFace = data.isFace;

    _objs.testFaceWorld.worldTransform.position = Reactive.point(_value.faceX, _value.faceY, _value.faceZ);
}

function NYFloor (value, multiplier) {
    return Math.floor(value * multiplier) / multiplier;
}

function pointDistance (x1, y1, z1, x2, y2, z2)
{
    return Math.sqrt(Math.pow(x1-x2) + Math.pow(y1-y2) + Math.pow(z1-z2));
}
export {_objs, snapChannels, _value};
