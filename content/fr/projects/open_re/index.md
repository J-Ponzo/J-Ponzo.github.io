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

## Partie 1 : Environnement technique :
OpenRE repose sur deux outils que vous connaissez sûrement :
- Blender : pour créer les arrière-plans précalculés.
- Godot : pour gérer tout ce qui est interactif et assembler le tout.

Ces logiciels sont suffisement répandus et éprouvés pour en faire des choix solides. Ils sont aussi open-source ce qui est un aspect essentiel pour moi. D'abord parce que cela s'aligne particulièrement bien avec les objectifs d'OpenRE, qui vise à promouvoir une technologie accessible et ouverte à tous. Mais aussi et surtout parce que c'est un modèle beaucoup plus sécurisant. En effet, l'actualité récente rapelle que placer son capital technologique entre les mains d'une entreprise à but lucratif comporte des risques.

Ensuite, sur le plan pratique, les deux outils fonctionnent très bien ensemble. En effet Godot lit nativement les scènes créées dans Blender. Comme on le verra, nous auront besoin de synchronniser les deux environnements et cette synergie nous évitera des manipulations fastidieuses et sources d'erreur.

Côté scripting, je vais bousculer un peu mes habitudes et utiliser GDScript plutôt que C#. Pourquoi ce choix ? Tout simplement parce que C# nécessite une version spécifique de Godot alors que GDScript est supporté partout. Ce sera l'occasion pour moi d'apprendre un nouveau langage et OpenRE sera ainsi accessible au plus grand nombre.

Si comme moi vous préférez le C#, rassurez-vous ! Vous n'aurez besoin de GDScript que si vous souhaitez bidouiller le plugin OpenRE lui même. Mais vous pourrez développer votre jeu dans le langage de votre choix.

## Partie 2 : Principe général
Maintenant nous allons mettre un peu les mains dans le camboubi. Cette section est destinée à ceux qui veulent plonger dans les détails techniques. Si cet aspect ne vous interesse pas spétialement, et que vous préférez aborder OpenRE d'un point de vue utilisateur (ce qui est votre droit), voici une synthèse des points à retenir :
- OpenRE s'appuie sur une séparation stricte du monde. Il y a d'un côté le monde deterministe et de l'autre le monde interactif
- Le monde déterministe comprend ce qui est static. On l'édite dans Blender
- Le monde interactif comprend ce qui est dynamique. On l'édite dans Godot
- Le monde déterministe est précalulé dans Blender puis exporté sous la forme d'une collection d'images (contenant diverse données)
- Cette collection d'images représentant le monde deterministe est importée dans Godot pour y être fusionnée en temps réèl avec le monde interactif. A l'écran les deux mondes sont quasi-indicernables. Ils s'occludent mutuellement et les lumières de l'un s'appliquent à l'autre.
- Ce procédé offre une qualité graphique élevée pour les arrière-plans tout en minimisant les coûts en performance.
- Mais ce procédé n'est pas sans consequences : la compatibilité avec certaines fonctionnalité graphique de Godot pourrait être perdue
- Pour mitiger cela, les fonctionnalités perdues et considérées comme essentielles seront réimplémentées dans OpenRE


Si cette mise en bouche ne vous a pas rassasié et vous voulez comprendre un peu mieux ce qui se passe sous le capot, je vous invite à poursuivre la lecture. Sinon je vous donne rendez-vous directement à la Partie 3.

#### Vue d'ensemble
Si vous êtes déjà familier avec la technique du *deferred rendering*, vous ne serez pas dépaysé par le fonctionnement d’OpenRE. Sinon, je vous recommande d’abord un petit détour par l’article [Forward Vs Deferred](/posts/forward_vs_deferred) qui explique les base de manière accessible. Maintenant que nous sommes tous au clair sur ce qu’est un G-Buffer, entrons dans le vif du sujet !

Comme évoqué dans la patie précendente, OpenRE repose sur une séparation du monde en deux parties bien distinctes :
- **1. Le monde déterministe (Blender) :** tout ce qui est statique ou prévisible, comme l’architecture, les meubles ou les arbres.
- **2. Le monde interactif (Godot) :**  tout les éléments dynamiques liés au gameplay : personnages, véhicules, objets déplaçables, portes... bref tout ce dont le mouvement ne peut être prédit à l'avance.

Pour rendre une frame, OpenRE a besoin du G-Buffer de chacun des deux mondes. Le G-Buffer intéractif (IG-Buffer) est construit à la volée dans Godot tandis que le déterministe (DG-Buffer) est précalculé dans Blender. Les deux sont ensuite combiné dans Godot et une passe de *deffered shading* classique (ou presque...) est effectuée pour rendre les lumières.

#### DG-Buffer : le G-Buffer du monde déterministe
Blender dispose de deux moteurs de rendu :
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

## Partie 3 : Phases de développement

