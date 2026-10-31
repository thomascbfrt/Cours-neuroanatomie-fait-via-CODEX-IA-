# Le cerveau, à explorer

Site publié : https://cerveau-explorateur.maximusxodko631.chatgpt.site

Dépôt GitHub : https://github.com/thomascbfrt/Cours-neuroanatomie-fait-via-CODEX-IA-

## Lancer le site en local

Le dossier `dist/` contient le site complet, y compris les modèles 3D, les IRM,
les cours, les images et les bibliothèques nécessaires. Aucun téléchargement
de dépendance n’est requis pour consulter le site.

Avec Python 3, depuis la racine du dépôt :

```sh
python3 -m http.server 8000 --directory dist
```

Ouvrir ensuite `http://localhost:8000` dans le navigateur. Utiliser un serveur
local plutôt que d’ouvrir directement le fichier HTML, pour charger les modules
JavaScript et les ressources du cerveau.

Avec Node.js 22 ou une version plus récente, les vérifications se lancent avec :

```sh
npm run check
```

Le mode sombre est activé par défaut. Le bouton en haut à droite permet de
passer au mode clair ; le choix est mémorisé dans le navigateur, indépendamment
de la progression des cours. Les planches anatomiques et les IRM conservent leurs
couleurs d’origine. `dist/theme.css` se régénère avec
`python3 tools/build_dark_theme.py` après une modification des styles.

Parcours pédagogique en français, fondé sur quatre cours, deux documents de TD et une image de cortex moteurs fournis dans cette conversation.

La navigation distingue Cours, Atlas 2D/3D, Circuits et Révision. Les quatre cours
contiennent 34 chapitres. Chaque chapitre dispose d’explications, de repères dans
l’atlas, d’exercices et de précisions scientifiques signalées. La progression est
conservée dans le localStorage du navigateur ; aucun compte n’est nécessaire.

Les 22 schémas et les 256 questions se filtrent par cours, TD et type d’exercice.
Les réponses apparaissent seulement après validation. Le bilan permet de
reprendre les erreurs. Les figures du TD actuellement utilisées viennent des
pages 3 et 6, consacrées au neurone et à la glie. Ces exercices sont aussi inclus
dans les révisions du cours 3, avec les mêmes IDs pour conserver la progression.

Le TD d’anatomie (`#revision/anatomy`) reprend les quatre consignes du PDF
`anat POLY_APHY_Benquet.pdf` : lobes et sillons, trois coupes, aires corticales,
et deux IRM. Ses sept images ont 47 repères à légender. Les trois dessins en
coupe conservent les points visés par les flèches d’origine, convertis en
coordonnées relatives à chaque image. Les plans se choisissent séparément.
Noms, rôles et score apparaissent après validation ; la reprise ciblée conserve
les bonnes réponses et remet à zéro uniquement les noms et plans incorrects.
Les résultats rejoignent les IDs stables des questions de schémas.

Le document ne fournit pas de correction écrite : les réponses proposées sont
attribuées au site et accompagnées de références universitaires. V1 et A1 ne
sont pas dessinées à un faux emplacement sur la vue latérale ; leurs repères
enfouis font l’objet de questions et de liens vers l’atlas. Les aires associatives
sont distinguées des aires primaires ; les limites fonctionnelles restent
indicatives. Aucun côté du patient n’est déduit des deux IRM non marquées D/G.

La visualisation 3D charge des surfaces anatomiques réelles : FreeSurfer fsaverage5,
annotations anatomiques Destrieux 2009, structures profondes reconstruites depuis
la segmentation fsaverage aseg. Les coupes T1 et aseg sont dans le même espace
tkregister RAS ; elles sont rééchantillonnées à 2 mm pour le navigateur.

Les couleurs des lobes facilitent le repérage. Les aires fonctionnelles sont mises
en évidence à l’aide de repères anatomiques, avec leurs limites précisées dans
chaque fiche. Les circuits sont des séquences pédagogiques simplifiées ; aucune
tractographie individuelle n’est simulée. Le neurone est un diagramme à une autre
échelle. Les structures périphériques et les structures olfactives non segmentées
sont expliquées dans les fiches sans inventer de géométrie.

## Sources

- https://nilearn.github.io/stable/modules/description/fsaverage5.html
- https://nilearn.github.io/stable/modules/generated/nilearn.datasets.fetch_atlas_surf_destrieux.html
- https://www.nitrc.org/frs/download.php/9343/lh.aparc.a2009s.annot
- https://www.nitrc.org/frs/download.php/9342/rh.aparc.a2009s.annot
- https://github.com/mne-tools/mne-testing-data/tree/master/subjects/fsaverage
- https://www.ncbi.nlm.nih.gov/books/NBK10982/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC10872810/
- Le cours fourni, conservé dans `dist/assets/cours.txt`.
- Le deuxième cours, conservé sans modification dans `dist/assets/cours-2.txt`.
- Le troisième cours, conservé sans modification dans `dist/assets/cours-3.txt`.
- Le quatrième cours, conservé sans modification dans `dist/assets/cours-4.txt`.
- Figures 2D OpenStax : sources, licences et adaptations dans
  `dist/assets/diagrams/LICENSES.md` et au pied de chaque illustration.
- Références complémentaires dans `dist/courses.js` et le dialogue Sources.

