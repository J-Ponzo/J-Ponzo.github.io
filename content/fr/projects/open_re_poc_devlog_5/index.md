+++
author = 'Turbo Tartine'
date = '2025-08-31T12:54:28+02:00'
draft = true
title = "OpenRE devlog 5 : Fusion des mondes. Part II"
description = 'devlog 5 du projet OpenRE'
+++

[⬅️ Vers Précédent : "OpenRE devlog 5 : Fusion des mondes. Part I"](projects/open_re_poc_devlog_4)

## I. Introduction
Bienvenue dans la deuxième partie de "fusion des mondes" ! Le mois dernier nous avions mélangé de la géométrie intéractive à de la déterministe en nous basant sur les textures de profondeur. Nous avions ensuite éclairé tout ça avec une point light interactive qui clignotait en orbitant autour de la scène. L'implémentation de l'éclairage était basé uniquement sur la distance.

Aujourd'hui nous allons :
- Enrichire le modèle d'illumination en prenant en compte l'orientation des surfaces
- Calculer de la lumière déterministe dans Blender et l'intégrer a notre scène

## II. Le modèle de Lambert
Le modèle de Lambert suppose que les surfaces réfléchissent la lumière de manière égale dans toutes les directions. Cela veut dire que la quantité de lumière en un point ne dépend pas du point de vue de l'observateur. En réalité, elle dépend de l'angle selon lequel le rayon frappe la surface.

### 1. Principe
Une façon de se représenter le phénomene, c'est d'imaginer un faiseau de lumière parfaitement vertical qui éclaire une surface parfaitement horizontale. Le cercle dans lequel les photons percutent la surface cohincide avec la section du faiseau.

Si maitenant le faiseau est incliné, ce cercle devient une elipse. De là on peut tirer une conclusion similaire à ce qu'on avait dit dans la partie I au sujet de l'inverse square law : la surface de l'elipse est superieure à celle du cercle alors que la quantité de photons emis reste la même. La concentration de lumière est donc plus faible. Et au plus l'angle est rasant, au plus l'elipse s'étire et augmente sa surface. L'intensité lumineuse perçue est donc fonction de l'angle d'incidence de la lumière. 

