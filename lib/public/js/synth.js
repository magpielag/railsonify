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

var route = [[-3.18825,55.95265],[-3.18913,55.95252],[-3.18927,55.9525],[-3.19091,55.95223],[-3.1913,55.95215],[-3.19168,55.95204],[-3.19203,55.95195],[-3.19253,55.95179],[-3.19291,55.95167],[-3.19347,55.9515],[-3.19417,55.95129],[-3.19428,55.95125],[-3.19445,55.95121],[-3.19471,55.95114],[-3.19491,55.9511],[-3.19665,55.9508],[-3.19716,55.95071],[-3.19764,55.95062],[-3.19815,55.95053],[-3.19856,55.95045],[-3.20017,55.95016],[-3.2005,55.95011],[-3.20117,55.94998],[-3.2017,55.94987],[-3.20206,55.94979],[-3.20244,55.94967],[-3.20273,55.94957],[-3.20412,55.94901],[-3.20491,55.94871],[-3.20612,55.94827],[-3.20682,55.94808],[-3.20823,55.94773],[-3.2088,55.94759],[-3.21073,55.94715],[-3.21732,55.94564],[-3.21831,55.94544],[-3.2189,55.94533],[-3.2189,55.94533],[-3.21901,55.94531],[-3.22033,55.94505],[-3.22071,55.94498],[-3.22111,55.94489],[-3.22181,55.94473],[-3.22238,55.9446],[-3.22257,55.94456],[-3.22418,55.94421],[-3.22485,55.94406],[-3.22504,55.94402],[-3.22591,55.94385],[-3.22606,55.94383],[-3.22692,55.94367],[-3.22711,55.94363],[-3.22731,55.94358],[-3.22852,55.94333],[-3.22929,55.94316],[-3.22951,55.94311],[-3.2297,55.94306],[-3.23002,55.94298],[-3.23018,55.94293],[-3.23057,55.94282],[-3.2307,55.94279],[-3.23099,55.94272],[-3.23116,55.94267],[-3.23133,55.94262],[-3.23154,55.94257],[-3.23162,55.94255],[-3.23203,55.94245],[-3.23227,55.94238],[-3.23249,55.94232],[-3.23275,55.94226],[-3.23292,55.94221],[-3.23334,55.94211],[-3.23365,55.94202],[-3.23381,55.94198],[-3.23397,55.94194],[-3.23531,55.94164],[-3.2367,55.94133],[-3.23831,55.94097],[-3.23866,55.9409],[-3.24006,55.94059],[-3.24182,55.94018],[-3.24287,55.93995],[-3.24391,55.93972],[-3.24446,55.9396],[-3.24464,55.93956],[-3.24494,55.93949],[-3.24521,55.93946],[-3.24546,55.9394],[-3.24567,55.93936],[-3.24601,55.93929],[-3.24647,55.9392],[-3.2468,55.93913],[-3.2475,55.939],[-3.24798,55.93891],[-3.24834,55.93883],[-3.25036,55.93838],[-3.25052,55.93834],[-3.25395,55.93754],[-3.25742,55.93677],[-3.26332,55.93544],[-3.26487,55.9351],[-3.26672,55.93468],[-3.27048,55.93383],[-3.27463,55.93298],[-3.27497,55.93292],[-3.27565,55.93277],[-3.27605,55.93271],[-3.27651,55.93263],[-3.27704,55.93257],[-3.27766,55.93253],[-3.27825,55.9325],[-3.27886,55.93251],[-3.27963,55.93253],[-3.28033,55.93259],[-3.28078,55.93265],[-3.28123,55.93271],[-3.2818,55.93281],[-3.28238,55.93292],[-3.28286,55.93302],[-3.2988,55.93638],[-3.29934,55.9365],[-3.2998,55.93659],[-3.2998,55.93659],[-3.30105,55.93685],[-3.30263,55.93719],[-3.31336,55.93942],[-3.3168,55.94015],[-3.31783,55.94037],[-3.31919,55.94069],[-3.32016,55.94093],[-3.32024,55.94095],[-3.32024,55.94095],[-3.32051,55.94102],[-3.32263,55.9416],[-3.32499,55.94232],[-3.32599,55.94266],[-3.32716,55.94307],[-3.32911,55.94382],[-3.3312,55.94472],[-3.33355,55.94586],[-3.33557,55.94694],[-3.33696,55.94775],[-3.33834,55.94862],[-3.33975,55.94961],[-3.3465,55.95456],[-3.35347,55.95968],[-3.35441,55.96036],[-3.36199,55.96589],[-3.36227,55.9661],[-3.37174,55.97302],[-3.37269,55.97376],[-3.37311,55.97412],[-3.37347,55.97451],[-3.37389,55.97498],[-3.37404,55.97519],[-3.37427,55.97558],[-3.37463,55.97628],[-3.37626,55.97972],[-3.37655,55.98025],[-3.3769,55.9808],[-3.37697,55.98092],[-3.37709,55.98109],[-3.37729,55.98141],[-3.37766,55.98188],[-3.37808,55.98242],[-3.37835,55.98272],[-3.37895,55.98338],[-3.3798,55.98421],[-3.38021,55.98465],[-3.38073,55.98526],[-3.38108,55.98566],[-3.3812,55.98579],[-3.38145,55.98614],[-3.38145,55.98614],[-3.38154,55.98625],[-3.38182,55.98667],[-3.3822,55.98722],[-3.38232,55.98741],[-3.38257,55.98788],[-3.38325,55.98921],[-3.38337,55.98944],[-3.39318,56.00995],[-3.39352,56.01067],[-3.39376,56.0111],[-3.39392,56.01134],[-3.39405,56.01159],[-3.39422,56.0118],[-3.39463,56.0124],[-3.39463,56.0124],[-3.39466,56.01244],[-3.39541,56.01324],[-3.39652,56.01421],[-3.3979,56.0151],[-3.39916,56.01578],[-3.40109,56.01677],[-3.40186,56.01718],[-3.40245,56.01756],[-3.40328,56.01817],[-3.40386,56.01878],[-3.40424,56.01922],[-3.40472,56.01995],[-3.40505,56.02054],[-3.40521,56.021],[-3.40528,56.02135],[-3.40532,56.02153],[-3.40534,56.02167],[-3.40535,56.02185],[-3.40537,56.02205],[-3.40536,56.02224],[-3.40536,56.02252],[-3.40535,56.02268],[-3.40532,56.02287],[-3.40528,56.02303],[-3.40524,56.02318],[-3.40519,56.02331],[-3.40507,56.02377],[-3.40487,56.02417],[-3.40463,56.02456],[-3.40397,56.02541],[-3.40383,56.02557],[-3.40345,56.02596],[-3.4032,56.02617],[-3.40229,56.0268],[-3.40157,56.02726],[-3.40059,56.02781],[-3.39941,56.02839],[-3.3987,56.02874],[-3.39834,56.02896],[-3.39747,56.02967],[-3.39663,56.0305],[-3.39625,56.031],[-3.39581,56.0318],[-3.39561,56.03247],[-3.39537,56.03326],[-3.39529,56.03379],[-3.39543,56.03455],[-3.39545,56.03515],[-3.39545,56.03524],[-3.39545,56.03524],[-3.39547,56.03603],[-3.39556,56.03641],[-3.39562,56.03664],[-3.39567,56.03684],[-3.39576,56.03707],[-3.39581,56.03718],[-3.39631,56.03812],[-3.3964,56.03824],[-3.39687,56.03887],[-3.39717,56.03918],[-3.39748,56.03947],[-3.39816,56.03995],[-3.39863,56.04024],[-3.39914,56.04049],[-3.40023,56.04095],[-3.40124,56.04128],[-3.40218,56.04153],[-3.40349,56.04176],[-3.40409,56.04186],[-3.4043,56.04188],[-3.40509,56.04201],[-3.4093,56.04267],[-3.42033,56.04442],[-3.42207,56.04469],[-3.4244,56.04505],[-3.42618,56.04533],[-3.42618,56.04533],[-3.42624,56.04535],[-3.42747,56.04554],[-3.4286,56.04572],[-3.43013,56.04602],[-3.43188,56.04646],[-3.43749,56.04793],[-3.4397,56.04863],[-3.44132,56.04929],[-3.44287,56.05009],[-3.44424,56.05096],[-3.44491,56.05146],[-3.44553,56.05198],[-3.4518,56.0577],[-3.4519,56.05779],[-3.45301,56.05881],[-3.45594,56.0615],[-3.45633,56.06199],[-3.45653,56.06234],[-3.45669,56.06268],[-3.45682,56.06309],[-3.45688,56.06334],[-3.45688,56.06358],[-3.45688,56.06401],[-3.45679,56.06452],[-3.45665,56.06495],[-3.45653,56.0652],[-3.45635,56.06551],[-3.45612,56.06582],[-3.45576,56.06625],[-3.45539,56.06659],[-3.4552,56.06674],[-3.45492,56.06695],[-3.45467,56.06711],[-3.45411,56.06742],[-3.45395,56.0675],[-3.4531,56.06788],[-3.45238,56.06813],[-3.45219,56.06818],[-3.45219,56.06818],[-3.45194,56.06826],[-3.45148,56.06837],[-3.45076,56.06851],[-3.45012,56.0686],[-3.44935,56.06868],[-3.44882,56.06873],[-3.44813,56.06877],[-3.44387,56.06903],[-3.44225,56.06922],[-3.44042,56.06951],[-3.43499,56.07047],[-3.4336,56.07072],[-3.43281,56.07091],[-3.43173,56.07122],[-3.43089,56.07156],[-3.43021,56.0719],[-3.42936,56.07242],[-3.42872,56.07293],[-3.42832,56.07333],[-3.428,56.07373],[-3.4275,56.0746],[-3.42724,56.07533],[-3.42675,56.07641],[-3.42644,56.07693],[-3.42612,56.07738],[-3.42572,56.07786],[-3.42536,56.07817],[-3.42504,56.07846],[-3.42469,56.07871],[-3.42418,56.07905],[-3.42361,56.07938],[-3.42258,56.07987],[-3.42179,56.08018],[-3.42131,56.08033],[-3.42131,56.08033],[-3.42071,56.08051],[-3.41968,56.08078],[-3.41827,56.08111],[-3.41733,56.08131],[-3.41587,56.08164],[-3.41009,56.08283],[-3.40529,56.0838],[-3.40502,56.08385],[-3.40366,56.08412],[-3.40164,56.08452],[-3.40079,56.08467],[-3.3994,56.08491],[-3.39669,56.08534],[-3.39554,56.08554],[-3.39448,56.08574],[-3.38912,56.08684],[-3.38569,56.08755],[-3.38314,56.08813],[-3.37852,56.08925],[-3.37441,56.09024],[-3.36968,56.09157],[-3.36536,56.09282],[-3.36182,56.09386],[-3.3606,56.0943],[-3.36004,56.09446],[-3.35852,56.0951],[-3.35729,56.09566],[-3.35555,56.09653],[-3.35356,56.09755],[-3.35202,56.09843],[-3.35089,56.09926],[-3.35028,56.09986],[-3.34982,56.10041],[-3.34936,56.10109],[-3.34892,56.10186],[-3.34873,56.1022],[-3.34809,56.10332],[-3.34729,56.10478],[-3.34604,56.10691],[-3.34512,56.10854],[-3.34433,56.10989],[-3.34416,56.11017],[-3.3441,56.11027],[-3.34377,56.11086],[-3.34356,56.11122],[-3.34348,56.11136],[-3.34332,56.11166],[-3.3433,56.11168]];

