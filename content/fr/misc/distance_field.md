+++
draft = true
title = 'Distance Field'
toc = false
+++
Puisque la géométrie ne bouge pas, on peut pré-calculer en tout point de l’espace la distance qui le sépare de l’objet le plus proche. On appel cette donnée un distance field et on l’utilise comme structure acceleratrice dans plusieurs algorithmes (différentes techniques de ray tracing et d’ombrage, simulation de fluides…). On peut anisi faire fonctionner en temps réèl des effets dont une implémentation naïve sans structure acceleratrice serait beaucoup trop coûteuse pour être utilisée en temps réèl dans un jeu même avec du hardware moderne.
