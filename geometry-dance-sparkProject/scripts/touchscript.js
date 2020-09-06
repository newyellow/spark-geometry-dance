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
import {PolygonAnimator} from "./PolygonAnimationControl.js";

let _touch = {};

// Enables async/await in JS [part 1]
(async function() {
    _touch.pinchState = 'ENDED';

    _touch.backAnimators = [];
    _touch.backTriangles = [];
    _touch.backIndex = 0;
    _touch.frontAnimators = [];
    _touch.frontTriangles = [];
    _touch.frontIndex = 0;
    _touch.currentTriangle = null;

    _touch.pinchX = 0;
    _touch.pinchY = 0;

    _touch.canStart = false;
    _touch.isFrontBackPicked = false;
    _touch.isFront = false;

    _touch.rawScale = 0.0;
    _touch.rawRotation = 0.0;
    _touch.smoothScale = 0.0;
    _touch.smoothRotation = 0.0;

    const backTri1 = await Scene.root.findFirst('back-triangle-1');
    const backTri2 = await Scene.root.findFirst('back-triangle-2');
    const backTri3 = await Scene.root.findFirst('back-triangle-3');
    const backTri4 = await Scene.root.findFirst('back-triangle-4');

    const backAnimator1 = new PolygonAnimator('bData1a', 'bData1b');
    const backAnimator2 = new PolygonAnimator('bData2a', 'bData2b');
    const backAnimator3 = new PolygonAnimator('bData3a', 'bData3b');
    const backAnimator4 = new PolygonAnimator('bData4a', 'bData4b');

    const frontTri1 = await Scene.root.findFirst('front-triangle-1');
    const frontTri2 = await Scene.root.findFirst('front-triangle-2');
    const frontTri3 = await Scene.root.findFirst('front-triangle-3');
    const frontTri4 = await Scene.root.findFirst('front-triangle-4');

    const frontAnimator1 = new PolygonAnimator('fData1a', 'fData1b');
    const frontAnimator2 = new PolygonAnimator('fData2a', 'fData2b');
    const frontAnimator3 = new PolygonAnimator('fData3a', 'fData3b');
    const frontAnimator4 = new PolygonAnimator('fData4a', 'fData4b');

    _touch.backTriangles = [backTri1, backTri2, backTri3, backTri4];
    _touch.backAnimators = [backAnimator1, backAnimator2, backAnimator3, backAnimator4];
    _touch.nowBackTri = _touch.backTriangles[_touch.backIndex];

    _touch.frontTriangles = [frontTri1, frontTri2, frontTri3, frontTri4];
    _touch.frontAnimators = [frontAnimator1, frontAnimator2, frontAnimator3, frontAnimator4];
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
    }, 0);
});

Touch.onRotate().subscribe(gesture=>{
    Patches.inputs.setString('rotateState', gesture.state);
    _objs.anchor.transform.rotationZ = gesture.rotation.mul(57.2957795);

    gesture.rotation.monitor().subscribe(data=>{
        _touch.rawRotation = data.newValue * -1.6;
        Patches.inputs.setString('rotateValue', (data.newValue * 57.2957795).toString());
    });
});

