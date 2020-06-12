"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

// IDs
var torsoId = 0;
var headId  = 1;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
var tailID = 10

var lowerTreeId = 11;
var upperTreeId = 12;

// Bear dimensions
var torsoHeight = 5.0;
var torsoWidth = 4.0;
var upperArmHeight = 2.0;
var lowerArmHeight = 2.0;
var upperArmWidth  = 1.0;
var lowerArmWidth  = 1.0;
var upperLegWidth  = 1.0;
var lowerLegWidth  = 1.0;
var lowerLegHeight = 2.0;
var upperLegHeight = 2.0;
var headHeight = 2.0;
var headWidth = 2.0;
var tailHeight = 0.8;
var tailWidth = 0.8;

var theta = [0, 0, 90, 0, 90, 0, 90, 0, 90, 0];

// Tree dimensions
var lowerTreeHeight = 16.0;
var lowerTreeWidth = 3.0;
var upperTreeHeight = 15.0;
var upperTreeWidth = 15.0;

var stack = [];
var figure = [];
var numNodes = 13;

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var tBuffer;
var modelViewLoc;

var pointsArray = [];
var texCoordsArray = [];


// Texture variables
var texTrunk, texLeaves;
var texBody, texHead;


// ----- Variables for animation -----
var posBearX = -15.0;
var posBearY = -11.0;
var posTreeX = 10.0;

var key = 0;

var then = 0;

// Speeds
const speedBear = 4;
const speedRotation = 40;
var speedWalk = 35;
const speedInclination = 120;
const speedStretch = 30;
var speedScratching = -2;
var speedScratchingLegs = 50;

var inclination = 0;
var done = false;
// -----------------------------------


//  Texture configuration
function configureTexture(imgBody, imgHead, imgTrunk, imgLeaves) {
    texBody = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texBody);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imgBody);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    texHead = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texHead);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imgHead);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    texTrunk = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texTrunk);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imgTrunk);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    texLeaves = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texLeaves);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imgLeaves);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}


function scale4(a, b, c) {
   var result = mat4();
   result[0] = a;
   result[5] = b;
   result[10] = c;
   return result;
}


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch(Id) {

    case torsoId:
    m = translate(posBearX, posBearY, 0.0);
    m = mult(m, rotate(90, vec3(0, 0, 1)) );
    m = mult(m, rotate(90, vec3(0, 1, 0)) );
    m = mult(m, rotate(theta[torsoId], vec3(0, 0, 1)));
    m = mult(m, rotate(inclination, vec3(1, 0, 0)));
    figure[torsoId] = createNode(m, torso, lowerTreeId, headId );
    break;

    case headId:
    m = translate(0.0, torsoHeight, headWidth/4.0);
    m = mult(m, rotate(90, vec3(0, 1, 0)));
    m = mult(m, rotate(theta[headId], vec3(0, 0, 1)));
    figure[headId] = createNode(m, head, leftUpperArmId, null);
    break;

    case leftUpperArmId:
    m = translate(-0.5*torsoWidth, 0.9*torsoHeight, 0.0);
	m = mult(m, rotate(theta[leftUpperArmId], vec3(1, 0, 0)));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:
    m = translate(0.5*torsoWidth, 0.9*torsoHeight, 0.0);
	m = mult(m, rotate(theta[rightUpperArmId], vec3(1, 0, 0)));
    figure[rightUpperArmId] = createNode(m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;

    case leftUpperLegId:
    m = translate(-0.5*torsoWidth, 0.1*torsoHeight, 0.0);
	m = mult(m , rotate(theta[leftUpperLegId], vec3(1, 0, 0)));
    figure[leftUpperLegId] = createNode(m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:
    m = translate(0.5*torsoWidth, 0.1*torsoHeight, 0.0);
	m = mult(m, rotate(theta[rightUpperLegId], vec3(1, 0, 0)));
    figure[rightUpperLegId] = createNode(m, rightUpperLeg, tailID, rightLowerLegId );
    break;

    case leftLowerArmId:
    m = translate(0.0, 0.9*upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], vec3(1, 0, 0)));
    figure[leftLowerArmId] = createNode(m, leftLowerArm, null, null );
    break;

    case rightLowerArmId:
    m = translate(0.0, 0.9*upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], vec3(1, 0, 0)));
    figure[rightLowerArmId] = createNode(m, rightLowerArm, null, null );
    break;

    case leftLowerLegId:
    m = translate(0.0, 0.9*upperLegHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId], vec3(1, 0, 0)));
    figure[leftLowerLegId] = createNode(m, leftLowerLeg, null, null );
    break;

    case rightLowerLegId:
    m = translate(0.0, 0.9*upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], vec3(1, 0, 0)));
    figure[rightLowerLegId] = createNode(m, rightLowerLeg, null, null );
    break;

    case tailID:
    m = translate(0.0, 0.0, 0.25*torsoWidth);
    figure[tailID] = createNode(m, tail, null, null);
    break;

    case lowerTreeId:
    m = translate(posTreeX, -15.0, 0.0);
    figure[lowerTreeId] = createNode(m, lowerTree, null, upperTreeId );
    break;

    case upperTreeId:
    m = translate(0.0, lowerTreeHeight, 0.0);
    figure[upperTreeId] = createNode(m, upperTree, null, null);
    break;
    }
}


