import * as THREE from 'three'
import { json } from 'd3-fetch'
import { scaleLinear } from 'd3-scale'

import RectTapestry from './objects/RectTapestry'

import {
    PCSS,
    PCSSGetShadow
} from './shaders/pcss'

window.THREE = THREE
require('three/examples/js/controls/OrbitControls')

// const glslify = require('glslify')
const TW = require('./lib/TW')
const tapestry = new RectTapestry()

let camera, scene, renderer

let urlParams = new URLSearchParams(window.location.search)
let windSpeed, forceSpeed = urlParams.get('speed')


// colors : '#a4036f' '#16db93' '#2364aa' '#fec601' '#ea7317'

function init() {

    overWriteShadows()

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 200 )

    camera.position.x = 5
    camera.position.y = 1.5
    camera.position.z = 2
    camera.lookAt(new THREE.Vector3(0,0,0))

    scene = new THREE.Scene()

    renderer = new THREE.WebGLRenderer( { antialias: true } )
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight )

    renderer.shadowMap.enabled = true
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // renderer.gammaInput = true
    // renderer.gammaOutput = true

    document.body.appendChild( renderer.domElement )
    window.addEventListener( 'resize', onWindowResize, false );

}

function buildUI() {
    windSpeed = ''

    const fontLink = document.head.appendChild( document.createElement('link') )
    fontLink.rel = 'stylesheet'
    fontLink.href = 'https://fonts.googleapis.com/css?family=Arimo:400,700&display=swap'

    const container = document.body.appendChild( document.createElement('div') )
    container.style.position = 'absolute'
    container.style.top = '10px'
    container.style.right = '10px'
    container.style.textAlign = 'right'
    container.style.fontFamily = 'Arimo'
    container.style.fontWeight = 'bold'
    container.style.opacity = 0.2

    let cityTitle = container.appendChild( document.createElement('div') )
    cityTitle.innerHTML = 'Stockholm'
    cityTitle.style.fontSize = '36px'
    cityTitle.style.lineHeight = '36px'

    let smallTitle = container.appendChild( document.createElement('div') )
    smallTitle.innerHTML = 'wind speed'
    smallTitle.style.fontSize = '16px'
    smallTitle.style.lineHeight = '16px'

    let speedContainer = container.appendChild( document.createElement('div') )
    let speed = speedContainer.appendChild( document.createElement('span') )
    let suffix = speedContainer.appendChild( document.createElement('span') )
    speed.innerHTML = windSpeed
    speed.style.fontSize = '96px'
    speed.style.lineHeight = '96px'
    // speed.style.fontWeight = '400'
    suffix.innerHTML = 'km/h'
    suffix.style.fontSize = '16px'
    suffix.style.lineHeight = '16px'

    return getWindData( speed, true )

}

function getWindData( speedEl, recurse ) {
    if( recurse ) {
        setTimeout( () => getWindData( speedEl, true ), 60000 )
    }

    return json('https://api.openweathermap.org/data/2.5/weather?q=Stockholm,se&appid=ddd401e9504b3bfd92a991d52c304771')
        .then(data => {
            windSpeed = +data.wind.speed
            speedEl.innerHTML = windSpeed
            tapestry.multiplier = interpolateWindSpeed( forceSpeed ||  windSpeed )
        })
        .catch(() => {
            windSpeed = 5.12
            speedEl.innerHTML = windSpeed
            tapestry.multiplier = interpolateWindSpeed( forceSpeed || windSpeed )
        })
}

function interpolateWindSpeed( speed ) {

    const minIn = 0.1, maxIn = 20,
        minOut = 0.1, maxOut = 2.2

    const scale = scaleLinear()
        .domain([ minIn, maxIn ])
        .range([ minOut, maxOut ])

    return scale( speed )
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function overWriteShadows() {
    // overwrite shadowmap code
    let shader = THREE.ShaderChunk.shadowmap_pars_fragment;

    shader = shader.replace(
        '#ifdef USE_SHADOWMAP',
        '#ifdef USE_SHADOWMAP' +
        PCSS
    );

    shader = shader.replace(
        '#if defined( SHADOWMAP_TYPE_PCF )',
        PCSSGetShadow +
        '#if defined( SHADOWMAP_TYPE_PCF )'
    );

    THREE.ShaderChunk.shadowmap_pars_fragment = shader;

}

function setupVisual() {

    // Arrow up
    // const cone = new THREE.ConeGeometry(2,10)
    // scene.add(new THREE.Mesh(cone, new THREE.MeshStandardMaterial()))

    // const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 )
    // scene.add( ambientLight )

    const directionalLight = new THREE.DirectionalLight( 0xffeeee, .4 )
    directionalLight.position.set(0,15,0)
    directionalLight.castShadow = true

    directionalLight.shadow.mapSize.width = 512
    directionalLight.shadow.mapSize.height = 512

    scene.add( directionalLight )

    const directionalLight2 = new THREE.DirectionalLight( 0xccccff, .1 );
    directionalLight2.position.set(-2,15,0);
    directionalLight2.lookAt(new THREE.Vector3())
    scene.add( directionalLight2 );

    const ambientLight = new THREE.AmbientLight(0x808080, .5);
    scene.add(ambientLight);

    const light = new THREE.HemisphereLight( 0xffffff, 0xffffff, .5 );
    scene.add( light )

    const floorGeometry = new THREE.PlaneGeometry(100,100)
    const floor = new THREE.Mesh(floorGeometry, new THREE.ShadowMaterial({
        color:'#9997a5'
    }))
    floor.position.y = -2.5
    floor.rotation.x = -Math.PI/2
    floor.receiveShadow = true
    scene.add(floor)

    renderer.setClearColor("#fff", 1)
    // scene.fog = new THREE.FogExp2('#faebe0', 0.0075 );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    controls
    var controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target = new THREE.Vector3( 0, 0, 0 )
    controls.minDistance = 0;
    controls.maxDistance = 100;
}

function buildTapestry() {

    scene.add(tapestry.tapestry)
}

function animate( time ) {
    requestAnimationFrame( animate )
    // window.time = Date.now()
    tapestry.tick()

    renderer.render( scene, camera )
    // console.log(Date.now() - window.time)
    // console.log('calls', renderer.info.render.calls)

}

init()
setupVisual()
buildUI().finally(() => buildTapestry())

requestAnimationFrame( animate )
