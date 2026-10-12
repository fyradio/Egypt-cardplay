"""把卡牌用到的字切成小字型檔（只留用到的字），輸出到 assets/fonts/。
用法：python3 tools/build_fonts.py <NotoSerifCJK-Bold.ttc> <Cinzel[wght].ttf>
新增卡片文字後要重跑一次，否則新字會改用系統字型。
字型授權：皆為 SIL Open Font License 1.1。
"""
import sys, glob, re
from fontTools.ttLib import TTCollection, TTFont
from fontTools import subset
from fontTools.varLib import instancer

ttc_path, cinzel_path = sys.argv[1], sys.argv[2]

# 收集用到的中文字（所有 html / js / 資料檔）
chars = set()
for p in glob.glob('*.html') + glob.glob('js/*.js') + glob.glob('data/**/*.js', recursive=True) + glob.glob('data/**/*.json', recursive=True):
    if p.endswith('glyphs.js'):
        continue
    chars |= set(open(p, encoding='utf-8').read())
chars |= set('０１２３４５６７８９ＡＢＣ一二三四五六七八九十百千零　、。，「」『』（）：；！？—…・｜')
chars |= set(chr(c) for c in range(0x20, 0x7f))
text = ''.join(sorted(c for c in chars if ord(c) >= 0x20 and not (0x13000 <= ord(c) <= 0x1342F)))

def save(font, unicodes_text, out):
    opts = subset.Options()
    opts.flavor = 'woff'
    opts.layout_features = ['*']
    opts.name_IDs = ['*']
    opts.notdef_outline = True
    sub = subset.Subsetter(opts)
    sub.populate(text=unicodes_text)
    sub.subset(font)
    font.flavor = 'woff'
    font.save(out)
    import os
    print(out, os.path.getsize(out), 'bytes')

coll = TTCollection(ttc_path)
tc = None
for f in coll.fonts:
    names = [n.toUnicode() for n in f['name'].names if n.nameID in (1, 4)]
    if any('Serif CJK TC' in n for n in names):
        tc = f; break
assert tc is not None, 'TC face not found'
save(tc, text, 'assets/fonts/serif-tc.woff')

cz = TTFont(cinzel_path)
cz = instancer.instantiateVariableFont(cz, {'wght': 700})
save(cz, ''.join(chr(c) for c in range(0x20, 0x7f)), 'assets/fonts/cinzel.woff')
print('chars:', len(text))
