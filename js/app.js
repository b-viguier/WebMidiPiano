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
            default: 24,
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
            keys: [],
            holdPedal: false
        };
    },
    created: function () {

        for(var i =0; i<this.nbKeys; ++i) {
            this.keys.push({
                velocity: 0,
                pushed: false
            });
        }

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
                    if(0 <= note && note < this.keys.length) {
                        this.keys[note].velocity = event.velocity;
                        this.keys[note].pushed = true;
                    }
                });
                this.midiInput.addListener('noteoff', 'all', (event) => {
                    var note = event.note.number - this.offsetKeys;
                    if(0 <= note && note < this.keys.length) {
                        if(!this.holdPedal) {
                            this.keys[note].velocity = 0;
                        }
                        this.keys[note].pushed = false;
                    }
                });
                this.midiInput.addListener('controlchange', 'all', (event) => {
                    // Hold pedal
                    if(event.controller.number == 64) {
                        if(event.value > 0) {
                            this.holdPedal = true;
                        } else {
                            this.holdPedal = false;
                            for(var i =0; i<this.nbKeys; ++i) {
                                if(!this.keys[i].pushed) {
                                    this.keys[i].velocity = 0;
                                }
                            }
                        }
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
