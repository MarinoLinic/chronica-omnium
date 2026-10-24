# Original title and Back to Top

These are the original designs from commit `89bfd7e9f4fa0f730b715d2432d67ad39547738c`, before the reader overhaul. The four files under `components/` and `styles/` are exact Git copies, including the original gradient credit, Poppins import and Tailwind import.

- `components/Title.jsx`: the large animated **Chronica Omnium** title, subtitle and author line.
- `components/BackToTop.jsx`: the animated text, scroll percentage and smooth return to the top.
- `styles/rainbow.css`: the original blue/cyan gradient, timing and keyframes.
- `styles/index.css`: the complete original supporting styles and font reference.

Open [index.html](index.html) for a standalone preview of both designs; scroll down to see Back to Top. It also works at `http://127.0.0.1:5173/legacy/designs/index.html` while the dev server is running. The preview needs no packages or network. It uses Poppins if installed, otherwise a system font; the original remote font reference remains in the archived stylesheet. The preview adapts the two designs to plain HTML and adds keyboard support and reduced-motion handling. The JSX and CSS archives remain unchanged.

This folder is a design reference, outside the production publishing path. Do not import the archived global stylesheet into the current reader. The current header reuses the original gradient in `src/styles/reader.css`, with its current typography and shared theme tokens. Its animation respects reduced motion. The current Back to Top keeps the verified instant-scroll implementation; this archive preserves the earlier appearance and percentage display for future reuse.
