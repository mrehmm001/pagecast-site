# PageCast landing page

Live at https://pagecast.muneebrehman.co.uk

A static page: `index.html`, `styles.css`, `site.js` and `media/`. No build step,
no dependencies beyond two Google webfonts (Bricolage Grotesque for display,
Newsreader for body text). Drop the folder on any static host (GitHub Pages,
Netlify, Cloudflare Pages) and it works.

The page runs light-to-dark on purpose: it starts as something you read and ends
as something you watch. The hero is a diagram of a page losing its ads and menus,
animated once on load and shown in its finished state to anyone who prefers
reduced motion.

## Before you publish

1. **Connect the email form.** Both `<form class="signup">` elements have empty
   `data-endpoint` and `data-contact` attributes. Put a form endpoint (Formspree,
   Buttondown, your own handler) in `data-endpoint` and a contact address in
   `data-contact`. Until then the form tells visitors it isn't connected instead
   of pretending to have saved their address.
2. **Check the claims still hold.** The numbers in "The cut" (76 items, 20 kept,
   56 removed) come from a real run against the Independent article in
   `host/test/fixtures/news.json`. The timings come from `host/test/e2e.js`.

## The videos

Every video was produced by PageCast itself, unedited:

| File | Source page | Notes |
|---|---|---|
| `hovercraft.mp4` | en.wikipedia.org/wiki/Hovercraft | complete, 1:10, with subtitles |
| `example-concorde.mp4` | en.wikipedia.org/wiki/Concorde | complete, 1:32 |
| `example-antikythera.mp4` | en.wikipedia.org/wiki/Antikythera_mechanism | complete, 1:19 |
| `example-esp32.mp4` | ESP32 PWM tutorial page | 40 s from the middle of 5:35 |
| `demo-editor.mp4`, `demo-modal.mp4` | — | screen recordings of the extension |

The `.vtt` caption files are the `.srt` files PageCast writes next to each video.

Re-record the interface clips with `node tools/record-demo.cjs` (needs
`node tools/devserver.js` running), then re-encode with the ffmpeg commands in the
project history. The Wikipedia examples carry CC-licensed imagery. The ESP32 one is from a
third-party tutorial site and is the last example that isn't either Wikipedia or
your own content.
