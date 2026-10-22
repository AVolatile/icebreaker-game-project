"""Generate only the eight Team Meeting scenes; existing scenes stay untouched."""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INK, PAPER = '#191a24', '#f9f7ed'
BLUE, YELLOW, PINK, GREEN, SKY, ORANGE = '#2548f4', '#f6ed51', '#ffa9d2', '#c0ee7b', '#a9d9f6', '#ff7448'


def text(x, y, value, size=24, color=INK):
    return f'<text x="{x}" y="{y}" font-family="Arial,sans-serif" font-size="{size}" font-weight="700" fill="{color}" stroke="none">{escape(value)}</text>'


def face(x, y, worried=False):
    mouth = 'M-12 16Q0 6 12 16' if worried else 'M-12 10Q0 25 12 10'
    return f'<g transform="translate({x} {y})"><circle cx="-10" cy="-3" r="3" fill="{INK}"/><circle cx="10" cy="-3" r="3" fill="{INK}"/><path d="{mouth}" fill="none" stroke-linecap="round"/></g>'


def person(x, y, shirt=BLUE, worried=False):
    return f'<g transform="translate({x} {y})"><path d="M-45 115V63Q-42 35 0 35T45 63V115Z" fill="{shirt}"/><circle cy="0" r="34" fill="{PAPER}"/>{face(0, 0, worried)}</g>'


def video_person(tile_id, x, y, width, height, shirt):
    clip_id = f'video-tile-{tile_id}'
    return (
        f'<defs><clipPath id="{clip_id}"><rect x="{x}" y="{y}" width="{width}" height="{height}" rx="7"/></clipPath></defs>'
        f'<g clip-path="url(#{clip_id})">{person(x + width / 2, y + 57, shirt)}</g>'
    )


