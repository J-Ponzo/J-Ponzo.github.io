+++
author = 'Turbo Tartine'
date = '2025-02-21T12:51:02+01:00'
draft = true
title = "OpenRE devlog 0 : Oracle Driven Development"
description = 'devlog 0 du projet OpenRE'
+++
## Introduction
Bienvenu dans ce tout premier devlog d'OpenRE : le develog Zéro ! Cette série a pour but de documenter la phase de POC (proof of concept) du projet.

 Si ce n'est pas déja fait, je vous recommande de jeter un oeil à la [présentation générale du projet](/projects/open_re). J'y introduit notament quelques notions et un peu de terminologie. Il est préférable de l'avoir parcouru pour contextualiser un peu ce dont je parle dans les devlogs. 

Avant d'entrer dans le vif du sujet laissez moi introduire un peu de contexte.

### Format de la série
Tout au long du développement, je prendrai des notes dès que je tomberai sur un sujet intéressant. Chaque mois (si j’arrive à m’y tenir), je sélectionnerai les plus pertinents pour les présenter dans un, ou plusieurs nouveau(x) numéro(s), si j'estime que la séparation a du sens.

Étant donné qu’OpenRE est un projet personnel que je développe sur mon temps libre, le rythme de publication risque d’être irrégulier. Certains mois seront plus légers que d’autres, mais ce n’est pas bien grave. Au contraire, ce sera intéressant de voir comment la cadence évolue au fil du temps.

### Shit happens
Petite particularité concernant les première articles de la série : il s'agira de "retro-devlogs". En effet j’ai commencé OpenRE il y a plusieurs mois, sans trop savoir où j’allais. Je n'étais pas sûr que mes expérimentations mèneraient quelque part et de toutes façons, l'idée même de tenir un blog ne m'avais pas encore traversé l'esprit.

Durant cette période, il se trouve que le dépôt git a pris feu (suite à une sombre histoire de fichiers blender beaucoup trop volumineux). Je sais qu'il existe des methodes douce pour régler ce genre de problème. Mais j'avoue que sur le moment je ne voyais pas trop l'intérais. J'ai donc bêtement supprimé le dépôt pour en recréer un avec ma copie locale (après avoir fait le nécessaire pour gérer un peu mieux mes scenes).

![Image générée par IA illustrant un problème git](images/shit-happens.opti.webp)
*Image générée par IA d'un dépot git sinistré par un fichier blender trop gros*

Résultat : j’ai perdu l’historique du projet. Je ne peux donc  plus réstaurer les premières versions pour analyser ce que j'avais fait. Réaliser des capture d'écran de mes résultats originaux est également impossible. Ces premiers numéros seront donc des reconstitutions.

## Part I : Problématique de l'harmonisation des données
Si vous avez lu l'article mentionné dans l'introduction, vous savez qu'OpenRE permet de fusionner le rendu de 2 scènes :
- La scène déterministe : précalculée dans Blender
- La scène intéractive : rendue en temps réèl dans Godot.

Pour cela, la technologie s'appuie sur une structure de donnée particulière appelée un G-Buffer. Pour rappel, il s'agit d'une collections de textures encodant diverse données géométriques relative à un point de vu d'une scène (profondeur, albédo, normales etc...). 

Pour fusionner les scène, OpenRE va  donc composer les G-Buffers issus des scènes déterministes et intéractive (respectivement générées par Blender et Godot). Mais il n'est pas évident que des données produite par deux logiciels différents soitent directement compatibles. C'est même pas gagné du tout en réalité.

![Meme illustrant les différences de conventions entre Blender et Godot](images/meme_ilove_gbuffer.opti.webp)

En effet, tous les logiciels graphiques suivent des conventions qui leurs sont propres (unités, espaces colorimétriques, axes du repère ...). Tant qu'on reste à l'interieur d'un système, la cohérence de l'ensemble est plus ou moins garantie. Mais dès lors que deux systèmes doivent s'échanger des données pour collaborer, c'est le début des problèmes.

Avant toute choses, il va donc falloir s'arranger pour que Blender et Godot parlent la même langue. Et comme on le verra dans les prochains devlogs, cela va demander un certain nombre d'ajustements.

