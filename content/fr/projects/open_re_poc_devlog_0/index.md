+++
author = 'Turbo Tartine'
date = '2025-02-21T12:51:02+01:00'
draft = true
title = 'OpenRE devlog 0 : <TODO find name>'
description = 'devlog 0 du projet OpenRE'
+++
## Introduction
Bienvenu dans le tout premier devlog d'OpenRE : le develog Zéro ! Cette série a pour but de documenter la phase de POC (proof of concept) du projet. Le format sera assez simple. Tout au long du développement, je prendrai des notes dès que je tomberai sur un sujet intéressant. Chaque mois (si j’arrive à m’y tenir), je sélectionnerai les plus pertinents pour les présenter dans un nouveau numéro.

Étant donné qu’OpenRE est un projet personnel que je développe sur mon temps libre, le rythme de publication risque d’être irrégulier. Certains numéros seront plus légers que d’autres, mais ce n’est pas bien grave. Au contraire, ce sera intéressant de voir comment la cadence évolue au fil du projet.

Avant de démarer, je vous recommande de jeter un oeil à la [présentation générale du projet](/projects/open_re). J'y introduit quelques notions et un peu de terminologie. Il est préférable de l'avoir parcouru pour contextualiser un peu ce dont je parle dans les devlogs.

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
Dans cette section je vais expliquer de quoi est fait notre Oracle, et décrire le rituel permettant de soliciter sa professie. Si vous avez lu l'article référencé dans l'intro, vous savez qu'OpenRE compose les mondes déterministe et interactif en s'appuyant sur une représentation particulière de ces scenes qu'on appele des G-Buffers. Une façon de verifier que Blender et Godot sont bien sur la même longueure d'onde, c'est de verifier que si on leur donne les même données d'entrées (les scène), ils produisent les mêmes données de sortie (les G-Buffers).

J'ai donc commencé par créer dans Blender une petite scene de test composées de quelques primitives très simples et d'une caméra. Cette scène à ensuite été scrupuleusement reproduite dans Godot. L'opération est trivial étant donné que Godot prend en charge le format de scene de Blender. Je n'ai eu qu'à importer le .blend et à l'ajouter à une scene Godot vide. And voilà !

![Illustration représentant la SimpleScene dans Blender](images/simpleBlend.opti.webp)
![Illustration représentant la SimpleScene dans Godot](images/simpleGodot.opti.webp)

Les G-Buffers déterministes et interactifs devront à terme contenir les textures suivantes :
- Albedo
- Depth
- Normal
- ORM

Dans une premier temps nous allons nous focaliser sur l'Albedo (et vous allez voir, c'est bien suffisant pour aujourd'hui !). Nous traiterons le reste dans des develogs dédiés mais nous allons d'ors et déjà implémenter un oracle capable de mesurer le degré d'armonie entre toutes ces données. Il se materialisera en ce monde sous la forme du post-process ```oracle.gdshader``` et prendra en entrée chacune des textures des 2 G-Buffers ainsi qu'un entier ```data_type``` designant le type de texture que l'on veut comparer.

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

Le fonctionnement de ```oracle.gdshader``` est finalement assez simple. Il calcule la distance entre les couleurs de chaques pixels des textures dont le type correspond à ```data_type```. Si l'écran est noir quelque soit la valeur de ```data_type```, alors les G-Buffers sont equivalents. Sinon, cela s'ignifie que quelque chose est mal réglé. Et biensure, le jeu, c'est de trouver quoi en se basant l'image que l'Oracle nous montre.

![Image illustrant le protocol de validation](images/oracle_schema.opti.webp)

Interessons nous maintenant à la création des textures d'albedo. Pour la version deterministe, il suffit d'exporter la ```diffCol pass``` de Cycles et d'importer l'image produite dans Godot pour en faire une texture. De là il n'y a plus qu'à binder cette texture au ```uniform dgbuffer_albedo``` du ```oracle.gdshader``` et le tour est joué.

[img compositor => fichier => import => bind]

Pour la version interactive c'est un peu plus complexe. On va utiliser ...

Sur le papier, les 2 scenes sont identiques puisqu'elles viennent du même fichier. L'importeur de Godot prends soin de traduire toutes les données du .blend selon se propres conventions. On devrait donc passer le test du premier coup. Qu'est-ce qui pourait mal se passer ?

## Décryptage de la professie