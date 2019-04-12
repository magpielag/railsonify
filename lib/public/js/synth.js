/*

Two classes for each mode: Discrete and Continuous controlled by the in-page toggle.
If the toggle is set to Discrete (d), the class will be a three synth output
(triangle, square -3dB, sine -6dB) of discrete chords.
Continuous (c) contains a single synth node (triangle) and a noise node, the latter connected
to a dynamic bandpass filter (Q: 8, -12dB slope).

Class inheritance through 'self' variable:
E.G.
                class Name {
                	constructor(name) {
                		this.name = name;
                    var self = this;
                	}
                }

                class Surname {
                	constructor(name) {
                  	this.self = new Name(name);
                  }
                }

*/


async function runInterval(canvasObject, dataObject) {
  // Initalise synth object.
  var synth = await runSynth(dataObject)
      context = canvasObject.context
      intervalIndex = 0;

  function stroke(index) {
    if ( dataObject.route[index] != undefined ) {
      if ( index == 0 ) {
        context.beginPath();
        context.moveTo(dataObject.route[index][0], dataObject.route[index][1]);
      } else {
        context.beginPath();
        context.moveTo(dataObject.route[index-1][0], dataObject.route[index][1]);
      }
      context.lineTo(dataObject.route[index][0], dataObject.route[index][1]);
      context.closePath();
      context.stroke();
    }
  }

  const interval = setInterval(function() {
    let coord = dataObject.route[intervalIndex];
    console.log(intervalIndex, dataObject.route.length, intervalIndex >= dataObject.route.length);
    if ( intervalIndex >= dataObject.route.length) {
      synth.stop();
      canvasObject.context.closePath();
      canvasObject.canvas.setAttribute('class', "canvas"); // Set back to being normal.
      clearInterval(interval);
      return;
    }
    if (!Array.isArray(dataObject.route[intervalIndex])) {
      dataObject.route.pop();
      canvasObject.canvas.closePath();
      return; // Error with input data, cancel.
    } else {
    stroke(intervalIndex);
    synth.play(coord);
    }
    intervalIndex++;
  }, synth.interval);
};


var sonificationType = "Minimal"; // Default synth is the minimalSynth

function changeSonificationType(select) {
  switch(select.value) {
    case "1":
      sonificationType = "Minimal";
      break;
    case "2":
      sonificationType = "Discrete";
      break;
    case "3":
      sonificationType = "Continuous";
      break;
  }
}

async function runSynth(data) {
  let _synth;
  console.log(`Starting ${sonificationType} synth`);
  switch(sonificationType) {
    case "Continuous":
      _synth = new ContinuousSynth(data);
      break;
    case "Discrete":
      _synth = new DiscreteSynth(data);
      break;
    case "Minimal":
      _synth = new MinimalSynth(data); // TODO: Add minimalSynth.
      break;
  }
  return _synth;
}

function resumeContext(button) {
  button.disabled = true;
  Tone.context.resume();
  //console.log(sonificationType);
  alert('If you are using Chrome, you may now use the application!');
}

const noteArray = [16.35, 32.70, 65.41, 130.81, 261.63, 523.25, 1046.50, 2093.00, 4186.01,
  17.32, 34.65, 69.30, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92,
  18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32, 4698.64,
  19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02, 4978.03,
  20.60, 41.20, 82.41, 164.81, 329.63, 659.26, 1318.51, 2637.02,
  21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83,
  23.12, 46.25, 92.50, 185.00, 369.99, 739.99, 1479.98, 2959.96,
  24.50, 49.00, 98.00, 196.00, 392.00, 783.99, 1567.98, 3135.96,
  25.96, 51.91, 103.83, 207.65, 415.30, 830.61, 1661.22, 3322.44,
  27.50, 55.00, 110.00, 220.00, 440.00, 880.00, 1760.00, 3520.00,
  29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31,
  30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07];

