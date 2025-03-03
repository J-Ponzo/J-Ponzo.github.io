+++
author = 'Turbo Tartine'
date = '2025-02-21T12:51:02+01:00'
draft = true
title = 'OpenRE devlog 0 : <TODO find name>'
description = 'devlog 0 du projet OpenRE'
+++
## Introduction
Bienvenu dans ce tout premier devlog d'OpenRE : le develog Zéro ! Cette série a pour but de documenter la phase de POC (proof of concept) du projet. Le format sera assez simple. Tout au long du développement, je prendrai des notes dès que je tomberai sur un sujet intéressant. Chaque mois (si j’arrive à m’y tenir), je sélectionnerai les plus pertinents pour les présenter dans un nouveau numéro.

Étant donné qu’OpenRE est un projet personnel que je développe sur mon temps libre, le rythme de publication risque d’être irrégulier. Certains numéros seront plus légers que d’autres, mais ce n’est pas bien grave. Au contraire, ce sera intéressant de voir comment la cadence évolue au fil du projet.

Avant de démarer, je vous recommande de jeter un oeil à la [présentation générale du projet](/projects/open_re). J'y introduit notament quelques notions et un peu de terminologie. Il est préférable de l'avoir parcouru pour contextualiser un peu ce dont je parle dans les devlogs.

Sur ce, c'est parti !

## Shit happens
Petite particularité concernant les première articles de la série : il s'agira de "retro-devlogs". En effet j’ai commencé OpenRE il y a plusieurs mois, sans trop savoir où j’allais. Je n'étais pas sûr que mes expérimentations mèneraient quelque part et de toutes façons, l'idée même de tenir un blog ne mavais pas encore traversé l'esprit.

Durant cette période, il se trouve que le dépôt git a pris feu (suite à une sombre histoire fichiers blender beaucoup trop volumineux). Je sais qu'il existe des methodes douce pour régler ce genre de problème. Mais j'avoue que sur le moment je ne voyais pas trop l'intérais. J'ai donc bêtement supprimé le dépôt pour en recréer un avec ma copie locale (après avoir fait le nécessaire pour gérer un peu mieux mes scenes).

Résultat : j’ai perdu l’historique du projet. Je ne peux donc  plus réstaurer les premières versions pour analyser ce que j'avais fait. Réaliser des capture d'écran de mes résultats originaux est également impossible. Ces premiers numéros seront donc entièrement rédigés de mémoire, et les images qui y figurent seront des reconstitutions.

## Oracle Driven Development
Le premier vrai défi de ce POC est de s'assurer que Blender et Godot peuvent produire des données compatibles. En effet tous les logiciels graphiques ont leurs propres conventions. Sont (très) régulièrement concernés :
- Les unités de mesure
- Les espaces colorimétriques
- Le sens des matrices
- L'ordre des rotations
- Les axes du repère
- ...

Mais ca peut vraiment être tout et n'importe quoi. Chaque logiciel est caractérisé par une liste interminable de parti pris de ce genre dont la cohérence n'est garantie que tant on n'en sors pas. Et pour qu'OpenRE ai une chance de fonctionner, il va falloir faire en sorte que Blender et Godot parlent la même langue.

Pour cela, on va s'appuyer sur une technique que j'aime beaucoup et que j'appele le "Oracle Driven Developpment". C'est comme du "Test Driven Developpement", sauf qu'à la place d'un jeu de test automatisés bien propre et exhaustif, on va faire une grosse moulinette un peu dégeux qu'il faudra lançer à moitier à la main pour verifier qu'on est bon. A la manière d'un oracle, cette moulinette va formuler des profécies parfois un peu cryptiques, mais qui sauront nous guider dans notre périple si on parvient à les annalyser correctement.

## Anatomie de l'Oracle
Dans cette section je vais expliquer de quoi est fait notre Oracle. Si vous avez lu l'article référencé dans l'intro, vous savez qu'OpenRE compose les mondes déterministe et interactif en s'appuyant sur une représentation particulière de ces scenes qu'on appele des G-Buffers. Une façon de verifier que Blender et Godot sont bien sur la même longueure d'onde, c'est de verifier que si on leur donne les même données d'entrées (les scène), ils produisent les mêmes données de sortie (les G-Buffers).

J'ai donc commencé par créer dans Blender une petite scene de test composées de quelques primitives très simples et d'une caméra. Cette scène à ensuite été scrupuleusement reproduite dans Godot. L'opération est trivial étant donné que Godot prend en charge le format de scene de Blender. Je n'ai eu qu'à importer le .blend et à l'ajouter à une scene Godot vide. And voilà !

![Illustration représentant la SimpleScene dans Blender](images/simpleBlend.opti.webp)
![Illustration représentant la SimpleScene dans Godot](images/simpleGodot.opti.webp)

Les G-Buffers déterministes et interactifs devront à terme contenir les textures suivantes :
- Albedo
- Depth
- Normal
- ORM

