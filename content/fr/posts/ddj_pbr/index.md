+++
author = 'Turbo Tartine'
date = '2026-01-31T09:06:29+01:00'
draft = true
title = "Dis donc Jamy : C'est quoi le PBR ?"
description = "Article de vulgarisation expliquant ce qu'est le Physically Based Rendering"
hidden = false
+++
## I. Introduction
Dans la serie de devlog du projet OpenRE, je me suis retrouvé à devoir expliquer ce qu'est le PBR. Ce faisant, je me suis rendu compte que :
- le sujet est trop vaste pour tenir dans une simple section d’article
- il y avait quelques angles morts dans ma compréhension des choses

Pour remédier au premier point : voici un article dédié dans lequel on va pouvoir prendre toute la place qu'on veut pour détailler tout ce qu'il y a à détailler ! Pour le second, j’ai essayé de comprendre comment fonctionne la lumière dans la vraie vie. Je me suis donc naturellement intéressé à la branche de la physique qui étudie la lumière : l’optique.

"Téma la taille du rabbit hole !"... j'étais pas prêt ! <smiley> Non seulement le sujet est gigantesque, mais je crois bien que le Turbo Tartine du passé — fraîchement débarqué de la fac et à l’apogée de son *skill* de mathématicien — n’avait déjà pas la moitié du niveau nécessaire pour s’y attaquer sérieusement.

[meme ]

Que fait-on quand on est battu et qu'on comprend pas ce qu'on lit ? ~~On abandonne, on brûle le livre, on décide que la terre est plate et on retourne regarder Hanouna à la télé.~~ On accepte avec humilité qu'on est pas un expert du domaine et on continue de lire en essayant de capter quelques trucs ici et là dans l'espoir de réduire un peu son ignorance.

Pour ne rien vous cacher, j'ai vraiment pas compris grand chose. Mais j'ai rapidement eu l'impression que :
- en rendu graphique, une grande partie de l’optique ne nous concerne pas directement
- Le PBR n'est pas juste une simplification de la réalité. C'est un assemblage de  résultats empruntés à différents cadres théoriques pas nécessairement compatibles entre eux.

Ca m'a un peu décomplexé. J'ai réalisé que ce n'était pas un problème de construire un modèle "un peu farfelu" tant qu’il est cohérent avec ce qu’on cherche à expliquer. L’important n’est pas qu’il soit physiquement exact, mais qu'on soit cappable d'en comprendre les limites et de le situer par rapport à d'autre modèles plus rigoureux.

Tout ça pour dire que dans cet article, je vais utiliser un modèle pédagogique imparfait, plutôt faux d'un point de vue scientifique... mais qui je l'espère, vous permettra de mieux comprendre le PBR : ce qu'il est, dans quel cadre il s'inscrit  et comment il marche.


## II. La vrai physique : celle que je ne comprends pas

## III. Le Turbo Photon Tartining : qui n'existe que dans ma tête

## IV. Le PBR : good enough for les films et le gaming

## V. Conclusion
Les angles motrs tenaient comment je situe mon modèle 



## I. Introduction

Dans ma série de devlogs du projet OpenRE, je me suis retrouvé à devoir expliquer ce qu’est le PBR. En faisant ça, je me suis rendu compte que :

- le sujet est beaucoup trop vaste pour tenir dans une simple section d’article
- il y avait encore quelques angles morts dans ma compréhension des choses

Pour remédier au premier point : voici donc un article dédié, dans lequel on va pouvoir prendre toute la place qu’on veut pour détailler tout ce qu’il y a à détailler.

Pour le second point, j’ai essayé de comprendre comment fonctionne la lumière dans la vraie vie. Je me suis donc naturellement intéressé à la branche de la physique qui étudie la lumière : l’optique.

“Téma la taille du rabbit hole !” 😅  
Je n’étais clairement pas prêt.

Non seulement le sujet est gigantesque, mais je crois bien que le Turbo Tartine du passé — fraîchement débarqué de la fac et à l’apogée de son *skill* de mathématicien — n’avait déjà pas la moitié du niveau nécessaire pour s’y attaquer sérieusement.

<meme>

Que fait-on quand on est battu et qu’on ne comprend pas ce qu’on lit ?  
~~On abandonne, on brûle le livre, on décide que la Terre est plate et on retourne regarder Hanouna à la télé.~~  
On accepte avec humilité qu’on n’est pas expert du domaine, et on continue de lire en essayant de capter quelques idées ici et là, dans l’espoir de réduire un peu son ignorance.

Pour être tout à fait honnête, je n’ai pas compris grand-chose à l’optique fondamentale.  
Mais j’ai assez vite eu l’impression que :

- pour le rendu graphique, une grande partie de l’optique ne nous concerne pas directement
- le PBR n’est pas *une* simplification propre et élégante de la réalité, mais plutôt un assemblage de résultats empruntés à différents cadres théoriques, pas toujours compatibles entre eux

Et paradoxalement… ça m’a beaucoup décomplexé.

J’ai réalisé que ce n’était pas un problème de construire un **modèle de travail volontairement simplifié**, tant qu’il est cohérent avec ce qu’on cherche à expliquer.  
L’important n’est pas qu’il soit physiquement exact, mais qu’on soit capable d’en comprendre les hypothèses, les limites, et de le situer par rapport à des modèles plus rigoureux.

Tout ça pour dire que dans cet article, je vais essayer d’expliquer ce qu’est le PBR sans prétendre expliquer la “vraie” physique de la lumière.  
Je vais utiliser un modèle pédagogique imparfait, parfois faux du point de vue d’un physicien… mais suffisant pour comprendre pourquoi le PBR existe, ce qu’il approxime, et pourquoi il fonctionne si bien en rendu temps réel.

Et en fait… ben c’est pas grave.
