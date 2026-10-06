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


# Illustrated people (not real people) for profile examples: skin tone, hair
# colour and style, top and background vary with i. i=0 is the original.
SKIN = ['#f2d4c2', '#c68863', '#8d5a3b', '#e9b99a', '#5c3a26', '#f5dcc8']
HAIR = ['#5b3a29', '#1f1a17', '#c9a15a', '#8a8f99', '#2b1d14', '#a0452a']
TOPS = ['#3d5a80', '#2a9d8f', '#6d597a', '#e76f51', '#264653', '#b56576']
BGS = [('#cfe3f5', '#9fc2e6'), ('#fde2c8', '#f6bd8f'), ('#d8f3dc', '#95d5b2'), ('#e9d8fd', '#c3a6ff'), ('#ffe5ec', '#ffb3c6'), ('#e0e1dd', '#b8bdc4')]
STYLES = ['bob', 'short', 'long', 'bun', 'crop', 'curly']

def headshot(w=160, h=160, i=0):
    """An illustrated headshot (not a real person) for profile examples."""
    skin, hair, top = SKIN[i % 6], HAIR[(i * 5 + i // 6) % 6], TOPS[(i * 7) % 6]
    bg = BGS[(i * 5) % 6]
    style = STYLES[i % 6]
    shade = 'rgba(0,0,0,.12)'
    behind = {
        'bob': "<path d='M44 70 C40 30 66 18 82 18 C104 18 122 34 118 72 C116 92 112 104 106 110 L54 110 C48 102 45 88 44 70 Z' fill='HAIR'/>",
        'short': "",
        'long': "<path d='M42 70 C38 28 64 16 82 16 C106 16 124 32 120 72 C120 104 126 132 122 150 L38 150 C34 132 40 104 42 70 Z' fill='HAIR'/>",
        'bun': "<circle cx='80' cy='20' r='14' fill='HAIR'/>",
        'crop': "",
        'curly': ''.join(f"<circle cx='{x}' cy='{y}' r='13' fill='HAIR'/>" for x, y in ((52,48),(60,30),(80,22),(100,30),(108,48),(110,68),(50,68),(56,88),(104,88))),
    }[style].replace('HAIR', hair)
    front = {
        'bob': "<path d='M54 58 C56 36 70 30 84 31 C98 32 108 42 106 58 C96 46 80 42 64 50 C60 52 57 55 54 58 Z' fill='HAIR'/>",
        'short': "<path d='M53 62 C50 36 66 28 80 28 C96 28 110 36 107 62 C104 50 96 44 80 44 C66 44 57 50 53 62 Z' fill='HAIR'/>",
        'long': "<path d='M54 60 C54 38 68 31 82 31 C98 31 108 42 106 60 C100 48 90 42 78 44 C68 46 60 52 54 60 Z' fill='HAIR'/>",
        'bun': "<path d='M54 60 C55 38 68 32 80 32 C94 32 106 40 106 60 C98 48 90 44 80 44 C70 44 60 50 54 60 Z' fill='HAIR'/>",
        'crop': "<path d='M55 56 C58 38 70 34 80 34 C92 34 103 39 105 56 C96 48 88 46 80 46 C72 46 63 49 55 56 Z' fill='HAIR' opacity='.9'/>",
        'curly': ''.join(f"<circle cx='{x}' cy='{y}' r='9' fill='HAIR'/>" for x, y in ((60,44),(72,38),(86,37),(99,43))),
    }[style].replace('HAIR', hair)
    beard = "<path d='M58 76 C60 96 70 100 80 100 C90 100 100 96 102 76 C96 88 88 90 80 90 C72 90 64 88 58 76 Z' fill='HAIR' opacity='.85'/>".replace('HAIR', hair) if i % 4 == 3 else ''
    glasses = "<g fill='none' stroke='#2b2d42' stroke-width='2'><circle cx='70' cy='66' r='7'/><circle cx='90' cy='66' r='7'/><path d='M77 66 H83'/></g>" if i % 5 == 2 else ''
    ox = (w - 160) / 2
    oy = h - 160
    svg = (f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}'>"
           f"<defs><linearGradient id='bg' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='{bg[0]}'/><stop offset='1' stop-color='{bg[1]}'/></linearGradient></defs>"
           f"<rect width='{w}' height='{h}' fill='url(#bg)'/>"
           f"<g transform='translate({ox} {oy})'>"
           + behind +
           f"<path d='M18 160 C22 122 52 112 80 112 C108 112 138 122 142 160 Z' fill='{top}'/>"
           f"<path d='M64 112 L80 132 L96 112 Z' fill='{skin}'/>"
           f"<rect x='69' y='92' width='22' height='26' rx='8' fill='{skin}'/><rect x='69' y='92' width='22' height='10' fill='{shade}'/>"
           f"<ellipse cx='80' cy='66' rx='26' ry='31' fill='{skin}'/>"
           + front + beard +
           "<circle cx='70' cy='66' r='2.6' fill='#2b2d42'/><circle cx='90' cy='66' r='2.6' fill='#2b2d42'/>"
           f"<path d='M64 58 Q70 55 75 58 M85 58 Q90 55 96 58' stroke='{hair}' stroke-width='2' fill='none' stroke-linecap='round'/>"
           "<path d='M72 80 Q80 86 88 80' stroke='#8c3b33' stroke-width='2.4' fill='none' stroke-linecap='round'/>"
           + glasses +
           "</g></svg>")
    return 'data:image/svg+xml;utf8,' + quote(svg, safe="/:='()., -")
