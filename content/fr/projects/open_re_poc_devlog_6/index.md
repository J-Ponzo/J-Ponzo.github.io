+++
author = 'Turbo Tartine'
date = '2025-11-02T09:37:24+01:00'
title = "OpenRE devlog 6 : Harmonisation de l'ORM"
description = 'devlog 6 du projet OpenRE'
draft = true
+++

- Setup det ORM
- Generate det ORM :
	- add aov_orm in passes
	- activate AO passe
	- add aov outpout for all material
	- combine aov & AO in compositor then throw it in orm output pin
	- denoise AO
- Setup int ORM
- Create custom nodal shader that draw ORM on specific cam layer
- implement pbr from learn open GL
- boost roto-light intensity

[⬅️ Vers Précédent : "OpenRE devlog 5 : Fusion des mondes. Part II"](projects/open_re_poc_devlog_5)

## I. Introduction
Salut à tous !

Après les derniers épisodes consacrés à l’implémentation de l’éclairage, on va ressortir l’Oracle du placard pour faire un peu d’harmonisation.
Cette fois-ci, on va s’intéresser à l’ORM.

Il s’agit d’une convention qui définit dans quels canaux RGB sont rangées les informations suivantes :
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

Pour l'ORM intéractive, la technique va être de se servir des `camera layers` active pour selectionner ce qu'on veut envoyer dans l'albedo. Ainsi nous auront un materiaux normal sur la plupart de layers, mais si une certaine layer est active (disons la 5), l'ORM se substitura à l'Albedo. 

De cette manière nous pourront créer un `Sub_Viewport` sur le même modèle que ce qu'on avait fait pour l'Albedo :
- `hint_screen_texture` affichée sur le quad
- `Debug Draw = Unshaded`

Sauf que cette fois on mettra le caméra et le quad sur la layer 5

simple_ORM avec metalic/roughness/AO plugged

## IV. Réglages

### 1. Albedo interactif annulé par la Metalic 
On voit du noir sur metalic=1

plugger metalic=1 detruit l'albedo. C'est un rendu unshaded ?

=> simple_ORM avec metalic unplugged

### 2. Le cas de Ambient Occlusion
Couleurs différentes et dégradées .

C'est a cause de l'AO.

Pas vraiment PBR blabla. Cut au preprocess de l'oracle

## V. Rendu final
Ce qui nous laisse avec le magnifique rendu :

<light-broken>

On peut voire des reflets dans les surface lisses et ... une petit minute, mais c'est cassé chef !

## VI. La vengeance de l'Albedo
Le plafond et le podium semblent ne pas recevoir la lumière... toujours les mêmes...

Use oracle pour trouver coupable. Et le coupables est : Albédo ?

Normal cette fois car Metalic Workflow VS Specular Workflow => albedo/diff_col=noir si metalic=1

=> 2eme aov_albedo + adaptation de Oracle et compositor

<light-fixed>

## VII. Conclusion 
