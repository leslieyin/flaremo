# FlareMo 🔥

<p align="center">
  <b>Zéro serveur · Aucun coût de maintenance · Haute disponibilité globale 24/7 · Maîtrise totale de vos données</b><br>
  Pour les particuliers : un espace de prise de notes intime et second cerveau IA. Pour les équipes : une base de connaissances partagée avec gestion fine des rôles.
</p>

<p align="center">
  <a href="./README.md">English</a> •
  <a href="./README.zh-CN.md">简体中文</a> •
  <a href="./README.ja.md">日本語</a> •
  <a href="./README.fr.md"><b>Français</b></a> •
  <a href="./README.es.md">Español</a> •
  <a href="./README.ko.md">한국어</a> •
  <a href="./README.ru.md">Русский</a> •
  <a href="./README.ar.md">العربية</a>
</p>

<p align="center">
  <a href="https://github.com/realchendahuang/FlareMo/stargazers"><img src="https://img.shields.io/github/stars/realchendahuang/FlareMo?style=flat&color=F38020" alt="GitHub stars"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/realchendahuang/FlareMo?style=flat&color=2563EB" alt="License"></a>
  <a href="https://workers.cloudflare.com/"><img src="https://img.shields.io/badge/Runtime-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare Workers"></a>
  <a href="https://github.com/usememos/memos"><img src="https://img.shields.io/badge/Ecosystem-Memos%20Compatible-0284C7" alt="Memos Compatible"></a>
  <a href="https://www.better-auth.com/"><img src="https://img.shields.io/badge/Auth-Better%20Auth-10B981" alt="Better Auth"></a>
  <a href="https://flaremo.app"><img src="https://img.shields.io/badge/Site%20Web-flaremo.app-EA580C" alt="Website"></a>
</p>

<div align="center">

| ☀️ Bureau · Thème Clair | 🌙 Bureau · Thème Sombre | 📱 Mobile · Adaptatif |
| :---: | :---: | :---: |
| <img src="./docs/assets/flaremo-desktop-light.png" width="360" alt="Interface FlareMo thème clair" /> | <img src="./docs/assets/flaremo-desktop-dark.png" width="360" alt="Interface FlareMo thème sombre" /> | <img src="./docs/assets/flaremo-mobile.png" width="168" alt="Interface mobile FlareMo" /> |

<sub>Captures réelles d'utilisation : transition fluide entre modes clair et sombre, design mobile entièrement réactif. Toutes les fonctionnalités présentées sont reliées au backend.</sub>

</div>

---

## 💡 Pourquoi choisir FlareMo ?

Les outils comme Flomo ou Memos ont démontré la puissance d'une capture d'idées fluide et d'un fil chronologique sans distraction. Cependant, auto-héberger un système traditionnel implique souvent de payer un VPS chaque mois, de configurer Docker et PostgreSQL, d'écrire des scripts de sauvegarde et de redouter la panne d'un disque dur.

FlareMo propose une autre approche : **Peut-on obtenir une base de connaissances en ligne 24h/24, résiliente, accélérée mondialement et sans maintenance de serveur, simplement avec un compte gratuit Cloudflare ?**

La réponse est oui :

- **Véritablement Serverless** : Le code et les fichiers statiques s'exécutent sur les 300+ nœuds edge Cloudflare les plus proches de vous avec une latence en millisecondes.
- **Stockage de classe entreprise inclus** : Cloudflare D1 gère les notes et métadonnées, tandis que Cloudflare R2 stocke les pièces jointes avec réplication multi-régions.
- **Conçu pour l'IA (AI-Native)** : Protocole MCP natif et hub « Agent Memory », permettant à vos agents IA (Claude, Cursor, Codex, ChatGPT) d'écrire et lire votre mémoire à long terme.
- **Intimité individuelle et collaboration d'équipe** : Espace personnel confidentiel par défaut, transformable instantanément en espace partagé avec rôles et 3 niveaux de visibilité.

---

## ✨ Fonctionnalités clés

