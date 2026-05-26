# Guilloche Pattern Generator

**[Try the Live Demo](https://id3vi5er.github.io/pattern-generator/)**

A high-performance, web-based parametric curve and guilloche pattern generator. Built entirely with HTML5, CSS, and Vanilla JavaScript, it requires no backend and runs entirely in your browser. Perfect for designing complex security patterns, spirographs, rosettes, and generative geometric art.

## Architecture

The project is structured as a lightweight Single Page Application (SPA):

*   **`index.html`**: The main user interface, including the canvas, sidebar, and export modals.
*   **`styles.css`**: A custom dark-mode stylesheet focusing on a modern, precise engineering aesthetic.
*   **`guilloche.js`**: The core mathematical engine. It calculates arrays of coordinates based on parametric equations and converts them into highly optimized SVG path strings.
*   **`presets.js`**: A library of predefined layer configurations (e.g., Banknote Rosette, Lissajous Knot, Golden Spiral).
*   **`app.js`**: Application state management, DOM event handling, hardware-accelerated pan/zoom, rendering loop (`requestAnimationFrame`), and export logic.

## Supported Curves

The core engine (`guilloche.js`) supports a wide array of mathematical curves:

1.  **Hypotrochoid**: Inner rolling circles (classic spirograph).
2.  **Epitrochoid**: Outer rolling circles.
3.  **Circular Wave**: Radially modulated sine waves, essential for banknote rosettes.
4.  **Linear Wave**: Horizontally modulated sine bands for borders.
5.  **Lissajous**: Two-axis sinusoidal curves for complex knots and continuous loops.
6.  **Rhodonea (Rose Curve)**: Polar petal curves.
7.  **Spiral**: Archimedean, Logarithmic, and Fermat spirals.
8.  **Superformula (Gielis)**: A versatile formula for generating stars, polygons, and organic shapes.
9.  **Maurer Rose**: Discretely sampled rose curves connected by line segments for crystalline webs.
10. **Involute**: The curve traced by unwinding a taut string from a circle.

## Key Features

*   **Real-time Rendering**: Slider adjustments instantly update the vector canvas without dropping frames, thanks to debounced `requestAnimationFrame` handling.
*   **Multi-Layer Management**: Combine different curves into complex compositions. Toggle visibility, duplicate, or delete layers.
*   **Per-Layer Transformations**: Independently offset (X/Y), scale, and rotate layers without incurring mathematical overhead (utilizes SVG DOM transforms).
*   **Advanced Styling**: Control stroke color, width, opacity, dash arrays, and linear gradients. Supports SVG mix-blend-modes (e.g., Screen, Multiply, Color Dodge) for vibrant intersections.
*   **Interactive Viewport**: Infinite pan and zoom capabilities via mouse drag and scroll wheel.
*   **Reference Images**: Load local images into the background as tracing references, with adjustable scale and opacity.
*   **High-Fidelity Export**: Export directly to resolution-independent SVG or high-resolution PNG (2048x2048). Includes a quick "Copy to Clipboard" for raw SVG markup.
*   **Zero Dependencies**: No React, Vue, npm, or build steps required. Open `index.html` and start designing.

## Usage

1.  Clone the repository to your local machine.
2.  Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge).
3.  Use the top-right dropdown to load a preset, or click the `+` button in the sidebar to add a new curve layer.
4.  Hover over any slider and use your mouse wheel for fine-grained parameter adjustments.

## Export Details

The SVG export function builds a complete, valid XML document. It automatically calculates the bounding box of all visible layers, injects any necessary `<defs>` (like gradients), and applies the selected background color. This ensures the output is immediately ready for use in Adobe Illustrator, Inkscape, or laser cutting software.

## License

This project is open-source and available for modification and distribution.
