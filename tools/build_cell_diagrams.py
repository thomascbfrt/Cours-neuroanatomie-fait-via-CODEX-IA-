"""Schémas vectoriels pédagogiques du cours 3, sans données expérimentales."""
from pathlib import Path
import argparse
import json, subprocess
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyBboxPatch, Circle, FancyArrowPatch
from matplotlib import font_manager
from scipy.interpolate import PchipInterpolator

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist/assets/diagrams'
parser=argparse.ArgumentParser()
parser.add_argument('--review-dir',type=Path)
args=parser.parse_args()
if args.review_dir:args.review_dir.mkdir(parents=True,exist_ok=True)
font_manager.fontManager.addfont(ROOT/'dist/assets/dm-sans-latin.ttf')
plt.rcParams.update({'font.family':['DM Sans','DejaVu Sans'],'svg.fonttype':'path','font.size':16})
INK='#243e35';BLUE='#497eac';GREEN='#347b62';RED='#d94d60';MUTED='#74887c'

def text(ax,x,y,s,size=16,color=INK,**kw):
    ax.text(x,y,s,fontsize=size,color=color,ha=kw.pop('ha','center'),va='center',**kw)

def canvas():
    fig=plt.figure(figsize=(10,7.2),facecolor='white')
    ax=fig.add_axes([0,0,1,1]);ax.set(xlim=(0,100),ylim=(72,0));ax.axis('off')
    ax.add_patch(Rectangle((2,2),96,24,facecolor='#f0f5f9',edgecolor='none'))
    ax.add_patch(Rectangle((2,44),96,26,facecolor='#eff6f1',edgecolor='none'))
    for x in range(4,98,4):
        ax.add_patch(Circle((x,29),1.2,facecolor='#d7c5a4',edgecolor='none'))
        ax.add_patch(Circle((x,41),1.2,facecolor='#d7c5a4',edgecolor='none'))
        for dx in [-.45,.45]:
            ax.plot([x+dx,x+dx],[30.3,34.5],color='#cbb990',lw=2)
            ax.plot([x+dx,x+dx],[35.5,39.7],color='#cbb990',lw=2)
    return fig,ax

def ion(ax,x,y,s,color):
    ax.add_patch(Circle((x,y),2.4,facecolor='white',edgecolor=color,lw=1.4));text(ax,x,y,s,12,color)

def export(fig,name,labels):
    suffix='fr' if labels else 'practice'
    fig.savefig(OUT/f'{name}-{suffix}.svg',format='svg',metadata={'Title':f'{name} · schéma pédagogique du cours 3'})
    if args.review_dir:fig.savefig(args.review_dir/f'{name}-{suffix}.png',dpi=110)
    plt.close(fig)

