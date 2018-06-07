const THREE = require('three')
const CANNON = require('cannon')
const Icosahedron = require('./shapes/Icosahedron')
const ObjectRegister = require('./shapes/ObjectRegister')

var camera, scene, renderer
var ambient, directional
var world, mass, timeStep = 1/60,
    planeBody, planeShape, planeFront, planeBack
var width = window.innerWidth, height = window.innerHeight
var radius = 0.7, maxShapes = 60, strokeWidth = 4
var objectRegister = ObjectRegister

function initCannon() {
    world = new CANNON.World();
    world.gravity.set(0,-9.8,0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    world.defaultContactMaterial.contactEquationRegularizationTime = 4
    objectRegister.setWorld(world)

    planeShape = new CANNON.Plane()

    planeBody = new CANNON.Body({
        mass:0
    })
    planeBody.position.set(0,0.1-height/200 + 0.1,0)

    planeFront = new CANNON.Body({
        mass:0
    })
    planeFront.position.set(0,0,-radius * Math.sqrt(2))

    planeBack = new CANNON.Body({
        mass:0
    })
    planeBack.position.set(0,0,radius * Math.sqrt(2))

    planeBody.addShape(planeShape)
    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.addBody(planeBody)

    planeFront.addShape(planeShape)
    planeFront.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),0);
    world.addBody(planeFront)

    planeBack.addShape(planeShape)
    planeBack.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI);
    world.addBody(planeBack)

    // var contact = new CANNON.ContactMaterial( planeBody, icoBody)
    // world.addContactMaterial(contact)
}

function initThree() {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    var can = document.getElementsByTagName('canvas')[0]
    can.onclick = function() {
        can.webkitRequestFullScreen()
    }

    renderer.autoClear = false;

    camera = new THREE.OrthographicCamera(width/-200, width/200, height/200, height/-200, -10, 10)
    camera.position.set(0,0,0)

    scene = new THREE.Scene()
    objectRegister.setScene(scene)
    objectRegister.setMaxShapes(maxShapes)

    ambient = new THREE.AmbientLight( 0xffffff, 0.7 )
    scene.add(ambient)

    directional = new THREE.DirectionalLight(0xffb74c)
    directional.position.set(-1,-0.5,0).normalize()
    scene.add(directional)
}

var delta, delay = 1500
function animate(time) {
    delta = delta || Date.now()
    if(Date.now() - delta >= delay) {
        addShape()
        delta = undefined
    }

    requestAnimationFrame( animate )
    updatePhysics()
    renderer.render( scene, camera )

}

function updatePhysics() {
    world.step(timeStep)

    objectRegister.updateObjects()
}

function addShape() {
    var icosahedron = new Icosahedron(radius, {
        color: 0x66d6e7,
        wireframe: true,
        wireframeLinewidth: strokeWidth
    })
    scene.add(icosahedron.mesh)

    var icoBody = icosahedron.createPhysicsBody(1)

    var x = (-width/200 + 1.5) + Math.random() * (width/100 - 1.5)

    icoBody.position.set(x,5,0)
    icoBody.angularVelocity.set(
        -10 + (Math.random() * 20),
        -10 + (Math.random() * 20),
        -10 + (Math.random() * 20)
    )
    icoBody.angularDamping = 0.5
    world.addBody(icoBody)

    objectRegister.add(icosahedron)
}

window.onload = function() {
    initThree()
    initCannon()
    animate()
};