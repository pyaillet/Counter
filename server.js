var five = require("johnny-five");
var board = new five.Board();
var request = require("request");

board.on("ready", function() {
  var SPEED = 50;
  var counterUrl = process.env.COUNTER_URL;

  function CounterWheel(stepper, name) {
    this.pos = 0;
    this.name = name;
    this.stepper = stepper;
    this.steps = [204, 205, 205, 205, 205, 204, 205, 205, 205, 205];
  }

  CounterWheel.prototype.number = function(n, cb) {
    console.log(`${this.name}: ${this.pos} - ${n}`);
    var stepsToTake = 0;
    if (this.pos == n) return;
    if (this.pos > n) {
      n += 10;
    }
    for (var i = this.pos; i < n; ++i) {
      stepsToTake += this.steps[i % 10];
    }
    this.pos = n % 10;
    this.stepper
      .speed(SPEED)
      .ccw()
      .step(stepsToTake, () => {
        if (cb != undefined) {
          cb();
        }
      });
  };

  CounterWheel.prototype.reset = function() {
    this.pos = 0;
  };

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

  var cw1 = new CounterWheel(st1, "cw1");
  var cw2 = new CounterWheel(st2, "cw2");

  function Counter(cws) {
    this.cws = cws;
  }

  Counter.prototype.number = function(number) {
    var i = 0;
    while (i < this.cws.length) {
      this.cws[i].number(number % 10);
      number = ~~(number / 10);
      i++;
    }
  };

  var counter = new Counter([cw1, cw2]);

  setInterval(function() {
    request.get(counterUrl, (err, res, body) => {
      console.log(body);
      counter.number(body);
    });
  }, 5000);

  this.repl.inject({
    // Allow limited on/off control access to the
    // Led instance from the REPL.
    st1,
    st2,
    cw1,
    cw2,
    counter
  });
});
