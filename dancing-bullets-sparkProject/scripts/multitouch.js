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
const Patches = require('Patches');
const TouchGestures = require('TouchGestures');
const Reactive = require('Reactive');

// Use export keyword to make a symbol available in scripting debug console
export const Diagnostics = require('Diagnostics');

import {objs, snapChannels, objectValues} from "./objectData.js";

// Enables async/await in JS [part 1]
(async function() {

})();

TouchGestures.onTap().subscribe(gesture => {
    Diagnostics.log(objectValues);
    objs.anchor.worldTransform.position = Reactive.point(objectValues.camX, objectValues.camY, objectValues.camZ);

    const touchPoint = Reactive.point2d(gesture.location.x, gesture.location.y);

    const depth = objectValues.camZ - objectValues.planeZ;
    const newPos = Scene.unprojectWithDepth(touchPoint, depth);

    objs.touch.worldTransform.position = newPos;
});
