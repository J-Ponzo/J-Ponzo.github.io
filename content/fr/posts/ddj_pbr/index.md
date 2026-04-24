+++
author = 'Turbo Tartine'
date = '2026-01-31T09:06:29+01:00'
draft = true
title = "Du photon au pixel : Prologue"
description = "Introduction de la serie d'article de vulgarisation sur le PBR"
hidden = false
+++

## I. Bonne année 2026
"Bonne année à tous ! En cet an de grâce 2026, j'ai pris la résolution de... Waw ! Comment ça avril ?!" 

Et oui comme tous les ans, les fêtes de fin d'année m'ont un peu roulé dessus. Mais si je n'ai rien publié depuis novembre dernier ce n'est pas uniquement à cause de ça.

D'abord le jeu sur lequel je travail à Wanadev Studio est sorti en early access. Les review sont excellentes et on est super contant de comment ça se passe. Si ça vous interesse, le jeu s'appel Species:Unknown et la page steam est [ici](https://store.steampowered.com/app/2747330/Species_Unknown/).

Malheureusement un early access, ça prend aussi un peu de place. Pas forcement dans mon emploi du temps, mais dans la tête. J'ai donc un peu réduit la voilure sur les projets perso histoire de gérer l'effort et je me suis attelé à autre chose.

## II. Un article dédié sur le PBR
Dans la serie de devlog du projet OpenRE, je me suis retrouvé à devoir expliquer ce qu'est le Physicaly Based Rendering (PBR). Ce faisant, je me suis rendu compte que :
- le sujet est trop vaste pour tenir dans une simple section d’article
- il y avait quelques angles morts dans ma compréhension des choses

C'était l'occasion de remédier à cela. J'ai donc chercher à comprendre comment fonctionne la lumière dans la vrai vie. L'idée était la suivante : si le PBR est une simplification de la réalité, on devrait pouvoir le definir facilement en partant du vrai modèle et en expliquant en quoi il s'en distingue.

Le plan était infaillible ! Seulement voila, la physique, c'est plus compliqué qu'il n'y parait.

## III. La "vrai" physique
Sans parler du fait que c'est vite trop dur pour moi, je crois que j'ai courru après une chose qui n'existe pas vraiment. En effet, la science, ce n'est pas cette verité ultime qu'on se plais à fantasmer. C'est un enchevetrement de cardes théoriques rigoureux mais imparfait qui naissent de nos observtions empiriques du monde.

Il est tentant de les hierarchiser en les plassant sur un axe avec d'un côté les modèles simples mais faux eet de l'autre les modèles vrai mais complexes.

[Schéma cinématique : Terre plate - ... - mecanique classique - relativiste - quantique - ???]

C'est un peu comme ça que je voyais les choses jusqu'à maintenant. Mais je me suis rendu compte de la naïveté de ce schéma mental. D'abord les différents cadres théoriques ne sont pas obligatoirement des généralisation les uns dés autres. Ils peuvent tout à fait vivre en paralelle. Mais plus important encore, la science est moins une question de degré de vérité que de niveau d'explication.

La mécanique quantique, c'est la théorie la plus fondamental dont on dispose aujourd'hui. C'est à dire en gros : plus "vrai". Si on prend par exemple une voiture, on peut dire que c'est une conjonction complexe d'ondes de probalités (si ça pique dite vous un "bopugiboulga d'atomes" ça change pas grand chose au raisonnement). 

On peut facilement étandre cela à un groupe de voiture ainsi qu'à la route sur laquelle elles roulent. Mais ça n'a aucun interet si on cherche à étudier le trafic routier. Ce n'est pas faux : c'est juste le mauvais niveau d'explication.

## VI. Et la lumière dans tout ça
La difficulté avec ce qu'on appel "la lumière", c'est que ce n'est pas un phénomène local que l'on peut facilement raccrocher à un seul niveau d'explication. Il émerge de différents cadre théoriques.





Le terrier de lapin s'est avéré beaucoup plus profond et labyrinthique que prévue. Ce que j'en retiens, au-dela du fait que c'est beaucoup trop dur pour moi, c'est qu'on a heureusement pas besoin de tout pour faire du rendu. 

En effet, je suis tombé dans un petit rabbit hole super interessant en essayant de répondre à une question toute bête et dont je pensais connaitre la réponse : le Physicaly Based Rendering c'est quoi ?

Ce qui devait être un petit section de mon prochain devlog (en plan depuis janvier...) à progressivement dégéneré en cette serie d'articles. Il y a eu des haut et des bas, des avancées et des impasses, mais j'ai beaucoup aprécié développer ma copréhention de ces sujets.

J'expère que vous apprécirez tout autant leur restitution.

## III. J'ai glissé chef !


## BIG ARTICLE

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

Si vous avez déjà un peu trainé sur ce blog, vous avez peut être noté que j'aime bien donner de nom débiles aux trucs. Je vous présente donc le "Turbo Photon Tartining" : le modèle qui dit comment les turbo-photons rebondissent sur la turbo-matière pour tartiner vos turbo-rétines.

### 1. Definitions

#### 1.1 Le Turbo Photon
Le turbo-photon est une particule qui a :
- une position dans l'espace
- une direction
- une vitesse
- une énergie
- une longueur d'onde

Dans la suite j'appelerai ça un photon sinon ça va vite devenir lourd (ça l'est surement déjà hehe...). Mais gardez en tête que le vrai photon c'est autre chose.

