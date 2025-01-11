+++
author = 'Turbo Tartine'
date = '2024-11-18T06:28:42+01:00'
draft = true
title = 'OpenRE (Open Retro Engine)'
description = 'Page de presentation du projet OpenRE'
+++
## Introduction
Si vous avez lu [cet article](/posts/i_love_fixed_cams), vous savez déjà que je suis un grand nostalgique des caméras fixes et des contrôles tank. Ce genre vidéoludique, caractéristique de la fin des années 90, m'a toujours fasciné. Si vous ne voyez pas à quoi je fais allusion, ou que vous souhaitez simplement découvrir ce qui me plaît tant dans ces jeux, je vous invite à y jeter un œil. Cela devrait satisfaire votre curiosité.

Lorsque j’ai voulu développer mon propre jeu en caméra fixe, je me suis rapidement heurté à un problème : les outils et ressources sur le sujet sont rares. Certes, on trouve quelques tutoriels sur la gestion des caméras ou sur les déplacements du joueur dans ce contexte particulier. Mais rien ne traite de ce que je considère comme le principal défi de cette approche : *"Comment intégrer harmonieusement des éléments interactifs par-dessus des arrière-plans précalculés ?"* (D’ailleurs, si vous avez des références sur le sujet, n'hésitez pas à les partager dans les commentaires.)

C'est de ce constat qu'est née OpenRE : une technologie libre et open-source destinée au développement de jeux vidéo en caméra fixe et arrière-plan pré-calculés. Ce projet est aussi l'occasion d'explorer les possibilités offertes par les technologies modernes. Mon objectif est de rendre indiscernable le précalculé du rendu en temps réel en m'appuyant notamment sur des techniques comme le *deferred rendering* afin d'unifier l'éclairage des deux mondes. D’autres idées viendront sans doute enrichir le concept au fil du développement.

Dans cet article, je vous présente le fonctionnement général d’OpenRE ainsi que les différentes étapes prévues pour son développement. Vous trouverez également des liens vers les devlogs associés à chaque phase. J'y partagerai régulièrement mes avancées, mes réussites, mes échecs et mes réflexions techniques.

## Environnement technique :
OpenRE repose sur deux outils largement utilisés et éprouvés :
- Blender : pour la génération des arrière-plans
- Godot : pour la gestion des éléments interactifs et le compositing avec les arrière-plans.

Ces deux logiciels sont distribués sous licence open-source. C'est un aspect essentiel pour moi, car il garantit liberté et indépendance technologique. Cela s'aligne aussi particulièrement bien avec les objectifs d'OpenRE, qui vise à promouvoir une technologie accessible et ouverte à tous.

Ensuite, sur le plan pratique, Godot prend nativement en charge le format de scènes de Blender. Ce sera un atout précieux pour la synchronisation des données entre les deux environnements. Cela permettra de fluidifier le workflow en réduisant les étapes manuelles et les erreurs potentielles.

Pour le scripting, j'utilise habituellement le C# dans mes projets Godot. Cependant, ce langage nécessite une version spécifique du moteur, ce qui peut limiter l'adoption d'OpenRE par la communauté. J’ai donc décidé de privilégier GDScript, le langage natif de Godot. Ce sera pour moi l’occasion d’élargir mes compétences, tout en offrant une compatibilité maximale à tous les utilisateurs.

Si vous préférez C#, pas d’inquiétude : OpenRE sera compatible avec les deux versions de Godot. Vous pourrez développer votre jeu dans le langage de votre choix. GDScript ne sera nécessaire que si vous souhaitez modifier OpenRE. Par ailleurs, le moteur offre un certain niveau d’interopérabilité entre les deux langages. Vous pourrez donc, selon les cas, personnaliser OpenRE même en C#.

## Principe général
Si vous êtes familier avec la technique du *deffered rendering*, vous comprendrez rapidement le fonctionnement d'OpenRE. Pour les autres, je vous recommande l'article [Forward Vs Deffered](/posts/forward_vs_deffered) qui explique les bases de manière accessible. Maintenant que nous savons tous ce qu'est un G-Buffer, entrons dans le vif du sujet !

#### Vue d'ensemble
La particularité d'OpenRE, c'est que le monde que l'on créé est séparé en 2 partie bien distinctes. Tellement distinctes, que l'on a besoin de deux logiciels différents pour les éditer :
- **1. Le monde déterministe (Blender) :** comprend tous les éléments statiques ou prévisibles, comme l'architecture, les meubles, ou les arbres.
- **2. Le monde interactif (Godot) :**  inclut les éléments dynamiques liés au gameplay, comme les personnages, les véhicules, les objets déplaçables, ou les portes.

Pour rendre une frame, on commence par génèrer le G-Buffer de chacuns des 2 mondes. Ensuite, on utilise les informations contenue dans ces G-Buffers pour calculer la contributions de chaque lumière sur chaque pixel comme dans un *deferred renderer* classic ou presque.

#### DG-Buffer : le G-Buffer du monde déterministe :
Ce DG-Buffer est généré offline dans blender et exporté sous forme d'images, pour être importé ensuite dans Godot. On utilise le compositor de Blender avec Cycles pour produire différentes maps, notamment :
- La depth
- La normal
- l'ORM (Ambiant Oclusion, Roughness et Metalic encodées dans une image)
- *diverses maps d'illumination*

A première vue, le DG-Buffer ne contient pas de map d'albedo (la couleur) ce qui parrait étrange. A la place nous avons acces à *diverses maps d'illumination*. Deux raisons à cela :
- Le model d'illumination de Cycle est complexe. En sortie, il nous fourni neuf maps différentes. Parmi ces cartes, une correspond à l’albedo, mais la recomposition finale de l'image nécessite les neuf.
- Dans un deferred renderer normal, l’illumination est calculée en temps réel à partir du G-Buffer. Ici, pour conserver la qualité de rendu offerte par Cycles et éviter un recalcul couteux dans Godot, nous intégrons les 9 maps au DG-Buffer (et pas seulement celle qui correspond à l'albedo).

#### IG-Buffer : le G-Buffer du monde interactif :
Si Godot implémentait un *deffered renderer*, on n'aurait qu'a récupérer directement les maps qui nous interesse dans son G-Buffer. Mais malheureusement pour nous, le renderer officiel de Godot est un *forward*. Le G-Buffer n'existe pas, il faudra donc  trouver un moyen de le construire nous même.

Il sera peut-être nécessaire de bybasser une partie du système de rendu du moteur. Ce qui risque d'entrainer des incompatibilité avec certaines fonctionnalités graphiques natives.

Il est difficle d'anticiper ce qui restera compatible ou non. Pour l'heure il est plus prudent de considérer qu'OpenRE se substitura totalement à la partie graphique de Godot. En conséquence, les seules features graphiques disponnible avec OpenRE seraint celle que j'aurais réimplémenté. Je prévois à minima :
- un material PBR opaque
- la gestion des sources de lumières usuelles (point, cone, directionnal)
- la compatibilité avec le système d'UI natif de Godot
- l'implémentation d'un système d'ombres dynamiques
- un support (au moins partiel) de la transparence
 
#### Calcule de l'éclairage :
L'application de la lumière sera très similaire à du *deffered rendering* classique : pour chaque pixel, on accumule les contribution lumineuse de chacunes des source et on multiplie cette valeur par la couleur du pixel. Pour savoir dans quel G-Buffer récupérer les information du pixel, il suffit de comparer la depth. Il y aura juste quelques subtilités en plus liées à la dualité du monde.

Pour expliquer ces subtilités, je dois aborder un point que j'ai volontairement éludé jusqu'ici. On sait que la géométrie qui compose le jeu est divisée en une partie déterministe et une partie interactive. Mais qu'en est-t-il des source de lumières ? Et bien c'est exactement pareil. Il y'a des source intéractives qui vivent dans Godot (une lampe torche, le flash d'un coup de feu, les phares d'une voiture...) et des source déterministes qui vivent dans Blender (un feu de cheminé, un lampadaire, le soleil...).

Première subtilité, la géometrie du monde intéractif a besoin de recevoir la lumière du monde déterministe. Pour cela on a besoin de répliquer et de syncroniser les sources déterministes dans les 2 scènes (Blender et Godot).

Deuxième subtilité, nous avons maintenant des lumières déterministes ou interactives qui contribuent à des pixels eux aussi déterministes ou interactifs. Selon les combinaisons, l'illumination ne va pas être calculée de la même manière. Voici un petit tableau récapitulatif de quoi faire quand pour que ça fonctionne.

| 			 				| Pixel Déterministe          | Pixel Interactif |
| :--------------- 			|:---------------:| :-----:|
| **Lumière Déterministe** 	| Composition des maps du DG-Buffer  |  Deffered classic |
| **Lumière Interactive** 	| Composition des maps du DG-Buffer <br> + Deffered classic       |  Deffered classic |

## Phases prévues

#### Proof of Concept (POC)
Dans cette phase je ne me focalise pas sur le design, la qualité du code ou l'optimisation. J'explore simplement differents axes le plus rapidement possible pour essayer de déterminer ce qui va être faisable ou non et jusqu'où je pourrai aller. L'objectif ici est d'aller vite et de se faire un idée relativement précise de ce à quoi pourra ressembler une V1 d'OpenRE. Lorsque j'aurai suffisement de recul, la code base sera archivée et je repartirai de zéro. A ce moment là seulement, je chercherai à construir une solution propre, robuste et efficace à la lumière de l'experience acquise.

Le répo de ce POC ne sera malheureusement pas public. En effet j'ai besoin d'asset 3D pour mes scenes d'exemple <trouver un meilleur terme>. L'idée étant de se projeter dans les possibilités de la technologie, j'ai besoin que les rendus finaux soitent un minimum crédible. Trouver des assets de qualité et cohérents avec le rendu recherché n'est pas quelque chose de simple. Se restrindre uniquement à des assets libres de droits ne serait pas réaliste. D'autant plus qu'on cherche à aller vite et que la recherche d'asset est toujour très chronophage. Je fonctionnerai donc avec des assets pas trop cher ou que je possede déjà ainsi qu'avec les free contents d'Epic. Mais je n'ai pas le droits de les redistribuer.

##### Devlogs :

#### Développement du SDK
Cette phase est la "vrai" phase de développement d'OpenRE. Elle aboutira si tout se passe bien à une première version utilisable du SDK. A l'heure ou j'écris ces ligne, cette phase n'a pas encore commencé. Il est donc un peu tôt pour savoir ce que contiendra ce SDK mais il y aura certainement :
- un addon Blender
- un addon Godot
- quelques scripts & utilitaires

Contrairement au POC, le SDK sera bien entandu disponnible sur un repo git public et distribué sous une licence libre et open-source (qui reste à déterminer).

##### Devlogs :
*Cette phase n'a pas encore commencé*

#### Démo
Afin de montrer ce qu'OpenRE est capable de faire, je prévois de réaliser un petit jeu avec. Cela me permetra également d'éprouver un peu la techno sur un cas réèl et si nécessaire d'y apporter des ajustement pour la rendre plus fiable et plus ergonomique.

Je n'ai pas encore décidé en quoi consistera cette démo, mais elle reprendra certainement le gameplay des vieux Resident Evil. J'aimerai beaucoup qu'OpenRE soit utilisée un jour pour donner vie à autre chose que des survival horror old school. Comme vous le savez déjà si vous avez lu l'article en lien plus haut, je suis persuadé que la caméra fixe va bien au dela de ce genre specifique. Pourquoi ne pas faire autre chose dans ce cas ? Tout simplement parce que je ne suis pas Game Designer et que c'est plus facile pour moi me lancer dans un concepte bien défini et que je connais bien.

J'aimerai également pouvoir distribuer cette démo sous licence open-source. Cela permetrait de faire office de projet d'exemple illustrant comment utiliser OpenRE. Mais je risque de me retrouver face à la même problématique d'asset que pour le POC. J'essairai de voir ce que je peux faire, mais je ne peux rien promettre. En revanche, le build sera disponnible gratuitement sur ma page [itch.io](https://jponzo.itch.io/)

##### Devlogs :
*Cette phase n'a pas encore commencé*

## Conclusion :
