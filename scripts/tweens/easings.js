/**
 * Types of easings. Returns function with a parameter wich represents the entire progress of the animation with a value of [0,1].
 * References:
 *  https://gist.github.com/gre/1650294
 *  https://easings.net/
 */
export const easings = {
  linear: function(prog) { return prog; },
  easeInSine: function(prog) { return 1 - Math.cos((prog * Math.PI) / 2); },
  easeOutSine: function(prog) { return Math.sin((prog * Math.PI) / 2); },
  easeInOutSine: function(prog) { return -(Math.cos(Math.PI * prog) - 1) / 2; },
  easeInQuad: function(prog) { return prog * prog; },
  easeOutQuad: function(prog) { return prog * (2 - prog); },
  easeInOutQuad: function(prog) { return prog < 0.5 ? 2 * prog * prog : -1 + (4 - 2 * prog) * prog; },
  easeInCubic: function(prog) { return prog ** 3; },
  easeOutCubic: function(prog) { return (--prog) * prog * prog + 1; },
  easeInOutCubic: function(prog) { return prog < 0.5 ? 4 * (prog ** 3) : (prog - 1) * (2 * prog - 2) * (2 * prog - 2) + 1; },
  easeInQuart: function(prog) { return prog ** 4; },
  easeOutQuart: function(prog) { return 1 - (--prog) * (prog ** 3); },
  easeInOutQuart: function(prog) { return prog < 0.5 ? 8 * (prog ** 4) : 1 - 8 * (--prog) * (prog ** 3); },
  easeInQuint: function(prog) { return prog ** 5; },
  easeOutQuint: function(prog) { return 1 + (--prog) * (prog ** 5); },
  easeInOutQuint: function(prog) { return prog < 0.5 ? 16 * (prog ** 5) : 1 + 16 * (--prog) * (prog ** 4); },
  easeInExpo: function(prog) { return prog === 0 ? 0 : 2 ** (10 * prog - 10); },
  easeOutExpo: function(prog) { return prog === 1 ? 1 : 1 - (2 ** (-10 * prog)); },
  easeInOutExpo: function(prog) {
      return prog === 0 ? 0 : 
          prog === 1 ? 1 : 
          prog < 0.5 ? 2 ** (20 * prog - 10) / 2 : (2 - (2 ** (-20 * prog + 10))) / 2;
  },
  easeInCirc: function(prog) { return 1 - Math.sqrt(1 - prog ** 2); },
  easeOutCirc: function(prog) { return Math.sqrt(1 - (prog - 1) ** 2); },
  easeInOutCirc: function(prog) {
      return prog < 0.5
          ? (1 - Math.sqrt(1 - (2 * prog) ** 2)) / 2
          : (Math.sqrt(1 - (-2 * prog + 2) ** 2) + 1) / 2;
  },
  easeInBack: function(prog) {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return (c3 * (prog ** 3)) - (c1 * prog * prog);
  },
  easeOutBack: function(prog) {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * ((prog - 1) ** 3) + c1 * ((prog - 1) ** 2);
  },
  easeInOutBack: function(prog) {
      const c1 = 1.70158;
      const c2 = c1 * 1.1525;
      return prog < 0.5 ?
          (((2 * prog) ** 2) * ((c2 + 1) * 2 * prog - c2)) / 2 :
          (((2 * prog - 2) ** 2) * ((c2 + 1) * (prog * 2 - 2) + c2) + 2) / 2;
  },
  easeInElastic: function(prog) {
      const c4 = (2 * Math.PI) / 3;

      return prog === 0
          ? 0
          : prog === 1
          ? 1
          : -(2 ** (10 * prog - 10)) * Math.sin((prog * 10 - 10.75) * c4);
  },
  easeOutElastic: function(prog) {
      const c4 = (2 * Math.PI) / 3;

      return prog === 0
          ? 0
          : prog === 1
          ? 1
          : (2 ** (-10 * prog) * Math.sin((prog * 10 - 0.75) * c4)) + 1;
  },
  easeInOutElastic: function(prog) {
      const c5 = (2 * Math.PI) / 4.5;

      return prog === 0
          ? 0
          : prog === 1
          ? 1
          : prog < 0.5
          ? -((2 ** (20 * prog - 10)) * Math.sin((20 * prog - 11.125) * c5)) / 2
          : ((2 ** (-20 * prog + 10)) * Math.sin((20 * prog - 11.125) * c5)) / 2 + 1;
  },
  easeInBounce: function(prog) { return 1 - this.easeOutBounce(1 - prog); },
  easeOutBounce: function(prog) {
      const n1 = 7.5625;
      const d1 = 2.75;

      if (prog < 1 / d1) {
          return n1 * prog * prog;
      } else if (prog < 2 / d1) {
          return n1 * (prog -= 1.5 / d1) * prog + 0.75;
      } else if (prog < 2.5 / d1) {
          return n1 * (prog -= 2.25 / d1) * prog + 0.9375;
      } else {
          return n1 * (prog -= 2.625 / d1) * prog + 0.984375;
      }
  },
  easeInOutBounce: function(prog) {
      return prog < 0.5
          ? (1 - this.easeOutBounce(1 - 2 * prog)) / 2
          : (1 + this.easeOutBounce(2 * prog - 1)) / 2;
  }
}