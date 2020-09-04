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

import {_objs, snapChannels, _value} from "./objectData.js";

// Enables async/await in JS [part 1]
(async function() {

})();

TouchGestures.onTap().subscribe(gesture=>{

    const touchPoint = Reactive.point2d(gesture.location.x, gesture.location.y);
    const depth = pointDistance(_value.triangleX, _value.triangleY, _value.triangleZ, _value.camX, _value.camY, _value.camZ);

    const newPos = Scene.unprojectWithDepth(touchPoint, depth);


    const snapObj = {
        newPosX: newPos.x,
        newPosY: newPos.y,
        newPosZ: newPos.z
    };

    Time.setTimeoutWithSnapshot(snapObj, (time, data)=>{
        _objs.anchor.worldTransform.position = Reactive.point(data.newPosX, data.newPosY, data.newPosZ);
        Diagnostics.log(data);
    }, 0);
});

function pointDistance (x1, y1, z1, x2, y2, z2)
{
    Diagnostics.log(`${x1}, ${y1}, ${z1}, ${x2}, ${y2}, ${z2}`);
    return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2) + Math.pow(z1-z2, 2));
}
