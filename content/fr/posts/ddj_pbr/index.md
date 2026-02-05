+++
author = 'Turbo Tartine'
date = '2026-01-31T09:06:29+01:00'
draft = true
title = "Dis donc Jamy : C'est quoi le PBR ?"
description = "Article de vulgarisation expliquant ce qu'est le Physically Based Rendering"
hidden = false
+++
## I. Introduction
Dans la serie de devlog du projet OpenRE, je me suis retrouvé à devoir expliquer ce qu'est le Physicaly Based Rendering (PBR). Ce faisant, je me suis rendu compte que :
- le sujet est trop vaste pour tenir dans une simple section d’article
- il y avait quelques angles morts dans ma compréhension des choses

Pour remédier au premier point : voici un article dédié dans lequel on va pouvoir prendre toute la place qu'on veut pour détailler tout ce qu'il y a à détailler ! Pour le second, j’ai essayé de comprendre comment fonctionne la lumière dans la vraie vie. Je me suis donc naturellement intéressé à la branche de la physique qui étudie la lumière : l’optique.

Le terrier de lapin s'est avéré beaucoup plus profond et labyrinthique que prévue. Ce que j'en retiens, au-dela du fait que c'est beaucoup trop dur pour moi, c'est qu'on a heureusement pas besoin de tout pour faire du rendu. 

On se contantera donc, dans cet article, de situer grossièrement "à quel étage(s)" de la physique le PBR prend sa source avant de construire notre propre modèle de diffusion de la lumière. Ce modèle un peu "avec les mains" et purement pedagogique nous aidera à aquerir un image mentale des différents phénomènes interessant du point de vue du rendu. On s'en servira ensuite comme base depuis laquelle on definira par soustraction ce qu'est un modèle PBR temps réèl.

## II. La vrai physique : celle que je ne comprends pas
Quand on dit que le PBR n'est pas physiquement exacte mais seulement inspiré par la physique, une idée un peu naive à tendance à s'imposer à nous. Celle qu'il y aurait une verité scientifique absolue, trop complexe pour être représentée dans un ordinateur et qu'on aurrait du simplifié par nécessité technique.

Evidament il y a de ça. Mais en chechant cette verité fondamental pour pouvoir expliquer en quoi le PBR en diverge, j'ai progressivement réalisé que c'était en fait plus compliqué  et que ma vision de la science était peut être un peu idéalisée.

Attention si vous être physicien, la suite va peut être vous faire tiquer. Je vais le dire avec mes mots car ce sont les seuls que j'ai alors soyez gentil (mais hesitez pas à me corriger en commentaires). En gros ce que je comprends de comment c'est fichu, c'est que pour chaque grande branche de la physique on a :
- Des théories fondamentales qui décrivent le fonctionnement globale des choses. Je les vois comme des généralisations les unes des autres, valables ou simplement pratiques sous différentes hypothèse (les trucs petits, les bidules grands, les machins quantiques...)
- Des études d'une chose ou d'un phénomène précis que l'on va regarder à travers l'une ou l'autre (parfois plusieurs) de ces théories fondamentales.

Par exemple, la cinématique c'est l'étude du mouvement. Suivant le cadre dans lequel s'inscrit le système qu'on observe, on va l'étudier avec :
- la mécanique classique : si le systeme est à une échelle macroscopique
- la mécanique relativiste : si l'objet se déplace à des vitesses proches de celle de la lumière
- la mecanique quantique : si le système est à l'échelle microscopique (pas sûr qu'on parle encore de cinématique à ce niveau mais vous voyez l'idée ^^)