#### 1.2 La Turbo Matière
La turbo-matière, c'est un ensemble de propriétés que l'on va pouvoir assigner à des zone délimitées de l'espace : des volume donc. Ces volumes adjacents qui forment la scène vont conditionner l'intégralité du cycle de vie des photons : naissance, vie, mort, resurection...

Là encore je vais appeler ça de la matière malgré le décalage avec les définitions conventionnelles. Par exemple le vide sera pour nous une matière comme les autres, ce qui n'est pas très académique . (C'est mon modèle. Je fais qu'est ce que je veux ! <metal smiley>).

#### 1.3 Flux Radiant et Flux Radiant Spectral
En radiometrie, le flux radiant c'est la puissance totale du flux de lumière. Imaginez un portique placé sur un feseau lumineux. Ce portique peut être ouvert ou fermé et dispose d'un compteur d'energie. Lorsqu'on l'ouvre, le compteur est remise à zéro. Chaque photon qui le traverse est alors scanné et son énerige est ajoutée au compteur. Le flux radiant du féseau, c'est la valeur affichée par le compteur si on ouvre le portique pendant exactement 1 seconde.

Malheureusement cette quantité ne dit rien de la répartition spectrale de la lumière : c'est à dire des longueurs d'ondes qui la compose. Pour cela on a besion d'une V2 du portique. Ce nouveau dispositif possède plusieurs compteurs et peut scanner la longueur d'onde du photon en plus de son energie.

Le comportement de ce super-portique est similaire à l'ancien, sauf qu'il va assigné un compteur individuel à chaque longueur d'onde. A la fermeture on aura donc toujours l'énergie accumulée mais rangée par longueur d'ondes. Cette répartition de l'énergie en fonction de la longueur d'onde, c'est le flux radiant spectral.

#### 1.4 La couleur
Si vous avez quelques souvenirs du Lycée, vous vous rappelez vaguement que :
- les longueures d'onde < 380nm sont invisible et sont appelées les ultra violets
- les longueures d'onde > 780nm sont aussi invisible, mais appellées infra rouges
- les longueures d'onde entre les 2 forment le spectre des **"**couleurs**"** visibles qui s'étant de la **"**couleur**"** bleu à la **"**couleur**"** rouge.

[Shema spectre visible avec blague sur le fait que ultra et infra sont inversés]

Vous les avez bien vu les guillemets de **"**couleur**"** ? C'est bon ? Alors on se prend tous par la main, et on va le dire à haute voix tous ensemble une bonne fois pour toutes : 

**"Non ! Les longueur d'onde ne sont pas des couleurs !"**

Ce que l'être humain appel une couleur, c'est l'interpretation qu'il fait, non pas d'une longueur d'onde isolée, mais de la totalité du flux radiant spectral qu'il se prend dans l'oeuil quand il l'ouvre.

Ca c'est du bleu :
[Spectre pic bleu]

Ca c'est du rouge :
[Spectre pic rouge]

Ca c'est du jaune :
[Spectre pic jaune]

Mais ça c'est aussi du jaune :
[Spectre 2 pics jaune]

Et ça c'est quoi ?
[Spectre 2 pics rose]

(Chez vous, indice : vous pouvez me montrer le rose dans le spectre des **"**couleurs**"** visibles ?)

Garder vos questions dans un coin. On y répondra avant la fin de l'article. D'ici là retenez qu'on utilise des couleurs pour représenter les longueurs d'onde qui compose un spectre parce que c'est plus facile de s'y retrouver. Mais la couleur à proprement parler, c'est l'interprétaion que votre cerveau fait des signaux que les cônes de votre oeil lui envoi lorsqu'ils sont stimulés par le flux radian spectral.

### 2. Phénomènes de bas-niveau :
Ce que j'appèle phénomènes de bas-niveau, ce sont les comportement élémentatires des photons pris individuellements lors de leur voyage à travers la matière. (Ce n'est pas un terme officiel. Ne le sortez dans une conversation).

Dans notre modèle, ces phénomènes sont probabilistes. C'est à dire qu'ils vont avoir une chance de se produire, ou pas. Et pour nous, cet ensemble de probabilités, c'est ce qui va carracteriser la matière.

Modéliser tout ça mathématiquement serait infiniment complexe et fort peu didactique (et surtout je sais pas faire). On se contantera donc des descriptions prosaïques suivantes.

#### 2.1 Emission
Toutes les matières ont une certaine probabilité d'émetre des photon. Tous les objets qui nous entoure produisent donc de la lumière. Pas seulement l'écran et la souris RGB de gamer. La chaise, le bureau, les murs... tout ça emet bien des photons. Mais la plupart du temps, leur longueur d'onde est en dehors du spectre visible (sauf si vous avez une chaise RGB mais là on peut plus rien pour vous).

Les valeurs des différentes caracteristique du photon émis ne sont pas forcement equiprobables. On aura notament de la variance pour :
- la longueur d'onde : on vient d'en parler
- la position : les photons peuve apparaitre plutôt au centre ou plutôt en peripherie
- la direction : certains rayonnements sont plus directionnels que d'autres

Notez que des conditions exterieur peuvent également influer sur les propriétés d'émissivité de la matière. Par exemple plus la température est haute, plus les photons émis sont nombreux, energetiques et situés dans un spectre large et décalé vers des longueure d'ondes courtes. Autrement dit, même si votre chaise n'est malheureusement pas RGB, il suffit théoriquement de la chauffer suffisament pour qu'elle brille quand même dans le noire (mais si vous faites ça ne vous assayez pas dessus).

