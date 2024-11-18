+++
draft = true
title = 'Static Lighting'
toc = false
+++
la contribution des lumière sur l'environnement n'a pas besoin d'être calculée en temps réèl si les lumières sont elles aussi statiques. On peut les précalculer pendant le développement (les baker dans le jargon) et enregistrer le resultat directement dans une texture spéciale qu'on appel une "light map". Cette light map sera directement "mélangé" aux textures de l'environnement par le jeu pour que ces dernières paraissent plus ou moins éclairées ou ombragées. En plus du gain de performence, cela permet d'avoir des lumières beaucoup plus détaillées car on dispose de tout le temps qu'on veut pour calculer cette lumière statique. Alors que si la lumière est calculée dynamiquement, on a que 16ms si ont veut avoir une chance d'assure le 60fps si cher à nos yeux de joueurs.
