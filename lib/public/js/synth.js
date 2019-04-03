/*

0. Build audio synth class.
1. Data processing functions: Convert input data variables into audio variable values.

TODO: [] Add discrete mapping.

*/
/*
    {play: this.synth.}
*/

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
    "B":   [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07]
 };  // Taken from "47RedBaron": https://gist.github.com/i-Robi/8684800.

// Built into class now... "const scalingParams = {min: 51.91, max: 3322.44 };"


class MapSynth {
  /*
    Dual mappings - Discrete dictates that sounds trigger when movement is enough
    to the next closest frequency. Sounds are always chords. Continuous ramps
    frequency between start and end chords.


  */
  constructor(data) {
    var self = this;

    /*
      CLASS FUNCTIONS:
    */
    self.scale = scaling; // Object for linear, logarithmic scaling and "closest match" algorithm, stored in scaling.js.
    self.scale.min = 51.91, self.scale.max = 3322.44;

    self.build = function (oscType) {
      /*
      Self-contained build function is used to allow easier alteration of
        values later.

        @param { string } oscType - Contains the oscillator type for the synth.
      */

      return new Tone.Synth({
        oscillator: {
          type: oscType
        },
        envelope: {
          attack: 0.4,
          decay: 0.1,
          sustain: 0.3,
          release: 1.0
        }
      });
    }
    self.getSynths = function(numSynths, wavetable) {
      /*
        Returns an array of synth objects, pulled from .build().

        @param { integer } numSynths - length of returned array.
        @param { array } wavetable - list of oscillator types.
      */
      var synthArray = [];
      for ( var synthIndex = 0; synthIndex < numSynths; synthIndex++ ) {
        if ( wavetable[synthIndex] != null ) {
        synthArray.push(self.build(wavetable[synthIndex]));
        } else {
          synthArray.push(self.build('sine'));
        }
      }
      return synthArray;
    }

    self.play = async function(frequency, pan) {
      /*
        If there is no current playback, initate playback. Otherwise, ramp
        frequency and pan values to the input values.


      */
      console.log('Time now', self.context.now());
      var rampTime = self.context.now() + (self.interval/1000);
      console.log('Time:', rampTime);
      // Set pan values.
      self.dynamics.pan.pan.linearRampToValueAtTime(pan, rampTime);
      self.dynamics.pan.pan.setValueAtTime(pan, rampTime);

      if ( self.on == false ) { // If the synth is not currently triggered (down).
        console.log('DEBUG SYNTH: Starting synth');
        for ( var synthN = 0; synthN < self.synths.length; synthN++ ) {
          self.synths[synthN].frequency.value = frequency[synthN];
          self.synths[synthN].triggerAttack(frequency[synthN]);
          self.on = true;
        }
      } else {
        for ( var synthN = 0; synthN < self.synths.length; synthN++ ) {
          // Set synths to new frequency value over a ramp time (same as interval).
          if ( frequency[synthN] != null ) {
            self.synths[synthN].frequency.linearRampToValueAtTime(frequency[synthN],
               rampTime);
            self.synths[synthN].frequency.setValueAtTime(frequency[synthN],
               rampTime);
            console.log('Frequency now:', self.synths[synthN].frequency.value);
          }
        }
      }
      console.log('Frequencies: ', self.synths[0].frequency.value, self.synths[1].frequency.value, self.synths[2].frequency.value);
    }

    self.stop = async function() {
      for ( let synthIndex = 0; synthIndex < self.synths.length; synthIndex++ ) {
        self.synths[synthIndex].triggerRelease();
      }
      setTimeout(function() { self.dynamics.gain.value = 0.0; self.on = false; }, self.synths[0].envelope.release*1000);
    }

    this.start = self.start = async function() {
      var dataObject = self.data;

      function makeChord(scaledFreq, isLate) {
        console.log('Debug synth: ', scaledFreq);
        let rootKeys = Object.keys(noteDict); // Add note dict as global.
        for ( let rootIdx = 0; rootIdx < rootKeys.length; rootIdx ++ ) {
          // Itr through root notes.
          if (noteDict[rootKeys[rootIdx]].includes(scaledFreq)) {
            // If there is a match in the octaves of this root...
            var noteOct = noteDict[rootKeys[rootIdx]];
            var root = rootIdx;
            console.log('Debug synth:', `root is ${root} ${rootKeys[root]}`);
          }
        }
        var noteIdx = noteOct.indexOf(scaledFreq);

      /*

      Major chords are defined by a modifier of +4 (C -> E is four steps,
       etc... ), minor by +3, both chords share a fifth note of +7 from the root.
       If this makes no sense, look at the rootKeys print out OR look at the keys
       in the noteDict.

      */

      // Figure out whether the departure is late, then use this to choose  +3/+4
      var noteMod = isLate ? 3 : 4;
      let harmonicIdx = [ 0, ( root + noteMod ) % rootKeys.length,
         ( root + 7 ) % rootKeys.length ];

      /*  For each note in the chord check if the frequency is below the root,
       if it is, choose the next index in the list/arr.  */
      var harmonics = [];
      harmonicIdx.forEach(function(h) {
        console.log(h);
        console.log('Debug Synth:', noteDict[rootKeys[h]]);
        var noteRow = noteDict[rootKeys[h]];
        if ( noteRow[noteIdx] < scaledFreq ) {
          harmonics.push(noteRow[noteIdx + 1]);
        } else {
          harmonics.push(noteRow[noteIdx]);
        }
      });

      return harmonics;
    }

      /*

      If there is no started synth, start it. When a synth is started with a given
      input route, it will parse through the route until it is finished. When
      it is, it will cease to play and will garbage collect itself.

       */

       // Parse through route, scaling it to the correct values (closest) and
       // creating chords using it. Then play.

       /*console.log('DEBUG  SYNTH:', 'Testing synth... ');
       var testChord = await makeChord(440.00, false);
       self.synths[0].triggerAttackRelease(testChord[0], '4n');
       self.synths[1].triggerAttackRelease(testChord[1], '4n');
       self.synths[2].triggerAttackRelease(testChord[2], '4n');*/


       console.log('Debug Synth: Starting Interval', self.interval);
       var playIndex = 0;

       var playInterval = setInterval(async function() {
         var panValue = await self.scale.lin('x', dataObject.route[playIndex][1], -1.0, 1.0);
         var unscaledFrequency = await self.scale.log('y', dataObject.route[playIndex][0], self.scale.min, self.scale.max);
         // Scale to Hz value then map to fit the closest value (if wanting a chord.)
         if ( playIndex == 0 | playIndex == dataObject.route.length-1 ) {
           console.log('DEBUG SYNTH:', 'Making start and end chords.');
           var scaledFrequency = await self.scale.closest(unscaledFrequency, noteArray);
           // Start and end points.
           var chord = await makeChord(scaledFrequency, dataObject.late);
           self.play(chord, panValue);
         } else if ( playIndex == dataObject.route.length ) {
           console.log('DEBUG SYNTH:', 'Ending');
           self.stop();
           clearInterval(playInterval);
         } else {
           console.log('DEBUG SYNTH:', 'Playing!', unscaledFrequency);
           self.play(unscaledFrequency, panValue);
        }
        playIndex++;
       }, self.interval); // Run the play on an interval.
    }

    /*
      CLASS VARIABLES:
    */

    self.data = data;
    self.synths = self.getSynths(3, ['triangle', 'square', 'sine']);
    self.dynamics = {
      pan: new Tone.Panner(0.0),
      gain: new Tone.Gain(0.5)
    };
    self.on = false;
    self.context = new Tone.Context();
    // Set all intervals to this: e.g. 25 minutes => 150000ms => 75ms per interval.
    self.totalTime = ( ( self.data.duration * 60 ) * 10);
    self.interval = totalTime / self.data.route.length;

    for ( let s = 0; s < self.synths.length; s++ ) {
      self.synths[s].chain(self.dynamics.gain, self.dynamics.pan, Tone.Master);
    }

    console.log('Debug Synth: Class constructed');
    console.log(self);
    }
  }