[Schema fer chaufé à blanc]

#### 2.2 Absorbtion
"La matière donne, mais la matière reprends !" A chaque instant, un photon à une chance (ou plutôt malchance) d'être absorbé par la matière qu'il traverse. Lorsque cela se produit, son energie est recyclée dans autre chose :
- Dissipation thermiques : La température augmente, ce qui donne une intuition de pourquoi la matières chaude émet plus (elles a enmagasiné plus d'énergie à dépenser)
- Courant électrique : C’est le principe des panneaux solaires (processus photo-électrique)
- Ré-émitions : L'énergie est transférée à un éléctron, qui se décharge de ce surplus en créant un nouveau photon. Imédiatement (fluorécense) ou de manière différée (phosphorécense) 
- Réaction chimique : L’énergie peut être utilisée pour modifier la structure électronique ou moléculaire de la matière, en cassant ou en créant des liaisons. C’est le principe de la photosynthèse.

Toutes les longueurs d'ondes ne sont pas égales vis à a vis des probabilités d'absorbtion. Pour les materiaux, le flux radiant spectral, c'est un packet de dragibus. Certains son voraces, d'autre plus raisonnables. Certains sont particulièrement friant des rouges et des bleus, mais pas trop des jaunes, d'autres s'en fichent et font pas la différence (miam miam miam du sucre).

En consequence, la répartion spectrale du flux radiant est altérée par l'absorbtion, ce qui in-fine donne aux objets leur couleur :
- Noir : le materiau est turbo-vorace, tends lui le paquet et tu est sûr de jamais le revoir. C'est pour ça qu'on dit que le noir tiens plus chaud que le blanc.
- Blanc : Là on est en face d'un materiaux qui fait attention à sa ligne. En apparence au moins (rien ne dit qu'il ne se jette pas sur les infra-rouges des qu'on tourne le dos)
- Bleu : On dit souvent que la nature n'aime pas le bleu. Au contraire, si on en vois jamais c'est parce qu'elle à tout mangé (et elle a raison, team bleu ! c'est les meilleurs !).

#### 2.3 Diffusion
Quand un photon rate son jet de destin, il est donc absorbé. Mais si il le réussi, il doit encore faire un jet de diffusion. Le resultat de ce nouveau lancé va déterminer sa nouvelle direction. La encore, ce sont les caracteristiques de la matière qui déterminent les probabilités associées à chacunes des directions possibles. 

Ainsi on distinguera des materiaux :
- isotropes : qui diffusent de manière equiprobable dans toutes les directions
- anisotropes à diffusion avant : diffuse majoritairement dans la direction du photon
- anisotropes à diffusion arrière : diffuse majoritairement dans le sens inverse du photon
- Des choses plus exotiques qui diffusent dans une direction indépendante de celle du photon (comme les yeux de votre chat qui renvoit toute la lumière vers vous quand ils vous fixent dans l'obscurité) <à vérifier https://fr.wikipedia.org/wiki/Tapetum_lucidum>

Ici aussi, le comportement peut varier selon la longueur d'onde. C'est notament pour ça que le ciel est bleu. <à vérifier>

#### 2.4 Reflection, Transmission et Fresnel
Jusqu'ici on a décrit comment ça marche à l'interieurs des materiaux. Mais quand on arrive à la frontière entre 2 volumes aux propriétés différentes : nouvelles regle ! Le photon fait cette fois-ci un jet de transmission. Si il le réussi, c'est bon : les videurs le laisse entrer. On dit que le photon est transmis.

De là il pourra continuer sa route dans la nouvelle matière mais il va d'abord être réfracté : c'est à dire dévié de sa direction initiale en fonction :
- de l'ange d'incidence avec la frontière
- des indices de refraction (IOR) des 2 materiaux

En cas d'échec du test de transmission, il rebondit sur la frontière. On dit qu'il est reflechi.

[Schéma refraction]

La probabilté d'être reflechi est donc liée à celle d'être transmis. Le photon ne lance les dés qu'une seule fois et selon le resulta, on aura soit l'un soit l'autre. Ce qui détermine le seuil de réussite c'est le Fresnel (pro tips : le 's' ne se prononce pas). Et comme la refraction, il dépend lui aussi de l'angle d'incidence et des IORs des materiaux.

[Schéma refraction avec fresnel]

Le jet de transmission est ainsi plus difficile pour un photons rasant que pour un photon qui arriverait perpendiculaire à la surface. C'est la raison pour laquel quand on regarde une vitre de face, elle est bien transparante, mais au plus on la regarde de biais, au plus elle se comporte comme un miroir.

[Gif fenetre]

#### 2.5 Dispertion et Reflectance Spectrales :
On ne l'a pas évoqué dans la partie précédente, mais l'IOR est fonction de la longueur d'onde. Prenons par exemple 2 photons qui arrivent à la frontière selon le même angle d'incidence mais qui ont des longueurs d'onde différentes. Et bien il n'auront pas la même chance d'être transmis, et si ils le sont, leur angle de réfraction sera différent (puisque les 2 phenomenes dépendent de l'IOR).

Dans le cas de la refraction, cela va donner ce qu'on appel la dispertion spectrale. C'est ce qui donne naissance aux arcs en ciel et aux aberrations chromatiques.

[Effet arc en ciel]

