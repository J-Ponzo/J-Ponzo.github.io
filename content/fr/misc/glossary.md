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
Un draw call est une commande envoyée au GPU pour lui demander de traiter un ensemble de primitives géométriques (généralement des triangles) afin de les rendre à l'écran (ou dans une *render target*).

## Edge :
Une edge (ou arrète) est un élement constituant du mesh (ou maillage). Elle lie 2 vertex appartenant au mesh. 

Elle ne sont explicitement représentée que dans les logiciels de modélisation 3d. Côté moteur, elles ne sont présentes qu'implicitement via la definition des triangles.

[mettre une image]

## Face :
La face est un élement constituant du mesh (ou maillage). Elle est definie par un cycle d'edges fermé appartenant au mesh et constitue la plus petite unité de surface visible de ce dernier. En effet, un mesh dépourvu de face est invisible.

[mettre une image]

On distingue 3 types de faces :
- les triangles : unique type pris en charge par les moteurs de jeu (une carte graphique ne sait pas afficher autre chose)
- les quads : Faces composées de 4 vertex. Très utiles en modélisation car ils sont très facile à subdiviser et permetent d'insérer des loops facilement
- les n-gones : Composés de plus de 4 vertex. Ils sont généralement à proscrir car leur propriété géométriques les rendent difficile à manipuler. 

[mettre une image]

Note : Les face sont orientées. Sauf configuration particulière, elle ne sont visibles que si on les regarde du bon côté. Le côté visible est déterminé par l'ordre des vertex

[mettre un gif]

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
Les objets 3d qui compose une scène sont composés d'un ou pluieurs meshes (ou maillage en français). Il s'agit d'un enssemble de *vertex* (ou sommets) reliés entre eux par des edges (arètes). Si on s'arrête là, on est plus ou moins sur la définition d'un graphe. Mais il y a deux grandes différences :
- les vertex d'un mesh portent une coordonnée 3d (ou 2d) qui les fixe en un point de l'espace (ou du plan)
- les cycles fermés d'arrêtes peuvent (ou non) definire des faces. Donnant ainsi au mesh une surface.

[mettre une image]

Les meshes utilisés dans les moteurs de jeu ont une spécificité supplémentaires : leurs faces doivent imperativement être des triangles car les cartes graphiques ne comprennent que ça. Il faut donc trianguler les quads et les N-Gones avant de les intégrer à une scène. Cette opération peut être effectuée :
- A l'export du logiciel de modélisation.
- A l'import dans le moteur

[même image triangulée]

## Morph Target

## Motion Blur

## N-Gone
Dans un logiciel de modélisation 3d, un N-Gone designe une face composée de plus de 4 vertex. Ils sont à éviter, en particulier si le model est destiné à être importé dans un moteur de jeu. Et ce pour les raisons suivantes :
- La triangultaion automatique est plus compliquée. Les resultats sont difficile à prévoire
- Si le modele est animé, les deformation des n-gone peuvent être incorrectes
- Ils ont des propriété géométrique qui fond qu'il généralement difficile de travailler avec (compliqués à subdiviser, insertion ambigue des edge loops...)

Note : Si on est rigoureux, un n-gone designe un polygone composé de n edges. Le triangle et le quad sont donc techniquement des n-gone au sens mathématique du terme. Mais dans le contexte de la modélisation 3d, on considère un poligone comme un n-gone qu'à partir de 5 edges (car c'est à partir de ce nombre que la géometrie pose problème).

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

## Normal

## Pipeline Graphique
Le pipeline graphique est une sequence d'étape executées par le GPU lors d'un draw call. Son rôle est de transformer les vertex 3D qui le traversent en  pixels affichés à l'écran.

Certaines de ces étapes sont directement gravées dans les circuits du GPU (les fixed function stages), d'autres sont programmable (les shader stages).

## Pixel Lighting

## Post-Process
Un post-process est une passe de rendu au cours de laquelle on applique un traitement à un rendu intermédiaire de la scène. Ce rendu intermédiaire est stoqué dans une render target qui a été imprimée lors d'une passe précédente.

Enormement d'effets visuels sont obtenus de cette manière (Depth of field, Color Grading, Film Grain, Vignetting ...)

## Quad
Un quad est une face d'un mesh composée de 4 edges et de 4 vertex. Contrairement au triangle, il n'est pas forcement planaire (contenu dans un seul plan).

[mettre une image]

Dans un moteur de jeu qui ne comprend que les triangles, il s'agit d'une primitive géométrique prédéfinie, composée de 2 triangles qui partagent 2 de leurs vertex (pour un total de 4 vertex donc). Dans ce contexte, le quad est planaire. C'est même un carré.

[mettre une image]

## Rasterisation
La rasterisation, c'est l'action de transformer une image vectorielle (définie par des primitives géométriques) en un image matricielle (constituée de pixels).

Dans le cadre du pipline graphique, il s'agit du fixed function stage qui se place entre le vertex shader et le fragment shader. Cette étape rasterise des triangles spécifiquement. Ces derniers sont definis par les vertex en espace écran issus du vertex shader. Les pixels générés, aussi appelés fragment, sont ensuite envoyé en entrée du fragment shader.

Les attributs portés par les vertex sont également interpolés et associés aux fragement correspondant.

Note : Le terme rasterisation est parfois employé pour designer la totalité du processus de rendu temps réèl classique. Dans ce cas il fait référence à la methode de rendu dans sont intégralité par oposition à la methode de rendu par Ray Tracing.

## Render Target
Une render target, c'est une toile sur laquelle le pipline graphique va peindre une sequence de draw calls. A la fin de la squence (appelée une passe de rendu), cette toile peut être soit :
- 1. affichée à l'écran
- 2. stoqué comme resultat intermédiaire et utilisée lors de la passe de rendu suivante

Le second cas permet d'implémenter des effets avancés comme les ombres dynamiques, les plannar reflections, et toute une palanquée de post-process (Bloom, Cel Shading, SSAO, Anti-Aliasing etc...).

Note : Dans le contexte d'un moteur de jeu, le terme designe implicitement le 2eme cas (un résultat intermédiaire utilisé pour implémenter des effets avancés). 

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
Le vertex (ou sommet) est un élement constituant du mesh (ou maillage). Il représente un point fixe de l'espace (3d) ou du plan (2d). Il peut porter un certain nombre d'attributs dont les plus courants sont :
- vertex color
- normal
- UVs

D'autres attributs moins frequents, comme les poids du skinning, peuvent s'ajouter à cette liste. Retenez juste que c'est une coordonnée de l'espace ou du plan qui porte de l'information.

Note : Le pluriel correcte de vertex est vertices (ne soyez pas surpris de le voir écrit sous cette forme). Mais je l'entand très peu à l'oral (en tout cas en France) et je trouve que c'est une source de confusion innutile. J'utilise donc très souvent le terme vetex même au pluriel (désolé pour pour vos oreilles et vos yeux).

## Vertex Color

## Vertex Lighting

## Vertex Shader
Le vertex shader, est la première étape programmable du pipeline graphique. Traditionnellement, la mission de ce shader stage est d'opérer une succession de transformation géométriques aux vertex qui le traversent, afin de les transférer de leur coordonnée locale en 3d à l'espace 2d de l'écran.

Après cette étape, on peut dire que les vertex forment une sorte d'image vectorielle prète à être rasterisée. Cela dit, certaines étapes optionnelles du pipeline peuvent eventuellement s'apliquer avant la rasterisation (geometry shader et tessellation).

Plus d'élements ici :
[Dis donc Jamy : Comment ça marche un shader ?](/posts/ddj_shaders/#1-vertex-shader)