const _bounds = {
  y: {
    min: 54.07818790440755,
    max: 974.092597422507
  },
  x: {
    min: 149.4291543320836,
    max: 975.2637876430726
  }
}

class Synth {
  constructor(data) {
    this.scale = {
      log: function(valueToScale, oScaleMin, oScaleMax, nScaleMin, nScaleMax) {
        let _scale = (Math.log(nScaleMax) - Math.log(nScaleMin)) / (oScaleMax - oScaleMin);
        return Math.exp(Math.log(nScaleMin) + _scale * (valueToScale - oScaleMin));
      },
      lin: function(valueToScale, oScaleMin, oScaleMax, nScaleMin, nScaleMax) {
        return (nScaleMax - nScaleMin) * (valueToScale - oScaleMin) / (oScaleMax - oScaleMin) + nScaleMin;
      },
      closest: function(arr, value) {
        return arr.reduce(function (prev, curr) {
          return (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev)
        });
      }
    };
    this.scale.min = 51.91, this.scale.max = 3322.44; // Minimum and maximum frequency range.
    this.change = {
      pan: function(panValue, rampTime) {
        self.dynamics.pan.pan.linearRampToValueAtTime(panValue, rampTime);
      },
      gain: function(gainValue, rampTime) {
        self.dynamics.gain.gain.linearRampToValueAtTime(gainValue, rampTime-0.05);
      }
    };
    this.data = data;
    this.on = false;
    self.late = data.late;
    this.totalTime = ( ( this.data.duration * 60 ) * 10);
    this.interval = this.totalTime / this.data.route.length;
    console.log('Interval is:', this.interval);
    this.dynamics = {
      gain: new Tone.Gain(0.8),
      pan: new Tone.Panner(0)
    };

  }
}