Pour la transmision ça va se traduire plutôt par la dissociation de la répartition spectral entre le flux radiant reflechi et le flux radiant transmis. Dit autrement, les reflets auront une couleur différente de celle de l'objet. On parle de relfectance spectrale.

[Relfectance spectrale]

### 3 Phénomenes de haut-niveau :
Quand un photon unique traverse la matière, il est donc soumis aux phénomènes de bas-niveau. On a vu que ces derniers sont probabilistes. Mais si on considère une très (très, très) grande population de photons, la magie des grands nombres va en quelques sortes "stabiliser" la nature aléatoire de la lumière. Et de cette stabilisation vont émerger de nouveaux phénomènes, plus globaux, que j'appelle : phénomènes de haut-niveau.

#### 3.1 Transparence
La transparence, c'est quand un materiau transmet beaucoup, mais diffuse et absorbe peu. Les photons le traversent de part en part tout en conservant une certaine cohérence directionnelle. Ce qui fait que l'on distingue assez netement l'image qui se trouve derrière.

[schema]

Ce qui permet à notre oeuil de deceler sa présence, c'est principalement la réfraction et le fresnel.

#### 3.2 Transulucidité
Un materiau translutcie possède lui aussi une transmission consequente et une faible absorbtion permetant aux photons de le traverser. Mais contrairement à un materiau transparent, la diffusion y est très forte, induisant un très grand cahos directionnel.

[schema]

En somme la lumière passe, mais elle est completement homogéneisée par la diffusion, ce qui ne permet pas distinguer les formes qui se trouvent derrière l'object.

#### 3.3 Opacité Diélectrique
L'opacité dielectrique se caracterise par une absorbtion et une diffusion fortes. La lumière rentre mais est rapidement absorbée et ne parvient pas à pénetrer en profondeur (encore moins traverser). 

Toutefois, avant d'être absorbées, certains photons parvienent à ressortir du côté où ils sont entrés par diffusions successives. C'est ce qu'on appelle la lumière diffuse. 

C'est materiaux peuvent être plus ou moins reflectifs/transmissifs. Un materiau qui transmet 100% de la lumière n'existe pas mais il a quand même un nom : c'est un lambertien pur. Il ne se distingue que par sa diffuse tandis qu'un materiau qui reflechi plus ou moins la lumière, aura en bonus plus ou moins de reflets.

[schema]

#### 3.4 Le Continum Diélectrique
Ces 3 phénomenes décrivent les materiaux dielectriques. C'est à dire, tout ce qui n'est pas un metal. Il ne faut pas les voire comme des classes hermetiques entre elles. En réalité, on peut ranger les materiaux diélectriques sur un graphe qui aurait pour abssyce la diffusion et pour ordonnée l'absorbtion.

[graph]

Transparence, opacité et translucidité sont alors des zones de ce graphe, remarquable mais aux contours flous. Les materiaux diélectriques ne sont pas rangés dans l'une ou à l'autre de ces cathégories. Ils s'en rapprochent à différents degrés.

#### 3.5 Selectivité spectrale
On à vu que les phénomènes de bas-niveau pouvaient varier selon la longueur d'onde. Les phénomènes de haut-niveau qui n'en sont qu'une stabilisation statistique à grande echelle heritent naturellement de ce comportement.

Ainsi, les materiaux diélectriques sont non seulement définis par une position dans un graph. Mais en plus cette position peut varier selon la longueur d'onde considérée. Voyons ensemble quelques cas concrets.

##### 3.5.1 La menthe à l'eau
Si vous prenez par exemple de la menthe à l'eau, on peut dire que c'est un materiau qui est peu diffusant sur la totalité du spectre visible. En revanche, il est peu absorbant pour les longueurs d'onde autour du vert, mais très absorbant pour les autres. 

[Image]

D'une certaine manière, on peut dire que la menthe à l'eau est tranparente pour le vert mais opaque pour le reste.

##### 3.5.2 Le pastis
Pour le pastis on observe le même phénomène d'absorbtion selective mais pour un matriau qui cette fois diffuse beaucoup sur tout le spectre. Les photons qui ne contribuent pas au jaune sont très vite absorbées tantis que les autres survivent mais voient leur cohérence directionnelle est détruite par la diffusion.

[Image]

On peut dire que le pastice est tranlucide pour le jaune, et opaque pour le reste.

##### 3.5.3 Le ciel
Pour l'atmosphère cette fois on est dans un cas différent. Ce n'est plus l'absorbtion qui est selective, mais la diffusion. Les longueur d'onde bleu de la lumière du soleil sont détournées dans toutes les directions tandis que le reste continue sa route en ligne droite. 

Une partie de la composante bleu qui devrait nous passer au dessus de la tête nous parvient donc par diffusion. C'est pour ça que ciel est de cette couleur.

[Image]

L'atmosphère est donc translucide pour le bleu et transparente pour le reste.

#### 3.6 Opacité Conductrice (le métal <diable>)
Les conducteurs, c’est-à-dire les métaux, sont une espèce à part. Contrairement aux diélectriques, ils reflechissent la quasi totalité de la lumière qui se présentent à leur interface, et la faible part qui pénètre est absorbée quasi instantanement. 

Il n'y a donc pas de vie photonique à l'interieur de la matière. En conséquence, les métaux ne présentent pas de lumière diffuse. Ce qui permet de les distinguer visuellement, ce sont les reflets.

[schema]

