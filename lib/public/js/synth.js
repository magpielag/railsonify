/*

0. Build audio synth class.
1. Data processing functions: Convert input data variables into audio variable values.

TODO: Rewrite mapsynth, three synths rather than one poly, easier to handle.

*/
/*
    {play: this.synth.}
*/

class MapSynth {
  constructor() {
    var self = this;

    /*
      CLASS FUNCTIONS:
    */
    self.build = function () {

      return new Tone.Synth({
        oscillator: {
          type: 'sine'
        },
        envelope: {
          attack: 0.4,
          decay: 0.1,
          sustain: 0.3,
          release: 1.0
        }
      });
    }
    self.getSynths = function(numSynths) {
      var synthArray = [];
      for ( var synthIndex = 0; synthIndex < numSynths; synthIndex++ ) {
        synthArray.push(self.build());
      }
      return synthArray;
    }

    self.play = async function(frequency, pan, ramp) {
      /*
        If there is no current playback, initate playback. Otherwise, ramp
        frequency and pan values to the input values.
      */
      if ( !self.on ) {
        for ( var synthN = 0; synthN < self.synths.length; synthN++ ) {
          self.synths[synthN].triggerAttack(frequency[synthN]);
        }
      } else {
        for ( var synthN = 0; synthN < self.synths.length; synthN++ ) {
          if ( frequency[synthN] != null ) {
            var targTime = self.context.now() + ramp;
            self.synths[synthN].frequency.linearRampToValueAtTime(frequency[synthN],
               targTime);
            self.synths[synthN].frequency.setValueAtTime(frequency[synthN],
               targTime);
            self.dynamics.pan.linearRampToValueAtTime(pan, targTime);
          }
        }
      }

      /*
        CLASS VARIABLES:
      */
      self.synths = getSynths(3);
      self.dynamics = {
        pan: new Tone.Panner(0.5),
        gain: new Tone.Gain(0.5)
      };
      self.on = false;

    }
  }
}




/* */

