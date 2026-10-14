"""Build the original, editable Ruckus vector system. No third-party illustrations."""
from pathlib import Path
import html
P=Path('public')
ink='#191a24'
colors=['#ff7448','#b7aff8','#a9d9f6','#c0ee7b','#ffcc67','#a9d9f6','#c0ee7b','#b7aff8','#ffa9d2','#f6ed51','#c0ee7b','#ff7448','#ffa9d2','#a9d9f6','#b7aff8','#ffcc67','#ffa9d2','#ff7448','#ffcc67','#a9d9f6']
names=['Orbit','Bandit','Boo','Frogbert','Toast','Pidge','Prickle','Beep','Jelly','Peel','Rex','Espresso','Shroom','Fin','Visitor','Quack','Noodle','Miso','Grizzly','Nimbus']
bodies=[
 '<path d="M30 46 7 54 27 66 12 81 42 80" fill="#ffcc67"/><circle cx="64" cy="55" r="35"/>',
 '<path d="M22 44 17 14 43 29M74 29 102 14 98 45"/><path d="M20 49Q20 24 60 24T100 49Q106 85 60 98Q14 85 20 49Z"/><path d="M28 46Q42 31 54 49L61 62 66 49Q82 30 94 48L88 70 69 72 60 81 49 72 31 68Z" fill="#797097"/>',
 '<path d="M25 57Q25 17 60 17T95 57V100L82 90 68 101 55 90 42 101 25 92Z" fill="#f9f7ed"/>',
 '<path d="M25 57Q6 44 23 26Q39 9 50 32Q58 29 66 33Q83 10 100 28Q117 47 95 59L99 75Q90 102 60 101Q28 100 22 76Z"/><circle cx="32" cy="34" r="13" fill="#eff5cc"/><circle cx="84" cy="34" r="13" fill="#eff5cc"/>',
 '<path d="M22 94V47Q10 17 34 15H86Q108 17 97 47V94Z" fill="#e5a75f"/><path d="M32 85V44Q22 25 41 25H79Q98 25 87 44V85Z" fill="#ffe5b6"/>',
 '<path d="M33 75Q19 61 32 39Q33 13 63 17Q92 16 91 40L112 49 91 57Q94 78 77 94L19 99Z"/><path d="M88 37 113 49 89 55Z" fill="#ff7448"/><path d="M35 72Q45 47 64 64Q77 82 35 72Z" fill="#658eae"/>',
 '<path d="M45 99V65H30Q13 65 13 49V35Q13 25 25 25T36 35V45H45V25Q45 10 60 10T75 25V57H83V40Q83 29 95 29T108 40V66Q108 78 88 78H75V99Z"/><path d="M38 98H82L78 110H42Z" fill="#ff7448"/>',
 '<rect x="20" y="31" width="80" height="66" rx="16"/><path d="M60 30V16" fill="none"/><circle cx="60" cy="12" r="7" fill="#f6ed51"/><rect x="29" y="40" width="62" height="34" rx="8" fill="#e9e6ff"/><path d="M20 51H12V76H20M100 51H108V76H100" fill="#a9d9f6"/>',
 '<path d="M13 72Q12 19 59 17Q108 21 108 73L97 89 84 75 70 93 56 75 42 93 28 78 16 88Z"/><path d="M36 86Q30 102 25 108M60 90V112M87 83Q92 99 100 108" fill="none"/>',
 '<path d="M85 13Q75 52 28 71L18 65Q15 101 47 104Q99 92 102 40Z"/><path d="M86 13 87 6 96 9 99 26" fill="#89815b"/><path d="M28 71Q70 86 94 38" fill="none"/>',
 '<path d="M28 100V51Q17 18 51 17H81Q101 18 101 41V61H69V84L96 91 99 103H57V90H44V104Z"/><path d="M26 56 9 72 27 78M24 32 13 40 25 44" fill="#ff7448"/><path d="M80 56 86 64 91 56" fill="#f9f7ed"/>',
 '<path d="M25 35H83V87Q80 105 54 105Q26 101 25 83Z" fill="#f9f7ed"/><path d="M83 45Q115 39 111 68Q109 82 83 77" fill="none" stroke-width="8"/><ellipse cx="54" cy="35" rx="29" ry="9" fill="#5d3f31"/><path d="M42 22Q30 13 43 5M66 22Q79 12 68 4" fill="none"/>',
 '<path d="M43 58H76L84 101Q60 113 36 101Z" fill="#f9f7ed"/><path d="M11 59Q15 11 60 10Q105 11 110 59Q61 75 11 59Z"/><circle cx="39" cy="35" r="10" fill="#f9f7ed"/><circle cx="77" cy="27" r="8" fill="#f9f7ed"/>',
 '<path d="M16 94Q29 62 34 44Q46 21 74 29L79 8 91 35Q109 47 99 81L115 94 88 101 62 108Z"/><path d="M35 62Q64 45 91 69L86 87 48 87Z" fill="#f9f7ed"/><path d="M53 71 58 80 63 71 68 80 73 71" fill="none"/>',
 '<path d="M19 49Q16 16 60 14Q104 15 103 49Q99 78 60 105Q21 78 19 49Z"/><ellipse cx="39" cy="52" rx="13" ry="19" transform="rotate(-25 39 52)" fill="#191a24"/><ellipse cx="80" cy="52" rx="13" ry="19" transform="rotate(25 80 52)" fill="#191a24"/>',
 '<path d="M14 88Q12 66 40 66L40 40Q40 16 66 17Q96 17 91 43L107 52 89 64Q104 87 86 98Q40 115 14 88Z"/><path d="M85 42 111 51 85 59" fill="#ff7448"/><path d="M29 80Q48 72 56 84L42 94Z" fill="#e9ae35"/>',
 '<path d="M15 63Q11 25 42 27Q46 7 66 21Q91 13 94 39Q116 54 101 82Q88 107 61 91Q39 113 23 91Q3 89 15 63Z"/>',
 '<path d="M23 97V34L14 10 47 28Q61 23 76 28L106 10 97 43V85Q80 108 23 97Z"/><path d="M31 37 24 22 41 32M85 33 99 22 91 43" fill="#ffa9d2"/><path d="M31 73 14 68M31 81 10 82M85 74 108 69M85 82 113 84" fill="none"/>',
 '<circle cx="26" cy="29" r="17"/><circle cx="95" cy="29" r="17"/><path d="M19 61Q17 21 61 22Q106 23 104 67Q100 105 62 106Q19 105 19 61Z"/><ellipse cx="61" cy="77" rx="26" ry="20" fill="#f1dab8"/>',
 '<path d="M27 93Q3 85 10 63Q13 50 29 49Q21 18 50 15Q72 9 83 35Q109 27 113 52Q125 76 104 88Q69 101 27 93Z" fill="#f9f7ed"/><path d="M31 101 26 112M60 104 55 115M88 101 83 112" fill="none" stroke="#2548f4"/>'
]
for i,(name,body,c) in enumerate(zip(names,bodies,colors)):
 eye_y=52 if i not in [3,10,12,15,18,19] else {3:36,10:37,12:84,15:38,18:56,19:65}[i]
 eyes='' if i==14 else f'<ellipse cx="45" cy="{eye_y}" rx="4" ry="6" fill="{ink}" stroke="none"/><ellipse cx="73" cy="{eye_y}" rx="4" ry="6" fill="{ink}" stroke="none"/>'
 mouth=f'<path d="M48 {eye_y+17}Q59 {eye_y+27} 70 {eye_y+17}" fill="none" stroke-linecap="round" stroke-width="3.5"/>' if i not in [5,10,13,15] else ''
 cheeks=f'<ellipse cx="35" cy="{eye_y+10}" rx="6" ry="3" fill="#ff7448" opacity=".55" stroke="none"/><ellipse cx="84" cy="{eye_y+10}" rx="6" ry="3" fill="#ff7448" opacity=".55" stroke="none"/>'
 s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img"><title>{name}</title><g fill="{c}" stroke="{ink}" stroke-width="3.5" stroke-linejoin="round">{body}{eyes}{mouth}{cheeks}</g></svg>'
 (P/'avatars'/f'{i}.svg').write_text(s)
