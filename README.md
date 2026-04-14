# ✦ Mon Agenda DSCG — Guide d'installation complet

Application agenda premium pour DSCG.  
Frontend statique → **GitHub Pages** | Backend → **Supabase**

---

## 📁 Structure du projet

```
agenda-dscg/
├── index.html              ← Page principale
├── css/
│   └── style.css           ← Design complet
├── js/
│   ├── config.js           ← ⚠️ Clés Supabase à remplir
│   ├── auth.js             ← Authentification
│   ├── data.js             ← Accès base de données
│   ├── calendar.js         ← Grille agenda + drag & drop
│   ├── stats.js            ← Graphiques et statistiques
│   ├── wellbeing.js        ← Module bien-être
│   ├── todos.js            ← Liste de tâches
│   ├── kais.js             ← Liste fun Kaïs 💛
│   └── app.js              ← Orchestrateur principal
└── supabase-schema.sql     ← Schéma base de données
```

---

## 🗄️ ÉTAPE 1 — Configurer Supabase

### 1.1 Créer un projet

1. Va sur [supabase.com](https://supabase.com)
2. Crée un compte (gratuit)
3. Clique **"New Project"**
4. Choisis un nom (ex: `agenda-dscg`), un mot de passe, une région (Europe West)
5. Attends 1-2 min que le projet se crée

### 1.2 Créer les tables

1. Dans ton projet Supabase, va dans **SQL Editor** (icône base de données)
2. Clique **"New query"**
3. Copie-colle tout le contenu de `supabase-schema.sql`
4. Clique **"Run"** (ou Ctrl+Entrée)
5. Vérifie que les 3 tables apparaissent dans **Table Editor**

### 1.3 Récupérer les clés API

1. Va dans **Settings** → **API**
2. Note les deux valeurs :
   - **Project URL** → `https://xxxx.supabase.co`
   - **anon public key** → `eyJhbGci...` (longue chaîne)

---

## 🔐 ÉTAPE 2 — Créer ton compte utilisateur

1. Dans Supabase, va dans **Authentication** → **Users**
2. Clique **"Invite user"** ou **"Add user"**
3. Entre ton email et un mot de passe sécurisé
4. ✅ C'est ton seul et unique compte !

---

## ⚙️ ÉTAPE 3 — Configurer le frontend

Ouvre le fichier `js/config.js` et remplace les deux lignes :

```javascript
const SUPABASE_URL  = 'https://XXXXXXXXXXXXXXXX.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXX';
```

Par tes vraies valeurs récupérées à l'étape 1.3 :

```javascript
const SUPABASE_URL  = 'https://abcdefghijklmnop.supabase.co';  // ta vraie URL
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1N...';                  // ta vraie clé
```

---

## 🚀 ÉTAPE 4 — Déployer sur GitHub Pages

### 4.1 Créer le repository

```bash
# Dans le dossier agenda-dscg
git init
git add .
git commit -m "🚀 Initial commit - Mon Agenda DSCG"
```

### 4.2 Pousser sur GitHub

1. Va sur [github.com](https://github.com) → **New repository**
2. Nomme-le `agenda-dscg` (ou ce que tu veux)
3. **Public** (nécessaire pour GitHub Pages gratuit)
4. Ne coche aucune option (pas de README auto)
5. Clique **Create repository**
6. Exécute les commandes affichées :

```bash
git remote add origin https://github.com/TON-USERNAME/agenda-dscg.git
git branch -M main
git push -u origin main
```

### 4.3 Activer GitHub Pages

1. Dans ton repository GitHub → **Settings**
2. Section **Pages** (dans le menu de gauche)
3. **Source** → Deploy from a branch
4. **Branch** → `main` / `/ (root)`
5. Clique **Save**
6. Attends 1-2 min → tu verras l'URL : `https://TON-USERNAME.github.io/agenda-dscg/`

### 4.4 Configurer Supabase pour autoriser GitHub Pages

1. Dans Supabase → **Authentication** → **URL Configuration**
2. **Site URL** → `https://TON-USERNAME.github.io/agenda-dscg`
3. **Redirect URLs** → ajoute `https://TON-USERNAME.github.io/agenda-dscg`

---

## ✅ ÉTAPE 5 — Vérification finale

1. Ouvre `https://TON-USERNAME.github.io/agenda-dscg/`
2. Entre ton email + mot de passe Supabase
3. L'application devrait s'ouvrir ✨

---

## 🎨 Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 📅 Agenda hebdomadaire | Grille 8h-22h, blocs colorés par matière |
| 🖱️ Drag & Drop | Déplace les événements par glisser-déposer |
| ➕ Créer/modifier/supprimer | Clic sur la grille ou bouton + |
| 📊 Statistiques | Donut + courbe, 3 périodes (semaine/mois/année) |
| 🌿 Bien-être | Analyse équilibre travail/détente + message |
| 🎯 Objectifs | Objectifs hebdomadaires avec check |
| 📝 To-do list | Tâches avec deadline et catégorie |
| 💛 Liste Kaïs | Activités fun avec bouton "On le fait quand ?" |
| 🔥 Streak | Compteur de jours consécutifs de travail |
| ⌨️ Raccourcis | `N` = nouveau, `Echap` = fermer modal |

---

## 🐛 Problèmes fréquents

**"Invalid API key"** → Vérifie les clés dans `config.js`

**Données non sauvegardées** → Vérifie les tables SQL et les policies RLS dans Supabase

**Page blanche** → Ouvre la console (F12) et cherche les erreurs

**Connexion impossible** → Vérifie l'URL dans Supabase Authentication > URL Configuration

---

## 💜 Fait avec amour pour ton DSCG
