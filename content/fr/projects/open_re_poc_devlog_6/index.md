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

=> simple_ORM avec metalic/roughness/AO unplugged

### 2. Le cas de Ambient Occlusion

Pas vraiment PBR blabla. Cut au preprocess de l'oracle

### 2. Diffuse Color VS Albedo

Metalic Workflow VS Specular Workflow

## V. Conclusion 
