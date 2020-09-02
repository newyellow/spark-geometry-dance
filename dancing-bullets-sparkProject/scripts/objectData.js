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

// Use export keyword to make a symbol available in scripting debug console
export const Diagnostics = require('Diagnostics');

let objs = {};
let snapChannels = {};
let objectValues = {};

// Enables async/await in JS [part 1]
(async function() {
    objs.plane0 = await Scene.root.findFirst('plane0');
    objs.camReference = await Scene.root.findFirst('Camera');
    objs.anchor = await Scene.root.findFirst('anchor');
    objs.touch = await Scene.root.findFirst('touch');

    snapChannels.plane0X = objs.plane0.worldTransform.position.x;
    snapChannels.plane0Y = objs.plane0.worldTransform.position.y;
    snapChannels.plane0Z = objs.plane0.worldTransform.position.z;

    snapChannels.camX = objs.camReference.worldTransform.position.x;
    snapChannels.camY = objs.camReference.worldTransform.position.y;
    snapChannels.camZ = objs.camReference.worldTransform.position.z;

    Time.setIntervalWithSnapshot(snapChannels, Update, 50);
})();

function Update (time, data) {
    objectValues.planeX = NYFloor(data.plane0X, 1000);
    objectValues.planeY = NYFloor(data.plane0Y, 1000);
    objectValues.planeZ = NYFloor(data.plane0Z, 1000);

    objectValues.camX = NYFloor(data.camX, 1000);
    objectValues.camY = NYFloor(data.camY, 1000);
    objectValues.camZ = NYFloor(data.camZ, 1000);
}

function NYFloor (value, multiplier) {
    return Math.floor(value * multiplier) / multiplier;
}

export {objs, snapChannels, objectValues};
