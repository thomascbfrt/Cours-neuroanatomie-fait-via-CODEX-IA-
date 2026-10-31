"""Schémas exacts du cours 4 et masquage des seuls libellés de l’image fournie."""
from pathlib import Path
from io import BytesIO
import argparse
import json,subprocess
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.patches import Rectangle, FancyBboxPatch, Circle, Ellipse, FancyArrowPatch
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist/assets/diagrams'
parser=argparse.ArgumentParser();parser.add_argument('--review-dir',type=Path)
args=parser.parse_args()
if args.review_dir:args.review_dir.mkdir(parents=True,exist_ok=True)
font_manager.fontManager.addfont(OUT.parent/'dm-sans-latin.ttf')
plt.rcParams.update({'font.family':['DM Sans','DejaVu Sans'],'svg.fonttype':'path'})
GREEN='#367c63';BLUE='#4b83b0';RED='#d6485a';INK='#294a3c';MUTED='#83978c';PURPLE='#a678b5'

def base():
    fig=plt.figure(figsize=(10,7.2),facecolor='white')
    ax=fig.add_axes([0,0,1,1]);ax.set(xlim=(0,100),ylim=(72,0));ax.axis('off')
    return fig,ax
def text(ax,x,y,label,size=15,color=INK,**kw):
    ax.text(x,y,label,fontsize=size,color=color,ha=kw.pop('ha','center'),va='center',**kw)
def arrow(ax,a,b,color=BLUE,width=2):
    ax.add_patch(FancyArrowPatch(a,b,arrowstyle='-|>',mutation_scale=17,color=color,lw=width))
def finish(fig,name,learn):
    suffix='fr' if learn else 'practice'
    fig.savefig(OUT/f'{name}-{suffix}.svg',format='svg')
    if args.review_dir:fig.savefig(args.review_dir/f'{name}-{suffix}.png',dpi=120)
    plt.close(fig)

def synapse(learn):
    fig,ax=base()
    ax.add_patch(FancyBboxPatch((14,7),72,32,boxstyle='round,pad=0,rounding_size=8',fc='#edf5f1',ec=GREEN,lw=2))
    ax.add_patch(Rectangle((42,0),13,12,fc='#edf5f1',ec='none'))
    ax.plot([42,42],[0,7],color=GREEN,lw=2);ax.plot([55,55],[0,7],color=GREEN,lw=2)
    ax.add_patch(Rectangle((14,52),72,19,fc='#eef3f9',ec=BLUE,lw=2))
    for x,y in [(46,22),(63,12),(74,29),(34,15)]:
        ax.add_patch(Circle((x,y),4.1,fc='#fef4e8',ec='#cc9760',lw=2))
        for dx,dy in [(-1.2,0),(.8,-1),(1,1)]:ax.add_patch(Circle((x+dx,y+dy),.5,fc=RED,ec='none'))
    ax.add_patch(Ellipse((68,21),13,5,angle=-20,fc='#e9d5a5',ec='#bd9559',lw=1.5))
    ax.plot([64,66,68,70,72],[21,19.6,22,20,21.5],color='#aa895c',lw=1)
    # Canal CaV traversant la membrane présynaptique ; Ca2+ va vers le bouton.
    for x in [25.1,28.9]:ax.add_patch(FancyBboxPatch((x,34),1.8,7,boxstyle='round,pad=.15',fc=BLUE,ec=BLUE))
    arrow(ax,(27.4,48.5),(27.4,30.5));text(ax,23,46.5,'Ca²⁺',13,BLUE)
    # Vésicule préparée / zone de fusion et complexe de protéines abstrait.
    ax.add_patch(Circle((52,33.5),4,fc='#fef4e8',ec='#cc9760',lw=2))
    ax.plot([49,50.5,51,52,53,54.5],[36,38.5,35.5,38.5,35.5,38],color=PURPLE,lw=3)
    arrow(ax,(52,39.5),(52,49),RED)
    for x,y in [(49,43),(54,44),(50,48),(57,47)]:ax.add_patch(Circle((x,y),.7,fc=RED,ec='none'))
    for x in [49.4,54]:ax.add_patch(FancyBboxPatch((x,50),2,8,boxstyle='round,pad=.1',fc=GREEN,ec=GREEN))
    arrow(ax,(52.7,57),(52.7,64),GREEN)
    if learn:
        text(ax,21,21,'Bouton\nprésynaptique',13)
        text(ax,45,12,'Vésicule',13)
        text(ax,71,17,'Mitochondrie',12)
        text(ax,13,43,'Canal CaV',12,BLUE)
        text(ax,61,35,'SNARE',12,PURPLE)
        text(ax,69,45,'Neurotransmetteur',12,RED)
        text(ax,83,48,'Fente',12)
        text(ax,63,57,'Récepteur',13,GREEN)
        text(ax,47,68,'Compartiment postsynaptique',14,BLUE)
    else:
        text(ax,71,66,'Réponse électrique',12,MUTED)
    finish(fig,'synapse',learn)

