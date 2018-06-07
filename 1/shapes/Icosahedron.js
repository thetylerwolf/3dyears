var THREE = require('three')
var CANNON = require('cannon')

var Icosahedron = function(radius, material) {

    this.geometry = new THREE.IcosahedronGeometry( radius, 0)
    this.material = new THREE.MeshPhongMaterial( material )

    this.mesh = new THREE.Mesh( this.geometry, this.material );
}

Icosahedron.prototype.cannonVertices = function() {
    return this.geometry.vertices.map(function(v) {
        return new CANNON.Vec3( v.x, v.y, v.z )
    })
}

Icosahedron.prototype.cannonFaces = function() {
    return this.geometry.faces.map(function(f) {
        return [f.a, f.b, f.c]
    })
}

Icosahedron.prototype.createPhysicsBody = function(mass) {
    this.shape = new CANNON.ConvexPolyhedron(
        this.cannonVertices(),
        this.cannonFaces()
    )
    this.body = new CANNON.Body({
        mass: mass || 1
    });
    this.body.addShape(this.shape)

    return this.body
}

module.exports = Icosahedron