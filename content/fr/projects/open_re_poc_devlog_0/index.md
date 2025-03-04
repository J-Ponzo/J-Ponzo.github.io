+++
author = 'Turbo Tartine'
date = '2025-02-21T12:51:02+01:00'
draft = true
title = "OpenRE devlog 0 : L'Oracle"
description = 'devlog 0 du projet OpenRE'
+++
## Introduction
Bienvenu dans ce tout premier devlog d'OpenRE : le develog Zéro ! Cette série a pour but de documenter la phase de POC (proof of concept) du projet. Le format sera assez simple. Tout au long du développement, je prendrai des notes dès que je tomberai sur un sujet intéressant. Chaque mois (si j’arrive à m’y tenir), je sélectionnerai les plus pertinents pour les présenter dans un nouveau numéro.

Étant donné qu’OpenRE est un projet personnel que je développe sur mon temps libre, le rythme de publication risque d’être irrégulier. Certains numéros seront plus légers que d’autres, mais ce n’est pas bien grave. Au contraire, ce sera intéressant de voir comment la cadence évolue au fil du temps.

Avant de démarer, je vous recommande de jeter un oeil à la [présentation générale du projet](/projects/open_re). J'y introduit notament quelques notions et un peu de terminologie. Il est préférable de l'avoir parcouru pour contextualiser un peu ce dont je parle dans les devlogs.

Sur ce, c'est parti !

## Shit happens
Petite particularité concernant les première articles de la série : il s'agira de "retro-devlogs". En effet j’ai commencé OpenRE il y a plusieurs mois, sans trop savoir où j’allais. Je n'étais pas sûr que mes expérimentations mèneraient quelque part et de toutes façons, l'idée même de tenir un blog ne m'avais pas encore traversé l'esprit.

Durant cette période, il se trouve que le dépôt git a pris feu (suite à une sombre histoire fichiers blender beaucoup trop volumineux). Je sais qu'il existe des methodes douce pour régler ce genre de problème. Mais j'avoue que sur le moment je ne voyais pas trop l'intérais. J'ai donc bêtement supprimé le dépôt pour en recréer un avec ma copie locale (après avoir fait le nécessaire pour gérer un peu mieux mes scenes).

Résultat : j’ai perdu l’historique du projet. Je ne peux donc  plus réstaurer les premières versions pour analyser ce que j'avais fait. Réaliser des capture d'écran de mes résultats originaux est également impossible. Ces premiers numéros seront donc des reconstitutions.

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

// Data to check
uniform int data_type = 0;

// Interactive G-Buffer
uniform sampler2D igbuffer_albedo : filter_nearest;
uniform sampler2D igbuffer_depth : hint_depth_texture, filter_nearest;
uniform sampler2D igbuffer_normal : filter_nearest;
uniform sampler2D igbuffer_orm : filter_nearest;

// Determinist G-Buffer
uniform sampler2D dgbuffer_albedo : filter_nearest;
uniform sampler2D dgbuffer_depth : filter_nearest;
uniform sampler2D dgbuffer_normal : filter_nearest;
uniform sampler2D dgbuffer_orm : filter_nearest;

// Sample the fragment from the determinist G-Buffer according to the given tex_type
vec3 get_determinist_frag(int tex_type, vec2 coord) {
	if (tex_type == 0) return texture(dgbuffer_albedo, coord).rgb;
	else if (tex_type == 1) return texture(dgbuffer_depth, coord).rgb;
	else if (tex_type == 2) return texture(dgbuffer_normal, coord).rgb;
	else if (tex_type == 3) return texture(dgbuffer_orm, coord).rgb;
	else return vec3(1.0, 1.0, 1.0);
}

// Sample the fragment from the interactive G-Buffer according to the given tex_type
vec3 get_interactive_frag(int tex_type, vec2 coord) {
	if (tex_type == 0) return texture(igbuffer_albedo, coord).rgb;
	else if (tex_type == 1) return texture(igbuffer_depth, coord).rgb;
	else if (tex_type == 2) return texture(igbuffer_normal, coord).rgb;
	else if (tex_type == 3) return texture(igbuffer_orm, coord).rgb;
	else return vec3(0.0, 0.0, 0.0);
}

// Texture differences impl
///////////////////////////////////////////////////////////////////////////
vec3 albedo_difference(vec3 determinist_frag, vec3 interactive_frag) {
	return abs(determinist_frag - interactive_frag);
}

vec3 depth_difference(vec3 determinist_frag, vec3 interactive_frag) {
	return vec3(1.0, 1.0, 1.0);
}

vec3 normal_difference(vec3 determinist_frag, vec3 interactive_frag) {
	return vec3(1.0, 1.0, 1.0);
}

vec3 orm_difference(vec3 determinist_frag, vec3 interactive_frag) {
	return vec3(1.0, 1.0, 1.0);
}
///////////////////////////////////////////////////////////////////////////

void vertex() {
	POSITION = vec4(VERTEX.xy, 1.0, 1.0);
}