## Part II : La méthode de l'oracle
Pour identifier ces ajustements, on va utiliser une technique que j’aime bien et que j’appelle le *Oracle Driven Development*. C’est un peu comme du *Test Driven Development*, sauf qu’au lieu d’avoir un jeu de tests automatisés, propre et exhaustif, on va bricoler une petite moulinette qu’il faudra lancer en partie à la main. 

A la manière d'un oracle, cette moulinette va formuler des prophéties parfois cryptiques en réponse aux questions qu'on lui pose. Mais interprétés correctement, ces présages nous aideront à avancer dans notre périple.

Si Godot et Blender sont bien sur la même longueure d'ondes, les G-Buffer qu'ils produisent à partir d'une même scène devraient être identiques. C'est ce que nous allons chercher à vérifier avec l'aide de l'oracle. Son rôle sera de comparer les G-Buffers, et de nous délivrer son jugement sous la forme d'une image. Il nous faudra alors lire notre réponse dans cette image.

![Image illustrant le protocol de validation](images/oracle_schema.opti.webp)

Mais trève de métaphore. Concrètement, cet Oracle est un *post-process* du nom de `oracle.gdshader`. Il prend en entrée :
- les textures des deux G-Buffers
- le type de texture à comparer. 

Son job est de calculer deux à deux les différence entre les textures déterministes et intéractives de chaque type et d'afficher à l'écran celle qui correspond au type selectionné. Le degré de différence sera représenté en niveau de gris. La couleur de chaque pixel portant le sens suivant :
- noir -> les pixels des textures source sont identiques
- blanc -> la différence entre les pixels des textures source est maximale

Si l'oracle affiche une image noir pour tout les types des texture possibles, alors les G-Buffers sont identiques.

### Mise en place d’une scène de test 
Pour commencer, j’ai créé une petite scène dans Blender, composée de quelques primitives basiques et d’une caméra. Ensuite, je l’ai reproduite à l’identique dans Godot. L’opération est triviale car Godot prend en charge le format de scène Blender. Il suffit en réalité d’importer le fichier .blend et de l’ajouter dans une scène vide.

![Illustration représentant la SimpleScene dans Blender](images/simpleBlend.opti.webp)  
![Illustration représentant la SimpleScene dans Godot](images/simpleGodot.opti.webp)

Comme vous pouvez le voire sur les captures, la scène est une Cornell box basic avec un petit podium au centre sur lequels nous pourront mettre en scène ce dont on aura besoin le moment venu. Dans ce devlog nous allons nous contanter de mettre en place l'environnement. Il n'y a donc rien sur le podium pour l'instant.

Nous ne verrons pas non plus comment obtenir les G-Buffers de ces deux scène, ni comment les soumettre à l'oracle. En effet ces points présentent des spécificités selon le type de donnée considéré. Je trouve donc plus claire de les aborder dans les devlogs traitant de l'harmonisation du type en question.

### Implementation de l’Oracle  
Maintenant, voyons un peu de quoi est fait notre oracle. Sans plus de cérémonie, voici sont code source. C'est un petit pavé, mais ne vous inquiétez pas, on va le décortiquer ensemble. 

```glsl
shader_type spatial;
render_mode unshaded, fog_disabled;

void vertex() {
	POSITION = vec4(VERTEX.xy, 1.0, 1.0);
}

// Type de donnée à comparer
uniform int data_type = -1;

// Determinist & Interactive G-Buffer
const int NB_GMAPS = 1;
uniform sampler2D[NB_GMAPS] d_gbuffer : filter_nearest;
uniform sampler2D[NB_GMAPS] i_gbuffer : filter_nearest;

// Choix du mode d'affichage
#define I_D_DIFFERENCE 0
#define D_TEXTURE_ONLY 1
#define I_TEXTURE_ONLY 2
uniform int view_mode = 0;

const vec3 ERROR_COLOR = vec3(1.0, 0.0, 1.0);

// Calcule la différence entre 2 pixels 
vec3 compute_difference(vec3 d_frag, vec3 i_frag) {
	return ERROR_COLOR;
}


// Point d'entrée du post-process
void fragment() {
	vec3 out_color = ERROR_COLOR;
	
	if (data_type >= 0 && data_type < NB_GMAPS) {
		// Récupération des pixels déterministe et interactif
		vec3 d_frag = texture(d_gbuffer[data_type], SCREEN_UV).rgb;
		vec3 i_frag = texture(i_gbuffer[data_type], SCREEN_UV).rgb;
		
		// Selection de l'affichage
		switch (view_mode) {
			case I_D_DIFFERENCE:
				// Cas nominal : LA PROPHECIE !!!
				out_color = compute_difference(d_frag, i_frag);
				break;
			case D_TEXTURE_ONLY:
				// Affichage du pixel deterministe brut
				out_color = d_frag;
				break;
			case I_TEXTURE_ONLY:
				// Affichage du pixel interactif brut
				out_color = i_frag;
				break;
		}
	}
	
	ALBEDO = out_color;
}
```

