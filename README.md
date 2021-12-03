# nuit-info

Lien du site : <https://nuit-info.ofabeu-liste.tech/>

Identifiants de test :

- admin@admin.com / azerty
- john@doe.com / azerty

Fonctionnalités :

- wiki versionné : collection d'articles écrits en markdown
- on peut proposer des modifications aux articles
- les admins peuvent approuver ou rejeter des modifications
- un moteur de recherche permet de trouver une page en particulier

## Installation

Dépendances : Node+NPM, PostgreSQL (+ libs de dev), Rust.

Créer une base de données PostgreSQL.

Cloner le dépot, ainsi que les deux autre apps (nuit-info-admin et browser) dans le même dossier.

Dans le fichier `.env`, on met l'URL de connexion à la BDD :

```
DATABASE_URL=postgres://user:password@host/database
```

De même dans `login` et dans `configdb.js`, dans les formats suivants :

```
dbname=database user=user password=password
```

```js
module.exports = {
    urlDb: 'postgres://user:password@host/database'
}
```

Lancer cette série de commande :

```
cargo install diesel_cli --no-default-features --features postgres
diesel migration run
cargo run &
npm install --include=dev
npx parcel build
npm run &
```


