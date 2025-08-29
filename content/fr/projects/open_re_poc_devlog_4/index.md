+++
author = 'Turbo Tartine'
date = '2025-08-28T08:43:37+02:00'
draft = true
title = "OpenRE devlog 4 : Fusion des mondes"
description = 'devlog 4 du projet OpenRE'
+++

[⬅️ Vers Précédent : "OpenRE devlog 3 : Harmonisation des normales"](projects/open_re_poc_devlog_3)

## I. Introduction
Grâce au travail effectué jusqu'ici, nous sommes en mesure d'effectuer nos premiers rendus. Pour cela nous allons partir de la scène actuelle à laquelle nous allons ajouter un peu de mouvement mais surtout : de la lumière.

Comme d'habitude nous adopteront une aproche intérative. Nous commenceront par la version la plus rudimentaire possible que nous complexifieront petit à petit jusqu'à atteindre notre but. A la fin nous auront un rendu en temps réèl cohérent et comprenant :
- de la géométrie déterministe (pré-rendue dans Blender)
- de la géométrie intéractive (rendue en temps réèl par Godot)
- de la lumière déterministe (affectant aussi la géométrie intéractive)
- de la lumière intéractive (affectant aussi la géométrie déterministe)

## II. Géométrie interactive
Dans cette première partie, nous allons laisser de côté la lumière pour nous concentrer sur la géométrie. L'objectif est d'avoir un premier rendu unlit d'une scène intéractive intégré à une scène déterministe. Le tout biensure en respectant la profondeur, c'est à dire que quelque soit le monde (intéractif ou déterministe), ce qui est devant est bien rendu par dessus ce qui est derrière.

### 1. Préparation de la scène
Jusqu'ici, nous avons cherché à comparer des scènes identiques dans le but d'étaloner Godot et Blender afin qu'ils produisent des données bien harmonisées. Mais dans un usage normal, la géométrie du monde intéractif est bien entandu différente de celle du monde déterministe. Dans Godot, on va donc cacher les éléments de la scène précédement importée depuis Blender (qui sera notre scène déterministe).

<Godot element cachés>

On va ensuite ajouter de nouveaux meshes, et comme ces meshes font partie du monde intéractif, on ne se privera pas de les faire bouger.

<Géométrie intéractive rendue avec godot>

Enfin, nous allons desactiver l'oracle et créer un nouveau post-process `ore_compositor` qui sera chargé de fusionner les 2 scènes en temps réèl. Comme l'oracle, il prendra en entrée les maps des G-Buffers déterministe et interactif. Mais il aura également besoin de données suplémentaires relatives à la scène : les propriétés de la caméra active et plus tard des lumières.

A présent voyons un peu de quoi est fait ce post-process.

### 2. Shader du compositor
Attention, pavé en approche ! Ne vous inquiétez pas on va reprendre ça moint par point, mais sans plus de cérémonie, voici la première itération du shader :

```glsl
// USUAL GODOT POST-PROCESS STUFF
shader_type spatial;
render_mode unshaded, fog_disabled;

void vertex() {
	POSITION = vec4(VERTEX.xy, 1.0, 1.0);
}

// HELPER FUNCTIONS FROM THE ORACLE
#include "pre_process_utils.gdshaderinc"

// SCENE UNIFORMS
uniform float cam_near;
uniform float cam_far;

// INTERACTIVE G-BUFFER
uniform sampler2D i_depth_map : filter_nearest;
uniform sampler2D i_albedo_map : filter_nearest;

// DETERMINIST G-BUFFER
uniform sampler2D d_depth_map : filter_nearest;
uniform sampler2D d_diffuse_color_map : filter_nearest;

void fragment() {
	// SAMPLE G-BUFFERs
	vec3 i_depth_frag = texture(i_depth_map, SCREEN_UV).rgb;
	vec3 i_albedo_frag = texture(i_albedo_map, SCREEN_UV).rgb;
	
	vec3 d_depth_frag = texture(d_depth_map, SCREEN_UV).rgb;
	vec3 d_diffuse_color_frag = texture(d_diffuse_color_map, SCREEN_UV).rgb;
	
	// DATA HARMONIZATION
	i_depth_frag = pre_process_i_depth(i_depth_frag);
	d_depth_frag = pre_process_d_depth(d_depth_frag, cam_near, cam_far);
	
	// DATA SELECTION (according to depth)
	float depth_frag;
	vec3 albedo_frag;
	bool is_frag_interactive = d_depth_frag.r < i_depth_frag.r;
	if(is_frag_interactive) {
		depth_frag = i_depth_frag.r;
		albedo_frag = i_albedo_frag;
	}
	else {
		depth_frag = d_depth_frag.r;
		albedo_frag = d_diffuse_color_frag;
	}
	
	// FINAL FRAGMENT COLOR
	ALBEDO = albedo_frag.rgb;
}
```

