import * as THREE from 'three'

import SimplexNoise from '../lib/perlin-noise-simplex'

const noise = new SimplexNoise()

const colors = [
  // '#2874B6',
  // '#39A019',
  // '#FFAF00',
  // '#B62828',
  // '#333',
  // '#FFF'
  '#1c5282',
  '#c78800',
  // '#256a11'
]

class RectTapestry {

  constructor( rotation={ x: 0, y: 0, z: 0 }, multiplier=1 ) {
    this.rotation = rotation
    this.rects = []
    // this.xSpeed = speed.x
    // this.ySpeed = speed.y
    this.delta = 0
    this.multiplier = multiplier

    this.tapestry = new THREE.Group()
    this.tapestry.rotation.x = rotation.x
    this.tapestry.rotation.y = rotation.y
    this.tapestry.rotation.z = rotation.z

    this.build()
  }

  addRect(rect) {
    this.tapestry.add( rect )
    this.rects.push(rect)
  }

  build() {
    let x = 30, z = 25
    let w = 0.125, h = 0.25, d = 0.0125
    let gap = 0

    if(!this.planePlaced) {
      this.placePlane( x, z, w, h, gap )
      this.planePlaced = true
    }

    for(let i=0; i<x; i++) {
        for(let j=0; j<z; j++) {
            let rect

            if(!this.rectsPlaced) {
              rect = this.buildBox( h, w, d )
              this.addRect(rect)
            } else {
              rect = this.rects[ i + (j * x) ]
            }

            this.placeRect( rect, i, j )

        }
    }

    this.rectsPlaced = true
    this.planeMesh.geometry.verticesNeedUpdate = true

    this.tapestry.position.x = -w * x/2
    this.tapestry.position.z = -h * z/2

  }

  placePlane(x,z,w,h,gap) {

    const width = (x-1) * (w + gap),
      height = z * (h + gap) - h/2

    const geometry = new THREE.PlaneGeometry(height, width, z - 1, x - 1)
    const material = new THREE.ShadowMaterial({
        side: THREE.DoubleSide,
    })

    const mesh = new THREE.Mesh(geometry, material)

    mesh.rotation.z = Math.PI/2
    mesh.rotation.x = Math.PI/2
    mesh.position.z = height/2
    mesh.position.x = width/2

    mesh.castShadow = true

    this.planeMesh = mesh

    this.tapestry.add(mesh)

  }

  setPlaneVertex( index, z ) {
    let vertices = this.planeMesh.geometry.vertices,
        vertex = vertices[ index ]

    vertex.setZ( -z )
  }

  placeRect( rect, i, j ) {
    let x = 30, z = 25
    let w = 0.125, h = 0.25, d = 0.025
    let gap = 0

    let offsetZ = i % 2,
        offsetY = 0.7 * this.multiplier

    let xPos = i * (w + gap),
        zPos = j * (h + gap) + offsetZ * h/2,
        xPosDelta = xPos + this.delta,
        zPosDelta = zPos + this.delta,
        yPos = noise.noise(  7 * xPosDelta/x,  7 * zPosDelta/z ) * offsetY

    rect.position.x = xPos
    rect.position.y = yPos
    rect.position.z = zPos

    this.setPlaneVertex( j + (i * 25), yPos )

    // Rotation code
    let prevX = (i-1) * (w + gap) + this.delta,
        nextX = (i+1) * (w + gap) + this.delta,
        prevZ = (j-1) * (h + gap) + offsetZ * h/2 + this.delta,
        nextZ = (j+1) * (h + gap) + offsetZ * h/2 + this.delta,
        nextZY = noise.noise( 7 * xPosDelta/x,  7 * nextZ/z) * offsetY,
        prevZY = noise.noise( 7 * xPosDelta/x,  7 * prevZ/z) * offsetY,
        nextXY = noise.noise( 7 * nextX/x,  7 * zPosDelta/z) * offsetY,
        prevXY = noise.noise( 7 * prevX/x,  7 * zPosDelta/z) * offsetY

    let zVector = new THREE.Vector3(nextX - prevX, nextXY - prevXY, 0),
      xVector = new THREE.Vector3(0, nextZY - prevZY, nextZ - prevZ)

    let normalizedVector = xVector.cross( zVector ).normalize()

    let yAxis = new THREE.Vector3(0,1,0)
    let rotation = ( new THREE.Quaternion() ).setFromUnitVectors( yAxis, normalizedVector )

    rect.rotation.x = 0
    rect.rotation.y = 0
    rect.rotation.z = 0
    rect.applyQuaternion( rotation )

  }

  buildBox(height, width, depth) {

      let geometry = this.geometry || new THREE.BoxBufferGeometry( width, depth, height )
      this.geometry = geometry

      let mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial({
              // side: THREE.DoubleSide,
              color: colors[ Math.floor(Math.random() * colors.length) ],
              // color: '#3d5c66',
              metalness: 0.1,
              roughness: 0.4,
          }) )

      // mesh.castShadow = true

      return mesh

  }


  tick() {
    this.delta += 0.015
    this.build()

    // this.tapestry.position.x += this.xSpeed
    // this.tapestry.position.y += this.ySpeed
  }

}

export default RectTapestry