def postsynaptic(learn):
    fig=plt.figure(figsize=(10,8),facecolor='white')
    plot=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {PSP_PLOT} from './dist/synaptic-model.js'; console.log(JSON.stringify(PSP_PLOT));"],cwd=ROOT))
    panels={name:fig.add_axes([a['left'],a['bottom'],a['width'],a['height']]) for name,a in plot.items()}
    ap=panels['ap'];ps=panels['pps']
    t=np.array([0,1.8,2,2.25,2.4,2.5,2.7,2.85,3,3.25,4,5]);v=np.array([-70,-70,-50,0,30,20,-25,-45,-70,-80,-70,-70])
    ap.plot(t,v,color=BLUE,lw=3);ap.set(xlim=(0,plot['ap']['timeMax']),ylim=(plot['ap']['min'],plot['ap']['max']),ylabel='Vm (mV)',xlabel='Temps (ms)')
    tt=np.linspace(0,60,601);elapsed=np.maximum(tt-5,0);wave=np.where(tt>=5,(elapsed/5)*np.exp(1-elapsed/5),0)
    ps.plot(tt,-70+wave,color=GREEN,lw=3);ps.plot(tt,-70-2*wave,color=RED,lw=3)
    ps.set(xlim=(0,plot['pps']['timeMax']),ylim=(plot['pps']['min'],plot['pps']['max']),ylabel='Vm (mV)',xlabel='Temps (ms)')
    for ax in [ap,ps]:
        ax.axhline(-70,color=MUTED,lw=1,ls='--');ax.spines[['top','right']].set_visible(False)
        ax.tick_params(labelsize=12);ax.xaxis.label.set_size(14);ax.yaxis.label.set_size(14)
    ap.set_title('Potentiel d’action : signal régénéré' if learn else 'Signal A · échelle rapide',fontsize=17,pad=16,color=INK)
    ps.set_title('PPSE (+1 mV) et PPSI (−2 mV) : signaux gradués' if learn else 'Signaux B et C · petite amplitude',fontsize=16,pad=14,color=INK)
    if learn:
        ps.text(18,-69.3,'PPSE',fontsize=15,color=GREEN);ps.text(18,-71.7,'PPSI',fontsize=15,color=RED)
    fig.text(.5,.025,'Courbes pédagogiques : les axes et les durées diffèrent entre les panneaux.',ha='center',fontsize=12,color=MUTED)
    suffix='fr' if learn else 'practice';fig.savefig(OUT/f'postsynaptic-{suffix}.svg')
    if args.review_dir:fig.savefig(args.review_dir/f'postsynaptic-{suffix}.png',dpi=120)
    plt.close(fig)

