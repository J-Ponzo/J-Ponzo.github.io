+++
author = 'Turbo Tartine'
date = '2025-10-08T12:54:28+02:00'
title = "OpenRE devlog 5 : Fusion des mondes. Part II"
description = 'devlog 5 du projet OpenRE'
+++

[⬅️ Vers Précédent : "OpenRE devlog 4 : Fusion des mondes. Part I"](projects/open_re_poc_devlog_4)

## I. Introduction

Bienvenue dans cette deuxième partie de "Fusion des mondes" ! Le mois dernier, nous avions mélangé de la géométrie interactive à de la géométrie déterministe en nous basant sur les textures de profondeur. Nous avions ensuite éclairé tout ça avec une point light interactive qui clignotait en orbitant autour de la scène. L'implémentation de l'éclairage était basée uniquement sur la distance.

Aujourd’hui, nous allons :

* Enrichir le modèle d’illumination en prenant en compte l’orientation des surfaces
* Calculer la lumière déterministe dans Blender et l’intégrer à notre scène

## II. Le modèle de Lambert

Le modèle de Lambert décrit des surfaces purement diffuses, c’est-à-dire qui renvoient la lumière de manière égale dans toutes les directions. Cela signifie que la quantité de lumière en un point ne dépend pas de l’observateur, mais seulement de l’angle selon lequel le rayon frappe la surface.

C’est le modèle que nous nous proposons d’implémenter. D’abord parce qu’il est à peine plus compliqué que le précédent, mais surtout parce que, comme nous l’avons déjà évoqué, le G-Buffer interactif dont nous disposons ne possède pas encore les données nécessaires au calcul de la composante spéculaire.

### 1. Principe

L’intensité apparente varie donc selon l’angle d’incidence de la lumière. Une façon de se représenter le phénomène est d’imaginer un faisceau lumineux parfaitement vertical éclairant une surface parfaitement horizontale.

Le cercle dans lequel les photons percutent la surface coïncide alors avec la section du faisceau. Autrement dit :

<div style="text-align:center;">

« Soient `dL` le diamètre du faisceau et `dG` le diamètre du cercle projeté, on a : `dL = dG` »

</div>  
<br/>

<img alt="Schéma d'un faisceau de lumière éclairant un plan orthogonal. Le projeté de sa section au sol est circulaire" src="./images/circle_ray.opti.webp" style="width:66%; display: block; margin-left: auto; margin-right: auto;" />

Si maintenant le faisceau est incliné, `dG` s’étire, transformant notre cercle projeté en une ellipse. L’aire de cette ellipse est évidemment plus grande que celle du cercle, alors que la quantité de photons émis, elle, reste la même. Ce qui se traduit par une baisse de la concentration lumineuse.

