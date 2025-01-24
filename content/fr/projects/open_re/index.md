+++
author = 'Turbo Tartine'
date = '2024-11-18T06:28:42+01:00'
draft = true
title = 'OpenRE (Open Retro Engine)'
description = 'Page de presentation du projet OpenRE'
+++
## Introduction
Si vous avez lu [cet article](/posts/i_love_fixed_cams), vous savez déjà que  j’ai un faible pour les jeux vidéos en caméras fixes. Ce genre, emblématique de la fin des années 90, m'a toujours fasciné. Si cela ne vous évoquent pas grand-chose, ou si vous êtes simplement curieux de découvrir ce qui les rend si uniques à mes yeux, je vous invite à y jeter un œil.

En tentant de développer mon propre jeu en caméra fixe, j’ai rapidement réalisé une chose : les outils et ressources disponnibles sur le sujet sont rares. Certes, on trouve quelques tutoriels pour gérer les caméras ou implémenter les déplacements du joueur. Mais je n'ai rien trouvé qui aide à relever le vrai défi de cette approche : *"Comment intégrer harmonieusement des éléments interactifs dans des décor précalculés ?"*

C’est ce constat qui m’a conduit à créer OpenRE, une technologie libre et open-source conçue pour simplifier le développement de jeux en caméra fixe avec des arrière-plans précalculés. Ce projet me sert également de laboratoire pour explorer le potentiel de cette technique sur du matériel moderne. Mon objectif est de réduire l’écart visuel entre précalculés et temps réèl. Ces dissonances graphiques sont effectivement un peu difficile à accepter pour nos standards actuels. Elle trahisse le subterfuge et sont pour moi le principal obstacle à l'immersion.

Dans cet article, je vais vous présenter les principes fondamentaux d’OpenRE ainsi que les étapes majeures de son développement. Vous y trouverez aussi des liens vers des devlogs où je partagerai régulièrement mes avancées, mes échecs (parce qu’il y en aura !), et mes réflexions. Si vous aimez suivre les projets en coulisses, j’espère que cette aventure vous passionnera autant que moi !

## Part I : Environnement technique :
OpenRE repose sur deux outils que vous connaissez sûrement :
- Blender : pour créer les arrière-plans précalculés.
- Godot : pour gérer les éléments interactifs et assembler le tout.

La maturité et la popularité de ces deux logiciels en font des choix solides. Ils sont aussi open-source, ce qui s'aligne parfaitement avec la philosophie d'OpenRE : promouvoir une technologie accessible et ouverte à tous. L’open-source offre également une certaine sécurité qu'il est impossible d'avoir avec des solutions propriétaires. En effet, comme le rappellent certains evenements récents, placer son capital technologique entre les mains d'une entreprise à but lucratif n'est pas sans risques.

Sur le plan pratique, Blender et Godot se complètent très bien. Godot prend en charge nativement les scènes créées dans Blender, ce qui simplifie la synchronisation entre les deux environnements. Cette compatibilité nous évitera des manipulations fastidieuses et sources d'erreur.

Côté scripting, j’ai choisi de bousculer mes habitudes en optant pour GDScript plutôt que C#. Pourquoi ce choix ? Tout simplement parce que GDScript est supporté par toutes les versions de Godot, contrairement à C#, qui nécessite la version .NET. Cette flexibilité permettra à OpenRE de rester accessible au plus grand nombre. Et ce sera l’occasion pour moi d'apprendre un nouveau langage.

Si comme moi vous préférez le C#, soyer rassurés ! Vous n'aurez besoin de GDScript que si vous souhaitez modifier le plugin OpenRE lui même. Pour développer votre jeu, vous pourrez utiliser le langage de votre choix.

## Part II : Principe général
OpenRE repose sur une séparation du monde en deux parties bien distinctes. Et par "bien distinctes", j’entends que chacune d'elles nécessitera un logiciel dédié.

#### Le monde déterministe (Blender) :
Le monde *déterministe* est créé dans Blender. C'est de lui que seront tirés les arrière plans précalculés. On pourrait, de manière un peu reductrice, dire qu’il représente la partie *statique* de la scène. Je préfère éviter ce terme car il est déjà utilisé par les moteurs de jeu ce qui prète à confusion. De plus il n'est pas tout a fait exacte en l'occurence.

En effet, ce n'est pas encore d'actualité, mais à l'avenir, OpenRE pourrait supporter des arrière plans animés. On pourrait alors imaginer des boucle dans lesquelles de la végétation ou des rideaux seraient agités par le vent. Ou encore des voitures qui circulent dans les rues la nuit illuminant les allentours à chaque passage. Parler d'éléments "statiques" dans ce context serait tout simplement incorrect.

