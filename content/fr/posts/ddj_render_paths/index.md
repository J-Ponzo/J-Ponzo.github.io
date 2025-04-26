+++
date = '2025-04-05T17:35:20+02:00'
draft = true
title = "Dis-donc Jamy : C'est quoi un chemin de rendu ? (Forward / Deferred etc...)"
+++
## Introduction
[
- Si vous utilisez des engines vous avez croisé les termes forward et deferred
]

## I. Le Forward Rendering
[
Forces
- Simple
- Compatible MSAA
- Transparence facile à implémenter
- Flexibilité maximale pour le shading (possibilité des shader specifique pour chaque couple {light, mesh})

Faiblesses
- La lumière coute cher en cas d'overdraw
]

## II. Le Deferred Rendering
[
Forces
- Le coût de la lumière n'est plus impacté par l'overdraw

Faiblesses
- Complexe
- Imcompatible avec le MSAA (faire des recherches plus poussées sur la raison)
- Ne gère pas la transparance
- Mois de flexibilité pour le shading (tous les mesh partagent le même G-Buffer. nécessiter d'unifier le model pour ne pas avoir. les specificité ne peuvent plus être implémentées au niveau shader uniquement)
- Gros besoins en mémoire GPU (stockage ET bande passante)
]

## III. Le Light Prepass
[
Forces
- Le coût de la lumière n'est plus impacté par l'overdraw
- Besoins en mémoire GPU (stockage ET bande passante) plus modérés => A permis de faire du deferred lighting sur des consoles un peu faible (PS3 etc...)
- Partiellement compatible avec le MSAA (faire des recherches plus poussées sur le "partiellement")
- Meilleur flexibilité pour le shading

Faiblesses
- Encore plus complexe
- Contre productif avec le workflow PBR dominant (metallic)
- Les GPU actuels, y compris console (et bientôt mobile high-end) sont assez puissantes pour que l'argument materiel n'en soit plus un
]

## Conclusion
[
- Standard actuel, hybrides deferred/forward pour la transparance
- Ouverture sur les specificité (forward+, clustered deferred etc...) => Grande diversité d'implémentation
- L'industrie est un tout, c'est imprévisible => Light Prepass prometteur mais evolution des machines et standardisation/dominance du PBR metallic l'ont rendu obsolete.
]