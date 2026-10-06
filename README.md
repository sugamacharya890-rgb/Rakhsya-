# Rakshya — रक्षा

A front-end website for **Rakshya**, a brand that protects and supports women and children in Nepal.

It is plain static HTML, CSS and JavaScript. There is no build step and no framework.

## Pages

| Page | File | What it does |
| --- | --- | --- |
| About Us | `index.html` | Hero with moving gradient waves; an origin story that reveals as you scroll; a grid of mission pillars with tilt on hover; the pledge; a call to action |
| Community Forum | `community.html` | One-tap helpline directory; anonymous stories you can filter; a 4-step anonymous sharing form that goes to a moderation queue; how moderation works; a quick-exit button |
| Products & Contact | `products.html` | Keychain and SOS wristband showcase with "Coming soon" badges; a carousel of variants; a step-by-step visual guide with tabs and a slider; real-world scenarios; contact by WhatsApp, email, phone and social media (no cart) |

Every page has a pulsing **Emergency Help** button: one in the nav and one floating on mobile. It opens the helpline directory in a drawer. Without JavaScript, the button links to `community.html#helplines`.

## Structure

```
assets/css/styles.css   design tokens, components, animations
assets/js/main.js       all interactions; HELPLINES data (single source of truth)
assets/img/favicon.svg
```

## Running locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Performance & accessibility

- No images to download. All artwork is inline SVG or CSS gradients. Fonts load with `display=swap` and fall back to system fonts.
- Animations only use `transform` and `opacity`, so the GPU handles them. Scroll reveals use `IntersectionObserver`. Scroll handlers are throttled with requestAnimationFrame.
- With `prefers-reduced-motion`, animations are turned off. With `prefers-contrast: more`, the glass blur effects are removed.
- Muted Rose `#c4858c` is used only for borders and decoration. Text uses the darker tones `#8a3f49` and `#5c2a31`, which meet AA contrast.
- Focus states are visible. There is a skip link. Drawers trap focus, close on Esc and return focus when closed. Tabs use the ARIA tab pattern with arrow keys. Font sizes use `rem`, so they follow the user's settings.
- Trauma-informed details: a quick exit that replaces browser history (button, or Esc twice); content warnings on sensitive stories; a warning if someone types a phone number or email into their story; no sign-up.

## Before going live — TODO

1. **Submission backend.** `submitToModeration()` in `assets/js/main.js` is a placeholder. Nothing is stored or sent. Connect it to an endpoint that saves entries to a private moderation queue. That endpoint should not log IP addresses.
2. **Contact details are placeholders:** `hello@rakshya.com.np`, `+977 980-000-0000`, and the `rakshya.np` Instagram, TikTok and Facebook handles. Replace them with the real ones.
3. **Helpline numbers.** Check the `HELPLINES` array in `main.js` periodically. It holds Police 100, Women's Helpline 1145, Child Helpline 1098, TPO Nepal 1660-010-2005, Ambulance 102, Tourist Police 1144 and Fire 101.
4. **Sample content.** The community stories and product specs are illustrative. Replace them with real moderated stories and the final hardware specs.
