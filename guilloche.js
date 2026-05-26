/**
 * Guilloche Pattern Generator – Core Mathematics Engine
 * 
 * Implements parametric curve generation for:
 *   - Hypotrochoids    (inner rolling circle)
 *   - Epitrochoids     (outer rolling circle)
 *   - Circular Waves   (radial sine modulation)
 *   - Linear Waves     (horizontal sine bands)
 *   - Lissajous Curves (two-axis sinusoidal)
 *   - Rhodonea / Rose  (polar petal curves)
 *   - Spirals          (Archimedean, logarithmic, Fermat)
 *   - Superformula     (Gielis superformula)
 *   - Maurer Rose      (discrete-sampled rose with line segments)
 *   - Involute         (involute of a circle)
 *
 * All generators return arrays of {x, y} points which are then
 * converted to optimised SVG path strings.
 */

const Guilloche = (() => {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Helper: greatest common divisor (used to compute full revolutions) */
  /* ------------------------------------------------------------------ */
  function gcd(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) { [a, b] = [b, a % b]; }
    return a || 1;
  }

  /* ------------------------------------------------------------------ */
  /*  Helper: compute how many radians are needed for a closed curve     */
  /* ------------------------------------------------------------------ */
  function fullRevolutions(R, r) {
    const g = gcd(Math.round(R), Math.round(r));
    return (2 * Math.PI * Math.round(r)) / g;
  }

  /* ================================================================== */
  /*  CURVE GENERATORS                                                   */
  /* ================================================================== */

  /**
   * Hypotrochoid – circle of radius r rolls INSIDE circle of radius R,
   * pen at distance d from centre of rolling circle.
   *
   * x(θ) = (R−r)cos(θ) + d·cos((R−r)/r · θ)
   * y(θ) = (R−r)sin(θ) − d·sin((R−r)/r · θ)
   */
  function hypotrochoid(params) {
    const {
      R = 100,        // fixed circle radius
      r = 40,         // rolling circle radius
      d = 30,         // pen offset
      steps = 2000,   // point resolution
      rotations = 0,  // extra full rotations (0 = auto-close)
    } = params;

    const maxTheta = rotations > 0
      ? rotations * 2 * Math.PI
      : fullRevolutions(R, r) + 0.01;

    const dt = maxTheta / steps;
    const points = [];
    const diff = R - r;
    const ratio = diff / r;

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      points.push({
        x: diff * Math.cos(t) + d * Math.cos(ratio * t),
        y: diff * Math.sin(t) - d * Math.sin(ratio * t),
      });
    }
    return points;
  }

  /**
   * Epitrochoid – circle of radius r rolls OUTSIDE circle of radius R.
   *
   * x(θ) = (R+r)cos(θ) − d·cos((R+r)/r · θ)
   * y(θ) = (R+r)sin(θ) − d·sin((R+r)/r · θ)
   */
  function epitrochoid(params) {
    const {
      R = 100,
      r = 40,
      d = 30,
      steps = 2000,
      rotations = 0,
    } = params;

    const maxTheta = rotations > 0
      ? rotations * 2 * Math.PI
      : fullRevolutions(R, r) + 0.01;

    const dt = maxTheta / steps;
    const points = [];
    const sum = R + r;
    const ratio = sum / r;

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      points.push({
        x: sum * Math.cos(t) - d * Math.cos(ratio * t),
        y: sum * Math.sin(t) - d * Math.sin(ratio * t),
      });
    }
    return points;
  }

  /**
   * Circular Wave – base circle modulated by layered sine waves.
   *
   * R(θ) = R_base + Σ A_i · sin(f_i · θ + φ_i)
   * x(θ) = R(θ)·cos(θ)
   * y(θ) = R(θ)·sin(θ)
   *
   * waves: [{ amplitude, frequency, phase }]
   */
  function circularWave(params) {
    const {
      baseRadius = 100,
      waves = [{ amplitude: 20, frequency: 8, phase: 0 }],
      steps = 3000,
      loops = 1,         // how many times around the circle
    } = params;

    const maxTheta = loops * 2 * Math.PI;
    const dt = maxTheta / steps;
    const points = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      let r = baseRadius;
      for (const w of waves) {
        r += (w.amplitude || 0) * Math.sin((w.frequency || 1) * t + (w.phase || 0));
      }
      points.push({
        x: r * Math.cos(t),
        y: r * Math.sin(t),
      });
    }
    return points;
  }

  /**
   * Linear Wave – horizontal sine band, useful for borders/stripes.
   *
   * x(t) = t
   * y(t) = yOffset + Σ A_i · sin(f_i · t + φ_i)
   */
  function linearWave(params) {
    const {
      width = 400,
      yOffset = 0,
      waves = [{ amplitude: 20, frequency: 0.05, phase: 0 }],
      steps = 1000,
    } = params;

    const dt = width / steps;
    const points = [];

    for (let i = 0; i <= steps; i++) {
      const t = -width / 2 + i * dt;
      let y = yOffset;
      for (const w of waves) {
        y += (w.amplitude || 0) * Math.sin((w.frequency || 1) * t + (w.phase || 0));
      }
      points.push({ x: t, y });
    }
    return points;
  }

  /* ================================================================== */
  /*  NEW CURVE GENERATORS                                               */
  /* ================================================================== */

  /**
   * Lissajous Curve – two independent sinusoids on X and Y axes.
   *
   * x(t) = A · sin(a·t + δ)
   * y(t) = B · sin(b·t)
   */
  function lissajous(params) {
    const {
      A = 100,          // X amplitude
      B = 100,          // Y amplitude
      a = 3,            // X frequency
      b = 4,            // Y frequency
      delta = Math.PI / 2, // phase shift
      steps = 2000,
    } = params;

    // For rational a/b the curve closes after lcm-based period
    const period = 2 * Math.PI;
    const dt = period / steps;
    const points = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      points.push({
        x: A * Math.sin(a * t + delta),
        y: B * Math.sin(b * t),
      });
    }
    return points;
  }

  /**
   * Rhodonea (Rose Curve) – polar petal pattern.
   *
   * r(θ) = A · cos(k·θ + φ)
   *
   * k = n/d: rational → closed curve.
   *   If d is odd  → curve closes in d·π
   *   If d is even → curve closes in 2d·π
   */
  function rhodonea(params) {
    const {
      amplitude = 120,   // petal radius
      kn = 5,            // numerator of k
      kd = 1,            // denominator of k
      phase = 0,
      steps = 3000,
    } = params;

    const k = kn / (kd || 1);
    // Determine how many radians for full closure
    const dInt = Math.abs(Math.round(kd)) || 1;
    const maxTheta = (dInt % 2 === 0 ? 2 * dInt : dInt) * Math.PI;
    const dt = maxTheta / steps;
    const points = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      const r = amplitude * Math.cos(k * t + phase);
      points.push({
        x: r * Math.cos(t),
        y: r * Math.sin(t),
      });
    }
    return points;
  }

  /**
   * Spiral – Archimedean, Logarithmic, or Fermat.
   *
   * Archimedean:   r = a + b·θ
   * Logarithmic:   r = a · e^(b·θ)
   * Fermat:        r = a · √θ
   */
  function spiral(params) {
    const {
      spiralType = 'archimedean', // 'archimedean' | 'logarithmic' | 'fermat'
      a = 5,
      b = 3,
      maxTurns = 8,
      steps = 3000,
    } = params;

    const maxTheta = maxTurns * 2 * Math.PI;
    const dt = maxTheta / steps;
    const points = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      let r;
      switch (spiralType) {
        case 'logarithmic':
          r = a * Math.exp(b * t / (2 * Math.PI));
          // Clamp to prevent explosion
          if (r > 500) { r = 500; }
          break;
        case 'fermat':
          r = a * Math.sqrt(t);
          break;
        case 'archimedean':
        default:
          r = a + b * t;
          break;
      }
      points.push({
        x: r * Math.cos(t),
        y: r * Math.sin(t),
      });
    }
    return points;
  }

  /**
   * Superformula (Gielis) – generates stars, polygons, organic shapes.
   *
   * r(θ) = [ |cos(mθ/4)/a|^n2  +  |sin(mθ/4)/b|^n3 ] ^ (-1/n1)
   *
   * Scaled by `scale` parameter for practical sizing.
   */
  function superformula(params) {
    const {
      m = 5,             // symmetry order
      n1 = 1,
      n2 = 1,
      n3 = 1,
      sa = 1,            // a parameter (renamed to avoid clash)
      sb = 1,            // b parameter
      scale = 100,
      steps = 3000,
    } = params;

    const maxTheta = 2 * Math.PI;
    const dt = maxTheta / steps;
    const points = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      const mt4 = (m * t) / 4;
      const term1 = Math.pow(Math.abs(Math.cos(mt4) / (sa || 1)), n2);
      const term2 = Math.pow(Math.abs(Math.sin(mt4) / (sb || 1)), n3);
      const sum = term1 + term2;
      const r = sum === 0 ? 0 : Math.pow(sum, -1 / n1) * scale;

      points.push({
        x: r * Math.cos(t),
        y: r * Math.sin(t),
      });
    }
    return points;
  }

  /**
   * Maurer Rose – discrete-sampled rose curve connected by line segments.
   *
   * For each k = 0..360, compute:
   *   θ = k · d  (in degrees, converted to radians)
   *   r = sin(n · θ)
   *
   * Produces stunning geometric star-net patterns.
   */
  function maurerRose(params) {
    const {
      n = 6,            // petal count parameter
      d = 71,           // sampling angle in degrees
      amplitude = 120,
      numPoints = 361,
    } = params;

    const points = [];
    const degToRad = Math.PI / 180;

    for (let k = 0; k <= numPoints; k++) {
      const theta = k * d * degToRad;
      const r = amplitude * Math.sin(n * theta);
      points.push({
        x: r * Math.cos(theta),
        y: r * Math.sin(theta),
      });
    }
    return points;
  }

  /**
   * Involute of a Circle – the curve traced by unwinding a taut string.
   *
   * x(t) = a · (cos(t) + t·sin(t))
   * y(t) = a · (sin(t) − t·cos(t))
   */
  function involute(params) {
    const {
      a = 8,             // base circle radius
      maxTurns = 4,
      steps = 2000,
    } = params;

    const maxTheta = maxTurns * 2 * Math.PI;
    const dt = maxTheta / steps;
    const points = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      points.push({
        x: a * (Math.cos(t) + t * Math.sin(t)),
        y: a * (Math.sin(t) - t * Math.cos(t)),
      });
    }
    return points;
  }

  /* ================================================================== */
  /*  TRANSFORM: Rotate & Multiply                                       */
  /* ================================================================== */

  /**
   * Duplicates a set of points N times, each rotated by 2π/N.
   * Returns an array of point-arrays (one per copy).
   */
  function rotateMultiply(points, copies = 1) {
    if (copies <= 1) return [points];
    const result = [];
    for (let c = 0; c < copies; c++) {
      const angle = (2 * Math.PI * c) / copies;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      result.push(points.map(p => ({
        x: p.x * cos - p.y * sin,
        y: p.x * sin + p.y * cos,
      })));
    }
    return result;
  }

  /* ================================================================== */
  /*  SVG PATH GENERATION                                                */
  /* ================================================================== */

  /**
   * Convert an array of {x,y} points into an SVG path `d` attribute string.
   * Uses M for the first point, then L for subsequent points.
   * Coordinates are rounded to 2 decimals for compact file size.
   */
  function pointsToPath(points) {
    if (!points.length) return '';
    const fmt = (v) => Math.round(v * 100) / 100;
    let d = `M ${fmt(points[0].x)} ${fmt(points[0].y)}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${fmt(points[i].x)} ${fmt(points[i].y)}`;
    }
    return d;
  }

  /**
   * High-level: generate all SVG path strings for a single layer config.
   * Returns an array of path-d strings (one per copy when rotateMultiply > 1).
   */
  function generateLayer(layer) {
    let points;

    switch (layer.type) {
      case 'hypotrochoid':
        points = hypotrochoid(layer.params);
        break;
      case 'epitrochoid':
        points = epitrochoid(layer.params);
        break;
      case 'circularWave':
        points = circularWave(layer.params);
        break;
      case 'linearWave':
        points = linearWave(layer.params);
        break;
      case 'lissajous':
        points = lissajous(layer.params);
        break;
      case 'rhodonea':
        points = rhodonea(layer.params);
        break;
      case 'spiral':
        points = spiral(layer.params);
        break;
      case 'superformula':
        points = superformula(layer.params);
        break;
      case 'maurerRose':
        points = maurerRose(layer.params);
        break;
      case 'involute':
        points = involute(layer.params);
        break;
      default:
        points = hypotrochoid(layer.params);
    }

    const copies = layer.params.copies || 1;
    const groups = rotateMultiply(points, copies);
    return groups.map(g => pointsToPath(g));
  }

  /* ================================================================== */
  /*  PUBLIC API                                                         */
  /* ================================================================== */

  return {
    hypotrochoid,
    epitrochoid,
    circularWave,
    linearWave,
    lissajous,
    rhodonea,
    spiral,
    superformula,
    maurerRose,
    involute,
    rotateMultiply,
    pointsToPath,
    generateLayer,
    gcd,
  };
})();
