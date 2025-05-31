+++
author = 'Turbo Tartine'
date = '2025-05-28T09:01:41+02:00'
draft = true
title = "OpenRE devlog 2 : Harmonisation de la profondeur"
description = 'devlog 2 du projet OpenRE'
+++
## I. Introduction
Le mois dernier nous avions utilisé l'oracle pour harmoniser les textures d'albédo intéractive et déterminises. Aujourd'hui, on prend les mêmes et on recommence, avec la profondeur cette fois ci.

Travail est similaire, structure similaire. Je vais commencer par expliquer d'où viennent nos textures, puis on commencera les réglages en scrutant les présages de l'oracle à chaque nouvelle étape.

Je ne détaillerai pas autant que d'habitude les action effectuées dans Blender et Godot. D'abord pour rester raccord avec ma volonté d'aller vers plus de simplicité (qui a apparament plu d'après les retours que j'ai pu avoir), mais aussi parce tout va se passer dans les mêmes fenêtres que le mois dernier alors je pense qu'on peut alléger un peu les descritpions.

Ce sera l'occasion de s'étandre un peu plus sur les peripeties tout en restant dans le un format "moins de 10 min". Car comme vous allez le découvrir, cet épisode vient avec sont lot de rebondisements.

## II. Génération des textures
Pour générer nos textures nous allons bien entandu nous appuyer sur ce que nous avions fait avec l'albédo dans le numéro précédent :
- Render target avec un post-process specifique dans la scene Godot pour l'interactive
- Export de la passe blender correspondant à la depth pour la déterministe

Sauf indication contraire, on conservera les réglages déjà effectués (format EXR, pas de compression VRAM etc...)

### 1. Depth intéractive
Le post-process permettant d'afficher la profondeur est très similaire à celui de l'albédo. En réalité il faut simplement remplacer `hint_screen_texture` par `hint_depth_texture` dans les hints du `uniform sampler 2D` (on changera aussi son nom parce qu'on est pas des bêtes)

```glsl
shader_type spatial;
render_mode unshaded, fog_disabled;

uniform sampler2D depth_texture : hint_depth_texture, repeat_disable, filter_nearest;

void vertex() {
	POSITION = vec4(VERTEX.xy, 1.0, 1.0);
}

void fragment() {
	ALBEDO = vec3(texture(depth_texture, SCREEN_UV.xy).rgb);
}
```

Il faudra également penser à **ne pas** régler le flag `Debug Draw` sur `Unshaded` cette fois ci. Nous avoins fait ça pour retirer l'éclérage de la `hint_screen_texture` pour en extraire l'albédo. Mais c'était un workaround. La `hint_depth_texture` est déjà l'information dont on a besoin. Il n'y a donc rien de plus à faire ici pour l'instant. 

### 2. Depth déterministe
Pour la profondeur déterministe par contre ce n'est pas aussi simple. A prèmière vue, deux passes pourraient correspondre à ce qu'on cherche : la `Z` et la `Mist`. La documentation de Blender ne m'ayant pas vraiment aidé à les départager j'ai décidé de les rendre toutes les 2 pour les comparer. Voici ce que j'ai obtenu :

\<Mist VS Depth>

Ne comprenant pas vraiment ce que je devais voir avec la `Z` j'ai choisi la `Mist` par élimination. J'ai donc ajouté un pin `depth` au noeud `File Output` déjà présant et je l'ai relié au pîn `Mist` apparu sur le noeud `Render Layer` après activation de la passe correspondante.

\<Compositor avec Mist>

On peut desormais régénérer les textures d'albédo et de profondeur automatiquement à chaque rendu.

## III. Réglages
Pour supporter un deuxieme jeu de textures à comparer, il a fallu adapter un peu l'oracle. Pour rester simples et concis je ne décrirai pas ces modifications en détail (elles sont plutôt triviales). 

Notez simplement que j'ai ajouté une fonction `pre_processd_d_depth` qui nous permettra d'agir sur la texture de profondeur déterministe avant les étapes d'affichage et de différence. Pour l'instant cette fonction ne fait rien :

```glsl
vec3 pre_processd_d_depth(vec3 d_depth) {
	return d_depth;
}
```

Avant de commencer, nous allons également réduire à 5m le far plane de nos caméra (Blender et Godot). La raison est simple, actuellement ils est réglé sur 100m, mais la géométrie de notre scène est concentré dans les 2 ou 3 première mètres du champs de la caméra. Si on ne fait rien, nos valeurs de profondeur seront compressées dans un fragment minuscule de l'interval [near; far]. Ce qui rendrait les images illisible (et vous allez vois que même en faisant ça, il faudra parfois plisser les yeux).

### 1. Channel packing
A ce stade nous n'avons pas vraiment besoin de l'oracle pour voir ce qui cloche avec nos textures :
- Blender exporte la valeur de depth dans tous les cannaux de l'image. Ce qui lui donne cet aspect blanchatre
- La hint_depth_texture n'utilise que le canal rouge pour encoder la depth. De plus, la valeur semble inversée (le 0 est loin de l'écran, alors que le 1 est proche)

