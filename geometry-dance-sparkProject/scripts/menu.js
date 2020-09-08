
const Scene = require('Scene');
const Textures = require('Textures');
const Touch = require('TouchGestures');
const NativeUI = require('NativeUI');
const Diagnostics = require('Diagnostics');
const Time = require('Time');
const Reactive = require('Reactive');
const Persistence = require('Persistence');

var uiPicker = NativeUI.picker;

let _grid = {};

let _uiStatus = {
    uiOn: false,
    nowMode: 0, // 0: move, 1: triangle, 2: rectangle, 3: director
    nowLevel: 0, // 0: modes, 1: director sequences, 2: add next sequence
    nowSequences: [],
    nowSeqIndex: 0,
    isModify: false,
    modifyTarget: 0
};

let icons = {};

const storage = Persistence.userScope;
let uiHider = {};

(async function() {

    _grid.target = await Scene.root.findFirst('grid-anchor');
    _grid.posX = 0.0;
    _grid.posY = 0.0;

    icons.modeMove = await Textures.findFirst('icon-move');
    icons.modeTriangle = await Textures.findFirst('icon-mode-triangle');
    icons.modeRectangle = await Textures.findFirst('icon-mode-rectangle');
    icons.modeDirector = await Textures.findFirst('icon-mode-director');

    icons.seq = [];
    icons.seq[0] = await Textures.findFirst('icon-director-triangle-up');
    icons.seq[1] = await Textures.findFirst('icon-director-triangle-down');
    icons.seq[2] = await Textures.findFirst('icon-director-triangle-left');
    icons.seq[3] = await Textures.findFirst('icon-director-triangle-right');
    icons.seq[4] = await Textures.findFirst('icon-director-rotateable-triangle');
    icons.seq[5] = await Textures.findFirst('icon-director-regtangle');
    icons.seq[6] = await Textures.findFirst('icon-director-diamond');
    icons.seq[7] = await Textures.findFirst('icon-director-rotateable-rectangle');
    icons.seqRemove = await Textures.findFirst('icon-director-remove');
    icons.seqAdd = await Textures.findFirst('icon-director-add-next');

    // show default
    showModes();

    // load data
    storage.get('sequences')
    .then(resolve => {
        if(resolve != null)
        {
            _uiStatus.nowSequences = resolve;
        }
    })
    .catch(error => {
        Diagnostics.log("no data!");
    });

    // hide menu button
    uiHider.isHidden = false;
    uiHider.button = await Scene.root.findFirst('pickerHideButton');

    Touch.onTap(uiHider.button).subscribe(data=>{
        Diagnostics.log("button tapped!");
        uiHider.isHidden = !uiHider.isHidden;
        uiPicker.visible = uiHider.isHidden;
    });
})();

function showModes () {
    uiPicker.visible = true;
    uiPicker.selectedIndex = _uiStatus.nowMode;
    uiPicker.configure({
        selectedIndex: _uiStatus.nowMode,
        items: [
            {image_texture: icons.modeMove},
            {image_texture: icons.modeTriangle},
            {image_texture: icons.modeRectangle},
            {image_texture: icons.modeDirector}
        ]
    });
}

Touch.onLongPress().subscribe(function(gesture){
    switch(_uiStatus.nowLevel)
    {
        case 0: // setting mode: nothing
        break;

        case 1: // director mode, back to mode select
        _uiStatus.nowLevel = 0;
        showModes();
        break;

        case 2:
        showDirectorUI();
        break;
    }
});

Touch.onPan().subscribe(function(gesture){
    Reactive.monitorMany({diffX: gesture.translation.x, diffY: gesture.translation.y}, {fireOnInitialValue: true}).subscribe(data=>{

        if(_uiStatus.nowMode == 0)
        {
            let addX = 0.0;
            let addY = 0.0;

            if(data.oldValues)
            {
                addX = data.newValues.diffX - data.oldValues.diffX;
                addY = data.newValues.diffY - data.oldValues.diffY;
            }
            else
            {
                addX = data.newValues.diffX;
                addY = data.newValues.diffY;
            }

            _grid.posX += addX * 0.001;
            _grid.posY += addY * 0.001;

            _grid.target.transform.x = _grid.posX;
            _grid.target.transform.z = _grid.posY;
        }
    });
});

uiPicker.selectedIndex.monitor().subscribe(function(index){
    let pickedValue = index.newValue;

    Time.setTimeout(function(){
        if(uiPicker.selectedIndex.pinLastValue() == pickedValue)
        {
            Diagnostics.log("real picked " + pickedValue + "!");
            handleUiPick(pickedValue);
        }
    }, 1000);
});

function handleUiPick (index) {
    if(_uiStatus.nowLevel == 0) // picking modes
    {
        switch(index) {
            case 0:
            // set to move mode;
            _uiStatus.nowMode = 0;
            _grid.target.hidden = false;
            break;

            case 1:
            // set to triangle mode
            _uiStatus.nowMode = 1;
            _grid.target.hidden = true;
            break;

            case 2:
            // set to rectangle mode
            _uiStatus.nowMode = 2;
            _grid.target.hidden = true;
            break;

            case 3:
            // set to director mode
            _uiStatus.nowMode = 3;
            _grid.target.hidden = true;
            showDirectorUI();
            break;
        }
    }
    else if(_uiStatus.nowLevel == 1)
    {
        modifyOrAddSequence(index);
    }
    else if(_uiStatus.nowLevel == 2)
    {
        selectSequenceItem(index);
    }
}