function traverse(Id) {
    if(Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();
    if(figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
    if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}


function torso() {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texBody);
    gl.uniform1i(gl.getUniformLocation( program, "uTex"), 0);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i=0; i<3; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);

    // Draw face
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texHead);
    gl.uniform1i(gl.getUniformLocation( program, "uTex"), 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 4*3, 4);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texBody);
    gl.uniform1i(gl.getUniformLocation( program, "uTex"), 0);
    for(var i=4; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {
    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tail() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, -0.5 * tailHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(tailWidth, tailHeight, tailWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function lowerTree() {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texTrunk);
    gl.uniform1i(gl.getUniformLocation( program, "uTex"), 0);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerTreeHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerTreeWidth, lowerTreeHeight, lowerTreeWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function upperTree() {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texLeaves);
    gl.uniform1i(gl.getUniformLocation( program, "uTex"), 0);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperTreeHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperTreeWidth, upperTreeHeight, upperTreeWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     pointsArray.push(vertices[b]);
     pointsArray.push(vertices[c]);
     pointsArray.push(vertices[d]);

     texCoordsArray.push(texCoord[0]);
     texCoordsArray.push(texCoord[1]);
     texCoordsArray.push(texCoord[2]);
     texCoordsArray.push(texCoord[3]);
}


function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}


window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) { alert("WebGL 2.0 isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-20.0, 20.0, -20.0, 20.0, -20.0, 20.0);
    
    modelViewMatrix = rotate(-45, vec3(0,1,0));
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix) );

    cube();

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    var imgBody = document.getElementById("imgBody");
    var imgHead = document.getElementById("imgHead")
    var imgTrunk = document.getElementById("imgTrunk");
    var imgLeaves = document.getElementById("imgLeaves");

    configureTexture(imgBody, imgHead, imgTrunk, imgLeaves);

    for(i=0; i<numNodes; i++) initNodes(i);

    requestAnimationFrame(render);

    // Start animation
    document.getElementById("startAnim").onclick = function() {
        if(key == 0) key = 1;
    };

    // Modify camera angle
    document.getElementById("camera1").onclick = function() {
        modelViewMatrix = rotate(-45, vec3(0,1,0));
        for(i=0; i<numNodes; i++) initNodes(i);
    };
    document.getElementById("camera2").onclick = function() {
        modelViewMatrix = rotate(0, vec3(0,1,0));
        for(i=0; i<numNodes; i++) initNodes(i);
    };
    document.getElementById("camera3").onclick = function() {
        modelViewMatrix = rotate(45, vec3(0,1,0));
        for(i=0; i<numNodes; i++) initNodes(i);
    };
}

function walkAnimation(deltaTime, minAngle, maxAngle) {
    theta[leftUpperArmId] += speedWalk * deltaTime;
    theta[rightUpperArmId] -= speedWalk * deltaTime;
    theta[leftUpperLegId] -= speedWalk * deltaTime;
    theta[rightUpperLegId] += speedWalk * deltaTime;

    theta[leftLowerArmId] += speedWalk * deltaTime;
    theta[rightLowerArmId] -= speedWalk * deltaTime;
    theta[leftLowerLegId] -= speedWalk * deltaTime;
    theta[rightLowerLegId] += speedWalk * deltaTime;

    if(theta[leftUpperArmId] > maxAngle  && speedWalk > 0 ||
        theta[leftUpperArmId] < minAngle && speedWalk < 0)
        speedWalk = -speedWalk;

    for(i=0; i<numNodes; i++) initNodes(i);
}

