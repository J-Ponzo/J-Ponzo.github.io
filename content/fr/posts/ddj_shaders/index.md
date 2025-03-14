+++
date = '2025-03-12T10:20:34+01:00'
draft = true
title = 'Dis donc Jamy : Comment ça marche un shader ?'
description = "Article de vulgarisation expliquant ce qu'est un shader"
+++
## Introduction
Dans ce lightning article je vais essayer de demistifier un peu le concepte de Shader. En effet, j'ai quelques amis qui ont l'extrème gentillesse de crash-tester mes brouillons pour me faire des retours avant que je ne les publient (Salut à vous ! Et merci pour ce que vous faites, ça m'aide beaucoup !). La plupart sont d'exellents programmeurs. Pourtant, quand je mets un bout de code en `glsl` dans un article, bien souvent ça coince.

En réalité , programmer un shader n'est pas plus difficile que de programmer n'importe quoi d'autre. C'est juste : "bizare quand on a pas l'habitude". Dans ce blog je cherche à m'adresser à un publique assez large. Pas uniquement à des programmeurs, et encore moins à des programmeurs graphiques spécifiquement. J'aimerais donc que cet asspect ne soit plus un freint.

Pour cela, je vais tanter de vous donner quelques armes pour que vous soyez pas déroutés par le concepte. Ca ne fera pas de vous un Gourou du shading (je n'en suis d'ailleurs pas un moi même), mais j'espère que ça contribura à rendre mes articles plus accessibles.

## I. Qu'est ce qu'un shader ?
Un shader c'est tout simplement un programme. Il existe plusieurs langages haut-niveau pour les écrire. Les principaux sont glsl et hlsl (mais on peut trouver des choses plus exotiques). Une fois compilé, le shader peut être exécuté par une unité de calcule. Sauf que cette fois, cette unité de calcule, ce n'est pas un CPU, mais un GPU.

Jusqu'ici on est pas trop dépaysé. Mais enfillez vos gants et allumez votre frontale, c'est maintenant qu'on descents au fond du gouffre. Immaginez un programme CPU dont la mission est de traiter les éléments d'un tableau. On aurait quelque chose qui ressemble à ça :
```c
// Point d'entrée du programme
void main(array[]) {
	foreach (elt in array) {
		// Traitement de elt
	}
}
```

Pour un shader, ce serait plutôt ça :
```c
///// CODE INACCESSIBLE AU DEVELOPPEUR ! (car en amont du point d'entrée)
for (i = 0; i < array.lengt; i++) {
	main(elt, i);
}
///// ENDOF CODE INACCESSIBLE AU DEVELOPPEUR

// Point d'entrée du shader
void main(elt, i) {
	// Traitement de elt
}
```

En effet, quand on écrit un shader, on n'a pas access au tableau lui même. On doit raisonner sur chaque élement pris indivisuellement, en isolation de tous les autres. Tout ce qu'on connait c'est l'élement lui même, et eventuellement sa position dans le tableau si on a de la chance (J'avais bien dit que c'était bizare !).

Croyez le ou non, la couleur de chaque pixel de votre écran est calculée de cette manière. C'est une gymnastique un peu particulière, mais on s'y fait assez vite. Maintent, pourquoi est ce qu'on a besoin de faire un truc aussi tordu ?

## II. CPU vs GPU
Pour répondre à cette question, on va devoir se pencher sur les différences d'architecture entre les 2 types unité de calcule.

Un CPU contient relativement peu de coeurs (entre 2 et 10 la plupart du temps). Mais ce sont des coeurs extrèmement puissant et surtout très agiles car intédpendants les un des autres. Chacun est capable de dérouler sa propre séquence d'instructions dans son coin. Un CPU sera donc très bon pour effectuer plusieurs tâches complexe et différentes en même temps.

En comparaison, un coeur de GPU est con comme une pelle. Non seulement il est beaucoup moin puissant, mais surtout il fonctionne sur le model SIMT (Single Instrcuction, Multiple Threads). Ca veut dire que les coeurs d'un GPU ne sont pas capable d'executer simultanement des instructions différentes. A chaque tick d'horloge, tout le monde tape dans la même.

"Mais dit donc Jamy ! Si tous les coeurs executent la même instruction, ils vont tous trouver la même chose ! Ca n'a aucun sens !" 

Et bien non Fred ! Les coeurs executent bien tous la même instruction, mais ils le font sur des données différentes (les élements du tableau vous vous rappelez ?). Ils peuvent donc quand même trouver des résultats différents.

"Je vois ! Mais dans le cas d'un branchement conditiannel (un if/then/else), on est d'accord que les coeurs qui passent côté *true* ne peuvent pas pointer sur la meme instruction que ceux qui passent côté *false*. Ca marche pas ton truc !". 

Tu as raison Fred, mais il y a une astuce ! En réalité les 2 cotés du if sont exécutées l'un après l'autre par tous les coeurs. Et que font les coeurs qui ne sont pas concernés par la branche courante ? Et bien c'est simple... **RIEN**... ils attandent... Et c'est la raison pour laquelle il faut à tout prix éviter les branches dans un shader.

Cette architecture est donc assez contrainante, mais elle permet au GPU de faire des optimisations qu'un CPU, plus généraliste, ne pourrait pas faire. Mais surtout, cela permet de gérer facilement non pas 8, non pas 32, non pas 128... mais bien plusieurs milliers de coeurs au sein de la même unité de calcule.

En consequence, là où le CPU est bon sur du multitasking, le GPU lui excelle dans l'art d'executer en parallele un nombre astronomique de petites opérations similaires. Et il se trouve que c'est exactement ce dont on a besoin pour traiter des images.

## III. Le pipeline graphique
En pratique, il existe plusieurs types de shaders. Chacun intervenant à une étape précise de ce qu'on appelle le pipeline graphique. A chaque drawcall, c'est à dire (plus ou moins) pour chaque mesh visible dans une frame, ce pipeline va être traversé. La géométrie est injectée en entrée sous forme de triplets de vertex (des triangles donc). Ils vont être traités étape par étape jusqu'à devenir des pixels affichés à l'écran.

![Diagramme représentant le pipline graphique](images/gfx_pipeline.opti.webp)

Dans ce pipeline, il y a 2 types d'étapes :
- Les fixed function en jaune pâle : cablées en dur dans le GPU (et donc **très** efficaces)
- Les étapes programmables en vert : les fameux shaders

Ca fait beaucoup, et encore, dites vous qu'il en manque. Mais dans l'infini majorité des cas on utilisera que le Vertex Shader et le Fragment Shader (notés respectivement Vertex Program et Fragment Program sur le schéma mais c'est la même chose)

### 1. Vertex Shader
Les élements traités par le vertex shader sont les vertex du mesh qui traverse le pipeline. Ils sont exprimés dans le référentiel local du mesh. L'utilité première du vertex shader c'est d'appliquer des  changements d'espace au vertex pour qu'il se retrouve tour à tour dans :
- le referentiel du monde
- le reférentiel de la caméra 
- l'espace écran.

![Schéma des différents changements d'espace](images/)

Imaginez que la caméra, c'est la navette de futurama. Ce n'est pas elle qui bouge, mais le vertex shader qui s'arange pour déplacer le monde autour d'elle et l'aligner dans le bon axe. Une fois que c'est fait, le monde est "applati" dans le plan de l'écran.

Je ne vais pas détailler les mathématiques engagés dans la maneuvre parce que c'est un article de vulgarisation (ouai c'est ça... dit plutôt que t'as peur de te planter et de passer pour un glandu !). Mais retenez que ce sont des multiplications de matrice : une opération qui peut être découpée en une multitude de petites opérations identiques. Et comme on vient de le voire, un GPU est taillé pour en avaler des caisses entière sans soursiller.

Notez qu'au dela de ces changements d'espace, le Vertex Shader est l'endroit parfait pour implémenter des effets du type :
- inflation/retractation
- morphing
- distortion
- vertex animation

![Illustration de differents effets](images/)

A une époque la lumière aussi était calculé dans le Vertex Shader pour des questions de performences. On appel ça le Vertex Lighting. Aujourd'hui les GPU sont largement assez puissant pour calculer la lumière au niveau du pixel. Mais le Vertex Lighting est toujours utilisé en tant que parti pris artistique (ou si on fait un portage grille-pain).

![Comparaison du Vertex Lighting et du Pixel Lighting](images/)

### 2. La rasterisation
La rasterisation est une étape non programable du pipeline. Mais il est quand même important de comprendre ce que c'est car elle se place entre le Vertex Shader et le Fragment Shader.

Il s'agit d'un procédé qui consiste à discrétiser une image vectoriel. Dit autrement, on va prendre nos joli triangle tout lisses, dont les vertex viennent d'être projetés dans l'espace écran (par le Vertex Shader), et on va en faire un amas de pixels qu'on appelle des fragments. 

![illustration du procédé de rasterisation](images/)

Ces fragments sont ensuite injectés en entrée du Fragment Shader (vous commencez à comprendre le pattern de nomage). 

Mais ce n'est pas tout. Il y a un petit détail que j'ai omis de mentionner dans la partie précédente. Les vertex protent des attributs en plus de leur coordonnée : une couleur et ce qu'on appele des uv (qu'on utilise notament pour appliquer les textures mais c'est completement hors scope pour cet article).

Il est important de noter que lors de la rasterisation, une interpolation de ces attributs est effectuée pour chaque frament généré.

![illustration de l'interpolation des attributs](images/)

### 3. Fragment Shader
Le fragment shader c'est la dernière étape avant que le pixel soit imprimé à l'écran. Son job est de déterminer la couleur finale de ce pixel à partir des attributs des vertex interpolés lors de la rasterisation :

- coordonée : simplement l'endroit où se trouve le pixel sur l'écran
- normales : l'orientation de la face associées au vertex
- vertex couleur : je pense que cet attribut est le relicat d'une aire ou la puissance ne permetait pas de sampler des textures pour chaque pixels. Aujourd'hui, c'est un attribut qu'on utilise ne manière détournée pour que les artistes encodent d'autres informations dans leurs models.
- uv : c'est une coordonée 2D utilisée la plupart du temps pour sampler une texture. On en a généralement plusieurs (l'uv0, l'uv1, l'uv2...). Comme le vertex color, ils sont aussi utilisé de manière détournée parfois.

Dans ce shader on peut implémenter différentes de chose. Notament le calcule de la lumière et des post-process. Mais c'est un sujet un peu avancé. Si j'écris une suite à cet article, je les traiterai certainement. Mais pour l'instant retenez que c'est dans ce shader que ça se passe.

## Conclusion
Dans cet article je fais pas mal de racourcis et d'approximations. Je fais également l'impasse sur des sujets importants (les uniforms, les varyings ...). L'objectif n'étant pas de vous apprendre à écrire des shaders, mais de vous donner une vision global et rapide de ce que c'est.

Si vous souhaitez approfondir le sujet, je vous conseille [Learn OpenGL](https://learnopengl.com/). C'est très complet et bien expliqué. Quand je cherche une information, c'est le premier endroit où je regarde. Et très souvent je n'ai pas besoin d'aller ailleurs. 

Vous pouvez aussi apprendre directement dans un moteur de jeu. Ainsi vous pourrez vous concentrer sur vos shaders sans avoir à vous occuper de la partie CPU du *renderer* (qui sera déjà implémentée par le moteur). Je n'ai pas de ressource à vous pointer car je n'ai pas appris comme ça, mais je suis sur qu'elles existent. Et c'est souvent plus simple de considérer les problèmes un par un.

Sur ce, j'éspère que vous aurez trouvé ces explications utiles et qu'elles vous aideront à aborder plus facilement certains passages de mes futurs articles. A bientôt.