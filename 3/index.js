const THREE = require('three')
window.THREE = THREE
require('three/examples/js/controls/OrbitControls')
const glslify = require('glslify')
const TW = require('./lib/TW')

var camera, scene, renderer
var geometry, material, mesh, spotLight, ambient
var curve, tube
var space = 25, visited = {}, points = []
var bgColor = 0x97c8e2, tubeColor = 0x75c2c1

function init() {
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 200 )
    camera.position.x = space/2
    camera.position.y = space/2
    camera.position.z = space

    scene = new THREE.Scene()
    scene.background = new THREE.Color( bgColor )

    renderer = new THREE.WebGLRenderer( { antialias: true } )
    renderer.setSize( window.innerWidth, window.innerHeight )
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // controls
    var controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.minDistance = 0;
    controls.maxDistance = space * 2;

    document.body.appendChild( renderer.domElement )

}

function setupVisual() {

    spotLight = new THREE.SpotLight( 0xffbbbb )
    spotLight.position.set( 0, 0, space )

    // spotLight.castShadow = true;

    // spotLight.shadow.mapSize.width = 4096;
    // spotLight.shadow.mapSize.height = 4096;

    // spotLight.shadow.camera.near = 0.5;
    // spotLight.shadow.camera.far = 4000;
    // spotLight.shadow.camera.fov = 30;

    scene.add( spotLight )

    ambient = new THREE.AmbientLight( 0xbbbbff, 0.5 )

    scene.add( ambient )

    var planeGeometry = new THREE.PlaneBufferGeometry( 2000, 2000 )
    var planeMaterial = new THREE.ShadowMaterial({ side: THREE.DoubleSide })

    var plane = new THREE.Mesh( planeGeometry, planeMaterial )

    plane.position.set( 0, 0, -space )
    plane.receiveShadow = true

    scene.add( plane )

}

function findNextLocation( currentLocation ) {

    var x = currentLocation[0],
        y = currentLocation[1],
        z = currentLocation[2]

    var surroundingPoints = [
        // y-1 plane
        [ x - 1, y - 1, z - 1 ], [ x, y - 1, z - 1 ], [ x + 1, y - 1, z - 1 ],
        [ x - 1, y - 1, z ], [ x, y - 1, z ], [ x + 1, y - 1, z ],
        [ x - 1, y - 1, z + 1 ], [ x, y - 1, z + 1 ], [ x + 1, y - 1, z + 1 ],
        // y plane
        [ x - 1, y, z - 1 ], [ x, y, z - 1 ], [ x + 1, y, z - 1 ],
        [ x - 1, y, z ], /* [ x, y, z ], */ [ x + 1, y, z ],
        [ x - 1, y, z + 1 ], [ x, y, z + 1 ], [ x + 1, y, z + 1 ],
        // y+1 plane
        [ x - 1, y + 1, z - 1 ], [ x, y + 1, z - 1 ], [ x + 1, y + 1, z - 1 ],
        [ x - 1, y + 1, z ], [ x, y + 1, z ], [ x + 1, y + 1, z ],
        [ x - 1, y + 1, z + 1 ], [ x, y + 1, z + 1 ], [ x + 1, y + 1, z + 1 ]
    ]

    var nextLocation, count = 0

    do {

        nextLocation = TW.pick( surroundingPoints )

        var pointId = nextLocation.map(function(point) {
            return stringifyNum(point)
        }).join('')

        var pointVisited = visited[ pointId ]

        var withinBounds = nextLocation.every(function(coord) {
            return coord >= -space/2 && coord <= space/2
        })

        if(!withinBounds || pointVisited) {
            nextLocation = 'again'
            count++
        }

        if(nextLocation == 'again' && (count > surroundingPoints.length * 2)) {
            nextLocation = false
        }

    } while (nextLocation == 'again')

    return nextLocation

}

function traverseCube() {

    var currentLocation = [ Math.floor( 0 ), Math.floor( 0 ), Math.floor( 0 ) ]

    while(currentLocation) {

        var locationId = currentLocation.map(function(point) {
            return stringifyNum(point)
        }).join('')

        visited[ locationId ] = true

        points.push( new THREE.Vector3( currentLocation[0], currentLocation[1], currentLocation[2] ) )

        currentLocation = findNextLocation( currentLocation )

    }

    curve = new THREE.CatmullRomCurve3( points )

    material = new THREE.MeshPhongMaterial( { color: tubeColor, shininess: 100, side: THREE.DoubleSide } )

    tube = new THREE.TubeBufferGeometry( curve, points.length * 8, 0.3, 8, true )
    nMax = tube.attributes.position.count

    mesh = new THREE.Mesh( tube, material )
    mesh.castShadow = true

    scene.add( mesh )

}

var nMax,
    nEnd = 0,
    nStep = 72

function animate( time ) {

    nEnd = ( nEnd + nStep ) % nMax;

    mesh.geometry.setDrawRange( 0, nEnd );

    renderer.render( scene, camera )
    requestAnimationFrame( animate )

}

init()
setupVisual()
traverseCube()
requestAnimationFrame( animate )

function stringifyNum( num ) {

    var numChars = ('' + space).length

    var string = num + '',
        leadingZeroes = Math.max( 0, numChars - string.length ),
        stringified = '0'.repeat( leadingZeroes ) + string

    return stringified

}