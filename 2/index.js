const THREE = require('three');
const glslify = require('glslify');
const postprocessing = require('postprocessing')

var camera, scene, renderer;
var mesh, material, geometry, cubes;
var clock = new THREE.Clock();
var spotLight, spotLight2, pointLight;
var cubeDimensions = new THREE.Vector3( 10, 10, 10 ),
    cubeDensity = 0.5,
    cubeWidth = 1;

var composer, pass;

function init() {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 20 );
    camera.position.set(-7,7,3);
    camera.lookAt(new THREE.Vector3(0,0,0) );

    scene = new THREE.Scene();

    composer = new postprocessing.EffectComposer(renderer)
    composer.addPass(new postprocessing.RenderPass(scene, camera))

    pass = new postprocessing.BloomPass({ intensity: 2.0, distinction: 3.0 })
    pass.renderToScreen = true
    composer.addPass(pass)

    geometry = new THREE.CubeGeometry( cubeWidth, cubeWidth, cubeWidth );

    spotLight2 = new THREE.SpotLight( 0xEEEEFF, 1, 0, Math.PI/2 );
    spotLight2.position.set( -10, 10, -10 );
    spotLight2.target.position.set( 0, 0, 0 );

    spotLight2.castShadow = true;

    spotLight2.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera(50, 1, 1, 2500));
    spotLight2.shadow.bias = 0.0001;

    spotLight2.shadow.mapSize.width = 2048;
    spotLight2.shadow.mapSize.height = 1024;

    scene.add(spotLight2);

    pointLight = new THREE.PointLight( 0xff0000, 1, 100 , 2)
    pointLight.castShadow = true;
    pointLight.position.set( 0, 0, 0 );
    scene.add(pointLight)

    cubes = new THREE.Geometry()

    material = new THREE.MeshPhongMaterial( {
        color: 0xFFFFFF,
        shininess: 60,
        aoMapIntensity: 0.5
    } );

    for (var y = 0; y < ( cubeDimensions.y ); y++) {
        for (var z = 0; z < ( cubeDimensions.z ); z++) {
            for (var x = 0; x < ( cubeDimensions.x ); x++) {
                if(Math.random() > 0.8) {

                    mesh = new THREE.Mesh( geometry );
                    mesh.position.x = -(cubeWidth * cubeDimensions.x/2) + x * cubeWidth;
                    mesh.position.y = -(cubeWidth * cubeDimensions.y/2) + y * cubeWidth;
                    mesh.position.z = -(cubeWidth * cubeDimensions.z/2) + z * cubeWidth;;

                    cubes.mergeMesh( mesh )
                }
            }
        }
    }

    var mesher = new THREE.Mesh( cubes, material );
    mesher.castShadow = true;
    mesher.receiveShadow = true;

    scene.add( mesher );

}

var t = Date.now();
function animate() {
    t += clock.getDelta();
    requestAnimationFrame( animate );

    pulseLight();
    cycleLightColor();
    moveLight();
    rotateCamera();

    composer.render(clock.getDelta)

}

function pulseLight() {
    // var time = Date.now() * 0.0005;
    pointLight.intensity = 0.25 + Math.sin(t/3) * 0.25;
}

function cycleLightColor() {
    var dtime = clock.getDelta();
    // var time = Date.now() * 0.0005;
    pointLight.color.offsetHSL( dtime , 0, 0 );
}

function moveLight() {
    var dtime = t * 0.08;
    var x = 0.5 * Math.cos(dtime),
        y = 0.5 * Math.sin( 2 * dtime )/2,
        z = 0.5 * Math.sin(dtime);

    pointLight.position.set( x, y, z );
}

function rotateCamera() {
    var time = Date.now() * 0.00002;
    var x = Math.cos(time) * 7;
    var y = Math.sin(time) * 7;
    var z = Math.sin(time) * 7;
    camera.position.set( x , y, z );
    camera.lookAt(new THREE.Vector3(0,0,0) );
}

window.onload = function() {
    init();
    animate();
};

window.onresize = function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