### 1. Capture instantanée & Revue stimulante
- **Prise de note immédiate** : Flux chronologique sous forme de cartes, multi-étiquettes, rendu Markdown/GFM, prévisualisation d'images et audio.
- **Recherche plein texte ultra-rapide** : Indexation SQLite FTS5 (`has:attachment`, `is:pinned`, `before:YYYY-MM-DD`, `after:YYYY-MM-DD`, etc.).
- **Recherche sémantique vectorielle** : Intégration de Workers AI embeddings et d'index Vectorize pour retrouver des idées par sens naturel.
- **Activation de la pensée** : **Revue quotidienne** (ce jour-là dans l'histoire), **Balade aléatoire** (exploration des graphes de liens) et suggestions de notes connexes.
- **Historique des versions** : Comparaison visuelle des modifications et restauration instantanée.

### 2. Mémoire IA à long terme & Intégration MCP
- **Agent Memory** : Via le point de terminaison `/memory/mcp`, vos assistants IA enregistrent et mettent à jour le contexte de vos projets (préférences, contraintes, leçons).
- **Contrôle humain** : Consultez, confirmez, verrouillez ou corrigez les souvenirs IA sur la page `/memory`.
- **Écosystème ouvert** : Endpoint Streamable HTTP MCP (`/mcp`) pour manipuler vos notes par programmation.

### 3. Collaboration d'équipe & Permissions à 3 niveaux
- **Gouvernance claire** : Rôles `owner`, `admin`, `member`. Liens d'activation sécurisés sans transit de mots de passe en clair par les administrateurs.
- **3 niveaux de visibilité** :
  - 🔒 **Privé** : Visible uniquement par l'auteur.
  - 👥 **Équipe** : Lecture partagée avec les membres actifs.
  - 🌐 **Public** : Partage public révocable avec contrôle d'expiration.
- **Départ sécurisé** : Suppression physique et vérifiée des notes privées lors du retrait d'un membre.

### 4. Mode hors-ligne & Expérience PWA
- **PWA installable** : Installez FlareMo sur bureau ou smartphone pour une sensation d'application native.
- **Synchronisation hors-ligne garantie** : Brouillons enregistrés localement ; les soumissions hors-ligne sont rejouées dans l'ordre dès le retour du réseau.
- **Dictée vocale en direct** : Page `/capture` avec transcription vocale continue en temps réel (ASR).

### 5. Sécurité Better Auth moderne
- **Session sécurisée** : Cookies `HttpOnly`, `SameSite=Lax` pour navigateur ; jetons d'accès personnels révocables (`memos_pat_`) pour scripts et MCP.
- **Protection stricte de l'Origin** : Validation systématique sur les requêtes modifiant l'état.

### 6. Écosystème et compatibilité Memos
- **API Memos compatible** : Endpoints `/api/v1/*` compatibles et spécification OpenAPI.
- **Clients tiers compatibles** : Fonctionne directement avec des applications comme Moe Memos.
- **Import / Export sans perte** : Importez vos archives Memos et flomo en un clic.

---

## 📊 La générosité du niveau gratuit Cloudflare

| Ressource | Quota gratuit Cloudflare | Équivalent en volume | Durée d'utilisation estimée |
| :--- | :--- | :--- | :--- |
| **Cloudflare D1** | **5 Go de base de données** | Env. **2,5 millions** de notes | À raison de 100 notes par jour : **68 ans** |
| **Cloudflare R2** | **10 Go de stockage objet** | Env. **5 000 à 10 000 photos** / **80 h** d'audio | **0 $ de frais de bande passante sortante** |
| **Cloudflare Workers** | Millions de requêtes gratuites | Réseau mondial de 300+ datacenters | Temps de réponse en quelques millisecondes |

---

## 🚀 Déploiement rapide en 5 minutes

### Méthode 1 : Déploiement par Agent IA (Recommandé)

Confiez ce dépôt à un agent autonome (Claude Code, Cursor Agent, Codex) avec le fichier [docs/agent-deploy.md](./docs/agent-deploy.md) :
> « Veuillez déployer FlareMo sur mon compte Cloudflare en suivant docs/agent-deploy.md. »

---

### Méthode 2 : Déploiement manuel en 3 étapes

#### 1. Créer les ressources
```bash
pnpm exec wrangler whoami
pnpm exec wrangler d1 create flaremo
pnpm exec wrangler r2 bucket create flaremo-attachments
```

#### 2. Configurer et enregistrer les secrets
```bash
cp wrangler.jsonc.example wrangler.jsonc
# Remplir database_id et FLAREMO_PUBLIC_URL dans wrangler.jsonc
pnpm exec wrangler secret put BETTER_AUTH_SECRET --config ./wrangler.jsonc
pnpm exec wrangler secret put FLAREMO_BOOTSTRAP_SECRET --config ./wrangler.jsonc
```

#### 3. Déployer
```bash
pnpm verify
pnpm deploy:dry-run
pnpm deploy
```
Rendez-vous sur `/setup` sur votre domaine pour initialiser votre compte Propriétaire avec votre secret bootstrap.

---

## 📄 Licence

Projet publié sous licence libre [GNU AGPL-3.0](./LICENSE).
Copyright (c) 2026 realchendahuang.
