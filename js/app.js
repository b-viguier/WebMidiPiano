Object.defineProperty(Vue.prototype, 'WebMidi', { value: WebMidi });

var app = new Vue({
    el: '#app',
    props: {
    },
    data:  {
        nbKeys: 61,
        offsetKeys: 24,
        transpose: 0,
        uniformKeys: false,
        errorMessage: null,
        selectedMidiInputId: null,
        midiInput: null,
        keys: [],
        holdPedal: false
    },
    created: function () {

        this.initKeyboard();

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
                    var note = event.note.number - this.offsetKeys + this.transpose;
                    if(0 <= note && note < this.keys.length) {
                        this.keys[note].velocity = event.velocity;
                        this.keys[note].pushed = true;
                    }
                });
                this.midiInput.addListener('noteoff', 'all', (event) => {
                    var note = event.note.number - this.offsetKeys + this.transpose;
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
                            for(var i =0; i<this.keys.length; ++i) {
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
        initKeyboard() {

            var keys = [];
            for(var i = 0; i<this.nbKeys; ++i) {
                keys.push({
                    velocity: 0,
                    pushed: false
                });
            }

            this.keys = keys;
        },

        isBlackKey(key) {
            if(this.uniformKeys) {
                return false;
            }
            key = (this.offsetKeys + key) % 12;
            return (key < 5) == (key % 2);
        },

        velocityCss(velocity) {
            return velocity > 0 ? {
                background: `linear-gradient(-25deg, rgba(168,14,14,${velocity}), rgba(245,34,34,${velocity}), rgba(191,32,32,${velocity}))`
            } : {};
        }
    }
});
