+++
author = 'Turbo Tartine'
date = '2024-11-18T06:28:42+01:00'
draft = true
title = 'OpenRE (Open Retro Engine)'
description = 'Page de presentation du projet OpenRE'
+++
## Introduction
Si vous avez lu [cet article](/posts/i_love_fixed_cams), vous savez déjà que je suis un grand nostalgique des caméras fixes et des contrôles tank. Ce genre vidéoludique, caractéristique de la fin des années 90, m'a toujours fasciné. Si vous ne voyez pas à quoi je fais allusion, ou que vous souhaitez simplement découvrir ce qui me plaît tant dans ces jeux, je vous invite à y jeter un œil.

Lorsque j’ai voulu développer mon propre jeu en caméra fixe, je me suis rapidement heurté à un problème : les outils et ressources sur le sujet sont rares. Certes, on trouve quelques tutoriels sur la gestion des caméras ou sur les déplacements du joueur dans ce contexte particulier. Mais rien ne traite de ce que je considère comme le principal défi de cette approche : *"Comment intégrer harmonieusement des éléments interactifs par-dessus des arrière-plans précalculés ?"* (D’ailleurs, si vous avez des références sur le sujet, n'hésitez pas à les partager dans les commentaires.)

C'est de ce constat qu'est née OpenRE : une technologie libre et open-source destinée au développement de jeux vidéo en caméra fixe et arrière-plan pré-calculés. Ce projet est aussi l'occasion de revisiter la technique en explorant les possibilités offertes par les technologies modernes. Je cherche notament à gommer les différences visuelles entre le précalculé et le rendu temps réel qui trahissent souvent le subterfuge. D’autres idées viendront sans doute enrichir le concept au fur et à mesure.

Dans cet article, je vous présente le fonctionnement général d’OpenRE ainsi que les différentes étapes prévues pour son développement. Vous trouverez également des liens vers les devlogs associés à chaque phase. J'y partagerai régulièrement mes avancées, mes réussites, mes échecs et mes réflexions.

## Environnement technique :
OpenRE repose sur deux outils largement utilisés et éprouvés :
- Blender : pour la génération des arrière-plans
- Godot : pour la gestion des éléments interactifs et le compositing avec les arrière-plans.

Ces deux logiciels sont distribués sous licence open-source. C'est un aspect essentiel pour moi, car il garantit liberté et indépendance technologique. Cela s'aligne aussi particulièrement bien avec les objectifs d'OpenRE, qui vise à promouvoir une technologie accessible et ouverte à tous.

Ensuite, sur le plan pratique, Godot prend nativement en charge le format de scènes de Blender. Ce sera un atout précieux pour la synchronisation des données entre les deux environnements. Cela permettra de fluidifier le workflow en réduisant les étapes manuelles et les erreurs potentielles.

Pour le scripting, j'utilise habituellement le C# dans mes projets Godot. Cependant, ce langage nécessite une version spécifique du moteur, ce qui peut limiter l'adoption d'OpenRE par la communauté. J’ai donc décidé de privilégier GDScript, le langage natif de Godot. Ce sera pour moi l’occasion d’élargir mes compétences, tout en offrant une compatibilité maximale à tous les utilisateurs.

Si vous préférez C#, pas d’inquiétude : OpenRE sera compatible avec les deux versions de Godot. Vous pourrez développer votre jeu dans le langage de votre choix. GDScript ne sera nécessaire que si vous souhaitez modifier OpenRE. Par ailleurs, le moteur offre un certain niveau d’interopérabilité entre les deux langages. Vous pourrez donc, selon les cas, personnaliser OpenRE même en C#.

## Principe général
Si vous êtes familier avec la technique du deferred rendering, vous comprendrez rapidement le fonctionnement d'OpenRE. Sinon, je vous recommande l'article [Forward Vs Deferred](/posts/forward_vs_deferred) qui explique les bases de manière accessible. Maintenant que nous savons tous ce qu'est un G-Buffer, entrons dans le vif du sujet !

#### Vue d'ensemble
La particularité d'OpenRE, c'est que le monde que l'on crée est séparé en 2 parties bien distinctes. Tellement distinctes qu'on a besoin de deux logiciels différents pour les éditer :
- **1. Le monde déterministe (Blender) :** comprend tous les éléments statiques ou prévisibles, comme l'architecture, les meubles ou les arbres.
- **2. Le monde interactif (Godot) :**  inclut les éléments dynamiques liés au gameplay, comme les personnages, les véhicules, les objets déplaçables ou les portes.

Pour rendre une frame, on commence par générer le G-Buffer de chacune des deux parties. Ensuite, on utilise les informations contenues dans ces G-Buffers pour calculer la contribution de chaque lumière sur chaque pixel comme dans un deferred renderer classique (ou presque, on y reviendra).

#### DG-Buffer : le G-Buffer du monde déterministe
Ce DG-Buffer est pré-rendu dans Blender et exporté sous forme d'images, qui seront importées plus tard dans Godot. On utilise le compositor et Cycles (le path-traceur de Blender) pour produire les maps suivantes :
- Depth
- Normal
- ORM (Ambiant Oclusion, Roughness et Metalic encodées dans une image)
- *diverses maps d'illumination*

À première vue, le DG-Buffer ne contient pas la map d'albedo (la couleur), ce qui paraît étrange. À la place, nous avons accès à *diverses maps d'illumination*. Deux raisons à cela :
- Le modèle d'illumination de Cycles est complexe. En sortie, il nous fournit neuf maps différentes. Parmi ces maps, une correspond à l’albedo, mais la recomposition finale de l'image nécessite les neuf.
- Dans un deferred renderer normal, l’illumination est calculée en temps réel à partir du G-Buffer. Ici, pour conserver la qualité de rendu offerte par Cycles et alléger la charge de calcul en temps réèl, nous intégrons les neuf maps au DG-Buffer (et pas seulement celle qui correspond à l’albedo). Ainsi l'image pourra être recomposée directement côté Godot la plupart du temps (on y reviendra).

#### IG-Buffer : le G-Buffer du monde interactif
Si Godot implémentait un deferred renderer, on pourrait récupérer directement les maps qui nous intéressent dans son G-Buffer. Mais malheureusement pour nous, le renderer officiel de Godot est un forward. Le G-Buffer n'existe pas, il faudra donc construire le nôtre.

Pour cela, il faudra probablement contourner certaines parties du système de rendu de Godot, ce qui pourrait entraîner des incompatibilités avec ses fonctionnalités graphiques natives.

Il est difficile, à ce stade, de prévoir ce qui fonctionnera ou non nativement. Mais, au besoin, je prévois de réimplémenter ce qu'il faut dans OpenRE pour qu'on ait au minimum :
- un shader PBR opaque
- la gestion des sources de lumières usuelles (point, spot, directional)
- la compatibilité avec le système d'UI natif de Godot
- la compatibilité (au moins partielle) avec le système de particules natif de Godot 
- l’implémentation d’un système d’ombres dynamiques
- un support (au moins partiel) de la transparence
 
#### Calcul de l'éclairage
Le calcul de la lumière suit le principe du deferred rendering classique : chaque pixel accumule les contributions lumineuses des sources de la scene. L'albedo du pixel est ensuite multiplié par cette accumulation de lumière pour obtenir la couleur finale. Pour savoir dans quel G-Buffer récupérer les informations du pixel concerné, il suffit de comparer les valeurs de la depth et de choisir le G-Buffer qui a là plus petite. Cependant, quelques subtilités émergent en raison de la dualité du monde.

En effet, je ne l'ai pas précisé jusqu'à maintenant, mais les sources de lumière aussi peuvent être déterministes (lampadaires, feux de cheminée, soleil...) ou interactives (lampe torche, flash d'un tir, phares de voiture). Cela a deux conséquences :
- La géométrie interactive doit recevoir la lumière déterministe. Les lumières de Blender doivent donc être répliquées et synchronisées dans Godot.
- Les lumières, comme les pixels, peuvent être déterministes ou interactifs. Selon la combinaison, le calcul de la contribution d'une lumière donnée sur un pixel donné sera différent. Voici un tableau récapitulatif :

| 			 				| Pixel Déterministe          									| Pixel Interactif     |
| :------------------------ |:-------------------------------------------------------------:| :-------------------:|
| **Lumière Déterministe** 	| Recomposition des maps de Cycles  							|  Deferred Light Pass |
| **Lumière Interactive** 	| Recomposition des maps de Cycles <br> + Deferred Light Pass	|  Deferred Light Pass |

## Phases de développement

#### Phase 1 : Proof of Concept (POC)
L’objectif principal de cette phase est d’explorer rapidement différents axes pour évaluer ce qui est faisable et dégager le périmètre d'OpenRE. Je ne me focalise ni sur la qualité du code ni sur l'optimisation, mais uniquement sur l’expérimentation. L’idée est d'avoir une vision claire de ce à quoi pourrait ressembler une première version opérationnelle de la technologie.

Lorsque j'estimerai avoir assez de recul, la codebase sera archivée et je repartirai de zéro. À ce moment-là seulement, je chercherai à construire une solution robuste, performante et ergonomique, tirant parti des enseignements acquis durant cette phase.

Le dépôt de ce POC ne sera pas public. Pour juger efficacement de la technologie, je dois m’appuyer sur des visuels suffisamment convaincants, ce qui nécessitera des assets graphiques de qualité et cohérents entre eux. Trouver de tels assets libres de droits et dans un délai raisonnable ne sera pas possible. Je ferai donc avec mes précédents achats et autres free contents que je n’ai pas le droit de redistribuer en dehors d’un exécutable.

##### Devlogs :
*Cette phase est en cours. Les devlogs seront publiés dès qu’ils seront disponibles.*

#### Phase 2 : Le SDK
Cette phase représente le véritable développement d’OpenRE. Elle aboutira, si tout se passe comme prévu, à une première version utilisable et documentée du SDK.

Bien que les détails exacts restent à préciser, le SDK devrait inclure :
- un addon Blender
- un addon Godot
- des scripts & utilitaires complémentaires

Contrairement au POC, le SDK sera bien entendu disponible sur un dépôt Git public et distribué sous licence open-source (qui reste à déterminer).

##### Devlogs :
*Cette phase n'a pas encore commencé*

#### Phase 3 : Une Démo Jouable
Pour présenter ce qu'OpenRE permet de faire, je prévois de réaliser une petite démo jouable. Ce projet permettra de tester le SDK dans un cas pratique et ainsi d’éprouver sa fiabilité et son ergonomie.

Malgré ma conviction que la caméra fixe dépasse le cadre du survival-horror, cette démo s’inspirera probablement des classiques du genre. En effet, j'aimerais beaucoup voir OpenRE utilisé dans des propositions vidéoludiques nouvelles. Mais mon admiration pour ce type de jeux est une grande source de motivation. Et n'étant pas un Game Designer aguerri, m’appuyer sur des codes que je connais me semble plus sage.

Je souhaite également distribuer cette démo sous licence open-source afin qu’elle serve de projet d’exemple pour les utilisateurs d’OpenRE. Cependant, comme pour le POC, je risque de rencontrer des contraintes liées aux droits d’utilisation des assets. Je ferai de mon mieux pour trouver une solution, mais je ne peux rien garantir à ce stade. En revanche, une version jouable gratuite sera mise à disposition sur [ma page itch.io](https://jponzo.itch.io/) quoi qu’il arrive.

##### Devlogs :
*Cette phase n'a pas encore commencé*

## Conclusion :
Je suis conscient que, tel que je le présente ici, OpenRE n’apparaît pas comme une solution universelle adaptable à tout type de projet. Le workflow reposant sur deux logiciels distincts (Blender et Godot) est atypique, et la perte de compatibilité avec certaines fonctionnalités graphiques natives de Godot peut être rédibitoire pour certains. Mais il faut bien commencer quelque part, et pour maximiser mes chances d’aller au bout de cette aventure, je préfère avancer étape par étape.

Pour l’instant, cette technologie répond avant tout à mes propres besoins et ambitions créatives. Cela dit, j’espère sincèrement que OpenRE (et peut être les jeux que je réaliserai avec) sauront inspirer d’autres créateurs, en montrant que cette technique souvent délaissée, permet encore aujourd'hui de faire de belles choses et mérite d’être explorée et réinventée.

Si le projet suscite de l’intérêt et rassemble une communauté, je serais ravi d’enrichir OpenRE, de l’adapter à d’autres usages, et à d'autre façons de travailler plus conventionnelles. Mais pour avancer dans cette direction, vos retours sont essentiels. Qu’est-ce qui vous attire dans OpenRE ? Qu’est-ce qui pourrait freiner votre envie de l’utiliser ? Y a-t-il des fonctionnalités qui vous manquent ? Ou peut être pensez vous déjà pouvoir en tirer quelque chose ? N’hésitez pas à partager vos impressions dans les commentaires.

En conclusion, je dirais que ce projet est pour moi une façon de rendre hommage à un genre vidéoludique qui m’a profondément marqué en tant que joueur et qui me manque beaucoup aujourd'hui. Même si OpenRE ne trouve qu’une petite audience ou même si je reste son unique utilisateur, je me plais à penser que ce que je partages sur ce blog ou ailleurs pourra insiter d’autres personnes à explorer cet art sous-estimé qu’est la caméra fixe, et à lui redonner la place qu’il mérite.