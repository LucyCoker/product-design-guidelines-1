# Sample pictures for the library examples: picture(i, w, h) returns an SVG data URI.
# Fun film-themed stand-in pictures: one motif on a bold pattern, as SVG data URIs.
from urllib.parse import quote

def pattern(kind, a, b):
    if kind == 'stripes':
        return f"<pattern id='p' width='12' height='12' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'><rect width='12' height='12' fill='{a}'/><rect width='6' height='12' fill='{b}'/></pattern>"
    if kind == 'dots':
        return f"<pattern id='p' width='14' height='14' patternUnits='userSpaceOnUse'><rect width='14' height='14' fill='{a}'/><circle cx='7' cy='7' r='3' fill='{b}'/></pattern>"
    if kind == 'zigzag':
        return f"<pattern id='p' width='20' height='10' patternUnits='userSpaceOnUse'><rect width='20' height='10' fill='{a}'/><path d='M0 10 L5 2 L10 10 L15 2 L20 10' fill='none' stroke='{b}' stroke-width='2.5'/></pattern>"
    if kind == 'checks':
        return f"<pattern id='p' width='16' height='16' patternUnits='userSpaceOnUse'><rect width='16' height='16' fill='{a}'/><rect width='8' height='8' fill='{b}'/><rect x='8' y='8' width='8' height='8' fill='{b}'/></pattern>"
    if kind == 'rays':
        rays = ''.join(f"<path d='M80 200 L{x} -40 L{x+22} -40 Z' fill='{b}'/>" for x in range(-200, 360, 44))
        return f"<pattern id='p' width='160' height='160' patternUnits='userSpaceOnUse'><rect width='160' height='160' fill='{a}'/>{rays}</pattern>"

def motif(kind, ink, paper):
    if kind == 'clapper':
        stripes = ''.join(f"<path d='M{x} 0 L{x+8} 0 L{x+2} 12 L{x-6} 12 Z' fill='{paper}'/>" for x in range(4, 60, 16))
        return (f"<g transform='translate(-30 -22)'><rect y='14' width='60' height='36' rx='3' fill='{ink}'/>"
                f"<rect y='18' width='60' height='3' fill='{paper}' opacity='.4'/>"
                f"<g transform='rotate(-12 0 12)'><rect width='60' height='12' rx='2' fill='{ink}'/>{stripes}</g></g>")
    if kind == 'reel':
        holes = ''.join(f"<circle cx='{dx}' cy='{dy}' r='6' fill='{paper}'/>" for dx, dy in ((0,-13),(12,-4),(8,11),(-8,11),(-12,-4)))
        return f"<g><circle r='26' fill='{ink}'/>{holes}<circle r='4' fill='{paper}'/></g>"
    if kind == 'camera':
        return (f"<g transform='translate(-32 -20)'><circle cx='14' cy='6' r='9' fill='{ink}'/><circle cx='34' cy='6' r='9' fill='{ink}'/>"
                f"<rect y='14' width='48' height='26' rx='4' fill='{ink}'/><path d='M48 22 L64 14 L64 40 L48 32 Z' fill='{ink}'/>"
                f"<circle cx='24' cy='27' r='6' fill='{paper}'/></g>")
    if kind == 'popcorn':
        corn = ''.join(f"<circle cx='{x}' cy='{y}' r='7' fill='{paper}'/>" for x, y in ((-14,-16),(-4,-22),(8,-20),(16,-12),(-18,-6),(2,-12)))
        return (f"<g>{corn}<path d='M-22 -8 L22 -8 L16 30 L-16 30 Z' fill='{ink}'/>"
                f"<path d='M-11 -8 L-8 30 L-2 30 L-4 -8 Z M4 -8 L2 30 L8 30 L11 -8 Z' fill='{paper}'/></g>")
    if kind == 'ticket':
        return (f"<g transform='rotate(-8)'><path d='M-34 -18 H34 V-6 A6 6 0 0 0 34 6 V18 H-34 V6 A6 6 0 0 0 -34 -6 Z' fill='{ink}'/>"
                f"<path d='M-16 -14 V14' stroke='{paper}' stroke-width='2' stroke-dasharray='3 3'/>"
                f"<path d='M10 -9 L13 -2 L20 -2 L14 2 L16 9 L10 5 L4 9 L6 2 L0 -2 L7 -2 Z' fill='{paper}'/></g>")

THEMES = [  # pattern, motif, background, pattern colour, motif ink, motif paper
    ('stripes', 'clapper', '#ffd166', '#ffbf3c', '#1f2937', '#ffffff'),
    ('dots', 'reel', '#5dd3c0', '#40b8a6', '#14213d', '#5dd3c0'),
    ('zigzag', 'camera', '#ff8fab', '#ff6f91', '#2b2d42', '#ff8fab'),
    ('checks', 'popcorn', '#9bb7ff', '#82a3f7', '#e63946', '#fff8e7'),
    ('rays', 'ticket', '#c3a6ff', '#b08cff', '#3a0ca3', '#c3a6ff'),
]

def picture(i, w, h):
    pat, mot, a, b, ink, paper = THEMES[i % len(THEMES)]
    scale = min(w / 90, h / 70)
    svg = (f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}'><defs>{pattern(pat, a, b)}</defs>"
           f"<rect width='{w}' height='{h}' fill='url(#p)'/>"
           f"<g transform='translate({w/2} {h/2}) scale({scale:.2f})'>{motif(mot, ink, paper)}</g></svg>")
    return 'data:image/svg+xml;utf8,' + quote(svg, safe="/:='()., -")
