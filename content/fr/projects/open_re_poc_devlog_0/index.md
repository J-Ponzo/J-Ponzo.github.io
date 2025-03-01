+++
author = 'Turbo Tartine'
date = '2025-02-21T12:51:02+01:00'
draft = true
title = 'OpenRE devlog 0 : <TODO find name>'
description = 'devlog 0 du projet OpenRE'
+++
## Introduction
Ce develog est le premier de la série qui documente le POC du projet OpenRE. C'est l'occation de dire quelque mots sur le mode opératoir que j'enviseage. Au cours du dévelopement, je prendrai des notes chaque fois que je rencontrerai un sujet potentiel. Tous les mois (si j'arrive à m'y tenir), je selectionnerai les plus pertinants pour les présenter dans un nouveau develog. 

Etant donné que je développe OpenRE sur mon temps libre, il est probable que le rythme soit irréguliers. Certains numéros seront plus léger que d'autres mais ce n'est pas bien grave. Au contraire, ce sera interessant de voire comment la cadence se module au fils de l'aventure. 

Notez aussi que les premier devlogs de cette serie seront en réalité des "rétro-devlogs". En effet, j'ai commencé le projet autours d'octobre 2024. Je n'ai pas la date exacte car j'ai perdu l'historique du repo dans une sombre histoire de scene blender légèrement volumineuse (shit happens...). A cette époque, je ne savais pas vraiment si ça menerait quelque part. Et pour tout vous dire, je n'envisagais même pas encore la création de ce blog.

Sans historique git, je ne peux pas remêtre le projet dans un ancien état et me balader dans la code base pour regarder comme c'était foutu. Je ne peux pas non plus faire une simple caprutre d'écran pour illustrer ce que je raconte. Ces premiers numéros seront donc réalisés entièrement de mémoire et les image qui y figureront seront pour la plupart des reconstition. Evidement, je le préciserai chaque fois que ce sera le cas.

Avant de vous souhaiter une bonne lecture, j'attire votre attention sur le fait qu'une vue d'ensemble du projet OpenRE est disponnible [ici](/projects/open_re). Il n'est pas nécessaire d'avoir lu et digéré l'article dans son intégralité mais il est tout de même conseillé de l'avoir parcouru pour pouvoir contextualiser ce que je traite dans les devlogs. J'y introduit également un peu de terminologie. Mais vous pouvez aussi ignorer ce conseil et y faire un tour si vous vous sentez perdu.

## Faire coincider les mondes
Tout le principe d'OpenRE est de fusionner le monde déterministe (modélisé dans Blender) et le monde intéractif (implémenté dans Godot) dans une représentation finale cohérente et homogène. La première chose à faire pour montrer que c'est possible est de s'assurer que les 2 environnement peuvent produire des données rigoureusement identiques. Sans quoi on ne pourra pas les composer entre elles. Dit autrement, on cherche à valider qu'on est capable "d'étalonner" les environnements pour que ce qui en sort s'accorde bien.

La stratégie que j'ai utilisé pour ça est inspirée du TDD : Test Driven Development. Je prends quelques pincettes avec ce terme car je ne suis pas du tout expert en la matière. N'hésitez donc pas à me corriger dans les commentaire. Mais dans les grande lignes, c'est une méthodologie de développement suivant laquelle on se donne des moyens de verifier qu'une fonctionnalité marche avant même de commencer là programmer. On appel ces moyen : des tests. 

A mon sens, cette technique n'est pas adaptée à toutes les problématique. Dans un jeu vidéo par exemple, c'est souvent compliqué d'écrire ce genre de tests. En consequence, chercher à tout pris la meilleur couverture possible est souvent contre-productif. Pour moi le TDD est un outil parmis d'autres qu'il faut savoir utiliser dans le bon context (une scie circulaire c'est très puissant, mais n'essayez pas de planter un clou avec. C'est dangeureux !). 

Mais sans la mettre à toutes les sauces, quelque frappes chirugicales bien placées peuvent en faire une arme redoutable. Et il se trouve que notre problématique s'y prète bien. Alors feu à volonté !

## Le protocol de l'oracle
Ce qui va jouer le rôle de "test" ici sera plus un protocole experimental qu'il faudra dérouler (en partie manuellement) pour avoir notre réponse. L'objet de cette section est de décrire ce protocole.

J'ai commencé par créer dans Blender une petite scene de test composées uniquement de quelques primitives très simples et d'une caméra. Cette scène à ensuite été scrupuleusement reproduite dans Godot. L'opération est trivial étant donné que Godot prend en charge le format de scene de Blender. Je n'ai eu qu'à importer le .blend et à le benner dans une scene Godot vide. And voilà !

![Illustration représentant la SimpleScene dans Blender](images/simpleBlend.opti.webp)
![Illustration représentant la SimpleScene dans Godot](images/simpleGodot.opti.webp)

Les données issues de ces scenes et dont on cherche à verifier l'equivalence sont les G-Buffers de chacunes des deux caméra. Pour l'instant, on va se contanter de G-Buffers partiels constitués de seulement 2 maps :
- L'albédo (la couleur)
- La profondeur

Pour pouvoir comparer les G-Buffer, on va d'abord exporter les maps de la scene déterministe grâce au compositor de Blender. Ensuite il faudra les importer dans Godot sous forme de texture et écrire un post-process ```oracle.gdshader``` qui les prendra en parametre ainsi qu'un entier ```dataType``` designant la donné que l'on veut verifier.

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
		
	
	ALBEDO = dgbuffer_map_frag - igbuffer_map_frag;
}
```
*Code source du shader oracle.gdshader*

```oracle.gdshader``` opère simplement une soustraction des maps désignées. Si l'écran est totalement noir quelque soit la valeur de ```dataType```, alors les G-Buffers sont equivalents. Si ce n'est pas le cas, quelque chose est mal étalonné et le jeu c'est de trouver quoi.

![Image illustrant le protocol de validation](images/oracle_schema.opti.webp)

Sur le papier, les 2 scenes sont identiques puisqu'elles viennent du même fichier .blend. On devrait donc passer le test du premier coup. Qu'est-ce qui pourait mal se passer ?

[test failed avec meme Doh de homer]

## Problème I : les parametres de la caméra
Le premier problème vient de la définition de la caméra. Blender et Godot utilisent des conventions différentes, et malheureusement l'importer a l'aire d'oublier un petit détail.

## Problème II : La profondeur
Après la mise en bouche

#### Depth non linéaire

#### Gamma

#### Mist != (1 - Depth)

## Conclusion
On à donc finalement réussi à faire cohabiter les conventions de Blender et de Godot. 