\<Det blanche VS Int Rouge>

On va donc se servir de la fonction `pre_processd_d_depth` pour harmoniser tout ça :

```glsl
vec3 pre_processd_d_depth(vec3 d_depth) {
	return vec3(1.0 - d_depth.r, 0.0, 0.0);
}
```

Après ce petit ajustement, voici à quoi ressemple notre première prophecie :

\<1_chan_diff>

### 2. Délinéarisation
Comme l'indique la documentation de Godot, la `hint_depth_texture` n'est pas linéaire. En effet, dans un jeu vidéo, il est pratique que la profondeur soit plus précise dans les valeurs proches que dans les valeurs lointaines. Les problème liés à précision étant biensure moins visible en arrière plan. C'est pourquoi la matrice de projection déforme la dimention z des fragment de manière à donner du moue au valeurs proches.

Evidament ça ne nous arrange pas trop parce que la Mist que Blender a exportée est linéaire. Il existe un paramètre `Falloff` qui permet de changer ça :

\<Blender Mist fallof>

Malheureusement, il y a une infinité de façons de ne pas être linéaire et aucune des valeurs proposées par Blender ne semblait correspondre à la déformation appliquée par la matrice de projection côté Godot. Je suis donc parti de la definition de cette matrice (trouveable partout sur internet) et j'ai fait les calculs... Je vous fais grâçe de cette partie en ajoutant directement le resultat dans la fonction `pre_processd_d_depth` (résultat que je n'ai pas trouvé du premier je vous rassure).

```glsl
vec3 pre_processd_d_depth(vec3 d_depth) {
	float z = d_depth.r * (f - n) + n;
	float unlinearized_depth = (z * f - n * f) / (f - n);
	unlinearized_depth /= z;
	return vec3(1.0 - unlinearized_depth, 0.0, 0.0);
}
```

Après nouvelle solicitation de l'oracle, on constate qu'on est légèrement mieux mais c'est pas encore ça.

\<2_chan_unlin_diff>

### 3. Use HDR 2D
J'ai mis un sacré bout de temps à comprendre ce qui n'allait pas. Jusqu'à ce que par hasard, je coche une case dans Godot qui allait résoudre tous mes problèmes. Cette case, c'est `Use HDR 2D` dans la section `Rendering` de notre la target.

\<Godot Use HDR 2D>

A ce moment là je n'avais aucune idée de pourquoi ça marchait. Mais l'oracle était claire... ça marchait !

\<3_chan_unlin_hdr_diff>

