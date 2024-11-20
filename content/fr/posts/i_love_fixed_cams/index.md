+++
author = 'Turbo Tartine'
date = '2024-11-15T06:26:08+01:00'
draft = true
title = 'Ode à la caméra fixe et aux tank-controls'
description = 'Article dans lequel je parles de caméra fixes'
+++
## Ode à la caméra fixe et aux tank-controls

### Sweet sweet 90's
Depuis toujours, j'éprouve une fascination certaine pour les jeux en caméra fixe. C'est avec des titres comme *Alone in the Dark*, *Final Fantasy* et bien sûr *Resident Evil* que j'ai grandi. Dire que ces licences ont marqué mon enfance serait un euphémisme. C'est une véritable passion qui m'a pris dans les années 90 et qui a perduré au-delà... bien au-delà... Pour tout vous dire, j'ai même réinstallé *Resident Evil Rebirth* pas plus tard que la semaine dernière, alors que le remake de *Silent Hill 2* vient tout juste de sortir et que celui de *Dead Space* traîne dans ma To-Play list depuis près d'un an. Parfois, je culpabilise un peu de la manière dont je consacre le peu de temps de jeu dont je dispose maintenant que je suis un adulte responsable (Oui, bon... ça va... j'ai un chat, ça compte ?). Mes collègues ne manquent pas de me taquiner avec ça. Ils me traitent de "boomer" et me reprochent d'être un peu trop tourné vers le passé.

Peut-être qu'ils n'ont pas complètement tort, mais je pense que la réalité est un peu plus complexe. Si je suis devenu un retro-gamer, ce n'est pas parce que "le jeu vidéo c'était mieux avant !". C'est un médium extraordinaire, qui n’a rien à envier à d'autres formes d’art, qui ne cesse d'évoluer, se réinvente en permanence, et c'est une chose dont je me réjouis. Pourtant, ces "vieilleries" parviennent encore à capturer mon attention, devançant même des monuments acclamés par la critique que j’attendais depuis des mois. Si ces chefs-d'œuvre ont un tel pouvoir sur moi, c'est parce qu'ils ont quelque chose d'unique. Quelque chose qui me parle et que je n'arrive pas à retrouver dans les productions actuelles, si impressionnantes et si qualitatives soient-elles.

Il faut dire que cette famille de jeux n'a plus beaucoup d'héritiers aujourd'hui. À ma connaissance, le dernier représentant de sa lignée est *Resident Evil Zero*, sorti en 2002 sur GameCube. Et depuis, plus rien ou presque. C’est un peu comme si l’équivalent vidéoludique, d’un point de vue narratif, avait cessé d’exister comme ça, d’un coup. Hier, on avait des livres écrits à la première personne, et du jour au lendemain, pouf… on a plus que des narrateurs omniscients. En tant qu'amateur de ce style de jeux, je ne peux m'empêcher d'y voir une certaine injustice. Mais ça ne fait pas non plus de moi un "arriériste". Au contraire, ce que je regrette, en vérité, c'est que cette branche du médium, si prometteuse, n’ait jamais eu l’occasion d’évoluer pleinement et de réaliser son potentiel.

Si vous avez tenu bon jusqu'ici, merci pour votre patience et votre curiosité. Et si vous êtes prêt à poursuivre, je vous propose d'explorer ensemble comment les caméras fixes sont apparues, pourquoi elles ont disparu, et pourquoi, à mon avis, elles auraient dû continuer d'exister.

### Casser des murs à grand coup de design !
Personne ne peut prétendre connaître tous les jeux vidéo sortis depuis la naissance du médium. Mais je vais quand même prendre le risque d’affirmer que la caméra fixe est née en 1992 sur PC avec *Alone in the Dark* (et c’est un vrai risque, car si j’ai tort, ça fout en l’air la conclusion de cette section). Ce qui est certain, en revanche, c’est qu’elle a connu son âge d’or sur la cinquième génération de consoles (PS1/N64/Saturn), entre la fin des années 90 et le début des années 2000.

