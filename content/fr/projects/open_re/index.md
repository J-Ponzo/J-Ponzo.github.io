+++
author = 'Turbo Tartine'
date = '2024-11-18T06:28:42+01:00'
draft = true
title = 'OpenRE (Open Retro Engine)'
description = 'Page de presentation du projet OpenRE'
+++
## Introduction
Comme vous pouvez le constater en détail dans [cet article](/posts/i_love_fixed_cams), je suis un grand nostalgique de l'ère des caméra fixe et des contrôles tank. Si vous ne voyez pas à quoi je fais référence, je vous conseille d'y faire un tour. Les réponses aux questions que vous vous posez s'y trouvent certainement.

En cherchant à développer un jeu de ce type, je me suis vite rendu compte qu'il n'était pas facile de trouver des outils/resources traitant du sujet. Apparament les seules chose qui existent aident à la manipulation des caméras mais je n'ai rien trouvé permetant de tirer partie de l'immobilité des points de vue en précalculant le rendu de la scene. Ce qui à mon sens est pourtant le principale interêt (et la principale difficulté) lié à cette technique. C'est donc assez naturellement que j'en suis venu à développer ma propre solution : OpnRE.  

Il s'agit d'une technologie libre et open source qui vise à faciliter le développement de jeux en caméra fixe et arrière plan précalculée. C'est également un pretexte pour dépoussiérer cette technologie un peu datée et d'explorer ce qu'elle peut offrire sur du hardware moderne. Pour l'instant je cherche princalement comment gommer les différences visuelles entre les arrière plan statique et les entités interactives. Je m'interesse donc notament à comment appliquer les lumière de l'un à l'autre. Mais j'aurais certainement d'autres idées au cours du développement.

Dans cette article, je présente le principe général sur lequel fonctionne OpenRE ainsi que les différentes phase de développement prévues. Vous pouvez également accéder aux devlog de chacune de ces phases depuis les sections correspondantes et ainsi suivre l'avancement du projet.

## Dépendances :
OpenRE s'appuiera sur 2 outils éprouvés et largement répandus :
- Blender : pour le rendu des arrière plans
- Godot : pour la partie interactive du jeu et le compositing avec les arrière plans

La première raison motivant ce choix est que ces deux softwares sont distribué sour licence open-source, ce qui permet de rester fidèle aux valeurs de liberté et d'indépendance technologique garanties par le logiciel libre. L'autre avantage plus pragmatique de ce combo est que Godot suporte nativement le format de scene de blender. Ce qui sera un avantage colossale pour la synchronisation des scenes dans les 2 environnements.

## Principe général

## Phases prévues

#### Proof of Concept (POC)
Dans cette phase je ne me focalise pas sur le design, la qualité du code ou l'optimisation. J'explore simplement differents axes le plus rapidement possible pour essayer de déterminer ce qui va être faisable ou non et jusqu'où je pourrai aller. L'objectif ici est d'aller vite et de se faire un idée relativement précise de ce à quoi pourra ressembler une V1 d'OpenRE. Lorsque j'aurai suffisement de recul, la code base sera archivée et je repartirai de zéro. A ce moment là seulement, je chercherai à construir une solution propre, robuste et efficace à la lumière de l'experience acquise.

Le répo de ce POC ne sera malheureusement pas public. En effet j'ai besoin d'asset 3D pour mes scenes d'exemple <trouver un meilleur terme>. L'idée étant de se projeter dans les possibilités de la technologie, j'ai besoin que les rendus finaux soitent un minimum crédible. Trouver des assets de qualité et cohérents avec le rendu recherché n'est pas quelque chose de simple. Se restrindre uniquement à des assets libres de droits n'est pas réaliste. D'autant plus qu'on cherche à aller vite et que la recherche d'asset est toujour très chronophage. Je fonctionne donc beaucoup avec des assets pas trop cher ou que je possede déjà ainsi qu'avec les free contents d'Epic. Mais je n'ai pas le droits de les redistribuer.

##### Devlogs :

#### Développement du SDK
Cette phase est la "vrai" phase de développement d'OpenRE. Elle aboutira si tout se passe bien à une première version utilisable du SDK. A l'heure ou j'écris ces ligne, cette phase n'a pas encore commencé. Il est donc un peu tôt pour savoir ce que contiendra ce SDK mais il y aura certainement :
- un addon Blender
- un addon Godot
- quelques scripts & utilitaires

Pour mes projet Godot j'utilise habituellement C# comme langage de script. Mais par soucis de rendre accessible OpenRE au plus grand nombre, je m'efforcerai d'utiliser du GDScript. Ce sera l'occasion d'apprendre.

Contrairement au POC, le SDK sera bien entandu disponnible sur un repo git public et distribué sous une licence libre et open-source (qui reste à déterminer).

##### Devlogs :

#### Démo
Afin de montrer ce qu'OpenRE est capable de faire, je prévois de réaliser un petit jeu avec. Cela me permetra également d'éprouver un peu la techno sur un cas réèl et si nécessaire d'y apporter des ajustement pour la rendre plus fiable et plus ergonomique.

Je n'ai pas encore décidé en quoi consistera cette démo, mais elle reprendra certainement le gameplay des vieux Resident Evil. J'aimerai beaucoup qu'OpenRE soit utilisée un jour pour donner vie à autre chose que des survival horror old school. Comme vous le savez déjà si vous avez lu l'article en lien plus haut, je suis persuadé que la caméra fixe va bien au dela de ce genre specifique. Pourquoi ne pas faire autre chose dans ce cas ? Tout simplement parce que je ne suis pas Game Designer et que c'est plus facile pour moi me lancer dans un concepte bien défini et que je connais bien.

J'aimerai également pouvoir distribuer cette démo sous licence open-source. Cela permetrait de faire office de projet d'exemple illustrant comment utiliser OpenRE. Mais je risque de me retrouver face à la même problématique d'asset que pour le POC. J'essairai de voir ce que je peux faire, mais je ne peux rien promettre. En revanche, le jeu buildé sera disponnible gratuitement sur ma page [itch.io](https://jponzo.itch.io/)

##### Devlogs :