"""Génère les couleurs sombres à partir des styles du site, sans modifier
les images, les couleurs anatomiques ni la géométrie des composants.
"""
from pathlib import Path
import colorsys
import re

ROOT=Path(__file__).resolve().parents[1]
SOURCES=['style.css','study.css','anatomy.css','synapses.css']

def rgba(value):
    h=value.lstrip('#')
    if len(h) in (3,4):h=''.join(c*2 for c in h)
    return tuple(int(h[i:i+2],16)/255 for i in (0,2,4))+(int(h[6:8],16)/255 if len(h)==8 else 1,)

def paint(value,role):
    if value.lower()=='white':value='#ffffff'
    r,g,b,a=rgba(value)
    h,l,s=colorsys.rgb_to_hls(r,g,b)
    if a<.5:return value
    if role=='color':
        if l>.94 and s<.2:return '#ffffff'
        if s<.24:return '#e4edf4' if l<.34 else '#b7c7d3' if l<.60 else '#98adbd'
        if .20<h<.53:return '#98d9bd'
        if h<.07 or h>.88:return '#f1a3ad'
        if .07<=h<.20:return '#e3c38c'
        return '#abc6e8'
    if role.startswith('border'):
        if s<.22:return '#2c3e4c'
        if .20<h<.53:return '#376455'
        if h<.07 or h>.88:return '#80505b'
        if .07<=h<.20:return '#726044'
        return '#3a506c'
    # Conserver les arrière-plans déjà sombres, notamment le moteur 3D.
    if l<.42:return value
    if s<.19 or l>.98:return '#16232e'
    if .20<h<.53:return '#19382f'
    if h<.07 or h>.88:return '#3b252e'
    if .07<=h<.20:return '#352d21'
    return '#1d2e44'

COLOR=re.compile(r'#[0-9a-fA-F]{3,8}\b|\bwhite\b')
KEEP=('diagram-canvas','diagram-marker','diagram-target','diagram-leaders','home-brain')

def selectors(value):
    parts=[];start=0;depth=0
    for i,c in enumerate(value):
        if c in '([':depth+=1
        elif c in ')]':depth-=1
        elif c==',' and depth==0:parts.append(value[start:i].strip());start=i+1
    parts.append(value[start:].strip())
    return parts

def transform(source):
    out=[];pos=0
    while pos<len(source):
        left=source.find('{',pos)
        if left<0:break
        head=source[pos:left].strip();depth=1;right=left+1
        while right<len(source) and depth:
            if source[right]=='{':depth+=1
            elif source[right]=='}':depth-=1
            right+=1
        body=source[left+1:right-1];pos=right
        if head.startswith('@'):
            if head.startswith(('@media','@supports')):
                inner=transform(body)
                if inner:out.append(head+'{\n'+inner+'\n}')
            continue
        selected=[s for s in selectors(head) if s and ':root' not in s and not any(k in s for k in KEEP)]
        if not selected:continue
        props=[]
        for declaration in body.split(';'):
            if ':' not in declaration:continue
            prop,value=declaration.split(':',1);prop=prop.strip();value=value.strip()
            if prop not in ('color','background','background-color','border','border-color','border-top','border-bottom','border-left','border-right'):continue
            if not COLOR.search(value):continue
            changed=COLOR.sub(lambda m:paint(m[0],prop),value)
            if changed!=value:props.append(prop+':'+changed)
        if props:out.append(','.join(':root[data-theme="dark"] '+s for s in selected)+'{'+ ';'.join(props)+'}')
    return '\n'.join(out)

header='''/* Généré par tools/build_dark_theme.py. Les planches anatomiques restent intactes. */
:root[data-theme="dark"]{color-scheme:dark;--paper:#0d151e;--ink:#e4edf4;--muted:#a7bac8;--line:#2c3e4c;--canvas:#111925;--accent:#70c7b7;--green:#98d9bd;--green-pale:#19382f;--coral:#f1a3ad;color:var(--ink);background:var(--paper)}
:root[data-theme="light"]{color-scheme:light}
'''
footer='''
:root[data-theme="dark"] body{background:var(--paper);color:var(--ink)}
:root[data-theme="dark"] .brand-mark{background:#234250;color:#a4eadc}
:root[data-theme="dark"] .primary-button{background:#237e6d;border-color:#398f7c;color:white}
:root[data-theme="dark"] .primary-button:hover{background:#2b8b78}
:root[data-theme="dark"] .answer-option:has(input:checked) .answer-letter{background:#2f755b;color:white;border-color:#56947a}
:root[data-theme="dark"] .answer-option.incorrect .answer-letter{background:#92475c;color:white;border-color:#ba6a7c}
:root[data-theme="dark"] dialog{background:#16232e;color:#e4edf4}
:root[data-theme="dark"] select{background:#14212b;color:#e4edf4;border-color:#38505f}
:root[data-theme="dark"] .home-brain{border-radius:18px;background:white;padding:18px 22px;box-shadow:0 0 0 1px #ffffff14}
:root[data-theme="dark"] .home-brain img{mix-blend-mode:normal}
:root[data-theme="dark"] .home-image-note{color:#536675}
:root[data-theme="dark"] .integration-gauge,:root[data-theme="dark"] .nmda-lab-diagram{background:#f2f7f3;border-radius:7px}
.header-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}
.theme-toggle{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 12px;min-height:42px;border:1px solid var(--line);border-radius:8px;font-size:12px;font-weight:550;white-space:nowrap;background:transparent;color:var(--ink)}
.theme-toggle:hover{background:var(--green-pale)}
.theme-toggle svg{width:18px;height:18px;flex:none;stroke-width:1.7}
.theme-sun{display:none}
:root[data-theme="dark"] .theme-sun{display:block}
:root[data-theme="dark"] .theme-moon{display:none}
@media(max-width:970px){.header-actions{margin-left:auto;order:2}.header-actions .source-button{margin-left:0}}
@media(max-width:680px){.theme-toggle-text{display:none}.theme-toggle,.header-actions .source-button{width:42px;height:42px;min-height:42px;padding:9px}.header-actions .source-button{font-size:0;gap:0;justify-content:center;border:1px solid var(--line)}.header-actions .source-button span{font-size:19px}.header-actions{gap:6px}}
@media(max-width:380px){.topbar{padding-left:14px;padding-right:14px;gap:8px}.brand{gap:8px}.brand-mark{width:34px;height:38px;font-size:23px}.brand strong{font-size:14px}.brand small{font-size:9px}}
'''
blocks=[]
for name in SOURCES:
    source=re.sub(r'/\*[\s\S]*?\*/','',(ROOT/'dist'/name).read_text())
    blocks.append('/* '+name+' */\n'+transform(source))
output=header+'\n'.join(blocks)+footer
(ROOT/'dist/theme.css').write_text(output)
print(f'Thème sombre généré : {len(output)} caractères, {len(blocks)} feuilles de styles couvertes.')