(P/'brand'/'symbol.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="25" fill="#2548f4"/><path d="M24 20H55Q82 20 77 43Q74 55 59 58L80 81H51L34 60V81H14V20Z" fill="#f6ed51"/><circle cx="47" cy="39" r="10" fill="#2548f4"/><path d="m84 14 5 9 10 1-8 7 2 10-9-5-9 5 2-10-8-7 10-1Z" fill="#ffa9d2"/></svg>')
(P/'brand'/'wordmark.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 530 145"><text x="8" y="113" font-family="Arial,sans-serif" font-size="132" font-weight="900" letter-spacing="-10" fill="#191a24">ruckus</text><path d="m484 9 6 12 13 2-10 9 2 13-11-6-11 6 2-13-10-9 13-2Z" fill="#2548f4"/></svg>')
# Original scene compositions: each intentionally has its own context and props.
scene_avatars=[5,6,11,1,19,7,4,15,2,4,14,10,12,19,9]
for i,a in enumerate(scene_avatars):
 bg=['#a9d9f6','#ffa9d2','#c0ee7b','#ffcc67','#b7aff8'][i%5]
 av=(P/'avatars'/f'{a}.svg').read_text(); inner=av[av.index('<g '):av.rindex('</svg>')]
 props=[
 '<rect x="390" y="64" width="166" height="120" rx="4" fill="#f9f7ed"/><path d="M411 156 441 133 469 141 526 95" fill="none" stroke="#2548f4" stroke-width="8"/><path d="M266 239H455V254H266Z" fill="#5c6496"/>',
 '<rect x="246" y="241" width="223" height="23" fill="#2548f4"/><rect x="444" y="178" width="22" height="66" fill="#ff7448"/><path d="M420 178 455 143 483 178Z" fill="#ff7448"/>',
 '<rect x="388" y="86" width="122" height="168" rx="12" fill="#2548f4"/><rect x="405" y="110" width="87" height="38" fill="#f6ed51"/><rect x="418" y="174" width="51" height="50" fill="#191a24"/>',
 '<rect x="381" y="52" width="191" height="151" fill="#f9f7ed"/><rect x="407" y="124" width="27" height="58" fill="#2548f4"/><rect x="451" y="91" width="27" height="91" fill="#ffa9d2"/><rect x="495" y="145" width="27" height="37" fill="#c0ee7b"/>',
 '<path d="M160 225H500L549 298H109Z" fill="#f9f7ed"/><path d="M382 211Q388 158 392 113" fill="none"/><ellipse cx="393" cy="94" rx="26" ry="35" fill="#ff7448"/>',
 '<path d="M374 216H533L560 244H345Z" fill="#f9f7ed"/><ellipse cx="453" cy="222" rx="38" ry="12" fill="#ffcc67"/><path d="M408 200 445 174 490 201Z" fill="#c0ee7b"/>',
 '<rect x="389" y="102" width="154" height="93" fill="#f9f7ed"/><text x="466" y="134" text-anchor="middle" font-family="Arial" font-size="13" stroke="none" fill="#191a24">EMPLOYEE OF</text><text x="466" y="154" text-anchor="middle" font-family="Arial" font-size="13" stroke="none" fill="#191a24">THE MONTH</text><path d="M451 174 466 163 481 174 466 187Z" fill="#ffcc67"/>',
 '<rect x="402" y="55" width="118" height="221" rx="7" fill="#f9f7ed"/><rect x="423" y="96" width="79" height="52" fill="#ffa9d2"/><rect x="423" y="164" width="79" height="52" fill="#ffa9d2"/>',
 '<rect x="421" y="64" width="53" height="205" fill="#2548f4"/><rect x="409" y="133" width="77" height="63" rx="10" fill="#ffcc67"/><circle cx="447" cy="164" r="12" fill="#ff7448"/>',
 '<rect x="385" y="47" width="186" height="145" fill="#f9f7ed"/><path d="M406 152 430 129 454 142 493 106 542 85" fill="none" stroke="#ff7448" stroke-width="8"/><path d="M385 210H557V261H385Z" fill="#2548f4"/>',
 '<rect x="384" y="87" width="166" height="117" rx="6" fill="#191a24"/><path d="M384 204H550L574 231H360Z" fill="#2548f4"/><rect x="400" y="105" width="134" height="79" fill="#f9f7ed"/><path d="M412 124H518M412 139H518M412 154H470" stroke="#ffa9d2" stroke-width="9"/>',
 '<circle cx="490" cy="82" r="39" fill="#f6ed51"/><path d="M373 274 440 138 557 273Z" fill="#a9d9f6"/><path d="M440 138V270" fill="none"/><path d="M439 147 475 215H404Z" fill="#ff7448"/>',
 '<path d="M379 244H561V263H379Z" fill="#2548f4"/><rect x="400" y="175" width="101" height="71" rx="7" fill="#f9f7ed"/><path d="M458 64V155M414 84H507" stroke="#f9f7ed" stroke-width="8"/>',
 '<rect x="379" y="72" width="183" height="141" rx="8" fill="#2548f4"/><rect x="395" y="87" width="151" height="110" fill="#f9f7ed"/><path d="M470 213V255M427 256H510" fill="none" stroke-width="9"/>',
 '<path d="M370 205H566V267H370Z" fill="#2548f4"/><path d="M433 200V154Q438 135 451 152" fill="none" stroke-width="9"/><circle cx="451" cy="148" r="9" fill="#191a24"/>'
 ][i]
 s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><title>Original Ruckus office scene {i+1}</title><rect width="640" height="360" fill="{bg}"/><path d="M0 279H640V360H0Z" fill="#f9f7ed" opacity=".45"/><g stroke="{ink}" stroke-width="3" stroke-linejoin="round">{props}<g transform="translate(153 100) scale(1.5)">{inner}</g><path d="M194 272V305M294 273V305M377 268V305M520 270V305" fill="none" stroke-width="8"/></g><path d="m86 64 7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2Z" fill="#2548f4"/><circle cx="559" cy="302" r="10" fill="#ff7448"/></svg>'
 (P/'scenes'/f'{i}.svg').write_text(s)
