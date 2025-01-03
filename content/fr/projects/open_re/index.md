+++
author = 'Turbo Tartine'
date = '2024-11-18T06:28:42+01:00'
draft = true
title = 'OpenRE (Open Retro Engine)'
description = 'Page de presentation du projet OpenRE'
+++
## Introduction
Comme vous pouvez le constater en détail dans [cet article](/posts/i_love_fixed_cams), je suis un grand nostalgique de l'ère des caméra fixe et des contrôles tank. Si vous ne voyez pas à quoi je fais référence, je vous conseille d'y faire un tour. Les réponses aux questions que vous vous posez s'y trouvent certainement.

En cherchant à développer un jeu de ce type, je me suis vite rendu compte qu'il n'était pas facile de trouver des outils/resources traitant du sujet. Apparament les seules chose qui existent facilitent la manipulation des caméras mais je n'ai rien trouvé permetant de tirer partie de l'immobilité des points de vue en précalculant le rendu de la scene. Ce qui à mon sens est pourtant le principale interêt (et la principale difficulté) lié à cette technique. C'est donc assez naturellement que j'en suis venu à proposer ma propre solution.  

OpenRE est donc une technologie libre et open source qui permet de faciliter le développement de jeux en caméra fixe et arrière plan précalculée. Afin de rester fidèle à ces valeurs de liberté et d'indépendances technologique, elle est construite par dessus Blender (pour la génération des arrière plans) et Godot4 (pour le gameplay et la composition en temps réèl des arrière plans avec les entités interactives), qui sont eux même libres et open source.

Dans cette article, je présente le principe général sur lequel fonctionne OpenRE ainsi que les différentes phase de développement prévues. Vous pouvez également accéder aux devlog de chacune de ces phases depuis les sections correspondantes et ainsi suivre l'avancement du projet.

## Phases prévues

#### Proof of Concept (POC)
Dans cette phase je ne me focalise pas sur le design, la qualité du code, l'optimisation ou encore la praticité de la solution. J'explore simplement differents axes le plus rapidement possible pour essayer de déterminer ce qui va être faisable ou non et jusqu'où on pourra aller. Une règle que je m'impose est de ne pas faire de refactoring tant que j'arrive à avancer.

L'objectif ici est d'aller vite et de se faire un idée relativement précise de ce à quoi pourra ressembler une V1 d'OpenRE. Mais lorsque j'en aurais apris suffisament pour démarrer la phase suivante, la code base sera archivée et rien ne sera récupéré. Je repartirai de zéro et à ce moment là seulement, je m'efforcerai de consevoire une solution propre, robuste et efficace à la lumière de l'experience gagnée ici.

Le répo de ce POC ne sera malheureusement pas public. En effet j'ai besoin d'asset 3D pour mes scenes d'exemple <trouver un meilleur terme>. L'idée étant de se projeter dans les possibilités de la technologie, j'ai besoin que les rendus finaux de soitent un minimum crédible. Trouver des assets de qualité et cohérents avec le rendu recherché n'est pas quelque chose de simple. Se restrindre uniquement à des assets libres de droits n'est pas réaliste. D'autant plus qu'on cherche à aller vite. Je fonctionne donc beaucoup avec des assets pas trop cher ou que je possede déjà ainsi qu'avec les asset gratuits d'Epic que je n'ai pas plus le drois de redistribuer.

#### Développement du SDK
Cette phase est la "vrai" phase de développement d'OpenRE. 

#### Démo

## Principe général