import {PHASES,plotPoint} from './signals.js';
import {ANATOMY_FIGURES} from './anatomy-data.js';
import {SYNAPSE_FIGURES} from './figures-synapses.js';
const part=(label,x,y,explain,structure)=>({label,x,y,explain,structure});
const openstax=(file,version='4.0')=>({credit:'OpenStax · Anatomy & Physiology',source:'https://commons.wikimedia.org/wiki/File:'+file,license:'CC BY '+version,licenseUrl:'https://creativecommons.org/licenses/by/'+version+'/',changes:'Libellés traduits en français, masqués pour les exercices ; numéros interactifs ajoutés. Anatomie et traits de repérage conservés.'});
export const FIGURES=[
{id:'lobes',title:'Lobes et repères de surface',scope:'c1',image:'./assets/diagrams/lobes-practice.webp',original:'./assets/diagrams/lobes.jpg',alt:'Vue latérale gauche du cerveau, avant à gauche, arrière à droite.',orientation:'Vue latérale gauche · avant à gauche',note:'Les points localisent des repères. Ils ne dessinent pas les frontières exactes d’une aire fonctionnelle.',...openstax('1306_Lobes_of_Cerebral_CortexN.jpg'),parts:[
part('Lobe frontal',25,36,'En avant du sillon central : contrôle, planification et territoires moteurs.','frontal'),
part('Lobe pariétal',56,35,'Derrière le sillon central : sensibilité et traitements spatiaux.','parietal'),
part('Lobe temporal',40,58,'Sous le sillon latéral : audition et plusieurs traitements associatifs.','temporal'),
part('Lobe occipital',69,50,'À l’arrière : plusieurs régions de traitement visuel. V1 est surtout sur la face médiale.','occipital'),
part('Cervelet',60,69,'Sous les régions occipitales, derrière le tronc cérébral : coordination et adaptation.','cerebellum'),
part('Gyrus précentral · repère M1',43,24,'Juste devant le sillon central : principal repère anatomique de M1.','m1'),
part('Gyrus postcentral · repère S1',54,27,'Juste derrière le sillon central : principal repère anatomique de S1.','s1'),
part('Sillon latéral',54,43,'Sépare le temporal des régions situées au-dessus. L’insula se trouve au fond.','lateral')
]},
{id:'diencephalon',title:'Thalamus, hypothalamus et hypophyse',scope:'c2',image:'./assets/diagrams/diencephalon-practice.webp',original:'./assets/diagrams/diencephalon.jpg',alt:'Schéma de la face médiale du cerveau montrant le diencéphale.',orientation:'Vue médiale schématique · avant à gauche',note:'Les masses profondes sont projetées pour faciliter le repérage. Il s’agit d’une illustration, pas d’une coupe IRM individuelle.',...openstax('1310_Diencephalon.jpg'),parts:[
part('Thalamus',49,50,'Ensemble de noyaux : relais et modulation dans des boucles sensorielles, motrices et cognitives.','thalamus'),
part('Hypothalamus',43,60,'Sous le thalamus : régulations autonomes, hormonales et homéostasie.','hypothalamus'),
part('Hypophyse',38,73,'Glande reliée à l’hypothalamus, située en dessous.','pituitary'),
part('Corps calleux',53,39,'L’arche de substance blanche relie les deux hémisphères.','callosum')
]},
{id:'limbic',title:'Mémoire et valeur émotionnelle',scope:'c2',image:'./assets/diagrams/limbic-practice.webp',original:'./assets/diagrams/limbic.jpg',alt:'Projection schématique des structures médiales, dont hippocampe et amygdale.',orientation:'Projection des structures médiales · avant à gauche',note:'Les structures ne sont pas toutes dans un même plan de coupe. Le « système limbique » est un regroupement historique : mémoire et émotions impliquent aussi d’autres réseaux.',...openstax('1511_The_Limbic_Lobe.jpg','3.0'),parts:[
part('Hippocampe',53,59,'Structure du temporal médial contribuant à la formation de nouveaux souvenirs déclaratifs.','hippocampus'),
part('Amygdale',49,54,'En avant de l’hippocampe, dans le temporal médial : apprentissage de la valeur émotionnelle.','amygdala'),
part('Thalamus',59,40,'Masse profonde de noyaux située de chaque côté du troisième ventricule.','thalamus'),
part('Corps calleux',61,32,'Faisceau de substance blanche entre les hémisphères, distinct de l’hippocampe.','callosum')
]},
{id:'basal',title:'Noyaux profonds en coupe coronale',scope:'c2',image:'./assets/diagrams/basal-practice.webp',original:'./assets/diagrams/basal-ganglia.jpg',alt:'Coupe coronale schématique du cerveau avec les noyaux caudé, putamen et pallidum.',orientation:'Coupe coronale schématique',note:'Cette coupe montre une partie des ganglions de la base. Le noyau sous-thalamique et la substance noire appartiennent au circuit mais ne sont pas représentés dans cette coupe.',...openstax('1308_Frontal_Section_Basal_Nuclei.jpg'),parts:[
part('Noyau caudé',45,65,'Avec le putamen, il forme le striatum dorsal. Il fait partie des ganglions de la base.','basalGanglia'),
part('Putamen',36,66,'Noyau latéral au pallidum, séparé du caudé par des faisceaux de substance blanche.','basalGanglia'),
part('Pallidum · globus pallidus',41,70,'Situé médialement au putamen. Participe aux sorties des circuits des ganglions de la base.','basalGanglia'),
part('Corps calleux',54,57,'Faisceau de substance blanche au-dessus des ventricules.','callosum'),
part('Ventricule latéral',49,61,'Cavité contenant du liquide céphalorachidien, distincte des noyaux.','ventricles')
]},
{id:'brainstem',title:'Les trois étages du tronc cérébral',scope:'c2',image:'./assets/diagrams/brainstem-practice.webp',original:'./assets/diagrams/brainstem.jpg',alt:'Face médiale schématique avec le mésencéphale, le pont et le bulbe.',orientation:'Vue médiale schématique · avant à gauche',note:'Le cervelet et la moelle sont distincts du tronc cérébral. Le dessin met ses trois étages en couleur.',...openstax('1311_Brain_Stem.jpg'),parts:[
part('Mésencéphale',53,64,'Étage supérieur du tronc, sous le diencéphale.','brainstem'),
part('Pont',55,76,'Étage intermédiaire. Le pont ventral est une localisation classique du locked-in syndrome.','brainstem'),
part('Bulbe rachidien',63,89,'Étage inférieur, en continuité avec la moelle ; réseaux de régulation vitale.','brainstem')
]},
{id:'neuron',title:'Les territoires du neurone',scope:'td',image:'./assets/diagrams/td-neuron.webp',alt:'Dessin du TD d’un neurone myélinisé, sans les noms de la correction.',orientation:'TD · page 3 · autre échelle',note:'Schéma d’un neurone myélinisé : les formes et les longueurs ne sont pas proportionnelles.',credit:'TD APHY 2026 · Pascal Benquet et Joan Duprez · page 3',changes:'Image extraite du TD fourni sans les textes de correction. Numéros interactifs ajoutés.',parts:[
part('Dendrites',31,22,'Prolongements recevant de nombreux signaux d’autres neurones.','dendrites'),
part('Soma · corps cellulaire',34,36,'Contient le noyau et assure notamment le métabolisme et l’intégration.','soma'),
part('Segment initial de l’axone',40,40,'Région spécialisée où débute généralement le potentiel d’action lorsque le seuil est atteint.','axon'),
part('Gaine de myéline',52,48,'Isolation qui permet une conduction rapide entre les nœuds.','myelin'),
part('Nœud de Ranvier',55,51,'Interruption entre deux segments de myéline : le potentiel d’action y est régénéré.','myelin'),
part('Arborisation terminale',70,70,'Ramifications de l’axone distribuant le signal vers plusieurs cibles.','terminals'),
part('Boutons synaptiques',83,60,'Extrémités qui libèrent les neurotransmetteurs dans les synapses chimiques.','terminals')
]},
{id:'glia',title:'Neurones, glie et capillaire',scope:'td',image:'./assets/diagrams/td-glia.webp',alt:'Schéma numéroté du TD montrant neurone, oligodendrocyte, astrocyte, microglie et capillaire.',orientation:'TD · page 6 · tissu du système nerveux central',note:'Les numéros de l’image d’origine sont conservés. Les cellules gliales ont plusieurs fonctions : myéline, environnement local et réponses immunitaires.',credit:'TD APHY 2026 · Pascal Benquet et Joan Duprez · page 6',changes:'Image d’origine extraite sans la correction ajoutée au PDF.',embeddedNumbers:true,parts:[
part('Oligodendrocyte',67,20,'Cellule gliale qui myélinise des segments de plusieurs axones dans le système nerveux central.'),
part('Axone',37,23,'Prolongement conduisant les potentiels d’action.','axon'),
part('Soma du neurone',27,12,'Corps cellulaire contenant le noyau.','soma'),
part('Gaine de myéline',35,39,'Enveloppe isolante autour d’un segment axonal.','myelin'),
part('Microglie',35,54,'Cellules participant à la surveillance et aux réponses immunitaires du tissu nerveux.'),
part('Astrocyte',91,68,'Cellule gliale contribuant à l’environnement neuronal et aux interactions avec les vaisseaux.'),
part('Synapse',73,44,'Zone de communication entre des cellules nerveuses.'),
part('Capillaire sanguin',48,87,'Petit vaisseau, associé ici aux prolongements d’un astrocyte.')
]},
{id:'membrane',title:'Membrane et répartition des ions',scope:'c3',image:'./assets/diagrams/membrane-practice.svg',learnImage:'./assets/diagrams/membrane-fr.svg',alt:'Schéma de deux compartiments séparés par une bicouche lipidique et des canaux, avec sodium et potassium.',orientation:'Échelle cellulaire · extérieur en haut, intérieur en bas',note:'Les symboles d’ions ne représentent pas des concentrations mesurées. Les canaux sont schématiques ; le sens du flux dépend de Vm et de Eion.',credit:'Schéma du cours 3 · référence : biologie cellulaire, NCBI',source:'https://www.ncbi.nlm.nih.gov/books/NBK26910/',changes:'Illustration vectorielle créée à partir des notions du cours. Noms masqués pour les exercices.',parts:[
part('Milieu extracellulaire',78,21,'Dans les conditions habituelles, Na⁺ est plus concentré à l’extérieur du neurone.','sodium'),
part('Milieu intracellulaire',78,76,'Dans les conditions habituelles, K⁺ est plus concentré à l’intérieur du neurone.','potassium'),
part('Bicouche lipidique',16,49,'La membrane limite le passage libre des ions chargés.','membrane'),
part('Canal sélectif au Na⁺',36,49,'Un passage membranaire pour le sodium. Canal et pompe ne sont pas synonymes.','ionChannels'),
part('Canal sélectif au K⁺',66,49,'Un passage pour le potassium. Le flux net dépend des forces chimique et électrique.','ionChannels')
]},
{id:'pump',title:'La pompe Na⁺/K⁺ : 3 sortent, 2 entrent',scope:'c3',image:'./assets/diagrams/pump-practice.svg',learnImage:'./assets/diagrams/pump-fr.svg',alt:'Schéma d’une pompe membranaire transportant trois ions sodium vers le haut et deux potassium vers le bas, avec un apport d’énergie.',orientation:'Échelle cellulaire · extérieur en haut, intérieur en bas',note:'La Na⁺/K⁺-ATPase maintient les gradients en consommant de l’ATP. Les canaux assurent les courants rapides du PA ; la pompe ne repolarise pas chaque PA à elle seule.',credit:'Schéma du cours 3 · référence : biologie cellulaire, NCBI',source:'https://www.ncbi.nlm.nih.gov/books/NBK26910/',changes:'Schéma vectoriel du transport par cycle, avec une version sans noms.',parts:[
part('Export de 3 Na⁺',44,20,'La pompe transporte trois ions sodium de l’intérieur vers l’extérieur par cycle.','sodiumPump'),
part('Import de 2 K⁺',57,78,'Deux ions potassium sont transportés de l’extérieur vers l’intérieur par cycle.','sodiumPump'),
part('ATP consommé',84,74,'L’hydrolyse de l’ATP fournit l’énergie du transport contre les gradients.','sodiumPump')
]},
{id:'actionPotential',title:'Les phases du potentiel d’action',scope:'c3',image:'./assets/diagrams/actionPotential-practice.svg',learnImage:'./assets/diagrams/actionPotential-fr.svg',alt:'Courbe pédagogique du potentiel de membrane au cours du temps : repos, montée, descente puis passage sous le repos.',orientation:'Voltage intracellulaire par rapport à l’extérieur · temps illustratif',note:'Courbe schématique et valeurs du cours, pas un enregistrement expérimental. Le repos, le seuil, la forme et la durée varient selon le neurone.',credit:'Graphique pédagogique du cours 3 · référence : canaux du PA, NCBI',source:'https://www.ncbi.nlm.nih.gov/books/NBK10841/',changes:'Courbe créée pour illustrer les phases ; les noms de phases sont masqués dans les exercices.',parts:PHASES.map((p,i)=>{const point=plotPoint(p.t,p.v);return part(p.label,point.x,point.y,p.flow+' '+p.explain,i===1?'sodium':i>1?'potassium':'membrane');})}
];
FIGURES.push(...ANATOMY_FIGURES);
FIGURES.push(...SYNAPSE_FIGURES);
for(const f of FIGURES.filter(f=>['neuron','glia'].includes(f.id)))f.scopes=['c3'];
export const FIGURE_BY_ID=Object.fromEntries(FIGURES.map(f=>[f.id,f]));
FIGURE_BY_ID.neuron.parts[2].structure='initialSegment';
FIGURE_BY_ID.neuron.parts[4].structure='ranvier';
FIGURE_BY_ID.glia.parts[0].structure='oligodendrocyte';
FIGURE_BY_ID.glia.parts[4].structure='microglia';
FIGURE_BY_ID.glia.parts[5].structure='astrocyte';
for(const f of FIGURES.filter(f=>f.source&&!f.learnImage))f.learnImage=`./assets/diagrams/${f.id}-fr.webp`;
