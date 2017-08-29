var five = require("johnny-five");
var board = new five.Board();
var request = require("request");
var SPEED = 50;

board.on("ready", function() {

  /**
   * In order to use the Stepper class, your board must be flashed with
   * either of the following:
   *
   * - AdvancedFirmata https://github.com/soundanalogous/AdvancedFirmata
   * - ConfigurableFirmata https://github.com/firmata/arduino/releases/tag/v2.6.2
   *
   */
  function CounterWheel(stepper) {
    this.pos = 0;
    this.stepper = stepper;
    this.steps = [
      204,
      205,
      205,
      205,
      205,
      204,
      205,
      205,
      205,
      205,
    ];
  }
  
  CounterWheel.prototype.number = function(n, cb) {
    var stepsToTake = 0;
    if (this.pos > n) {
      n += 10;
    }
    for(var i=this.pos; i < n; ++i) {
      stepsToTake += this.steps[i%10];
    }
    this.stepper.speed(SPEED).ccw().step(stepsToTake, () => {
      this.pos = n%10;
      if (cb != undefined) {
        cb();
      }
    });
  }
  
  CounterWheel.prototype.reset = function() {
    this.pos = 0;
  }

  var st1 = new five.Stepper({
    type: five.Stepper.TYPE.FOUR_WIRE,
    stepsPerRev: 2048,
    pins: [4, 5, 6, 7]
  });

  var st2 = new five.Stepper({
    type: five.Stepper.TYPE.FOUR_WIRE,
    stepsPerRev: 2048,
    pins: [8, 9, 10, 11]
  });

  st1.cw().speed(SPEED).step(2048, () => {});
  st2.cw().speed(SPEED).step(2048, () => {});

  cw1 = new CounterWheel(st1);
  cw2 = new CounterWheel(st2);

  this.repl.inject({
    // Allow limited on/off control access to the
    // Led instance from the REPL.
    st1,
    st2,
    cw1,
    cw2
  });


});


// cw1.reset();cw2.reset();
// cw1.number(5);cw2.number(5);