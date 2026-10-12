"""把 Noto Sans Egyptian Hieroglyphs 裡用到的象形文字轉成 SVG 路徑，輸出 js/glyphs.js。
用法：python3 tools/extract_glyphs.py <字型檔路徑>
字型授權：SIL Open Font License 1.1（見 assets/fonts/OFL-NotoSansEgyptianHieroglyphs.txt）
"""
import sys, json, unicodedata
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

GARDINER = """
I010 D046 S043 M017 N035 Q003 G043 E015 V030 N016 D045 G026 R008 Aa011 D036 X001 H006
G039 D021 N005 U028 G001 D010 F013 M023 R004 X008 O001 Z001 P008 S034 R011 S040 L001
P001 N008 N025 N035A R014 N011 N012 A040 Q001 B001 D004 G005 S029 I009 V028 Z004 G017
N014 U033 N037 Y005 C010 E016 W024 S042 D028 F034 T016 N001 V031 G029 M036 S038 S045
""".split()

font = TTFont(sys.argv[1])
cmap = font.getBestCmap()
gs = font.getGlyphSet()
upm = font['head'].unitsPerEm
out = {}
for g in GARDINER:
    ch = unicodedata.lookup('EGYPTIAN HIEROGLYPH ' + g)
    name = cmap.get(ord(ch))
    if not name:
        print('missing', g, file=sys.stderr); continue
    pen = SVGPathPen(gs, ntos=lambda v: ('%.0f' % v))
    gs[name].draw(pen)
    bp = BoundsPen(gs); gs[name].draw(bp)
    b = bp.bounds or (0, 0, 0, 0)
    out[g] = {'c': ch, 'd': pen.getCommands(), 'w': gs[name].width, 'b': [round(v) for v in b]}

js = ('/* 自動產生：tools/extract_glyphs.py，來源 Noto Sans Egyptian Hieroglyphs (OFL 1.1) */\n'
      'window.GLYPHS = ' + json.dumps({'upm': upm, 'g': out}, ensure_ascii=False, separators=(',', ':')) + ';\n')
open('js/glyphs.js', 'w', encoding='utf-8').write(js)
print('glyphs:', len(out), 'bytes:', len(js.encode()))