#### 2.1. Definition habituelle d'un post-process :
On en a déjà parlé, ces premières lignes sont les même pour tous les post-process.

```glsl
// USUAL GODOT POST-PROCESS STUFF
shader_type spatial;
render_mode unshaded, fog_disabled;

void vertex() {
	POSITION = vec4(VERTEX.xy, 1.0, 1.0);
}
```

#### 2.2. Include des helpers de l'oracle :
```glsl  
// HELPER FUNCTIONS FROM THE ORACLE
#include "pre_process_utils.gdshaderinc"
```

Rappelez-vous, pour harmoniser les données, l'Oracle appliquait des pre-traitements à certaines maps. J'ai extrait et regroupées ces fonctions dans le fichier `pre_process_utils.gdshaderinc` que nous incluons ici. De cette manière si nous modifions ces pre-traitements ils resteront valides pour les 2 post-process. Voici son contenu :

```glsl
vec3 pre_process_i_depth(vec3 i_depth) {
	return i_depth;
}

vec3 pre_process_d_depth(vec3 d_depth, float near, float far) {
	float z = d_depth.r * (far - near) + near;
	float unlinearized_depth = (z * far - near * far) / (far - near);
	unlinearized_depth /= z;
	return vec3(1.0 - unlinearized_depth, 0.0, 0.0);
}

vec3 pre_process_i_normal(vec3 i_normal, mat4 inv_view_matrix) {
	i_normal = i_normal * 2.0 - 1.0;
	i_normal = (inv_view_matrix * vec4(i_normal, 0.0)).xyz;
	return i_normal;
}

vec3 pre_process_d_normal(vec3 d_normal) {
	d_normal = vec3(d_normal.x, d_normal.z, -d_normal.y);
	return d_normal;
}
```

Le lecteur attentif aura remarqué qu'on ne repack plus les normales directement dans le pré-process. En effet, avoir des valeurs entre 0 et 1 n'est utile que pour la visualisation. Dans le cas général, on veut la vrai normal prête à l'emplois. C'est pourquoi il est plus logique pour l'Oracle de repacker lui même en dehors du pré-process.

#### 2.3. Parmètres d'entrée :
Comme évoqué dans la section précédente, le post-process `ore_compositor` va prendre en entrée des `uniforms` correspondant aux 2 G-Buffers plus quelques paramètres additionnels relatifs à la scène.

```glsl
// SCENE UNIFORMS
uniform float cam_near;
uniform float cam_far;

// INTERACTIVE G-BUFFER
uniform sampler2D i_depth_map : filter_nearest;
uniform sampler2D i_albedo_map : filter_nearest;

// DETERMINIST G-BUFFER
uniform sampler2D d_depth_map : filter_nearest;
uniform sampler2D d_diffuse_color_map : filter_nearest;
```

Pour l'instant, on a besoin :
- des paramètres near et far de la caméra active
- des texture de depth et d'albédo issues des G-Buffers intéractif et détermniste

#### 2.4. Echantillonage des G-Buffers :
Chaque map est échantillonée pour récupérer le fragment correspondant. Dans la foulée on applique les fameux pre-traitements nécessaires (ici au framents de la depth)

```glsl
void fragment() {
	// SAMPLE G-BUFFERs
	vec3 i_depth_frag = texture(i_depth_map, SCREEN_UV).rgb;
	vec3 i_albedo_frag = texture(i_albedo_map, SCREEN_UV).rgb;
	
	vec3 d_depth_frag = texture(d_depth_map, SCREEN_UV).rgb;
	vec3 d_diffuse_color_frag = texture(d_diffuse_color_map, SCREEN_UV).rgb;
	
	// DATA HARMONIZATION
	i_depth_frag = pre_process_i_depth(i_depth_frag);
	d_depth_frag = pre_process_d_depth(d_depth_frag, cam_near, cam_far);
	
	...
}
```