Three.js 0.169.0 est distribué localement avec sa licence MIT. La police DM Sans
est distribuée sous la SIL Open Font License (voir `dist/assets/OFL.txt`).

Le site est statique et ne dépend d’aucun CDN pour fonctionner. Une connexion
reste nécessaire pour ouvrir les liens documentaires externes.

Les aires motrices secondaires incluent des fiches séparées pour le prémoteur
latéral et la SMA. « M2 » est expliqué comme une notation variable, plutôt que
comme une aire humaine unique. Les parcours sensoriels utilisent des repères
associatifs distincts. Les contours fonctionnels sont explicitement indicatifs :
ils entourent des repères anatomiques de Destrieux, pas des frontières mesurées.
Les nerfs optique et auditif et la moelle n’empruntent aucune autre surface 3D.

## Vérification

`npm run check` vérifie les correspondances anatomiques, les circuits, la
segmentation volumétrique, les ressources, les références entre chapitres et
repères, les schémas, les filtres et la correction des questions. Les fichiers JS
peuvent être vérifiés avec `node --check`.

## Ajouter un cours

1. Ajouter son texte source dans `dist/assets/`.
2. Ajouter une entrée à `COURSES` dans `dist/courses.js`, avec des IDs stables et
   ses chapitres. `CHAPTERS`, les menus et les filtres se mettent à jour seuls.
3. Ajouter les fiches anatomiques nécessaires dans `dist/data.js` et leurs
   correspondances réelles. Utiliser `unmapped` et une référence 2D lorsqu’une
   structure n’est pas segmentée dans l’atlas.
4. Ajouter les figures et leurs crédits dans `dist/figures.js`, puis les QCM de
   notions dans `dist/quiz.js`. Les questions numérotées sont générées à partir
   des repères des figures, avec une explication par réponse.
5. Exécuter `npm run check` avant de publier. Les identifiants de chapitres déjà
   présents préservent la progression locale.

## Cours 3 : signaux électriques

`dist/course-neurons.js` contient ses 8 chapitres ; `dist/quiz-neurons.js` ses
33 QCM de notions. Les exercices du TD sur le neurone et la glie sont partagés
avec ce cours via `scopes`, sans dupliquer les IDs ou les résultats.

`dist/signals.js` porte les valeurs pédagogiques et les deux ateliers : sens du
flux ionique selon Vm et Eion, et phases du PA avec état des canaux. Les valeurs
ne prétendent pas représenter tous les neurones. Le sens du flux tient compte du
signe de la charge (cation / anion) et vaut zéro à l’équilibre.

Les SVG de membrane, de pompe et de PA se régénèrent avec
`python tools/build_cell_diagrams.py`. Pour une revue des images, ajouter
`--review-dir /chemin/vers/un/dossier/temporaire` ; les PNG de revue ne sont pas
requis par le site. Le graphique utilise les points de `dist/signals.js`.

## Ajouter un TD d’anatomie

`dist/anatomy-data.js` décrit les figures, les quatre consignes, les questions
complémentaires et les sources. `dist/anatomy.js` porte les sessions de légende,
la correction et le rendu ; `dist/study.js` relie les routes et la progression.
L’extraction des images d’origine se reproduit avec
`python tools/extract_anatomy.py /chemin/vers/le/PDF/fourni.pdf`.
Elle conserve l’anatomie et vérifie que chaque WebP se décode avant écriture.
Le PDF complet est disponible dans `dist/assets/td-anatomie.pdf`.

## Cours 4 : synapses et intégration

`dist/course-synapses.js` organise le texte fourni en 13 chapitres (environ
3 750 mots d’explications et de précisions, hors tableaux et exercices).
`dist/quiz-synapses.js` contient 54 QCM de notions et de calcul, chacun avec
une explication. Les quatre nouveaux schémas cellulaires ont leurs versions
avec noms et sans noms ; les PPS utilisent des coordonnées d’axes partagées
avec le générateur, pour éviter de placer un numéro hors du signal.

`dist/synaptic-model.js` décrit la somme linéaire du cours, les conditions
qualitatives NMDA et les sept étapes de libération. `dist/synaptic-labs.js`
rend les trois ateliers. Le calcul suppose repos −70 mV, seuil −50 mV et PPS
simultanés ; il distingue la somme avant décharge d’un pic de PA. L’atelier
NMDA n’est pas un modèle cinétique ou un calcul de courant.

Les précisions incluent shunt inhibiteur, coagonistes NMDA, nomenclature des
récepteurs, absence de constante pour le nombre de synapses, différences entre
transmetteurs pour la terminaison du signal, sommeil et classification ILAE
2025. La propagation focale vers une crise tonico-clonique bilatérale est
distinguée d’une crise généralisée d’emblée. Les suppositions sur le contrôle
continu deviennent des priorités de révision sans prédiction d’épreuve.

L’image fournie des cortex moteurs est conservée intacte dans
`motor-cortices-source.png` et intégrée au chapitre `c1-mouvement`. Les noms
sont masqués dans une version de révision ; les zones et les flèches restent
présentes. Le prémoteur et la SMA restent distincts de M1.

Reproduction des SVG et du masquage des libellés :
`python tools/build_synapse_diagrams.py --review-dir /dossier/temporaire`.
Les PNG de revue n’appartiennent pas au contenu publié. Les vérifications
comprennent les cas de calcul du cours, les huit combinaisons des conditions
NMDA, les références de cours et les positions sur le graphique des PPS.