Ces reflets sont eux aussi soumis à une sélectivité spectrale, ce qui confère à chaque métal une teinte caractéristique.

## IV Perception Humaine
L'oeil humain est constitué de 2 types de cellules qui réagissent à la lumière : les batonnets et les cônes. La spécialisation de ces photorecepteurs nous permettent de percevoir le monde selon plusieurs modes (vision nocturne, vision diurne, vision central, vision peripherique ...). Ces modes sont appelés des domaines de vision. Ces domaines ne sont pas exclusifs et se chevauchent en permanance. Mais va les étudier séparément pour plus de clarté.

### 1 Domaine de vision nocturne
Les batonnets sont les cellules qui nous permettent de "voire" dans le noir (même si l'humain est plutôt mauvais à ce jeu là). Ils sont en effet beaucoup plus noubreux et beaucoup plus sensibles que les cône. Ce qui leur permet de s'activer à des seuils beaucoup plus faibles. 

Contrairement aux cônes ils ne sont pas différentiés et s'activent tous de la même façon. En consequence ils ne permettent pas de distinguer les couleurs. Dans l'obscurité, la vision humaine est achromatique. Ce n'est pas vraiment du noir et blanc, mais c'est l'idée.

Notez également qu'une trop forte intensité lumineuse dégrade la prothéine qui permet l'activation des batonnets. Ce qui veut dire qu'ils s'activent beaucoup moins bien de jour. La proteine se régénèrent naturellement lorsqu'on eteind la lumière mais le processus prend un certain temps. C'est pour ça qu'au plus on reste dans l'obscurité, au mieux on voit.

Inversement quand on rallume la lumière d'un coup, on est ébloui car les batonnets saturent. Heureusement la proteine, est rapidement dégradée et en quelques secondes on y voit normalement.

### 2 Domaine de vision diurne
Les cônes, qui ont un seuil d'activation plus élevé, n'ont pas besoin d'un mecanisme d'inibition aussi sophistiqué que les batonnets. Ils prennent simplement le relais en conditions diurne (le jour).

Ce qui fait toute la différence avec leur cousin achromatique, c'est que ces cellules sont présentes en 3 saveurs :
- Les cônes S : Short wave length.
- Les cônes M : Mid wave length.
- Les cônes L : Long wave length.

La sensibilité d'un cônes à telle ou telle longueure d'onde c'est ce qu'on appel la réponse spectrale. C'est une courbe progressive, qui s'étale sur une plage entière du spectre.

[Schéma]

On parle souvent de cônes rouge (L), vert (M) et bleu (S) même si les pics ne correspondent pas tout à fait à ces appellations. Dans le shéma ci-dessus, vous pouvez constater par exemple que le pic de la réponse spectrale des cones rouges se trouve plutôt dans les longueures d'onde jaunes (et la bleu est vraiment limite). 

En fait ce qui compte ce n'est pas vraiment le pic, mais plutôt "quelle courbe domine sur le tronçon". Si vous regardez à nouveau les courbes avec cette information, ça vous parrait peut être un peu plus cohérent.

Ainsi la seule information qui arrive jusqu'au cerveau, c'est un triptet de valeurs. Chacune correspondant à l'intensité mesurées par un types de cônes. Ce qui correspond à la sensation produite par le cerveau, qu'on appel "couleur", c'est ce fameux triplet de valeurs.

### 3 Domaines de vision central et peripherique
La répartition des cônes et des batonnets sur notre rétine n'est pas homogène. En effet les batonnets sont beaucoup plus présent sur le bord de la rétine qu'au centre. C'est la raison pour laquelle les étoiles vous paraissent moins brillantes quand vous les fixez que quand vous regardez légerement à côté.

Au contraire, les cônes sont présent presque exclusivement au centre. En consequence, notre vision peripherique distingue très mal les couleurs. Mais ce n'est pas sa fonction principale. Sa mission c'est de détecter le mouvement (les batonnets ont une réponse plus rapide aux variations de lumière).

### 4 Pourquoi c'est important ?
On pourrait considérer que ce qu'il se passe dans l'oeuil, c'est hors sujet vis à vis du rendu. Après tout, un moteur grahique, ça calcule le flux radiant spectral pour chaque pixels de votre écran. Tant qu'il a juste et que l'écran est bien calibré on est bon, non ?! Si l'oeuil fait la différence avec la vrai vie, c'est que c'est mal fait !

En bien non ! Regarder une surface 2D, fixe, qui n'occupe qu'une partie du champs de vision, c'est très différend du monde réèl. La VR permet de repousser cette limitation, mais même comme ça vous ne pourrez pas arnaquer completement votre oeuil.

Pour mitiger cela, les jeux vidéos mettent en place des techniques plus ou moins efficaces (et plus ou moins impopulaires pour certains joueurs). La plupart du temps ce sont des post process : 
- vinietage
- auto-exposure
- depth of field
- color grading 

Mais ce qui est vraiment important, c'est qu'on sais maintenant ce qu'est une couleur. On va donc pouvoir revenir sur les exemples qu'on à mis de côté dans la partie précédente.

### 5 Retour sur la couleurs
Nous disions donc que ces deux répartitions spectrales du flux radiant correspondaient a la couleur jaune. Et c'est vrai ! Pour notre cerveau c'est exactement la même choses.

[Jaune VS Jaune]

La raison est simple, la réponse spectrale des cônes est rigoureusement identique. Mais ça ne veut pas dire pour autant que les 2 lumières réagissent de la même façons lors de leur interaction avec la matière. 

En effet leur composition n'étant pas identiques, les diverse modalités de selection spectral vont donner des répartition résiduelles différentes. Et ces répartition résiduelles peuvent tout à fait présenter des réponses spectrales différentes (et donc dicernable pour l'oueil).