Pour l'optique, les grande théories sont :
- l'optique géometrique : La lumière est un rayon qui se propage en ligne droite et de manière instantanée. Valable à l'échelle macroscopique (très superieur à la longeure d'onde étudiée). Permet de modéliser la plupart des phénomènes visibles (mais pas tous).
- l'optique ondulatoire : La lumière est une onde électromagnetique. Permet d'expliquer des phenomènes visibles tels que la difraction, la polarisation et les interferences (en plus de ceux déjà décrits par l'optique géometrique).
- l'optique quantique : La lumière est définie en terme de photons et d'états quantiques. C'est le modèle le plus fondamental qu'on ai à l'heure actuelle. (mais aussi le plus incomprehensible)

Et les champs d'étude suceptibles de nous interesser pour le rendu sont :
- La radiométrie : Définie les grandeurs physiques qui caracterisent la lumière (Energie, Flux, Intensité, Radiance, Irradiance...)
- Le transfert radiatif : Etudie la propagation de la lumière et son intéraction avec la matière
- La photometrie : Etudie la perception de la lumière par l'oeuil humain. Introduit notament le concepte de couleur (car oui, "couleur = longueur d'onde" c'est un gros raccourcis).

Par chance, ils fonctionnent tous les trois sous le regime de l'optique géométrique. On y touve parfois des notions empruntées à d'autres théories comme le photon ou la longueure d'onde. Mais ces termes font dans ce cas référence à des versions idéalisées de ces objets physiques. Par exemple, le photon est compris comme une simple particule. Ce qui est assez éloigné de la définition reconnue par la physique quantique.

En une phrase interminable : "les modeles PBR sont un ensemble de techniques numiériques et statistiques apportant des solutions aproximatives à des équations formulées dans des cadres théoriques rigoureux mais imparfait dans le but de produir un résultat de qualité subjective". Ce que je veux dire par là, c'est que la divergence entre physique et PBR ne me semble pas être une question de vérite, mais de rapport à cette verité :
- La physique est fausse, elle le sait, mais elle s'applique à définir précisément en quoi et sous quelles hyphothèses on peut lui faire confience (parce que sinon y a des morts).
- Le PBR est faux, il le sait, et il s'en fou parce que l'objectif, c'est "juste" de faire l'image la plus réaliste possible pour le moins cher possible.

## III. Le Turbo Photon Tartining : qui n'existe que dans ma tête
Dans cette section nous allons donc essayer d'expliquer comment fonctionne cette fameuse "vrai" lumière physique qui n'existe pas. On va rester à un niveau conceptuel, loin de l'austérité de la rigueure scientifique et de ses formules compliquées qui fillent mal au crâne. Regardez moi cette horreur ! Qui à envie de fourrer son nez là dedans ?

[Equation du transfert radiatif]

Ce cauchemard sur pattes, c'est la sainte "équation du transfert radiatif" que des gens avec un très gros cerveau nous ont leguée. Il faudra bien s'y attaquer un jour si on veut vraiment comprendre ce qu'on fait. Mais j'ai deux exellentes nouvelle :
- 1. Ce jour n'est pas arrivé. Dans cette article on va rester sur de "l'optique de comptoir"
- 2. Ce jour n'est pas obligé d'arriver. Comprendre vraiement ce qu'on fait c'est un plus, mais c'est pas obligatoire pour faire de très belles images. 

Si vous avez déjà un peu trainé sur ce blog, vous avez peut être noté que j'aime bien donner de nom débiles aux trucs. Je vous présente donc le "Turbo Photon Tartining" : le modèle qui dit comment les turbo-photons rebondissent sur la turbo-matière pour tartiner la turbo-rétine.

### 1. Definitions

#### 1.1 Le Turbo Photon
Le turbo-photon est une particule qui a :
- une position dans l'espace
- une vélocité (aka une vitesse, mais dans une certaine direction)
- une énergie
- une longueur d'onde

Dans la suite j'appelerai ça un photon sinon ça va vite devenir lourd (ça l'est surement déjà hehe...). Mais gardez en tête que le vrai photon c'est pas ça.

#### 1.2 La Turbo Matière
La turbo-matière, c'est un ensemble de propriétés que l'on va pouvoir assigner à des zone délimitées de l'espace : des volume donc. Ces volumes adjacents qui forment la scène vont conditionner l'intégralité du cycle de vie des photons : naissance, trajectoire, mort, resurection...

Là encore je vais appeler ça de la matière malgré le décalage avec les définitions traditionnelles. Par exemple le vide sera pour nous une matière comme les autres, ce qui n'est pas très académique . (c'est mon modèle je fais qu'est ce que je veux ! Qu'est ce que tu vas faire ? <metal smiley>).

