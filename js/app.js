(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                || window[vendors[x]+'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
        timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}());


// actual main Game
var Game = function() {
  this.init();
}

Game.prototype = {

  canvasHeight: 300,
  canvasWidth: 300,
  canvasElem: document.querySelector('#canvas'),
  canvas: '',
  rAFid: 0,
  player: {
    width: 40,
    height: 40,
    x: 0,
    y: 0
  },
  laneW: 50,
  blockCount: 2,
  blocksProb: {
    w: 35,
    h: 35,
    color: '#0000ff',
    speed: 3
  },
  blocks: [],
  score: 0,
  endScore: 0,
  state: 'play',

  init: function() {
    var self = this;
    this.setup();
  },
  setup: function() {
    var self = this;
    this.canvasElem.width = this.canvasWidth;
    this.canvasElem.height = this.canvasHeight;
    this.canvas = this.canvasElem.getContext('2d');
    this.canvas.font = "20pt Arial";

    this.player.x = this.canvasWidth / 2 - (this.player.width / 2);
    this.player.y = this.canvasHeight - this.player.height;

    for (var i = 0; i < self.blockCount; i++) {
      self.blocks[i] = {};
      self.blocks[i].x = Math.floor((Math.random() * (7 - 1))) * self.laneW;
      self.blocks[i].y = - self.blocksProb.h;
      self.blocks[i].isActive = false;
    };

    this.loop();
  },
  render: function() {
    var self = this;

    if (self.state === 'play') {
      this.clearCanvas();
      
      this.canvas.strokeStyle = '#E1B51E';
      this.canvas.fillStyle = '#E1B51E';

      for (var i = 0; i < self.blockCount; i++) {
        if(self.blocks[i].isActive === true) {
          self.canvas.fillRect(self.blocks[i].x, self.blocks[i].y, self.blocksProb.w, self.blocksProb.h);
        }
      }

      this.canvas.strokeStyle = '#2079DE';
      this.canvas.fillStyle = '#2079DE';
      this.canvas.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

      this.canvas.fillText(Math.floor(self.score), self.canvasWidth - 40, 25);
    } else {
      this.canvas.strokeStyle = '#ff0000';
      this.canvas.fillStyle = '#ff0000';
      self.canvas.font = "30pt Arial";
      self.canvas.fillText("GAME OVER", 30, 50);
    }
    
  },
  clearCanvas: function() {
    this.canvas.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  },
  update: function() {
    var self = this;

    self.score = self.score + 0.1;

    for (var i = 0; i < self.blockCount; i++) {
      if(self.blocks[i].isActive === false) {
        if (Math.random() > 0.9) {
          self.blocks[i].isActive = true;
        }
      } else {
        self.blocks[i].y = self.blocks[i].y + self.blocksProb.speed;
        if (self.blocks[i].y > self.canvasHeight) {
          self.blocks[i].isActive = false;
          self.blocks[i].y = - self.blocksProb.h;
          self.blocks[i].x = Math.floor((Math.random() * (7 - 1))) * self.laneW;
        }
      }

      var collision = self.rectanglesIntersect([[self.blocks[i].x, self.blocks[i].y], [self.blocks[i].x + self.blocksProb.w, self.blocks[i].y + self.blocksProb.h]], [[self.player.x, self.player.y], [self.player.x + self.player.width, self.player.y + self.player.height]]);
      if (collision) {
        self.endScore = self.score;
        self.state = 'over';
      }
    }

  },
  loop: function() {
    var self = this;
    // for some reason this needs to wrapped to function...
    this.rAFid = window.requestAnimationFrame(function() {
      self.loop();
    });
    this.update();
    this.render();
  },
  moveLeft: function() {
    this.player.x = this.player.x - this.laneW;
  },
  moveRight: function() {
    this.player.x = this.player.x + this.laneW;
  },
  rectanglesIntersect: function(rect1, rect2) {
    /*
     * Each array in parameter is one rectangle
     * in each array, there is an array showing the co-ordinates of two opposite corners of the rectangle
     * Example:
     * [[x1, y1], [x2, y2]], [[x3, y3], [x4, y4]]
     */

    //Check whether there is an x overlap
    if ((rect1[0][0] < rect2[0][0] && rect2[0][0] < rect1[1][0]) //Event that x3 is inbetween x1 and x2
        || (rect1[0][0] < rect2[1][0] && rect2[1][0] < rect1[1][0]) //Event that x4 is inbetween x1 and x2
        || (rect2[0][0] < rect1[0][0] && rect1[1][0] < rect2[1][0])) {  //Event that x1 and x2 are inbetween x3 and x4
        //Check whether there is a y overlap using the same procedure
        if ((rect1[0][1] < rect2[0][1] && rect2[0][1] < rect1[1][1]) //Event that y3 is between y1 and y2
            || (rect1[0][1] < rect2[1][1] && rect2[1][1] < rect1[1][1]) //Event that y4 is between y1 and y2
            || (rect1[0][1] < rect2[1][1] && rect2[1][1] < rect1[1][1])) { //Event that y1 and y2 are between y3 and y4
            return true;
        }
    }
    return false;
  }

};



// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {

  // var translate = navigator.mozL10n.get;

  // We want to wait until the localisations library has loaded all the strings.
  // So we'll tell it to let us know once it's ready.
  //navigator.mozL10n.once(start);

  var game = new Game();
  var hammertime = new Hammer.Manager(game.canvasElem);
 
  var tap = new Hammer.Tap({ event: 'singletap' });
  var swipe = new Hammer.Swipe({ event: 'swipe' });
  hammertime.add( [tap, swipe] );

  hammertime.on("singletap", function(ev) {
      console.log(ev.type);
  });
  hammertime.on('swipeleft', function(ev) {
    console.log('left');
    game.moveLeft();
  });
  hammertime.on('swiperight', function(ev) {
    console.log('right');
    game.moveRight();
  });


});
