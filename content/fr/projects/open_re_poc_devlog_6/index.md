+++
author = 'Turbo Tartine'
date = '2025-11-02T09:37:24+01:00'
title = "OpenRE devlog 6 : Harmonisation de l'ORM"
description = 'devlog 6 du projet OpenRE'
draft = true
+++
[⬅️ Vers Précédent : "OpenRE devlog 5 : Fusion des mondes. Part II"](projects/open_re_poc_devlog_5)

## I. Introduction
Salut à tous !

Après les derniers épisodes consacrés à l’implémentation de l’éclairage, on va ressortir l’Oracle du placard pour faire un peu d’harmonisation.
Cette fois-ci, on va s’intéresser à l’ORM.

ORM est une convention qui définit dans quels canaux RGB sont rangées les informations suivantes :
- Red : (Ambient) **O**cclusion
- Green : **R**oughness
- Blue : **M**etallic

Il en existe d’autres variantes, mais j’ai l’impression qu'ORM est aujourd’hui la plus répandue.

Ces données vont nous permettre de mettre en œuvre un modèle d’illumination PBR.
Vous avez certainement déjà entendu ce terme, mais prenons un instant pour nous mettre au clair sur ce que c’est réellement.

## II. Quésaco PBR ?
PBR est l’acronyme de *Physically Based Rendering*. Il ne s’agit pas d’un modèle unique, mais plutôt d’une famille de modèles d’illumination. Ils ont en commun de s’inspirer de principes physiques pour garantir un certain niveau de cohérence visuelle et d’interopérabilité des materiaux.

Dans l’imaginaire collectif, PBR est souvent synonyme de réalisme et de qualité de rendu : "Regardez ! c'est *'Physically Based'* ! Ça veut dire c'est comme la vrai vie !".  
En réalité, on peut très bien faire du stylisé avec des modèles PBR. C’est d’ailleurs Disney qui a popularisé cette approche, avant que toute l’industrie ne s’y engouffre.

Il faut plutôt voir le PBR comme un standard de communication entre artistes et programmeurs graphiques. Avant lui, l’humanité savait déjà faire de très bons matériaux, mais ils étaient souvent instables. Ils pouvaient se comporter différement suivant le moteur, voir même parfois suivant la scène. Dans ces conditions, difficile de réutiliser les resources d'un projet à l'autre. Pire, les artistes doivent se réadapter à chaque changement de téchnologie. 

Je n'ai pas connu cette époque, mais j'imagine la perte de temps et d'énergie créatrive que ça représente. Pour moi, la qualité perçue du PBR vient moins d'une supériorité technique que de sa praticité. Si les artistes n’ont plus à retoucher sans cesse leurs matériaux pour compenser les bizarreries d’implémentation de chaque moteur et les spécificité d'une scène donnée, ça leur laisse plus de temps pour leur vrai métier : "faire des trucs cools".

## III. Génération des textures
Pour l'ORM on ne va pas pouvoir s'en sortir avec des passe Cycles standard et des screen textures prédéfinies par Godot comme on l'a fait jusqu'ici. On va devoir ruser en agissant directement sur les materiaux des 2 côté. 

C'est problématique, car ça veut dire que l'utilisateur ne pourra pas utiliser ses resources en l'état. Si il les créé lui même ce ne sera pas grand chose car la modification est simple. Mais si il utilise des pack ou des bibliothèques déjà existantes, ça peut vite devenir ingérable. 

Il faudra biensure travailler sur ça si on veut qu'OpenRE puisse être adopté. Mais c'est une question d'ergonomie et d'industrialisation de la techno plus que de faisabilité. C'est donc un combat pour plus tard (qui se gagnera surement à coup de scripts de migration livrés avec le SDK).

### 1. ORM déterministe
Côté Blender, on a la possiblité de créer des passes custom qu'ils appel des `AOV` pour *Arbitrary Output Variable*. Pour créer un AOV, il faut dérouler la section `Shader AOV` en dessous des passes. En cliquant sur le petit `+`, on ajoute une entrée que l'on va renommer `aov_orm`. Un pin du même nom apparait dans le noeud `Render Layers`. 