def nmda(learn):
    fig,ax=base()
    ax.add_patch(Rectangle((5,6),90,23,fc='#f1f6fb',ec='none'))
    ax.add_patch(Rectangle((5,49),90,20,fc='#eef6f1',ec='none'))
    for y in [34,44]:
        for x in range(6,96,4):
            if 44<=x<=62:continue
            ax.add_patch(Circle((x,y),1,fc='#d6c6a7',ec='none'))
            ax.plot([x,x],[35,43],color='#d6c6a7',lw=2)
    for x in [44,56]:ax.add_patch(FancyBboxPatch((x,29),6,19,boxstyle='round,pad=.1,rounding_size=2',fc=GREEN,ec=GREEN))
    ax.add_patch(Circle((52,39),2.7,fc=PURPLE,ec='white',lw=2));text(ax,52,39,'Mg²⁺',10,'white')
    ax.add_patch(Circle((39,27),2.4,fc=RED,ec='white',lw=1.5))
    ax.add_patch(Circle((65,27),2.4,fc='#caab53',ec='white',lw=1.5))
    text(ax,52,17,'Ca²⁺',19,BLUE);arrow(ax,(52,21),(52,33),BLUE)
    ax.plot([49.5,54.5],[34,34],color=PURPLE,lw=3)
    if learn:
        text(ax,21,18,'Glutamate',16,RED);arrow(ax,(30,20),(38,26),RED,1.5)
        text(ax,78,17,'Coagoniste\nglycine / D-sérine',14,'#9e833b');arrow(ax,(72,22),(66,26),'#b39b50',1.5)
        text(ax,73,40,'Récepteur NMDA',15,GREEN)
        text(ax,28,48,'Bloc Mg²⁺',15,PURPLE)
        text(ax,51,59,'Repos : blocage au potentiel négatif',15)
    else:text(ax,51,60,'État illustré : membrane au repos',14,MUTED)
    text(ax,11,10,'Extérieur',11,MUTED,ha='left');text(ax,11,65,'Intérieur',11,MUTED,ha='left')
    finish(fig,'nmda',learn)

def gaba(learn):
    fig,ax=base()
    ax.add_patch(Rectangle((5,6),90,23,fc='#f1f6fb',ec='none'))
    ax.add_patch(Rectangle((5,49),90,20,fc='#eef6f1',ec='none'))
    for y in [34,44]:
        for x in range(6,96,4):
            if 44<=x<=62:continue
            ax.add_patch(Circle((x,y),1,fc='#d6c6a7',ec='none'))
            ax.plot([x,x],[35,43],color='#d6c6a7',lw=2)
    for x in [44,56]:ax.add_patch(FancyBboxPatch((x,29),6,19,boxstyle='round,pad=.1,rounding_size=2',fc=GREEN,ec=GREEN))
    ax.add_patch(Circle((39,27),2.4,fc=PURPLE,ec='white',lw=1.5))
    text(ax,52,17,'Cl⁻',20,BLUE);arrow(ax,(52,22),(52,58),BLUE)
    if learn:
        text(ax,25,19,'GABA',18,PURPLE);arrow(ax,(31,21),(38,26),PURPLE,1.5)
        text(ax,75,38,'GABA_A',18,GREEN)
        text(ax,53,64,'Vm tend vers ECl',16)
    else:text(ax,53,64,'Variation du potentiel postsynaptique',13,MUTED)
    text(ax,11,10,'Extérieur',11,MUTED,ha='left');text(ax,11,55,'Intérieur',11,MUTED,ha='left')
    text(ax,74,11,'Modèle : Vm = −70 mV\nECl = −80 mV',12)
    finish(fig,'gaba',learn)

for learn in [True,False]:synapse(learn);postsynaptic(learn);nmda(learn);gaba(learn)

# Ne masque que les mots, pas les flèches ni les régions de l’image d’origine.
image=Image.open(OUT/'motor-cortices-source.png').convert('RGB')
draw=ImageDraw.Draw(image)
for box in [(38,176,198,259),(106,119,228,165),(155,58,322,104),
            (306,19,460,65),(218,563,303,587),(171,587,350,613),(638,13,795,62),
            (642,80,714,108),(724,81,791,109)]:
    draw.rectangle(box,fill=(255,255,204))
encoded=BytesIO();image.save(encoded,format='WEBP',lossless=True)
with Image.open(BytesIO(encoded.getvalue())) as check:check.load()
(OUT/'motor-cortices-practice.webp').write_bytes(encoded.getvalue())
if args.review_dir:image.save(args.review_dir/'motor-cortices-practice.png')
print('8 SVG et 1 image d’exercice créés ; illustration fournie conservée intacte.')
