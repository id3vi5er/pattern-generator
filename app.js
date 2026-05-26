/**
 * Guilloche Pattern Generator – Application Controller
 *
 * Handles: state management, UI rendering, layer management,
 * parameter controls, zoom/pan, SVG/PNG export, presets.
 */

(() => {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  /* ================================================================== */
  /*  APPLICATION STATE                                                  */
  /* ================================================================== */

  const state = {
    layers: [],
    activeLayerId: null,
    zoom: 1,
    panX: 0,
    panY: 0,
    showGrid: false,
    canvasWidth: 800,
    canvasHeight: 800,
  };

  /* ================================================================== */
  /*  DOM REFERENCES                                                     */
  /* ================================================================== */

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {
    app:            $('#app'),
    sidebar:        $('#sidebar'),
    layerList:      $('#layer-list'),
    paramsPanel:    $('#params-panel'),
    paramsHeader:   $('#params-header'),
    canvasArea:     $('#canvas-area'),
    canvasSvg:      $('#canvas-svg'),
    svgDefs:        $('#svg-defs'),
    svgTransform:   $('#svg-transform'),
    svgRefImage:    $('#svg-ref-image'),
    svgGrid:        $('#svg-grid'),
    svgLayers:      $('#svg-layers'),
    zoomIndicator:  $('#zoom-indicator'),
    statsBar:       $('#stats-bar'),
    presetSelect:   $('#preset-select'),
    toast:          $('#toast'),
    // Buttons
    btnAddLayer:    $('#btn-add-layer'),
    btnExportSvg:   $('#btn-export-svg'),
    btnExportPng:   $('#btn-export-png'),
    btnCopySvg:     $('#btn-copy-svg'),
    btnLoadRef:     $('#btn-load-ref'),
    refImageInput:  $('#ref-image-input'),
    refImageControls: $('#ref-image-controls'),
    btnClearRef:    $('#btn-clear-ref'),
    refOpacitySlider: $('#ref-opacity-slider'),
    refOpacityNum:  $('#ref-opacity-num'),
    refScaleSlider: $('#ref-scale-slider'),
    refScaleNum:    $('#ref-scale-num'),
    btnZoomIn:      $('#btn-zoom-in'),
    btnZoomOut:     $('#btn-zoom-out'),
    btnZoomFit:     $('#btn-zoom-fit'),
    btnToggleGrid:  $('#btn-toggle-grid'),
    btnSidebarToggle: $('#btn-sidebar-toggle'),
    // Modal
    exportModal:    $('#export-modal'),
    exportWidth:    $('#export-width'),
    exportHeight:   $('#export-height'),
    exportBg:       $('#export-bg'),
    exportBgCustom: $('#export-bg-custom'),
    exportBgCustomRow: $('#export-bg-custom-row'),
    btnExportCancel:  $('#btn-export-cancel'),
    btnExportConfirm: $('#btn-export-confirm'),
  };

  /* ================================================================== */
  /*  TOAST                                                              */
  /* ================================================================== */

  let toastTimer = null;
  function showToast(msg, duration = 2000) {
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => dom.toast.classList.remove('show'), duration);
  }

  /* ================================================================== */
  /*  PRESET POPULATION                                                  */
  /* ================================================================== */

  function populatePresets() {
    Presets.list().forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      dom.presetSelect.appendChild(opt);
    });
  }

  function loadPreset(name) {
    const preset = Presets.load(name);
    if (!preset) return;
    state.layers = preset.layers;
    state.activeLayerId = state.layers.length ? state.layers[0].id : null;
    resetView();
    renderAll();
    showToast(`Loaded preset: ${name}`);
  }

  /* ================================================================== */
  /*  LAYER MANAGEMENT                                                   */
  /* ================================================================== */

  function addLayer(type = 'hypotrochoid') {
    const layer = Presets.defaultLayer(type);
    state.layers.push(layer);
    state.activeLayerId = layer.id;
    renderAll();
  }

  function removeLayer(id) {
    state.layers = state.layers.filter(l => l.id !== id);
    if (state.activeLayerId === id) {
      state.activeLayerId = state.layers.length ? state.layers[0].id : null;
    }
    renderAll();
  }

  function duplicateLayer(id) {
    const src = state.layers.find(l => l.id === id);
    if (!src) return;
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = crypto.randomUUID();
    copy.name = src.name + ' (copy)';
    const idx = state.layers.indexOf(src);
    state.layers.splice(idx + 1, 0, copy);
    state.activeLayerId = copy.id;
    renderAll();
  }

  function toggleLayerVisibility(id) {
    const layer = state.layers.find(l => l.id === id);
    if (layer) {
      layer.visible = !layer.visible;
      renderAll();
    }
  }

  function getActiveLayer() {
    return state.layers.find(l => l.id === state.activeLayerId) || null;
  }

  /* ================================================================== */
  /*  RENDER LAYER LIST                                                  */
  /* ================================================================== */

  function renderLayerList() {
    dom.layerList.innerHTML = '';

    if (!state.layers.length) {
      dom.layerList.innerHTML = '<div class="empty-state">No layers yet. Click + to add one.</div>';
      return;
    }

    state.layers.forEach(layer => {
      const el = document.createElement('div');
      el.className = 'layer-item' + (layer.id === state.activeLayerId ? ' active' : '');
      el.dataset.id = layer.id;

      const dot = document.createElement('span');
      dot.className = 'layer-color-dot';
      dot.style.background = layer.style.strokeColor;

      const nameSpan = document.createElement('span');
      nameSpan.className = 'layer-name';
      nameSpan.textContent = layer.name;

      const visBtn = document.createElement('button');
      visBtn.className = 'layer-btn';
      visBtn.innerHTML = layer.visible ? '&#128065;' : '&#128064;';
      visBtn.title = layer.visible ? 'Hide layer' : 'Show layer';
      visBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); });

      const dupBtn = document.createElement('button');
      dupBtn.className = 'layer-btn';
      dupBtn.innerHTML = '&#10697;';
      dupBtn.title = 'Duplicate layer';
      dupBtn.addEventListener('click', (e) => { e.stopPropagation(); duplicateLayer(layer.id); });

      const delBtn = document.createElement('button');
      delBtn.className = 'layer-btn danger';
      delBtn.innerHTML = '&#10005;';
      delBtn.title = 'Remove layer';
      delBtn.addEventListener('click', (e) => { e.stopPropagation(); removeLayer(layer.id); });

      el.appendChild(dot);
      el.appendChild(nameSpan);
      el.appendChild(visBtn);
      el.appendChild(dupBtn);
      el.appendChild(delBtn);

      el.addEventListener('click', () => {
        state.activeLayerId = layer.id;
        renderLayerList();
        renderParamsPanel();
      });

      dom.layerList.appendChild(el);
    });
  }

  /* ================================================================== */
  /*  RENDER PARAMETERS PANEL                                            */
  /* ================================================================== */

  function renderParamsPanel() {
    const layer = getActiveLayer();
    dom.paramsPanel.innerHTML = '';

    if (!layer) {
      dom.paramsPanel.innerHTML = '<div class="empty-state">Select or add a layer to edit parameters.</div>';
      return;
    }

    // -- Curve Type Selector --
    dom.paramsPanel.appendChild(buildParamGroup('Curve Type', [
      buildSelectRow('Type', layer.type, [
        { value: 'hypotrochoid', label: 'Hypotrochoid' },
        { value: 'epitrochoid',  label: 'Epitrochoid' },
        { value: 'circularWave', label: 'Circular Wave' },
        { value: 'linearWave',   label: 'Linear Wave' },
        { value: 'lissajous',    label: 'Lissajous' },
        { value: 'rhodonea',     label: 'Rhodonea / Rose' },
        { value: 'spiral',       label: 'Spiral' },
        { value: 'superformula', label: 'Superformula' },
        { value: 'maurerRose',   label: 'Maurer Rose' },
        { value: 'involute',     label: 'Involute' },
        { value: 'harmonograph', label: 'Harmonograph' },
        { value: 'torusKnot',    label: 'Torus Knot' },
        { value: 'butterflyCurve',label: 'Butterfly Curve' },
        { value: 'lSystem',      label: 'L-System (Fractal)' },
      ], (val) => {
        // Switch type and reset params to defaults
        const def = Presets.defaultLayer(val);
        layer.type = val;
        layer.params = def.params;
        renderParamsPanel();
        renderCanvas();
      }),
      buildNameRow('Name', layer.name, (val) => {
        layer.name = val;
        renderLayerList();
      }),
    ]));

    // -- Mathematical Parameters --
    const mathRows = [];
    const p = layer.params;

    switch (layer.type) {
      case 'hypotrochoid':
      case 'epitrochoid':
        mathRows.push(buildSliderRow('R (Fixed)', p.R, 10, 300, 1, v => { p.R = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('r (Rolling)', p.r, 1, 200, 1, v => { p.r = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('d (Pen)', p.d, 1, 200, 1, v => { p.d = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Steps', p.steps, 200, 8000, 100, v => { p.steps = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Copies', p.copies || 1, 1, 24, 1, v => { p.copies = v; scheduleRender(); }));
        break;

      case 'circularWave':
        mathRows.push(buildSliderRow('Base Radius', p.baseRadius, 10, 300, 1, v => { p.baseRadius = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Loops', p.loops || 1, 1, 20, 1, v => { p.loops = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Steps', p.steps, 500, 8000, 100, v => { p.steps = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Copies', p.copies || 1, 1, 24, 1, v => { p.copies = v; scheduleRender(); }));
        // Wave sub-entries
        mathRows.push(buildWaveList(p.waves, () => { scheduleRender(); renderParamsPanel(); }));
        break;

      case 'linearWave':
        mathRows.push(buildSliderRow('Width', p.width, 100, 1000, 10, v => { p.width = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Y Offset', p.yOffset, -200, 200, 1, v => { p.yOffset = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Steps', p.steps, 200, 4000, 50, v => { p.steps = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Copies', p.copies || 1, 1, 24, 1, v => { p.copies = v; scheduleRender(); }));
        mathRows.push(buildWaveList(p.waves, () => { scheduleRender(); renderParamsPanel(); }));
        break;

      case 'lissajous':
        mathRows.push(buildSliderRow('A (X Amp)', p.A, 10, 300, 1, v => { p.A = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('B (Y Amp)', p.B, 10, 300, 1, v => { p.B = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('a (X Freq)', p.a, 1, 20, 1, v => { p.a = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('b (Y Freq)', p.b, 1, 20, 1, v => { p.b = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Phase (d)', p.delta, 0, 6.28, 0.01, v => { p.delta = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Steps', p.steps, 500, 8000, 100, v => { p.steps = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Copies', p.copies || 1, 1, 24, 1, v => { p.copies = v; scheduleRender(); }));
        break;

      case 'rhodonea':
        mathRows.push(buildSliderRow('Amplitude', p.amplitude, 10, 300, 1, v => { p.amplitude = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('k Numerator', p.kn, 1, 20, 1, v => { p.kn = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('k Denominator', p.kd, 1, 12, 1, v => { p.kd = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Phase', p.phase, 0, 6.28, 0.05, v => { p.phase = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Steps', p.steps, 500, 8000, 100, v => { p.steps = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Copies', p.copies || 1, 1, 24, 1, v => { p.copies = v; scheduleRender(); }));
        break;

      case 'spiral':
        mathRows.push(buildSelectRow('Spiral Type', p.spiralType, [
          { value: 'archimedean', label: 'Archimedean' },
          { value: 'logarithmic', label: 'Logarithmic' },
          { value: 'fermat', label: 'Fermat' },
        ], v => { p.spiralType = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('a', p.a, 0.5, 30, 0.5, v => { p.a = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('b', p.b, 0.01, 10, 0.01, v => { p.b = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Turns', p.maxTurns, 1, 30, 1, v => { p.maxTurns = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Steps', p.steps, 500, 8000, 100, v => { p.steps = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Copies', p.copies || 1, 1, 24, 1, v => { p.copies = v; scheduleRender(); }));
        break;

      case 'superformula':
        mathRows.push(buildSliderRow('m (Symmetry)', p.m, 1, 20, 1, v => { p.m = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('n1', p.n1, 0.05, 40, 0.05, v => { p.n1 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('n2', p.n2, 0.05, 40, 0.05, v => { p.n2 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('n3', p.n3, 0.05, 40, 0.05, v => { p.n3 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('a', p.sa, 0.1, 5, 0.1, v => { p.sa = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('b', p.sb, 0.1, 5, 0.1, v => { p.sb = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Scale', p.scale, 10, 300, 1, v => { p.scale = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Steps', p.steps, 500, 8000, 100, v => { p.steps = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Copies', p.copies || 1, 1, 24, 1, v => { p.copies = v; scheduleRender(); }));
        break;

      case 'maurerRose':
        mathRows.push(buildSliderRow('n (Petals)', p.n, 1, 20, 1, v => { p.n = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('d (Angle)', p.d, 1, 180, 1, v => { p.d = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Amplitude', p.amplitude, 10, 300, 1, v => { p.amplitude = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Points', p.numPoints, 100, 720, 1, v => { p.numPoints = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Copies', p.copies || 1, 1, 24, 1, v => { p.copies = v; scheduleRender(); }));
        break;

      case 'involute':
        mathRows.push(buildSliderRow('a (Radius)', p.a, 1, 30, 0.5, v => { p.a = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Turns', p.maxTurns, 1, 12, 1, v => { p.maxTurns = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Steps', p.steps, 500, 6000, 100, v => { p.steps = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Copies', p.copies || 1, 1, 24, 1, v => { p.copies = v; scheduleRender(); }));
        break;

      case 'harmonograph':
        mathRows.push(buildSliderRow('Amp 1', p.A1, 10, 300, 1, v => { p.A1 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Freq 1', p.f1, 0.01, 10, 0.01, v => { p.f1 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Phase 1', p.p1, 0, 6.28, 0.01, v => { p.p1 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Damp 1', p.d1, 0, 0.05, 0.0001, v => { p.d1 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Amp 2', p.A2, 10, 300, 1, v => { p.A2 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Freq 2', p.f2, 0.01, 10, 0.01, v => { p.f2 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Phase 2', p.p2, 0, 6.28, 0.01, v => { p.p2 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Damp 2', p.d2, 0, 0.05, 0.0001, v => { p.d2 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Amp 3', p.A3, 10, 300, 1, v => { p.A3 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Freq 3', p.f3, 0.01, 10, 0.01, v => { p.f3 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Phase 3', p.p3, 0, 6.28, 0.01, v => { p.p3 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Damp 3', p.d3, 0, 0.05, 0.0001, v => { p.d3 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Amp 4', p.A4, 10, 300, 1, v => { p.A4 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Freq 4', p.f4, 0.01, 10, 0.01, v => { p.f4 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Phase 4', p.p4, 0, 6.28, 0.01, v => { p.p4 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Damp 4', p.d4, 0, 0.05, 0.0001, v => { p.d4 = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Max Time', p.maxT, 10, 500, 1, v => { p.maxT = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Steps', p.steps, 1000, 30000, 1000, v => { p.steps = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Copies', p.copies || 1, 1, 24, 1, v => { p.copies = v; scheduleRender(); }));
        break;

      case 'torusKnot':
        mathRows.push(buildSliderRow('p (Axis)', p.p, 1, 20, 1, v => { p.p = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('q (Hole)', p.q, 1, 20, 1, v => { p.q = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('R (Major)', p.R, 10, 300, 1, v => { p.R = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('r (Minor)', p.r, 10, 200, 1, v => { p.r = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Steps', p.steps, 500, 8000, 100, v => { p.steps = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Copies', p.copies || 1, 1, 24, 1, v => { p.copies = v; scheduleRender(); }));
        break;

      case 'butterflyCurve':
        mathRows.push(buildSliderRow('Scale', p.scale, 5, 100, 1, v => { p.scale = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Steps', p.steps, 500, 12000, 100, v => { p.steps = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Copies', p.copies || 1, 1, 24, 1, v => { p.copies = v; scheduleRender(); }));
        break;

      case 'lSystem':
        mathRows.push(buildTextRow('Axiom', p.axiom, v => { p.axiom = v; scheduleRender(); }));
        mathRows.push(buildTextRow('Rules', p.rules, v => { p.rules = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Angle', p.angle, 1, 180, 0.5, v => { p.angle = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Step Length', p.stepLength, 1, 50, 0.5, v => { p.stepLength = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Iterations', p.iterations, 1, 8, 1, v => { p.iterations = v; scheduleRender(); }));
        mathRows.push(buildSliderRow('Copies', p.copies || 1, 1, 24, 1, v => { p.copies = v; scheduleRender(); }));
        break;
    }
    dom.paramsPanel.appendChild(buildParamGroup('Math Parameters', mathRows));

    // -- Styling --
    const styleRows = [];
    const s = layer.style;

    styleRows.push(buildColorRow('Stroke Color', s.strokeColor, v => { s.strokeColor = v; scheduleRender(); }));

    // Gradient toggle
    styleRows.push(buildCheckboxRow('Use Gradient', !!s.gradient, (checked) => {
      if (checked) {
        s.gradient = { start: s.strokeColor, end: '#ff00ff' };
      } else {
        s.gradient = null;
      }
      renderParamsPanel();
      scheduleRender();
    }));

    if (s.gradient) {
      styleRows.push(buildColorRow('Gradient Start', s.gradient.start, v => { s.gradient.start = v; scheduleRender(); }));
      styleRows.push(buildColorRow('Gradient End', s.gradient.end, v => { s.gradient.end = v; scheduleRender(); }));
    }

    styleRows.push(buildSliderRow('Stroke Width', s.strokeWidth, 0.1, 5, 0.1, v => { s.strokeWidth = v; scheduleRender(); }));
    styleRows.push(buildSliderRow('Opacity', s.opacity, 0, 1, 0.05, v => { s.opacity = v; scheduleRender(); }));
    styleRows.push(buildTextRow('Dash Array', s.dashArray || '', v => { s.dashArray = v; scheduleRender(); }));
    styleRows.push(buildSelectRow('Blend Mode', s.blendMode, [
      { value: 'normal', label: 'Normal' },
      { value: 'screen', label: 'Screen' },
      { value: 'multiply', label: 'Multiply' },
      { value: 'overlay', label: 'Overlay' },
      { value: 'lighten', label: 'Lighten' },
      { value: 'color-dodge', label: 'Color Dodge' },
    ], v => { s.blendMode = v; scheduleRender(); }));

    dom.paramsPanel.appendChild(buildParamGroup('Styling', styleRows));
    
    // -- Transform --
    // Ensure layer.transform exists for older presets
    if (!layer.transform) {
      layer.transform = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
    }
    const tRows = [];
    const tr = layer.transform;
    tRows.push(buildSliderRow('Offset X', tr.x, -500, 500, 1, v => { tr.x = v; scheduleRender(); }));
    tRows.push(buildSliderRow('Offset Y', tr.y, -500, 500, 1, v => { tr.y = v; scheduleRender(); }));
    tRows.push(buildSliderRow('Rotation', tr.rotation, -360, 360, 1, v => { tr.rotation = v; scheduleRender(); }));
    tRows.push(buildSliderRow('Scale X', tr.scaleX, -5, 5, 0.05, v => { tr.scaleX = v; scheduleRender(); }));
    tRows.push(buildSliderRow('Scale Y', tr.scaleY, -5, 5, 0.05, v => { tr.scaleY = v; scheduleRender(); }));
    dom.paramsPanel.appendChild(buildParamGroup('Transform', tRows));
  }

  /* ================================================================== */
  /*  UI BUILDERS                                                        */
  /* ================================================================== */

  function buildParamGroup(title, children) {
    const group = document.createElement('div');
    group.className = 'param-group';
    const t = document.createElement('div');
    t.className = 'param-group-title';
    t.textContent = title;
    group.appendChild(t);
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c) group.appendChild(c);
    });
    return group;
  }

  function buildSliderRow(label, value, min, max, step, onChange) {
    const row = document.createElement('div');
    row.className = 'control-row';

    const lbl = document.createElement('label');
    lbl.textContent = label;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;

    const num = document.createElement('input');
    num.type = 'number';
    num.min = min;
    num.max = max;
    num.step = step;
    num.value = value;

    // Sync slider → number input
    slider.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      num.value = v;
      onChange(v);
    });

    // Sync number input → slider
    num.addEventListener('change', () => {
      let v = parseFloat(num.value);
      if (isNaN(v)) v = min;
      v = Math.max(min, Math.min(max, v));
      num.value = v;
      slider.value = v;
      onChange(v);
    });

    // Mouse wheel on slider hover: adjust value by scrolling
    row.addEventListener('wheel', (e) => {
      // Only act when hovering over the slider or its row
      e.preventDefault();
      e.stopPropagation();
      const currentStep = parseFloat(step) || 1;
      const direction = e.deltaY < 0 ? 1 : -1;
      let current = parseFloat(slider.value);
      let next = current + direction * currentStep;
      next = Math.max(parseFloat(min), Math.min(parseFloat(max), next));
      // Round to step precision to avoid floating point drift
      const precision = currentStep < 1 ? Math.ceil(-Math.log10(currentStep)) : 0;
      next = parseFloat(next.toFixed(precision));
      slider.value = next;
      num.value = next;
      onChange(next);
    }, { passive: false });

    row.appendChild(lbl);
    row.appendChild(slider);
    row.appendChild(num);
    return row;
  }

  function buildColorRow(label, value, onChange) {
    const row = document.createElement('div');
    row.className = 'control-row';
    row.style.gridTemplateColumns = '90px 32px 1fr';

    const lbl = document.createElement('label');
    lbl.textContent = label;

    const picker = document.createElement('input');
    picker.type = 'color';
    picker.value = value;

    const hex = document.createElement('input');
    hex.type = 'text';
    hex.value = value;
    hex.style.cssText = 'font-size:11px;padding:4px 6px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;color:var(--text-primary);outline:none;';

    picker.addEventListener('input', () => {
      hex.value = picker.value;
      onChange(picker.value);
    });

    hex.addEventListener('change', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) {
        picker.value = hex.value;
        onChange(hex.value);
      }
    });

    row.appendChild(lbl);
    row.appendChild(picker);
    row.appendChild(hex);
    return row;
  }

  function buildSelectRow(label, value, options, onChange) {
    const row = document.createElement('div');
    row.className = 'control-row';
    row.style.gridTemplateColumns = '90px 1fr';

    const lbl = document.createElement('label');
    lbl.textContent = label;

    const sel = document.createElement('select');
    options.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.label;
      if (o.value === value) opt.selected = true;
      sel.appendChild(opt);
    });

    sel.addEventListener('change', () => onChange(sel.value));

    row.appendChild(lbl);
    row.appendChild(sel);
    return row;
  }

  function buildTextRow(label, value, onChange) {
    const row = document.createElement('div');
    row.className = 'control-row';
    row.style.gridTemplateColumns = '90px 1fr';

    const lbl = document.createElement('label');
    lbl.textContent = label;

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = value;
    inp.placeholder = 'e.g. 4 2';
    inp.style.cssText = 'padding:4px 6px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;color:var(--text-primary);font-size:11px;outline:none;';

    inp.addEventListener('change', () => onChange(inp.value));

    row.appendChild(lbl);
    row.appendChild(inp);
    return row;
  }

  function buildNameRow(label, value, onChange) {
    const row = document.createElement('div');
    row.className = 'control-row';
    row.style.gridTemplateColumns = '90px 1fr';

    const lbl = document.createElement('label');
    lbl.textContent = label;

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = value;
    inp.style.cssText = 'padding:4px 6px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;color:var(--text-primary);font-size:11px;outline:none;';

    inp.addEventListener('change', () => onChange(inp.value));

    row.appendChild(lbl);
    row.appendChild(inp);
    return row;
  }

  function buildCheckboxRow(label, checked, onChange) {
    const row = document.createElement('div');
    row.className = 'control-row';
    row.style.gridTemplateColumns = '90px 1fr';

    const lbl = document.createElement('label');
    lbl.textContent = label;

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = checked;
    cb.style.cssText = 'width:16px;height:16px;cursor:pointer;accent-color:var(--accent);';

    cb.addEventListener('change', () => onChange(cb.checked));

    row.appendChild(lbl);
    row.appendChild(cb);
    return row;
  }

  /* ---- Wave List Builder ---- */
  function buildWaveList(waves, onUpdate) {
    const container = document.createElement('div');

    waves.forEach((w, idx) => {
      const entry = document.createElement('div');
      entry.className = 'wave-entry';

      const header = document.createElement('div');
      header.className = 'wave-header';
      header.innerHTML = `<span>Wave ${idx + 1}</span>`;

      const delBtn = document.createElement('button');
      delBtn.className = 'layer-btn danger';
      delBtn.innerHTML = '&#10005;';
      delBtn.title = 'Remove wave';
      delBtn.addEventListener('click', () => { waves.splice(idx, 1); onUpdate(); });
      header.appendChild(delBtn);
      entry.appendChild(header);

      entry.appendChild(buildSliderRow('Amplitude', w.amplitude, 0, 80, 0.5, v => { w.amplitude = v; onUpdate(); }));
      entry.appendChild(buildSliderRow('Frequency', w.frequency, 0.01, 100, 0.5, v => { w.frequency = v; onUpdate(); }));
      entry.appendChild(buildSliderRow('Phase', w.phase, 0, 6.28, 0.05, v => { w.phase = v; onUpdate(); }));

      container.appendChild(entry);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'btn';
    addBtn.textContent = '+ Add Wave';
    addBtn.style.marginTop = '4px';
    addBtn.style.width = '100%';
    addBtn.addEventListener('click', () => {
      waves.push({ amplitude: 10, frequency: 6, phase: 0 });
      onUpdate();
    });
    container.appendChild(addBtn);

    return container;
  }

  /* ================================================================== */
  /*  SVG CANVAS RENDERING                                               */
  /* ================================================================== */

  let renderRAF = null;

  function scheduleRender() {
    if (renderRAF) return;
    renderRAF = requestAnimationFrame(() => {
      renderRAF = null;
      renderCanvas();
    });
  }

  function renderCanvas() {
    const t0 = performance.now();

    // Clear
    dom.svgDefs.innerHTML = '';
    dom.svgLayers.innerHTML = '';

    let totalPoints = 0;

    state.layers.forEach((layer) => {
      if (!layer.visible) return;

      const paths = Guilloche.generateLayer(layer);
      totalPoints += paths.reduce((sum, d) => sum + (d.match(/ L /g) || []).length + 1, 0);

      // Gradient definition if needed
      let strokeRef = layer.style.strokeColor;
      if (layer.style.gradient) {
        const gradId = 'grad-' + layer.id;
        const grad = document.createElementNS(SVG_NS, 'linearGradient');
        grad.id = gradId;
        grad.setAttribute('gradientUnits', 'userSpaceOnUse');
        // Simple horizontal gradient
        grad.setAttribute('x1', '-150');
        grad.setAttribute('y1', '0');
        grad.setAttribute('x2', '150');
        grad.setAttribute('y2', '0');

        const stop1 = document.createElementNS(SVG_NS, 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', layer.style.gradient.start);
        grad.appendChild(stop1);

        const stop2 = document.createElementNS(SVG_NS, 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', layer.style.gradient.end);
        grad.appendChild(stop2);

        dom.svgDefs.appendChild(grad);
        strokeRef = `url(#${gradId})`;
      }

      paths.forEach(d => {
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', strokeRef);
        path.setAttribute('stroke-width', layer.style.strokeWidth);
        path.setAttribute('opacity', layer.style.opacity);
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        
        // Apply transform if present
        if (layer.transform) {
          const tx = layer.transform.x || 0;
          const ty = layer.transform.y || 0;
          const rot = layer.transform.rotation || 0;
          const sx = layer.transform.scaleX !== undefined ? layer.transform.scaleX : 1;
          const sy = layer.transform.scaleY !== undefined ? layer.transform.scaleY : 1;
          
          if (tx !== 0 || ty !== 0 || rot !== 0 || sx !== 1 || sy !== 1) {
             path.setAttribute('transform', `translate(${tx}, ${ty}) rotate(${rot}) scale(${sx}, ${sy})`);
          }
        }

        if (layer.style.dashArray) {
          path.setAttribute('stroke-dasharray', layer.style.dashArray);
        }
        if (layer.style.blendMode && layer.style.blendMode !== 'normal') {
          path.style.mixBlendMode = layer.style.blendMode;
        }
        dom.svgLayers.appendChild(path);
      });
    });

    const dt = (performance.now() - t0).toFixed(1);
    dom.statsBar.textContent = `Points: ${totalPoints.toLocaleString()} \u00B7 Render: ${dt} ms`;

    updateTransform();
    renderGrid();
  }

  /* ================================================================== */
  /*  GRID                                                               */
  /* ================================================================== */

  function renderGrid() {
    dom.svgGrid.innerHTML = '';
    if (!state.showGrid) return;

    const spacing = 50;
    const range = 500;

    for (let i = -range; i <= range; i += spacing) {
      const h = document.createElementNS(SVG_NS, 'line');
      h.setAttribute('x1', -range); h.setAttribute('y1', i);
      h.setAttribute('x2', range);  h.setAttribute('y2', i);
      h.setAttribute('stroke', '#2a2d42');
      h.setAttribute('stroke-width', 0.5);
      dom.svgGrid.appendChild(h);

      const v = document.createElementNS(SVG_NS, 'line');
      v.setAttribute('x1', i); v.setAttribute('y1', -range);
      v.setAttribute('x2', i); v.setAttribute('y2', range);
      v.setAttribute('stroke', '#2a2d42');
      v.setAttribute('stroke-width', 0.5);
      dom.svgGrid.appendChild(v);
    }

    // Centre cross
    const cx = document.createElementNS(SVG_NS, 'line');
    cx.setAttribute('x1', -range); cx.setAttribute('y1', 0);
    cx.setAttribute('x2', range);  cx.setAttribute('y2', 0);
    cx.setAttribute('stroke', '#3d4166');
    cx.setAttribute('stroke-width', 0.8);
    dom.svgGrid.appendChild(cx);

    const cy = document.createElementNS(SVG_NS, 'line');
    cy.setAttribute('x1', 0); cy.setAttribute('y1', -range);
    cy.setAttribute('x2', 0); cy.setAttribute('y2', range);
    cy.setAttribute('stroke', '#3d4166');
    cy.setAttribute('stroke-width', 0.8);
    dom.svgGrid.appendChild(cy);
  }

  /* ================================================================== */
  /*  ZOOM & PAN                                                         */
  /* ================================================================== */

  function updateTransform() {
    const rect = dom.canvasArea.getBoundingClientRect();
    const cx = rect.width / 2 + state.panX;
    const cy = rect.height / 2 + state.panY;
    dom.svgTransform.setAttribute('transform',
      `translate(${cx}, ${cy}) scale(${state.zoom})`
    );
    dom.zoomIndicator.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  function resetView() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    updateTransform();
  }

  function zoomBy(factor) {
    state.zoom = Math.max(0.05, Math.min(20, state.zoom * factor));
    updateTransform();
  }

  // Mouse wheel zoom
  dom.canvasArea.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    zoomBy(factor);
  }, { passive: false });

  // Pan
  let isPanning = false, panStart = { x: 0, y: 0 };

  dom.canvasArea.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    isPanning = true;
    panStart = { x: e.clientX - state.panX, y: e.clientY - state.panY };
    dom.canvasArea.classList.add('dragging');
    dom.canvasArea.setPointerCapture(e.pointerId);
  });

  dom.canvasArea.addEventListener('pointermove', (e) => {
    if (!isPanning) return;
    state.panX = e.clientX - panStart.x;
    state.panY = e.clientY - panStart.y;
    updateTransform();
  });

  dom.canvasArea.addEventListener('pointerup', () => {
    isPanning = false;
    dom.canvasArea.classList.remove('dragging');
  });

  /* ================================================================== */
  /*  SVG EXPORT                                                         */
  /* ================================================================== */

  function buildExportSvg(width, height, bgColor) {
    // Calculate bounding box from all visible layers
    let minX = -200, minY = -200, maxX = 200, maxY = 200;

    // Use current canvas content bounding box
    const bbox = dom.svgLayers.getBBox();
    if (bbox.width > 0) {
      const pad = 20;
      minX = bbox.x - pad;
      minY = bbox.y - pad;
      maxX = bbox.x + bbox.width + pad;
      maxY = bbox.y + bbox.height + pad;
    }

    const vbW = maxX - minX;
    const vbH = maxY - minY;

    let svgStr = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    svgStr += `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX} ${minY} ${vbW} ${vbH}">\n`;

    // Defs (gradients)
    if (dom.svgDefs.children.length) {
      svgStr += `  <defs>\n    ${dom.svgDefs.innerHTML}\n  </defs>\n`;
    }

    // Background
    if (bgColor && bgColor !== 'transparent') {
      svgStr += `  <rect x="${minX}" y="${minY}" width="${vbW}" height="${vbH}" fill="${bgColor}"/>\n`;
    }

    // Paths
    svgStr += `  ${dom.svgLayers.innerHTML}\n`;
    svgStr += `</svg>`;

    return svgStr;
  }

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportSvg() {
    const w = parseInt(dom.exportWidth.value) || 800;
    const h = parseInt(dom.exportHeight.value) || 800;
    let bg = dom.exportBg.value;
    if (bg === 'custom') bg = dom.exportBgCustom.value;

    const svg = buildExportSvg(w, h, bg);
    downloadFile(svg, 'guilloche-pattern.svg', 'image/svg+xml');
    dom.exportModal.classList.remove('open');
    showToast('SVG exported successfully!');
  }

  function exportPng() {
    const w = 2048;
    const h = 2048;
    const svgStr = buildExportSvg(w, h, '#0f1117');

    const img = new Image();
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);

      canvas.toBlob((pngBlob) => {
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'guilloche-pattern.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pngUrl);
        showToast('PNG exported (2048x2048)');
      }, 'image/png');
    };

    img.src = url;
  }

  function copySvgToClipboard() {
    const svg = buildExportSvg(800, 800, 'transparent');
    navigator.clipboard.writeText(svg).then(() => {
      showToast('SVG copied to clipboard!');
    }).catch(() => {
      showToast('Copy failed – check browser permissions.');
    });
  }

  /* ================================================================== */
  /*  RENDER ALL (convenience)                                           */
  /* ================================================================== */

  function renderAll() {
    renderLayerList();
    renderParamsPanel();
    renderCanvas();
  }

  /* ================================================================== */
  /*  EVENT BINDING                                                      */
  /* ================================================================== */

  function bindEvents() {
    // Add layer
    dom.btnAddLayer.addEventListener('click', () => addLayer('hypotrochoid'));

    // Preset
    dom.presetSelect.addEventListener('change', () => {
      const name = dom.presetSelect.value;
      if (name) loadPreset(name);
      dom.presetSelect.value = '';
    });

    // Zoom buttons
    dom.btnZoomIn.addEventListener('click', () => zoomBy(1.25));
    dom.btnZoomOut.addEventListener('click', () => zoomBy(0.8));
    dom.btnZoomFit.addEventListener('click', resetView);

    // Grid toggle
    dom.btnToggleGrid.addEventListener('click', () => {
      state.showGrid = !state.showGrid;
      dom.btnToggleGrid.classList.toggle('active', state.showGrid);
      renderGrid();
    });

    // Reference Image
    let refImageBaseWidth = 0;
    let refImageBaseHeight = 0;

    function updateRefImage() {
      const scale = parseFloat(dom.refScaleSlider.value);
      const w = refImageBaseWidth * scale;
      const h = refImageBaseHeight * scale;
      dom.svgRefImage.setAttribute('width', w);
      dom.svgRefImage.setAttribute('height', h);
      dom.svgRefImage.setAttribute('x', -w / 2);
      dom.svgRefImage.setAttribute('y', -h / 2);
      dom.svgRefImage.setAttribute('opacity', dom.refOpacitySlider.value);
    }

    dom.btnLoadRef.addEventListener('click', () => {
      if (dom.svgRefImage.style.display === 'none' || !dom.svgRefImage.getAttribute('href')) {
        dom.refImageInput.click();
      } else {
        // Toggle controls if image is already loaded
        const isHidden = dom.refImageControls.style.display === 'none';
        dom.refImageControls.style.display = isHidden ? 'block' : 'none';
        dom.btnLoadRef.classList.toggle('active', isHidden);
      }
    });

    dom.refImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target.result;
        const img = new Image();
        img.onload = () => {
          refImageBaseWidth = img.width;
          refImageBaseHeight = img.height;
          dom.svgRefImage.setAttribute('href', url);
          dom.svgRefImage.style.display = 'block';
          dom.refImageControls.style.display = 'block';
          dom.btnLoadRef.classList.add('active');
          dom.refScaleSlider.value = 1;
          dom.refScaleNum.value = 1;
          updateRefImage();
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
      dom.refImageInput.value = ''; // reset
    });

    dom.btnClearRef.addEventListener('click', () => {
      dom.svgRefImage.removeAttribute('href');
      dom.svgRefImage.style.display = 'none';
      dom.refImageControls.style.display = 'none';
      dom.btnLoadRef.classList.remove('active');
    });

    dom.refOpacitySlider.addEventListener('input', () => {
      dom.refOpacityNum.value = dom.refOpacitySlider.value;
      updateRefImage();
    });
    dom.refOpacityNum.addEventListener('change', () => {
      dom.refOpacitySlider.value = dom.refOpacityNum.value;
      updateRefImage();
    });

    dom.refScaleSlider.addEventListener('input', () => {
      dom.refScaleNum.value = dom.refScaleSlider.value;
      updateRefImage();
    });
    dom.refScaleNum.addEventListener('change', () => {
      dom.refScaleSlider.value = dom.refScaleNum.value;
      updateRefImage();
    });

    // Export SVG (opens modal)
    dom.btnExportSvg.addEventListener('click', () => {
      dom.exportModal.classList.add('open');
    });

    // Export modal controls
    dom.exportBg.addEventListener('change', () => {
      dom.exportBgCustomRow.style.display = dom.exportBg.value === 'custom' ? '' : 'none';
    });
    dom.btnExportCancel.addEventListener('click', () => dom.exportModal.classList.remove('open'));
    dom.btnExportConfirm.addEventListener('click', exportSvg);
    dom.exportModal.addEventListener('click', (e) => {
      if (e.target === dom.exportModal) dom.exportModal.classList.remove('open');
    });

    // Export PNG
    dom.btnExportPng.addEventListener('click', exportPng);

    // Copy SVG
    dom.btnCopySvg.addEventListener('click', copySvgToClipboard);

    // Mobile sidebar toggle
    dom.btnSidebarToggle.addEventListener('click', () => {
      dom.sidebar.classList.toggle('open');
    });

    // Window resize – update transform
    window.addEventListener('resize', () => updateTransform());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+E = Export SVG
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        dom.exportModal.classList.add('open');
      }
      // Ctrl+D = Duplicate active layer
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        if (state.activeLayerId) duplicateLayer(state.activeLayerId);
      }
      // Delete = Remove active layer
      if (e.key === 'Delete' && document.activeElement.tagName === 'BODY') {
        if (state.activeLayerId) removeLayer(state.activeLayerId);
      }
      // + / - zoom
      if (e.key === '+' && !e.ctrlKey && document.activeElement.tagName === 'BODY') zoomBy(1.15);
      if (e.key === '-' && !e.ctrlKey && document.activeElement.tagName === 'BODY') zoomBy(0.87);
      // 0 = reset view
      if (e.key === '0' && !e.ctrlKey && document.activeElement.tagName === 'BODY') resetView();
      // G = toggle grid
      if (e.key === 'g' && !e.ctrlKey && document.activeElement.tagName === 'BODY') {
        state.showGrid = !state.showGrid;
        dom.btnToggleGrid.classList.toggle('active', state.showGrid);
        renderGrid();
      }
    });
  }

  /* ================================================================== */
  /*  INITIALISATION                                                     */
  /* ================================================================== */

  function init() {
    populatePresets();
    bindEvents();

    // Load initial preset
    loadPreset('Classic Spirograph');

    // Initial render
    renderAll();
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
