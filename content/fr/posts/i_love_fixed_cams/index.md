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

### Le Tank aux chenilles d'argile
Si vous avez déjà eu entre les mains un jeux en caméra fixe, vous savez certainement ce que sont les tank-controls. Dans le cas contraire une petite explication s'impose. Il s'agit d'une modalité d'inputs dans laquelle vous controlez l'avatar dans son référentiel plutôt que dans le votre. 

C'est un schéma de contrôle impopulaire car il nécessite un petit temps d'adaptation. Il est fortement lié à la caméra fixe car c'est la seul à ce jour qui permet de s'abstraire des problématiques liées aux changement de référenciels soudains et répétés, inhérants au genre. Vous avez surement déjà une bonne intuition de pourquoi. Mais essayons de décortiquer un peu mieux le problème.

#### Le problème sous tous les angles
Si toutes les caméra du jeu regardent dans le même sens, le problème est moindre. Dans ce cas les changements de référentiels sont des translation et la translation conserve les directions. L'orientation de l'avatar est donc stable d'un écran à l'autre. Cela permet d'implémenter des contrôles "naïf" où les mouvements de l’avatar suivent directement ceux du joystick.

<illustration>

Mais en pratique, il sera difficile de respecter cette contrainte. Car on a vu que la spécialité des caméra fixes, c'est la possiblité d'afficher des environnement très détaillés. Si la compléxite d'agencement de l'espace ne reflète pas le niveau de détail, on intègre vite de la disonnance ("Il est bizare ton manoir ! Pourquoi les pièces sont toutes les unes à la suite des autres ?"). Quand bien même on s'accomoderait de cette dissonance, on passerait à côté du meilleur atout des caméra fixes (dont on parlera dans la partie suivante).

On va donc devoir faire varier les angle, et c'est là que ça se complique. Si on fait ça, l'orientation de l'avatar est différente d'un écran à l'autre.

<illustration>

Si on ne fait rien, le joueur devra adapter sa trajectoire à chaque transition de caméra. A moins d'être un ninja, cela se traduira par une imprecision significative dans ses trajectoires. Pas pratique quand le jeu consiste à esquiver des zombis dans des couloirs. Sans compter que les changements de caméra sont très fréquents, et que même si vos reflexe sont hors norme, cela ruinera votre immersion.

#### Le contrôles "modères", une fausse solution

#### 


Etant donné que les caméra ne peuvent pas suivre le joueur, on est obligé de changer de caméra quand l'avatar sort du champs pour permetre au joueur derrière son écran de l'accompagner dans son aventure. Lorsqu'on joue à un jeu en caméra fixe, on a donc une transition vers une autre caméra toutes les 5 secondes et cette transition implique pour le joueur un changement de référenciel brusque et pas toujours facile à anticiper. Si toutes les caméra du jeu regardent dans la même direction ce n'est pas un (si gros) problème. Dans ce cas précis, le changement de réferenciel conserve les rotations et on peut implémenter facilement un schema de contrôle "intuitif". Par là j'entands un schéma dans lequel le mouvement de l'avatar à l'écran se fait dans le référenciel du joueur (comme dans 99.9% des jeux vidéos). Dit autrement, dans ce cas particulier, le joueur pourra toujour être surpris par un changement de caméra, mais ce changement ne nécessitera pas de lui qu'il réagisse pour adapter l'orientation du joystique afin que l'avatar garde le cap d'un plan à l'autre (le tout en une fraction de seconde sous-peine de se manger un mur ou de faire un calin à un zombie).

"Super on a qu'à faire ça !" me direz vous. Sauf que non. Parce que quand on a la possibilité de créer un monde 3D complexe et ultra credible, on a envie que son agencement, et par extention notre cheminement à travers lui soit d'un niveau de crédibilité equivalent. Sans ça on introduit une certaine disonance ("il est bizare ton manoir, pourquoi toutes les pièces sont à la queueleuleu comme ça ?"). Cette dissonance peut tout à fait être délibéré et servir un propos, mais on aura quand même du mal à considérer ça comme le cas nominal. Sans compter que si on fait ça, on se prive de toute la puissance artistique qui vient avec ce parti pris (que de teasing ! on y reviendra aussi !).

Pour répondre à cette problématique de referenciel, à ce jour il y a 2 écoles :
- Les contrôles dit "modernes" : On fait comme si le problème n'existait pas. On garde le schéma "intuitif" dans le referenciel du joueur et on le laisse se battre avec les changement de plans (... avec un petit sourir en coin parce qu'on est un game designer sadique).
- Les fameux "contôles du tank" : On controle l'avatar dans son propre referenciel plutôt que dans celui du joueur. Ce qui règle le problème de changement de direction entre les écrans. Quand on pousse le joysique en avant, l'avatar avance droit devant lui peu importe l'angle de la camera.

Ce petit schema illustre à la perfection mon opinion personnelle à l'égare de ces 2 façons de faire :
<img Hard Choice => Easy Life>

"Contrôles modèrnes" non mais dit-donc on nous prendrait pas un peu pour des jambons ?! Ignorer le problème et proposer un schéma tout cassé passe encore. C'est un aveux de faiblesse pardonnable, dans la mesure où commercialement parlant, fournir des inputs alternatif moins rebutant pour le nouveau joueur ça peut se défandre. C'est même obligatoire aujourd'hui bien que je déconseille vivement ce choix. En revanche avoir l'audace d'appeler ça "modèrnes" c'est prèsque malhonette. Ces contrôles n'ont rien de "modèrne", ça devrait s'appeler les contrôles "naïfs" car c'est surement la première chose que les développeurs ont essayé AVANT de se rendre compte que ça marchait pas et qu'il était préférable pour la qualité de l'experience sur le long terme de chercher autre chose. Cette autre chose, ce sont les "tank-controls" qui sont certes, un peu moins accessible, mais qui après une petit periode d'adaptation font parfaitement le taf.