Nous étions alors au début de l’ère de la 3D. Les machines, impressionnantes pour l’époque, se rapprocheraient aujourd’hui d’un grille-pain connecté bas de gamme si on les jugeait avec nos standards actuels. Les GPU n’étaient pas programmables, la mémoire disponible ridicule… bref, les développeurs de cette époque étaient de véritables héros. Pour créer des jeux dignes de ce nom, ils devaient composer avec des limitations matérielles drastiques et adopter des stratégies d’optimisation parfois extrêmes.

#### Ce qui ne bouge pas, te rend plus fort
De nombreuses techniques d’optimisation dans le jeu vidéo reposent sur un postulat simple : la majorité de la géométrie à afficher est statique. Certes, il y a les personnages, les véhicules, et les effets de particules qui eux sont dynamiques. Mais la quantité de géométrie que cela représente est relativement faible face à ce qui est nécessaire pour modéliser l’environnement. Et cet environnement, lui, ne bouge pas.

Cette observation reste vraie aujourd’hui. De nombreuses technologies modernes exploitent toujours ce principe. On peut citer [l'éclairage statique](/misc/static_lighting), [les distance fields](/misc/distance_field) ou encore [les reflection captures](/misc/reflection_capture).  Ces techniques consistent à *"baker"* (calculer à l’avance) ce qui ne bouge pas, afin de pouvoir réutiliser ces données plus tard, en temps réel et à moindre coût.

Cette philosophie d'optimisation a donc influencé de nombreuses approches, mais comme nous allons le voir, la caméra fixe élève ça à un autre niveau.

#### Plus haut ! plus fort ! plus fixe !
Renoncer à la mobilité du point de vue dans un jeu est un choix de design radical qui vient avec son lot de forces et de contraintes. On y reviendra. Cela dit d’un point de vue purement technique, ce choix place les développeurs dans un cas particulier intéressant : les pixels de l’écran eux-mêmes deviennent une donnée statique.

Dans ces conditions, le décor peut être rendu à l’avance en CGI (*"baké"*) sous forme d’une image 2D. Lors de l’exécution du jeu, il suffit d’afficher cette image en trompe-l’œil, sur laquelle viennent se superposer les éléments dynamiques rendus en temps réel. Résultat : l’environnement, qui monopolise habituellement la majeure partie des ressources, ne coûte plus que deux triangles et une texture. Le gain en performance est tout simplement stratosphérique.

#### La cuillère n'existe pas !
Cet exemple illustre parfaitement comment une problématique technique en apparence insoluble peut être surmontée grâce à un choix de design audacieux. La logique fini toujours par atteindres ses limites, car elle est bâtie sur des normes (c'est Morpheus qui le dit dans *Matrix*. Donc c'est vrai !). La créativité, elle, n'est pas bornée, ce qui lui permet parfois de réussir quand le "gros cerveau" echoue.

Là où je veux en venir, c’est qu’une petite dose d’ouverture d’esprit et de pensée hors du cadre a permis de créer des mondes et de raconter des histoires d’une richesse et d’une sophistication inimaginables pour une PS1. Et on ne le doit pas à un programmeur de génie, mais à la créativité d’un designer. Même si, en l'occurence Frédérick Raynal, créateur de *Alone in the Dark* et de cette technique, est sans conteste les deux à la fois.

### Le Colosse aux chenilles d'argile
Si vous avez déjà eu entre les mains un jeu en caméra fixe, vous savez certainement ce que sont les tank-controls. Dans le cas contraire, une petite explication s’impose. Il s’agit d’une modalité d’inputs où vous contrôlez l’avatar dans son référentiel plutôt que dans le vôtre.

Ce schéma de contrôle est impopulaire car il nécessite un petit temps d’adaptation. Il est fortement lié à la caméra fixe, car c’est le seul à ce jour qui permet de s’abstraire des problématiques liées aux changements de référentiels soudains et répétés, inhérents au genre. Vous avez peut-être une intuition du pourquoi, mais essayons de décortiquer un peu mieux le problème.

#### Le problème sous tous les angles
Si les caméras regardent dans le même sens, le problème est moindre. Dans ce cas, les changements de référentiels sont des translations, et la translation conserve les directions. L’orientation de l’avatar reste stable d’un écran à l’autre. Cela permet d’implémenter un schéma de contrôles « naïf », où les mouvements de l’avatar suivent directement ceux du joystick.

(Illustration : un avatar passant d’une pièce à une autre avec des caméras alignées.)

Mais en pratique, il sera difficile de respecter cette contrainte. La spécialité des caméras fixes est de permettre des environnements très détaillés. Si l’agencement de l’espace ne reflète pas ce niveau de détail, on intègre vite une dissonance : « Il est bizarre ton manoir ! Pourquoi les pièces sont toutes les unes à la suite des autres ? ».

Et même si on acceptait cette dissonance, on se priverait de toute la puissance artistique des caméras fixes (que de teasing ! On en reparlera aussi).

On va donc devoir faire varier les angles, et c’est là que ça se complique. Si on fait ça, les directions ne sont plus conservées. L’orientation de l’avatar diffère d’un écran à l’autre.

(Illustration : un avatar changeant de pièce avec une caméra à angle opposé, illustrant les inversions de direction.)

Si on ne fait rien, le joueur devra adapter sa trajectoire à chaque transition de caméra. À moins d’être un ninja, cela se traduira par une imprécision significative dans ses déplacements. Pas pratique quand le gameplay exige d’esquiver des zombies dans des couloirs !

Les changements de caméra étant fréquents, même avec de bons réflexes, ajuster sa direction toutes les cinq secondes peut briser l’immersion.

Les tank-controls s’imposent alors comme une solution nécessaire. Passée une petite phase d’apprentissage, ils remplissent parfaitement leur rôle. Mais cet investissement imposé au joueur n’était déjà pas du goût de tout le monde à l’époque. Et aujourd’hui, c’est encore pire.

#### Y a-t-il un designer pour sauver la caméra fixe ?
Nous vivons une époque où les bibliothèques débordent. Aujourd'hui, pour un jeu, être installé est déjà un exploit. Et une fois lancé, il dispose d’une quinzaine de minutes pour nous convaincre qu’il ne mérite pas une expulsion sommaire de notre disque dur. Les plus salés d’entre nous agrémenteront même cette sentence d’un refound et d’une bad review pour faire bonne mesure. Dans ce contexte, demander au joueur de s’investir dans quelque chose d’habituellement aussi gratuit que le schéma de controle, c’est rédhibitoire.

Pour mitiger cela, certains titre plus récents proposent des contrôles dits "modèrnes". Ils ont le mérite d'exister. Une option de jouabilité alternative est toujours la bienvenue. Et si cela suffisait à ramener la caméra fixe sur le devant de la scène, j'applaudirais même des deux mains. Mais ce n’est pas le cas, et pour cause : il s'agit en réalité du schéma de contrôle "naïf" décrit plus haut et qui consiste à laisser le joueur se battre avec les changement de plans (... avec un petit sourire en coin parce qu’on est un game designer sadique). 

Si vous découvrez le genre aujourd’hui, ces contrôles "naïfs" sembleront séduisants. Mais donnez quand même une chance aux tank-controls. Après une demi-heure, vous réaliserez que c’est comme le vélo : pas si difficile, et une fois appris, ça ne s’oublie pas. Malheureusement, la plupart des gens n'iront plus jusque là. Non pas parce que les nouvelles générations sont un ramassis de fainéants (comme aiment le croire les vieux réacs), mais parce que la compétitions pour notre attention et notre temps libre, aujourd hui, est bien plus féroce que par le passé. Et malheureusement il n'y a pas grand chose à y faire. Si le public trouve que ça ne vaut plus son temps, ça ne vaut plus son temps.

La tragédie, c’est que les années 90 ne reviendront pas. Et sans solution de contrôle viable pour s’adapter aux attentes modernes, les caméra fixes ne reviendront pas non plus. Tout cela à cause d’un détail, minuscule en apparence, mais essentiel dans la pratique. Après avoir passé des heures à tourner le problème dans tous les sens, je dois admettre que je ne suis pas capable de trouver cette solution.

Si cette problématique vous intrigue, n’hésitez pas à explorer ce sujet et à partager vos idées. Qui sait, peut-être que votre créativité permétra de réinventer la caméra fixe ?


### Oui mais les caméra fixes, c'est la vie !

#### La puissance à l'état brut
Le premier avantage des caméra fixes est évident et on en a déjà un peu parlé : cela permet de s'abstraire completement des limitations technique pour tout ce qui est statique. Comme on l'a vu, cela donne aux level artistes un budget de triangles et de lumières infini pour modéliser leurs evironnements. En soit c'est déjà enorme, mais en plus de ça, cet environnement est très peu coûteux à afficher, ce qui libère les ressources pour autre chose (détails des personnages, effets visuels divers...). En consequence les jeux qui utilisent cette technique sont d'une qualité visuelle en avance sur sont temps de plusieurs générations au moment où ils sortent. Et comme une image vaut 1000 mots, en 2001 les jeux vidéos c'était ça :

<img mosaique des meilleurs jeux de 2001>

La même année sortait Resident evil Rebirth (oui celui là même que j'ai réinstallé la semaine dernière). Et ça ressemblait à ça :

<img mosaique de captures de REmake>

Ce jeu est sorti il y a 23 ans sur une console 10x moins puissante que le téléphone reconditionné et un peu daté sur lequel vous lisez peut être ce blog. Je ne sais pas ce que vous en pensez, mais moi je trouve ça impressionnant. Il n'est peut être pas tout à fait au niveau des standards graphiques d'un AAA actuel, mais il ne serait pas non plus ridicule si il sortait aujourd'hui. Et si on laisse de côté les super-productions à 250+M$ et qu'on le compare à la tera-tonne de jeux qui sortent chaque jours sur Steam, je pense ne pas trop me mouiller en affirmant qu'il serait même plus impressionnant que la plupart d'entre eux sur le plan graphique. Immaginez à quoi ressemblerait un jeu fait en 2024 avec cette technologie si on avait découvert une alternative crédible aux contrôle-tank et que l'industrie avait continué d'investir dedans ces 20 dernières années.

#### Sans style, la puissance n'est rien
Mais vous savez quoi ? Cette fidélité graphique, aussi impressionnante qu'elle puisse être, ce n'est même pas ça qui fait toute la force de la caméra fixe. Ce n'est pas ça qui fait que 20 après, j'y reviens encore et encore faute d'arrivé retrouver dans le paysage vidéoludique modern ce que le genre avait de si particulier et de si génial. Non la vrai puissance de cette technique, c'est le contrôle artistique qu'elle confère aux développeurs. Elle permet de retirer du contrôle au joueur (il ne contrôle plus la caméra), pour le transférer au designer. Et ça ça change tout. A partir de ce moment, on dispose te tout l'arsenal cinématogaphique habituellement réservé à un réalisateur de film pour raconter notre histoire. On décide ce que voit le joueur, comment il le voit (ou ne le voit pas ce qui peut être encore plus puissant), on compose vraiment les plans et la manière dont ils s'enchaine en utilisant la grammaire du cinéma pour créer des émotions, de la tention, du soulagement, du mystère, du grandiose etc... 

Les techniques cinématographiques sont utilisée dans le jeu vidéo depuis longtemps et il y a eu enormement d'avancée dans le domaine. Mais qu'on parle des cinématiques de Metal Gear en son temps, des QTE de RE4 ou plus récement du plan séquence magistral qu'est God of War, je trouve que rien n'arrive à remplacer ce que permetait de faire une simple caméra fixe. Tous ces jeux sont des chef d'oeuvre qui ont marqué le médium et executent à la perfection ce qu'ils cherchent à faire. Mais on reste sur un modèle dans lequel on a des phase de gameplay d'un côté, et des cinématiques de l'autre. God of War floute admirablement la limite entre les 2 en transitionnant suptilement de l'un a l'autre. Mais on a toujours des phase de gameplay classique en caméra de poursuite, et des cinématique/QTE dans lesquelles on met des coups de pelle à un dragon en plein ciel dans un combat aerien epic. C'est pas du tout moins bien. C'est juste une autre direction qui ne permet pas les même chose. Dans un jeu en caméra fixe, le réalisateur joue avec les plans à chaque seconde de l'experience. Ce n'est pas un ballais dans lequel tour à tour joueur et realisateur s'échangent le contrôle selon qu'on est dans une phase de gameplay ou une cinématique/QTE. C'est un contrat tacite qui vaut pour toute la durée du jeu : "Toi joueur, tu contrôle ton personnage tout du long, tu as ma promesse, je n'y toucherai pas. Par contre c'est moi qui mets en scene ton histoire et qui gère l'ambience". Et c'est une formule unique qui produit quelque chose d'absolument d'inimitable, qui me manque beaucoup a qui a enormément à offrir si on accepte de s'investir un peu dedans.

### Ma pierre à l'édifice écroulé
- Remercier la scene indé
- Dire qu'on boss sur OpenRE
- expliquer ce qu'OpenRE apporte


Mais si on y réflechi 2 minutes, on se rend compte que c'est l'equivalent vidéoludique d'un procédé naratif tout entier qu'on met au placard sous pretxte qu'il est "légèrement" difficile d'accès. Et j'insiste sur le "légèrement", car si on prend 2 nouvelles minutes de réflexion, apprendre à nager où à faire du vélo est objectivement beaucoup plus difficile (et accessoirement plus risqué) que de maitriser les mouvement d'un personnage dans son refenciel plutôt que dans le notre. Et le millenial nostalgique que je suis ne peut s'empecher de penser que cette technique est morte trop tôt, stoppée dans son évolution avant d'avoir atteint son plein potentiel. Et comme une image vaut 1000 mots, en 2001 les jeux vidéos c'était ça :

<img mosaique des meilleurs jeux de 2001>

La même année sortait le remake HD de resident evil 1 (surnomé REmake par la communauté). Et ça ressemblait plutôt à ça :

<img mosaique de captures de REmake>

Ce jeu est sorti il y a 23 ans sur une console aussi puissante que votre grille-pain et au passege surement moins enerivore. Je ne sais pas ce que vous en pensez, mais moi je trouve ça impressionnant. Il n'est peut être pas tout à fait au niveau des standards graphiques d'un AAA actuel, mais il ne serait pas non plus ridicule si il sortait aujourd'hui. Et si on laisse de côté les super-productions à 250+M$ et qu'on le compare à la tera-tonne de jeux qui sortent chaque jours sur Steam, je pense ne pas trop me mouiller en affirmant qu'il serait même plus impressionnant que la plupart d'entre eux sur le plan graphique.

Immaginez à quoi ressemblerait un jeu fait avec cette technologie si l'industrie avait continué d'investir dedans ces 20 dernières années (parce que oui après celui là, à ma connaissance y a plus eu grand chose malheureusement).

C'est partant de ce constat, que j'ai eu envie de bricoller un peu autour de cette technique pour voire ce qu'il était possible de faire. Et c'est comme ça qu'est né StableSight.