#### 2.5. Selection des fragment :
Ensuite, on se base sur la valeur de la depth pour déterminer si le fragment courant appartien à la scène intéractive ou déterministe. On en profite pour assigner les fragments correspondant aux variable `depth_frag` et `albedo_frag` qui seront celles utilisées dans la suite du shader.

```glsl
void fragment() {
	...
	
	// DATA SELECTION (according to depth)
	float depth_frag;
	vec3 albedo_frag;
	bool is_frag_interactive = d_depth_frag.r < i_depth_frag.r;
	if(is_frag_interactive) {
		depth_frag = i_depth_frag.r;
		albedo_frag = i_albedo_frag;
	}
	else {
		depth_frag = d_depth_frag.r;
		albedo_frag = d_diffuse_color_frag;
	}
	
	...
}
```

#### 2.6. Affichage du fragment final :
```glsl
void fragment() {
	...
	
	// FINAL FRAGMENT COLOR
	ALBEDO = albedo_frag.rgb;
}
```

Bon, ok... on était pas obligé d'assigner la depth si on renvoit directement l'albedo. Mais pas d'inquiétude, on anticipe juste un peu sur la suite.

### 3. Resultat
Et voilà un magnifique chapaï unlit :

<vidéo du rendu unlite>

Oui je sais c'est sacrément moche sans lumière. Mais au moins on peut constater que la sélection de fragment selon la profondeur est correcte. En effet, les parties du chapaï qui se trouvent sous podium sont bien invisible tandis que le rest est rendu par dessus l'arrière plan.

Mission accomplie ! Place à la lumière maintenant.

## III. Lumière intéractive
blabla roto-lumière qui clignote

### 1. "Distance-only" lighting
```glsl
// USUAL GODOT POST-PROCESS CODE
// HELPER FUNCTIONS FROM THE ORACLE
// SCENE UNIFORMS
...
uniform vec3 cam_position;

uniform int nb_plights;
uniform vec3 plight_position[8];
uniform vec3 plight_color[8];
uniform float plight_intensity[8];

// INTERACTIVE G-BUFFER
// DETERMINIST G-BUFFER
...

void fragment() {
	// SAMPLE G-BUFFERs
	// DATA HARMONIZATION
	...
	
	vec3 diffuse_contrib = vec3(0.0);
	vec3 specular_contrib = vec3(0.0);
	
	// DATA SELECTION (according to depth)
	// WORLD POSITION FROM DEPTH
	vec3 ndc = vec3((SCREEN_UV * 2.0) - 1.0, depth_frag);
	vec4 world = INV_VIEW_MATRIX * INV_PROJECTION_MATRIX * vec4(ndc, 1.0);
	world.xyz /= world.w;
	vec3 frag_position = world.xyz;
	
	// ACCUMULATE LIGHT CONTRIBUTIONS
	for(int i = 0; i < nb_plights; i++) {
		vec3 light_vec = plight_position[i] - frag_position;
		float d2 = length(light_vec);
		d2 = pow(d2, 2.0);
		float attenuation = 1.0 / d2;

		vec3 L = normalize(light_vec);
		vec3 C = plight_color[i];
		float I = plight_intensity[i];
		diffuse_contrib += C * I * albedo_frag * attenuation;
		//specular_contrib += NOT IMPLEMENTED YET
	}
	
	// FINAL FRAGMENT COLOR
	ALBEDO = diffuse_contrib + specular_contrib;
}
```

