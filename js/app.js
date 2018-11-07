var app = new Vue({
    el: '#app',
    data: {
        nbKeys: 61,
        velocities: []
    },
    created: function () {
        this.velocities = new Array(this.nbKeys).fill(0);
    },
    methods: {
        isBlackKey: function (key) {
            key = key % 12;
            return (key < 5) == (key % 2);
        }
    }
});