Touch.onPinch().subscribe((gesture)=>{

    _objs.anchor.transform.scaleX = gesture.scale.mul(0.8);
    _objs.anchor.transform.scaleY = gesture.scale.mul(0.8);
    _objs.anchor.transform.scaleZ = gesture.scale.mul(0.8);

    // instantly grab the gesture location
    Time.setTimeoutWithSnapshot({x: gesture.location.x, y: gesture.location.y}, (time, data)=>{
        _touch.pinchX = data.x;
        _touch.pinchY = data.y;
        Diagnostics.log(`Grab Pinch Pos: ${data.x}, ${data.y}`);
    }, 0);

    gesture.state.monitor({fireOnInitialValue: true}).subscribe((data)=>{
        _touch.pinState = data.newValue;
        Patches.inputs.setString('debugState', data.newValue);

        switch (_touch.pinState)
        {
            case 'BEGAN':
            _touch.canStart = true; // setup one time key
            _touch.isFrontBackPicked = false;
            break;

            case 'CHANGED':
            break;

            case 'ENDED':
            case 'CANCELED':
            case 'FAILED':
            //backTriangleEnd(_touch.backIndex);

            if(!_touch.isFront)
            {
                _touch.backAnimators[_touch.backIndex].polygonEndAnim();
                _touch.backAnimators[_touch.backIndex].sendPatchValues();
                _touch.backIndex = (_touch.backIndex+1) % 4;
                _touch.nowBackTri = _touch.backTriangles[_touch.backIndex];
            }
            else
            {
                _touch.frontAnimators[_touch.frontIndex].polygonEndAnim();
                _touch.frontAnimators[_touch.frontIndex].sendPatchValues();
                _touch.frontIndex = (_touch.frontIndex+1) % 4;
                _touch.nowFrontTri = _touch.frontTriangles[_touch.frontIndex];
            }
            _touch.currentTriangle = null;
            break;
        }
    });

    // check for start
    gesture.scale.monitor({fireOnInitialValue: true}).subscribe((data)=>{
        if(_touch.pinState == 'CHANGED' && _touch.isFrontBackPicked == false)
        {
            if(data.newValue > 1.0) // scale up, background
            {
                _touch.isFront = false;
                _touch.isFrontBackPicked = true;

                _touch.currentTriangle = _touch.backTriangles[_touch.backIndex];
                Diagnostics.log(`BACK TRI! [${_touch.backIndex}]`);
                moveTargetTrianglePos();

                _touch.backAnimators[_touch.backIndex].polygonStartAnim();
                _touch.backAnimators[_touch.backIndex].sendPatchValues();
            }
            else if(data.newValue < 1.0) // scale down, front
            {
                _touch.isFront = true;
                _touch.isFrontBackPicked = true;

                _touch.currentTriangle = _touch.frontTriangles[_touch.frontIndex];
                Diagnostics.log(`Front TRI! [${_touch.frontIndex}]`);
                moveTargetTrianglePos();

                _touch.frontAnimators[_touch.frontIndex].polygonStartAnim();
                _touch.frontAnimators[_touch.frontIndex].sendPatchValues();
            }
        }

        _touch.rawScale = data.newValue;
        Patches.inputs.setString('scaleValue', data.newValue.toString());
    });
});

function moveTargetTrianglePos () {
    // position triangle
    const touchPoint = Reactive.point2d(_touch.pinchX, _touch.pinchY);
    let depth = 0;

    if(_value.isFace)
        depth = pointDistance(_value.faceX, _value.faceY, _value.faceZ, _value.camX, _value.camY, _value.camZ);
    else
        depth = pointDistance(_value.anchorX, _value.anchorY, _value.anchorZ, _value.camX, _value.camY, _value.camZ);

    if(_touch.isFront)
        depth -= 0.3;
    else
        depth += 0.3;

    const newPos = Scene.unprojectWithDepth(touchPoint, depth);

    const snapObj = {
        newPosX: newPos.x,
        newPosY: newPos.y,
        newPosZ: newPos.z
    };

    Time.setTimeoutWithSnapshot(snapObj, (time, data)=>{
        const newPoint = new NYPoint(data.newPosX, data.newPosY, data.newPosZ);

        if(_touch.currentTriangle != null)
            _touch.currentTriangle.worldTransform.position = newPoint.toSparkPoint();
    }, 0);
}

function pointDistance (x1, y1, z1, x2, y2, z2)
{
    return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2) + Math.pow(z1-z2, 2));
}

function Update () {

    if(_touch.currentTriangle != null)
    {
        _touch.smoothRotation = lerp(_touch.smoothRotation, _touch.rawRotation, 0.66);
        _touch.smoothScale = lerp(_touch.smoothScale, _touch.rawScale, 0.66);

        _touch.currentTriangle.transform.rotationZ = _touch.smoothRotation;

        if(_touch.isFront)
        {
            _touch.currentTriangle.transform.scaleX = _touch.smoothScale * 4.0;
            _touch.currentTriangle.transform.scaleY = _touch.smoothScale * 4.0;
            _touch.currentTriangle.transform.scaleZ = _touch.smoothScale * 4.0;
        }
        else
        {
            _touch.currentTriangle.transform.scaleX = _touch.smoothScale * 6.0;
            _touch.currentTriangle.transform.scaleY = _touch.smoothScale * 6.0;
            _touch.currentTriangle.transform.scaleZ = _touch.smoothScale * 6.0;
        }
    }
    else
    {
        _touch.smoothRotation = _touch.rawRotation;
        _touch.smoothScale = _touch.rawScale;
    }

    Time.setTimeout(Update, 50);
}
Update();

function lerp (valueA, valueB, t) {
    return valueA + (valueB - valueA) * t;
}
