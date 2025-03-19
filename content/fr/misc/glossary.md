+++
draft = true
title = 'Glossaire'
toc = false
+++
## Anti-Aliasing
[Décrire ici tous les types d'anti-aliasing MSAA, FXAA, TAA ...]

## Bloom

## Cel Shading

## CPU
C'est l'acronyme de Central Processing Unit : l'unité de calcule principale d'un ordinateur. Il s'agit tout simplement de votre processeur.

## Depth of Field

## Draw Call
Un draw call est une commande envoyée au GPU pour lui demander de traiter un ensemble de primitives géométriques (généralement des triangles) afin de les rendre à l'écran (ou sur une *render target*).

## Fixed Function
Fut un temps, les [*GPU*](/misc/glossary/#gpu) n'était pas programmables. L'intégralité du pipeline graphiques était "gravé en dur" directement dans le carte. Ca veut dire qu'il y avait des circuits dédiés pour chacune des étapes / fonctionnalités :
- transformation des vertex
- rasterisation
- éclairage
- texturing
- ....

Le programmeur ne pouvait donc pas redéfinir ces étapes. Il ne pouvait que les activer, les desactiver, ou en configurer certains aspect via des founction prédefinies : les fameuses fixed functions.

C'était très efficace du point de vue des performance (toute proportion gardée pour l'époque), mais pas très flexible. Si on voulait de nouvelles features visuelles dans les jeux (éclairage PBR, cel shading...), il fallait qu'elles soient implémentée non pas par les developeurs, mais par les fabriquants de cartes. Ce qui constitue un gros obstacle à l'inovation.

Les GPU ont donc naturellement évolué vers des modèles de plus en plus programmable en intégrand des *shader stages* à leur pipeline graphique. D'abord avec les vertex shader et les fragment shaders, puis sont apparu les géometry shaders, les tesselation shaders, les compute shaders etc...

Aujourd'hui, les fixed function stages n'ont pas disparut. On les utilise là où ont a pas besoin de flexibilité et/ou quand l'aspect performences est critique (rasterisation, depth test...).

## Fragment-Shader
Le fragment shader (aussi appelé pixel shader), est la dernière étape programmable du pipeline graphique. La mission de ce shader stage est de déterminer la couleur finale des fragments (ou pixels) issus de la rasterisation (le fixed function stage qui le précède).

Plus d'élements ici :
[Dis donc Jamy : Comment ça marche un shader ?](/posts/ddj_shaders/#3-fragment-shader)

## Frame
Une frame, c'est une image de la scène générée à un instant donné par le moteur graphique (ou *renderer*). La vitesse à laquelle on arrive à la construire détermine le *frame rate*, exprimé en fps (Frame Per Second).

## GPU
C'est l'acronyme de Graphics Processing Unit : l'unité de calcule d'un ordinateur, destinée aux calculs graphiques. Il s'agit tout simplement de votre carte graphique.

## Mesh

## Morph Target

## Motion Blur

## Niveau d'Abstraction
Le niveau d'abstraction d'un langage informatique designe sa proximité avec la logique humaine. Plus un langage est haut niveau, plus il va être lisible et compréhensible "facilement". Plus il est bas niveau, plus les briques de base qui le composent vont être primitives. Ce qui se traduira par des programmes long et complexes même pour faire des choses très simples.

Le langage le plus bas niveau que l'on puisse trouver est le langage machine.
```c
10110000 01100001
00000001 00000010
10000111 01101000
00000001 01100010
10000111 01101000
00011001 01111010
10000111 01101000
10110000 01100001
00000001 00000010
...
```

Pour l'exemple j'ai juste tappé des suites aléatoires de 1 et de 0 mais ça ne change pas grand chose. Personne ne lit, ni n'écrit de code sous cette forme. On l'obtient par traduction automatique depuis un code source écrit dans un langage de plus haut niveau (on appele ça la compilation).

Un premier niveau d'abstraction permettant une utilisation humaine est l'assembleur :
```asm
SECTION .data
    extern printf
    global main
fmt:
    db "%d", 10, 0
SECTION .text
main:
    mov     eax, 14
    mov     ebx, 10
    add     eax, ebx
    push    eax
    push    fmt
    call    printf
    mov     eax, 1
    int     0x80
```

Mais c'est beaucoup trop difficile pour moi. J'ai récupéré ce code sur internet et apparament, il permetrait d'additionner les 2 entiers 14 et 10 et d'afficher le résultat dans la console. 

Au dessus de l'assembleur on retrouve les "langage traditionnels" (C/C++, Python, Java, JavaScript ...). Heureusement beucoup plus simples. A titre d'exemple, en C, le code assembler ci-dessus s'écrirait :
```c
#include <stdio.h>
#include <stdlib.h>

int main()
{
    printf(14 + 10);
    return EXIT_SUCCESS;
}
```

Notez que tous les "langages traditionnels" ne se placent pas exactement au même niveau d'abstraction. Le C est par exemple plus bas niveau que le Java. Mais les différences sont plus subtiles que pour les exemples précédent.

## Pipeline Graphique

## Pixel Lighting

## Post-Process

## Quad
Un quad est un mesh composé de 2 triangles qui partagent 2 de leurs vertex.

[mettre une image]

## Rasterisation

## Render Target

## Shader
Un shader est un programme qui s'execute sur le GPU. Le terme fait l'objet d'une légère ambiguité. Suivant le contexte, il designe :
- un *shader stage* : un programme indépendant et spécialisé qui collabore avec d'autres au sein du [pipeline graphique](/misc/glossary/#pipeline-graphique) pour générer des images ([*vertex shader*](/misc/glossary/#vertex-shader), *geometry-shader*, [*fragment shader*](/misc/glossary/#fragment-shader), *tessellation shader*, etc...)
- un *shader program* : un assemblage cohérent de *shader stages* liés entre eux et destinés à être executés enssemble. C'est en quelques sortes, une instance du pipeline graphique.

Dans les moteurs de jeux et les logiciels de modélisation, le terme apparait par l'intermédiaire du concept de *material*. Dans ce context, il est le plus souvent employé au sens *shader program*. Un *material* pouvant être vu comme un preset de paramettres pour un *shader program* donné.

Dans des contextes plus techniques, il a tendance à être utilisé au sens *shader stage*.

Plus d'élements ici :
[Dis donc Jamy : Comment ça marche un shader ?](/posts/ddj_shaders)

## Skeletal Animation

## SSAO

## UV

## Vertex

## Vertex Color

## Vertex Lighting

## Vertex Shader
Le vertex shader, est la première étape programmable du pipeline graphique. Traditionnellement, la mission de ce shader stage est d'opérer une succession de transformation géométriques aux vertex qui le traversent, afin de les transférer de leur coordonnée locale en 3d à l'espace 2d de l'écran.

Après cette étape, on peut dire que les vertex forment une sorte d'image vectorielle prète à être rasterisée. Cela dit, certaines étapes optionnelles du pipeline peuvent eventuellement s'apliquer avant la rasterisation (geometry shader et tessellation).

Plus d'élements ici :
[Dis donc Jamy : Comment ça marche un shader ?](/posts/ddj_shaders/#1-vertex-shader)