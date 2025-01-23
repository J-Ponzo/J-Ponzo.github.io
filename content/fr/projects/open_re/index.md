+++
author = 'Turbo Tartine'
date = '2024-11-18T06:28:42+01:00'
draft = true
title = 'OpenRE (Open Retro Engine)'
description = 'Page de presentation du projet OpenRE'
+++
## Introduction
Si vous avez lu [cet article](/posts/i_love_fixed_cams), vous savez déjà que  j’ai un faible pour les jeux vidéos en caméras fixes. Ce genre, emblématique de la fin des années 90, m'a toujours fasciné. Si cela ne vous évoquent pas grand-chose, ou si vous êtes simplement curieux découvrir ce qui les rend si uniques à mes yeux, je vous invite à aller y jeter un œil.

En tentant de développer mon propre jeu en caméra fixe, j’ai rapidement réalisé une chose : les outils et ressources disponnibles sur le sujet sont rares. Certes, on trouve quelques tutoriels pour gérer les caméras ou implémenter les déplacements du joueur. Mais je n'ai rien trouvé qui aide à relever le vrai défi de cette approche : *"Comment intégrer harmonieusement des éléments interactifs dans des décor précalculés ?"*

C’est ce constat qui m’a conduit à créer OpenRE, une technologie libre et open-source conçue pour simplifier le développement de jeux en caméra fixe avec des arrière-plans précalculés. Ce projet me sert également de laboratoire pour explorer le potentiel de cette technique sur du matériel moderne. Mon objectif est de réduire l’écart visuel entre précalculés et temps réèl. Ces dissonances graphiques sont effectivement un peu difficile à accepter pour nos standards actuels. Elle trahisse le subterfuge et sont pour moi le principal obstacle à l'immersion.

Dans cet article, je vais vous présenter les principes fondamentaux d’OpenRE ainsi que les étapes majeures de son développement. Vous y trouverez aussi des liens vers des devlogs où je partagerai régulièrement mes avancées, mes échecs (parce qu’il y en aura !), et mes réflexions. Si vous aimez suivre les projets en coulisses, j’espère que cette aventure vous passionnera autant que moi !

## Part I : Environnement technique :
OpenRE repose sur deux outils que vous connaissez sûrement :
- Blender : pour créer les arrière-plans précalculés.
- Godot : pour gérer les éléments interactifs et assembler le tout.

La maturité et la popularité de ces deux logiciels en font des choix solides. Ils sont également open-source, ce qui s'aligne parfaitement avec la philosophie d'OpenRE : promouvoir une technologie accessible et ouverte à tous. L’open-source offre aussi une certaine sécurité qu'il est impossible d'avoir avec des solutions propriétaires. En effet, comme le rappellent certains evenements récents, placer son capital technologique entre les mains d'une entreprise à but lucratif n'est pas sans risques.

Sur le plan pratique, Blender et Godot se complètent très bien. Godot prend en charge nativement les scènes créées dans Blender, ce qui simplifie la synchronisation entre les deux environnements. Cette compatibilité nous évitera des manipulations fastidieuses et sources d'erreur.

Côté scripting, j’ai choisi de bousculer mes habitudes en optant pour GDScript plutôt que C#. Pourquoi ce choix ? Tout simplement parce que GDScript est supporté par toutes les versions de Godot, contrairement à C#, qui nécessite la version .NET. Cette flexibilité permettra à OpenRE de rester accessible au plus grand nombre. Et ce sera l’occasion pour moi d'apprendre un nouveau langage.

Si comme moi vous préférez le C#, soyer rassurés ! Vous n'aurez besoin de GDScript que si vous souhaitez modifier le plugin OpenRE lui même. Pour développer votre jeu, vous pourrez utiliser le langage de votre choix.

## Part II : Principe général
OpenRE repose sur une séparation du monde en deux parties bien distinctes. Et par "bien distinctes", j’entends que chaque monde devra être édité dans un logiciel dédié.

#### Le monde déterministe (Blender) :
Le monde déterministe est celui qui donnera les arrière plans précalculés. Il est édité dans Blender. De manière un peu reductrice, on pourrait dire qu'il représente la partie *statique* de la scène. Mais je n'aime pas employer cette terminologie. D'abord elle entre en conflict avec la notion d'*entité statiques ou dynamiques* utilisée dans tous les moteurs de jeux. Cela intègre une confusion malvenue, mais surtout : c'est faux !

Certes, ce n'est pas du tout prévu à l'heure actuelle. Mais on pourrait imaginer que dans une version ulterieur d'OpenRE les arrière plans ne soient plus des images fixes, mais des sequences animées qui bouclent. Le terme statique n'aurait alors plus aucun sens. C'est pourquoi on utilisera plutôt le mot *déterministe*. Pour l'instant cela designe effectivement ce qui est static (architecture, mobilier, props...). Mais cela pourrait s'étandre à d'autre choses (des voitures qui circulent, de la végétation ou des rideau agités par le vent...)

