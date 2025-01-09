+++
author = 'Turbo Tartine'
date = '2024-11-18T06:28:42+01:00'
draft = true
title = 'OpenRE (Open Retro Engine)'
description = 'Page de presentation du projet OpenRE'
+++
## Introduction
Si vous avez lu [cet article](/posts/i_love_fixed_cams), vous savez déjà que je suis un grand nostalgique des caméras fixes et des contrôles tank. Ce genre vidéoludique, caractéristique de la fin des années 90, m'a toujours fasciné. Si vous ne voyez pas à quoi je fais allusion, ou que vous souhaitez simplement découvrir ce qui me plaît tant dans ces jeux, je vous invite à y jeter un œil. Cela devrait satisfaire votre curiosité.

Lorsque j’ai voulu développer mon propre jeu en caméra fixe, je me suis rapidement heurté à un problème : les outils et ressources sur le sujet sont rares. Certes, on trouve quelques tutoriels sur la gestion des caméras ou sur les déplacements du joueur dans ce contexte particulier. Mais rien ne traite ce que je considère comme le principal défi de cette approche : *"Comment intégrer harmonieusement des éléments interactifs par-dessus des arrière-plans précalculés ?"* (D’ailleurs, si vous avez des références sur le sujet, n'hésitez pas à les partager dans les commentaires.)

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
Si vous êtes familier avec la technique du *deffered rendering*, vous devriez comprendre facilement comment OpenRE fonctionne. Si ce n'est pas le cas je vous recommande l'article [Forward Vs Deffered](/posts/forward_vs_deffered) qui vulgarise le concepte. Maintenant que nous sommes tous à la même page démarons les explications.

La particularité d'OpenRE, c'est que le jeu que l'on crée va se découper en 2 partie bien distinctes. Tellement distinctes, qu'elles vivront dans 2 logiciels différents : Blender et Godot. On aura d'un côté le monde *déterministe* constitué de toute la géométrie qui ne bouge page (ou de manière prévisible), et de l'autre le monde *interactif* qui sera lui composé de ce qui doit réagire aux actions du joueur et n'est donc par définition pas possible à prévoire (Personnage, NPC, élements interactibles etc...).

La particularité d'OpenRE, c'est que le monde que l'on créé est séparé en 2 partie bien distinctes. Tellement distinctes, que l'on a besoin de deux logiciels différents pour les éditer :
* **1. Le monde déterministe (Blender) :** blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla 
* **2. Le monde interactif (Godot) :** blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla blabla

Le monde *déterministe* sera modélisé directement dans Blender. Cela permetra de produire des arrière plans de qualité grace à *Cycles* : le moteur de rendu photoréaliste de Blender. En réalité, on ne rendra pas l'image finale directement, mais plusieurs images représentants diveres informations en screen-space comme la profondeur, l'albedo, la normale, la quantité de lumière...

Dans Godot, on implémentera la partie *interactive* du jeu et on cherchera à le rendre sous la même forme que les images du monde *déterministe* issues de blender (profondeur, albedo, normal, illumination...). Si Godot implémentait un *deffered renderer*, cette opération serait assez immediate car en effet, ces images sont à quelque chose près les maps que l'on trouve dans le G-Buffer. Mais malheureusement pour nous, le renders officiel de Godot est un *forward*. Un des enjeux du projet sera donc de voir comment on peu bricoller pour optenir ces maps.
 
L'idée est donc de populer un *G-Buffer deterministe* à partir des images pré-rendues dans Blender et un *G-Buffer interactif* rendu en temps réèl dans Godot. En théorie, à partir de ce point, on a plus qu'à composer les 2 G-Buffer en se basant sur la depth pour obtenir le G-Buffer final et à appliquer la passe de lighting comme on le ferait dans Deffered classic.
 
Si tout se passe comme dans le plan, les lumières *interactives* devraient s'appliquer sans effort au monde *deterministes* (les arrières plans). En revanche pour que les lumière *déterministe* illuminent le monde *interactif*, nous n'auront d'autre choix que de dupliquer les light de la scene Blender dans la scene Godot.

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