const frequencies = [16.35, 32.70, 65.41, 130.81, 261.63, 523.25, 1046.50, 2093.00, 4186.01,
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

const notes = {
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
    "B":   [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07]
 } // Taken from "47RedBaron": https://gist.github.com/i-Robi/8684800.


const chords = {
  'Major': [0, 2, 4], 'Minor': [0, 1.5, 4], 'Suspended': [0, 3, 4],
  'FlatFifth': [0, 2, 3.5], 'Diminished': [0, 1.5, 3.5]
}

const scalingParams = {min: 51.91, max: 3322.44 }

class MapSynth {
  constructor(data) {
    /*
      data = { route: [...], late: bool, duration: int }
    */
      this.late = data.late;
      this.route = data.route;
      this.duration = data.duration;
      this.scaleTools = scaling;
      console.log(this.late, this.route, this.duration);

      /* AUDIO COMPONENTS: */
      this.context = Tone.context;
      this.voice = Tone.Synth;
      //this.buildSynth();
      this.synth = new Tone.PolySynth(3, this.voice);
      this.dynamics = {
        gain: new Tone.Gain(0.9),
        pan: new Tone.Panner(0)
      };
      // Connect dynamics and synth.
      this.synth.chain(this.dynamics.gain, this.dynamics.pan, Tone.Master);

      this.run = async function() {
        function makeChord(freqVal) {
          freqVal = scale.closest(freqVal, frequencies); // Find closest matching value in frequency array.
          var rootNoteKeys = Object.keys(notes), rootIndex, noteIndex;

        }
      }
      /* DATA COMPONENTS */
      var self = this;
  }

  buildSynth() {
    return new Tone.Synth({
      oscillator: { type: 'sine' },
     envelope: {
       attack: 0.3,
       decay: 0.1,
       sustain: 0.3,
       release: 1
     }
    });
  }

  play() {
    function makeNote(fv) {
      // Find the root of the note: (e.g. C, B, D, etc... ).
      var fv = scale.closest(fv, frequencies);
      var rootKeys = Object.keys(notes);
      var rootIdx, noteIdx;
      console.log('DS:', fv);
      for ( var r = 0; r < rootKeys.length; r++ ) {
        console.log('DS: ', notes[rootKeys[r]].includes(fv));

        if ( notes[rootKeys[r]].includes(fv) ) {
          rootIdx = r;
          var row = notes[rootKeys[r]];
          console.log('DS:', row);
          for ( var _r = 0; _r < row.length; _r++ ) {
            if ( fv == row[_r] ) {
              noteIdx = _r;
            }
          }
        }
      }

      if ( !isLate ) {
        var thirdMod = 4;
      } else {
        var thirdMod = 3;
      }

      var harmonicIdx = [ (rootIdx + thirdMod) % rootKeys.length,
        (rootIdx + 7) % rootKeys.length];
      var harmonics = [];

      for ( p = 0; p < harmonicIdx.length; p++ ) {
        console.log('TEST HARMONICS: ', p, noteIdx);
        console.log()
        console.log('TEST HARMONICS: ', p, noteIdx, rootKeys[harmonicIdx[p]]);
        var noteArray = notes[rootKeys[harmonicIdx[p]]];
        if ( notes[rootKeys[harmonicIdx[p]]][noteIdx] < fv ) {
          harmonics.push(noteArray[noteIdx+1]);
        } else {
          harmonics.push(noteArray[noteIdx]);
        }
      }

      return [ fv, harmonics[0], harmonics[1]];
    }


    // If late, adjust attack to be longer and set pitch to be more disonant.
    var isLate = this.late;
    var routeDuration = this.duration;
    var routeArray = this.route;
    var scale = this.scaleTools;
    var context = this.context;

    // Scale first and last route values into chords.
    var xn = routeArray[0][0];
    var yn = routeArray[0][1];
    console.log('DEBUG SYNTH:', scaling.lin('x', xn, 0.1, 1.1), scaling.log('y', yn, scalingParams.min, scalingParams.max));

    var panNode = this.dynamics.pan;
    var gainNode = this.dynamics.gain;
    var frequencyValue = function(y) { return scale.log('y', y, scalingParams.min, scalingParams.max); }
    var panValue = function(x) { return scale.lin('x', x, -1.0, 1.0); }

    //TODO: CONTINUE - Find pixel bounds.
    var f = frequencyValue(yn);
    var startChord = makeNote(f);
    f = frequencyValue(routeArray[routeArray.length-1][1]);
    var endChord =  makeNote(f);
    routeArray.pop();
    routeArray.shift(); // Slice off first and last values.
    var routeIndex = 0;
    // Move through the array ramping to new pan and freq values.
    var p = panValue(xn);
    console.log('DEBUG SYNTH:', p);
    this.dynamics.pan.pan.value = p;
    console.log('DEBUG SYNTH:', startChord, endChord);
    var s = this.synth;
    s.triggerAttack(startChord);
    var voices = s.voices;
    console.log('DEBUG SYNTH:', voices[0].frequency.value);
    console.log('DT: ', routeDuration / routeArray.length);

    var playInterval = setInterval(async function() {
      if ( routeIndex >= routeArray.length ) {
        s.triggerAttackRelease(endChord, '8n');
        gainNode.gain.value = 0;
        clearInterval(playInterval);
        console.log('RELEASE');
        return;
        //s.triggerAttackRelease(endChord, '8n');
      } else {
        console.log('DEBUG PLAY:', routeIndex);
        xn = await routeArray[routeIndex][0], yn = await routeArray[routeIndex][1];
        var voiceIdx = 0;
        var voiceFrequency = await frequencyValue(yn);
        var vf = scale.closest(voiceFrequency, frequencies);

        var rampTime = await context.now() + (routeDuration / (routeArray.length-1));
        console.log('DEBUG SYNTH:', rampTime, vf);
        // TODO: Write 'rampTo' function.
        var pv = panValue(xn);
        panNode.pan.linearRampToValueAtTime(pv, context.now() + rampTime);
        panNode.pan.setValueAtTime(pv, context.now() + rampTime + 0.01);
        for ( voiceIdx = 0; voiceIdx < voices.length; voiceIdx++ ) {
          console.log('DV: ', voices[voiceIdx].frequency.value);
          if ( voiceIdx != 0 ) {
            if ( voiceIdx == 2 ) {
              var freqMod = 1.25;
            } else { var freqMod = 1.2; }
          } else { var freqMod = 1; }

          console.log('DV: ', vf*freqMod);
          voices[voiceIdx].frequency.linearRampToValueAtTime(vf*freqMod, context.now() + rampTime);
          voices[voiceIdx].frequency.setValueAtTime(vf*freqMod, context.now() + rampTime + 0.01);
          voices[voiceIdx].frequency.value = vf*freqMod;
        }
        routeIndex++;
      }
    }, routeDuration / routeArray.length-1 );
  }
}
