const Time = require ('Time');
const Animation = require ('Animation');
const Patches = require ('Patches');
const Reactive = require ('Reactive');
const Touch = require ('TouchGestures');

class PolygonAnimator {
    constructor (patchNameA, patchNameB) {
        this.outerDist = 0.0;
        this.outerWidth = 0.0;

        this.mainSize = 0.0;
        this.mainWidth = 0.0;

        this.innerDist = 0.0;
        this.innerWidth = 0.0;

        this.shapeCount = 3.0;
        this.alpha = 1.0;

        this.patchNameA = patchNameA;
        this.patchNameB = patchNameB;

        //this.sendPatchValues();
    }

    polygonStartAnim () {
        const timeDriver = Animation.timeDriver({durationMilliseconds: 300});

        const outerDist = Animation.samplers.bezier(0.0, 0.0, 0.0, 7.0);
        const outerWidth = Animation.samplers.bezier(0.0, 0.06, 0.06, 0.06);

        const mainSizeAnim = Animation.samplers.bezier(0.0, 0.3, 0.3, 0.3);
        const mainWidthAnim = Animation.samplers.bezier(0.0, 0.1, 0.1, 0.1);

        const innerDist = Animation.samplers.bezier(0.0, 0.0, 0.06, 1.0);
        const innerWidth = Animation.samplers.bezier(0.0, 0.06, 0.06, 0.2);

        this.outerDist = Animation.animate(timeDriver, outerDist);
        this.outerWidth = Animation.animate(timeDriver, outerWidth);

        this.mainSize = Animation.animate(timeDriver, mainSizeAnim);
        this.mainWidth = Animation.animate(timeDriver, mainWidthAnim);

        this.innerDist = Animation.animate(timeDriver, innerDist);
        this.innerWidth = Animation.animate(timeDriver, innerWidth);

        timeDriver.start();
    }

    polygonEndAnim () {

        const timeDriver = Animation.timeDriver({durationMilliseconds: 200});

        const outerDist = Animation.samplers.bezier(0.0, -0.06, 0.6, 0.6);
        const outerWidth = Animation.samplers.bezier(0.0, 0.06, 0.06, 0.0);

        // const mainSizeAnim = Animation.samplers.bezier(0.0, 0.6, 0.6, 0.6);
        const mainWidthAnim = Animation.samplers.bezier(0.1, 0.0, 0.0, 0.0);

        const innerDist = Animation.samplers.bezier(0.0, -0.06, 0.1, 0.1);
        const innerWidth = Animation.samplers.bezier(0.0, 0.06, 0.06, 0.0);

        this.outerDist = Animation.animate(timeDriver, outerDist);
        this.outerWidth = Animation.animate(timeDriver, outerWidth);

        // this.mainSize = Animation.animate(timeDriver, mainSizeAnim);
        this.mainWidth = Animation.animate(timeDriver, mainWidthAnim);

        this.innerDist = Animation.animate(timeDriver, innerDist);
        this.innerWidth = Animation.animate(timeDriver, innerWidth);

        // timeDriver.start();

        Time.setTimeout(function(){
            timeDriver.start();
        }, 100);
    }

    sendPatchValues () {
        const valuePart1 = Reactive.RGBA(this.outerDist, this.outerWidth, this.mainSize, this.mainWidth);
        const valuePart2 = Reactive.RGBA(this.innerDist, this.innerWidth, this.shapeCount, this.alpha);

        Patches.inputs.setColor(this.patchNameA, valuePart1);
        Patches.inputs.setColor(this.patchNameB, valuePart2);
    }
}

export {PolygonAnimator};