class DiscreteSynth {
  constructor(data) {
    var self = new Synth(data); // Swap 'this' variable for 'self' contains the original Synth class object.

                                                        /* Audio Components */
    self.interval = self.interval / 4;
    self.roots = ['C', "C#", 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    self.setup = function() {
      self.synth = new Tone.PolySynth({
        polyphony: 3,
        volume: 0,
        detune: 0,
        voice: Tone.Synth
      });

      var _vindex = 0;
      self.synth.voices.forEach(function(voice) {
        if ( _vindex == 0 ) voice.volume.value = self.voiceSettings.volume[0];
        if ( _vindex == 1 ) voice.volume.value = self.voiceSettings.volume[1];
        if (_vindex == 2 ) voice.volume.value = self.voiceSettings.volume[2]; // Reduce volume of triangle due to harshness at high frequencies.
        voice.envelope.attack = (self.interval/1000)/3;
        voice.envelope.decay = 0.4;
        voice.envelope.sustain = 0;
        voice.envelope.release = self.interval/1000;
        voice.oscillator.type = self.voiceSettings.osc[_vindex];
        _vindex++;
        console.log(voice.volume.value);
      });
    };

    self.connect = function() {
      self.synth.chain(self.dynamics.gain, self.dynamics.pan, Tone.Master);
    };

    self.chord = function(frequency) {
      /* Chords are created by taking a root note and finding the corresponding
        harmonics (additional notes). For on-time departures, this generates a
        major chord (0, 4, 7). For late departures, this generates a minor chord
        (0, 3, 7).
      */


      let note = Tone.Frequency(frequency).toNote();
      let octave = note.slice(note.indexOf(parseInt(note, 10).toString()));
      let root = note.slice(0, note.indexOf(octave));
      let modifier = (self.data.late) ? [3, 7] : [4, 7];
      console.log(modifier);
      var newNotes = [];
      modifier.forEach(function(mod) {
        let octaveIndex = self.roots.indexOf(root) + mod;
        if ( octaveIndex >= self.roots.length ) {
          var newOctave = self.roots[octaveIndex % self.roots.length];
          var octaveMod = 1;
        } else {
          var newOctave = self.roots[octaveIndex];
          var octaveMod = 0;
        }
        console.log(newOctave, octave, octaveMod);
        newNotes.push(`${newOctave}${parseInt(octave)+parseInt(octaveMod)}`);
      });

      return [note, newNotes[0], newNotes[1]];
    };

    self.change = function(panValue, rampTime) {
      if ( panValue != undefined ) self.dynamics.pan.pan.setValueAtTime(panValue, rampTime);
    };

    this.play = self.play = function(coord) {
      self.synth.triggerRelease(0);
      if ( coord[0] != undefined & coord[1] != undefined) {
        let freqValue =  self.scale.log(coord[1], _bounds.y.min, _bounds.y.max, 16.35, 4434.92);
        let frequency =  self.scale.closest(noteArray, freqValue);
        let panValue =  self.scale.lin(coord[0], _bounds.x.min, _bounds.x.max, -1.0, 1.0);
        self.change(panValue, self.interval/1000);
        if ( self.lastPlayed != frequency ) {
          let chord =  self.chord(frequency);
          self.synth.triggerAttack(chord);
          self.lastPlayed = frequency;
        } else {
          self.change(panValue, self.interval/1000);
        }
      }
    };

    self.setVoices = function() {
      let canvasElements = [...document.getElementsByClassName("drawCanvas")];
       if ( canvasElements.length < 2 ) {
         var voices = ['sawtooth', 'sine', 'square'];
         var voiceVol = [0, -3, -6];
       } else if ( canvasElements.length == 2 ) {
         var voices = ['triangle', 'square', 'sine'];
         var voiceVol = [-3, -6, -9];
       } else {
         var voices = ['sine', 'sine', 'sawtooth'];
         var voiceVol = [-9, -12, -16];
       }
       return [voices, voiceVol];
     }

     this.stop = self.stop = function() {
       self.synth.triggerRelease(self.interval/1000);
     }
                                                          /* Test functions */
    this.interval = self.interval;
    self.voiceSettings = {osc: self.setVoices()[0], volume: self.setVoices()[1]};
    self.setup();
    self.connect();
    self.dynamics.gain.gain.value = 0.5;
    self.lastPlayed = 0;
  }
}

class ContinuousSynth {
   constructor(data) {
     var self = new Synth(data);
     self.interval = self.interval/2;

                                                    /* Audio Components */
     self.build = function() {
       var synthList = [];

      synthList.push(
        new Tone.Synth({
              oscillator: {
                type: 'triangle'
              },
              envelope: {
                attack: (self.interval/1000)/2,
                decay: 0.4,
                sustain: 0.2,
                release: self.interval/1000
                },
              volume: -12
            }));

      synthList.push(
        new Tone.NoiseSynth({
          noise: {
            type: 'white'
          },
          envelope: {
            attack: 0.2,
            decay: 0.2,
            sustain: 0.3,
            release: 1.0
          }
        }));

        return synthList;
     };

     self.dynamics.filter = new Tone.Filter(
            {
             type: 'bandpass',
             frequency: 0,
             rolloff: -96,
             'Q': (self.data.late) ? 2 : 6,
             gain: 4
            });
                                                /* Synth-related components */
     self.synths = self.build();
     self.context = new Tone.Context();
     self.synths = {
             synth: self.synths[0],
             noise: self.synths[1] };

     self.synths.synth.on = false;

     self.synths.synth.change = function(value, rampTime) {
       console.log('Changing to', value);
       self.synths.synth.frequency.exponentialRampToValueAtTime(value, self.context.currentTime + rampTime);
     }

     self.synths.synth.play = function(note, ramp) {
       self.synths.synth.on ?
       self.synths.synth.change(note, ramp) : self.synths.synth.triggerAttack(note)
       if ( self.synths.synth.on == false ) self.synths.synth.on = true;
     };

     self.synths.synth.stop = function() {
       self.synths.synth.triggerRelease(self.interval/1000);
       self.synths.synth.on = false;
     };

                                              /* Noise-related components */
     self.synths.noise.on = false;

     self.synths.noise.change = function(value, rampTime) {
       console.log('Noise frequency:', value, rampTime, self.context.currentTime, self.context.currentTime + rampTime);
       self.dynamics.filter.frequency.exponentialRampToValueAtTime(value, self.context.currentTime + rampTime);
     };

     self.synths.noise.play = function(note, ramp) {
       self.synths.noise.change(note, ramp);
       if ( !self.synths.noise.on ) {
         self.synths.noise.triggerAttack();
         self.synths.noise.on = true;
       }
     }

     self.synths.noise.stop = function() {
       self.synths.noise.triggerRelease(self.interval/1000);
       self.synths.noise.on = false;
     }

     this.play = self.play = function(coord) {
       if (coord == undefined | isNaN(coord[0]) ) {
         self.stop();
         if ( interval != undefined) { clearInterval(interval);
         } else { return; }
       } else {
         var x = coord[0];
         var y = coord[1];
         let gainValue = self.scale.lin(intervalIndex, 0, self.data.route.length-1, 1.0, 0.0);
         let panValue = self.scale.lin(coord[0], _bounds.x.min, _bounds.x.max, -1.0, 1.0);
         var pan = self.dynamics.pan.pan.value + panValue;
         if ( pan < -1 ) { pan = -1;
         } else if ( pan > 1 ) { pan = 1; }
         self.change.pan(pan);
         var frequencies = [];

         [x, y].forEach(function(c) {
           let scaledFrequency = (c != coord[0]) ?
           self.scale.log(c, _bounds.y.min, _bounds.y.max, 16.35, 4978.03)
           : self.scale.log(c, _bounds.x.min, _bounds.x.max, 4978.03, 16.35);
           frequencies.push(self.scale.closest(noteArray, scaledFrequency));
         });

         self.synths.noise.triggerAttack();
         if ( self.synths.noise.on) {
           self.dynamics.filter.frequency.exponentialRampToValueAtTime(frequencies[0], self.context.currentTime + (self.interval/1000));
         } else {
           self.dynamics.filter.frequency.value = frequencies[0];
         }

         if (self.synths.synth.on) {
           self.synths.synth.frequency.exponentialRampToValueAtTime(frequencies[1], self.context.currentTime + (self.interval/1000));
         } else {
           self.synths.synth.frequency.value = frequencies[1];
         }

         if (!self.on) {
           self.synths.synth.triggerAttack(self.synths.synth.frequency.value);
           self.synths.noise.triggerAttack();
           self.synths.synth.on = true;
           self.synths.noise.on = true;
           self.on = true;
         }

         self.dynamics.gain.gain.setValueAtTime(gainValue, self.interval/1000);
      }
    }

                                                  /* Directional Panning: */

     self.change.pan = function(p) {
       console.log(p, self.context.currentTime+self.interval/1000);
       if (p != undefined) self.dynamics.pan.pan.setValueAtTime(p, self.context.currentTime + (self.interval/1000));
     }

                                                      /* Runtime Functions */


      self.connect = function() {
        self.synths.synth.chain(self.dynamics.gain, self.dynamics.pan, Tone.Master);
        self.synths.noise.chain(self.dynamics.filter, self.dynamics.gain, self.dynamics.pan, Tone.Master);
        };

    this.stop = self.stop = function() {
      self.synths.synth.stop();
      self.synths.noise.stop();
      self.on = false;
    }

       /* Test functions */
     this.interval = self.interval;
     self.dynamics.filter.frequency.value = 1;
     self.pan = self.dynamics.pan.pan.value;
     self.connect();
   }
}

class MinimalSynth {
  constructor(data) {
    var self = new Synth(data);

    self.build = function() {
      let oscIndex = 0;
      let oscTypes = ['sine', 'triangle', 'sine'];
      let synth = new Tone.PolySynth({
        polyphony: 3,
        volume: -6,
        detune: 0,
        voice: Tone.Synth
      });

      synth.voices.forEach(function(voice) {
        voice.oscillator.type = oscTypes[oscIndex];
        voice.volume.value = 0-((oscIndex+1)*4);
        voice.envelope.attack = 0.5;
        voice.envelope.decay = 0.5;
        voice.envelope.sustain = 0;
        voice.envelope.release = 1.5;
        oscIndex++;
        console.log(voice.volume.value);
      });

      return synth;
    }

    self.connect = function() {
      self.pan = new Tone.Panner(0);
      self.reverb = new Tone.JCReverb({
        roomSize: 0,
        wet: 1
      });
      self.filter = new Tone.Filter({
        type: 'lowpass',
        frequency: 6000,
        rolloff: -96,
        'Q': 1,
        gain: -12
      });

      self.pan.connect(Tone.Master);
      self.synth.chain(self.filter, self.reverb, self.pan);
    };

    self.chord = function(frequency) {
      /* Chords are created by taking a root note and finding the corresponding
        harmonics (additional notes). For on-time departures, this generates a
        major chord (0, 4, 7). For late departures, this generates a minor chord
        (0, 3, 7).
      */

      self.roots = ['C', "C#", 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      let note = Tone.Frequency(frequency).toNote();
      let octave = note.slice(note.indexOf(parseInt(note, 10).toString()));
      let root = note.slice(0, note.indexOf(octave));
      let modifier = (self.data.late) ? [3, 7] : [4, 7];
      var newNotes = [];
      modifier.forEach(function(mod) {
        let octaveIndex = self.roots.indexOf(root) + mod;
        if ( octaveIndex >= self.roots.length ) {
          var newOctave = self.roots[octaveIndex % self.roots.length];
          var octaveMod = 1;
        } else {
          var newOctave = self.roots[octaveIndex];
          var octaveMod = 0;
        }
        console.log(newOctave, octave, octaveMod);
        newNotes.push(`${newOctave}${parseInt(octave)+parseInt(octaveMod)}`);
      });

      return [note, newNotes[0], newNotes[1]];
    };

    this.play = self.play = function(coord) {
      if ( intervalIndex == 0) {
        console.log( (self.interval * self.data.route.length));
        var panValue = self.scale.lin(coord[0], _bounds.x.min, _bounds.x.max, -1.0, 1.0);
        self.pan.pan.value = panValue;
        let scaledFrequency = self.scale.log(coord[1], _bounds.y.min, _bounds.y.max, 16.35, 3322.44);
        let frequency = self.scale.closest(noteArray, scaledFrequency);
        var chord = self.chord(frequency);

        self.synth.triggerAttackRelease(chord);
        setTimeout(function() {
          let coord = self.data.route[self.data.route.length-1];
          var panValue = self.scale.lin(coord[0], _bounds.x.min, _bounds.x.max, -1.0, 1.0);
          self.pan.pan.value = panValue;
          let scaledFrequency = self.scale.log(coord[1], _bounds.y.min, _bounds.y.max, 16.35, 3322.44);
          let frequency = self.scale.closest(noteArray, scaledFrequency);
          var chord = self.chord(frequency);
          let x = [self.data.route[0][0], self.data.route[self.data.route.length-1][0]];
          let y = [self.data.route[0][1], self.data.route[self.data.route.length-1][1]];
          let difference = Math.abs(x[0] - x[1] + y[0] - y[1]);
          let reverbValue = Math.round(self.scale.lin(difference, 0, (_bounds.x.max - _bounds.x.min) + (_bounds.y.max - _bounds.y.min), 0.0, 1.2) * 10) / 10;
          self.reverb.roomSize.setValueAtTime(reverbValue, self.synth.voices[2].envelope.release);
          self.synth.triggerAttackRelease(chord);
        }, (self.interval * self.data.route.length) - (self.interval*2) );
      }
    };

  this.stop = function() {

  }
    /* Main */
    this.interval = self.interval;
    self.synth = self.build();
    self.connect();
  }
}