[Gif selection spectrale appliquée]

Notre perception des couleurs est donc imparfaite et comporte en quelques sortes des collisions (au sens fonction de hachage). En plus d'être imparfaite, elle varie d'un individu à l'autre. Et oui, votre perception des couleurs est sensiblement différente de la miene.

La plupart du temps ce sont des micro décalages que l'on peut négliger. Mais certaines spécificités génétiques peuvent donner lieu à des différences plus significatives. Les différents daltonismes augmentent par exemple le nombre de collisions, tandis que les tetrachromacies le dimiue.

## IV. Le PBR : good enough for les films et le gaming
Maintenant qu'on à posé le cadre de ce qu'on considère comme "la réalité", on va pouvoir s'interesser aux simplifications que le PBR lui applique. Dans un second temps, on décrira le framework général selon lequel il est traditionnelement implémenté.

Le cas d'utilisation qu'on aura en tête sera le rendu temps réèl dans un jeu vidéo. Evidement, les modèles offline peuvent se permettre plus de choses. On essaira donc de pointer les différence lorsque c'est pertinant, mais on ne s'y attardera pas.

A noter également que les moteurs modèrnes utilisent de plus en plus de techniques plus ou moins liées au PBR pour en repousser les limitations historiques. Nous ne traiterons pas ces techniques car je ne sais pas comment elles marchent (pour le moment !). On se contantera de les évoquerer et qui sait, ce sera peut être l'objet d'articles annexes un jour. 

### 1 Limitations
Evacuons rapidement les premières simplifications evidentes et leurs consequences :
- **1. Les transferts d'énerie liés à l'absorbtion ne sont pas pris en compte** => pas de fluorécense / phosporécence, pas de décalage de bande liée à la température ou autre phénomène complexes
- **2. Seuls les materiaux solides/déformables sont pris en charge** => Les liquides et les gaz/fumées sont assimilés au vide ou reprensentés autrement (particules, volumetrique lights, fog, skylight...)
- **3. On considère la vision comme exclusivement chromatique et uniforme sur tout le champs de vision** => Tous les effets liés aux différents domaines de vision sont soit ignorés, soit simulés autrement
- **4. Le phénomène d'emission est ignoré** => Si la matière n'introduit pas la lumière dans le système, on a besoin d'entité artificielles pour le faire : point light, spot light, directionnal lights etc...

#### 1.1 Le mensonge de l'emissive
Le PBR ne tiendrait pas compte de l'emission de la matière... dans ce cas pourquoi mon mesh a une texture d'emissive ? Et pourquoi il brille dans le noir ? C'est pas de la lumière ça ?

[Image emissive]

Quand je dis que l'emission est ignorée, je veux dire que ce n'est pas ça qui injecte la lumière dans le système. L'emissive mapping c'est une stratégie de contournement permettant de rendre des objects comme un écran, de la lave, les runes magiques de l'armure d'un nain... mais le phénomène est purement local, il ne se transmet pas aux reste de l'environnement.

Par exemple quand on allume une empoule, l'emissive c'est ce qui fait briller le mesh et lui donne son aspect allumé. Mais ce qui éclaire vraiment la pièce, c'est la point light qu'on a mis dessus.

[Illustration empoule]

Petite précision, les modèles offline considèrent vraiment l'emissive comme une source de lumière qui se transmet à l'environement. C'est le cas de Cycles (le ray tracer de Blender), mais on peut aussi retrouver ça dans un moteur de jeu. Par exemple quand on bake les lights dans Unreal, l'emissive affecte l'environnement.

[Images light bake]

Mais je n'ai pas menti pour autant, les lightmaps ça reste du offline. (Et lumen ?... Oh ça suffit laissez moi tranquille un peu ^^ Demandez aux actionnaires d'Epic. Ils doivent bien savoir puisqu'ils investissent dedans.)

#### 1.2 modèle surfacique
La première grande simplification oppérée par le PBR, c'est de passer d'un modèle volumetrique, à un modèle surfacique. On ne s'interesse plus à ce qu'il se passe à l'interieur de la matière et on considère que tous les phénomènes ont lieu à l'interface.

Ce changement de paradigme va avoir plusieurs consequences.

##### 1.2.1 Abstraction par l'Albédo
Le paradigme surfacique ne permets plus vraiment de décrire les comportements internes de diffusion et d'absorbtion. Les deux sont alors amalgamés dans une notion unique : l'albédo.

L’albédo est donc une façon de modéliser, de manière localisée à la surface d’un objet, la sélection spectrale combinée de la diffusion et de l’absorption. 

[schema]

##### 1.2.2 Perte du caractère spectral
Techniquement, l'albedo prend la forme d'une texture appliquée sur un mesh. Idéalement, chaque texel devrait représenter le caractère spéctral de l'albédo (une courbe en fonction de la longueur d'onde). Mais en plus des considération techniques, ce serait un travail titanesque et pas très intuitif de modéliser dans ce niveau la de détail. On utilise donc le bon vieux RGB à la place.

