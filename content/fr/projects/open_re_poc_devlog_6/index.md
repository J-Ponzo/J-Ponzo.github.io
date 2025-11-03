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

## II. Quésaco PBR ?

## III. Génération des textures

### 1. ORM interactive

simple_ORM avec metalic/roughness/AO plugged

### 2. ORM déterministe

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