Plus serieusement, je comprends tout à fait que les joueurs n'ayant pas été exposer à ça dès le berceau ne soient pas facilement séduits par le concept. Il faut dire qu'on vit une époque où nos bibliothèques sont pleines à craquer de titres qu'on n'installera probablement jamais et où le jeu qu'on lance pour la première fois dispose d'une quizaine de minutes pour nous convaincre qu'il ne mérite pas d'être expulsé somairement de notre disque dur. Les plus salés d'entre nous agrémenteront même cette sentance d'un refound et d'une bad review pour faire bonne mesure. Dans ce contexte, demander au joueur de s'investire dans quelque chose d'habituellement aussi gratuit que le schéma de controle, c'est rédibitoire. Et même si il est vrai qu'apprendre à nager où à faire du vélo est objectivement beaucoup plus difficile (et accessoirement plus risqué), on ne peux pas grand chose contre les tendance de son époque. Si le public trouve que ça ne vaut pas son temps, et bien c'est sont choix et il n'y a pas grand chose qu'on puisse y faire.

En résumé, les jeux en caméra fixe ont a disposition 2 schémas de contrôle sur lesquels s'appuyer. Le premier qui ne marche pas parce qu'il est cassé depuis le début tout simplement. Et le deuxième qui ne marche plus commercialement parce qu'il demande un investissement auquel le joueur d'aujourd'hui à du mal à consentir. Pas parce que les nouvelles générations sont un ramassi de fénéant (comme il est facile de le penser si on est un vieux reac). Mais parce qu'aujourd'hui, nous sommes soumis à beaucoup plus de solicitation en compétitions pour notre temps libre que par le passé. Si je me suis fait à ces contôles, ce n'est pas parce que je suis plus doué ou plus déterminé que les autres. Je ne le suis pas aujourd'hui, et je l'étais certainement encore moins en 1998 quand resident evil 2 est sorti (j'avais 10 ans hehe). Si j'ai fini par m'y faire, c'est parce que je n'avais à disposition qu'une dizaine de jeux et qu'en cas de rage-quit, j'avais le choix entre :
- attendre noel pour en avoir un nouveau
- tanner tonton pour qu'il m'en prête un
- aller jouer dehors (pwa... berk... j'vais faire quoi j'ai même pas de gameboy)
- redonner une chance à un des 9 autres que j'avais aussi rage-quit mais que j'avais eu le temps de pardonner

J'y suis revenu plusieurs fois à ce schéma de controle. Et à chaque itération je le maitraisait de mieux en mieux et aujourd'hui il est gravé dans mes doigts. 

La tragédie dans tout ça, c'est que les 90s ne reviendront pas et qu'à défaut d'une solution de contrôle viable dans le contexte actuel, les caméra fixes ne reviendront pas non plus (en tout cas pas sur le devant de la scène). Et c'est terriblement frustrant de se dire que c'est à ça que ça tiens. Ce minuscule détail que personne n'a encore réussi à solutionner. Et dieu sait que j'en ai passé des heures à tourner le problème dans tous les sens pour essayer de trouver quelque chose. Rien à faire je ne suis pas suffisament créatif pour ça. Mais je suis convaincu que celui ou celle qui y parviendra, sera ni plus ni moins que la personne qui ressuscitera le genre.

### Oui mais les caméra fixes, c'est la vie !
Le premier avantage des caméra fixes est évident et on en a déjà un peu parlé : cela permet de s'abstraire completement des limitations technique pour tout ce qui est statique. Comme on l'a vu, cela donne aux level artistes un budget de triangles et de lumières infini pour modéliser leurs evironnements. En soit c'est déjà enorme, mais en plus de ça, cet environnement est très peu coûteux à afficher, ce qui libère les ressources pour autre chose (détails des personnages, effets visuels divers...). En consequence les jeux qui utilisent cette technique sont d'une qualité visuelle en avance sur sont temps de plusieurs générations au moment où ils sortent. Et comme une image vaut 1000 mots, en 2001 les jeux vidéos c'était ça :

<img mosaique des meilleurs jeux de 2001>

La même année sortait Resident evil Rebirth (oui celui là même que j'ai réinstallé la semaine dernière). Et ça ressemblait à ça :

<img mosaique de captures de REmake>

Ce jeu est sorti il y a 23 ans sur une console 10x moins puissante que le téléphone reconditionné et un peu daté sur lequel vous lisez peut être ce blog. Je ne sais pas ce que vous en pensez, mais moi je trouve ça impressionnant. Il n'est peut être pas tout à fait au niveau des standards graphiques d'un AAA actuel, mais il ne serait pas non plus ridicule si il sortait aujourd'hui. Et si on laisse de côté les super-productions à 250+M$ et qu'on le compare à la tera-tonne de jeux qui sortent chaque jours sur Steam, je pense ne pas trop me mouiller en affirmant qu'il serait même plus impressionnant que la plupart d'entre eux sur le plan graphique. Immaginez à quoi ressemblerait un jeu fait en 2024 avec cette technologie si on avait découvert une alternative crédible aux contrôle-tank et que l'industrie avait continué d'investir dedans ces 20 dernières années.

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


