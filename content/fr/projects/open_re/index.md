+++
author = 'Turbo Tartine'
date = '2024-11-18T06:28:42+01:00'
draft = true
title = 'OpenRE (Open Retro Engine)'
description = 'Page de presentation du projet OpenRE'
+++
## Introduction
Si vous avez lu [cet article](/posts/i_love_fixed_cams), vous savez déjà que  j’ai un faible pour les caméras fixes et des contrôles tank. Ce genre vidéoludique, emblématiques de la fin des années 90, m'a toujours fasciné. Si ça ne vous parle pas trop, ou si vous êtes simplement curieux de découvrir ce qui le rend si unique à mes yeux, je vous invite à aller y jeter un œil.

C'est en essayant de créer mon propre jeu en caméra fixe que je me suis rendu compte d’une chose : les outils et ressources sur le sujet sont rares. Bien sûr, on trouve quelques tutoriels sur la gestion des caméras ou les déplacements du joueur, mais rien qui aborde ce qui, selon moi, est le vrai défi de cette approche : *"Comment intégrer efficacement et harmonieusement des éléments interactifs par-dessus des décor précalculés ?"*

C’est ce constat qui m’a poussé à créer OpenRE, une technologie libre et open-source destinée à simplifier le développement de jeux en caméra fixe et arrière-plans précalculés. C'est aussi un peu le laboratoire dans lequel j'experimente pour voir jusqu'où j'arrive à pousser cette technique sur du matériel modèrne. Mon premier objectif est de réduire les différences visuelles entre précalculé et temps réel. Je les trouve en effet un peu difficile à accepter pour nos yeux d'aujourd'hui et ce sont elles qui à mon sens trahissent le plus le subterfuge. Mais il est probable que d'autres idées viennent enrichir le projet au fil du développement.

Dans cet article, je vais vous présenter les principes fondamentaux d’OpenRE, ainsi que les grandes étapes prévues pour son développement. Vous trouverez aussi des liens vers des devlogs où je partagerai régulièrement mes avancées, mes échecs (parce qu’il y en aura !), et mes réflexions. Si vous aimez suivre les projets en coulisses, j’espère que vous apprécierez cette aventure autant que moi !

## Environnement technique :
OpenRE repose sur deux outils que vous connaissez sûrement :
- Blender : pour créer les arrière-plans précalculés.
- Godot : pour gérer tout ce qui est interactif et assembler le tout.

Ces logiciels sont suffisement répandus et éprouvés pour en faire des choix solides. Ils sont aussi open-source ce qui est un aspect essentiel pour moi. D'abord parce que cela s'aligne particulièrement bien avec les objectifs d'OpenRE, qui vise à promouvoir une technologie accessible et ouverte à tous. Mais aussi et surtout parce que c'est un modèle beaucoup plus sécurisant. En effet, l'actualité récente rapelle que placer son capital technologique entre les mains d'une entreprise à but lucratif comporte des risques.

Ensuite, sur le plan pratique, les deux outils fonctionnent très bien ensemble. En effet Godot lit nativement les scènes créées dans Blender ce qui simplifira énormément la synchronisation entre les deux environnements, nous évitant des manipulations fastidieuses et sources d'erreur.

Côté scripting, je vais bousculer un peu mes habitudes et utiliser GDScript plutôt que C#. Pourquoi ce choix ? Tout simplement parce que C# nécessite une version spécifique de Godot alors que GDScript est supporté partout. Ce sera l'occasion pour moi d'apprendre un nouveau langage et OpenRE sera ainsi accessible au plus grand nombre.

Si comme moi vous préférez le C#, rassurez-vous ! Vous n'aurez besoin de GDScript que si vous avez envie de bidouiller le plugin OpenRE lui même. Mais vous pourrez développer votre jeu dans le langage de votre choix.

## Principe général
Si vous êtes déjà familier avec la technique du *deferred rendering*,  vous ne serez pas dépaysé par le fonctionnement d’OpenRE. Sinon, je vous recommande d’abord un petit détour par l’article [Forward Vs Deferred](/posts/forward_vs_deferred) qui explique les base de manière accessible. Maintenant que nous sommes tous au clair sur ce qu’est un G-Buffer, entrons dans le vif du sujet !

#### Vue d'ensemble
Le principe d’OpenRE repose sur une séparation radicale du monde en deux parties bien distinctes. Et quand je dis "bien distinctes", je veux dire que nous auront besoin de deux logiciels différents pour les éditer :
- **1. Le monde déterministe (Blender) :** tout ce qui est statique ou prévisible, comme l’architecture, les meubles ou les arbres.
- **2. Le monde interactif (Godot) :**  tout les éléments dynamiques liés au gameplay : personnages, véhicules, objets déplaçables, portes... bref tout ce dont le mouvement ne peut être prédit à l'avance.

Pour rendre une frame, OpenRE a besoin du G-Buffer de chacun des deux mondes. Le G-Buffer intéractif (IG-Buffer) est construit à la volée dans Godot tandis que le déterministe (DG-Buffer) est précalculé dans Blender. Les deux sont ensuite combiné dans Godot et une passe de *deffered shading* classique (ou presque...) est effectuée pour rendre les lumières.