#### Proof of Concept (POC)
Le but de cette première étape est de débrousailler le terrain pour se faire une première idée du potentiel d'OpenRE. On cherche à évaluer ce qui est possible et les résultats que l'on peut espérer. L'important ici n'est pas l'optimisation ou l'élegance du code. On cherche simplement à identifier les verroux techniques et on s'assure qu'il est possible de les faire sauter (à grand coup de débrouille et d'improvisation si il le faut).

Lorsque j'aurais une vision suffisament claire du projet et que j'aurai levé les doutes quant à sa faisabilité, ce code sera mis au placard et je repartirai d'une feuille blanche. Ce n’est qu’à ce moment-là que je me préocuperai de la qualité, de la performance et de l’ergonomie.

Le dépôt de ce POC ne sera malheureusement pas public. De toutes façons, la codebase sera affreuse et vous n'aurez pas envie de mettre le nez dedans, mais ce n'est pas la raison principale. En réalité, pour juger de la qualité visuelle d'OpenRE, j'aurais besoin d'assets de qualité et cohérents entre eux.  Trouver de tels assets libres de droits et dans un délai raisonnable serait un vrai casse tête. Je vais donc utiliser des ressources déjà en ma possession (achetées ou gratuites) et je ne peux pas les redistribuer.



##### Devlogs :
*Cette phase est en cours. Les devlogs seront publiés dès qu’ils seront disponibles.*

#### Le SDK
C'est ici que les choses serieuses commenceront. L'enjeu étant de faire passer OpenRE du stade de prototype informe à quelque chose de réèlement utilisable. Si tout ce passe comme prévue, à l'issue de cette phase nous auront un SDK fonctionnel et suffisement documenté pour être utilisé dans de vrai projets.

A l'heure ou j'écris ces lignes, le POC est bien avancé mais pas encore terminé. Certains détails restent donc à préciser mais le SDK devrait inclure :
- un addon Blender
- un addon Godot
- des scripts & utilitaires complémentaires

Contrairement au POC, le SDK sera open-source et disponible sur un dépôt public. Je serais en effet très heureux d'apprendre qu'OpenRE est utilisé dans vos créations. Si le coeur vous en dit, n'hésitez pas à me faire savoir sur quoi vous travaillez. Cela m'interesse au plus haut point. Dans un premier temps je ne pense pas accepter de contributions spontanées. Mais je vous encourage à partager vos idées, retours et autres *bug reports* sur le [github du projet](). 

##### Devlogs :
*Cette phase n'a pas encore commencé*

#### Une Démo Jouable
Pour montrer ce qu'OpenRE permet de faire, je prévois de réaliser une petite démo jouable. Je pourrai ainsi tester le SDK sur un cas pratique afin d’éprouver sa fiabilité et son ergonomie.

Si vous avez lu l'article cité dans l'intro, vous savez que pour moi la caméra fixe dépasse largement le cadre du survival-horror. J'aimerais beaucoup voir OpenRE utilisé pour d'autres types de jeux, voir même dans des propositions vidéoludiques nouvelles. Mais je ne suis pas vraiment game designer et il est donc plus réaliste pour moi de m'appuyer sur des codes bien établis plutôt que de partir dans l'inconnu. On restra donc surement dans la veine des survivals horrors classics des années 90 auquels j'ai énormement joué.

Idéalement, cette démo sera elle aussi open-source et servira de projet d’exemple. Mais là encore, des contraintes liées aux droits d’utilisation des assets pourraient compliquer les choses. Je ne peux donc rien promettre mais quoi qu’il arrive, une version jouable gratuite sera mise à disposition sur [ma page itch.io](https://jponzo.itch.io/)

##### Devlogs :
*Cette phase n'a pas encore commencé*

## Conclusion :
Je suis conscient que, tel que je le présenté ici, OpenRE n’apparaît pas comme une solution universelle adaptable à tout type de projet. Le workflow reposant sur deux logiciels distincts (Blender et Godot) est atypique, et la perte de compatibilité avec certaines fonctionnalités graphiques natives de Godot peut être rédibitoire pour certains. Mais il faut bien commencer quelque part, et pour maximiser mes chances d’aller au bout de cette aventure, je préfère avancer étape par étape.

Pour l’instant, cette technologie répond avant tout à mes propres besoins et ambitions créatives. Cela dit, j’espère sincèrement que OpenRE (et peut être les jeux que je réaliserai avec) sauront inspirer d’autres créateurs, en montrant que cette technique souvent délaissée, permet encore aujourd'hui de faire de belles choses et mérite d’être explorée et réinventée.

Si le projet suscite de l’intérêt et rassemble une communauté, je serais ravi d’enrichir OpenRE, de l’adapter à d’autres usages, et à d'autre façons de travailler plus conventionnelles. Mais pour avancer dans cette direction, vos retours sont essentiels. Qu’est-ce qui vous attire dans OpenRE ? Qu’est-ce qui pourrait freiner votre envie de l’utiliser ? Y a-t-il des fonctionnalités qui vous manquent ? Ou peut être pensez vous déjà pouvoir en tirer quelque chose ? N’hésitez pas à partager vos impressions dans les commentaires.

En conclusion, je dirais que ce projet est pour moi une façon de rendre hommage à un genre vidéoludique qui m’a profondément marqué en tant que joueur et qui me manque beaucoup aujourd'hui. Même si OpenRE ne trouve qu’une petite audience ou même si je reste son unique utilisateur, je me plais à penser que ce que je partages sur ce blog ou ailleurs pourra insiter d’autres personnes à explorer cet art sous-estimé qu’est la caméra fixe, et à lui redonner la place qu’il mérite.