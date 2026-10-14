"""Outline locally licensed brand typography and add product/character compositions."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
import re
root=Path('public')
font=TTFont('node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2')
font=instantiateVariableFont(font,{'wght':800},inplace=False)
glyphs=font.getGlyphSet();cmap=font.getBestCmap();upm=font['head'].unitsPerEm
cache={}
def outlined(text,x,y,size,fill,spacing=0):
 parts=[];cursor=x
 for char in text:
  name=cmap.get(ord(char),'space');g=glyphs[name]
  if name not in cache:
   pen=SVGPathPen(glyphs);g.draw(pen);cache[name]=pen.getCommands()
  if cache[name]:parts.append(f'<path d="{cache[name]}" transform="translate({cursor:.2f} {y:.2f}) scale({size/upm:.5f} {-size/upm:.5f})"/>')
  cursor+=g.width*size/upm+spacing
 return f'<g fill="{fill}" aria-label="{text}">'+''.join(parts)+'</g>'
wordmark=outlined('ruckus',8,113,132,'#191a24',-8)
(root/'brand'/'wordmark.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 445 145"><title>Ruckus wordmark</title>{wordmark}<path d="m399 9 6 12 13 2-10 9 2 13-11-6-11 6 2-13-10-9 13-2Z" fill="#2548f4"/></svg>')
# Outline headlines so exported artwork does not depend on a font installed elsewhere.
for file in (root/'campaign').glob('*.svg'):
 s=file.read_text(); m=re.search(r'viewBox="0 0 (\d+) (\d+)"',s);w,h=map(int,m.groups())
 def convert(match):
  tag,body=match.groups();attrs=dict(re.findall(r'([\w-]+)="([^"]*)"',tag));x=float(attrs.get('x',0));y=float(attrs.get('y',0));size=float(attrs.get('font-size',16));fill=attrs.get('fill','#191a24');spacing=float(attrs.get('letter-spacing',0));lines=re.findall(r'<tspan([^>]*)>([^<]*)</tspan>',body)
  if lines:
   out=''
   for a,t in lines:
    la=dict(re.findall(r'([\w-]+)="([^"]*)"',a));y+=float(la.get('dy',0));out+=outlined(t,float(la.get('x',x)),y,size,fill,spacing)
   return out
  return outlined(body.replace('&amp;','&'),x,y,size,fill,spacing)
 s=re.sub(r'<text([^>]*)>(.*?)</text>',convert,s)
 if h>w*.7:
  index=int(file.name.split('-')[0]);a=[5,7,2,14,1,19,12,3][index]
  avatar=(root/'avatars'/f'{a}.svg').read_text();inner=avatar[avatar.index('<g '):avatar.rindex('</svg>')]
  ax=w*.66;ay=h*.70;scale=w*.0023
  decor=f'<g transform="translate({ax} {ay}) rotate(8) scale({scale})">{inner}</g>'
  # Social formats include a small controller card to connect campaign and product.
  if 'poster' not in file.name:
   px=w*.55;py=h*.61;pw=w*.36;ph=min(h*.23,w*.31)
   panel=f'<g transform="translate({px} {py}) rotate(6)"><rect width="{pw}" height="{ph}" rx="15" fill="#f9f7ed" stroke="#191a24" stroke-width="4"/>'
   panel+=outlined('ROOM J7KM5',20,38,w*.022,'#2548f4')+outlined('Your phone.',20,ph*.35,w*.036,'#191a24')+outlined('Your move.',20,ph*.35+w*.04,w*.036,'#191a24')
   panel+=f'<rect x="20" y="{ph*.64}" width="{pw-40}" height="{ph*.2}" rx="8" fill="#f6ed51" stroke="#191a24" stroke-width="2"/>'+outlined('MAKE AN ENTRANCE',30,ph*.77,w*.019,'#191a24')+'</g>'
   decor=panel+f'<g transform="translate({w*.75} {h*.79}) rotate(8) scale({w*.0014})">{inner}</g>'
  s=s.replace('</svg>',decor+'</svg>')
 file.write_text(s)
print('Outlined wordmark and refined 64 original campaign graphics.')
