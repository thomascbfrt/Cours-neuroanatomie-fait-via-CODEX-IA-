// Modèles pédagogiques explicitement bornés ; aucune mesure expérimentale.
export const INTEGRATION_MODEL={rest:-70,threshold:-50};
export const PSP_PLOT={ap:{left:.15,bottom:.57,width:.77,height:.32,timeMax:5,min:-95,max:45},pps:{left:.15,bottom:.12,width:.77,height:.31,timeMax:60,min:-72.7,max:-68.4}};
export function postsynapticPoint(kind,t,v){const a=PSP_PLOT[kind];if(!a)throw new Error('Panneau inconnu');return {x:(a.left+t/a.timeMax*a.width)*100,y:(1-a.bottom-(v-a.min)/(a.max-a.min)*a.height)*100};}
export function integrate({nE=20,nI=0,aE=1,aI=2}={}){
 if(!Number.isInteger(nE)||nE<0||nE>80||!Number.isInteger(nI)||nI<0||nI>10||![.5,1,1.5,2].includes(aE)||![1,2,3].includes(aI))throw new Error('Paramètres du modèle invalides');
 const excitation=nE*aE,inhibition=nI*aI,net=excitation-inhibition,voltage=INTEGRATION_MODEL.rest+net;
 return {excitation,inhibition,net,voltage,reached:voltage>=INTEGRATION_MODEL.threshold,minimum:Math.ceil((INTEGRATION_MODEL.threshold-INTEGRATION_MODEL.rest+inhibition)/aE),missing:Math.max(0,INTEGRATION_MODEL.threshold-voltage)};
}
export function nmdaState({glutamate=true,coagonist=true,depolarized=false}={}){
 return {blocked:!depolarized,ligands:Boolean(glutamate&&coagonist),conducts:Boolean(glutamate&&coagonist&&depolarized)};
}
export const RELEASE_STEPS=[
{label:'PA au bouton',x:47,y:7/72*100,explain:'Le PA atteint la terminaison et dépolarise sa membrane. Son arrivée ne garantit pas encore un PA postsynaptique.'},
{label:'Canaux CaV',x:27.4,y:37/72*100,explain:'La dépolarisation ouvre des canaux Ca²⁺ voltage-dépendants, proches des sites de libération.'},
{label:'Ca²⁺ entre',x:27.4,y:31/72*100,explain:'Le calcium entre dans le compartiment présynaptique et augmente localement près des vésicules préparées.'},
{label:'Capteur et SNARE',x:52,y:37.5/72*100,explain:'Le Ca²⁺ agit sur un capteur comme la synaptotagmine ; les protéines SNARE participent à la fusion des membranes.'},
{label:'Exocytose',x:52,y:40/72*100,explain:'Une vésicule fusionne avec la membrane et libère son neurotransmetteur dans la fente.'},
{label:'Récepteur cible',x:52.5,y:55/72*100,explain:'Le neurotransmetteur diffuse puis se fixe sur un récepteur compatible, qui modifie une conductance ou une cascade cellulaire.'},
{label:'PPS puis intégration',x:74,y:65/72*100,explain:'La réponse postsynaptique se combine aux autres entrées. Un nouveau PA dépend des conditions d’intégration et de seuil.'}
];