La modalité exacte selon laquelle la surface évolue en fonction de l'ancle n'est pas intuitive. Mais on va fair confiance à Mr Lambert en affirmant que : I = I0 * max(N.L, 0.0) (avec I0 l’intensité de la source, N le vecteur Normal, et L l'inverse de la direction de la lumière)

### 2. Implémentation
En relisant le numéro précédent pour écrire celui çi, je me suis rendu compte que les échantillons de code commencaient à être un peu long. J'avais moi même un peu de mal à les resituer alors que je les ai écrits, alors je n'ose pas imaginer la galère pour vous.

Dans la partie II on va continuer d'en rajouter. J'avais peur que ça devienne vraiment illisible, alors j'ai passé un peu de temps pour faire un petit bouton qui recontextualise l'échantillon dans le code complet. J'éspère que ça aidera à lecture.

Bref, voici les ajouts nécessaire à l'implémentation du modèle Lambertien. Comme toujours on va décortiquer ça pas à pas.

{{< togglecode >}}
```glsl {#code-compact hl_lines=[6,10,15,18,22,23,28,32,36,43,44]}
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
	vec3 albedo_frag;
	vec3 normal_frag;
	bool is_frag_interactive = d_depth_frag.r < i_depth_frag.r;
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

```glsl {#code-full .hidden hl_lines=[23,28,34,38,43,44,52,57,62,81,82]}
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
uniform int nb_plights;
uniform vec3 plight_position[8];
uniform vec3 plight_color[8];
uniform float plight_intensity[8];

// INTERACTIVE G-BUFFER
uniform sampler2D i_depth_map : filter_nearest;
uniform sampler2D i_albedo_map : filter_nearest;
uniform sampler2D i_normal_map : filter_nearest;

// DETERMINIST G-BUFFER
uniform sampler2D d_depth_map : filter_nearest;
uniform sampler2D d_diffuse_color_map : filter_nearest;
uniform sampler2D d_normal_map : filter_nearest;

void fragment() {
	// SAMPLE G-BUFFERs
	vec3 i_depth_frag = texture(i_depth_map, SCREEN_UV).rgb;
	vec3 i_albedo_frag = texture(i_albedo_map, SCREEN_UV).rgb;
	vec3 i_normal_frag = texture(i_normal_map, SCREEN_UV).rgb;
	
	vec3 d_depth_frag = texture(d_depth_map, SCREEN_UV).rgb;
	vec3 d_diffuse_color_frag = texture(d_diffuse_color_map, SCREEN_UV).rgb;
	vec3 d_normal_frag = texture(d_normal_map, SCREEN_UV).rgb;
	
	// DATA HARMONIZATION
	i_depth_frag = pre_process_i_depth(i_depth_frag);
	d_depth_frag = pre_process_d_depth(d_depth_frag, cam_near, cam_far);
	d_normal_frag = pre_process_d_normal(d_normal_frag);
	i_normal_frag = pre_process_i_normal(i_normal_frag, INV_VIEW_MATRIX);
	
	vec3 diffuse_contrib = vec3(0.0);
	vec3 specular_contrib = vec3(0.0);
	
	// DATA SELECTION (according to depth)
	float depth_frag;
	vec3 albedo_frag;
	vec3 normal_frag;
	bool is_frag_interactive = d_depth_frag.r < i_depth_frag.r;
	if(is_frag_interactive) {
		depth_frag = i_depth_frag.r;
		albedo_frag = i_albedo_frag;
		normal_frag = i_normal_frag;
	}
	else {
		depth_frag = d_depth_frag.r;
		albedo_frag = d_diffuse_color_frag;
		normal_frag = d_normal_frag;
	}
	
	// WORLD POSITION FROM DEPTH
	vec3 ndc = vec3((SCREEN_UV * 2.0) - 1.0, depth_frag);
	vec4 clip = vec4(ndc, 1.0);
	vec4 world = INV_VIEW_MATRIX * INV_PROJECTION_MATRIX * clip;
	world.xyz /= world.w;
	vec3 frag_position = world.xyz;
	
	// ACCUMULATE LIGHT CONTRIBUTIONS
	for(int i = 0; i < nb_plights; i++) {
		vec3 light_vec = plight_position[i] - frag_position;
		float d2 = length(light_vec);
		d2 = pow(d2, 2.0);
		float attenuation = 1.0 / d2;

		vec3 C = plight_color[i];
		float I = plight_intensity[i];
		float NdotL = max(dot(normal_frag, L), 0.0);
		diffuse_contrib += NdotL * C * I * albedo_frag * attenuation;
		//specular_contrib += NOT IMPLEMENTED YET
	}
	
	// FINAL FRAGMENT COLOR
	ALBEDO = diffuse_contrib + specular_contrib;
}
```
{{< /togglecode >}}

#### 1.1. Introduction des normales
Pour calculer l'angle d'incidence de la lumière, on va avoir besoin des normales.
{{< togglecode >}}
```glsl {#code-compact hl_lines=[6,10,15,18,22,23,28,32,36,43,44]}
// USUAL GODOT POST-PROCESS CODE
// HELPER FUNCTIONS FROM THE ORACLE
// SCENE UNIFORMS
// INTERACTIVE G-BUFFER
...
uniform sampler2D i_normal_map : filter_nearest;

// DETERMINIST G-BUFFER
...
uniform sampler2D d_normal_map : filter_nearest;
```

```glsl {#code-full .hidden hl_lines=[23,28]}
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
uniform int nb_plights;
uniform vec3 plight_position[8];
uniform vec3 plight_color[8];
uniform float plight_intensity[8];

// INTERACTIVE G-BUFFER
uniform sampler2D i_depth_map : filter_nearest;
uniform sampler2D i_albedo_map : filter_nearest;
uniform sampler2D i_normal_map : filter_nearest;

// DETERMINIST G-BUFFER
uniform sampler2D d_depth_map : filter_nearest;
uniform sampler2D d_diffuse_color_map : filter_nearest;
uniform sampler2D d_normal_map : filter_nearest;

void fragment() {
	// SAMPLE G-BUFFERs
	vec3 i_depth_frag = texture(i_depth_map, SCREEN_UV).rgb;
	vec3 i_albedo_frag = texture(i_albedo_map, SCREEN_UV).rgb;
	vec3 i_normal_frag = texture(i_normal_map, SCREEN_UV).rgb;
	
	vec3 d_depth_frag = texture(d_depth_map, SCREEN_UV).rgb;
	vec3 d_diffuse_color_frag = texture(d_diffuse_color_map, SCREEN_UV).rgb;
	vec3 d_normal_frag = texture(d_normal_map, SCREEN_UV).rgb;
	
	// DATA HARMONIZATION
	i_depth_frag = pre_process_i_depth(i_depth_frag);
	d_depth_frag = pre_process_d_depth(d_depth_frag, cam_near, cam_far);
	d_normal_frag = pre_process_d_normal(d_normal_frag);
	i_normal_frag = pre_process_i_normal(i_normal_frag, INV_VIEW_MATRIX);
	
	vec3 diffuse_contrib = vec3(0.0);
	vec3 specular_contrib = vec3(0.0);
	
	// DATA SELECTION (according to depth)
	float depth_frag;
	vec3 albedo_frag;
	vec3 normal_frag;
	bool is_frag_interactive = d_depth_frag.r < i_depth_frag.r;
	if(is_frag_interactive) {
		depth_frag = i_depth_frag.r;
		albedo_frag = i_albedo_frag;
		normal_frag = i_normal_frag;
	}
	else {
		depth_frag = d_depth_frag.r;
		albedo_frag = d_diffuse_color_frag;
		normal_frag = d_normal_frag;
	}
	
	// WORLD POSITION FROM DEPTH
	vec3 ndc = vec3((SCREEN_UV * 2.0) - 1.0, depth_frag);
	vec4 clip = vec4(ndc, 1.0);
	vec4 world = INV_VIEW_MATRIX * INV_PROJECTION_MATRIX * clip;
	world.xyz /= world.w;
	vec3 frag_position = world.xyz;
	
	// ACCUMULATE LIGHT CONTRIBUTIONS
	for(int i = 0; i < nb_plights; i++) {
		vec3 light_vec = plight_position[i] - frag_position;
		float d2 = length(light_vec);
		d2 = pow(d2, 2.0);
		float attenuation = 1.0 / d2;

		vec3 C = plight_color[i];
		float I = plight_intensity[i];
		float NdotL = max(dot(normal_frag, L), 0.0);
		diffuse_contrib += NdotL * C * I * albedo_frag * attenuation;
		//specular_contrib += NOT IMPLEMENTED YET
	}
	
	// FINAL FRAGMENT COLOR
	ALBEDO = diffuse_contrib + specular_contrib;
}
```
{{< /togglecode >}}
On introduit donc les uniforms `i_normal_map` et `d_normal_map` qui proviennent respectivement des G-Buffers interactif et déterministe.

#### 1.2. Echantillonage des normales
On échantillone/harmonize tout ça comme on l'a fait pour les autres maps

{{< togglecode >}}
```glsl {#code-compact hl_lines=[4,7,11,12]}
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
	
	...
}
```

```glsl {#code-full .hidden hl_lines=[34,38,43,44]}
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
uniform int nb_plights;
uniform vec3 plight_position[8];
uniform vec3 plight_color[8];
uniform float plight_intensity[8];

// INTERACTIVE G-BUFFER
uniform sampler2D i_depth_map : filter_nearest;
uniform sampler2D i_albedo_map : filter_nearest;
uniform sampler2D i_normal_map : filter_nearest;

// DETERMINIST G-BUFFER
uniform sampler2D d_depth_map : filter_nearest;
uniform sampler2D d_diffuse_color_map : filter_nearest;
uniform sampler2D d_normal_map : filter_nearest;

void fragment() {
	// SAMPLE G-BUFFERs
	vec3 i_depth_frag = texture(i_depth_map, SCREEN_UV).rgb;
	vec3 i_albedo_frag = texture(i_albedo_map, SCREEN_UV).rgb;
	vec3 i_normal_frag = texture(i_normal_map, SCREEN_UV).rgb;
	
	vec3 d_depth_frag = texture(d_depth_map, SCREEN_UV).rgb;
	vec3 d_diffuse_color_frag = texture(d_diffuse_color_map, SCREEN_UV).rgb;
	vec3 d_normal_frag = texture(d_normal_map, SCREEN_UV).rgb;
	
	// DATA HARMONIZATION
	i_depth_frag = pre_process_i_depth(i_depth_frag);
	d_depth_frag = pre_process_d_depth(d_depth_frag, cam_near, cam_far);
	d_normal_frag = pre_process_d_normal(d_normal_frag);
	i_normal_frag = pre_process_i_normal(i_normal_frag, INV_VIEW_MATRIX);
	
	vec3 diffuse_contrib = vec3(0.0);
	vec3 specular_contrib = vec3(0.0);
	
	// DATA SELECTION (according to depth)
	float depth_frag;
	vec3 albedo_frag;
	vec3 normal_frag;
	bool is_frag_interactive = d_depth_frag.r < i_depth_frag.r;
	if(is_frag_interactive) {
		depth_frag = i_depth_frag.r;
		albedo_frag = i_albedo_frag;
		normal_frag = i_normal_frag;
	}
	else {
		depth_frag = d_depth_frag.r;
		albedo_frag = d_diffuse_color_frag;
		normal_frag = d_normal_frag;
	}
	
	// WORLD POSITION FROM DEPTH
	vec3 ndc = vec3((SCREEN_UV * 2.0) - 1.0, depth_frag);
	vec4 clip = vec4(ndc, 1.0);
	vec4 world = INV_VIEW_MATRIX * INV_PROJECTION_MATRIX * clip;
	world.xyz /= world.w;
	vec3 frag_position = world.xyz;
	
	// ACCUMULATE LIGHT CONTRIBUTIONS
	for(int i = 0; i < nb_plights; i++) {
		vec3 light_vec = plight_position[i] - frag_position;
		float d2 = length(light_vec);
		d2 = pow(d2, 2.0);
		float attenuation = 1.0 / d2;

		vec3 C = plight_color[i];
		float I = plight_intensity[i];
		float NdotL = max(dot(normal_frag, L), 0.0);
		diffuse_contrib += NdotL * C * I * albedo_frag * attenuation;
		//specular_contrib += NOT IMPLEMENTED YET
	}
	
	// FINAL FRAGMENT COLOR
	ALBEDO = diffuse_contrib + specular_contrib;
}
```
{{< /togglecode >}}

#### 1.3. Selection de la normale
On selectionne en suite la normale du monde visible. Toujours en se basant sur la profondeur.

{{< togglecode >}}
```glsl {#code-compact hl_lines=[5,9,13]}
void fragment() {
	// DATA SELECTION (according to depth)
	...
	vec3 albedo_frag;
	vec3 normal_frag;
	bool is_frag_interactive = d_depth_frag.r < i_depth_frag.r;
	if(is_frag_interactive) {
		...
		normal_frag = i_normal_frag;
	}
	else {
		...
		normal_frag = d_normal_frag;
	}
	
	...
}
```

```glsl {#code-full .hidden hl_lines=[52,57,62]}
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
uniform int nb_plights;
uniform vec3 plight_position[8];
uniform vec3 plight_color[8];
uniform float plight_intensity[8];

// INTERACTIVE G-BUFFER
uniform sampler2D i_depth_map : filter_nearest;
uniform sampler2D i_albedo_map : filter_nearest;
uniform sampler2D i_normal_map : filter_nearest;

// DETERMINIST G-BUFFER
uniform sampler2D d_depth_map : filter_nearest;
uniform sampler2D d_diffuse_color_map : filter_nearest;
uniform sampler2D d_normal_map : filter_nearest;

void fragment() {
	// SAMPLE G-BUFFERs
	vec3 i_depth_frag = texture(i_depth_map, SCREEN_UV).rgb;
	vec3 i_albedo_frag = texture(i_albedo_map, SCREEN_UV).rgb;
	vec3 i_normal_frag = texture(i_normal_map, SCREEN_UV).rgb;
	
	vec3 d_depth_frag = texture(d_depth_map, SCREEN_UV).rgb;
	vec3 d_diffuse_color_frag = texture(d_diffuse_color_map, SCREEN_UV).rgb;
	vec3 d_normal_frag = texture(d_normal_map, SCREEN_UV).rgb;
	
	// DATA HARMONIZATION
	i_depth_frag = pre_process_i_depth(i_depth_frag);
	d_depth_frag = pre_process_d_depth(d_depth_frag, cam_near, cam_far);
	d_normal_frag = pre_process_d_normal(d_normal_frag);
	i_normal_frag = pre_process_i_normal(i_normal_frag, INV_VIEW_MATRIX);
	
	vec3 diffuse_contrib = vec3(0.0);
	vec3 specular_contrib = vec3(0.0);
	
	// DATA SELECTION (according to depth)
	float depth_frag;
	vec3 albedo_frag;
	vec3 normal_frag;
	bool is_frag_interactive = d_depth_frag.r < i_depth_frag.r;
	if(is_frag_interactive) {
		depth_frag = i_depth_frag.r;
		albedo_frag = i_albedo_frag;
		normal_frag = i_normal_frag;
	}
	else {
		depth_frag = d_depth_frag.r;
		albedo_frag = d_diffuse_color_frag;
		normal_frag = d_normal_frag;
	}
	
	// WORLD POSITION FROM DEPTH
	vec3 ndc = vec3((SCREEN_UV * 2.0) - 1.0, depth_frag);
	vec4 clip = vec4(ndc, 1.0);
	vec4 world = INV_VIEW_MATRIX * INV_PROJECTION_MATRIX * clip;
	world.xyz /= world.w;
	vec3 frag_position = world.xyz;
	
	// ACCUMULATE LIGHT CONTRIBUTIONS
	for(int i = 0; i < nb_plights; i++) {
		vec3 light_vec = plight_position[i] - frag_position;
		float d2 = length(light_vec);
		d2 = pow(d2, 2.0);
		float attenuation = 1.0 / d2;

		vec3 C = plight_color[i];
		float I = plight_intensity[i];
		float NdotL = max(dot(normal_frag, L), 0.0);
		diffuse_contrib += NdotL * C * I * albedo_frag * attenuation;
		//specular_contrib += NOT IMPLEMENTED YET
	}
	
	// FINAL FRAGMENT COLOR
	ALBEDO = diffuse_contrib + specular_contrib;
}
```
{{< /togglecode >}}

#### 1.4. Application du cosinus de Lambert
Et enfin on applique le terme Lambertien `NdotL` qui est le cosinus de l'angle formé par la normale et la direction de la lumière.

{{< togglecode >}}
```glsl {#code-compact hl_lines=[7,8]}
void fragment() {
	...
	
	// ACCUMULATE LIGHT CONTRIBUTIONS
	for(int i = 0; i < nb_plights; i++) {
		...
		float NdotL = max(dot(normal_frag, L), 0.0);
		diffuse_contrib += NdotL * C * I * albedo_frag * attenuation;
		//specular_contrib += NOT IMPLEMENTED YET
	}

	...
}
```

```glsl {#code-full .hidden hl_lines=[81,82]}
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
uniform int nb_plights;
uniform vec3 plight_position[8];
uniform vec3 plight_color[8];
uniform float plight_intensity[8];

// INTERACTIVE G-BUFFER
uniform sampler2D i_depth_map : filter_nearest;
uniform sampler2D i_albedo_map : filter_nearest;
uniform sampler2D i_normal_map : filter_nearest;

// DETERMINIST G-BUFFER
uniform sampler2D d_depth_map : filter_nearest;
uniform sampler2D d_diffuse_color_map : filter_nearest;
uniform sampler2D d_normal_map : filter_nearest;

void fragment() {
	// SAMPLE G-BUFFERs
	vec3 i_depth_frag = texture(i_depth_map, SCREEN_UV).rgb;
	vec3 i_albedo_frag = texture(i_albedo_map, SCREEN_UV).rgb;
	vec3 i_normal_frag = texture(i_normal_map, SCREEN_UV).rgb;
	
	vec3 d_depth_frag = texture(d_depth_map, SCREEN_UV).rgb;
	vec3 d_diffuse_color_frag = texture(d_diffuse_color_map, SCREEN_UV).rgb;
	vec3 d_normal_frag = texture(d_normal_map, SCREEN_UV).rgb;
	
	// DATA HARMONIZATION
	i_depth_frag = pre_process_i_depth(i_depth_frag);
	d_depth_frag = pre_process_d_depth(d_depth_frag, cam_near, cam_far);
	d_normal_frag = pre_process_d_normal(d_normal_frag);
	i_normal_frag = pre_process_i_normal(i_normal_frag, INV_VIEW_MATRIX);
	
	vec3 diffuse_contrib = vec3(0.0);
	vec3 specular_contrib = vec3(0.0);
	
	// DATA SELECTION (according to depth)
	float depth_frag;
	vec3 albedo_frag;
	vec3 normal_frag;
	bool is_frag_interactive = d_depth_frag.r < i_depth_frag.r;
	if(is_frag_interactive) {
		depth_frag = i_depth_frag.r;
		albedo_frag = i_albedo_frag;
		normal_frag = i_normal_frag;
	}
	else {
		depth_frag = d_depth_frag.r;
		albedo_frag = d_diffuse_color_frag;
		normal_frag = d_normal_frag;
	}
	
	// WORLD POSITION FROM DEPTH
	vec3 ndc = vec3((SCREEN_UV * 2.0) - 1.0, depth_frag);
	vec4 clip = vec4(ndc, 1.0);
	vec4 world = INV_VIEW_MATRIX * INV_PROJECTION_MATRIX * clip;
	world.xyz /= world.w;
	vec3 frag_position = world.xyz;
	
	// ACCUMULATE LIGHT CONTRIBUTIONS
	for(int i = 0; i < nb_plights; i++) {
		vec3 light_vec = plight_position[i] - frag_position;
		float d2 = length(light_vec);
		d2 = pow(d2, 2.0);
		float attenuation = 1.0 / d2;

		vec3 C = plight_color[i];
		float I = plight_intensity[i];
		float NdotL = max(dot(normal_frag, L), 0.0);
		diffuse_contrib += NdotL * C * I * albedo_frag * attenuation;
		//specular_contrib += NOT IMPLEMENTED YET
	}
	
	// FINAL FRAGMENT COLOR
	ALBEDO = diffuse_contrib + specular_contrib;
}
```
{{< /togglecode >}}

Les valeurs négative indiquent une lumière "en dessous" de la surface éclairée. Une telle lumière doit être ignorée, et non "absorber" la lumière accumulée. C'est pourquoi vous noterez que la valeur de `NdotL` est clampée.

#### 1.5. Résultat
Cette implémentation nous donne un meilleur sens du relief que le modèle précédent. On a pas encore de lumière spéculaire, mais l'amélioration est déjà perceptible.



Maintenant, place à la lumière déterministe.

## III. Lumière déterministe

### 1. Generation des textures d'illumination

### 2. Intégration au compositor
C'est maintenant une habitude, voici d'abord le code complet du shader que l'on s'apprete à détailler.
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

#### 2.1. Introduction des maps déterministe
On doit binsure passer au shader les textures générées dans Blender via des uniforms.

[code]

On en ajoute que 5 car `d_diff_dir_map` est déjà là (c'est notre albédo)

#### 2.2. Echantillonage des maps déterministe
On échantillonne nos maps de la même manière que les autres. Cette fois il n'y a pas d'harmonisation a effectuer car ces données sont exclusivent au monde déterministe.

[code]

#### 2.3. Reconstitution de la lumière déterministe
Ici nous allons initialiser les variable `diffuse_contrib` et `specular_contrib` selon la formule indiquée dans la documention de Blender.

[blender compo]

Blender utilise le terme "glossy", mais ne vous laissez pas perturber pour si peu. C'est un synonyme de "specular". Par ailleurs, notez que la lumière déterministe ne doit pas s'appliquer aux fragments intéractifs (raison pour laquelle on initialise les variables dans le `else`).

[code]

Ainsi, la suite du shader accumule naturellement la lumière interactive par dessus la lumière déterministe que l'on vient de reconstituer, et on obtien le résultat suivant :

[code]

### 3. Denoising
Si on regarde de près, on peut voir que les ombres déterministes ne sont pas très précises.

[ombre floue]

Quand on regarde les maps générées par blender, on comprend vite pourquoi.

[blender maps]

"Garbage in => garbage out !". Il n'y a pas de miracle, si vos données d'entrées ne sont pas propres, aucune chance d'avoir quelque chose de bien en sortie.

**Mais pourquoi Blender fait un rendu tout flou d'abord ?**

Et bien c'est parfaitement normal. Toutes les images générées par ray tracing sont bruitées. Si on veut de la netteté, il faut les denoiser. Biensure, Blender est capable de faire ça. Il ne le fait simplement pas par defaut.

[blender denoise]

Il suffit d'utiliser le boeud `Denoiser` dans le `Compositeur` et le tour est joué.

[blender maps denoisées]

Evidement le denoising augment le temps de rendu. Mais c'est le prix pour avoir un rendu bien net.

[ombre net]

### 4. Double exposition
Le resultat actuel est plutôt pas mal. Mais si vous avez l'oeil, vous aurez surement remarqué que la lumière déterministe est un peu sur vitaminée. En effet, elle brûle un peu ce qui se trouve à son voisinage direct.

[godot det light burn]

Là raison est simple. Notre shader actuel ne fait pas de distinction selon type de lumière lors de l'accumulation des contributions. Pour un pixel interactif c'est exactement ce qu'on veut. En effet, les contributions déterministes doivent bien affecter les eléments interactifs. Mais pous un pixels déterministe, c'est un probleme. La contribution a déjà été prise en compte lors de l'initialisation de `diffuse_contrib` et `specular_contrib` avec les maps d'illumination haute qualité de Blender. Avec l'ac

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