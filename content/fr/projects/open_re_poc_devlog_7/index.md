+++
author = 'Turbo Tartine'
date = '2026-01-28T09:25:53+01:00'
draft = true
title = "OpenRE devlog 7 : Implémentation du PBR"
description = 'devlog 7 du projet OpenRE'
hidden = false
+++
[⬅️ Vers Précédent : "OpenRE devlog 6 : Harmonisation de l'ORM"](projects/open_re_poc_devlog_6)

## I. Introduction

Je sais pas si cet article sortira à temps pour dire ça mais bonne année quand même !
Comme tous les ans Noel m'a bien roulé dessus et j'ai eu tout le mal du monde à reprendre le rythme. C'est la raison pour laquelle je n'ai rien écrit depuis un peu plus de 2 mois. 

Mais ça y'est je suis de retour plus déter que jamais pour vous parler de l'implémentation du modèle PBR car l'année dernière (oui j'ai fait cette blague...) on s'était arreté à l'harmonisation de l'ORM.

## II Survol de la théorie du PBR
A voir comment gérer ça. Description succinte des formules + envois sur LearnOpneGL ?

## III Implémentation
- Version LearnOpneGL pas intégrable car brdf pas séparées
- séparation brdf
- intégration + résultat
=> Ca marche mais c'est pas non plus fifou parce qu'on arrive aux limites de la scene

## IV Nouvelle scène
- presentation assets
- passage aux textures
- support des spot lights
- rendu WAW

## V Conclusion