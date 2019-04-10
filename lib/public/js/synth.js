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

var sonificationType = "Continuous";

function changeSonificationType(select) {
  switch(select.value) {
    case "1":
      sonificationType = "Continuous";
      break;
    case "2":
      sonificationType = "Discrete";
      break;
    case "3":
      sonificationType = "Minimal";
      break;
  }
}

async function runSynth(data) {
  let _synth;
  switch(sonificationType) {
    case "Continuous":
      _synth = new ContinuousSynth(data);
      break;
    case "Discrete":
      _synth = new DiscreteSynth(data);
      break;
    case "Minimal":
      _synth = 0; // TODO: Add minimalSynth.
      break;
  }
}

function resumeContext(button) {
  button.disabled = true;
  Tone.context.resume();
  //var cs = new ContinuousSynth({route: [[150, 750], [250, 740], [350, 730], [400, 720], [450, 710], [500, 705], [450, 710], [400, 720], [350, 730], [250, 740], [150, 750],[150, 750], [250, 740], [350, 730], [400, 720], [450, 710], [500, 705], [450, 710], [400, 720], [350, 730], [250, 740], [150, 750]], duration: 10, late:true});
  //setTimeout(function() { var ds = new DiscreteSynth({route: [[150, 750], [250, 740], [350, 730], [400, 720], [450, 710], [500, 705], [450, 710], [400, 720], [350, 730], [250, 740], [150, 750],[150, 750], [250, 740], [350, 730], [400, 720], [450, 710], [500, 705], [450, 710], [400, 720], [350, 730], [250, 740], [150, 750]], duration: 10, late:false}); }, 6000)
  var poly = new Tone.PolySynth({
    polyphony: 3,
    volume: 0,
    detune: 0,
    voice: Tone.Synth
  });

  let oscTypes = ['sine', 'triangle', 'sine'];
  let oscIndex = 0;
  poly.voices.forEach(function(v) {
    v.oscillator.type = oscTypes[oscIndex];
    v.envelope.attack = 1;
    v.envelope.decay = 0.4;
    v.envelope.sustain = 0;
    v.envelope.release = 1;
    oscIndex++;
    console.log(v);
  });
  console.log(poly);
  //var reverb = new Tone.Reverb({decay: 0.5, preDelay: 0.01, wet: 1});
  var reverb = new Tone.JCReverb({roomSize: 0});
  var filter = new Tone.Filter({
    type: 'lowpass',
    frequency: 10000,
    rolloff: -12,
    'Q': 1,
    gain: -6
  });

  reverb.connect(Tone.Master);
  poly.chain(filter, reverb)
  //var gain = new Tone.Gain(0.8);
  //poly.connect(gain);
  //reverb.connect(gain).toMaster();
  //gain.connect(Tone.Master);
  reverb.roomSize.value = 0.2;
  poly.triggerAttackRelease(['C4', 'E4', 'G4'], '8n');
  setTimeout(function() {
    reverb.roomSize.value = 0.9;
    poly.triggerAttackRelease(['E4', 'A4', 'D4'], '8n');
  }, 3000);
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
    max: 593.6890498085388
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
    this.dynamics = {
      gain: new Tone.Gain(0.8),
      pan: new Tone.Panner(0)
    };

  }
}

