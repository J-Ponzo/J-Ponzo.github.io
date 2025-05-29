+++
author = 'Turbo Tartine'
date = '2025-05-28T09:01:41+02:00'
draft = true
title = "OpenRE devlog 2 : Harmonisation de la profondeur"
description = 'devlog 2 du projet OpenRE'
+++
## I. Introduction
Ce mois ci on va s'occuper de l'harmonisation des textures de profondeur. Comme pour l'albédo du précédent numéro, je vais d'abord vous expliquer brièvement comment les textures sont obtenues. Nous parcoureront ensuite les différents réglages effectuées côté Blender et Godot.

Notez que jusqu'ici, cette étape aura été la plus longue et la plus difficile et ce pour deux raisons :
- la plupart du temps on peut se contanter d'une comprehention haut-niveau des objets mathématiques qu'on utilise. Les matrices, quaternions et autres bestioles effrayantes sont faciles à dompter lorsqu'on comprend à quelle transformation géométriques elles corepondent (translation, rotation, projection etc...). Il suffit alors de les combiner dans le bon ordre sans forcement comprendre comment ça marche dessous. Seulement voila, parfois on a besoin de comprendre. Et comme je n'avais pas fait de math depuis longtemps, la reprise à été un peu rude (mais ça fait du bien de s'y remettre)
- J'ai eu du mal à comprendre quelle pass Blender je devais utiliser. En effet, la "Z" et la "Mist" donnent des resultat assez similaires visuellement et la documentation ne m'a pas vraiment aidé à comprendre la différence entre les 2. J'ai donc dû expérimenter pour essayer de deviner à quoi elles corespondaient et dans quel format elles étaient exportées. 
 
Rassurez vous je vais pas couvrir en détail ces points un peu fastidieux. Je me contanterai d'évoquer les conclusions que j'en ai tiré.
 
## II. Génération des textures


### 1. Depth déterministe
Pour générer notre texture de depth déterministe, nous allons evidement nous appuyer sur ce que nous avions fait pour l'albédo. La première chose à faire est donc d'activer la passe de profondeur pour faire apparaitre le pin correspondant dans le noeud Render Layers du compositor. Malheureusement cette fois ci nous avons 2 candidates dont voici les rendus repectifs dans Blender :

<comp Z/Mist dans blender>

Il se trouve que le bon choix était la Z, on va donc partir là dessus dans cet article (bien entandu j'avais choisit l'autre). Maintenant que nous avons activée la bonne passe, il suffit d'ajouter un nouveau pin "depth" au noeud "File Output" et de le connecter au pin "depth" apparu dans le noeud Render Layer.

<image du compositor>

A présent les textures d'albédo et de profondeur seront exportées automatiquement à l'emplacement spécifié à la fin de chaque rendu.

### 2. Depth intéractive
La encore on va se baser se ce qui avait été fait pour l'albédo et créer une nouvelle render target.

<image scene avec detph viewport>

Le post-process utilisé est très similaire à celui de l'albédo. La hint_depth_texture est utilisée à la place de la hint_screen_texture mais ce sera la seule différence.

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

Il n'y aura pas besoin de régler Debug Draw sur Unshaded cette fois car la hint_depth_texture n'est pas éclairée comme l'était la hint_screen_texture. 

Par contre, maintenant qu'on a 2 render target, un problème risque de se poser. Etant donné que les quads sur lesquels sont rendus les post-process sont physiquement présent dans la scène (ce qui est une particularité de Godot), il faudra jouer avec les Layer/Cull Mask pour s'assurer que l'Albedo_Camera ne filme pas la DepthLayer_Quad et inversement.

## III. Réglages
Bien entandu nous allons nous reservir de l'oracle pour valider nos réglages. Il va falloir l'étandre pour qu'il supporte les maps de profondeur en plus de celles d'albédo. Pour rester dans la philosophie détente et format court, je ne vais pas détailler les changements ici. Notez simplement que l'on va ajoutéer une fonction pre_processd_d_depth qui nous permettra d'agir sur la texture de pronfondeur déterministe avant les étapes de comparaison et d'affichage. Pour l'instant elle ne fait rien :

```glsl
vec3 pre_processd_d_depth(vec3 d_depth) {
	return d_depth;
}
```

Pour nous faciliter la vie, on va également modifier le far plan de toutes nos caméra (Blender et Godot) pour le ramené à 5m au lieu de 100m. La raison à cela est que l'intégralité de notre scène se trouve dans les premiers metres du champs de la caméra. Si on laisse le far plan à 100m, nos valeures de profondeur seront comprésées dans un tout petit fragment de l'interval [near - far] et les images seront illisibles car les pixels auront des valeurs ridiculement proches.

<near plane à 5>

C'est le moment de soliciter une première fois l'oracle pour obtenir notre prophecie de départ. Et comme vous pouvez le voire elle est sacrément mauvaise.

<prophecie d'initialisation>

### 1. Distance brute
Si on avait pris la peine d'observer la texture déterministe exportée on aurait tout dessuite vu qu'elle n'a rien à voire avec ce que Blender nous affiche en interne dans sa fenetre de rendu.

<Blender Z VS Exported depth>

Difficile d'analyser l'image à l'oeil nu, mais un petit passage dans gimp m'a permis d'y voir plus claire. En jouant sur courbes de couleur, j'ai pu obtenir ceci :

<gimp analyse>

On reconnait bien un morceau de la scène, mais c'est comme si elle était tronqué à 1m de la caméra. Et en réalité c'est exactement ce qu'il se passe. 

En effet, la plupart des formats représentent un chanel par un entier entre 0 et 255 (ou un flotant entre 0 et 1). Le format EXR lui supporte des flotants complètement arbitraire (y compris négatifs). Blender prend en compte cette spécificité et en profite pour encoder la distance brute en mètre lorsque ce format est choisi.

Mais les logiciels qui interprètent le fichier s'attendent à une valeur entre 0 et 1. En consequence, tout ce qui est en dessous de 0 devient noir, et tout ce qui est au dessus de 1 blanc.

Cette propriété de l'EXR est surement très interessante pour plein d'usages, mais pour nous ce n'est pas très pratique. On va donc dire à blender de mapper les valeurs entre 0.1 et 5 avant de les exporter (cela correspond au near et far planes de la caméra).

<image du map>

Avec cette nouvelle texture, la prophecie est toujours très mauvaise, mais au moins on commence à distinguer la scène.

<prophecie>

### 2. Channels packing
En comparant les textures déterministes et intéractive on constate immédiatement les points suivant :
- l'intéractive est dans les tons rouges et les valeurs lointaines sont représentées en noir
- la déterministe est en noir est blanc et le noir représente les valeurs proches

<comparaison cote a cote>

On en déduit que la depth intéractive est encodée dans le canal rouge de l'image et que le 0 indique les valeurs lointaines et le 1 les valeurs proches. La depth déterministe quand à elle est dupliquée dans les 3 cannaux, ce qui lui donne une teinte blanche, et sa valeur est inversées par rapport à l'intéractive (le 0 designes les valeurs proches et le 1 les valeurs lointaines).

On va donc se servir de la founction pre_processd_d_depth pour resoudre cette situation en réorganisant les channels de la manière suivante :

```glsl
vec3 pre_processd_d_depth(vec3 d_depth) {
	return vec3(1.0 - d_depth.r, 0.0, 0.0);
}
```

Si on redemande une prophecie maintenant, on aura l'impression d'avoir régressé. L'immage est en effet plus blanche qu'à l'étape précédente. Mais elle est aussi plus uniforme.

<prophecie blanche mais plus uniforme>

### 3. Délinéarisation


### 4. Use HDR 2D

### 5. Retours sur la Mist

## IV. Conclusion
Changer l'image Blender plus efficace que preprocess dans Godot. Mais itérations plus longues