Mais dans un premier temps nous allons nous focaliser sur l'Albedo (et vous allez voir, c'est bien suffisant pour aujourd'hui !). Nous traiterons le reste dans des develogs dédiés mais nous allons d'ors et déjà implémenter un oracle capable de mesurer le degré d'armonie entre toutes ces données. Il se materialisera en ce monde sous la forme du post-process ```oracle.gdshader``` et prendra en entrée chacune des textures des 2 G-Buffers ainsi qu'un entier ```data_type``` designant le type de texture que l'on veut comparer.

```glsl
shader_type spatial;
render_mode unshaded, fog_disabled;

// depth map du G-Buffer interactif (injecté par Godot grace au hint_depth_texture)
uniform sampler2D igbuffer_depth : hint_depth_texture, filter_nearest;
// albedo map du G-Buffer interactif (injecté par Godot grace au hint_screen_texture)
uniform sampler2D igbuffer_albedo : hint_screen_texture, filter_nearest;

// Type de data à visualiser
uniform int data_type = 0;
// depth map du G-Buffer deterministe
uniform sampler2D  dgbuffer_depth : filter_nearest;
// albedo map du G-Buffer deterministe
uniform sampler2D  dgbuffer_albedo : filter_nearest;

void vertex() {
	POSITION = vec4(VERTEX.xy, 1.0, 1.0);
}

void fragment() {
	vec3 dgbuffer_map_frag = vec3(1.0, 1.0, 1.0);
	vec3 igbuffer_map_frag = vec3(0.0, 0.0, 0.0);
	
	if (data_type == 0) {
		dgbuffer_map_frag = texture(dgbuffer_depth, SCREEN_UV).rgb;
		igbuffer_map_frag = texture(igbuffer_depth, SCREEN_UV).rgb;
	}
	else if (data_type == 1) {
		dgbuffer_map_frag = texture(dgbuffer_albedo, SCREEN_UV).rgb;
		igbuffer_map_frag = texture(igbuffer_albedo, SCREEN_UV).rgb;
	}
		
	
	ALBEDO = abs(dgbuffer_map_frag - igbuffer_map_frag);
}
```
*Code source du shader oracle.gdshader*

Le fonctionnement de ```oracle.gdshader``` est finalement assez simple. Il calcule la distance entre les couleurs de chaques pixels des textures dont le type correspond à ```data_type```. Si l'écran est noir quelque soit la valeur de ```data_type```, alors les G-Buffers sont equivalents. Sinon, cela s'ignifie que quelque chose est mal réglé. Et biensure, le jeu, c'est de trouver quoi en se basant sur l'image que l'Oracle nous montre.

![Image illustrant le protocol de validation](images/oracle_schema.opti.webp)

## Notre premier présage
La question qui nous interesse ici est : "est ce que les textures d'Abledo produites par Blender et Godot sont bien harmonisées". Pour poser cette question à notre oracle, il va falloir binder ces textures aux uniforms correspondants du post-process. Ensuite on s'assurera que le paramètre ```data_type``` est bien réglé sur 0 (qui correspond à l'Albedo). On sera alors prêt à découvrir notre presage en appuyant sur play. Mais un petit problème subsiste : comment on obtien ces textures d'albedo au juste ?

#### Albedo du G-Buffer déterministe :
Coté Blender on va activer la ```diffCol pass``` de Cycles (qui correspon à l'Albedo) puis on va effectuer un rendu. Grâce au compositor et au noeud ```File Output```, l'image correspondant à cette passe sera automatiquement exportée à l'emplacement spécifié à la fin du rendu. Il n'y aura plus qu'à importer cette image dans Godot et à la binder au ```uniform dgbuffer_albedo```

[Compo => image => import => bind]

#### Albedo du G-Buffer interactif :
Pour la version interactive c'est un peu plus complexe. Le shading language de Godot permet d'injecter cetraines textures dans un uniform que l'on peut ensuite utiliser à souhait dans notre shader. La syntaxe est la suivante :
``` glsl
uniform sampler2D texture : hint_<insert_texture_name>_texture;
```

La texture qui nous interesse ici est ```hint_screen_texture```. Mais malheureusement il ne s'agit pas directement de l'albedo. C'est un rendu classic depuis la caméra prenant en compte la lumière. On va donc tricher un peu en utilisant une render target (un ```SubViewport en terminologie Godot```) dont on va régler le parametre ```Debug Draw``` sur ```Unshaded```. Il suffit ensuite de binder cette render target au ```uniform igbuffer_albedo```

#### C'est maintenant ! C'est maintenant !
Nous avons correctement créé et bindé nos textures d'albedo. Ces données en été obtenues à partir de 2 scenes rigoureusement identiques puisqu'elles viennent du même fichier. Donc si l'importer de Godot est bien capable de traduire les données de Blender pour les conformer à ses propres conventions, nous devrions obtenir un présage positif (un écran noir). Qu'est-ce qui pourait mal se passer ?

[presage failed]

Oups...

## Décryptage de la professie