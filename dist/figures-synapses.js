import {postsynapticPoint} from './synaptic-model.js';
const p=(label,x,y,explain,structure)=>({label,x,y,explain,structure});
const plotPart=(label,kind,t,v,explain,structure)=>{const point=postsynapticPoint(kind,t,v);return p(label,point.x,point.y,explain,structure);};
const cell=(label,x,y,explain,structure)=>p(label,x,y/72*100,explain,structure);
const schema=(id,title,parts,source,note,extra={})=>({id,title,scope:'c4',image:`./assets/diagrams/${id}-practice.svg`,learnImage:`./assets/diagrams/${id}-fr.svg`,alt:'Schéma pédagogique à l’échelle cellulaire, avec version sans noms pour les exercices.',orientation:'Échelle cellulaire · schéma, pas un enregistrement expérimental',credit:'Schéma pédagogique du cours 4 · références NCBI',source,changes:'Dessin vectoriel créé pour les notions du cours ; mêmes positions avec et sans noms.',note,parts,...extra});
export const SYNAPSE_FIGURES=[
{id:'motorCortices',title:'Cortex moteurs et régions associatives',scope:'c1',scopes:['c2'],image:'./assets/diagrams/motor-cortices-practice.webp',learnImage:'./assets/diagrams/motor-cortices-source.png',original:'./assets/diagrams/motor-cortices-source.png',originalLabel:'Ouvrir l’image fournie ↗',alt:'Image fournie montrant les cortex moteurs, somatosensoriel et associatifs sur des vues latérale et médiale.',orientation:'Vue latérale et face médiale représentées · avant à gauche',credit:'Image fournie dans la conversation · source éditoriale non indiquée',changes:'Image originale conservée. Seuls les noms sont masqués dans la version de révision ; couleurs et flèches restent présentes.',note:'La figure juxtapose des surfaces latérale et médiale. La SMA est surtout médiale : son repère de couleur ne doit pas être interprété comme une frontière latérale exacte. Le cortex pariétal posterior, dont les aires 5 et 7, contribue aux traitements associatifs sensorimoteurs.',showTarget:true,markerPositions:[[21,58],[30,43],[31,29],[43,34],[46,55],[56,27],[66,46]],parts:[
p('Préfrontal dorsolatéral',26,44.6,'Contribue au maintien d’objectifs, à la mémoire de travail et au contrôle de l’action ; ce n’est pas une aire motrice primaire.','dlpfc'),
p('Cortex prémoteur',35,39.9,'Territoires moteurs secondaires de la face latérale, en avant de M1 : préparation et organisation de gestes.','premotor'),
p('Aire motrice supplémentaire · SMA',34.5,32.3,'Aire motrice secondaire surtout sur la face médiale frontale. Elle participe notamment à l’organisation et à l’enchaînement des mouvements.','sma'),
p('Cortex moteur primaire · M1',43.6,32.6,'Principalement dans le gyrus précentral, devant le sillon central : contribution à la commande motrice descendante.','m1'),
p('Cortex somatosensoriel primaire · S1',45.2,50,'Principalement dans le gyrus postcentral, derrière le sillon central : traitement des informations corporelles.','s1'),
p('Pariétal postérieur · aire 5',52.2,36.1,'Repère associatif pariétal impliqué notamment dans l’intégration somatosensorielle et sensorimotrice.','somaticAssociation'),
p('Pariétal postérieur · aire 7',60.9,47.9,'Repère associatif pariétal participant à des traitements spatiaux et à la coordination des informations pour l’action.','somaticAssociation')
]},
schema('synapse','Une synapse chimique, élément par élément',[
cell('Bouton présynaptique',20,21,'Extrémité axonale qui reçoit le PA et possède la machinerie de libération.','terminals'),
cell('Vésicule synaptique',46,22,'Petit compartiment membranaire contenant un neurotransmetteur.','vesicles'),
cell('Mitochondrie',68,21,'Participe à la production d’ATP et au fonctionnement du compartiment présynaptique.'),
cell('Canal Ca²⁺ voltage-dépendant',27.4,37,'Son ouverture lors de la dépolarisation permet l’entrée présynaptique de Ca²⁺.','calciumChannels'),
cell('Machinerie de fusion · SNARE',52,37.5,'Les SNARE participent à la fusion ; la synaptotagmine détecte le Ca²⁺ déclenchant la libération rapide.','snare'),
cell('Neurotransmetteur libéré',55,46,'Diffuse dans la fente et se fixe sur des récepteurs compatibles.','synapse'),
cell('Fente synaptique',77,46,'Espace extracellulaire entre les deux membranes d’une synapse chimique.','synapse'),
cell('Récepteur postsynaptique',52.5,55,'La fixation du neurotransmetteur peut modifier une conductance et la réponse de la cellule.','ionChannels'),
cell('Compartiment postsynaptique',74,65,'Reçoit la réponse graduée, qui contribue à l’intégration d’autres entrées.','epsp')
],'https://pubmed.ncbi.nlm.nih.gov/24274737/','Schéma de principe : tailles et positions relatives des protéines ne sont pas à l’échelle. Le calcium entre dans le bouton du haut ; le neurotransmetteur atteint les récepteurs de la cellule du bas.',{markerPositions:[[8,20],[44,9],[82,26],[10,58],[39,58],[66,65],[90,64],[42,84],[81,92]],showTarget:true}),
schema('postsynaptic','Comparer PA, PPSE et PPSI',[
plotPart('Pic du potentiel d’action','ap',2.4,30,'Pic schématique de +30 mV dans le panneau rapide ; son amplitude ne code pas simplement l’intensité du stimulus.','membrane'),
plotPart('PPSE · dépolarisation graduée','pps',10,-69,'Pic du signal excitateur à −69 mV : +1 mV par rapport au repos illustré.','epsp'),
plotPart('PPSI · hyperpolarisation du modèle','pps',10,-72,'Pic du signal inhibiteur à −72 mV : −2 mV dans ce modèle ; l’inhibition réelle peut aussi agir par shunt.','ipsp'),
plotPart('Potentiel de repos illustratif','pps',2,-70,'La ligne de référence à −70 mV permet de lire les variations graduées dans le panneau inférieur.','membrane')
],'https://www.ncbi.nlm.nih.gov/books/NBK11117/','Les deux panneaux ont des axes et des durées différents. PA dessiné sur 5 ms ; PPS schématiques sur 60 ms. +1 et −2 mV sont les amplitudes choisies, pas des constantes biologiques.',{scopes:['c3']}),
schema('nmda','NMDA au repos : ligands et bloc Mg²⁺',[
cell('Glutamate',39,27,'Ligand du récepteur NMDA ; sa présence seule ne supprime pas le blocage au magnésium.','glutamate'),
cell('Coagoniste · glycine ou D-sérine',65,27,'Un coagoniste compatible participe à l’activation du récepteur NMDA.'),
cell('Blocage par Mg²⁺',52,39,'Aux potentiels négatifs, Mg²⁺ bloque fortement le pore ; une dépolarisation soulage ce bloc.','nmda'),
cell('Récepteur NMDA',59,39,'Canal glutamatergique dépendant de ligands et modulé par un blocage dépendant du voltage.','nmda'),
cell('Ca²⁺ extracellulaire',52,17,'Peut entrer par NMDA lorsque les conditions d’ouverture et de flux sont réunies. Ce calcium est ici postsynaptique.','calcium')
],'https://www.ncbi.nlm.nih.gov/books/NBK507245/','État représenté : membrane postsynaptique au repos, blocage au Mg²⁺. Dépolarisation seule ou glutamate seul ne suffisent pas dans le modèle d’activation présenté.',{markerPositions:[[26,24],[79,24],[31,67],[78,58],[55,9]],showTarget:true}),
schema('gaba','GABA_A et chlorure dans le modèle du cours',[
cell('GABA',39,27,'Neurotransmetteur qui se fixe ici sur un récepteur GABA_A.','gaba'),
cell('Récepteur GABA_A',59,39,'Récepteur ionotrope augmentant une conductance anionique, principalement au Cl⁻.','ionChannels'),
cell('Chlorure Cl⁻',52,17,'Dans les valeurs choisies (Vm −70 mV, ECl −80 mV), son flux net est entrant et tend à hyperpolariser.'),
cell('Potentiel postsynaptique',53,59,'Dans cet exemple, Vm tend vers un potentiel plus négatif. Dans d’autres conditions, l’inhibition peut aussi agir par shunt.','ipsp')
],'https://www.ncbi.nlm.nih.gov/books/NBK11117/','Exemple de GABA_A : Vm −70 mV, ECl −80 mV. Les valeurs varient ; l’effet du GABA ne se réduit pas toujours à cette hyperpolarisation. GABA_B est métabotrope et n’est pas dessiné ici.',{markerPositions:[[27,27],[78,55],[55,8],[72,86]],showTarget:true})
];