Après lecture de la description du paramètre (agrémenté de pas mal d'experimentations), je suis arrivé à la conclusion les render target de Godot appliquaient par defaut une correction gamma à l'image qu'elles produisent. Autrement dit, par defaut ces textures ne sont pas en Linear Color mais en sRGB.

Je ne sais pas si ce comportement est standard sur d'autre moteurs, mais ce qui est sur c'est que ce n'est pas ce qu'on veut dans le cas présent. De manière général en programation graphique, les calculs doivent être fait en Linear Color. La correction gamma n'est appliquée qu'en bout de chaine juste avant d'afficher l'image à l'écran. 

La depth déterministe de Blender en Linear Color (ce qui est cohérant pour une donnée mathématique), nous devons donc la comparer à une depth intéractive dans le même espace de couleur. Et il se trouve que la case `Use HDR 2D` permet d'avoir une image en Linear Color sans correction gamma. 

### 4. L'erreur de la Mist    
 Le nouveau présage est bien meilleur que les précédents. Mais on remarque tout de même la présence de cercle concentriques de plus en plus claires à mesure que l'on s'éloigne du centre. Pour corriger cet ultime problème, on va devoir revenir sur une erreur commise au tout début de l'article. Vous vous souvenez quand on choisit au doigt mouillé la `Mist` plutôt que la `Z` ? Et bien perdu ! C'était la `Z`...             

Nous avons comis un déli de faciesse. En réalité, si la `Z` exportée était aussi moche, c'est parce que nous utilisons le format EXR. Ce format permet de reprsentrer les cannaux par des floatant arbitraires, potentiellement même négatifs. Blender profite de cette propriété pour ecoder la profondeure brute en mètre. Par consequent tout ce qui est à plus d'1m de la caméra apparait completement blanc.

Il suffit de mapper la valeur de la depth entre le near plane (0.1m) et le far plane (5m) et le tour est joué. Notre `Z` retrouve son apparence originale. 

\<Compositor>

Un dernier passage chez l'oracle nous confirme que c'était bien cette passe qu'il fallait utiliser. Les artefacts ont disparu et l'image prèsque totalement noir. Seuls quelques minuscules point gris trahissent encore le contour du podium.

\<Oracle Victoire>

On peut certes se féliciter de ce resultat des plus satisfgaisants. Mais qu'est ce qui différencie `Z` et `Mist` au juste ? Et bien la documentation ne le dit pas et je n'ai pas lu le code source de Blender. Mais la nature les artefacts concentriques me laissent penser que la mist est la distance brute entre le fragment et la position du fragment, alors que la `Z` est le projeté orthogonal de ce fragment sur l'axe Z de la caméra.

\<Z vs Mist>

## IV. Retour sur les espaces de couleur
Petite parenthese pour discuter un point que j'ai volontairement éludé et que vous avez peut être relevé. Pour que les texturent soient dans le même espace de couleur, nous avons du cocher la case `Use HDR 2D`. Mais alors pourquoi nous n'avons pas eu à faire ça pour l'albédo dans le numéro précédent ?

Je me suis égaleme posé cette question. Il s'avère que la réponse est toute simple. Nous avions fait une autre erreur qui se compensait avec celle ci (décidément il bourde sur bourde celui là...). Si vous regardez bien les captures précédentes vous verez que le champs `color space` du noeud `File Output` est réglé sur `sRGB`.

\<Blender sRGB>

Comme évoqué précédament, les calculs doienvent être fait en Linear Color Space. Ce n'est donc pas la bon espace pour notre texture d'albédo déterministe. Mais comme la Render Target de la texture intéractive n'avait pas `Use HDR 2D` de cochée, elle était aussi en sRGB. Les 2 textures étaient dans le même mauvais espace de couleur et dans ce cas, même l'infini sagesse de l'oracle ne peut rien pour nous.

On va donc cocher la `Use HDR 2D` de la render target de l'albédo et dire à blender d'exporter des textures en Linéaire pour corriger ça. Sauf qu'on a le choix entre 6 espaces linéaires différents.

\<Blender Linears>

Après quelques essais, `Linear Rec.709` est visiblement l'espace qu'on cherche. Il donne un résultat aussi satisfaisant que le précédent (associé à la case magique bien entandu). On va donc partir là dessus jusqu'à nouvel ordre. Mais il reste une dernière question : si l'export Blender était réglé sur sRGB tout ce temps, comment se fait il, que la depth déterministe soit bien linéaire ?

Je pense que blender tiens compte du fait que les passes comme la `Mist` et la `Z` ne sont pas des images, mais des données mathématiques auquelles il n'y a auccune raison d'appliquer des changements d'espace. Sur ces passes le champs `color space` semble inopérant. J'ai tester d'export de la `Z` en `sRGB` et en `Linear Rec.709`, les 2 images sont rigoureusement identiques.

## V. Conclusion 
Comme vous le savez, les premier épisodes de cette serie sont écrit a-posteriori. Ce que je décris ici à en réalité été effectué il y a plusieurs mois. Repasser sur du travail déjà effectué est relativement fastidieux, mais je dois dire que cette seconde passe me permet d'affiner ma compréhention des choses, d'en découvrir de nouvelles voir même de corriger des erreures qui m'avaient échapées.

Par exemple, l'intégralité de l'arc sur les espaces de couleur est nouveau. Au premier passage, je n'avais pas vraiment questionné la case à coché magique. C'était un réglage parmis 1000 autres sur lequel je n'étais pas forcement revenu. Mais écrire ces article me force à trouver le sous-ensemble minimal de réglages qui donne le résultat attendu (parce que oui, je teste beaucoup plus de choses que ce que je présente). Et surtout, ça m'oblige à réèlement comprendre pourquoi ça marche. Ce qui à beaucoup de valeur pour moi.

Le mois prochain, on s'occupera de l'harmonisation des normales. C'est le dernier élement qui nous manque pour commencer à implémenter de la lumière. Après ça on va pouvoir faire des choses plus visuelles. 