Ce faisant, on perd forcement un peu de réalisme. Mais on gagne beaucoup en productivité. Certains renderer offline utilisent vraiment des spectres mais ça reste rare (Cycles ne le supporte pas). Pour modéliser les scènes dans ce cas, on peut avoir recours à des bases de données de materiaux réèls mesurés avec un spectrophotomètre pour avoir directement les courbes.

#### 1.3 Modèle Microfacettes
Vous pouvez polire une surface aussi longtemps que vous voulez, à l'echelle microscopique, elle ne sera jamais vraiment plate. Les micros aspérités sont indicernable pour nous mais elles sont bien là : ce sont les microfacettes.

[Schema microfacettes]

Selon le materiau considéré, les microfacettes vont être plus ou moins cahotiques. Et puisque l'angle d'incidence influe sur le destin d'un photon, cette caracteristique va biensure jouer un rôle dans le rendu. En effet les surface rugeuses dégradent la cohérence directionnelle des photons reflechis ce qui a pour effet de troubler les reflets (un peu comme la diffusion trouble l'image dans le cas de la translucidité).

Sur le papier c'est assez logique mais ça pose évidament des problèmes techniques. On imagine mal un artiste modéliser les millions de milliards de faces composant chaque cm² de son mesh. Et un ordinateur actuel serait incapable de rendre un mesh aussi lourd (voir même de le stoquer). Mais il y a plus grave encore.

En réalité même avec des artiste surhumains et des supercalculaters, on aurait toujours un problème d'ordre conceptuel : j'ai nommé, le "mur du changement échelle". En effet, une chose peut être ponctuelle et unitaire au niveau macroscopique, mais devenir un véritable océan lorsqu'on la considère à une échelle micoscopique. Je m'explique. 

Le fragment shader à entre autres besoin d'une normal pour calculer l'éclairage en un pixel donné. A l'échelle macroscopique cette normale est unique et bien définie : on projete le pixel en un point de la scène et on prend la normale du triangle qui contient ce point. Le problème c'est qu'à l'échelle microscopique, les faces sont beaucoup plus petites que notre pixel projeté. On a donc non pas une face unique, mais des milliers de microfacettes ayant chacune leur propre normale.

On ne peut donc pas prendre en compte les microfacettes telle quel. On a besoin d'un astuce.

#### 1.4 Roughness
Si l'albedo est une abstrction surfacique de la complexité interne de l'interaction photons / matière, la rougness est l'abstraction macroscopique de la complexité microscopique des microfacettes.

Plus concretement, c'est un paramètre qui permet de quantifier la variance des normales des micro facettes :
- roughness = 0 : la surface est completement lisse. Les normales des microfacettes sont paralelles
- roughness = 1 : Le chao est maximal et les normales des microfacettes n'ont aucune cohérence directionnelle

A cause des problème décrits dans la partie précédente, le PBR n'utilise pas directement le modèle des microfacettes. A la place il est basé sur des fonctions permetant d'approximer ses effets à l'échelle macroscopique. Et ces fonctions utilisent la roughness comme abstraction du chaos directionnel des microfacettes. On détaillera tout ça dans la partie suivante.

### 2 Framework
Si vous avez survecu jusqu'ici bravo ! On va enfin pouvoir rentrer dans le vif du sujet. Ca fait beaucoup de lecture prélimitaire, je sais. J'aurais pu faire quelque chose de plus synthetique. Mais je ne voyais pas l'interait de présenter une nième implémentation de référence. C'est ce que fond déjà la plupart des article sur le sujet (et il sont mieux écrit que les miens ^^) 

Je trouvais donc plus interessant d'aborder le PBR en tant que framework. Et pour faire ça, il fallait déboussailler un peu l'empilement de notions qui se cache dessous. Maintenant que c'est chose faite, on va pouvoir se lancer.

#### 2.1 BSDF
En rendu PBR, l'intéraction lumière-matière est modélisées par ce qu'on appel une BSDF. C'est l'abreviation de Bidirectional Scattering Distribution Function et c'est de là que vient le nom noeud "Principled BSDF" que vous avez surement déjà croisé dans Blender.

Il s'agit d'une fonction mathématique qui prend en parametre une direction d'entrée dE et une direction de sortie dS. Sa mission est de calculer le flux radiant spectral resultant le long de dS à partir du flux radiant spectral entrant le long de dE.

[Schéma]

Il en existe plusieurs variantes : 
- BRDF : Bidirectional **Reflectance** Distribution Function
- BTDF : Bidirectional **Transmitance** Distribution Function
- BSSRDF : Bidirectional **Subsurface Scattering Reflectance** Distribution Function
- BSSTDF : Bidirectional **Subsurface Scattering Transmitance** Distribution Function

Voyons à quoi elles correspondent.

##### 2.1.1 BSSRDF
On va commencer par la fin parce que je trouve que c'est plus claire comme ça. La BSSRDF s'interesse au flux radiant spectral qui entre et sort du même côté de la surface.

[Schema]

Cela correspond à la partie réflechie, mais également tout ce qui resort par diffusions successives.

##### 2.1.2 BSSTDF
La BSSTDF traite au contraire le flux radiant spectral qui entre d'un côté de la surface mais ressort de l'autre (c'est à dire la partie qui pénetre dans l'objet).

##### 2.1.1 BRDF / BTDF

Le 'R' de BRDF veut dire "Reflectance". Cette fonction décrit la partie de la lumière qui resort du même côté qu'elle est entrée. Ca regroupe la partie réfléchie et la partie diffuse qui resort par rebons successifs.

[Schema]