#### 1.3 Flux Radiant et Flux Radiant Spectral
En radiometrie, le flux radiant c'est la puissance totale du flux de lumière. Imaginez un portique placé sur un feseau lumineux. Ce portique peut être ouvert ou fermé et dispose d'un compteur d'energie. Lorsqu'on l'ouvre, le compteur est remise à zéro. Chaque photon qui le traverse est scanné et son énerige est ajoutée au compteur. Le flux radiant du féseau, c'est la valeur affichée par le compteur si on ouvre le portique pendant exactement 1 seconde.

Malheureusement cette quantité ne dit rien de la répartition spectrale de la lumière : c'est à dire des longueurs d'ondes qui la compose. Pour cela on a besion d'une V2 du portique. Ce nouveau dispositif possède plusieurs compteurs et peut scanner la longueur d'onde du photon en plus de son energie.

Le comportement de ce super-portique est similaire à l'ancien, sauf qu'il va assigné un compteur individuel à chaque longueur d'onde. A la fermeture on aura donc toujours l'énergie accumulée mais rangée par longueur d'ondes. Cette répartition de l'énergie en fonction de la longueur d'onde, c'est le flux radiant spectral.

### 2. Les propriés de la matière
La matière est définie par les probabilités qu'un certain evenement se produise en son sein.

#### 2.1 Emission

#### 2.2 Absorbtion

#### 2.3 Diffusion

#### 2.4 Reflection

#### 2.5 Transmission

## IV. Le PBR : good enough for les films et le gaming

## V. Conclusion
Les angles motrs tenaient comment je situe mon modèle 


## OLD ACCUMULATION

Il n'y a donc pas de verité absolue unique qui dis ce que les choses sont ou ne sont pas. Mais un enchevetrement complexe de cadres théoriques qui se savent imparfait mais qui definissent rigoureusement leur domaines de validité.

En une phrase interminable, les modeles PBR sont un ensemble de techniques numiériques et statistiques apportant des solutions aproximatives à l'equation du transfert radiatif formulée dans les termes des grandeurs radiométriques et selon les hypothèses de l'optique géométrique.

Le terrier de lapin s'est avéré beaucoup plus profond et labyrinthique que prévue. L'optique est organisée en plusieurs sous branche qui ont chacunes leurs modèle.


"Téma la taille du rabbit hole !"... j'étais pas prêt ! <smiley> Non seulement le sujet est gigantesque, mais je crois bien que le Turbo Tartine du passé — fraîchement débarqué de la fac et à l’apogée de son *skill* de mathématicien — n’avait déjà pas la moitié du niveau nécessaire pour s’y attaquer sérieusement.

[meme ]

Que fait-on quand on est battu et qu'on comprend pas ce qu'on lit ? ~~On abandonne, on brûle le livre, on décide que la terre est plate et on retourne regarder Hanouna à la télé.~~ On accepte avec humilité qu'on est pas un expert du domaine et on continue de lire en essayant de capter quelques trucs ici et là dans l'espoir de réduire un peu son ignorance.

Pour ne rien vous cacher, j'ai vraiment pas compris grand chose. Mais j'ai rapidement eu l'impression que :
- en rendu graphique, une grande partie de l’optique ne nous concerne pas directement
- Le PBR n'est pas juste une simplification de la réalité. C'est un assemblage de  résultats empruntés à différents cadres théoriques pas nécessairement compatibles entre eux.

Ca m'a un peu décomplexé. J'ai réalisé que ce n'était pas un problème de construire un modèle "un peu farfelu" tant qu’il est cohérent avec ce qu’on cherche à expliquer. L’important n’est pas qu’il soit physiquement exact, mais qu'on soit cappable d'en comprendre les limites et de le situer par rapport à d'autre modèles plus rigoureux.

Tout ça pour dire que dans cet article, je vais utiliser un modèle pédagogique imparfait, plutôt faux d'un point de vue scientifique... mais qui je l'espère, vous permettra de mieux comprendre le PBR : ce qu'il est, dans quel cadre il s'inscrit  et comment il marche.