for labelled in [False,True]:
    fig,ax=canvas()
    for x,y in [(15,14),(28,19),(44,13),(59,20),(74,14),(88,22)]:ion(ax,x,y,'Na⁺',BLUE)
    ion(ax,85,7,'K⁺',GREEN)
    for x,y in [(15,56),(29,63),(44,53),(58,62),(75,53),(89,64)]:ion(ax,x,y,'K⁺',GREEN)
    ion(ax,8,65,'Na⁺',BLUE)
    for x,color in [(36,BLUE),(66,GREEN)]:
        ax.add_patch(FancyBboxPatch((x-5,27),10,16,boxstyle='round,pad=.3,rounding_size=2',facecolor=color,edgecolor='none',zorder=3))
        ax.add_patch(Rectangle((x-1,26),2,18,facecolor='white',edgecolor='none',zorder=4))
    if labelled:
        text(ax,50,5,'Milieu extracellulaire',18)
        text(ax,50,68,'Milieu intracellulaire',18)
        text(ax,13,35,'Bicouche\nlipidique',12)
        text(ax,36,47,'Canal Na⁺',13,BLUE)
        text(ax,66,47,'Canal K⁺',13,GREEN)
    export(fig,'membrane',labelled)

    fig,ax=canvas()
    ax.add_patch(FancyBboxPatch((40,26),20,18,boxstyle='round,pad=.3,rounding_size=3',facecolor='#8da995',edgecolor='#52775d',lw=1.5,zorder=3))
    ax.add_patch(FancyArrowPatch((44,54),(44,14),arrowstyle='-|>',mutation_scale=28,lw=3,color=BLUE,zorder=4))
    ax.add_patch(FancyArrowPatch((57,15),(57,56),arrowstyle='-|>',mutation_scale=28,lw=3,color=GREEN,zorder=4))
    for x,y in [(34,13),(39,10),(44,8)]:ion(ax,x,y,'Na⁺',BLUE)
    for x,y in [(60,60),(67,61)]:ion(ax,x,y,'K⁺',GREEN)
    ax.add_patch(FancyArrowPatch((80,52),(61,44),arrowstyle='-|>',mutation_scale=23,lw=2,color='#ba8d37',zorder=4))
    ax.add_patch(Circle((84,53),4,facecolor='#f9ebc8',edgecolor='#d8b873',lw=1.5,zorder=4))
    if labelled:
        text(ax,50,4,'Extérieur',17)
        text(ax,50,68,'Intérieur',17)
        text(ax,21,13,'3 Na⁺\nsortent',15,BLUE)
        text(ax,36,62,'2 K⁺\nentrent',15,GREEN)
        text(ax,50,35,'Pompe\nNa⁺/K⁺',13,'white')
        text(ax,84,53,'ATP',11,'#8f6b2f',zorder=5)
        text(ax,84,62,'ATP → ADP + Pi',12,'#8f6b2f')
    export(fig,'pump',labelled)

js="import {SIGNAL_POINTS,PHASES,PLOT} from './dist/signals.js';process.stdout.write(JSON.stringify({points:SIGNAL_POINTS,phases:PHASES,plot:PLOT}));"
data=json.loads(subprocess.check_output(['node','--input-type=module','-e',js],cwd=ROOT))
points=np.array(data['points']);curve=PchipInterpolator(points[:,0],points[:,1]);p=data['plot']
for labelled in [False,True]:
    fig=plt.figure(figsize=(10,7.2),facecolor='white')
    ax=fig.add_axes([p['left'],p['bottom'],p['right']-p['left'],p['top']-p['bottom']])
    ax.set(xlim=(0,p['timeMax']),ylim=(p['voltageMin'],p['voltageMax']))
    x=np.linspace(0,5,1000);ax.plot(x,curve(x),color=RED,lw=3.5)
    ax.axhline(-70,color='#99b4a0',ls='--',lw=1)
    ax.axhline(-50,color='#cbb984',ls=':',lw=1.5)
    ax.set_xlabel('Temps illustratif (ms)',fontsize=16,labelpad=9)
    ax.set_ylabel('Potentiel Vm (mV)',fontsize=16,labelpad=10)
    ax.set_yticks([-90,-70,-50,0,30],['−90','−70','−50','0','+30'])
    ax.tick_params(colors=MUTED,labelsize=13)
    for side in ['top','right']:ax.spines[side].set_visible(False)
    for side in ['left','bottom']:ax.spines[side].set_color('#b3c4b7')
    ax.grid(axis='y',color='#edf2ed',lw=.8)
    ax.text(.08,-47,'Seuil illustratif',color='#9c8b56',fontsize=11)
    if labelled:
        for phase,(dx,dy) in zip(data['phases'],[(0,16),(-.8,25),(1,29),(.65,-9)]):
            ax.annotate(phase['label'],(phase['t'],phase['v']),xytext=(phase['t']+dx,phase['v']+dy),ha='center',fontsize=13,color=INK,arrowprops={'arrowstyle':'-','color':'#799181','lw':1})
    export(fig,'actionPotential',labelled)

print('Generated membrane, pump and action-potential diagrams (labelled + practice).')