Pour l'heure, le terme *déterministe* désignera effectivement ce que l'on qualifie de "statique" dans un moteur de jeu (architectures, meubles, objets inanimés, etc.). Mais cela pourrait englober bien plus dans le futur. La seule limite réèlement infranchissable, c'est que ce monde ne pourra jamais dépendre des actions du joueur ou d'éléments de gameplay aléatoirs. Car bien entandu, au moment de génèrer les arrière plans, ces évenements ne peuvent pas être connus.

#### Le monde intéractif (Godot) :
De son côté, le monde interactif est implémenté dans Godot. Il comprend tout ce qui relève du gameplay : personnages, véhicules contrôlables, objets manipulables, etc. Là encore, j’évite de le qualifier de *dynamique* pour éviter la confusion avec la terminologie des moteurs de jeu.

En pratique, ce monde sera relativement vide comparé au monde déterministe. En effet, dans la plupart des jeux, les éléments interactifs représentent une quantité de géométrie beaucoup moins importante que les environnements. Cela signifie que dans le cas général, les ressources graphiques sont majoritairement consommées par le monde déterministe. 

OpenRE s'abstrait en grande partie de cette charge de calcul en déléguant rendu de la partie déterministe à Blender. Ce qui libère d'autant plus de budget pour la partie interactive. On pourra donc se permettre une plus grande générosité sur les détails.

#### La fusion des mondes :
Nous avont donc un monde déterministe et un monde intéractif qui vivent dans leur environnement respectif. Il est temps de les faire cohabiter. Pour cela, chaque point de vue du jeu est materialisé par un duo de caméras :
- une caméra déterministe, dans Blender
- une caméra intéractive dans Godot 

Ces deux caméras doivent evidement être parfaitement alignées pour que l'illusion fonctionne. On prendra donc soin de synchroniser leurs position, orientation, FOV, résolution etc.

Pour chacun de ces couples, il faudra ensuite :
- 1. Effectuer un rendu depuis la caméra déterministe pour produire l'arrière plan dans Blender
- 2. Exporter l'arrière plan sous forme d'images
- 3. Importer l'arrière plan dans Godot et l'associer à la caméra interactive correspondante.

Notez que le 's' à "images" n'est pas une faute de frappe. L'arrière plan exporté ne sera pas l'image final. Le rendu sera décomposé en une serie d'images représentant chacune des données spécifiques : profondeur, normales, couleur etc.

Ainsi lors de l'exectution, les caméra interactives seront en mesure de composer ce qu'elles capturent avec l'arrière plan associé. Sans intervention supplémentaire de la part de l'utilisateur, les deux monde seront fusionnés de manière quasi-indicernable : ils s'occluderont l'un l'autre naturellement et leur éclairage sera uniforme et cohérent.

Evidement toutes ces étapes ne pourront pas être effectuées manuellement. Ce sera le rôle d'OpenRE d'automatiser tout cela.

#### Limitations :
Malgré ses avantages, cette approche pourrait entraîner des incompatibilités avec certaines fonctionnalités graphiques natives de Godot. Le cas echéant, OpenRE proposera des solutions alternatives à travers son plugin. Vous pourrez notamment compter sur :
- les types de lumières courrants (point, spot, directional)
- un shader PBR opaque
- la compatibilité avec le système d'UI de Godot
- la compatibilité partielle avec le système de particules de Godot
- des ombres dynamiques
- un support partiel de la transparence

## Part III : Détails Techniques :
Maintenant nous allons mettre les mains dans le cambouis ! Si vous aimez les détails techniques, cette partie est faite pour vous. Mais sachez qu'elle est optionnelle. Elle s'adresse à ceux qui souhaite comprendre un peu mieux ce qui se passe sous le capot. Si vous aborder OpenRE d'un point de vu utilisateur ce n'est peut-être pas votre cas. J'ai essayé de la rendre le plus abordable possible, mais n'hésitez pas à passer directement à la partie IV si vous ne trouvez pas ça interessant.

#### Un Deferred (presque) comme les autres
Pour fusionner les mondes, OpenRE reprend le principe du deffered rendering. Cette technique consiste à séparer le rendu en deux passes :
- **1. geometry pass :** cette première étape vise à produire une collection de textures qu'on appel le G-Buffer (Geometry Buffer). Ces textures encodent dans leur chanels RGB des donnée décrivant les propriétés géométriques de la scène en *screen space* (position, normal, albedo etc...).
- **2. deffered shading pass :** pour obtenir l'image final, il suffit alors d'accumuler les contributions lumineuse de la scène sur chaque pixel. Ce qui n'est pas très compliqué étant donné que le G-Buffer nous fourni toutes les données nécessaires en chaque point de l'écran.

