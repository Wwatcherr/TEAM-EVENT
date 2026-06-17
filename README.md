# TeamUp — Événements d'équipe

Application web pour créer des événements d'équipe et laisser chaque membre indiquer s'il participe (Présent / Peut-être / Absent), en temps réel.

- Connexion simple par prénom (pas de mot de passe)
- N'importe qui peut créer un événement
- Mises à jour en temps réel entre tous les participants
- Design moderne et responsive (mobile + desktop)

## Stack technique

- [Next.js](https://nextjs.org) (React) — i nterface
- [Supabase](https://supabase.com) — base de données + temps réel (gratuit)
- [Vercel](https://vercel.com) — hébergement (gratuit)
- [GitHub](https://github.com) — stockage du code

---

## 🚀 Guide de déploiement (sans rien connaître au code)

Trois comptes gratuits à créer, dans cet ordre : **GitHub → Supabase → Vercel**.

### Étape 1 — Créer le compte GitHub

1. Va sur [github.com](https://github.com) → "Sign up".
2. Crée un nouveau dépôt (bouton vert "New") nommé par exemple `team-events`, en **Public** ou **Private**, sans cocher "Add a README".
3. Mets en ligne le code de ce dossier :

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/team-events.git
git push -u origin main
```

(Remplace `TON-PSEUDO` par ton nom d'utilisateur GitHub. GitHub te donnera l'URL exacte sur la page du dépôt créé.)

### Étape 2 — Créer le projet Supabase (base de données)

1. Va sur [supabase.com](https://supabase.com) → "Start your project" → connecte-toi avec GitHub.
2. Clique "New Project". Donne-lui un nom, choisis un mot de passe de base de données (à garder de côté), et une région proche de toi (ex : Paris/Frankfurt).
3. Une fois le projet créé (1-2 min), va dans l'onglet **SQL Editor** (menu de gauche).
4. Ouvre le fichier `supabase-schema.sql` de ce projet, copie tout son contenu, colle-le dans l'éditeur SQL, et clique **Run**.
5. Va dans **Project Settings** (icône engrenage) → **API**. Note deux valeurs :
   - `Project URL`
   - `anon public` key

### Étape 3 — Déployer sur Vercel

1. Va sur [vercel.com](https://vercel.com) → "Sign up" → connecte-toi avec GitHub.
2. Clique "Add New..." → "Project", puis sélectionne ton dépôt `team-events`.
3. Dans **Environment Variables**, ajoute :
   - `NEXT_PUBLIC_SUPABASE_URL` = (le Project URL de Supabase)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (la clé anon public de Supabase)
4. Clique **Deploy**. Après 1-2 minutes, Vercel te donne un lien public du type `https://team-events-xxxx.vercel.app`.

C'est ce lien que tu partages à toute l'équipe. 🎉

---

## Développement local (optionnel)

```bash
npm install
cp .env.example .env.local   # puis renseigne tes clés Supabase dans ce fichier
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Structure du projet

```
src/
  app/
    layout.tsx       → structure HTML globale, police, métadonnées
    page.tsx          → page principale (liste des événements)
    globals.css       → styles globaux
  components/
    NameGate.tsx       → écran de saisie du prénom
    Header.tsx         → en-tête avec prénom + déconnexion
    NewEventModal.tsx  → formulaire de création d'événement
    EventCard.tsx      → carte d'un événement + boutons de réponse
  lib/
    supabase.ts        → client Supabase + types
    user-context.tsx   → état global du prénom (stocké en localStorage)
supabase-schema.sql     → script SQL à exécuter dans Supabase
```

## Notes de sécurité

Cette app est pensée pour un usage interne d'équipe restreinte (10-30 personnes), sans données sensibles. L'accès en lecture/écriture à la base est ouvert (pas d'authentification forte), simplifié volontairement pour rester accessible sans gestion de comptes. Ne pas y stocker d'informations confidentielles.

## 🎨 Changer la couleur principale

Toute l'app utilise une seule couleur d'accent, définie dans `src/app/globals.css` en haut du fichier :

```css
--accent: #4f46e5;        /* couleur principale */
--accent-hover: #4338ca;  /* couleur au survol des boutons */
--accent-light: #eef2ff;  /* fond clair (icônes, focus des champs) */
--accent-text: #4338ca;   /* couleur de texte (liens) */
```

Remplace `--accent` par la couleur de ton choix (et idéalement `--accent-hover` par une version un peu plus sombre, `--accent-light` par une version très claire). Quelques exemples prêts à l'emploi :

- Bleu : `#0ea5e9` / hover `#0284c7` / light `#e0f2fe`
- Vert : `#16a34a` / hover `#15803d` / light `#dcfce7`
- Rose : `#db2777` / hover `#be185d` / light `#fce7f3`
- Orange : `#ea580c` / hover `#c2410c` / light `#ffedd5`

Aucune autre modification n'est nécessaire ; recommit et redéploie, et la couleur change partout dans l'app automatiquement.

## 🔒 Protéger l'app par un mot de passe d'équipe

Tu peux demander un mot de passe partagé avant l'accès à l'app (un seul mot de passe pour toute l'équipe, pas de comptes individuels).

Sur Vercel, va dans **Settings → Environment Variables** et ajoute :

- **Key** : `APP_PASSWORD`
- **Value** : le mot de passe de ton choix (ex : `equipe2026`)

Redéploie ensuite. Une fois entré correctement, le mot de passe n'est plus redemandé sur cet appareil/navigateur (cookie valable 1 an). Pour désactiver la protection, supprime simplement cette variable d'environnement sur Vercel et redéploie.

## 🆕 Si tu mets à jour une app déjà déployée (mot de passe global)

Si ton app est déjà en ligne et que tu ajoutes cette fonctionnalité après coup, il suffit de mettre à jour les fichiers du projet (nouveau dossier `src/app/api/auth/`, nouveau fichier `src/lib/use-app-lock.ts`, et `src/components/NameGate.tsx` + `src/app/page.tsx` mis à jour). Aucune migration Supabase n'est nécessaire pour cette fonctionnalité.

## 🆕 Si tu mets à jour une app déjà déployée (icônes + date limite)

Si ta base Supabase existe déjà (tables `events`/`responses` créées avant l'ajout des icônes et de la date limite), exécute simplement ce script en plus, dans le SQL Editor de Supabase :

```sql
alter table events add column if not exists icon text default '📅';
alter table events add column if not exists rsvp_deadline timestamptz;
```

(disponible aussi dans le fichier `supabase-migration-icons-deadline.sql` du projet)