#### Le monde intéractif (Godot) :
Le monde intéractif vit dans Godot. Il comprends tous les éléments liés au gameplay : personnages, véhicules controllables, objets manipulables etc...  Là encore j'évite d'utiliser le mot *dynamique* pour ne pas créer de confusions avec la terminologie des moteurs de jeu. Mais dans les premières versions d'OpenRE (au moins), les deux voudront dire la même chose.

En pratique, ce monde est plutôt vide. En effet, la plupart du temps, un jeu comprends beaucoup plus d'éléments déterministes que d'éléments interactifs. Cela veut dire que dans le cas général, les ressource graphiques sont acaparées par le monde déterministe. Grâce à OpenRE et à la magie du précalculé, on va pouvoir s'abstraire en grande partie de cette charge. Ce qui nous en laissera suffisement sous le pied pour être beaucoup plus généreux sur les détails qu'un jeu classique.

#### La fusion des mondes :
Nous avont donc un monde déterministe et un monde intéractif qui vivent dans des environnements différents. Pour chaque point de vu du jeu, on aura une caméra déterministe et une caméra intéractive, vivant dans leur environnement respectif, et dont les paramètres (position, orientation, fov, resolution etc...) devront être synchronisés.

Pour chacun de ces points de vue, un rendu sera effectué par Blender depuis la caméra déterministe. Ce rendu sera ensuite exporté puis importé dans Godot pour enfin être associé à la caméra intéractive correspondante. Lors de l'execution du jeu, quand une caméra sera active, elle fusionnera ce qu'elle filme avec ce rendu (qui est l'arrière plan). 

Dans les faits, l'arrière plan généré par Blender n'est pas l'image finale. Le rendu est en réalité décomposée en une collection d'images représentant chacunes diverses données (depth, normals, couleur, etc.). On ne rentrera pas dans les détails pour l'instant, mais retenez que cette structure composite permettra une fusion quasi-indicernable des deux mondes. Sans plus d'effort de l'utilisateur, ils s'occluderont naturellement l'un l'autre et l'éclairage sera parfaitement unifié. 

#### Limitations :
Là encore je ne rentrerai pas dans les détails pour l'instant, mais il se pourrait que certaines fonctionnalité graphiques de Godot ne soient pas compatibles avec ce fonctionnement. Sachez cependant que des solutions alternatives seront implémentées dans le plugin OpenRE si les fonctionnalités concernées s'avérait essentielles. Vous pourrez notament compter sur :
- les types de lumières usuelles (point, spot, directional)
- un shader PBR opaque
- la compatibilité avec le système d'UI natif de Godot
- la compatibilité avec le système de particules natif de Godot (au moins partielle)
- des ombres dynamiques
- un support de la transparence (au moins partiel) 

## Part III : Détails Techniques :
Maintenant nous allons mettre un peu les mains dans le camboubi. Si vous aimez les détails techniques, cette partie est faite pour vous. Mais sachez qu'elle n'est pas essentielle. Elle s'adresse à ceux qui souhaite comprendre un peu mieux ce qui se passe sous le capot. Si ce n'est pas votre cas, vous pouvez passer directement à la partie IV.

#### Un Deferred (presque) comme les autres
Pour fusionner les mondes, OpenRE reprend le principe du deffered rendering. Cette technique consiste à séparer le rendu en deux passes :
- **1. geometry pass :** cette première étape vise à produire une collection de textures qu'on appel le G-Buffer. Ces textures encodent dans leur chanels RGB des donnée décrivant les propriétés géométriques de la scène en *screen space* (position, normal, albedo etc...).
- **2. deffered shading pass :** pour obtenir l'image final, il suffit alors d'accumuler les contributions lumineuse de la scène sur chaque pixel. Ce qui n'est pas très compliqué étant donné que le G-Buffer nous fourni toutes les données nécessaires en chaque point de l'écran.

Comme évoqué dans la patie précendente, OpenRE sépare la scène en deux parties distinctes. Pour rendre une frame, OpenRE a donc besoin d'un G-Buffer pour chacun des deux mondes. Le G-Buffer intéractif sera construit à la volée dans Godot tandis que le déterministe aura été précalculé par Blender. Les deux seront ensuite combiné dans Godot et une passe de *deffered shading* classique (ou presque...) sera effectuée pour rendre les lumières.

#### DG-Buffer : le G-Buffer du monde déterministe
Blender dispose de deux moteurs de rendu :
- **Eevee** : Basé sur la *rasterization* qui est la technique utilisée dans le jeu vidéo. Ce moteur permet un rendu quasi-temps réèl mais n'est pas photoréaliste.
- **Cycles** : Basé sur du *path-tracing* pour un rendu photoréaliste. Ce moteur est concu pour le cinéma et n'est pas temps réèl du tout (rendre une image prend plusieurs minutes).

On utilisera bien sûre Cycles pour une qualité maximal et le compositeur de Blender nous permettra de décomposer le rendu pour obtenir les maps de notre DG-Buffer :
- Depth (profondeur dont on peut déduire la position)
- Normal (orientation des surfaces)
- ORM (donnée additionnelles nécessaires au rendu PBR)
- *diverses maps d'illumination*

Vous remarquerez peut-être l’absence de la map d’albedo (couleur) au profit de *diverses maps d'illumination*. Pourquoi ?
- 1. Le modèle d’illumination de Cycles est assez complexe. En sortie, on obtient neuf maps d'illumination différentes. En réalité, l’une de ces map correspond à l’albedo. Mais pour recomposer l’image finale, nous auront besoin des neuf.
- 2. On pourrait se contanter d'intégrer l'albedo mais il faudrait alors recalculer l'éclairage côté Godot. On perdrait à la fois la qualité produite par Cycles et énormement de temps de calcul. Les neuf maps sont donc intégrées au DG-Buffer pour permetre une recomposition directe lorsque c'est approprié (voire plus loin).

#### IG-Buffer : le G-Buffer du monde interactif
Si Godot implémentait un deferred renderer, on pourrait piocher les maps qui nous intéressent directement dans son G-Buffer. Mais malheureusement pour nous, le renderer officiel de Godot est un forward. Il n'y a donc pas de G-Buffer. 

Il va falloir bricoler le nôtre, ce qui nécessitera peut-être de contourner une partie du système de rendu de Godot. Cette opération laissera probablement des sequelles. On pourrait notament casser la compatibilité avec certaines fonctionnalités graphiques natives. Difficile à ce stade de prévoire ce qui restera disponnible ou non nativement. Mais comme évoqué dans la partie II, des substitus seront implémentés dans OpenRE si des fonctionnalité importantes sont touchées.
 
#### Calcul de l'éclairage
Maintenant que nous disposons de nos G-Buffer, il n'y a plus qu'a calculer la lumière selon une passe de deferred shading classique. Cela dit la dualité du monde implique quelques complications.

Une première question évidente se pose : "dans quel G-Buffer récupérer les données ?" C'est en réalité assez simple. Les textures de profondeur nous permettent de savoir quel monde occlude l'autre pour chaque pixel de l'écran. Il suffit donc de choisir le G-Buffer du monde qui est visible à la coordonnée du pixel considéré.

Le second point est un peu plus subtile. Je ne l'ai pas précisé jusqu'ici, mais les sources de lumière aussi peuvent être déterministes (lampadaires, feux de cheminée, soleil...) ou interactives (lampe torche, flash d'un tir, phares de voiture). Cela a deux conséquences :
- 1. Comme les caméra, les lumières déterministes (de Blender) doivent être répliquées dans Godot pour pouvoir éclairer les éléments interactifs. Le lumières intéractives, elles, n'existeront que dans Godot.
- 2. Le calcul de la contribution d'une lumière sur un pixel diffère selon les mondes auquels chacun d'eux appartien. Voici un tableau récapitulatif des différentes combinaisons :

| 			 				| Pixel Déterministe          									| Pixel Interactif     |
| :------------------------ |:-------------------------------------------------------------:| :-------------------:|
| **Lumière Déterministe** 	| Recomposition des maps de Cycles  							|  Deferred Light Pass |
| **Lumière Interactive** 	| Recomposition des maps de Cycles <br> + Deferred Light Pass	|  Deferred Light Pass |

## Part IV : Phases de développement

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
Je suis conscient que, tel que je le présente ici, OpenRE n’apparaît pas comme une solution universelle adaptable à tout type de projet. Le workflow reposant sur deux logiciels distincts (Blender et Godot) est atypique, et la perte de compatibilité avec certaines fonctionnalités graphiques natives de Godot peut être rédibitoire pour certains. Mais il faut bien commencer quelque part, et pour maximiser mes chances d’aller au bout de cette aventure, je préfère avancer étape par étape.

Pour l’instant, cette technologie répond avant tout à mes propres besoins et ambitions créatives. Cela dit, j’espère sincèrement qu'OpenRE (et peut être les jeux que je réaliserai avec) sauront inspirer d’autres créateurs. J'aimerais montrer que cette technique souvent délaissée, permet encore aujourd'hui de faire de belles choses et mérite d’être explorée et réinventée.

Si le projet suscite de l’intérêt et rassemble une communauté, je serais ravi d’enrichir OpenRE, de l’adapter à d’autres usages, et à d'autre façons de travailler plus conventionnelles. Mais pour avancer dans cette direction, vos retours sont essentiels. Qu’est-ce qui vous attire dans OpenRE ? Qu’est-ce qui pourrait freiner votre envie de l’utiliser ? Y a-t-il des fonctionnalités qui vous manquent ? Ou peut être pensez vous déjà pouvoir en tirer quelque chose ? N’hésitez pas à partager vos impressions dans les commentaires.

En conclusion, je dirais que ce projet est pour moi une façon de rendre hommage à un genre vidéoludique qui m’a profondément marqué en tant que joueur et qui me manque beaucoup aujourd'hui. Même si OpenRE ne trouve qu’une petite audience ou même si je reste son unique utilisateur, je me plais à penser que ce que je partages sur ce blog ou ailleurs pourra insiter d’autres personnes à explorer cet art sous-estimé qu’est la caméra fixe, et à lui redonner la place qu’il mérite.