Comme évoqué dans la partie précendente, OpenRE sépare la scène en deux parties distinctes. Pour rendre une frame, OpenRE aura besoin d'un G-Buffer pour chacune de ces parties. On aura donc :
- le G-Buffer intéractif qui sera construit à la volée dans Godot 
- le G-Buffer déterministe qui aura été précalculé par Blender (la série d'images exportées vous vous rappellez ?). 

Les deux seront ensuite combinés et une passe de *deffered shading* classique (ou presque...) sera effectuée pour rendre les lumières.

#### DG-Buffer : le G-Buffer du monde déterministe
Blender dispose de deux moteurs de rendu :
- **Eevee** : Basé sur la *rasterization*. Permet un rendu quasi-temps réèl mais moins réaliste.
- **Cycles** : Basé sur du *path-tracing*. Il produit des images photoréaliste mais le rendu prend un certain temps.

Pour OpenRE, nous utiliserons bien sûr Cycles, afin de garantir une qualité visuelle maximale. Grâce au compositeur de Blender, le rendu pourra être décomposé en plusieurs textures qui constituront notre DG-Buffer :
- **Depth Map :** Encode la profondeur de chaque pixel. Permetra aux mondes de s'occluder correctement. La position du pixel sera également déduite de cette donnée.
- **Normal Map :** Décrit l'orientation des surfaces. Cela interviendra dans la calcul de l'éclairage
- **ORM Map :** Regroupe des données additionnelles nécessaire au rendu PBR (Ambiant Occlusion, Roughtness, Metalness)
- ***diverses maps d'illumination***

Si vous savez ce que contient habituellement un G-Buffer, vous vous demandez peut être où est passée la map d'albedo ? Et que peuvent bien être ces fameuses *diverses maps d'illumination* ?
- 1. Le modèle d’illumination de Cycles est assez complexe. En sortie, on obtient neuf maps d'illumination différentes. En réalité, l’une de ces map correspond à l’albedo. Mais pour recomposer l’image finale, nous auront besoin des neuf.
- 2. On pourrait se contanter d'intégrer l'albedo mais il faudrait alors recalculer l'éclairage côté Godot. On perdrait à la fois la qualité visuelle de Cycles et énormement de temps de calcul. Les neuf maps sont donc intégrées au DG-Buffer pour permetre une recomposition directe lorsque c'est approprié (voire plus loin).

#### IG-Buffer : le G-Buffer du monde interactif
Si Godot implémentait un deferred renderer, on pourrait piocher les maps qui nous intéressent directement dans son G-Buffer. Mais malheureusement pour nous, le renderer officiel de Godot est un forward. Il n'y a donc pas de G-Buffer. 

Il va falloir bricoler le nôtre, ce qui nécessitera peut-être de contourner une partie du système de rendu de Godot. Cette opération laissera probablement des sequelles. On pourrait notament casser la compatibilité avec certaines fonctionnalités graphiques natives. Difficile à ce stade de prévoire ce qui restera disponnible ou non. Cela dépendra de la solution que j'arriverai à mettre place pour construire le G-Buffer. Mais comme évoqué dans la partie II, des substitus seront implémentés dans OpenRE si des fonctionnalité importantes sont touchées.
 
#### Calcul de l'éclairage
Maintenant que nous disposons de nos G-Buffer, il n'y a plus qu'a calculer la lumière grâce à une passe de deferred shading. Mais la dualité du monde introduit quelques complications.

##### 1. Choix du G-Buffer :
Une première question évidente se pose : "dans quel G-Buffer récupérer les données ?" C'est en réalité assez simple. La comparaison des Depth Maps nous permet de savoir quel monde occlude l'autre pour chaque pixel de l'écran. Il suffit donc de choisir le G-Buffer du monde qui est visible à la coordonnée du pixel considéré.

##### 2. Différents modes de calcul de la lumière :
Le second point est un peu plus subtile. Je ne l'ai pas précisé jusqu'ici, mais les sources de lumière aussi peuvent être déterministes (lampadaires, feux de cheminée, soleil...) ou interactives (lampe torche, flash d'un tir, phares de voiture). Cela a deux conséquences :
- 1. Comme les caméra, les lumières déterministes présentes dans Blender devront être répliquées dans Godot. Sans cela, elle ne pourront pas éclairer les éléments interactifs. Les lumières intéractives, elles, n'existeront que dans Godot.
- 2. Le calcul de la contribution d'une lumière données sur un pixel donné varie selon le monde auquel l'un et l'autre appartiennent. Voici un tableau récapitulatif des différentes combinaisons :

| 			 				| Pixel Déterministe          									| Pixel Interactif     |
| :------------------------ |:-------------------------------------------------------------:| :-------------------:|
| **Lumière Déterministe** 	| Recomposition des maps de Cycles  							|  Deferred Shading |
| **Lumière Interactive** 	| Recomposition des maps de Cycles <br> + Deferred Shading	|  Deferred Shading |

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

Contrairement au POC, le SDK sera open-source et disponible sur un dépôt public. Rien ne me ferait plus plaisir que de savoir qu’OpenRE est utilisé dans vos créations. Si vous décidez de l’adopter, n'hésitez pas à me faire savoir sur quoi vous travaillez. Cela m'interesse au plus haut point ! 

Dans un premier temps, je n'accepterai probablement pas de contributions spontanées, mais vos retours, suggestions et rapports de bugs seront toujours les bienvenus. N'hésitez pas à les partager sur le [GitHub du projet](). 

##### Devlogs :
*Cette phase n'a pas encore commencé*

#### Une Démo Jouable
Pour montrer ce qu’OpenRE permet de réaliser, je compte créer une petite démo jouable. Ce projet servira de cas pratique pour éprouver l'ergonomie et la fiabilité du SDK, tout en illustrant ses capacités en situation réelle.

Si vous avez lu l'article mentionné dans l’introduction, vous savez que pour moi la caméra fixe dépasse largement le cadre du survival-horror. J’aimerais beaucoup qu’OpenRE soit utilisé dans d’autres types de jeux, voir même dans des propositions vidéoludiques nouvelles. Mais je ne suis pas game designer, il est donc plus raisonnable pour moi de m’appuyer sur des codes bien établis. Je vais donc jouer la sécurité et rester sur un survival-horror classic.

Idéalement, cette démo sera elle aussi open-source et fera office de projet d’exemple. Mais là encore, des contraintes liées aux droits d’utilisation des assets pourraient compliquer les choses. Je ne peux donc rien promettre mais quoi qu’il arrive, une version sera mise à disposition gratuitement sur [ma page itch.io](https://jponzo.itch.io/)

##### Devlogs :
*Cette phase n'a pas encore commencé*

## Conclusion :
Je suis conscient que, tel que je le présente ici, OpenRE n’apparaît pas comme une solution universelle qui conviendra à tout les projets. Le workflow reposant sur deux logiciels distincts est atypique, et la perte de compatibilité avec certaines fonctionnalités graphiques natives de Godot pourrait en effrayer plus d'un. Mais il faut bien commencer quelque part et pour maximiser mes chances d'aller au bout de l'aventure, je choisi d’avancer progressivement et de manière pragmatique, étape par étape.

Pour l’instant, cette technologie répond avant tout à mes propres besoins et ambitions créatives. Cela dit, j’espère sincèrement qu'OpenRE – et peut-être les jeux que je créerai avec – pourra inspirer d’autres créateurs. J'aimerais montrer que cette technique souvent délaissée, peut encore aujourd’hui produire des expériences mémorables et mérite d’être explorée, voire réinventée.

Si le projet suscite de l’intérêt et rassemble une communauté, je serais ravi de l'enrichir, de l’adapter à d’autres usages, et à d'autre façons de travailler plus conventionnelles. Mais pour avancer dans cette direction, vos retours sont indispensables. Qu’est-ce qui vous attire dans OpenRE ? Quelles limitations pourraient freiner votre envie de l’utiliser ? Y a-t-il des fonctionnalités spécifiques qui vous manquent ? Ou, au contraire, peut être pensez vous déjà pouvoir en faire quelque chose ? N’hésitez pas à partager vos impressions dans les commentaires.

En conclusion, je dirais que ce projet est pour moi une façon de rendre hommage à un genre vidéoludique qui m’a profondément marqué en tant que joueur et qui me manque beaucoup aujourd'hui. Si OpenRE ne trouve qu’une petite audience ou même si je reste son unique utilisateur, je serai tout de même fier d’avoir contribué, à ma façon, à faire vivre cet art sous-estimé qu’est la caméra fixe. Et si ce que je partage sur ce blog ou ailleurs peut encourager d’autres personnes à explorer cette voie, cette aventure sera pour moi un succès.