function modifyOrAddSequence (pickedIndex) {
    if(pickedIndex == _uiStatus.nowSequences.length + 1) // pick add
    {
        Diagnostics.log("DO ADD!");
        _uiStatus.isModify = false;
        showSequenceItems();
    }
    else if(pickedIndex == 0) // director icon, nothing
    {
        // nothing
    }
    else
    {

        Diagnostics.log("DO MODIFY!");
        _uiStatus.isModify = true;
        _uiStatus.modifyTarget = pickedIndex-1;
        modifySequenceItem(pickedIndex);
    }

    _uiStatus.nowSeqIndex = 0;
}

function showSequenceItems () {
    _uiStatus.nowLevel = 2;

    uiPicker.configure({
        selectedIndex: 0,
        items: [
            {image_texture: icons.seqAdd},//0
            {image_texture: icons.seq[0]},//1
            {image_texture: icons.seq[1]},//2
            {image_texture: icons.seq[2]},//3
            {image_texture: icons.seq[3]},//4
            {image_texture: icons.seq[4]},//5
            {image_texture: icons.seq[5]},//6
            {image_texture: icons.seq[6]},//7
            {image_texture: icons.seq[7]},//8
            {image_texture: icons.seqRemove}//9
        ]
    });
}

function modifySequenceItem (index) {
    showSequenceItems ();
}

function selectSequenceItem (index) {
    switch(index)
    {
        case 0: // seqAdd
        break;

        case 1: // triangle up
        case 2: // seqTriangleDown
        case 3: // seqTriangleLeft
        case 4: // seqTriangleRight
        case 5: // seqTriangleRotate
        case 6: // seqRectangle
        case 7: // seqDiamond
        case 8: // seqRectangleRotate

            if(!_uiStatus.isModify)
                addSequence(index);
            else
                modifySequence(index);
        break;
        case 9: // seqRemove
            removeSequence(index);
        break;

    }
}

function addSequence (index) {
    _uiStatus.nowSequences.push(seqObjs[index-1]);
    saveSequenceToStorage();

    Diagnostics.log("added!");
    showDirectorUI();
}

function removeSequence () {
    _uiStatus.nowSequences.splice(_uiStatus.modifyTarget, 1);
    saveSequenceToStorage();

    Diagnostics.log("removed!");
    showDirectorUI();
}

function modifySequence (uiPickIndex) {
    const targetSeqIndex = _uiStatus.modifyTarget;
    _uiStatus.nowSequences[targetSeqIndex] = seqObjs[uiPickIndex-1];
    saveSequenceToStorage();

    showDirectorUI();
}

function showDirectorUI () {
    _uiStatus.nowLevel = 1;

    let displayItems = [];
    displayItems[0] = {image_texture: icons.modeDirector};

    let lastIndex = 1;
    for(let i=0; i< _uiStatus.nowSequences.length; i++)
    {
        const seq = _uiStatus.nowSequences[i];
        displayItems[lastIndex] = {image_texture: icons.seq[seq.iconId]};

        lastIndex++;
    }

    displayItems[lastIndex] = {image_texture: icons.seqAdd};

    uiPicker.configure({
        selectedIndex: 0,
        items: displayItems
    });
}

// sequence settings
function saveSequenceToStorage () {
    storage.set('sequences', _uiStatus.nowSequences);
}

const TRIANGLE_UP = {
    canRotate: false,
    shapeCount: 3,
    angle: 0.0,
    iconId: 0
}

const TRIANGLE_DOWN = {
    canRotate: false,
    shapeCount: 3,
    angle: 180.0,
    iconId: 1
}

const TRIANGLE_LEFT = {
    canRotate: false,
    shapeCount: 3,
    angle: 90.0,
    iconId: 2
}

const TRIANGLE_RIGHT = {
    canRotate: false,
    shapeCount: 3,
    angle: 270.0,
    iconId: 3
}

const TRIANGLE_ROTATE = {
    canRotate: true,
    shapeCount: 3,
    angle: 0.0,
    iconId: 4
}

const RECTANGLE = {
    canRotate: false,
    shapeCount: 4,
    angle: 0.0,
    iconId: 5

}

const DIAMOND = {
    canRotate: false,
    shapeCount: 4,
    angle: 45.0,
    iconId: 6
}

const RECTANGLE_ROTATE = {
    canRotate: true,
    shapeCount: 4,
    angle: 0.0,
    iconId: 7
}

const seqObjs = [
    TRIANGLE_UP, TRIANGLE_DOWN, TRIANGLE_LEFT, TRIANGLE_RIGHT, TRIANGLE_ROTATE, RECTANGLE, DIAMOND, RECTANGLE_ROTATE
];

export {_uiStatus};