void fragment() {
	vec3 determinist_frag = get_determinist_frag(data_type, SCREEN_UV);
	vec3 interactive_frag = get_interactive_frag(data_type, SCREEN_UV);

	vec3 final_color = vec3(1.0, 1.0, 1.0);
	if (data_type == 0) final_color = albedo_difference(determinist_frag, interactive_frag);
	else if (data_type == 1) final_color = depth_difference(determinist_frag, interactive_frag);
	else if (data_type == 2) final_color = normal_difference(determinist_frag, interactive_frag);
	else if (data_type == 3) final_color = orm_difference(determinist_frag, interactive_frag);
	ALBEDO = final_color;
}
```
*Code source du shader oracle.gdshader*

Le fonctionnement de ```oracle.gdshader``` est finalement assez simple. Il calcule la différence entre les couleurs de chaques pixels des textures dont le type correspond à ```data_type```. Si l'écran est noir quelque soit la valeur de ```data_type```, alors les G-Buffers sont equivalents. Sinon, cela s'ignifie que quelque chose est mal réglé. Et biensure, le jeu, c'est de trouver quoi en se basant sur l'image que l'Oracle nous montre.

![Image illustrant le protocol de validation](images/oracle_schema.opti.webp)

Comme vous pouvez le remarquer, seule la différence entre les textures d'albedo est implémentée pour l'instant. Les autres differences retournent la couleur blanche en dur. C'est un peu l'équivalent graphique du ```return null;``` par defaut quand on prévois d'implémenter une fonction plus tard.

## La prophétie originelle
La question qui nous interesse ici est : "est ce que les textures d'Abledo produites par Blender et Godot sont bien harmonisées". Pour poser cette question à notre oracle, il va falloir binder ces textures aux uniforms correspondants du post-process. Ensuite on s'assurera que le paramètre ```data_type``` est bien réglé sur 0 (qui correspond à l'Albedo). On sera alors prêt à recevoir notre prophécie en appuyant sur play. Mais un petit problème subsiste : comment on obtien ces textures d'albedo au juste ?

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
Nous avons correctement créé et bindé nos textures d'albedo. Ces données en été obtenues à partir de 2 scenes rigoureusement identiques puisqu'elles viennent du même fichier. Donc si l'importer de Godot est bien capable de traduire les données de Blender pour les conformer à ses propres conventions, nous devrions obtenir un prophécie encourageante (un écran noir). Qu'est-ce qui pourait mal se passer ?

![Capture de la première prophétie de l'Oracle](images/first_prophecy.opti.webp)

Oh nooooo !

## Décryptage de la professie
Rassurez vous l'importer de Godot fonctionne très bien, le problème n'est pas là. Comme c'est très souvent le cas, la plupart des problème ont été indroduit par la seule étape manuelle de la moulinette : l'export/import de la texture déterministe.

#### Espaces colorimétriques :
Si observe les textures d'albedo que l'oracle à comparé, le première problème qui saute aux yeux c'est que la texture déterministe apparait une peu "délavée" par rapport à l'autre.

[gif alternance]

Il s'agit d'un problème d'export. J'avais en tête qu'il s'agissait surement d'une histoire d'espace de couleur. MAis Blender porpose un (très, très, très) vaste panel d'options d'export. Trop pour qu'un individu lambda comme moi puisse tout comprendre. J'ai donc expérimenté beaucoup de choses un peu à l'instinct jusqu'à trouver le parametre qui m'interesse.

Il fallait régler champs ```view``` de l'export png sur ```Standard``` :

[set_trandard]

On peut ensuitre relancer un rendu et donner notre nouvelles texture à l'oracle pour un revision de la prophetie. Et on obtien ça :

![Capture de la première prophétie de l'Oracle](images/first_prophecy_revision_1.opti.webp)

Ce qui est déjà beaucoup mieux.

#### Compression de texture en VRAM
Beaucoup mieux certes, pais pas encore gagné. Continuons !

Si on zoom sur l'image révisée de la prophecie, on peu voire apparetre des petits motifs caracteristiques.

[image du pattern]

Il s'agit d'artefacts de compression. En effet pour économiser la mémoire vidéo et optimiser les echange de données entre le CPU et le GPU, les textures utilisée dans un jeu sont prèsque toujours compréssée. Il est donc normal que le parametre d'import de Godot soient réglés sur ```Compress Mode = VRAM Compressed```. 

Le problème c'est que les algorythmes de compression utilisés par les moteurs ne sont pas vraiment fait pour notre cas d'useage. En effet, la vocation d'une textures la plupart du temps est d'habiller les meshes qui composent la scène, pas d'être affichagées en plein écran comme on le fait ici.

Si on compare l'image source à sa version compressée on voit clairement la perte de qualité.

[img source + img compressées]

Pour régler ça il suffit de desactiver la compression dans les paramettres d'import de la texture :

[set_lossless]

La nouvelle réponse de l'oracle (je vous fais grâce de mon petit montage à partir d'ici) : 

[2_lossless_Distance]

#### Qualité du png exporté
On a déjà pas mal gagné mais le bruit n'a pas tout à fait disparut :

[image du bruit qui reste]

Il s'agit encore d'un problème de compression, mais cette fois il vient de l'export Blender. En effet, le lecteur attentif aura surement remarqué le champs ```compression = 15%``` de l'export png quand nous avons régler l'espace de couleur au début. Effectivement, le reste des artefacts de compression vien de là et d'un manque de qualité de l'image (réglée par defaut sur 8 bit). On va donc rectifier et relancer un rendu

[set_png_quality]

Victoire ! La compression à totalement disparue. Mais maintenant on peut voire qu'il y a de gros problèmes de banding...

#### Le format EXR

#### Aliazing