En l'état il ne fait pas grand chose. Voyez ça comme un squelette de base que nous allons habiller petit à petit au fils des devlogs. 

Sans transition, commencons le tour du propriértaire.

#### 1. Code minimal d'un Post-Process 
D'abord, quelques lignes de base qu'on ne détaillera pas. C'est la façon usuelle de créer un post-process dans Godot.
 ```glsl
shader_type spatial;
render_mode unshaded, fog_disabled;

void vertex() {
	POSITION = vec4(VERTEX.xy, 1.0, 1.0);
}
```

#### 2. Les uniforms ou paramettres d'entrée
Les uniforms sont les paramètres d'entrée du shader. C'est à travers eux que le CPU peut envoyer des données au GPU. Une fois initialisés, ils peuvent être référencés comme des variables globales dans le code du shader.

Les uniforms `data_type`, `d_gbuffer` et `i_gbuffer` correspondent aux deux G-Buffers ainsi qu'au type de donnée sélectionné pour la comparaison (évoqués précédement).
```glsl
// Type de donnée à comparer
uniform int data_type = -1;

// Determinist & Interactive G-Buffer
const int NB_GMAPS = 1;
uniform sampler2D[NB_GMAPS] d_gbuffer : filter_nearest;
uniform sampler2D[NB_GMAPS] i_gbuffer : filter_nearest;

// Choix du mode d'affichage
#define I_D_DIFFERENCE 0
#define D_TEXTURE_ONLY 1
#define I_TEXTURE_ONLY 2
uniform int view_mode = 0;
```

Le paramètre `view_mode` lui est nouveau. On en a pas encore parlé. C'est un paramettre de debug qui nous permettra d'afficher facilement des images intermédiaires pour nous aider à intérpréter les prophéties de l'oracle. Pour l'instant on ne peut visualiser que les textures interactive et déterministe corespondant au type de donnée sélectionné. Mais on pourra rajouté de nouveaux mode d'affichage quand ce sera nécessaire.

#### 3. Calcul de différence
C'est ici qu'on implémentera le calcule de la différence. Ou devrais-je dire DES différences. Comme on le verra dans la suite, on sera amenés à traiter les données différement selon leur type.
```glsl
const vec3 ERROR_COLOR = vec3(1.0, 0.0, 1.0);

// Calcule la différence entre 2 pixels 
vec3 compute_difference(vec3 d_frag, vec3 i_frag) {
	return ERROR_COLOR;
}
```
Pour l'instant la fonction renvoit simplement la valeur `ERROR_COLOR` qui est un magenta bien dégueu qui nous interpellera si on le voit à l'écran. C'est quelque chose que je fais assez souvent et qui correspondrait à un `throw new Exception();` ou  un `return -1;` en code CPU.

En effet, dans un GPU on est assez limités en terme de gestion d'erreur. Il faut donc parfois être un peu créatif. N'hésitez pas à paratger vos petites technique personnelles dans les commentaires si vous en avez.

#### 4. fragment() = post-process.main()
Et enfin il y a la fonction `void fragment()` qui est le point d'entrée principal du *post-process*.

La première chose qu'on peut noter, c'est que je réutilise ma technique du `ERROR_COLOR` dans une saveur un peu différente. Ici je verifie les valeurs des uniforms `data_type` et `view_mode` pour m'assurer qu'elles sont valides. Si un des paramètres est à la rue => BOOM ! Ecran magenta !

 **IL NE FAUT JAMAIS FAIRE CA DANS UN SHADER DE PRODUCTION !**