scenes = [
    (
        'Coach has changed the playbook.',
        'A football coach on the sideline holding a giant Series 7 textbook instead of a playbook.',
        SKY,
        f'<path d="M0 238H640V360H0Z" fill="{GREEN}" stroke="none"/><path d="M0 300H640M75 275V325M555 275V325" stroke="{PAPER}" stroke-width="8"/>'
        + person(155, 155, BLUE, True)
        + f'<path d="M118 144Q118 103 158 104Q188 105 190 144H205V154H117Z" fill="{BLUE}"/><path d="M181 209 275 183M118 210 249 253" fill="none" stroke="{PAPER}" stroke-width="22"/>'
        + f'<rect x="245" y="66" width="257" height="230" rx="9" fill="{ORANGE}"/><path d="M270 67V295M292 247H470" fill="none"/>'
        + text(292, 143, 'SERIES', 40) + text(353, 210, '7', 72)
        + f'<ellipse cx="551" cy="277" rx="39" ry="24" transform="rotate(-25 551 277)" fill="#9a6040"/><path d="m531 287 39-20m-30 1 8 15m4-22 8 15" stroke="{PAPER}"/>'
    ),
    (
        'Nobody tell him what the concession stand sells.',
        'A baseball mascot secretly eating a hot dog in the dugout.',
        PINK,
        f'<path d="M40 58H600V300H40Z" fill="{PAPER}"/><path d="M40 245H600V270H40Z" fill="{BLUE}"/>'
        + text(62, 92, 'DUGOUT', 21)
        + f'<path d="M179 225Q159 122 245 116Q327 115 318 225L315 295H180Z" fill="#b7aff8"/><path d="m185 132-10-45 48 28m60 0 42-29-5 50" fill="#b7aff8"/><ellipse cx="248" cy="160" rx="79" ry="54" fill="#b7aff8"/><path d="M179 148Q207 121 235 153L247 166 262 151Q289 121 318 148L304 179 266 178 248 189 227 178 190 180Z" fill="#797097"/><circle cx="218" cy="153" r="6" fill="{INK}"/><circle cx="275" cy="153" r="6" fill="{INK}"/><path d="M190 111Q201 71 258 89L303 109 260 119Z" fill="{BLUE}"/>'
        + f'<path d="M291 218Q330 228 370 202M196 235Q239 267 310 245" fill="none" stroke="#b7aff8" stroke-width="26"/>'
        + f'<g transform="rotate(-22 370 218)"><rect x="313" y="196" width="135" height="45" rx="22" fill="#ffcc67"/><rect x="320" y="205" width="120" height="24" rx="12" fill="{ORANGE}"/><path d="m333 215 17-8 14 14 16-14 16 14 18-9" fill="none" stroke="{YELLOW}" stroke-width="5"/></g>'
        + f'<path d="m486 140 12 13m18-31 13 2m-36 63 13-5" fill="none"/>'
    ),
    (
        'Camera on was a tactical error.',
        'One person in an absurd Halloween costume on a video call while everyone else looks normal.',
        GREEN,
        f'<rect x="44" y="32" width="552" height="297" rx="15" fill="{INK}"/><rect x="59" y="47" width="254" height="119" rx="7" fill="{PINK}"/><rect x="326" y="47" width="254" height="119" rx="7" fill="{SKY}"/><rect x="59" y="179" width="254" height="112" rx="7" fill="{YELLOW}"/><rect x="326" y="179" width="254" height="112" rx="7" fill="#b7aff8"/>'
        + f'<path d="m117 158 30-70 84 0 38 70Z" fill="{BLUE}"/><ellipse cx="188" cy="117" rx="37" ry="29" fill="{ORANGE}"/><path d="m167 111 12 2-11 10m40-11-12 1 12 9m-34 14h28" fill="none"/><path d="m154 91 31-51 32 51Z" fill="{BLUE}"/><path d="M144 92H229" stroke-width="7"/>'
        + video_person('top-right', 326, 47, 254, 119, BLUE)
        + video_person('bottom-left', 59, 179, 254, 112, ORANGE)
        + video_person('bottom-right', 326, 179, 254, 112, BLUE)
        + f'<path d="M59 166H580M59 291H580" stroke="{INK}" stroke-width="13"/>'
        + text(248, 315, 'CAMERA ON', 14, PAPER)
    ),
    (
        'He swears it landed right here.',
        'A golfer searching the woods while the golf ball visibly hides behind a tree.',
        SKY,
        f'<path d="M0 260Q320 220 640 270V360H0Z" fill="{GREEN}" stroke="none"/><path d="M346 80H378V303H346Z" fill="#9a6040"/><circle cx="360" cy="80" r="65" fill="{GREEN}"/><path d="M535 95H559V304H535Z" fill="#9a6040"/><circle cx="546" cy="86" r="70" fill="{GREEN}"/>'
        + person(168, 160, ORANGE, True)
        + f'<path d="M128 148Q125 120 159 119H183V146H204V156H128Z" fill="{PAPER}"/><path d="m201 197 72 47 19-71m-2 2 30-5" fill="none" stroke-width="9"/>'
        + f'<circle cx="459" cy="270" r="29" fill="{PAPER}"/>{face(452, 270)}<path d="M478 105H516V321H478Z" fill="#9a6040"/><circle cx="499" cy="92" r="75" fill="{GREEN}"/><path d="m463 296-10 15m74-4 9 9" fill="none"/>'
        + f'<path d="m273 94 14-15m11 42 20-4" fill="none" stroke="{BLUE}" stroke-width="5"/>'
    ),
    (
        'There was a disagreement about the kitchen.',
        'Two pickleball paddles arguing dramatically at the kitchen line.',
        SKY,
        f'<path d="M20 90H620V337H20Z" fill="{GREEN}"/><path d="M40 110H600V317H40ZM40 222H600M320 110V317" fill="none" stroke="{PAPER}" stroke-width="6"/><path d="M20 169H620M20 185H620M40 165V205M600 165V205" fill="none" stroke="{BLUE}" stroke-width="5"/>'
        + f'<g transform="rotate(-12 174 195)"><rect x="128" y="186" width="35" height="115" rx="10" fill="{PAPER}"/><rect x="104" y="87" width="113" height="139" rx="42" fill="{PINK}"/>{face(160, 149, True)}<path d="m136 130 17 6m16 0 17-6" fill="none"/></g>'
        + f'<g transform="rotate(12 461 195)"><rect x="445" y="186" width="35" height="115" rx="10" fill="{PAPER}"/><rect x="407" y="87" width="113" height="139" rx="42" fill="#b7aff8"/>{face(463, 149, True)}<path d="m440 130 17 6m16 0 17-6" fill="none"/></g>'
        + text(267, 127, '!?', 53, BLUE) + text(271, 277, 'KITCHEN', 17)
        + f'<circle cx="320" cy="307" r="15" fill="{YELLOW}"/><circle cx="315" cy="302" r="2"/><circle cx="326" cy="309" r="2"/>'
    ),
    (
        'Negotiations have broken down.',
        "One Reese's cup remains in a giant candy bowl while several hands slowly reach toward it.",
        '#b7aff8',
        f'<path d="M137 192Q150 321 320 322Q490 322 503 192Z" fill="{ORANGE}"/><ellipse cx="320" cy="190" rx="185" ry="73" fill="{PAPER}"/><path d="m265 179 17 57h78l17-57Z" fill="#6f422d"/><ellipse cx="321" cy="180" rx="56" ry="21" fill="#9a6040"/><path d="m279 197 5 28m15-24 3 28m20-28v28m20-28-3 28m19-32-5 27" fill="none"/>'
        + f'<path d="M0 97 99 150 136 144m-34 7 24 13m-17-18 14-12M640 102 540 150 509 143m28 7-21 17m18-22-15-13M137 0 225 94 245 103m-20-12 5 28m-8-30-7 25M510 0 420 94 394 104m25-13-3 27m6-30 8 24" fill="none" stroke="{INK}" stroke-width="29" stroke-linecap="round"/>'
        + f'<path d="M0 97 99 150 136 144m-34 7 24 13m-17-18 14-12M640 102 540 150 509 143m28 7-21 17m18-22-15-13M137 0 225 94 245 103m-20-12 5 28m-8-30-7 25M510 0 420 94 394 104m25-13-3 27m6-30 8 24" fill="none" stroke="{PAPER}" stroke-width="21" stroke-linecap="round"/>'
        + f'<path d="m309 130 3-16m23 16 6-15" fill="none" stroke="{BLUE}" stroke-width="5"/>'
    ),
    (
        'Thanksgiving priorities.',
        'A turkey intensely studying a fantasy-football lineup before Thanksgiving dinner.',
        YELLOW,
        f'<path d="M0 286H640V360H0Z" fill="{PAPER}" stroke="none"/><g fill="{ORANGE}"><ellipse cx="127" cy="171" rx="31" ry="79" transform="rotate(-38 127 171)"/><ellipse cx="171" cy="145" rx="31" ry="84" transform="rotate(-12 171 145)"/><ellipse cx="216" cy="145" rx="31" ry="84" transform="rotate(12 216 145)"/><ellipse cx="260" cy="171" rx="31" ry="79" transform="rotate(38 260 171)"/></g>'
        + f'<ellipse cx="194" cy="236" rx="77" ry="66" fill="#9a6040"/><circle cx="252" cy="198" r="38" fill="{SKY}"/><path d="m278 195 33 15-34 7Z" fill="{ORANGE}"/><path d="M261 219Q279 244 265 252Q250 245 255 224" fill="{PINK}"/><path d="m240 180 15 7" fill="none" stroke-width="5"/><circle cx="253" cy="194" r="4" fill="{INK}"/>'
        + f'<rect x="356" y="90" width="233" height="188" rx="10" fill="{BLUE}"/><rect x="372" y="131" width="201" height="132" fill="{GREEN}"/><path d="M400 144V249M430 144V249M460 144V249M490 144V249M520 144V249M550 144V249" stroke="{PAPER}"/>'
        + text(375, 117, 'FANTASY LINEUP', 18, PAPER)
        + f'<g fill="{BLUE}"><circle cx="412" cy="174" r="9"/><circle cx="445" cy="202" r="9"/><circle cx="482" cy="166" r="9"/><circle cx="516" cy="226" r="9"/></g><path d="M335 278H607L622 295H320Z" fill="{PAPER}"/><ellipse cx="106" cy="320" rx="65" ry="13" fill="{PAPER}"/>'
    ),
    (
        'Question 84 has entered the chat.',
        'A defeated Series 7 test-taker surrounded by floating CALLS, PUTS, MUNIS, MARGIN and YTM notes.',
        PINK,
        person(324, 182, BLUE, True)
        + f'<path d="m291 165-6-34 23 15 6-30 18 27 21-20-2 42" fill="{INK}"/><path d="M310 216H340M287 245 244 282M360 245 400 282" fill="none" stroke="{PAPER}" stroke-width="15"/>'
        + f'<rect x="53" y="69" width="154" height="62" rx="5" fill="{YELLOW}"/><rect x="431" y="57" width="140" height="62" rx="5" fill="{SKY}"/><rect x="63" y="190" width="158" height="62" rx="5" fill="{GREEN}"/><rect x="432" y="184" width="170" height="62" rx="5" fill="#b7aff8"/><rect x="259" y="37" width="115" height="58" rx="5" fill="{PAPER}"/>'
        + text(75, 109, 'CALLS', 31) + text(451, 98, 'PUTS', 31) + text(82, 231, 'MUNIS', 31) + text(448, 225, 'MARGIN', 29) + text(279, 76, 'YTM', 30)
        + f'<path d="M175 290H469L496 333H150Z" fill="{PAPER}"/>' + text(280, 322, '84.  A  B  C  D', 17)
        + f'<path d="M371 168Q387 188 374 194Q361 188 371 168Z" fill="{SKY}"/>'
    ),
]

if __name__ == '__main__':
    for scene_id, (title, description, background, artwork) in enumerate(scenes, start=15):
        svg = (
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img">'
            f'<title>{escape(title)}</title><desc>{escape(description)}</desc>'
            f'<rect width="640" height="360" fill="{background}"/>'
            f'<g stroke="{INK}" stroke-width="3.5" stroke-linejoin="round">{artwork}</g></svg>'
        )
        (ROOT / 'public' / 'scenes' / f'{scene_id}.svg').write_text(svg)
    print('Wrote Team Meeting scenes 15–22; existing scenes 0–14 unchanged.')
