# 🌌 Cyberdeck / Violet Startpage

<p align="center">
  <img src="images/gif.gif" alt="Aperçu Startpage" width="700" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);" />
</p>

<p align="center">
  <b>Une page d'accueil (startpage) moderne, fluide et immersive conçue pour booster votre productivité tout en sublimant votre navigateur.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Font_Awesome-528DD7?style=for-the-badge&logo=font-awesome&logoColor=white" alt="Font Awesome" />
  <img src="https://img.shields.io/badge/JetBrains_Mono-000000?style=for-the-badge&logo=jetbrains&logoColor=white" alt="JetBrains Mono" />
</p>

---

## 📸 Aperçu des Thèmes

La page intègre **3 thèmes visuels complets** avec éclairage ambiant (Ambilight), orbes lumineux animés et scanlines rétro. Vous pouvez basculer d'un thème à l'autre en un clic ou via le pavé numérique (`1`, `2`, `3`).

| Thème 1 : Kanagawa 🌊 | Thème 2 : Sakura 🌸 | Thème 3 : Cyberdeck ⚡ |
| :---: | :---: | :---: |
| <img src="images/gif.gif" width="240" /> | <img src="images/gif2.gif" width="240" /> | <img src="images/gif3.gif" width="240" /> |
| *Palette Cyan & Menthe froide* | *Palette Rose & Néo-Pastel* | *Palette Cyberpunk Violet & Néon* |

---

## ✨ Fonctionnalités Clés

### 🔍 1. Barre de Recherche Intelligente (Omnibox)
- **Raccourci instantané** : Appuyez sur la touche <kbd>/</kbd> n'importe où pour cibler directement la barre de recherche.
- **Moteurs de recherche & Préfixes rapides (Bangs)** :
  Tapez un préfixe pour changer instantanément de moteur :
  - `!yt <requête>` : Rechercher sur **YouTube**
  - `!gh <requête>` : Rechercher sur **GitHub**
  - `!tr <texte>` : Traduire avec **DeepL**
  - `!maps <lieu>` : Localiser sur **Google Maps**
  - `!img <terme>` : Rechercher sur **Google Images**
  - `!w <terme>` : Rechercher sur **Wikipédia**
  - `!d <requête>` : Rechercher sur **DuckDuckGo**
  - `!so <requête>` : Rechercher sur **StackOverflow**
  - `!arch <sujet>` : Consulter le wiki **ArchLinux**
  - `!r <terme>` : Rechercher sur **Reddit**
  - `!help` : Afficher l'aide interactive de tous les préfixes
- **Calculatrice en direct** : Saisissez une expression mathématique (ex: `15 * 4`, `(120/4) + 8`) et le résultat s'affiche en temps réel sans recharger la page.
- **Suggestions automatiques** : Intégration de l'autocomplétion Google en temps réel navigable au clavier (flèches <kbd>↑</kbd> <kbd>↓</kbd>).

### ⚡ 2. Signets & Raccourcis 100% Personnalisables
- **4 catégories par défaut** : *Social*, *Jeux*, *IA* (Gemini, ChatGPT, Claude, DeepSeek, etc.) et *Unif / Études*.
- **Mode Édition interactif** : Cliquez sur le bouton <kbd>Éditer</kbd> (icône pinceau) en haut à droite pour modifier n'importe quel raccourci.
- **Modale de personnalisation** : Changez le titre, l'URL de destination et sélectionnez une icône FontAwesome.
- **Persistance locale** : Toutes vos modifications sont enregistrées dans le `localStorage` de votre navigateur (aucune donnée n'est envoyée sur un serveur).

### 📅 3. Mini-Calendrier & Filtre d'échéances
- Vue calendaire complète du mois en cours avec mise en évidence du jour actuel.
- Navigation d'un mois à l'autre et bouton retour immédiat à aujourd'hui (<kbd>auj</kbd>).
- **Filtre interactif** : Cliquez sur un jour du calendrier pour filtrer automatiquement vos tâches associées à cette date.

### ✅ 4. Gestionnaire de Tâches (Tasks / To-Do List)
- Ajout instantané de tâches avec date d'échéance optionnelle.
- Validation d'une tâche d'un simple clic pour la rayer.
- Suppression facile et filtrage synchronisé avec le calendrier.
- Sauvegarde automatique dans le `localStorage`.

### 🌤️ 5. Météo & Horloge Digitale
- Horloge numérique dynamique avec affichage des secondes et date complète en français.
- Widget météo en direct (température et icône météo synchronisées périodiquement).

### 📰 6. Flux d'Actualités en Direct (Live Feeds)
- Onglets d'actualités intégrés :
  - 🏎️ **F1** : Dernières actus Formule 1
  - ⚽ **Football** : Dernières actualités foot
  - 💻 **Tech** : Veille technologique et numérique

---

## ⌨️ Raccourcis Clavier

| Raccourci | Action |
| :--- | :--- |
| <kbd>/</kbd> | Activer la barre de recherche |
| <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd> | Basculer entre les thèmes (Kanagawa / Sakura / Cyberdeck) |
| <kbd>Échap</kbd> | Fermer la modale d'édition ou fermer les suggestions de recherche |
| <kbd>Entrée</kbd> | Valider une recherche, ajouter une tâche ou enregistrer une modification |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Naviguer dans les suggestions de recherche |

---

## 🚀 Installation & Utilisation

### Option A : Utilisation locale (Recommandée)
1. Clonez ce dépôt ou téléchargez l'archive :
   ```bash
   git clone https://github.com/ugovds/startup_page.git
   ```
2. Ouvrez le fichier `index.html` dans votre navigateur Web (Chrome, Firefox, Brave, Edge, etc.).
3. Pour l'utiliser en tant que page de nouvel onglet :
   - Vous pouvez installer une extension de type **New Tab Override** ou **Custom New Tab URL**.
   - Renseignez l'URL locale du fichier `file:///chemin/vers/index.html` ou utilisez un petit serveur local.

### Option B : Déploiement en ligne gratuit (GitHub Pages)
1. Rendez-vous sur votre dépôt GitHub : `https://github.com/ugovds/startup_page`.
2. Allez dans **Settings** > **Pages**.
3. Sous **Branch**, sélectionnez `main` et `/ (root)`, puis cliquez sur **Save**.
4. Votre startpage sera disponible en ligne sous l'adresse :
   ```text
   https://ugovds.github.io/startup_page/
   ```

---

## 📂 Structure du Répertoire

```text
├── index.html        # Page principale : structure HTML et scripts interactifs
├── style.css         # Thèmes, mise en page CSS Grid/Flexbox et effets visuels
├── README.md         # Documentation et aperçus du projet
├── .gitignore        # Fichiers et dossiers exclus du suivi Git
└── images/           # Illustrations et GIFs animés
    ├── gif.gif       # Artwork Thème 1 (Kanagawa)
    ├── gif2.gif      # Artwork Thème 2 (Sakura)
    ├── gif3.gif      # Artwork Thème 3 (Cyberdeck)
    └── gif_origin.gif
```

---

## 🎨 Personnalisation Avancée

- **Modifier les couleurs & ambiances** : Ouvrez `style.css` et ajustez les variables CSS `:root`, `body[data-theme="2"]` et `body[data-theme="3"]`.
- **Changer les flux d'actualités** : Dans `index.html`, recherchez la fonction `fetchFeed()` pour modifier les sources RSS ou ajouter de nouvelles catégories.
