Object.defineProperty(Vue.prototype, 'WebMidi', { value: WebMidi });

var app = new Vue({
    el: '#app',
    props: {
        'nb-keys': {
            type: Number,
            default: 61,
            validator: function (value) {
                return value > 0;
            }
        },
        'offset-keys': {
            type: Number,
            default: 36,
            validator: function (value) {
                return value > 0;
            }
        }
    },
    data: function() {
        return {
            errorMessage: null,
            selectedMidiInputId: null,
            midiInput: null,
            velocities: []
        };
    },
    created: function () {

        this.velocities = new Array(this.nbKeys).fill(0);

        WebMidi.enable((errorMessage) => {

            if (errorMessage) {
                this.errorMessage = errorMessage;
                console.log(errorMessage);
                return;
            }

            if(WebMidi.inputs.length) {
                this.selectedMidiInputId = WebMidi.inputs[0].id;
            }
        });
    },
    watch: {
        selectedMidiInputId(newMidiInputId) {
            if(this.midiInput) {
                this.midiInput.removeListener();
            }
            this.midiInput = WebMidi.getInputById(newMidiInputId);
            if(this.midiInput) {
                this.midiInput.addListener('noteon', 'all', (event) => {
                    var note = event.note.number - this.offsetKeys;
                    if(0 <= note && note < this.velocities.length) {
                        Vue.set(this.velocities, note, event.velocity);
                    }
                });
                this.midiInput.addListener('noteoff', 'all', (event) => {
                    var note = event.note.number - this.offsetKeys;
                    if(0 <= note && note < this.velocities.length) {
                        Vue.set(this.velocities, note, 0);
                    }
                });
            }
        }
    },
    methods: {
        isBlackKey: function (key) {
            key = key % 12;
            return (key < 5) == (key % 2);
        },

        velocityCss: function (velocity) {
            return velocity > 0 ? {
                background: 'linear-gradient(-25deg, rgba(168,14,14,'+velocity+'), rgba(245,34,34,'+velocity+'), rgba(191,32,32,'+velocity+'))'
            } : {};
        }
    }
});