### 2. Lambertian lighting
```glsl
// USUAL GODOT POST-PROCESS CODE
// HELPER FUNCTIONS FROM THE ORACLE
// SCENE UNIFORMS
// INTERACTIVE G-BUFFER
...
uniform sampler2D i_normal_map : filter_nearest;

// DETERMINIST G-BUFFER
...
uniform sampler2D d_normal_map : filter_nearest;

void fragment() {
	// SAMPLE G-BUFFERs
	...
	vec3 i_normal_frag = texture(i_normal_map, SCREEN_UV).rgb;
	
	...
	vec3 d_normal_frag = texture(d_normal_map, SCREEN_UV).rgb;
	
	
	// DATA HARMONIZATION
	...
	d_normal_frag = pre_process_d_normal(d_normal_frag);
	i_normal_frag = pre_process_i_normal(i_normal_frag, INV_VIEW_MATRIX);
	
	// DATA SELECTION (according to depth)
	...
	vec3 albedo_frag, normal_frag;
	if(is_frag_interactive) {
		...
		normal_frag = i_normal_frag;
	}
	else {
		...
		normal_frag = d_normal_frag;
	}
	
	// WORLD POSITION FROM DEPTH
	// ACCUMULATE LIGHT CONTRIBUTIONS
	for(int i = 0; i < nb_plights; i++) {
		...
		float NdotL = max(dot(normal_frag, L), 0.0);
		diffuse_contrib += NdotL * C * I * albedo_frag * attenuation;
		//specular_contrib += NOT IMPLEMENTED YET
	}
	
	// FINAL FRAGMENT COLOR
	ALBEDO = diffuse_contrib + specular_contrib;
}
```

## IV. Lumière déterministe

### 1. Generation des textures d'illumination

### 2. Intégration au compositor
```glsl
// USUAL GODOT POST-PROCESS CODE
// HELPER FUNCTIONS FROM THE ORACLE
// SCENE UNIFORMS
// INTERACTIVE G-BUFFER
// DETERMINIST G-BUFFER
...
uniform sampler2D d_diff_dir_map : filter_nearest;
uniform sampler2D d_diff_ind_map : filter_nearest;
uniform sampler2D d_gloss_color_map : filter_nearest;
uniform sampler2D d_gloss_dir_map : filter_nearest;
uniform sampler2D d_gloss_ind_map : filter_nearest;

void fragment() {
	// SAMPLE G-BUFFERs
	...
	vec3 d_diff_dir_frag = texture(d_diff_dir_map, SCREEN_UV).rgb;
	vec3 d_diff_ind_frag = texture(d_diff_ind_map, SCREEN_UV).rgb;
	vec3 d_gloss_color_frag = texture(d_gloss_color_map, SCREEN_UV).rgb;
	vec3 d_gloss_dir_frag = texture(d_gloss_dir_map, SCREEN_UV).rgb;
	vec3 d_gloss_ind_frag = texture(d_gloss_ind_map, SCREEN_UV).rgb;
	
	// DATA HARMONIZATION
	// DATA SELECTION (according to depth)
	...
	if(is_frag_interactive) {
		...
	}
	else {
		...
		vec3 d_diff_light = d_diff_dir_frag + d_diff_ind_frag;
		vec3 d_gloss_light = d_gloss_dir_frag + d_gloss_ind_frag;
		diffuse_contrib += d_diffuse_color_frag * d_diff_light;
		specular_contrib += d_gloss_color_frag * d_gloss_light;
	}
	
	// WORLD POSITION FROM DEPTH
	// ACCUMULATE LIGHT CONTRIBUTIONS
	// FINAL FRAGMENT COLOR
	ALBEDO = diffuse_contrib + specular_contrib;
}
```

### 3. Denoising

### 4. Double exposition
```glsl
// USUAL GODOT POST-PROCESS CODE
// HELPER FUNCTIONS FROM THE ORACLE
// SCENE UNIFORMS
...
uniform bool plight_isInteractive[8];

// INTERACTIVE G-BUFFER
// DETERMINIST G-BUFFER
...

void fragment() {
	// SAMPLE G-BUFFERs
	// DATA HARMONIZATION
	// DATA SELECTION (according to depth)
	// WORLD POSITION FROM DEPTH
	// ACCUMULATE LIGHT CONTRIBUTIONS
	for(int i = 0; i < nb_plights; i++) {
		if(!is_frag_interactive && !plight_isInteractive[i])
			continue;
		...
	}
	
	// FINAL FRAGMENT COLOR
	ALBEDO = diffuse_contrib + specular_contrib;
}
```

## IV. Conclusion 