function resumeContext(button) {
  button.disabled = true;
  Tone.context.resume();
  var cs = new ContinuousSynth({route: scaleBoundaries(1000, 1000, route), duration: 43, late: false});
  //var cs = new ContinuousSynth({route: [[485.0494548958508,692.6943186796622], [555.7738311840108, 211.2362259051025], [ 615.677703818867, 575.0267734297294 ], [ 182.72719017282247, 974.092597422507 ]], late: false, duration: 20});
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
    this.totalTime = ( ( this.data.duration * 60 ) * 10) / 2;
    this.interval = this.totalTime / this.data.route.length;
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
    self.build = function(oscillatorList) {
      var synthList = [];
      let volumeIndex = 0;

      oscillatorList.forEach(function(osc) {
        synthList.push(
          new Tone.Synth({
                oscillator: {
                  type: osc
                },
                envelope: {
                  attack: 0.4,
                  decay: 0.1,
                  sustain: 0.3,
                  release: 1.0
                },
                volume: volumeIndex
              }));
        volumeIndex = volumeIndex-3;
      });
      return synthList;
    }


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
                attack: 0.5,
                decay: 0.1,
                sustain: 0.3,
                release: 1.0
              }
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
             rolloff: -12,
             'Q': 1,
             gain: -3
            });

     self.connect = function() {
        self.synths[0].chain(self.dynamics.gain, self.dynamics.pan, Tone.Master);
        self.synths[1].chain(self.dynamics.filter, self.dynamics.gain, self.dynamics.pan, Tone.Master);
     };

     self.synths = self.build();
     self.connect();
     self.context = new Tone.Context();
     self.synths = {
       synth: self.synths[0],
       noise: self.synths[1]
     };
                                                /* Synth-related components */
     self.synths.synth.on = false;

     self.synths.synth.change = function(value, rampTime) {
       self.synths.synth.frequency.exponentialRampToValueAtTime(value, self.context.currentTime + rampTime);
       //self.synths.synth.frequency.setValueAtTime(value, rampTime);
     }

     self.synths.synth.play = function(y) {
       let ramp = self.interval/1000;
       let scaledFrequency = self.scale.log(y, _bounds.y.min, _bounds.y.max, 100, 10000);
       var note = self.scale.closest(noteArray, scaledFrequency);
       self.synths.synth.on ?
       self.synths.synth.change(note, ramp) : self.synths.synth.triggerAttack(note)
       if ( self.synths.synth.on == false ) self.synths.synth.on = true;
     };

     self.synths.synth.stop = function() {
       self.synths.synth.triggerRelease();
       self.synths.synth.on = false;
     };

                                              /* Noise-related components */
     self.synths.noise.on = false;

     self.synths.noise.change = function(value, rampTime) {
       console.log('Noise frequency:', value, rampTime, self.context.currentTime, self.context.currentTime + rampTime);
       self.dynamics.filter.frequency.exponentialRampToValueAtTime(value, self.context.currentTime + rampTime);
     };

     self.synths.noise.play = function(x) {
       let ramp = self.interval/1000;
       let scaledFrequency = self.scale.log(x, _bounds.x.min, _bounds.x.max, 10000, 100);
       var note = self.scale.closest(noteArray, scaledFrequency);
       self.synths.noise.change(note, ramp);
       if ( !self.synths.noise.on ) {
         self.synths.noise.triggerAttack();
         self.synths.noise.on = true;
       }
     }

     self.synths.noise.stop = function() {
       self.synths.noise.triggerRelease();
       self.synths.noise.on = false;
     }


                                                  /* Directional Panning: */
     self.pan = 0;

     self.change.pan = function(xDifference, rampTime) {
       var scaledPan = self.scale.lin(Math.abs(xDifference), 0, (_bounds.x.max - _bounds.x.min), 0.0, 10) % 1;
       let panValue = (xDifference < 0) ? scaledPan*-1 : scaledPan;
       self.pan = self.pan + panValue + self.dynamics.pan.pan.value;
       self.panValue = self.dynamics.pan.pan.value + panValue;
       console.log(self.pan);
       self.dynamics.pan.pan.setValueAtTime(self.pan, rampTime);

     }

                                                      /* Runtime Functions */
     self.start = function(coordinateArray) {
       var intervalPeriod = (self.interval/1000); // Formatted into seconds (to work with WAApi).
       var runIndex = 0;
       var synths = [self.synths.synth, self.synths.noise];
       var runInterval = setInterval(function() {
         console.log(runIndex, coordinateArray.length);
         if ( runIndex == coordinateArray.length ) {
           // Stop.
           clearInterval(runInterval);
           synths.forEach(function(s) {
             s.stop();
           });
         } else {
           // Run.
           if ( runIndex != 0 ) {
             let diff = (coordinateArray[runIndex][0] - coordinateArray[runIndex-1][0]);
             console.log(diff);
             self.change.pan(diff, self.interval/1000);
           }
           let coordinateIndex = 0;
           synths.forEach(function(s) {
             s.play(coordinateArray[runIndex][coordinateIndex]);
             coordinateIndex++;
           });
         }
         runIndex++;
       }, self.interval);
     }

       /* Test functions */
     self.dynamics.filter.frequency.value = 1;

     self.start(self.data.route);
     //self.synths.synth.play(692.6943186796622);
     //self.synths.noise.play(485.0494548958508);
     //setTimeout(function() { console.log('Changing'); self.synths.synth.play(211.2362259051025); self.synths.noise.play(555.7738311840108); }, 1000)
     //setTimeout(function() { console.log('Stopping'); self.synths.synth.stop(); self.synths.noise.stop(); }, 10000);
   }
}



function changeSonificationType(button) {
  // Takes button element from app.html, switches type of sonification (cont/disc).
  button.value = ( button.value == "Continuous" ) ? "Discrete" : "Continuous";
  sonificationType = button.value;
}

var sonificationType = "Continuous";

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
    "B":   [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07]};  // Taken from "47RedBaron": https://gist.github.com/i-Robi/8684800.
