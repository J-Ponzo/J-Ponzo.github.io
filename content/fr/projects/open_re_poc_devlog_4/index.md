+++
author = 'Turbo Tartine'
date = '2025-08-28T08:43:37+02:00'
draft = true
title = "OpenRE devlog 4 : Fusion des mondes"
description = 'devlog 4 du projet OpenRE'
+++

[⬅️ Vers Précédent : "OpenRE devlog 3 : Harmonisation des normales"](projects/open_re_poc_devlog_3)

## I. Introduction

## II. Géométrie interactive

```glsl
// USUAL GODOT POST-PROCESS CODE
shader_type spatial;
render_mode unshaded, fog_disabled;

void vertex() {
	POSITION = vec4(VERTEX.xy, 1.0, 1.0);
}

// HELPER FUNCTIONS FROM THE ORACLE
#include "pre_process_utils.gdshaderinc"

// SCENE UNIFORMS
uniform float eye_near;
uniform float eye_far;

// INTERACTIVE G-BUFFER
uniform sampler2D i_depth_map : filter_nearest;
uniform sampler2D i_albedo_map : filter_nearest;

// DETERMINIST G-BUFFER
uniform sampler2D d_depth_map : filter_nearest;
uniform sampler2D d_diffuse_color_map : filter_nearest;

void fragment() {
	// SAMPLE DETERMINIST G-BUFFER
	vec3 i_depth_frag = texture(i_depth_map, SCREEN_UV).rgb;
	i_depth_frag = pre_process_i_depth(i_depth_frag);
	vec3 i_albedo_frag = texture(i_albedo_map, SCREEN_UV).rgb;
	
	// SAMPLE INTERACTIVE G-BUFFER
	vec3 d_depth_frag = texture(d_depth_map, SCREEN_UV).rgb;
	d_depth_frag = pre_process_d_depth(d_depth_frag, eye_near, eye_far);
	vec3 d_diffuse_color_frag = texture(d_diffuse_color_map, SCREEN_UV).rgb;
	
	// SELECT DATA (according to depth)
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

## III. Lumière intéractive
blabla roto-lumière qui clignote

### 1. "Distance-only" lighting
```glsl
// USUAL GODOT POST-PROCESS CODE
...

// HELPER FUNCTIONS FROM THE ORACLE
...

// SCENE UNIFORMS
...
uniform vec3 eye_position;

uniform int nb_plights;
uniform vec3 plight_position[8];
uniform vec3 plight_color[8];
uniform float plight_intensity[8];

// INTERACTIVE G-BUFFER
...

// DETERMINIST G-BUFFER
...

void fragment() {
	// SAMPLE DETERMINIST G-BUFFER
	...
	
	// SAMPLE INTERACTIVE G-BUFFER
	...
	
	vec3 diffuse_contribution = vec3(0.0);
	vec3 specular_contribution = vec3(0.0);
	
	// SELECT DATA (according to depth)
	...
	
	// GET WORLD POSITION FROM
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
		diffuse_contribution += C * I * albedo_frag * attenuation;
		//specular_contribution += NOT IMPLEMENTED YET
	}
	
	// FINAL FRAGMENT COLOR
	ALBEDO = diffuse_contribution + specular_contribution;
}
```

### 2. Lambertian lighting
```glsl
// USUAL GODOT POST-PROCESS CODE
...

// HELPER FUNCTIONS FROM THE ORACLE
...

// SCENE UNIFORMS
...

// INTERACTIVE G-BUFFER
...
uniform sampler2D i_normal_map : filter_nearest;

// DETERMINIST G-BUFFER
...
uniform sampler2D d_normal_map : filter_nearest;