lines=['Your agenda just got a plot twist.','The projector has a personality now.','No fun facts were harmed.','Reply all. Play all.','The only meeting worth running over.','Same Wi-Fi. Different wavelength.','Bragging rights. No paperwork.','A little less agenda. A lot more Ruckus.']
formats={'square':(1080,1080),'portrait':(1080,1350),'story':(1080,1920),'medium-rectangle':(300,250),'leaderboard':(728,90),'skyscraper':(160,600),'billboard':(970,250),'poster':(800,1120)}
for i,line in enumerate(lines):
 for fmt,(w,h) in formats.items():
  bg=['#2548f4','#f6ed51','#ffa9d2','#c0ee7b'][i%4];fg='#f9f7ed' if i%4==0 else ink
  fs=min(w*.12,h*.16); words=line.split(); chunks=[];current=''
  capacity=max(10,int(w/(fs*.55)))
  for word in words:
   if len(current+' '+word)>capacity:chunks.append(current);current=word
   else:current=(current+' '+word).strip()
  if current:chunks.append(current)
  y=h*.25 if h>w*.7 else h*.32
  text=''.join(f'<tspan x="{w*.07}" dy="{fs*1.05 if k else 0}">{html.escape(chunk)}</tspan>' for k,chunk in enumerate(chunks))
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}"><rect width="{w}" height="{h}" fill="{bg}"/><text x="{w*.07}" y="{y}" fill="{fg}" font-family="Arial,sans-serif" font-size="{fs}" font-weight="900" letter-spacing="{-fs*.04}">{text}</text><text x="{w*.07}" y="{h*.88}" fill="{fg}" font-family="Arial,sans-serif" font-size="{min(w*.09,h*.17)}" font-weight="900">ruckus*</text><text x="{w*.07}" y="{h*.95}" fill="{fg}" font-family="Arial,sans-serif" font-size="{min(w*.022,h*.08)}">CLOCK OUT OF ORDINARY.</text></svg>'
  (P/'campaign'/f'{i}-{fmt}.svg').write_text(svg)
