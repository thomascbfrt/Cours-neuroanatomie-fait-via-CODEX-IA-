// Points de repérage, pas des frontières fonctionnelles. Les trois coupes
// reprennent exactement les pointes des flèches de la page 1 du document.
const p=(label,x,y,explain,structure)=>({label,x,y,explain,structure});
const credit=page=>({credit:`TD d’anatomie fourni · Pascal Benquet · page ${page}`,changes:'Illustrations extraites du document fourni. Repères numérotés ajoutés ; correction pédagogique proposée et vérifiée avec les références ci-dessous.'});
const common={scope:'anatomy',scopes:['c1','c2'],learnImage:undefined};
const figure=(id,title,image,page,orientation,note,parts,extra={})=>({id,title,image:`./assets/diagrams/td-anatomy-${image}.webp`,...common,...credit(page),alt:'Illustration du TD, sans noms de structures, avec des repères numérotés interactifs.',orientation,note,parts,...extra});
// Transforme les coordonnées en points PDF en pourcentages de l’image extraite.
const fromPdf=(label,x,y,bbox,explain,structure)=>p(label,(x-bbox[0])/(bbox[2]-bbox[0])*100,(y-bbox[1])/(bbox[3]-bbox[1])*100,explain,structure);
const coronal=[22.56,185.64,186.12,315];
const sagittal=[16.92,320.64,186.6,478.08];
const axial=[16.92,483,174.6,663.72];
export const ANATOMY_FIGURES=[
figure('td-surface','Lobes, sillons et insula','surface',1,'Vue latérale · avant à gauche ; insula découverte à droite','Les nombreuses couleurs du modèle représentent des parcelles anatomiques, pas les lobes. À droite, les opercules ont été retirés pour montrer l’insula au fond du sillon latéral.',[
p('Lobe frontal',20,35,'Situé devant le sillon central. Il comprend des régions motrices et préfrontales.','frontal'),
p('Lobe pariétal',44,28,'Derrière le sillon central et au-dessus du temporal : sensibilité et traitements spatiaux.','parietal'),
p('Lobe temporal',37,68,'Sous le sillon latéral : territoires auditifs et associatifs, notamment.','temporal'),
p('Lobe occipital',56,50,'À l’arrière de l’hémisphère : territoires visuels. V1 se trouve surtout sur la face médiale.','occipital'),
p('Sillon central',34.5,30,'Sépare le frontal et le pariétal ; M1 est devant et S1 derrière.','central'),
p('Sillon latéral',34,48,'Sépare le temporal des régions frontales et pariétales qui le recouvrent.','lateral'),
p('Insula',81,52,'Cortex enfoui au fond du sillon latéral, rendu visible ici en retirant les opercules.','insula')
],{markerPositions:[[9,21],[49,12],[29,85],[59,68],[32,9],[51,78],[88,79]]}),
figure('td-coronal','Coupe A · les structures profondes','coronal',1,'Haut en haut · coupe à identifier','Les numéros suivent les cinq cadres du TD, de haut en bas. Chaque point reprend la pointe de la flèche d’origine. La capsule interne est de la substance blanche ; le putamen et le caudé sont des noyaux gris.',[
fromPdf('Ventricule latéral',90.48,243.48,coronal,'Cavité contenant du liquide céphalorachidien, sous le corps calleux.','ventricles'),
fromPdf('Noyau caudé',120.72,244.56,coronal,'Noyau gris proche du ventricule latéral ; avec le putamen, il forme le striatum dorsal.','basalGanglia'),
fromPdf('Capsule interne',124.8,262.68,coronal,'Faisceau de substance blanche entre les noyaux profonds : passage de voies motrices et sensitives.'),
fromPdf('Putamen',132.96,266.64,coronal,'Noyau gris situé latéralement à la capsule interne ; il participe aux boucles des ganglions de la base.','basalGanglia'),
fromPdf('Hippocampe',69.6,285.24,coronal,'Formation du temporal médial, importante pour former de nouveaux souvenirs déclaratifs.','hippocampus')
],{plane:'Coupe coronale',planeQuestion:'td-anat-plan-coronal',markerPositions:[[18,22],[78,24],[88,48],[86,65],[13,81]]}),
figure('td-sagittal','Coupe B · la ligne médiane','sagittal',1,'Arrière à gauche · avant à droite · coupe à identifier','Les numéros suivent les cinq cadres du TD. La couche corticale est distincte de la substance blanche sous-jacente. Le pont appartient au tronc cérébral ; le cervelet est une structure distincte.',[
fromPdf('Cortex cérébral · substance grise',86.28,331.92,sagittal,'Couche superficielle de substance grise, impliquée dans de nombreux traitements sensoriels, moteurs et cognitifs.','cortex'),
fromPdf('Corps calleux',78.12,382.56,sagittal,'Grande commissure de substance blanche reliant les deux hémisphères.','callosum'),
fromPdf('Thalamus',99.6,391.08,sagittal,'Ensemble de noyaux profonds impliqués dans des relais et des boucles sensorielles, motrices et cognitives.','thalamus'),
fromPdf('Cervelet',49.56,421.92,sagittal,'Derrière le tronc cérébral : coordination, ajustement et apprentissage des gestes.','cerebellum'),
fromPdf('Pont',86.28,430.68,sagittal,'Étage intermédiaire du tronc cérébral, avec des voies de passage et des noyaux, notamment reliés au cervelet.','brainstem')
],{plane:'Coupe sagittale',planeQuestion:'td-anat-plan-sagittal',markerPositions:[[30,8],[70,28],[81,51],[14,70],[47,87]]}),
figure('td-axial','Coupe C · noyaux et voies de passage','axial',1,'Avant en haut · arrière en bas · coupe à identifier','Les neuf numéros reprennent les cadres du TD dans leur ordre. Les noyaux gris et les faisceaux de substance blanche se distinguent par leur position.',[
fromPdf('Corps calleux',94.32,528.24,axial,'Commissure de substance blanche ; ici, sa partie antérieure est visible au-dessus des cornes frontales des ventricules.','callosum'),
fromPdf('Ventricule latéral',107.64,529.44,axial,'Cavité de LCR : le point vise une corne frontale, distincte du noyau caudé voisin.','ventricles'),
fromPdf('Noyau caudé',105.96,541.68,axial,'La tête du caudé borde la corne frontale du ventricule latéral. Elle fait partie du striatum dorsal.','basalGanglia'),
fromPdf('Putamen',123.84,556.32,axial,'Partie latérale du noyau lenticulaire, impliquée dans les boucles motrices et l’apprentissage des actions.','basalGanglia'),
fromPdf('Capsule interne',112.68,566.04,axial,'Le bras postérieur de ce faisceau de substance blanche passe entre thalamus et noyau lenticulaire.'),
fromPdf('Thalamus',105.96,575.88,axial,'Masse de noyaux située à côté du troisième ventricule, médialement à la capsule interne.','thalamus'),
fromPdf('Troisième ventricule',94.8,579.48,axial,'Cavité médiane de LCR entre les thalamus. Le point vise son extrémité postérieure, en avant de la région pinéale.','ventricles'),
fromPdf('Hippocampe',72,593.52,axial,'Formation du temporal médial proche de la corne temporale du ventricule latéral ; elle contribue à la mémoire déclarative.','hippocampus'),
fromPdf('Insula',49.558,552.6,axial,'Cortex enfoui dans le sillon latéral, latéralement aux noyaux profonds.','insula')
],{plane:'Coupe axiale · horizontale',planeQuestion:'td-anat-plan-axial',markerPositions:[[37,11],[72,17],[76,30],[84,43],[79,54],[73,65],[51,76],[24,70],[14,32]]}),
figure('td-areas','Aires corticales · repères visibles','areas',2,'Vue latérale · avant à gauche · repères indicatifs','M1 et S1 se repèrent de part et d’autre du sillon central. Le point orbitofrontal indique son rebord latéral : la face orbitale est surtout inférieure. V1 et A1 demandent un autre point de vue ; deux questions complémentaires leur sont consacrées.',[
p('Cortex moteur primaire · M1',51,31,'Principalement dans le gyrus précentral, devant le sillon central. Il contribue à la commande motrice volontaire.','m1'),
p('Cortex somesthésique primaire · S1',61,29,'Principalement dans le gyrus postcentral, derrière le sillon central : traitement de la sensibilité corporelle.','s1'),
p('Cortex préfrontal d’association',30,35,'Régions antérieures aux territoires moteurs : contrôle, planification et mémoire de travail dans des réseaux distribués.','prefrontal'),
p('Cortex orbitofrontal · rebord latéral',26,71,'Le cortex orbitofrontal est situé sur la face inférieure du frontal, au-dessus des orbites. Il contribue à l’évaluation et à l’adaptation du comportement.','prefrontal'),
p('Jonction temporo-pariéto-occipitale · TPO',79,44,'Régions associatives au carrefour temporal, pariétal et occipital : intégration de plusieurs modalités. Ce n’est pas une aire unique aux frontières fixes.','associative')
],{markerPositions:[[48,12],[70,13],[18,27],[16,83],[88,56]]}),
figure('td-irm-coronal','IRM A · passer du dessin à l’image','irm-coronal',2,'Haut en haut · coupe à identifier','Les repères ajoutés ciblent les structures reconnaissables sur cette image. Les traits gris viennent du document. Sans marqueur D/G dans la source, aucun côté du patient n’est déduit. L’image est anatomique, pas une carte d’activité.',[
p('Cortex cérébral · substance grise',24.3,24.1,'Couche périphérique plus sombre que la substance blanche sur cette image de type T1.','grey'),
p('Substance blanche',30.5,38.1,'Tissu clair sous le cortex, composé notamment d’axones myélinisés.','white'),
p('Corps calleux',51.1,49.0,'Bande de substance blanche au-dessus des ventricules latéraux, reliant les hémisphères.','callosum'),
p('Ventricule latéral',59.0,51.5,'Le LCR apparaît sombre sur cette image ; la cavité est située sous le corps calleux.','ventricles'),
p('Troisième ventricule',51.0,58.9,'Cavité étroite sur la ligne médiane, entre les thalamus.','ventricles'),
p('Thalamus',56.7,61.1,'Noyaux gris profonds, de part et d’autre du troisième ventricule.','thalamus'),
p('Hippocampe',34,76.5,'Formation du temporal médial, proche de la corne temporale du ventricule latéral.','hippocampus'),
p('Tronc cérébral',51,81.5,'Structure centrale sous le diencéphale. Le point vise sa masse, sans prétendre en délimiter tous les étages.','brainstem')
],{plane:'Coupe coronale',planeQuestion:'td-anat-plan-coronal',markerPositions:[[13,15],[15,38],[43,38],[75,43],[37,58],[77,66],[18,79],[60,94]]}),
figure('td-irm-axial','IRM B · retrouver les repères profonds','irm-axial',2,'Avant en haut · arrière en bas · coupe à identifier','L’IRM est moins contrastée que le dessin du TD. Les numéros désignent des repères, pas une segmentation. Sans marqueur D/G fourni, les côtés du patient ne sont pas affirmés. Les noms ne sont révélés qu’après validation.',[
p('Cortex cérébral · substance grise',73,21.9,'Couronne corticale plus sombre que la substance blanche, à la périphérie du cerveau.','grey'),
p('Substance blanche',67,16.8,'Tissu clair à l’intérieur de l’hémisphère sur cette image de type T1.','white'),
p('Corps calleux',48.6,27.4,'Sa partie antérieure forme une bande claire devant les cornes frontales des ventricules.','callosum'),
p('Ventricule latéral',54,33.7,'La corne frontale contient du LCR et apparaît sombre.','ventricles'),
p('Noyau caudé',57,36.5,'La tête du caudé est située contre la paroi latérale de la corne frontale du ventricule.','basalGanglia'),
p('Capsule interne',63.5,42,'Faisceau clair entre les noyaux profonds : ses rapports aident à la reconnaître.'),
p('Troisième ventricule',48.8,43.7,'Fine cavité médiane située entre les deux thalamus.','ventricles'),
p('Thalamus',56.8,48.3,'Masse grise profonde bordant le troisième ventricule. Le signal seul ne suffit pas : il faut aussi les rapports anatomiques.','thalamus')
],{plane:'Coupe axiale · horizontale',planeQuestion:'td-anat-plan-axial',markerPositions:[[89,25],[78,10],[42,17],[32,30],[83,36],[89,50],[35,49],[71,61]]})
];
export const ANATOMY_EXERCISES=[
{id:'surface',number:'01',title:'Lobes et sillons',subtitle:'Place les quatre lobes, le sillon central, le sillon latéral et l’insula.',figures:['td-surface'],courses:['c1-reperes'],image:'surface'},
{id:'cuts',number:'02',title:'Trois coupes, des structures',subtitle:'Identifie chaque plan, puis les structures visées par les flèches du TD. Découvre leurs rôles après validation.',figures:['td-coronal','td-sagittal','td-axial'],courses:['c1-tissus','c2-boucles'],image:'coronal'},
{id:'areas',number:'03',title:'Aires primaires et associatives',subtitle:'Repère M1, S1 et les territoires associatifs. Complète avec V1, A1 et les aires motrices secondaires.',figures:['td-areas'],courses:['c1-voir-entendre','c1-mouvement'],image:'areas',questions:['td-anat-v1','td-anat-a1','td-anat-m2','td-anat-association']},
{id:'mri',number:'04',title:'Repérage sur les deux IRM',subtitle:'Retrouve les plans, les tissus, les ventricules et les structures profondes sur les images du document.',figures:['td-irm-coronal','td-irm-axial'],courses:['c1-observer','c1-tissus'],image:'irm-coronal'}
];
const q=(id,prompt,correct,wrong,explanation)=>({id,scope:'anatomy',scopes:['c1','c2'],kind:'concepts',prompt,correct,options:[correct,...wrong],explanation});
export const ANATOMY_QUESTIONS=[
q('td-anat-plan-coronal','Quel plan sépare des parties antérieure et postérieure du cerveau ?','Coupe coronale',['Coupe sagittale','Coupe axiale · horizontale'],'Le plan coronal, ou frontal, permet de voir les deux hémisphères comme dans une vue de face.'),
q('td-anat-plan-sagittal','Quel plan sépare des parties droite et gauche ?','Coupe sagittale',['Coupe coronale','Coupe axiale · horizontale'],'Une coupe sagittale médiane passe entre les hémisphères et montre notamment le corps calleux et le tronc cérébral.'),
q('td-anat-plan-axial','Quel plan sépare des parties supérieure et inférieure ?','Coupe axiale · horizontale',['Coupe coronale','Coupe sagittale'],'Une coupe axiale traverse horizontalement le cerveau. Le plan et le niveau de coupe sont deux informations différentes.'),
q('td-anat-v1','Où placer le cortex visuel primaire V1 pour une localisation fiable ?','Sur la face médiale occipitale, autour du sillon calcarin',['Sur tout le lobe pariétal latéral','Sur le gyrus précentral','Dans le cortex orbitofrontal'],'V1 correspond à l’aire 17 et occupe surtout les berges du sillon calcarin. La vue latérale du TD ne montre pas l’essentiel de cette aire.'),
q('td-anat-a1','Où se situe principalement le cortex auditif primaire A1 ?','Sur les gyri de Heschl, enfouis dans le sillon latéral',['Sur toute la face latérale du temporal','Sur le gyrus postcentral','Autour du sillon calcarin'],'A1 occupe la face supérieure du temporal, dans les gyri temporaux transverses de Heschl. Il est en grande partie caché sur une vue latérale intacte ; A2 désigne des territoires auditifs secondaires voisins.'),
q('td-anat-m2','Comment compléter M1 par les aires motrices secondaires chez l’humain ?','Prémoteur latéral et SMA sur la face médiale',['Une seule aire M2 précisément visible sur toute la face latérale','S1 et V1 seulement','L’hypophyse et le thalamus seulement'],'Ces territoires contribuent à préparer et organiser l’action. La notation M2 varie selon les cours et les espèces ; elle ne correspond pas à une unique frontière humaine universelle.'),
q('td-anat-association','Les régions préfrontales, orbitofrontales et TPO citées dans le TD sont…','Des territoires associatifs, distincts des aires sensorielles primaires',['Toutes des aires sensorielles primaires','Trois noyaux des ganglions de la base','Trois ventricules'],'Le titre de l’exercice regroupe plusieurs catégories. Les régions associatives intègrent des informations et participent à des réseaux ; TPO est un carrefour, pas une aire primaire unique.'),
q('td-anat-capsule','Comment distinguer la capsule interne des noyaux voisins ?','C’est un faisceau de substance blanche entre des noyaux gris',['C’est une cavité contenant du LCR','C’est un lobe cortical de surface','C’est un autre nom du putamen'],'Ses rapports avec le caudé, le noyau lenticulaire et le thalamus permettent de la reconnaître sur les coupes.')
];
export const ANATOMY_SOURCES=[
['Document fourni · les deux pages originales','./assets/td-anatomie.pdf'],
['Université du Texas · lobes, sillons et structures en coupe','https://nba.uth.tmc.edu/neuroscience/m/s2/chapter01.html'],
['Université de l’Utah · noyaux et capsule interne en coupe axiale','https://webpath.med.utah.edu/HISTHTML/NEURANAT/CNS233A.html'],
['NCBI · cortex visuel et sillon calcarin','https://www.ncbi.nlm.nih.gov/books/NBK11524/'],
['Cartographie humaine · SMA et pré-SMA','https://pubmed.ncbi.nlm.nih.gov/30187192/']
];
