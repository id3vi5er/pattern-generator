/**
 * Guilloche Pattern Generator – Presets Library
 *
 * Each preset is a complete application state snapshot containing
 * one or more layers with curve type, mathematical parameters,
 * and styling information.
 */

const Presets = (() => {
  'use strict';

  /**
   * Helper: create a default layer structure.
   */
  function makeLayer(overrides = {}) {
    return {
      id: overrides.id || crypto.randomUUID(),
      name: overrides.name || 'Layer',
      type: overrides.type || 'hypotrochoid',
      visible: overrides.visible !== undefined ? overrides.visible : true,
      params: overrides.params || {},
      transform: {
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        ...(overrides.transform || {}),
      },
      style: {
        strokeColor: '#00ccff',
        strokeWidth: 0.8,
        opacity: 1,
        dashArray: '',
        blendMode: 'screen',
        gradient: null,       // null = solid, or { start, end }
        ...(overrides.style || {}),
      },
    };
  }

  /* ================================================================== */
  /*  PRESET DEFINITIONS                                                 */
  /* ================================================================== */

  const library = {

    /* -------------------------------------------------------------- */
    'Classic Spirograph': {
      description: 'A clean, closed hypotrochoid flower pattern.',
      layers: [
        makeLayer({
          name: 'Spirograph Flower',
          type: 'hypotrochoid',
          params: { R: 120, r: 45, d: 55, steps: 3000, copies: 1 },
          style: {
            strokeColor: '#00e5ff',
            strokeWidth: 0.7,
            opacity: 0.9,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Banknote Rosette': {
      description: 'Multi-layer circular wave rosette inspired by banknote security patterns.',
      layers: [
        makeLayer({
          name: 'Outer Ring',
          type: 'circularWave',
          params: {
            baseRadius: 140,
            waves: [
              { amplitude: 8, frequency: 36, phase: 0 },
              { amplitude: 3, frequency: 72, phase: 1.5 },
            ],
            steps: 4000,
            loops: 1,
            copies: 1,
          },
          style: {
            strokeColor: '#22c55e',
            strokeWidth: 0.5,
            opacity: 0.85,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Middle Ring',
          type: 'circularWave',
          params: {
            baseRadius: 100,
            waves: [
              { amplitude: 12, frequency: 24, phase: 0 },
              { amplitude: 5, frequency: 48, phase: 0.8 },
            ],
            steps: 4000,
            loops: 1,
            copies: 1,
          },
          style: {
            strokeColor: '#16a34a',
            strokeWidth: 0.5,
            opacity: 0.75,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Inner Ring',
          type: 'circularWave',
          params: {
            baseRadius: 60,
            waves: [
              { amplitude: 15, frequency: 16, phase: 0 },
            ],
            steps: 3000,
            loops: 1,
            copies: 1,
          },
          style: {
            strokeColor: '#4ade80',
            strokeWidth: 0.6,
            opacity: 0.7,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Spirograph Duo': {
      description: 'Two interlocking spirograph curves with contrasting colours.',
      layers: [
        makeLayer({
          name: 'Hypo Large',
          type: 'hypotrochoid',
          params: { R: 130, r: 50, d: 65, steps: 3000, copies: 1 },
          style: {
            strokeColor: '#f472b6',
            strokeWidth: 0.6,
            opacity: 0.9,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Epi Small',
          type: 'epitrochoid',
          params: { R: 50, r: 30, d: 25, steps: 3000, copies: 1 },
          style: {
            strokeColor: '#818cf8',
            strokeWidth: 0.6,
            opacity: 0.85,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Ripple Border': {
      description: 'Layered linear wave bands creating a decorative border strip.',
      layers: [
        makeLayer({
          name: 'Wave Top',
          type: 'linearWave',
          params: {
            width: 500,
            yOffset: -20,
            waves: [
              { amplitude: 15, frequency: 0.06, phase: 0 },
              { amplitude: 5, frequency: 0.18, phase: 1.0 },
            ],
            steps: 1200,
            copies: 1,
          },
          style: {
            strokeColor: '#f59e0b',
            strokeWidth: 0.8,
            opacity: 0.9,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Wave Center',
          type: 'linearWave',
          params: {
            width: 500,
            yOffset: 0,
            waves: [
              { amplitude: 12, frequency: 0.08, phase: 0.5 },
              { amplitude: 4, frequency: 0.24, phase: 2.0 },
            ],
            steps: 1200,
            copies: 1,
          },
          style: {
            strokeColor: '#fb923c',
            strokeWidth: 0.8,
            opacity: 0.85,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Wave Bottom',
          type: 'linearWave',
          params: {
            width: 500,
            yOffset: 20,
            waves: [
              { amplitude: 15, frequency: 0.06, phase: Math.PI },
              { amplitude: 5, frequency: 0.18, phase: Math.PI + 1.0 },
            ],
            steps: 1200,
            copies: 1,
          },
          style: {
            strokeColor: '#f59e0b',
            strokeWidth: 0.8,
            opacity: 0.9,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Cosmic Portal': {
      description: 'Dense rotational spirograph with multiple copies creating a mandala-like portal.',
      layers: [
        makeLayer({
          name: 'Portal Core',
          type: 'hypotrochoid',
          params: { R: 100, r: 37, d: 50, steps: 2500, copies: 6 },
          style: {
            strokeColor: '#c084fc',
            strokeWidth: 0.4,
            opacity: 0.8,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Portal Halo',
          type: 'circularWave',
          params: {
            baseRadius: 130,
            waves: [
              { amplitude: 10, frequency: 18, phase: 0 },
              { amplitude: 4, frequency: 54, phase: 0.5 },
            ],
            steps: 4000,
            loops: 1,
            copies: 1,
          },
          style: {
            strokeColor: '#a855f7',
            strokeWidth: 0.5,
            opacity: 0.6,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Security Mesh': {
      description: 'Tightly interwoven circular waves mimicking anti-forgery background mesh.',
      layers: (() => {
        const layers = [];
        for (let i = 0; i < 5; i++) {
          layers.push(makeLayer({
            name: `Ring ${i + 1}`,
            type: 'circularWave',
            params: {
              baseRadius: 40 + i * 25,
              waves: [
                { amplitude: 4 + i * 1.5, frequency: 20 + i * 4, phase: i * 0.3 },
              ],
              steps: 3500,
              loops: 1,
              copies: 1,
            },
            style: {
              strokeColor: `hsl(${170 + i * 12}, 70%, ${55 + i * 5}%)`,
              strokeWidth: 0.35,
              opacity: 0.7,
              blendMode: 'screen',
            },
          }));
        }
        return layers;
      })(),
    },

    /* -------------------------------------------------------------- */
    'Epitrochoid Star': {
      description: 'Bold epitrochoid star pattern with rotational copies.',
      layers: [
        makeLayer({
          name: 'Star',
          type: 'epitrochoid',
          params: { R: 80, r: 25, d: 60, steps: 3000, copies: 3 },
          style: {
            strokeColor: '#fb7185',
            strokeWidth: 0.6,
            opacity: 0.9,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Harmonic Weave': {
      description: 'Circular waves with harmonic frequency ratios producing fabric-like texture.',
      layers: [
        makeLayer({
          name: 'Warp',
          type: 'circularWave',
          params: {
            baseRadius: 110,
            waves: [
              { amplitude: 18, frequency: 12, phase: 0 },
              { amplitude: 9, frequency: 24, phase: 0 },
              { amplitude: 4.5, frequency: 48, phase: 0 },
            ],
            steps: 5000,
            loops: 1,
            copies: 1,
          },
          style: {
            strokeColor: '#38bdf8',
            strokeWidth: 0.45,
            opacity: 0.85,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Weft',
          type: 'circularWave',
          params: {
            baseRadius: 110,
            waves: [
              { amplitude: 18, frequency: 12, phase: Math.PI / 12 },
              { amplitude: 9, frequency: 24, phase: Math.PI / 12 },
              { amplitude: 4.5, frequency: 48, phase: Math.PI / 12 },
            ],
            steps: 5000,
            loops: 1,
            copies: 1,
          },
          style: {
            strokeColor: '#7dd3fc',
            strokeWidth: 0.45,
            opacity: 0.7,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Lissajous Knot': {
      description: 'Interlocking Lissajous figure with 3:4 frequency ratio, rotationally multiplied.',
      layers: [
        makeLayer({
          name: 'Lissajous 3:4',
          type: 'lissajous',
          params: { A: 120, B: 120, a: 3, b: 4, delta: 1.57, steps: 3000, copies: 3 },
          style: {
            strokeColor: '#f472b6',
            strokeWidth: 0.6,
            opacity: 0.9,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Lissajous 5:6',
          type: 'lissajous',
          params: { A: 80, B: 80, a: 5, b: 6, delta: 0.8, steps: 3000, copies: 1 },
          style: {
            strokeColor: '#e879f9',
            strokeWidth: 0.5,
            opacity: 0.7,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Rose Garden': {
      description: 'Three overlaid rhodonea curves with 3, 5, and 7 petals in distinct colours.',
      layers: [
        makeLayer({
          name: 'Rose k=3',
          type: 'rhodonea',
          params: { amplitude: 130, kn: 3, kd: 1, phase: 0, steps: 3000, copies: 1 },
          style: {
            strokeColor: '#fb7185',
            strokeWidth: 0.6,
            opacity: 0.85,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Rose k=5',
          type: 'rhodonea',
          params: { amplitude: 100, kn: 5, kd: 1, phase: 0, steps: 3000, copies: 1 },
          style: {
            strokeColor: '#f472b6',
            strokeWidth: 0.5,
            opacity: 0.75,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Rose k=7',
          type: 'rhodonea',
          params: { amplitude: 70, kn: 7, kd: 1, phase: 0, steps: 3000, copies: 1 },
          style: {
            strokeColor: '#e879f9',
            strokeWidth: 0.45,
            opacity: 0.7,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Golden Spiral': {
      description: 'Logarithmic spiral with modulated circular wave overlay.',
      layers: [
        makeLayer({
          name: 'Log Spiral',
          type: 'spiral',
          params: { spiralType: 'logarithmic', a: 2, b: 0.15, maxTurns: 5, steps: 3000, copies: 1 },
          style: {
            strokeColor: '#fbbf24',
            strokeWidth: 0.7,
            opacity: 0.9,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Halo Ring',
          type: 'circularWave',
          params: {
            baseRadius: 140,
            waves: [{ amplitude: 6, frequency: 30, phase: 0 }],
            steps: 3000, loops: 1, copies: 1,
          },
          style: {
            strokeColor: '#f59e0b',
            strokeWidth: 0.4,
            opacity: 0.5,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Superform Star': {
      description: 'Five-pointed superformula star surrounded by a fine circular wave ring.',
      layers: [
        makeLayer({
          name: 'Star (m=5)',
          type: 'superformula',
          params: { m: 5, n1: 0.3, n2: 0.3, n3: 0.3, sa: 1, sb: 1, scale: 120, steps: 3000, copies: 1 },
          style: {
            strokeColor: '#34d399',
            strokeWidth: 0.7,
            opacity: 0.9,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Outer Ring',
          type: 'circularWave',
          params: {
            baseRadius: 155,
            waves: [{ amplitude: 4, frequency: 40, phase: 0 }],
            steps: 3000, loops: 1, copies: 1,
          },
          style: {
            strokeColor: '#6ee7b7',
            strokeWidth: 0.35,
            opacity: 0.6,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Maurer Net': {
      description: 'Maurer rose with n=6, d=71 creating crystalline star structures.',
      layers: [
        makeLayer({
          name: 'Maurer Rose',
          type: 'maurerRose',
          params: { n: 6, d: 71, amplitude: 130, numPoints: 361, copies: 1 },
          style: {
            strokeColor: '#60a5fa',
            strokeWidth: 0.5,
            opacity: 0.85,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Base Rose',
          type: 'rhodonea',
          params: { amplitude: 130, kn: 6, kd: 1, phase: 0, steps: 3000, copies: 1 },
          style: {
            strokeColor: '#93c5fd',
            strokeWidth: 0.8,
            opacity: 0.6,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Passport Filigree': {
      description: 'Combination of security mesh, linear waves, and fine rosettes in passport style.',
      layers: [
        makeLayer({
          name: 'Center Rosette',
          type: 'circularWave',
          params: {
            baseRadius: 80,
            waves: [
              { amplitude: 10, frequency: 20, phase: 0 },
              { amplitude: 5, frequency: 40, phase: 0.5 },
            ],
            steps: 4000, loops: 1, copies: 1,
          },
          style: {
            strokeColor: '#6366f1',
            strokeWidth: 0.4,
            opacity: 0.8,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Outer Mesh',
          type: 'circularWave',
          params: {
            baseRadius: 130,
            waves: [{ amplitude: 5, frequency: 48, phase: 0 }],
            steps: 4000, loops: 1, copies: 1,
          },
          style: {
            strokeColor: '#818cf8',
            strokeWidth: 0.3,
            opacity: 0.5,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Border Wave',
          type: 'linearWave',
          params: {
            width: 400, yOffset: -150,
            waves: [{ amplitude: 8, frequency: 0.08, phase: 0 }],
            steps: 1000, copies: 1,
          },
          style: {
            strokeColor: '#a5b4fc',
            strokeWidth: 0.4,
            opacity: 0.4,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Currency Portrait Frame': {
      description: 'Oval frame of concentric, slightly offset circular waves in banknote style.',
      layers: (() => {
        const layers = [];
        for (let i = 0; i < 8; i++) {
          layers.push(makeLayer({
            name: `Frame Ring ${i + 1}`,
            type: 'circularWave',
            params: {
              baseRadius: 50 + i * 14,
              waves: [
                { amplitude: 3 + i * 0.5, frequency: 24 + i * 2, phase: i * 0.2 },
              ],
              steps: 3500, loops: 1, copies: 1,
            },
            style: {
              strokeColor: `hsl(${30 + i * 5}, 65%, ${50 + i * 3}%)`,
              strokeWidth: 0.3,
              opacity: 0.7,
              blendMode: 'screen',
            },
          }));
        }
        return layers;
      })(),
    },

    /* -------------------------------------------------------------- */
    'Gear Mechanism': {
      description: 'Superformula gear shape with involute tooth profile.',
      layers: [
        makeLayer({
          name: 'Gear Body',
          type: 'superformula',
          params: { m: 12, n1: 20, n2: 20, n3: 20, sa: 1, sb: 1, scale: 100, steps: 3000, copies: 1 },
          style: {
            strokeColor: '#94a3b8',
            strokeWidth: 0.8,
            opacity: 0.85,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Involute Tooth',
          type: 'involute',
          params: { a: 6, maxTurns: 3, steps: 2000, copies: 6 },
          style: {
            strokeColor: '#cbd5e1',
            strokeWidth: 0.5,
            opacity: 0.6,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Double Helix': {
      description: 'Two phase-shifted Lissajous curves forming a DNA-like double helix.',
      layers: [
        makeLayer({
          name: 'Strand A',
          type: 'lissajous',
          params: { A: 100, B: 130, a: 1, b: 12, delta: 0, steps: 3000, copies: 1 },
          style: {
            strokeColor: '#22d3ee',
            strokeWidth: 0.7,
            opacity: 0.9,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Strand B',
          type: 'lissajous',
          params: { A: 100, B: 130, a: 1, b: 12, delta: Math.PI, steps: 3000, copies: 1 },
          style: {
            strokeColor: '#67e8f9',
            strokeWidth: 0.7,
            opacity: 0.7,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Oscilloscope Art': {
      description: 'Multiple Lissajous curves with near-irrational frequency ratios for dense fills.',
      layers: [
        makeLayer({
          name: 'Lissajous Dense 1',
          type: 'lissajous',
          params: { A: 120, B: 120, a: 7, b: 9, delta: 0.3, steps: 5000, copies: 1 },
          style: {
            strokeColor: '#4ade80',
            strokeWidth: 0.3,
            opacity: 0.7,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Lissajous Dense 2',
          type: 'lissajous',
          params: { A: 100, B: 100, a: 11, b: 13, delta: 0.7, steps: 5000, copies: 1 },
          style: {
            strokeColor: '#22c55e',
            strokeWidth: 0.25,
            opacity: 0.5,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Fermat Sunflower': {
      description: 'Fermat spiral creating a sunflower-like expansion pattern.',
      layers: [
        makeLayer({
          name: 'Fermat Spiral',
          type: 'spiral',
          params: { spiralType: 'fermat', a: 12, b: 0, maxTurns: 12, steps: 4000, copies: 2 },
          style: {
            strokeColor: '#fbbf24',
            strokeWidth: 0.5,
            opacity: 0.85,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Organic Bloom': {
      description: 'Superformula organic shape with varying exponents producing petal-like blooms.',
      layers: [
        makeLayer({
          name: 'Bloom Outer',
          type: 'superformula',
          params: { m: 7, n1: 0.2, n2: 1.7, n3: 1.7, sa: 1, sb: 1, scale: 130, steps: 3000, copies: 1 },
          style: {
            strokeColor: '#a78bfa',
            strokeWidth: 0.6,
            opacity: 0.85,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Bloom Inner',
          type: 'superformula',
          params: { m: 7, n1: 0.5, n2: 0.5, n3: 0.5, sa: 1, sb: 1, scale: 80, steps: 3000, copies: 1 },
          style: {
            strokeColor: '#c4b5fd',
            strokeWidth: 0.5,
            opacity: 0.65,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Harmonograph Mesh': {
      description: 'Simulated 4-pendulum physics creating a 3D-like structural wireframe mesh.',
      layers: [
        makeLayer({
          name: 'Pendulum Net',
          type: 'harmonograph',
          params: { A1: 150, f1: 3.01, p1: 0.2, d1: 0.001, A2: 150, f2: 2, p2: 0, d2: 0.001, A3: 150, f3: 3, p3: 0, d3: 0.001, A4: 150, f4: 2, p4: 1.57, d4: 0.001, steps: 15000, maxT: 100, copies: 1 },
          style: {
            strokeColor: '#38bdf8',
            strokeWidth: 0.2,
            opacity: 0.7,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Braided Torus': {
      description: '3D projection of a torus knot forming an interlaced starry polygon.',
      layers: [
        makeLayer({
          name: 'Knot 7/3',
          type: 'torusKnot',
          params: { p: 3, q: 7, R: 120, r: 60, steps: 4000, copies: 1 },
          style: {
            strokeColor: '#facc15',
            strokeWidth: 0.6,
            opacity: 0.9,
            blendMode: 'screen',
          },
        }),
        makeLayer({
          name: 'Knot 7/3 Inner',
          type: 'torusKnot',
          params: { p: 3, q: 7, R: 120, r: 40, steps: 4000, copies: 1 },
          style: {
            strokeColor: '#fef08a',
            strokeWidth: 0.4,
            opacity: 0.7,
            blendMode: 'screen',
          },
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Fay Butterfly': {
      description: 'Pure organic polar curve that flawlessly mimics the structure of a butterfly.',
      layers: [
        makeLayer({
          name: 'Butterfly',
          type: 'butterflyCurve',
          params: { scale: 35, steps: 6000, copies: 1 },
          style: {
            strokeColor: '#ec4899',
            strokeWidth: 0.5,
            opacity: 0.85,
            blendMode: 'screen',
          },
          transform: { x: 0, y: 30, rotation: 0, scaleX: 1, scaleY: 1 }
        }),
      ],
    },

    /* -------------------------------------------------------------- */
    'Fractal Fern (L-System)': {
      description: 'Biological branching structure generated using a formal grammar (L-System).',
      layers: [
        makeLayer({
          name: 'Barnsley-like Fern',
          type: 'lSystem',
          params: { axiom: "X", rules: "X=F+[[X]-X]-F[-FX]+X;F=FF", angle: 25, stepLength: 4, iterations: 5, copies: 1 },
          style: {
            strokeColor: '#10b981',
            strokeWidth: 0.5,
            opacity: 0.8,
            blendMode: 'screen',
          },
          transform: { x: 0, y: 150, rotation: 0, scaleX: 1, scaleY: -1 }
        }),
      ],
    },
    
    /* -------------------------------------------------------------- */
    'Sierpinski Polygon (L-System)': {
      description: 'Perfect geometric Sierpinski triangle fractal rendered via Turtle graphics.',
      layers: [
        makeLayer({
          name: 'Sierpinski Arrowhead',
          type: 'lSystem',
          params: { axiom: "YF", rules: "X=YF+XF+Y;Y=XF-YF-X", angle: 60, stepLength: 5, iterations: 6, copies: 1 },
          style: {
            strokeColor: '#3b82f6',
            strokeWidth: 0.5,
            opacity: 0.9,
            blendMode: 'screen',
          },
          transform: { x: 0, y: 150, rotation: -30, scaleX: 1, scaleY: 1 }
        }),
      ],
    },
  };

  /* ================================================================== */
  /*  PUBLIC API                                                         */
  /* ================================================================== */

  /**
   * Get list of preset names.
   */
  function list() {
    return Object.keys(library);
  }

  /**
   * Load a preset by name. Returns a deep copy so originals are never mutated.
   */
  function load(name) {
    const preset = library[name];
    if (!preset) return null;
    // Deep clone and assign fresh IDs
    const clone = JSON.parse(JSON.stringify(preset));
    clone.layers.forEach(l => { l.id = crypto.randomUUID(); });
    return clone;
  }

  /**
   * Create a fresh default layer (for "Add Layer" button).
   */
  function defaultLayer(type = 'hypotrochoid') {
    const defaults = {
      hypotrochoid: { R: 100, r: 40, d: 30, steps: 2000, copies: 1 },
      epitrochoid:  { R: 80, r: 30, d: 25, steps: 2000, copies: 1 },
      circularWave: {
        baseRadius: 100,
        waves: [{ amplitude: 15, frequency: 12, phase: 0 }],
        steps: 3000, loops: 1, copies: 1,
      },
      linearWave: {
        width: 400, yOffset: 0,
        waves: [{ amplitude: 20, frequency: 0.06, phase: 0 }],
        steps: 1000, copies: 1,
      },
      lissajous: {
        A: 100, B: 100, a: 3, b: 4, delta: 1.57,
        steps: 2000, copies: 1,
      },
      rhodonea: {
        amplitude: 120, kn: 5, kd: 1, phase: 0,
        steps: 3000, copies: 1,
      },
      spiral: {
        spiralType: 'archimedean', a: 5, b: 3, maxTurns: 8,
        steps: 3000, copies: 1,
      },
      superformula: {
        m: 5, n1: 0.3, n2: 0.3, n3: 0.3, sa: 1, sb: 1, scale: 100,
        steps: 3000, copies: 1,
      },
      maurerRose: {
        n: 6, d: 71, amplitude: 120, numPoints: 361,
        copies: 1,
      },
      involute: {
        a: 8, maxTurns: 4,
        steps: 2000, copies: 1,
      },
      harmonograph: {
        A1: 150, f1: 3.01, p1: 0.2, d1: 0.001,
        A2: 150, f2: 2, p2: 0, d2: 0.001,
        A3: 150, f3: 3, p3: 0, d3: 0.001,
        A4: 150, f4: 2, p4: 1.57, d4: 0.001,
        steps: 10000, maxT: 100, copies: 1,
      },
      torusKnot: {
        p: 3, q: 7, R: 120, r: 40,
        steps: 3000, copies: 1,
      },
      butterflyCurve: {
        scale: 30, steps: 5000, copies: 1,
      },
      lSystem: {
        axiom: "X", rules: "X=F+[[X]-X]-F[-FX]+X;F=FF", angle: 25, stepLength: 5, iterations: 5, copies: 1,
      },
    };

    return makeLayer({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      params: defaults[type] || defaults.hypotrochoid,
    });
  }

  return { list, load, defaultLayer, makeLayer };
})();
