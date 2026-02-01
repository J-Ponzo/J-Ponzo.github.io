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

## II. La vrai physique : celle que je ne comprends pas
Le terrier de lapin s'est avéré beaucoup plus profond et labyrinthique que prévue. L'optique est organisée en plusieurs sous branche qui ont chacunes leurs modèle.


"Téma la taille du rabbit hole !"... j'étais pas prêt ! <smiley> Non seulement le sujet est gigantesque, mais je crois bien que le Turbo Tartine du passé — fraîchement débarqué de la fac et à l’apogée de son *skill* de mathématicien — n’avait déjà pas la moitié du niveau nécessaire pour s’y attaquer sérieusement.

[meme ]

Que fait-on quand on est battu et qu'on comprend pas ce qu'on lit ? ~~On abandonne, on brûle le livre, on décide que la terre est plate et on retourne regarder Hanouna à la télé.~~ On accepte avec humilité qu'on est pas un expert du domaine et on continue de lire en essayant de capter quelques trucs ici et là dans l'espoir de réduire un peu son ignorance.

Pour ne rien vous cacher, j'ai vraiment pas compris grand chose. Mais j'ai rapidement eu l'impression que :
- en rendu graphique, une grande partie de l’optique ne nous concerne pas directement
- Le PBR n'est pas juste une simplification de la réalité. C'est un assemblage de  résultats empruntés à différents cadres théoriques pas nécessairement compatibles entre eux.

Ca m'a un peu décomplexé. J'ai réalisé que ce n'était pas un problème de construire un modèle "un peu farfelu" tant qu’il est cohérent avec ce qu’on cherche à expliquer. L’important n’est pas qu’il soit physiquement exact, mais qu'on soit cappable d'en comprendre les limites et de le situer par rapport à d'autre modèles plus rigoureux.

Tout ça pour dire que dans cet article, je vais utiliser un modèle pédagogique imparfait, plutôt faux d'un point de vue scientifique... mais qui je l'espère, vous permettra de mieux comprendre le PBR : ce qu'il est, dans quel cadre il s'inscrit  et comment il marche.

## III. Le Turbo Photon Tartining : qui n'existe que dans ma tête

## IV. Le PBR : good enough for les films et le gaming

## V. Conclusion
Les angles motrs tenaient comment je situe mon modèle 

## Autres axes :
Quand on dit que le PBR n'est pas physiquement exacte mais seulement inspiré par la physique, une idée un peu naive à tendance à s'imposer à nous. Celle qu'il y aurait une verité scientifique absolue, trop complexe pour être représentée dans un ordinateur et qu'on aurrait du simplifié par nécessité technique.

Evidament il y a de ça. Mais en chechant cette verité fondamental pour pouvoir expliquer en quoi le PBR en diverge, j'ai réalisé que c'était un peu plus compliqué. En effet, au gré des divers article, vidéos de vulgarisation et autres pages wikipédia, j'ai cru voire hémerger un pattern. 

Attention si vous être physicien, la suite va peut être vous faire tiquer. Je vais le dire avec mes mots parce que c'est les seuls que j'ai alors soyez gentil (mais hesitez pas à me corriger en commentaires). En gros ce que je comprends de comment c'est foutu, c'est que pour chaque branche on a :
- Des théories fondamentales : décrivent le fonctionnement globale des choses. Je les vois comme des généralisations les unes des autres, valables ou pas sous différentes hypothèse (les trucs petits, les bidules grands, les machins quantiques...)
- Des études d'une chose précise : divers sujets spécifiques que l'on peut apréhender selon la grille de lecture de l'une ou l'autre de ces théories fondamentales.

Par exemple, la cinématique c'est l'étude du mouvement. Suivant le cadre dans lequel s'inscrit le système qu'on observe, on va l'étudier avec :
- la mécanique classique : si le systeme est à une échelle macroscopique
- la mécanique relativiste : si l'objet se déplace à des vitesses proches de celle de la lumière
- la mecanique quantique : si le système est à l'échelle microscopique

Pour l'optique, les grande théories sont :
- l'optique géometrique : La lumière est un rayon qui se propage en ligne droite et de manière instantanée. Valable à l'échelle macroscopique (très superieur à la longeure d'onde étudiée). Permet de modéliser la plupart des phénomènes observable à l'oeuil nu (mais pas tous).
- l'optique ondulatoire : La lumière est une onde électromagnetique. Permet d'expliquer les phenomènes visibles tels que la difraction, la polarisation et les interferences (en plus de ceux déjà décrits par l'optique géometrique). Les couleurs sont déterminées par la longueur d'onde.
- l'optique quantique : La lumière est définie en terme de photons et d'états quantiques. Les couleurs sont déterminées par la frequence du photon. C'est le modèle le plus fondamental qu'on ai à l'heure actuelle. (mais aussi le plus incomprehensible)

Et les champs d'étude suceptibles de nous interesser pour le rendu sont :
- La radiométrie : Etude des mesures physiques de la lumière (Energie, Flux, Intensité, Radiance, Irradiance...)
- Le transfert radiatif : Etude de la propagation de la lumière
- La photometrie : Etude de la perception de la lumière par l'oeuil humain