Le 'T' de BTDF signifie "Transmitance". Ici on s'interesse à ce qui passe de l'autre côté de la surface. C'est à dire ce qui rentre dans l'objet.

[Schema]



On les notes BxDF avec 'x' décrivant le phénomène qu'elles modélise :





https://en.wikipedia.org/wiki/Bidirectional_scattering_distribution_function

##### 1.2.2 Hypothèse d'intéraction locale
En plus de se limiter à un modèle surfacique, le PBR suppose une intéraction locale. Ca à l'aire compliqué mais en fait pas du tout ! 

En gros jusqu'ici on a établi que :
- La lumière entre dans la matière en un point P1 de la surface. Elle fait sa vie (ou meurt) à l'interieur. Et eventuellement, elle resort de la matière en un point P2 de la surface
- Le PBR ne traite pas la partie interne du transport de la lumière et résume ça par l'albédo

[Illustration P1, P2, Intern VS albedo]

Et bien l'hypothèse d'intéraction locale, ça veut juste dire qu'en plus de ça, le PBR force : P1 == P2

[Illustration P1 == P2]

Pour la plupart des materiaux opaques ça ne change pas grand chose car le voyage de la lumière y est très court. En consequence, P2 ne tombe jamais très loin de P1 et à l'échelle marcroscopique, on peut les assimiler au même point. Mais ça devient problématique pour des materiaux comme la cire, le jade, la peau etc...

Les moteurs de rendus modèrnes utilisent des techniques comme le Sub-Surface Scattering (SSS) pour se libérer de cette limitation. Mais pour moi on est plus sur une extention du PBR que sur un fonctionnement natif.

##### 1.2.3 Rupture du continum dielectrique
On est donc sur un modèle surfacique qui remplace l'intéraction interne par l'albédo et dans lequel la lumière sort toujours par où elle entre. Ca fonctionne pour les materiaux opaque, mais les notions de transparence et de translucidité n'ont plus vraiment de sens dans ce context. Le continum dielectrique en est réduit à la seule opacité.

La transparence est bien présente dans un jeu vidéo, mais elle n'est pas du tout "physicaly based". Le principe est de rendre les surfaces transparente par dessus les surface opaques. La couleur du nouveau pixel est alors "mélangée" avec celle de l'ancien selon diverse modalités. C'est de la pure composition comme vous pourriez le faire à la main dans GIMP (on son concurent que je ne vais pas nommer).

<vrai pour le PBR offline ?>





## OLD

sans introduire ces notions, je ne pouvais pas faire mieux que de balancer des formules hors contexte en disant : "c'est une version parmis d'autre, maintenant débrouillez vous !".

Les articles synthétiques c'est très utile. Mais il y en a déjà des tas (et mieux écrit que les miens). Une fois n'est pas coutume, je vous conseil ceux de LearnOpenGL. Je cherche donc à apporter des clé de compréhention permetant d'apréhender le PBR en tant framework plutôt que de présenter une implémentation de référence.

## V. Conclusion
Initialement, je prévoyais que cette partie soit l'article entier. Mais en l'écrivant j'ai vite compris que je n'allais pas m'en sortir. 

En effet, la difficulté du PBR, ne réside pas dans sa définition. Ce qui pose réèlement problème, c'est la profondeur de l'empilement de conceptes sur lequel il est perché. On peut se contanter de balancer des formules et de dire que c'est qu'une implémentation parmis d'autres. Mais ce n'est pas vraiment utile.

### Negation du continum diélectrique

### 2 Flux radiant spéctral VS RGB


### 2 

## V. Conclusion
Les angles motrs tenaient comment je situe mon modèle 


## OLD ACCUMULATION

### 3 Taxonomie des materiaux
Maintenant qu'on a les notions principales, on va les utiliser pour décrire différentes catégories de materiaux afin de mettre en relation la manière dont ils nous apparaissent et la façon dont les photons transitent à l'interieur.

#### 3.1 Le vide
Le vide, c'est un peut le matriau nul. Pas d'emission, pas d'absorbtion, pas de diffusion et IOR neutre (égal à 1). En gros les photons déjà existant le traversent en ligne droite. Et c'est à peut près tout.

[Illustration vide]

En gros il n'influe pas sur le système, et c'est pour ça que notre oeuil ne peut pas le voir.

#### 3.2 L'aire
Définir ce qu'on appel l'aire

Emission : faible / infrarouge
Invisible à température ambiante mais creuser les histoires air ionisé (plasma), décharges électriques, aurores, flames

Absorbtion :
O₂, O₃, CO₂, H₂O absorbent certaines longueurs d’onde
Visible : absorption faible mais non nulle
UV : absorption forte (ozone)
IR : absorption très importante (gaz à effet de serre)

Diffusion :
diffusion Rayleigh (molécules ≪ λ) = ciel bleu
diffusion Mie (aérosols, poussières, gouttelettes) = brouillard, nuiages, brume

IOR : dépend de pression, température, humidité, longueur d’onde (= 1.000293 air sec, 20°C, 1 atm)
- légèrement les rayons
- mirage
- réfraction atmosphérique (astronomie)

#### 3.3 Dielectriques transparents
L'aire en fait partie, mais aussi verre, eau, plasique transparent, diamant

#### 3.4 Dielectriques opaques
La plupart des trucs <verifier>

#### 3.5 Metaux
Pas de diffusion car absobtion directe. Reflection uniquement. Couleur venant de radiance spectrale

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