J'expliquerai peut être pourquoi dans un article un jour. Mais retenez que pour des raisons de performences, les branchements conditionnels sont à éviter au maximum dans le code GPU. Ici on s'en fout car on est sur un POC et que l'oracle n'est qu'un outil dont on se sert pour le développement. La performence n'est pas critiques, on se permet donc quelque libertées pour se faciliter vie.
```glsl
// Point d'entrée du post-process
void fragment() {
	vec3 out_color = ERROR_COLOR;
	
	if (data_type >= 0 && data_type < NB_GMAPS) {
		// Récupération des pixels déterministe et interactif
		vec3 d_frag = texture(d_gbuffer[data_type], SCREEN_UV).rgb;
		vec3 i_frag = texture(i_gbuffer[data_type], SCREEN_UV).rgb;
		
		// Selection de l'affichage
		switch (view_mode) {
			case I_D_DIFFERENCE:
				// Cas nominal : LA PROPHECIE !!!
				out_color = compute_difference(d_frag, i_frag);
				break;
			case D_TEXTURE_ONLY:
				// Affichage du pixel deterministe brut
				out_color = d_frag;
				break;
			case I_TEXTURE_ONLY:
				// Affichage du pixel interactif brut
				out_color = i_frag;
				break;
		}
	}
	
	ALBEDO = out_color;
}
```
Le reste du code est assez trivial. D'abord on sample les textures pour obtenir les pixels que l'on souhaite comparer. Ensuite, dans le cas nominal (`view_mode == I_D_DIFFERENCE`) on invoque `compute_difference(...)` sur ces pixels pour déterminer la nuance de gris à afficher. 

Si un mode d'affichage de debug est actif, on execute les traitements appropriés à la place. Ici, pour les valuers `D_TEXTURE_ONLY` et `I_TEXTURE_ONLY` on affiche simplement le pixel brut de la texture correspondante.

## Conclusion :
Dans ce numéro, nous avons mis en place un environnement qui va nous permettre d'étalonner Godot et Blender de manière à ce qu'ils produisent des données suffisement harmonisée pour qu'OpenRE les fusionne correctement. Il se compose :
- D'une scène de teste minimal, crée dans Blender et dupliquée dans Godot
- D'un shader de post process capable de comparer les G-Buffers déterministe et interactif issus de ces scène (on verra comment produire les G-Buffers à partir des scènes ulterieurement)

Gràce à ce dispositif, nous alons pouvoir monitorer l'impacte des ajustements que l'on opère sur les deux logiciels, et ainsi s'assurer que nous allons bien dans le bon sens, itération après itération. Mais prenons un peu de recul sur cette stratégie.

Il faut garder en tête que notre unique scène de test est très simpliste. Pour être vraiment sûr que Godot et Blender sont bien en phase, il faudra plus de données et surtout des données plus complexes. Pas de panique c'est prévu. Godot comprends les .blend et nous avons desormais un oracle dans l'équipe. Il sera donc relativement facile de mettre à l'épreuve de nouvelles scènes au fur et à mesure qu'on avance dans le projet. Et chaque fois que de nouvelles disonances apparaitront, on réouvrira le dossier.

## Le mot de la fin
Je terminerai en disant que ce devlog à été assez compliqué à écrire. J'ai perdu beaucoup de temps à me remémorer les chose et à les reconstituer. Malheureusement, ce sera comme ça tant que je n'aurais pas fini de recollé les wagons (prenez soin de votre git les amis...). 

Mais reconnaissons quand même un avantage à la situation. Le TurboTartine du futur, malgré ses problèmes de mémoire, sait à peu près ce qu'il a fait ensuite. Ce qui je pense aide à la structuration. Mais surtout, ça me permets d'annoncer le sujet du prochain numéro ! 

En effet, dans le develog suivant, nous allons receuillir nos premières prophécies de l'Oracle, et les utiliser pour harmoniser les textures d'Albedo de nos G-Buffers. D'ici là prenez soin de vous, et j'éspère que ce premier devlog vous aura plu. N'hésitez pas à me faire vos retours.