void fragment() {
	// SAMPLE DETERMINIST G-BUFFER
	...
	vec3 i_normal_frag = texture(i_normal_map, SCREEN_UV).rgb;
	i_normal_frag = pre_process_i_normal(i_normal_frag, INV_VIEW_MATRIX);
	
	// SAMPLE INTERACTIVE G-BUFFER
	...
	vec3 d_normal_frag = texture(d_normal_map, SCREEN_UV).rgb;
	d_normal_frag = pre_process_d_normal(d_normal_frag);
	
	// SELECT DATA (according to depth)
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
	
	// GET WORLD POSITION FROM
	...
	
	// ACCUMULATE LIGHT CONTRIBUTIONS
	for(int i = 0; i < nb_plights; i++) {
		...

		...
		float NdotL = max(dot(normal_frag, L), 0.0);
		diffuse_contribution += NdotL * C * I * albedo_frag * attenuation;
		//specular_contribution += NOT IMPLEMENTED YET
	}
	
	// FINAL FRAGMENT COLOR
	ALBEDO = diffuse_contribution + specular_contribution;
}
```

## IV. Lumière déterministe

### 1. Generation des textures d'illumination

### 2. Intégration au compositor
```glsl
// USUAL GODOT POST-PROCESS CODE
...

// HELPER FUNCTIONS FROM THE ORACLE
...

// SCENE UNIFORMS
...

// INTERACTIVE G-BUFFER
...

// DETERMINIST G-BUFFER
...
uniform sampler2D d_diffuse_direct_map : filter_nearest;
uniform sampler2D d_diffuse_indirect_map : filter_nearest;
uniform sampler2D d_glossy_color_map : filter_nearest;
uniform sampler2D d_glossy_direct_map : filter_nearest;
uniform sampler2D d_glossy_indirect_map : filter_nearest;

void fragment() {
	// SAMPLE DETERMINIST G-BUFFER
	...
	
	
	// SAMPLE INTERACTIVE G-BUFFER
	...
	vec3 d_diffuse_direct_frag = texture(d_diffuse_direct_map, SCREEN_UV).rgb;
	vec3 d_diffuse_indirect_frag = texture(d_diffuse_indirect_map, SCREEN_UV).rgb;
	vec3 d_glossy_color_frag = texture(d_glossy_color_map, SCREEN_UV).rgb;
	vec3 d_glossy_direct_frag = texture(d_glossy_direct_map, SCREEN_UV).rgb;
	vec3 d_glossy_indirect_frag = texture(d_glossy_indirect_map, SCREEN_UV).rgb;
	
	// SELECT DATA (according to depth)
	...
	if(is_frag_interactive) {
		...
	}
	else {
		...
		vec3 d_diff_light = d_diffuse_direct_frag + d_diffuse_indirect_frag;
		vec3 d_gloss_light = d_glossy_direct_frag + d_glossy_indirect_frag;
		diffuse_contribution += d_diffuse_color_frag * d_diff_light;
		specular_contribution += d_glossy_color_frag * d_gloss_light;
	}
	
	// GET WORLD POSITION FROM
	...
	
	// ACCUMULATE LIGHT CONTRIBUTIONS
	...
	
	// FINAL FRAGMENT COLOR
	ALBEDO = diffuse_contribution + specular_contribution;
}
```

### 3. Denoising

### 4. Double exposition
```glsl
// USUAL GODOT POST-PROCESS CODE
...

// HELPER FUNCTIONS FROM THE ORACLE
...

// SCENE UNIFORMS
...
uniform bool plight_isInteractive[8];

// INTERACTIVE G-BUFFER
...

// DETERMINIST G-BUFFER
...

void fragment() {
	// SAMPLE DETERMINIST G-BUFFER
	...
	
	
	// SAMPLE INTERACTIVE G-BUFFER
	...
	
	// SELECT DATA (according to depth)
	...
	
	// GET WORLD POSITION FROM
	...
	
	// ACCUMULATE LIGHT CONTRIBUTIONS
	for(int i = 0; i < nb_plights; i++) {
		if(!is_frag_interactive && !plight_isInteractive[i])
			continue;
		...
	}
	
	// FINAL FRAGMENT COLOR
	ALBEDO = diffuse_contribution + specular_contribution;
}
```

## IV. Conclusion 