#### DG-Buffer : le G-Buffer du monde déterministe
Le DG-Buffer est donc généré à l'avance dans Blender puis exporté sous forme d'images, qui seront importées plus tard dans Godot. Blender dispose de deux moteurs de rendu :
- **Eevee** : Utilise la *rasterization* qui est la technique utilisée dans le jeu vidéo. Ce moteur permet un rendu quasi-temps réèl mais n'est pas photoréaliste.
- **Cycles** : Utilise du *path-tracing* pour un rendu photoréaliste. Ce moteur est concu pour le cinéma et n'est pas temps réèl du tout (rendre une image prend plusieurs minutes).

On utilisera bien sûre Cycles pour une qualité maximal et le compositeur de Blender nous permettra de décomposer l'image rendue pour obtenir les maps de notre DG-Buffer :
- Depth (profondeur)
- Normal (orientation des surfaces)
- ORM (ambiant Oclusion, Roughness et Metalness encodées dans une seule image)
- *diverses maps d'illumination*

Vous remarquerez peut-être l’absence de la map d’albedo (couleur) au profit de *diverses maps d'illumination*. Pourquoi ?
- 1. Le modèle d’illumination de Cycles est assez complexe. En sortie, on obtient neuf maps d'illumination différentes. En réalité, l’une de ces map correspond à l’albedo. Mais pour recomposer l’image finale, nous auront besoin des neuf.
- 2. On pourrait se contanter d'intégrer l'albedo mais il faudrait alors recalculer l'éclairage côté Godot. On perdrait à la fois la qualité produite par Cycles et énormement de temps de calcul. Les neuf maps sont donc intégrées au DG-Buffer pour être recomposées directement lorsque c'est approprié (voire plus loin).

#### IG-Buffer : le G-Buffer du monde interactif
Si Godot implémentait un deferred renderer, on pourrait piocher les maps qui nous intéressent directement dans son G-Buffer. Mais malheureusement pour nous, le renderer officiel de Godot est un forward. Il n'y a donc pas de G-Buffer. 

Il va falloir bricoler le nôtre, ce qui nécessitera de contourner une partie du système de rendu de Godot. Cette opération laissera probablement des sequelles. On pourrait notament casser la compatibilité avec certaines fonctionnalités graphiques natives.

Difficile de prévoir ce qu'on pourra conserver ou non à ce stade. Mais si des fonctionnalités essentielles sont perdues, je prévois d'implémenter des substitus directement dans OpenRE. Les utilisateurs pourrons notament compter sur :
- un shader PBR opaque
- la gestion des sources de lumières usuelles (point, spot, directional)
- la compatibilité avec le système d'UI natif de Godot
- la compatibilité (au moins partielle) avec le système de particules natif de Godot 
- l’implémentation d’un système d’ombres dynamiques
- un support (au moins partiel) de la transparence
 
#### Calcul de l'éclairage
Le calcul de la lumière suit le principe du deferred rendering classique : on accumule les contributions lumineuses sur chaque pixels puis on se sert de ce cummul pour déterminer la couleur final du pixel. Les informations nécessaires à ce calcul se trouvent dans le G-Buffer. Dans le cas d'OpenRE on en a deux, mais pas de panique ! Il suffit de comparer les valeurs de la depth pour choisir le plus proche de la caméra. Cela dit, la dualité du monde implique une autre subtilité un peu moins évidente.

En effet, je ne l'ai pas précisé jusqu'ici, mais les sources de lumière aussi peuvent être déterministes (lampadaires, feux de cheminée, soleil...) ou interactives (lampe torche, flash d'un tir, phares de voiture). Cela a deux conséquences :
- Les lumières déterministes (de Blender) doivent être répliquées dans Godot pour pouvoir éclairer les éléments interactifs.
- Le calcul de la contribution d'une lumière sur un pixel diffère selon les mondes auquels ils appartiennent. Voici un tableau récapitulatif des différentes combinaisons :

| 			 				| Pixel Déterministe          									| Pixel Interactif     |
| :------------------------ |:-------------------------------------------------------------:| :-------------------:|
| **Lumière Déterministe** 	| Recomposition des maps de Cycles  							|  Deferred Light Pass |
| **Lumière Interactive** 	| Recomposition des maps de Cycles <br> + Deferred Light Pass	|  Deferred Light Pass |

## Phases de développement

#### Phase 1 : Proof of Concept (POC)
Le but de cette première étape est de débrousailler le terrain pour se faire une première idée du potentiel d'OpenRE. On cherche à évaluer ce qui est possible et les résultats que l'on peut espérer. L'important ici n'est pas l'optimisation ou l'élegance du code. On cherche simplement à identifier les verroux techniques et on s'assure qu'il est possible de les faire sauter (à grand coup de débrouille et d'improvisation si il le faut).

Lorsque j'aurais une vision suffisament claire du projet et que j'aurai levé les doutes quant à sa faisabilité, ce code sera mis au placard et je repartirai d'une feuille blanche. Ce n’est qu’à ce moment-là que je me préocuperai de la qualité, de la performance et de l’ergonomie.

Le dépôt de ce POC ne sera malheureusement pas public. De toutes façons, la codebase sera affreuse et vous n'aurez pas envie de mettre le nez dedans, mais ce n'est pas la raison principale. En réalité, pour juger de la qualité visuelle dont est capable OpenRE, j'aurais besoin d'assets de qualité et cohérents entre eux.  Trouver de tels assets libres de droits et dans un délai raisonnable serait un vrai casse tête. Je vais donc utiliser des ressources déjà en ma possession (achetées ou gratuites) et je ne peux pas les redistribuer.



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