// var THREE = require('three')
// var CANNON = require('cannon')

// var ObjectRegister = function() {
//     this.objects = []
// }


module.exports = {
    id: 0,

    objects: [],

    maxShapes: 0,

    setScene: function(scene) {
        this.scene = scene
    },

    setWorld: function(world) {
        this.world = world
    },

    add: function(o) {
        o.id = o.id++
        this.objects.push(o)
        if(this.maxShapes && this.objects.length > this.maxShapes) {
            this.clear()
        }
    },

    remove: function(o) {
        var i = this.objects.indexOf(o)
        this.objects.splice(i,1)
    },

    updateObjects: function() {
        this.objects.forEach(function(o) {
            o.mesh.position.copy(o.body.position)
            o.mesh.quaternion.copy(o.body.quaternion)
        })
    },

    setMaxShapes: function(num) {
        this.maxShapes = num
    },

    clear: function() {
        var _this = this

        this.objects.forEach(function(o) {
            _this.scene.remove(o.mesh)
            _this.world.removeBody(o.body)
        })
        this.objects = []
    }
}