A partir de là peut traiter ce pin de sortie comme une passe classique et dérouler notre *process* habituel.
- on créé un pin `orm` dans le noeud `File Output`
- on relie le pin `aov_orm` de `Render Layers` au pin `orm` fraichement créé

[aov_orm_compositor_annot]

Maintenant, il faut definir la donnée qui va transiter à travers ce pin. Pour cela on va devoir ouvrir le `Workspace Shading` et éditer un par un les materiaux de chacuns des meshes de la scène. A chaque foins on va :
- Renseigner des valeurs différentes dans les champs `Metallic` et `Roughness` de `Principled BRDF` (parce que si on laisse les valeurs par défaut partout il n'y a pas grand chose à tester)
- Ajouter un noeud `AOV Outpout` avec le nom `aov_orm` et une couleur qui reprend exactement les information renseignées dans `Principled BRDF` au format ORM (donc la `Metallic` dans `Blue` et la `Roughness` dans `Green`)

Par exemple pour `Ceil` ça donne ça :

[aov_orm_ceil_mat_anot]

Petit récapitulatif des valeurs choisies. C'est majoritairement du hasard mis à part que j'ai pris soin de choisir 0.00 ou 1.00 pour la plupart des `metallic` car sur le papier, un materiau est soit métalique, soit dielectrique. Mais on utilise parfois des valeurs intermédiaire pour simuler certains effets (poussière, saleté...).

<style>
table th:first-of-type {
    width: 40%;
}
table th:nth-of-type(2) {
    width: 30%;
}
table th:nth-of-type(3) {
    width: 30%;
}
th, td {
  border: 3px solid grey !important;
}
</style>

|           						  |Metallic|Roughness|
| ------------------------------------- | :--: | :--: |
| Ceil 									| 1.00 | 0.90 |
| Ground								| 0.00 | 0.90 |
| Left									| 0.90 | 0.05 |
| Right									| 0.00 | 0.10 |
| Back									| 0.00 | 0.50 |
| BaseTorus (Purpule part of podium)	| 0.00 | 0.80 |
| BaseCylinder (Blue part of podium)	| 1.00 | 0.50 |

On a donc fait le nécessaire pour remplir les cannaux `Green` et `Blue` de notre ORM. Mais il nous reste le `Red` déstiné à acceuillir l'*Ambient Occlusion*. Cette donnée ne vient pas du materiau mais d'une passe Cycle officielle qu'il nous faut activer et combiner à notre AOV comme ceci :

[combine_ao_aov]

Et voila ! On a plus qu'à appuyer sur F12 pour lancer le rendu et on obtien une magnifique texture d'ORM déterministe :

[orm]

### 2. ORM interactive

Pour l'ORM intéractive, la technique va être de se servir des `camera layers` pour selectionner ce qu'on veut envoyer dans l'albedo. Ainsi nous auront un materiaux normal sur la plupart de layers, mais si une certaine layer est active (disons la 5), l'ORM se substitura à l'Albedo. 

De cette manière nous pourront créer un `Sub_Viewport` sur le même modèle que ce qu'on avait fait pour l'Albedo :
- `hint_screen_texture` affichée sur le quad
- `Debug Draw = Unshaded` sur le `Sub_Viewport`

Sauf que sous ce `Sub_Viewport`, le caméra et le quad seront sur la layer 5.

[gif setup SubViewport ORM]

On va donc créer un material custom. J'ai choisi d'utiliser un `Visual Shader` plutôt qu'un shader classique au cas où je n'arrive pas à une solution completement automatique pour la migration. Autant rester accessible à un maximum de profils et je sais que le glsl peut rebuter pas mal de monde.

Pour l'instant on se limitera à des `Vec3 Parameters` pour  definir :
- Albedo
- ORM
- Normales 

Pour la scène actuelle ça suffira car nous n'avons que des materiaux uniformement répartis sur toute la surface du mesh. Mais on va rapidement devoir supporter des textures pour pouvoir composer des scenes un peu plus convainquantes. On enchichira le shader en temps voulu mais en attendant il ressemble à ça :

[visual shader with metalic]

Toute la science est dans la partie encadrée en rouge : on verifie si la layer 5 de la caméra courante est activée, et on se sert de cette information pour switcher entre l'albedo et l'ORM. 

Maitenant que le materiau est prêt, on est bons pour le remplacer dans tous nos meshes en reglant chaque fois l'albedo et l'ORM à l'identique de ce qui est setup dans Blender. Une fois que c'est fait, on va pouvoir adapter l'Oracle pour qu'il prenne en compte nos maps d'ORM et commencer les réglages.

## IV. Réglages
Grâce au turbo widget d'affichage/masquage de code, je peux maintenant cesser d'eluder les modifications de l'orcle. Alors les voici !

{{< togglecode >}}
```glsl {#code-compact hl_lines=[5,8,11,12,13,14,18,19]}
...

// Data to check
...
#define ORM_TYPE 3

// Determinist & Interactive G-Buffer
const int NB_GMAPS = 4;
...

vec3 compute_orm_difference(vec3 d_frag, vec3 i_frag) {
	float dist = distance(d_frag, i_frag);
	return vec3(dist, dist, dist);
}

vec3 compute_difference(vec3 d_frag, vec3 i_frag) {
	...
	else if (data_type == ORM_TYPE)
		return compute_orm_difference(d_frag, i_frag);
	...
}

...
```

```glsl {#code-full .hidden hl_lines=[14,18,52,53,54,55,64,65]}
shader_type spatial;
render_mode unshaded, fog_disabled;

void vertex() {
	POSITION = vec4(VERTEX.xy, 1.0, 1.0);
}

const vec3 ERROR_COLOR = vec3(1.0, 0.0, 1.0);

// Data to check
#define ALBEDO_TYPE 0
#define DEPTH_TYPE 1
#define NORMAL_TYPE 2
#define ORM_TYPE 3
uniform int data_type = -1;

// Determinist & Interactive G-Buffer
const int NB_GMAPS = 4;
uniform sampler2D[NB_GMAPS] d_gbuffer : filter_nearest;
uniform sampler2D[NB_GMAPS] i_gbuffer : filter_nearest;

// Choix du mode d'affichage
#define I_D_DIFFERENCE 0
#define D_TEXTURE_ONLY 1
#define I_TEXTURE_ONLY 2
uniform int visualisation_mode = 0;

// Permutation des normales
#include "debug.gdshaderinc"
#include "pre_process_utils.gdshaderinc"
uniform int permut_idx = 0;

vec3 compute_albedo_difference(vec3 d_frag, vec3 i_frag) {
	float dist = distance(d_frag, i_frag);
	return vec3(dist, dist, dist);
}

vec3 compute_depth_difference(vec3 d_frag, vec3 i_frag) {
	float dist = distance(d_frag.r, i_frag.r);
	return vec3(dist, dist, dist);
}

vec3 compute_normal_difference(vec3 d_frag, vec3 i_frag) {
	d_frag = d_frag * 2.0 - 1.0;	// Unpack
	i_frag = i_frag * 2.0 - 1.0;	// Unpack
	d_frag = normalize(d_frag);
	i_frag = normalize(i_frag);
	float angle = acos(dot(d_frag, i_frag)) / PI;
	return vec3(angle, angle, angle);
}

vec3 compute_orm_difference(vec3 d_frag, vec3 i_frag) {
	float dist = distance(d_frag, i_frag);
	return vec3(dist, dist, dist);
}

vec3 compute_difference(vec3 d_frag, vec3 i_frag) {
	if (data_type == ALBEDO_TYPE)
		return compute_albedo_difference(d_frag, i_frag);
	else if (data_type == DEPTH_TYPE)
		return compute_depth_difference(d_frag, i_frag);
	else if (data_type == NORMAL_TYPE)
		return compute_normal_difference(d_frag, i_frag);
	else if (data_type == ORM_TYPE)
		return compute_orm_difference(d_frag, i_frag);
	return ERROR_COLOR;
}

const float n = 0.1;
const float f = 5.0;

void fragment() {
	vec3 out_color = ERROR_COLOR;

	if (data_type >= 0 && data_type < NB_GMAPS
		&& visualisation_mode >= 0 && visualisation_mode < 3) {
		// Récupération des pixels déterministe et interactif
		vec3 d_frag = texture(d_gbuffer[data_type], SCREEN_UV).rgb;
		vec3 i_frag = texture(i_gbuffer[data_type], SCREEN_UV).rgb;

		// Preprocess data
		switch (data_type) {
			case DEPTH_TYPE:
				d_frag = pre_process_d_depth(d_frag, n, f);
				i_frag = pre_process_i_depth(i_frag);
				break;
			case NORMAL_TYPE:
				d_frag = pre_process_d_normal(d_frag);
				d_frag = (d_frag + 1.0) / 2.0;	// Pack for visualization
				i_frag = pre_process_i_normal(i_frag, INV_VIEW_MATRIX);
				i_frag = (i_frag + 1.0) / 2.0; // Pack for visualization
				break;
		}

		// Selection de l'affichage
		switch (visualisation_mode) {
			case D_TEXTURE_ONLY:
				out_color = d_frag;
				break;
			case I_TEXTURE_ONLY:
				out_color = i_frag;
				break;
			case I_D_DIFFERENCE:
				out_color = compute_difference(d_frag, i_frag);
				break;
		}
	}

	ALBEDO = out_color;
}
```
{{< /togglecode >}}

En somme, on agrandit les tableau de samplers pour aceuillir le nouveau `ORM_TYPE`, puis on ajout une fonction plutôt triviale de calcule de différence que l'on invoque dans `compute_difference`. De là, on oublie pas d'assigner notre texture deterministe et notre SubViewport interactif aux parametres de l'Oracle et on appuie sur `Play` pour obtenir notre première prophecie (ca faisait longtemps tiens...)

[Prophecy]

A première vu y a du boulot, mais en faite pas tant que ça.

### 1. Albedo interactif annulé par la Metalic 
Quand on regarde l'orm intéractive, on voit instantanement que le plafond et le cylindre qui fait office de podium sont complètement noirs. Ca n'a pas l'aire normal et si on se réfère au tableau de valeurs de la partie III.1 on reconnais vite un patern. Les mesh avec une `metallic` à 1.00 sont tous noirs comme de par hasard.

[ORM interactive]

J'ai d'abord été un peu surpris, et puis je me suis rappelé de notre bricolage à base de `hint_screen_texture` et de `Debug Draw = Unshaded`. Ce n'est pas vraiment l'albedo qu'on affiche, mais le rendu final privé de lumière. Et sans lumière à réfléchir, les metaux apparaissent noir.

Le workaround est simple. On va juste débrancher la `metallic` de notre materiau custom. On en a pas besoin pour le rendu étant donné qu'on a rusé pour que l'info passe par l'albedo.

[visual shader no metallic]

Evidament ça va dégrader le rendu en éditeur ce qui n'est pas optimal. Mais là on est sur du confort d'utilisation. C'est donc un autre combat pour plustard.

Après ce changement, si on re jete un oeil à l'ORM interactive, les materiaux metaliques ne sont plus noir.

### 2. Le cas de Ambient Occlusion
Un petit presage plus tard, on constate bien une légère amélioration sur les zones concernées. Mais c'est quand même plutôt mauvais. 

[presage 2]

Les différences ont l'aire de se concentrer dans les angles et les zones confinées. Et quand on y réfléchi c'est tout à fait normal étant donné qu'on a pas du ton géré l'ambient occlusion côté godot ^^.

En fait, l'ambient occlusion ne fait pas vraiment partie du PBR. Ce n'est pas un attribut qui défini la matière elle même. C'est un phenomène lié à la géométrie des objets que l'on simule en bakant le "degré d'ouveture" en chaque points de la surface du mesh.

[exemple de map d'AO]

Notre materiau custom dans sa version actuelle ne supporte que des valeurs uniformements réparties sur la totalité de l'objet. Ce qui n'a aucun sens pour l'ambient occlusion. On ne peut donc pas encore l'utiliser coté interactif.

Ceci étant dit, même si on supportait déjà les textures, il n'y aurait pas vraiment lieu d'harmoniser cette donnée avec l'AO déterministe. La raison à cela est que les modalités de calcule de par et d'autre sont très différentes :
- Blender : calcule l'AO de manière globale au niveau de la scène
- Godot : l'AO est baké directement par le logiciel de modélisation. Ce qui fait qu'il est local à l'objet.

Par consequent, quoi qu'on face les différences entre les AO déterminste et interactif ne disparaitront jamais totalement. On va donc prendre le parti de les accepter et utiliser le préprocess de l'Orcale pour ignorer la donnée.

{{< togglecode >}}
```glsl {#code-compact hl_lines=[11,12]}
...
void fragment() {
	...
	if (data_type >= 0 && data_type < NB_GMAPS
		&& visualisation_mode >= 0 && visualisation_mode < 3) {
		...
		// Preprocess data
		switch (data_type) {
			...
			case ORM_TYPE:
				d_frag = vec3(1.0, d_frag.yz);
				i_frag = vec3(1.0, i_frag.yz);
				break;
		}
		...
	}
	...
}
...
```

```glsl {#code-full .hidden hl_lines=[94,95]}
shader_type spatial;
render_mode unshaded, fog_disabled;

void vertex() {
	POSITION = vec4(VERTEX.xy, 1.0, 1.0);
}

const vec3 ERROR_COLOR = vec3(1.0, 0.0, 1.0);

// Data to check
#define ALBEDO_TYPE 0
#define DEPTH_TYPE 1
#define NORMAL_TYPE 2
#define ORM_TYPE 3
uniform int data_type = -1;

// Determinist & Interactive G-Buffer
const int NB_GMAPS = 4;
uniform sampler2D[NB_GMAPS] d_gbuffer : filter_nearest;
uniform sampler2D[NB_GMAPS] i_gbuffer : filter_nearest;

// Choix du mode d'affichage
#define I_D_DIFFERENCE 0
#define D_TEXTURE_ONLY 1
#define I_TEXTURE_ONLY 2
uniform int visualisation_mode = 0;

// Permutation des normales
#include "debug.gdshaderinc"
#include "pre_process_utils.gdshaderinc"
uniform int permut_idx = 0;

vec3 compute_albedo_difference(vec3 d_frag, vec3 i_frag) {
	float dist = distance(d_frag, i_frag);
	return vec3(dist, dist, dist);
}

vec3 compute_depth_difference(vec3 d_frag, vec3 i_frag) {
	float dist = distance(d_frag.r, i_frag.r);
	return vec3(dist, dist, dist);
}

vec3 compute_normal_difference(vec3 d_frag, vec3 i_frag) {
	d_frag = d_frag * 2.0 - 1.0;	// Unpack
	i_frag = i_frag * 2.0 - 1.0;	// Unpack
	d_frag = normalize(d_frag);
	i_frag = normalize(i_frag);
	float angle = acos(dot(d_frag, i_frag)) / PI;
	return vec3(angle, angle, angle);
}

vec3 compute_orm_difference(vec3 d_frag, vec3 i_frag) {
	float dist = distance(d_frag, i_frag);
	return vec3(dist, dist, dist);
}

vec3 compute_difference(vec3 d_frag, vec3 i_frag) {
	if (data_type == ALBEDO_TYPE)
		return compute_albedo_difference(d_frag, i_frag);
	else if (data_type == DEPTH_TYPE)
		return compute_depth_difference(d_frag, i_frag);
	else if (data_type == NORMAL_TYPE)
		return compute_normal_difference(d_frag, i_frag);
	else if (data_type == ORM_TYPE)
		return compute_orm_difference(d_frag, i_frag);
	return ERROR_COLOR;
}

const float n = 0.1;
const float f = 5.0;

void fragment() {
	vec3 out_color = ERROR_COLOR;

	if (data_type >= 0 && data_type < NB_GMAPS
		&& visualisation_mode >= 0 && visualisation_mode < 3) {
		// Récupération des pixels déterministe et interactif
		vec3 d_frag = texture(d_gbuffer[data_type], SCREEN_UV).rgb;
		vec3 i_frag = texture(i_gbuffer[data_type], SCREEN_UV).rgb;

		// Preprocess data
		switch (data_type) {
			case DEPTH_TYPE:
				d_frag = pre_process_d_depth(d_frag, n, f);
				i_frag = pre_process_i_depth(i_frag);
				break;
			case NORMAL_TYPE:
				d_frag = pre_process_d_normal(d_frag);
				d_frag = (d_frag + 1.0) / 2.0;	// Pack for visualization
				i_frag = pre_process_i_normal(i_frag, INV_VIEW_MATRIX);
				i_frag = (i_frag + 1.0) / 2.0; // Pack for visualization
				break;
			case ORM_TYPE:
				d_frag = vec3(1.0, d_frag.yz);
				i_frag = vec3(1.0, i_frag.yz);
				break;
		}

		// Selection de l'affichage
		switch (visualisation_mode) {
			case D_TEXTURE_ONLY:
				out_color = d_frag;
				break;
			case I_TEXTURE_ONLY:
				out_color = i_frag;
				break;
			case I_D_DIFFERENCE:
				out_color = compute_difference(d_frag, i_frag);
				break;
		}
	}

	ALBEDO = out_color;
}
```
{{< /togglecode >}}



## V. Rendu final
Ce qui nous laisse avec ce magnifique rendu :

[light-broken]

On peut voire de superbes reflets dans les surface lisses et ... une petit minute, mais c'est cassé chef !

En effet, le plafond et le podium semblent ne semblent pas recevoir la lumière (toujours les mêmes...).

## VI. La vengeance de l'Albedo
Si on demande à l'oracle de comparer les maps d'albedo, on constate bien qu'il y'a un problème au niveau des zones non éclairables.

[Albedo diff]

Pour comprendre ce qu'il se passe, il n'y a qu'a regarder les textures pour s'appercevoir que l'albedo déterministe est lui aussi devenu noir sur les surfaces metaliques. Pourtant côté Blender on a pas fait de bricolage bizare, on récupère bien la passe officielle `Diffuse Color`. Alors que se passe-t-il ?

Il se passe que jusqu'ici, j'ai un peu menti en disant que l'albedo et la diffuse color c'était la même chose. Pour m'expliquer sur ce mensonge je dois faire une petite digression. 

Les modèles PBR se déclinent en deux grandes familles :
- le specular/glossiness workflow (branche historique décrite dans le papier de Disney)
- le metallic/rougness workflow

Sans entrer dans les détails, le workflow metallic/roughness est une simplification du workflow specular/glossiness. Il est un peu "plus éloigné" de la réalité physique, mais bien plus efficace à utiliser et à stocker en mémoire. C’est pour cette raison qu’il s’est rapidement imposé comme le standard dans le rendu temps réel.

[comparaison]

Evidement, Cycles qui n'est pas conçu pour le temps réèl utilise la version la plus lourde et la plus fidèle. Et dans le workflow specular/glossiness, la diffuse color d'un metal, qui ne reflechi que la lumière spéculaire, est naturellement noire.

Tant qu'à faire on aimerai bien garder la présision de Blender lorsque c'est possible et un albédo unique seulement quand on doit recalculer la lumière en temps réèl. On va donc garder les passe Cycle officielle telle quel, et on va ajouter une passe custom `aov_albedo` qui nous renvera la couleur de l'objets.

Evidament cela va nécessiter quelques ajustements :
- se rebraquer les Shader de chaque mesh pour ajouter le `AOV output`de l'albedo
- remplacer `diff_col` par `albedo` dans les shaders de l'orcale et du compositor
- adapter le code du compositor pour prendre en compte cette differentiation entre `diff_col` et `albedo`

[code]


Maintenant que les données sont correctement séparée, les surfaces métaliques reçoivent bien la lumière.

[light-fixed]

## VII. Conclusion 






En effet, il existe dans la nature certains matériaux qui réfléchissent la lumière diffuse dans une couleur différente de la lumière spéculaire : les matériaux iridescents. Mais dans la pratique, l’immense majorité du monde qui nous entoure ne l’est pas. En partant de ce constat, le workflow metallic/roughness n’a besoin que d’une seule map d’albedo, là où le modèle specular/glossiness en nécessite deux.