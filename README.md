
# Patoplefilm

Patoplefilm est une application web de collection de cartes (TCG) basée sur l'univers des pires films de l'histoire.

-----

## 🚀Stack Technique

- Framework : Vue 3
- Build Tool : Vite
- Langage : TypeScript
- State Management : Pinia
- Routing : Vue Router
- Styling : Tailwind CSS
- API : The Movie Database (TMDB)
- Qualité : ESLint, Prettier, Husky (Pre-commit hooks)
- CI : GitHub Actions (Lint & Build check au push)

------

## 🎮 Le Concept
L'utilisateur peut ouvrir des booster contenant des films notés entre 1 et 5 sur TMDB.
L'objectif est de collectinner les films les moins bien notés.

Les cartes sont classées selon leur "score de nullité" :

- Commun : Note entre 5 et 4
- Rare : Note entre 3.99 et 3
- Épique : Note entre 2.99 et 2
- Légendaire : Note inférieure a 2

-----

## ⚙️Configuration

Un fichier .env est nécessaire à la racine du projet pour faire fonctionner l'API :
```
VITE_TMDB_API_KEY=votre_cle_api_tmdb
```

------

## 🛠 Commandes utiles

Installation
```
npm install
```

Vérifications
```
npm run lint
npm run type-check
```