function stretchLegs(deltaTime){
    // Iterate over all limbs
    done = true;
    for (i=leftUpperArmId; i<=rightUpperLegId; i=i+2) {
        if (theta[i] < 89) {
            theta[i] += speedStretch * deltaTime;
            done = false;
        }
        else if (theta[i] > 91) {
            theta[i] -= speedStretch * deltaTime;
            done = false;
        }

        if (theta[i+1] < -1) {
            theta[i+1] += speedStretch * deltaTime;
            done = false;
        }
        else if (theta[i+1] > 1) {
            theta[i+1] -= speedStretch * deltaTime;
            done = false;
        }
    }
    for(i=0; i<numNodes; i++) initNodes(i);
}

function scratchingAnimation(deltaTime){
    posBearY += speedScratching * deltaTime;

    theta[leftUpperLegId] -= speedScratchingLegs * deltaTime;
    theta[rightUpperLegId] -= speedScratchingLegs * deltaTime;

    theta[leftLowerLegId] += 2*speedScratchingLegs * deltaTime;
    theta[rightLowerLegId] += 2*speedScratchingLegs * deltaTime;

    if ((posBearY < -13.0 && speedScratching < 0) ||
        (posBearY > -12.0 && speedScratching > 0)) 
    {
        speedScratching = -speedScratching;
        speedScratchingLegs = -speedScratchingLegs;
    }

    for(i=0; i<numNodes; i++) initNodes(i);
}

function animate(deltaTime) {
    switch (key){
        case 0:
            break;

        // Walk towards the tree
        case 1:
            if (posBearX < posTreeX - (0.6*lowerTreeWidth + torsoHeight + headHeight) )
                posBearX += speedBear * deltaTime;
            else key = 2;
            walkAnimation(deltaTime, 75, 105);
            break;

        // Start rotation
        case 2:
            if (theta[torsoId] < 45) {
                theta[torsoId] += speedRotation * deltaTime;
            }
            else key = 3;
            walkAnimation(deltaTime, 85, 95);
            break;

        // Complete rotation while getting closer
        case 3:
            if (theta[torsoId] < 180) {
                theta[torsoId] += speedRotation * deltaTime;
                if (posBearX < posTreeX - (0.5*lowerTreeWidth + torsoWidth) )
                    posBearX += 0.3*speedBear * deltaTime;
            }
            else key = 4;
            walkAnimation(deltaTime, 85, 95);
            break;

        // Get closer to the tree
        case 4:
            if (posBearX < posTreeX - 0.5*(lowerTreeWidth + torsoWidth) )
                posBearX += speedBear * deltaTime;
            else key = 5;
            walkAnimation(deltaTime, 75, 105);
            break;

        // Prepare
        case 5:
            stretchLegs(deltaTime);
            if (done) 
                key = 6;
            break;

        // Get on two legs
        case 6:
            if (inclination > -90) {
                inclination -= speedInclination * deltaTime;
                theta[leftUpperArmId] += speedInclination * deltaTime;
                theta[rightUpperArmId] += speedInclination * deltaTime;
                theta[leftUpperLegId] += speedInclination * deltaTime;
                theta[rightUpperLegId] += speedInclination * deltaTime;
                if (theta[headId] > -30)
                    theta[headId] -= speedInclination * deltaTime;
                // if (posBearY > -12)
                //     posBearY -= 1.0*deltaTime;
            }
            else key = 7;
            for(i=0; i<numNodes; i++) initNodes(i);
            break;

        // Start scratching
        case 7:
            scratchingAnimation(deltaTime);
            break;
    }
}

var render = function(now) {
    now *= 0.001;
    const deltaTime = now - then;
    then = now;

    animate(deltaTime);
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    traverse(torsoId);
    requestAnimationFrame(render);
}