class DiscreteSynth {
  constructor(data) {

  const noteDict = {
        "C": [16.35, 32.70, 65.41, 130.81, 261.63, 523.25, 1046.50, 2093.00, 4186.01],
       "Db":   [17.32, 34.65, 69.30, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92],
        "D":   [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32, 4698.64],
       "Eb":   [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02, 4978.03],
        "E":   [20.60, 41.20, 82.41, 164.81, 329.63, 659.26, 1318.51, 2637.02],
        "F":   [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83],
       "Gb":   [23.12, 46.25, 92.50, 185.00, 369.99, 739.99, 1479.98, 2959.96],
        "G":   [24.50, 49.00, 98.00, 196.00, 392.00, 783.99, 1567.98, 3135.96],
       "Ab":   [25.96, 51.91, 103.83, 207.65, 415.30, 830.61, 1661.22, 3322.44],
        "A":   [27.50, 55.00, 110.00, 220.00, 440.00, 880.00, 1760.00, 3520.00],
       "Bb":   [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
        "B":   [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07]};

    var self = new Synth(data); // Swap 'this' variable for 'self' contains the original Synth class object.

                                                        /* Audio Components */

    self.roots = ['C', "C#", 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    self.setup = function() {
      self.synth = new Tone.PolySynth({
        polyphony: 3,
        volume: 0,
        detune: 0,
        voice: Tone.Synth
      });

      var _vindex = 0;
      const voiceList = ['sawtooth', 'sine', 'square'];
      self.synth.voices.forEach(function(voice) {
        if ( _vindex == 0 ) if (self.data.late) { voice.volume.value = -6; } else { voice.volume.value = -12; }
        if ( _vindex == 1 ) voice.volume.value = -6;
        if (_vindex == 2 ) voice.volume.value = -12; // Reduce volume of triangle due to harshness at high frequencies.
        voice.envelope.attack = (self.interval/1000)/3;
        voice.envelope.decay = 0.4;
        voice.envelope.sustain = 0;
        voice.envelope.release = (self.interval/1000);
        voice.oscillator.type = voiceList[_vindex];
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

    self.play = function(x, chord) {
      let panValue = self.scale.lin(x, _bounds.x.min, _bounds.x.max, -1.0, 1.0);
      console.log(_bounds.x.max, x);
      self.change(panValue, self.interval/1000);
      self.synth.triggerAttackRelease(chord);
    };

    self.start = function() {
      let data = self.data;
      var runIndex = 0;
      self.lastPlayed = 0;
      console.log(self.interval);
      var runInterval = setInterval(function() {
        if ( runIndex >= data.route.length ) {
          clearInterval(runInterval);
          self.synth.triggerRelease(self.interval/1000);
          return;
        }

        let scaledFrequency = self.scale.log(data.route[runIndex][1], _bounds.y.min, _bounds.y.max, 16.35, 3322.44);
        let toneF = Tone.Frequency(scaledFrequency).toNote();
        let frequency = self.scale.closest(noteArray, scaledFrequency);
        if ( self.lastPlayed != frequency ) {
          let chord = self.chord(frequency);
          console.log('Playing:', chord);
          self.play(data.route[runIndex][0], chord);
          self.lastPlayed = frequency;
        }
        runIndex++;
      }, self.interval);
    }

                                                          /* Test functions */
    self.setup();
    self.connect();
    self.dynamics.gain.gain.value = 0.5;
    self.start();
  }
}

class ContinuousSynth {
   constructor(data) {
     var self = new Synth(data);

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
             'Q': 6,
             gain: 0
            });

     self.connect = function() {
        self.synths[0].chain(self.dynamics.gain, self.dynamics.pan, Tone.Master);
        self.synths[1].chain(self.dynamics.filter, self.synths[1].gain, self.dynamics.pan, Tone.Master);
     };

     self.synths = self.build();
     self.synths[1].gain = new Tone.Gain(1.0);
     self.connect();
     self.context = new Tone.Context();
     self.synths = {
       synth: self.synths[0],
       noise: self.synths[1]
     };
                                                /* Synth-related components */
     self.synths.synth.on = false;

     self.synths.synth.change = function(value, rampTime) {
       self.synths.synth.frequency.exponentialRampToValueAtTime(value, self.context.currentTime + rampTime+0.01);
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
       console.log('Noise frequency:', value, rampTime, self.context.currentTime, self.context.currentTime + rampTime+0.01);
       self.dynamics.filter.frequency.exponentialRampToValueAtTime(value, self.context.currentTime + rampTime+0.01);
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

     self.play = function(x, y, gain) {
       // Get scaled frequencies.
       var frequencies = [];
       var args = [x, y];
       args.forEach(function(coord) {
         let scaledFrequency = (coord != args[0]) ?
         self.scale.log(coord, _bounds.y.min, _bounds.y.max, 16.35, 4978.03)
         : self.scale.log(coord, _bounds.x.min, _bounds.x.max, 4978.03, 16.35);
         frequencies.push(self.scale.closest(noteArray, scaledFrequency));
       });

       self.synths.synth.play(frequencies[1], self.interval/1000);
       self.synths.noise.play(frequencies[0], self.interval/1000);
       self.dynamics.gain.gain.setValueAtTime(gain, self.interval/1000);
     }

                                                  /* Directional Panning: */
     self.pan = 0;

     self.change.pan = function(xDifference, rampTime) {
       var scaledPan = self.scale.lin(Math.abs(xDifference), 0, (_bounds.x.max - _bounds.x.min), 0.0, 10) % 1;
       console.log('Pan diff', scaledPan);
       let panValue = (xDifference < 0) ? scaledPan*-1 : scaledPan;

       console.log('DEBUG SYNTH:', panValue, self.dynamics.pan.pan.value, self.pan);
       self.pan = ( self.pan + panValue);
       if ( self.pan > 1.0 ) {
         self.pan = 1.0;
       } else if ( self.pan < -1.0 ) {
         self.pan = -1.0;
       }
       console.log('DEBUG SYNTH:', self.pan);
       if (self.pan != undefined) self.dynamics.pan.pan.setValueAtTime(self.pan, rampTime);

     }

                                                      /* Runtime Functions */
     this.start = self.start = function() {
       let coordinateArray = self.data.route;
       var intervalPeriod = (self.interval/1000); // Formatted into seconds (to work with WAApi).
       var runIndex = 0;
       var synths = [self.synths.synth, self.synths.noise];
       var runInterval = setInterval(function() {
         console.log(runIndex, coordinateArray.length);
         if ( runIndex >= coordinateArray.length ) {
           // Stop.
           clearInterval(runInterval);
           synths.forEach(function(s) {
             s.stop();
           });
           return;
         } else {
           // Run.
           var gainValue = self.scale.lin(runIndex, 0, coordinateArray.length-1, 1.0, 0.0);
           if ( runIndex > 0 && runIndex < coordinateArray.length ) {
             let diff = (coordinateArray[runIndex][0] - coordinateArray[runIndex-1][0]);
             console.log(diff);
             if ( diff != undefined ) { self.change.pan(diff, self.interval/1000); }
             else { self.change.pan(self.pan, self.interval/1000 ); }
           } else {

           }
           self.play(coordinateArray[runIndex][0], coordinateArray[runIndex][1], gainValue);
         }
         runIndex++;
       }, self.interval);
     }

       /* Test functions */
     self.dynamics.filter.frequency.value = 1;
     self.pan = self.dynamics.pan.pan.value;
     self.start();
   }
}

class MinimalSynth {
  constructor(data) {
    var self = new Synth(data);

    self.build = function() {

    }
  }
}
