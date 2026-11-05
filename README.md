# niceops.work

The NiceOps website: people and operations advisory for gaming and tech.

Plain static HTML, CSS and a little JavaScript. No framework, no build step, no dependencies. Vercel serves the files exactly as they are in this repository.

## Structure

```
/                        index.html             Home
/services/               services/index.html    Services hub
/services/build/         services/build/…       Build
/services/scale/         services/scale/…       Scale
/services/transform/     services/transform/…   Transform
/about/                  about/index.html       About
/contact/                contact/index.html     Contact (form)
/privacy/                privacy/index.html     Privacy policy
404.html                                         Not found page (Vercel serves it automatically)

assets/css/styles.css    All styles: tokens, grid, components, animations, breakpoints
assets/js/main.js        Header, mobile menu, scroll reveals, hand-drawn marks, count-up, slider, form
assets/fonts/            Hanken Grotesk, DM Mono, Caveat (self-hosted, SIL Open Font License)
assets/img/              og-image.png (social share), logo.png
vercel.json              Clean URLs, trailing slashes, www → apex redirect, security headers, caching
robots.txt, sitemap.xml  Search engines
```

## Run it locally

Any static server works, for example:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening the HTML file directly in a browser won't load the fonts and styles, because paths start with `/`.)

## Deploy: GitHub + Vercel

1. Create a new GitHub repository (for example `niceops-website`) and push this folder:
   ```bash
   git init
   git add .
   git commit -m "NiceOps website"
   git branch -M main
   git remote add origin https://github.com/<you>/niceops-website.git
   git push -u origin main
   ```
2. In Vercel: **Add New → Project → Import** the repository.
   Framework preset: **Other**. Build command: *leave empty*. Output directory: *leave empty* (root). Deploy.
3. Domain: **Project → Settings → Domains**, add `niceops.work` and `www.niceops.work`, then set the DNS records Vercel shows at your registrar. `vercel.json` already redirects www to the apex domain, and Vercel provides HTTPS automatically.
4. Every push to `main` deploys to production; every other branch or pull request gets its own preview URL.

## Before launch: things to fill in

Search the code for `TODO` and `[` placeholders:

- **Contact form endpoint**: in `contact/index.html` replace `YOUR_FORM_ID` in the form `action` with a [Formspree](https://formspree.io) form ID (free tier is fine; set it to send to hello@niceops.work). Until then, submitting opens the visitor's email app with the message pre-filled, so nothing is lost. If you use a different form service, also add its domain to `connect-src` and `form-action` in the Content-Security-Policy in `vercel.json`.
- **Remaining testimonials**: Nenad Tomić (Mad Head Games) and Rob Oseland (Playstudios). Add them to the `QUOTES` list (Home slider) and the About "Work and words" cards.
- **Sanja's LinkedIn URL** (About), and the **NiceOps LinkedIn URL** (footer, Contact, JSON-LD `sameAs`).
- **BytePlus outcome** (About project card).
- **Privacy policy text** and **legal company name / registration number** (footer and privacy page; also add `legalName` and full `address` to the JSON-LD in each page head).

## Photos

All photos come from the Figma file and live in `assets/img/photos/` as WebP (800 and 1600 px) with JPEG fallbacks. Logos are SVGs in `assets/img/logos/`.

### Swapping or adding a photo

Every photo slot looks like this:

```html
<div class="photo" style="--ratio:4 / 5">
  <div class="photo__ph" role="img" aria-label="coffee meeting, informal">Photo · coffee meeting, informal</div>
</div>
```

To replace one, overwrite the files with the same names, or put an image inside a placeholder like this (keep the outer `div.photo`, which sets the crop; `object-position` chooses which part stays in frame):

```html
<div class="photo" style="--ratio:4 / 5">
  <picture>
    <source srcset="/assets/img/photos/coffee-800.avif 800w, /assets/img/photos/coffee-1600.avif 1600w" type="image/avif">
    <img src="/assets/img/photos/coffee-1600.jpg" srcset="/assets/img/photos/coffee-800.jpg 800w, /assets/img/photos/coffee-1600.jpg 1600w"
         sizes="(min-width: 1024px) 33vw, 100vw" width="1600" height="2000"
         alt="Two people talking over coffee at a window table" loading="lazy" decoding="async">
  </picture>
</div>
```

- Hero photos: drop `loading="lazy"` and add `fetchpriority="high"` (they are the largest element on screen).
- Keep files under ~200 KB; export WebP/AVIF at 800 and 1600 px wide.
- Full-width photo bands (`.photo--parallax`) get a gentle parallax automatically once a real `<img>` is inside.
- Write alt text that describes the scene; it helps accessibility and search.

## Motion

All motion is CSS plus `main.js`, and it switches off for visitors who choose "reduce motion" in their system settings.

| Element | Behaviour |
|---|---|
| Hero | Headline lines rise in, the rule draws, the photo wipes in, then the red circle draws around “humanity.” |
| Hand-drawn marks | Underlines and circles draw themselves when scrolled into view (`data-draw`) |
| Circled buttons | Red circle redraws on hover |
| Marquee | 40 s loop, pauses on hover |
| Sections | Fade and rise once when they enter the viewport (`data-reveal`, `data-reveal-stagger`) |
| Impact numbers | Count up (`data-count`) |
| Testimonials | Arrow buttons, keyboard arrows and swipe; no autoplay |
| Header | Hides when scrolling down, returns when scrolling up |
| Mobile menu | Full-screen, focus-trapped, closes with Esc |

## Editing shared parts

The header, footer and mobile menu are repeated in each HTML file (there is no build step). If you change a nav link or footer line, change it in all nine HTML files; a project-wide find and replace in your editor does it in one go.

## After launch

- Verify the site in Google Search Console and Bing Webmaster Tools and submit `https://niceops.work/sitemap.xml`.
- Check structured data in Google's Rich Results Test.
- Run PageSpeed Insights on mobile (targets: LCP ≤ 2.5 s, CLS ≤ 0.1).
