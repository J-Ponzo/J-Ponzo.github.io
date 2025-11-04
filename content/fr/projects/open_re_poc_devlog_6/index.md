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

Salut à tous ! Après les derniers épisodes consacrés à l'implémentation de l'éclairage, on va déterer l'Oracle et refaire un peu d'harmonisation. Cette fois ci, on s'interessera à l'ORM qui est un standard d'organisation de données au sein des cannaux d'une texture :
- Red : (Ambient) **O**clusion
- Green : **R**oughness
- Blue : **M**etalic

On va avoir besoin de ces informations pour mettre en oeuvre un modèle d'illumination PBR. Vous avez certainement déjà rencontré ce terme, mais prenons un instant pour nous mettre au claire sur ce que c'est vraiment.

## II. Quésaco PBR ?
PBR est l'accronyme de *Physically Based Rendering*. Il s'agit d'une cathégorie de modèles d'illumination qui s'appuie sur des loies physiques pour garantire un certain niveau de cohérence visuelle et d'ineropérabilité des materiaux. 

Dans l'imaginaire collectif, il est souvent synonyme de qualité de rendu et de réalisme : "Regardez ! c'est "Physically Based" ça veut dire c'est comme la vrai vie !". En réalité, on peut tout à fait faire du stylisé avec des modèles PBR, d'ailleurs un des pioniers de la démocratisation de ces techniques est Disney et son article "Physically-Based Shading at Disney" dont toute l'industrie s'est inspirée.

En fait, il faut plus voir le PBR comme un contract permettant d'articuler et d'homogénéiser le travail de artistes et des programeurs graphiques. Avant lui l'humanité était tout a fait capable de faire de super materiaux. Cependant, ces materiaux n'était correct que dans le moteur pour lequel ils étaient concus, voir même parfois dans une seule scène aux conditions d'éclairages particulières.

## III. Génération des textures

### 1. ORM interactive

simple_ORM avec metalic/roughness/AO plugged

### 2. ORM déterministe

## IV. Réglages

### 1. Albedo interactif annulé par la Metalic 

=> simple_ORM avec metalic/roughness/AO unplugged

### 2. Le cas de Ambient Occlusion

Pas vraiment PBR blabla. Cut au preprocess de l'oracle

### 2. Diffuse Color VS Albedo

Metalic Workflow VS Specular Workflow

## V. Conclusion 