![Schéma d'un faisceau de lumière rasant éclairant le même plan. Le projeté de sa section au sol est une ellipse](images/elipse_ray.opti.webp)

La décroissance de l’intensité lumineuse est donc proportionnelle à la croissance de l’aire de l’ellipse, elle-même fonction de l’angle d’incidence du faisceau. En posant tout cela, on peut déduire la fameuse loi du cosinus de Lambert, laquelle décrit `I`, l’intensité lumineuse perçue, comme :

<div style="text-align:center;">

`I = I0 * cos(angle)`

(avec `I0` l’intensité de la source)

</div> 

Que l’on peut aussi écrire :

<div style="text-align:center;">

`I = I0 * (N.L)`

(avec `N` la normale à la surface et `L` l'inverse de la direction de la lumière)

</div> 

En gros, Lambert, c’est basiquement multiplier votre lumière par `(N.L)`.

### 2. Implémentation

En relisant le numéro précédent, je me suis rendu compte que les échantillons de code commençaient à être un peu longs. J’avais déjà du mal à les resituer dans la globalité, alors je n’ose pas imaginer la galère pour quelqu’un qui ne les a pas écrits.

Dans cette partie II, on va continuer d’en rajouter, et j’avais peur que ça devienne vraiment illisible. J’ai donc passé un peu de temps à développer une technologie révolutionnaire qui recontextualise l’échantillon dans le code complet sous simple pression d’un bouton (rigolez pas, je suis pas dev web, j’ai mis ma vie pour faire ça, alors il fallait que j’en parle 😅). En tout cas, j’espère que ça aidera à la lecture.

Bref, voici les ajouts nécessaires à l’implémentation du modèle lambertien. Comme toujours, on va décortiquer ça pas à pas.

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

Pour calculer l’angle d’incidence de la lumière, on va avoir besoin des normales (cette fois, c’est pas une blague, on va vraiment les utiliser ^^).
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

On introduit donc les *uniforms* `i_normal_map` et `d_normal_map`, qui proviennent respectivement des G-Buffers interactif et déterministe.

#### 1.2. Échantillonnage des normales

Ensuite, on échantillonne et on harmonise tout ça comme on l’a fait pour les autres *maps*.

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

#### 1.3. Sélection de la normale

Puis on sélectionne la normale du monde visible, toujours en nous basant sur la profondeur.

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

Et enfin, on applique le terme lambertien `NdotL` à notre calcul de l’illumination.

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

Si `NdotL` est négatif, cela indique que la [face](/pages/glossary/#face) n’est pas exposée à la lumière (c’est-à-dire que les rayons la frappent “par l’arrière”). Mais sommer une valeur négative produirait un effet “d’absorption” de la lumière déjà accumulée. Ce n’est pas ce qu’on veut, c’est pourquoi on *clamp* `NdotL`.

#### 1.5. Résultat

Cette implémentation nous donne un meilleur sens du relief grâce à un éclairage plus nuancé et aux *self shadows* qui se dessinent sur les faces non exposées.

{{< rawhtml >}}

<video width="100%" controls muted loop playsinline autoplay>
    <source src="videos/lambert.mp4" type="video/mp4">
    Your browser does not support the video tag.  
</video>

{{< /rawhtml >}}

Les ombres sont un peu *sharp* pour l’instant, ce qui ne rend pas très naturel. Dans la vraie vie, quand un rayon de lumière percute une surface, certains photons rebondissent et vont s’écraser ailleurs. On parle alors de lumière indirecte.

Contrairement à la lumière directe, qui voyage en ligne droite, la lumière indirecte peut contourner les obstacles par rebonds successifs. Ainsi, elle peut affecter n’importe quelle surface, notamment les faces non exposées. Son intensité est plus faible, car on perd de l’énergie à chaque rebond (tous les photons ne sont pas réfléchis). Mais c’est grâce à elle que, dans la réalité, les ombres ne sont jamais complètement noires.

<img alt="Schéma illustrant la différence entre lumière directe et indirecte" src="./images/direct_indirect.opti.webp" style="width:66%; display: block; margin-left: auto; margin-right: auto;" /> 

Notez que nos lumières déterministes ne sont pas sujettes à ce problème de noirceur des ombres, car elles prennent justement en compte l’éclairage indirect. C’est un des aspects qui les rend si intéressantes, malgré le fait qu’on ne puisse pas les déplacer comme on veut. Voyons comment ça fonctionne.

## III. Lumière déterministe

Avant toute chose, pour pouvoir calculer de la lumière déterministe, on va avoir besoin… d’une lumière déterministe ! Il faut donc ajouter une *point light* à notre scène Blender.

[![Capture d’écran de Blender montrant la scène avec une light en plus](images/blender_point_light.opti.webp)](images/blender_point_light.opti.webp)

Cette *point light* sera automatiquement réimportée dans la scène Godot par la magie de l’interopérabilité entre les deux logiciels. Mais il faudra tout de même l’assigner aux *uniforms* correspondants de notre *shader* pour qu’il puisse la prendre en compte (vous vous souvenez ? les trois tableaux de taille fixe un peu *overkill* de la partie I ?). Sans cela, elle ne pourra pas éclairer les pixels interactifs.

D’ailleurs, c’est le moment de déterrer le tableau récapitulatif de l’article principal pour nous remettre au point sur les différents cas :

<style>
table th:first-of-type {
    width: 10%;
}
table th:nth-of-type(2) {
    width: 50%;
}
table th:nth-of-type(3) {
    width: 30%;
}
th, td {
  border: 3px solid grey !important;
}
</style>

|                          |    Pixel Déterministe   | Pixel Interactif |
| ------------------------ | :---------------------: | :--------------: |
| **Lumière Déterministe** |        Précalculé       |    Temps réel    |
| **Lumière Interactive**  | Précalculé + Temps réel |    Temps réel    |

Le [*shader*](/pages/glossary/#shader) actuel n’accumule pour l’instant que la partie temps réel de chaque lumière. Pour compléter le tableau, il va donc falloir précalculer la partie déterministe dans Blender, et l’appliquer aux pixels déterministes.

### 1. Génération des textures d’illumination

Comme à chaque fois qu’on touche à Blender, on va activer de nouvelles passes et modifier le *compositor* pour générer de nouvelles *maps* afin d’enrichir notre G-Buffer déterministe. Cette fois-ci, les passes Cycles qui nous intéressent sont au nombre de cinq :

* *diffuse direct*
* *diffuse indirect*
* *glossy direct*
* *glossy indirect*
* *glossy color*

Techniquement, la *diffuse color* nous intéresse aussi, mais il se trouve qu’on l’a déjà (souvenez-vous, c’est notre albédo).

De là, vous connaissez la musique :

* On active les passes dans le panneau latéral
* On ajoute les *pins* nécessaires au nœud `File Output`
* On relie les sorties de chaque passe aux *pins* correspondants, et on appuie sur `F12` pour lancer le rendu

[![Capture d’écran montrant comment activer les passes d’illumination de Cycles](images/blender_passes.opti.webp)](images/blender_passes.opti.webp)

Petit point vocabulaire pour bien comprendre à quoi correspondent toutes ces données :

* **diffuse :** correspond à la composante diffuse de la lumière
* **glossy :** correspond à la composante spéculaire de la lumière
* **direct :** contribution des rayons de première visibilité (lumière directe)
* **indirect :** contribution des rebonds successifs (lumière indirecte)

En gros, plutôt que de nous donner directement l’accumulation totale de toutes les contributions lumineuses de la scène, Blender les regroupe par paquet et nous laisse le soin de les recombiner comme on veut. Ce qui donne à l’utilisateur une plus grande liberté artistique.

Je ne sais pas encore si on aura l’utilité de ce découpage dans OpenRE. Dans le doute, on le garde pour se laisser l’opportunité d’expérimenter plus tard. Mais si on ne s’en sert pas, il faudra bien sûr recomposer tout ça directement dans Blender avant export. On ne va pas se trimballer cinq textures quand on peut n’en manipuler qu’une seule.

### 2. Intégration au shader

C’est maintenant une habitude : voici, d’un bloc, la totalité des ajouts que l’on s’apprête à détailler. L’objectif ici est que notre *shader* soit en capacité de gérer la lumière déterministe que l’on vient de générer.

{{< togglecode >}}
```glsl {#code-compact hl_lines=[7,8,9,10,11 , 16,17,18,19,20 , 30,31,32,33]}
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

```glsl {#code-full .hidden hl_lines=[29,30,31,32,33 , 44,45,46,47,48 , 74,75,76,77]}
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
uniform sampler2D d_diff_dir_map : filter_nearest;
uniform sampler2D d_diff_ind_map : filter_nearest;
uniform sampler2D d_gloss_color_map : filter_nearest;
uniform sampler2D d_gloss_dir_map : filter_nearest;
uniform sampler2D d_gloss_ind_map : filter_nearest;

void fragment() {
	// SAMPLE G-BUFFERs
	vec3 i_depth_frag = texture(i_depth_map, SCREEN_UV).rgb;
	vec3 i_albedo_frag = texture(i_albedo_map, SCREEN_UV).rgb;
	vec3 i_normal_frag = texture(i_normal_map, SCREEN_UV).rgb;
	
	vec3 d_depth_frag = texture(d_depth_map, SCREEN_UV).rgb;
	vec3 d_diffuse_color_frag = texture(d_diffuse_color_map, SCREEN_UV).rgb;
	vec3 d_normal_frag = texture(d_normal_map, SCREEN_UV).rgb;
	vec3 d_diff_dir_frag = texture(d_diff_dir_map, SCREEN_UV).rgb;
	vec3 d_diff_ind_frag = texture(d_diff_ind_map, SCREEN_UV).rgb;
	vec3 d_gloss_color_frag = texture(d_gloss_color_map, SCREEN_UV).rgb;
	vec3 d_gloss_dir_frag = texture(d_gloss_dir_map, SCREEN_UV).rgb;
	vec3 d_gloss_ind_frag = texture(d_gloss_ind_map, SCREEN_UV).rgb;
	
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
		
		vec3 d_diff_light = d_diff_dir_frag + d_diff_ind_frag;
		vec3 d_gloss_light = d_gloss_dir_frag + d_gloss_ind_frag;
		diffuse_contrib += d_diffuse_color_frag * d_diff_light;
		specular_contrib += d_gloss_color_frag * d_gloss_light;
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

#### 2.1. Introduction des *maps* déterministes

On doit bien sûr lui donner les textures via des *uniforms*.

{{< togglecode >}}
```glsl {#code-compact hl_lines=[3,4,5,6,7]}
// DETERMINIST G-BUFFER
...
uniform sampler2D d_diff_dir_map : filter_nearest;
uniform sampler2D d_diff_ind_map : filter_nearest;
uniform sampler2D d_gloss_color_map : filter_nearest;
uniform sampler2D d_gloss_dir_map : filter_nearest;
uniform sampler2D d_gloss_ind_map : filter_nearest;

...
```

```glsl {#code-full .hidden hl_lines=[29,30,31,32,33]}
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
uniform sampler2D d_diff_dir_map : filter_nearest;
uniform sampler2D d_diff_ind_map : filter_nearest;
uniform sampler2D d_gloss_color_map : filter_nearest;
uniform sampler2D d_gloss_dir_map : filter_nearest;
uniform sampler2D d_gloss_ind_map : filter_nearest;

void fragment() {
	// SAMPLE G-BUFFERs
	vec3 i_depth_frag = texture(i_depth_map, SCREEN_UV).rgb;
	vec3 i_albedo_frag = texture(i_albedo_map, SCREEN_UV).rgb;
	vec3 i_normal_frag = texture(i_normal_map, SCREEN_UV).rgb;
	
	vec3 d_depth_frag = texture(d_depth_map, SCREEN_UV).rgb;
	vec3 d_diffuse_color_frag = texture(d_diffuse_color_map, SCREEN_UV).rgb;
	vec3 d_normal_frag = texture(d_normal_map, SCREEN_UV).rgb;
	vec3 d_diff_dir_frag = texture(d_diff_dir_map, SCREEN_UV).rgb;
	vec3 d_diff_ind_frag = texture(d_diff_ind_map, SCREEN_UV).rgb;
	vec3 d_gloss_color_frag = texture(d_gloss_color_map, SCREEN_UV).rgb;
	vec3 d_gloss_dir_frag = texture(d_gloss_dir_map, SCREEN_UV).rgb;
	vec3 d_gloss_ind_frag = texture(d_gloss_ind_map, SCREEN_UV).rgb;
	
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
		
		vec3 d_diff_light = d_diff_dir_frag + d_diff_ind_frag;
		vec3 d_gloss_light = d_gloss_dir_frag + d_gloss_ind_frag;
		diffuse_contrib += d_diffuse_color_frag * d_diff_light;
		specular_contrib += d_gloss_color_frag * d_gloss_light;
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

#### 2.2. Échantillonnage des *maps* déterministes

Ensuite, on échantillonne ces textures de la même manière que les autres. Mais cette fois-ci, il n’y a pas d’harmonisation à effectuer, car ces données sont exclusives au monde déterministe.

{{< togglecode >}}
```glsl {#code-compact hl_lines=[6,7,8,9,10]}
...

void fragment() {
	// SAMPLE G-BUFFERs
	...
	vec3 d_diff_dir_frag = texture(d_diff_dir_map, SCREEN_UV).rgb;
	vec3 d_diff_ind_frag = texture(d_diff_ind_map, SCREEN_UV).rgb;
	vec3 d_gloss_color_frag = texture(d_gloss_color_map, SCREEN_UV).rgb;
	vec3 d_gloss_dir_frag = texture(d_gloss_dir_map, SCREEN_UV).rgb;
	vec3 d_gloss_ind_frag = texture(d_gloss_ind_map, SCREEN_UV).rgb;
	...
```

```glsl {#code-full .hidden hl_lines=[44,45,46,47,48]}
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
uniform sampler2D d_diff_dir_map : filter_nearest;
uniform sampler2D d_diff_ind_map : filter_nearest;
uniform sampler2D d_gloss_color_map : filter_nearest;
uniform sampler2D d_gloss_dir_map : filter_nearest;
uniform sampler2D d_gloss_ind_map : filter_nearest;

void fragment() {
	// SAMPLE G-BUFFERs
	vec3 i_depth_frag = texture(i_depth_map, SCREEN_UV).rgb;
	vec3 i_albedo_frag = texture(i_albedo_map, SCREEN_UV).rgb;
	vec3 i_normal_frag = texture(i_normal_map, SCREEN_UV).rgb;
	
	vec3 d_depth_frag = texture(d_depth_map, SCREEN_UV).rgb;
	vec3 d_diffuse_color_frag = texture(d_diffuse_color_map, SCREEN_UV).rgb;
	vec3 d_normal_frag = texture(d_normal_map, SCREEN_UV).rgb;
	vec3 d_diff_dir_frag = texture(d_diff_dir_map, SCREEN_UV).rgb;
	vec3 d_diff_ind_frag = texture(d_diff_ind_map, SCREEN_UV).rgb;
	vec3 d_gloss_color_frag = texture(d_gloss_color_map, SCREEN_UV).rgb;
	vec3 d_gloss_dir_frag = texture(d_gloss_dir_map, SCREEN_UV).rgb;
	vec3 d_gloss_ind_frag = texture(d_gloss_ind_map, SCREEN_UV).rgb;
	
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
		
		vec3 d_diff_light = d_diff_dir_frag + d_diff_ind_frag;
		vec3 d_gloss_light = d_gloss_dir_frag + d_gloss_ind_frag;
		diffuse_contrib += d_diffuse_color_frag * d_diff_light;
		specular_contrib += d_gloss_color_frag * d_gloss_light;
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

#### 2.3. Reconstitution de la lumière déterministe

Ici, nous allons initialiser les variables `diffuse_contrib` et `specular_contrib` selon la formule indiquée dans la documentation de Blender.

[![Schéma issu de la documentation de Blender indiquant comment reconstituer les maps des différentes passes](images/blender_compo_formula.opti.webp)](images/blender_compo_formula.opti.webp)

Comme le disait le tableau récapitulatif, la lumière déterministe générée dans Blender ne s’applique pas aux fragments interactifs. C’est la raison pour laquelle on initialise les variables dans le `else` du bloc de sélection des données.

{{< togglecode >}}
```glsl {#code-compact hl_lines=[13,14,15,16]}
...

void fragment() {
	...
	
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
}
```

```glsl {#code-full .hidden hl_lines=[74,75,76,77]}
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
uniform sampler2D d_diff_dir_map : filter_nearest;
uniform sampler2D d_diff_ind_map : filter_nearest;
uniform sampler2D d_gloss_color_map : filter_nearest;
uniform sampler2D d_gloss_dir_map : filter_nearest;
uniform sampler2D d_gloss_ind_map : filter_nearest;

void fragment() {
	// SAMPLE G-BUFFERs
	vec3 i_depth_frag = texture(i_depth_map, SCREEN_UV).rgb;
	vec3 i_albedo_frag = texture(i_albedo_map, SCREEN_UV).rgb;
	vec3 i_normal_frag = texture(i_normal_map, SCREEN_UV).rgb;
	
	vec3 d_depth_frag = texture(d_depth_map, SCREEN_UV).rgb;
	vec3 d_diffuse_color_frag = texture(d_diffuse_color_map, SCREEN_UV).rgb;
	vec3 d_normal_frag = texture(d_normal_map, SCREEN_UV).rgb;
	vec3 d_diff_dir_frag = texture(d_diff_dir_map, SCREEN_UV).rgb;
	vec3 d_diff_ind_frag = texture(d_diff_ind_map, SCREEN_UV).rgb;
	vec3 d_gloss_color_frag = texture(d_gloss_color_map, SCREEN_UV).rgb;
	vec3 d_gloss_dir_frag = texture(d_gloss_dir_map, SCREEN_UV).rgb;
	vec3 d_gloss_ind_frag = texture(d_gloss_ind_map, SCREEN_UV).rgb;
	
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
		
		vec3 d_diff_light = d_diff_dir_frag + d_diff_ind_frag;
		vec3 d_gloss_light = d_gloss_dir_frag + d_gloss_ind_frag;
		diffuse_contrib += d_diffuse_color_frag * d_diff_light;
		specular_contrib += d_gloss_color_frag * d_gloss_light;
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

Ainsi, la suite du *shader* accumule naturellement la lumière temps réel par-dessus la lumière précalculée que l’on vient de reconstituer, et on obtient le résultat suivant :

{{< rawhtml >}}

<video width="100%" controls muted loop playsinline autoplay>
    <source src="videos/burned_noise.mp4" type="video/mp4">
    Your browser does not support the video tag.  
</video>

{{< /rawhtml >}}

### 3. Denoising

Quand on regarde tout ça de près, on peut voir que le rendu n’est pas très propre.

[![Capture zoomée de la scène, mettant en évidence le bruit de l’image](images/det_noise_zoom.opti.webp)](images/det_noise_zoom.opti.webp)

Si on s’intéresse aux *maps* d’indirect générées par Blender, on comprend vite pourquoi.

[![Capture zoomée mettant en évidence le bruit sur les images d’origine “Diffuse Indirect” et “Glossy Indirect”](images/noise_indirect.webp)](images/noise_indirect.webp)

*"Garbage in ⇒ garbage out !"*
Il n’y a pas de miracle : si vos données d’entrée sont sales, aucune chance d’obtenir quelque chose de propre en sortie.

**Mais pourquoi Blender fait des rendus tout dégueux, d’abord ?**

Eh bien, en fait, c’est normal. Toutes les images générées par *path tracing* sont bruitées, et c’est ainsi que sont produites les *maps* d’indirect. Si on veut de la netteté, il faut les *denoiser*. Blender en est bien sûr capable, il ne le fait simplement pas par défaut.

[![Capture du compositeur de Blender auquel on a ajouté les nœuds Denoise](images/blender_denoise_node.opti.webp)](images/blender_denoise_node.opti.webp)

Il suffit d’utiliser le nœud `Denoise` dans le `Compositor` et le tour est joué.

[![Capture zoomée mettant en évidence l’absence de bruit après denoising dans Blender](images/denoised_indirect.webp)](images/denoised_indirect.webp)

Évidemment, le *denoising* augmente le temps de rendu. Mais c’est le prix à payer pour obtenir une image de qualité.

[![Capture zoomée de la scène, mettant en évidence l’absence de bruit](images/det_denoise_zoom.opti.webp)](images/det_denoise_zoom.opti.webp)

### 4. Double exposition

Le résultat actuel est plutôt pas mal.
Mais si vous avez l’œil, vous aurez sûrement remarqué que la lumière déterministe est quelque peu survitaminée.

La raison est simple : notre *shader* ne fait pas de distinction selon les types de lumière ou de pixel lors de l’accumulation des contributions. Il applique la lumière temps réel partout. Si j’avais relu mon tableau récapitulatif lors de l’implémentation, j’aurais pu anticiper que dans le cas *“lumière déterministe sur pixel déterministe”*, seule la lumière précalculée doit être considérée.

|                          |      Pixel Déterministe      | Pixel Interactif |
| ------------------------ | :--------------------------: | :--------------: |
| **Lumière Déterministe** | **===>** Précalculé **<===** |    Temps Réel    |
| **Lumière Interactive**  |    Précalculé + Temps Réel   |    Temps Réel    |

*Récapitulation du tableau récapitulatif.*

C’est logique, dans la mesure où la partie précalculée, c’est justement la lumière déterministe accumulée par Blender dans les *maps* d’illumination. Si on l’accumule une deuxième fois gratuitement en temps réel, forcément, ça patate un peu fort.

[![Capture zoomée de la scène, mettant en évidence l’intensité trop forte de la lumière qui brûle l’image](images/det_burned_zoom.opti.webp)](images/det_burned_zoom.opti.webp)

Le *shader* a donc besoin de savoir à quel monde appartiennent les lumières qu’il traite.
On lui transmet cette information à travers un nouvel *uniform* `plight_isInteractive`, dont il se sert pour filtrer le cas problématique.


{{< togglecode >}}
```glsl {#code-compact hl_lines=[5,18,19]}
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

```glsl {#code-full .hidden hl_lines=[19,90,91]}
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
uniform bool plight_isInteractive[8];

// INTERACTIVE G-BUFFER
uniform sampler2D i_depth_map : filter_nearest;
uniform sampler2D i_albedo_map : filter_nearest;
uniform sampler2D i_normal_map : filter_nearest;

// DETERMINIST G-BUFFER
uniform sampler2D d_depth_map : filter_nearest;
uniform sampler2D d_diffuse_color_map : filter_nearest;
uniform sampler2D d_normal_map : filter_nearest;
uniform sampler2D d_diff_dir_map : filter_nearest;
uniform sampler2D d_diff_ind_map : filter_nearest;
uniform sampler2D d_gloss_color_map : filter_nearest;
uniform sampler2D d_gloss_dir_map : filter_nearest;
uniform sampler2D d_gloss_ind_map : filter_nearest;

void fragment() {
	// SAMPLE G-BUFFERs
	vec3 i_depth_frag = texture(i_depth_map, SCREEN_UV).rgb;
	vec3 i_albedo_frag = texture(i_albedo_map, SCREEN_UV).rgb;
	vec3 i_normal_frag = texture(i_normal_map, SCREEN_UV).rgb;
	
	vec3 d_depth_frag = texture(d_depth_map, SCREEN_UV).rgb;
	vec3 d_diffuse_color_frag = texture(d_diffuse_color_map, SCREEN_UV).rgb;
	vec3 d_normal_frag = texture(d_normal_map, SCREEN_UV).rgb;
	vec3 d_diff_dir_frag = texture(d_diff_dir_map, SCREEN_UV).rgb;
	vec3 d_diff_ind_frag = texture(d_diff_ind_map, SCREEN_UV).rgb;
	vec3 d_gloss_color_frag = texture(d_gloss_color_map, SCREEN_UV).rgb;
	vec3 d_gloss_dir_frag = texture(d_gloss_dir_map, SCREEN_UV).rgb;
	vec3 d_gloss_ind_frag = texture(d_gloss_ind_map, SCREEN_UV).rgb;
	
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
		
		vec3 d_diff_light = d_diff_dir_frag + d_diff_ind_frag;
		vec3 d_gloss_light = d_gloss_dir_frag + d_gloss_ind_frag;
		diffuse_contrib += d_diffuse_color_frag * d_diff_light;
		specular_contrib += d_gloss_color_frag * d_gloss_light;
	}
	
	// WORLD POSITION FROM DEPTH
	vec3 ndc = vec3((SCREEN_UV * 2.0) - 1.0, depth_frag);
	vec4 clip = vec4(ndc, 1.0);
	vec4 world = INV_VIEW_MATRIX * INV_PROJECTION_MATRIX * clip;
	world.xyz /= world.w;
	vec3 frag_position = world.xyz;
	
	// ACCUMULATE LIGHT CONTRIBUTIONS
	for(int i = 0; i < nb_plights; i++) {
		if(!is_frag_interactive && !plight_isInteractive[i])
			continue;
		
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

Ce qui nous laisse avec ce magnifique rendu :

{{< rawhtml >}}

<video width="100%" controls muted loop playsinline autoplay>
    <source src="videos/final.mp4" type="video/mp4">
    Your browser does not support the video tag.  
</video>

{{< /rawhtml >}}

## IV. Conclusion

On commence à arriver sur quelque chose de convaincant.
Sur la partie temps réel, le modèle de Lambert est certes un peu léger en comparaison de ce qui se fait aujourd’hui. Mais sans spéculaire, on ne peut malheureusement pas faire beaucoup mieux. C’est pourquoi, dans le prochain épisode, on s’attaquera à l’harmonisation de l’ORM en vue de l’implémentation d’un modèle PBR.

Ceci étant dit, je trouve que même en l’état, Lambert ne s’en sort pas trop mal dès lors qu’on y ajoute la lumière déterministe précalculée. On a déjà de la spéculaire, de la lumière indirecte, et on se paie même le luxe d’une superbe ombre portée (qui ignore la géométrie interactive, oui, ça va, je sais...).

Les deux mondes ne sont pas totalement indiscernables, mais il faut quand même regarder la scène de près pour voir la supercherie. Il faudra bien sûr confirmer cela sur une scène un peu plus réaliste, mais c’est assez prometteur.

Ainsi s’achève cette première mise en application des principes d’OpenRE. Je suis content de pouvoir enfin vous montrer quelques résultats (après six numéros répartis sur six mois, il était temps héhé).
Mais on a encore pas mal de sujets à couvrir dans ce POC avant de passer au SDK. J’espère que ça vous plaît toujours. En tout cas, ça me fait très plaisir de voir que plusieurs personnes suivent l’aventure.

Salut à vous, merci d’être là, et à bientôt 👋
