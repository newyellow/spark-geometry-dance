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
const Touch = require('TouchGestures');
const Reactive = require('Reactive');
const Animation = require('Animation');

// Use export keyword to make a symbol available in scripting debug console
export const Diagnostics = require('Diagnostics');

import {_objs, snapChannels, _value} from "./objectData.js";
import {NYPoint} from "./NYPoint.js";

let _touch = {};

// Enables async/await in JS [part 1]
(async function() {
    _touch.pinchState = 'ENDED';
    _touch.backTriangles = [];
    _touch.backIndex = 0;
    _touch.frontTriangles = [];
    _touch.frontIndex = 0;
    _touch.pinchX = 0;
    _touch.pinchY = 0;
    _touch.canStart = false;

    const backTri1 = await Scene.root.findFirst('back-triangle-1');
    const backTri2 = await Scene.root.findFirst('back-triangle-2');
    const backTri3 = await Scene.root.findFirst('back-triangle-3');

    const frontTri1 = await Scene.root.findFirst('front-triangle-1');
    const frontTri2 = await Scene.root.findFirst('front-triangle-2');
    const frontTri3 = await Scene.root.findFirst('front-triangle-3');

    _touch.backTriangles = [backTri1, backTri2, backTri3];
    _touch.nowBackTri = _touch.backTriangles[_touch.backIndex];

    _touch.frontTriangles = [frontTri1, frontTri2, frontTri3];
    _touch.nowFrontTri = _touch.frontTriangles[_touch.frontIndex];

    _touch.debugPoint = await Scene.root.findFirst('touch-point');
})();



Touch.onTap().subscribe(gesture=>{

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

function backTriangleStart (triIndex) {
    // scale up
    const timeDriver = Animation.timeDriver({durationMilliseconds: 300});
    const scaleSampler = Animation.samplers.easeOutQuart(0.0, 10.0);
    const scaleAnimation = Animation.animate(timeDriver, scaleSampler);

    _touch.backTriangles[triIndex].transform.scaleX = scaleAnimation;
    _touch.backTriangles[triIndex].transform.scaleY = scaleAnimation;
    _touch.backTriangles[triIndex].transform.scaleZ = scaleAnimation;

    timeDriver.start();
}

function backTriangleEnd (triIndex) {
    // scale down animation
    const timeDriver = Animation.timeDriver({durationMilliseconds: 300});
    const scaleSampler = Animation.samplers.easeOutQuart(10.0, 0.0);
    const scaleAnimation = Animation.animate(timeDriver, scaleSampler);

    _touch.backTriangles[triIndex].transform.scaleX = scaleAnimation;
    _touch.backTriangles[triIndex].transform.scaleY = scaleAnimation;
    _touch.backTriangles[triIndex].transform.scaleZ = scaleAnimation;

    Time.setTimeout(function (){
        timeDriver.start();
    }, 1000);
}

Touch.onPinch().subscribe((gesture)=>{

    gesture.state.monitor({fireOnInitialValue: true}).subscribe((data)=>{
        _touch.pinState = data.newValue;
        Diagnostics.log(data.newValue);
        Patches.inputs.setString('debugState', data.newValue);

        switch (_touch.pinState)
        {
            case 'BEGAN':
            _touch.canStart = true; // setup one time key
            break;

            case 'CHANGED':
            break;

            case 'ENDED':
            case 'CANCELED':
            case 'FAILED':
            backTriangleEnd(_touch.backIndex);

            _touch.backIndex = (_touch.backIndex+1) % 3;
            _touch.nowBackTri = _touch.backTriangles[_touch.backIndex];
            break;
        }
    });

    Reactive.monitorMany({x: gesture.location.x, y: gesture.location.y}, {fireOnInitialValue: true}).subscribe(data=>{

        // start new triangle
        if(_touch.canStart)
        {
            _touch.canStart = false;

            // position triangle
            const touchPoint = Reactive.point2d(data.newValues.x, data.newValues.y);
            let depth = 0;

            if(_value.isFace)
                depth = pointDistance(_value.faceX, _value.faceY, _value.faceZ, _value.camX, _value.camY, _value.camZ);
            else
                depth = pointDistance(_value.anchorX, _value.anchorY, _value.anchorZ, _value.camX, _value.camY, _value.camZ);

            const newPos = Scene.unprojectWithDepth(touchPoint, depth);

            const snapObj = {
                newPosX: newPos.x,
                newPosY: newPos.y,
                newPosZ: newPos.z
            };

            Time.setTimeoutWithSnapshot(snapObj, (time, data)=>{

                    // const camPoint = new NYPoint(_value.camX, _value.camY, _value.camZ);
                    // const headPoint = new NYPoint(data.newPosX, data.newPosY, data.newPosZ);
                    //
                    // const headDist = NYPoint.distance(camPoint, headPoint);
                    // const newDist = headDist + 0.3;
                    // const ratio = newDist / headDist;
                    //
                    // const diff = NYPoint.sub(headPoint, camPoint);
                    // const newPoint = NYPoint.add(headPoint, NYPoint.multiply(diff, ratio));
                    const newPoint = new NYPoint(newPosX, newPosY, newPosZ + 0.3);
                    _touch.nowBackTri.worldTransform.position = newPoint.toSparkPoint();
                    Diagnostics.log(_value.isFace);

                backTriangleStart(_touch.backIndex);
            }, 0);

        }
        Diagnostics.log(data);
        Diagnostics.log(_touch.debugPoint.position);

        const outputStr = `${Math.floor(data.newValues.x*1000)/1000.0}, ${Math.floor(data.newValues.y*1000)/1000}`;
        Patches.inputs.setString('debug', outputStr);
        Patches.inputs.setPoint2D('debugPoint2', Reactive.point2d(data.newValues.x, data.newValues.y));
    });
    // gesture.location.monitor({fireOnInitialValue: true}).subscribe((data)=>{
    //     const debugStr = `${data.newValue.x}, ${data.newValue.y}`;
    //     Patches.inputs.setString('debug', debugStr);
    // });
});

function pointDistance (x1, y1, z1, x2, y2, z2)
{
    Diagnostics.log(`${x1}, ${y1}, ${z1}, ${x2}, ${y2}, ${z2}`);
    return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2) + Math.pow(z1-z2, 2));
}
