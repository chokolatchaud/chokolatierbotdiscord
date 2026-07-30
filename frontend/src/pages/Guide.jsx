import { useState } from "react";
import { ChevronRight, ChevronLeft, Pickaxe, TreePine, Axe, MapPin, Coins, CheckCircle, ArrowUpCircle, Sailboat, ThumbsUp, Shirt, Clock } from "lucide-react";

const STEPS = [
  {
    id: 1,
    icon: TreePine,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    tag: "ÉTAPE 1",
    title: "Construis ta structure",
    desc: "Sur Farmland, chaque joueur possède son propre monde. Construis librement — une maison, une tour, un château, peu importe ! Plus ta construction est diverse, complexe et équilibrée, plus elle vaudra cher sur le marché.",
    tips: [
      "Utilise des matériaux variés pour un meilleur score de créativité",
      "Varie les hauteurs et les formes pour augmenter le score d'architecture",
      "Remplis bien l'intérieur — la densité compte !",
      "Soigne les finitions : fenêtres, portes, décorations",
    ],
    visual: (
      <svg viewBox="0 0 400 220" className="w-full rounded-sm border border-border">
        {/* Ciel */}
        <rect width="400" height="220" fill="#1a1a2e"/>
        {/* Sol */}
        <rect x="0" y="160" width="400" height="60" fill="#2d5a27"/>
        {/* Herbe */}
        <rect x="0" y="155" width="400" height="8" fill="#3a7a32"/>
        {/* Maison - murs */}
        <rect x="100" y="90" width="200" height="70" fill="#8B6914"/>
        {/* Maison - toit */}
        <polygon points="90,90 200,30 310,90" fill="#5a3e0a"/>
        {/* Porte */}
        <rect x="180" y="125" width="40" height="35" fill="#3d2000"/>
        {/* Fenêtres */}
        <rect x="115" y="105" width="35" height="30" fill="#87CEEB" opacity="0.8"/>
        <rect x="250" y="105" width="35" height="30" fill="#87CEEB" opacity="0.8"/>
        {/* Croix fenêtre */}
        <line x1="132" y1="105" x2="132" y2="135" stroke="#5a3e0a" strokeWidth="2"/>
        <line x1="115" y1="120" x2="150" y2="120" stroke="#5a3e0a" strokeWidth="2"/>
        <line x1="267" y1="105" x2="267" y2="135" stroke="#5a3e0a" strokeWidth="2"/>
        <line x1="250" y1="120" x2="285" y2="120" stroke="#5a3e0a" strokeWidth="2"/>
        {/* Cheminée */}
        <rect x="240" y="45" width="20" height="40" fill="#5a3e0a"/>
        <rect x="236" y="40" width="28" height="8" fill="#3d2000"/>
        {/* Fumée */}
        <circle cx="250" cy="30" r="6" fill="#555" opacity="0.5"/>
        <circle cx="255" cy="18" r="5" fill="#555" opacity="0.3"/>
        {/* Arbres */}
        <rect x="50" y="130" width="8" height="30" fill="#5a3e0a"/>
        <circle cx="54" cy="118" r="20" fill="#2d7a27"/>
        <rect x="340" y="130" width="8" height="30" fill="#5a3e0a"/>
        <circle cx="344" cy="118" r="20" fill="#2d7a27"/>
        {/* Label score */}
        <rect x="140" y="8" width="120" height="22" rx="3" fill="#10B981" opacity="0.15" stroke="#10B981" strokeWidth="1"/>
        <text x="200" y="23" textAnchor="middle" fill="#10B981" fontSize="11" fontFamily="monospace">Score : 847 pts ✦</text>
      </svg>
    ),
  },
  {
    id: 2,
    icon: Axe,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    tag: "ÉTAPE 2",
    title: "Sélectionne ta structure avec WorldEdit",
    desc: "Pour définir une structure, tu dois d'abord la sélectionner avec la hache en bois (l'outil WorldEdit). Clique gauche sur un coin de ta construction, puis clique droit sur le coin opposé pour former un cube de sélection.",
    tips: [
      "Tape //wand pour obtenir la hache de sélection",
      "Clic GAUCHE = premier coin (pos1) — en bas d'un côté",
      "Clic DROIT = deuxième coin (pos2) — en haut du côté opposé",
      "La sélection doit englober TOUTE ta structure",
    ],
    visual: (
      <svg viewBox="0 0 400 220" className="w-full rounded-sm border border-border">
        <rect width="400" height="220" fill="#1a1a2e"/>
        <rect x="0" y="160" width="400" height="60" fill="#2d5a27"/>
        <rect x="0" y="155" width="400" height="8" fill="#3a7a32"/>
        {/* Maison simplifiée */}
        <rect x="100" y="90" width="200" height="70" fill="#8B6914" opacity="0.5"/>
        <polygon points="90,90 200,30 310,90" fill="#5a3e0a" opacity="0.5"/>
        {/* Sélection WorldEdit - cube en pointillés */}
        <rect x="75" y="20" width="250" height="145" fill="none" stroke="#9B59B6" strokeWidth="2" strokeDasharray="8,4"/>
        {/* Coins de sélection */}
        <circle cx="75" cy="165" r="8" fill="#9B59B6"/>
        <text x="60" y="185" fill="#9B59B6" fontSize="10" fontFamily="monospace">Pos1</text>
        <circle cx="325" cy="20" r="8" fill="#10B981"/>
        <text x="310" y="14" fill="#10B981" fontSize="10" fontFamily="monospace">Pos2</text>
        {/* Hache */}
        <g transform="translate(30, 60) rotate(-30)">
          <rect x="0" y="10" width="6" height="40" fill="#8B6914"/>
          <polygon points="6,8 22,0 22,24 6,24" fill="#aaa"/>
        </g>
        {/* Légende clic gauche */}
        <rect x="10" y="145" width="90" height="20" rx="2" fill="#9B59B6" opacity="0.2"/>
        <text x="55" y="158" textAnchor="middle" fill="#9B59B6" fontSize="9" fontFamily="monospace">Clic Gauche</text>
        {/* Légende clic droit */}
        <rect x="300" y="2" width="90" height="20" rx="2" fill="#10B981" opacity="0.2"/>
        <text x="345" y="15" textAnchor="middle" fill="#10B981" fontSize="9" fontFamily="monospace">Clic Droit</text>
        {/* Taille sélection */}
        <text x="200" y="100" textAnchor="middle" fill="#9B59B6" fontSize="12" fontFamily="monospace" opacity="0.8">250 blocs sélectionnés</text>
      </svg>
    ),
  },
  {
    id: 3,
    icon: MapPin,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    tag: "ÉTAPE 3",
    title: "Définis ta structure avec /define",
    desc: "Une fois ta sélection faite, place-toi DANS ta structure et tape /define <nom>. Tu dois choisir un nom pour identifier ta structure — sans espaces, ex: /define MaMaison ou /define Tour1. Le plugin va analyser tous les blocs et calculer un score.",
    tips: [
      "⚠ Tu dois être DANS la structure pour taper /define",
      "Choisis un nom sans espaces ex: /define MaMaison",
      "Le scan peut prendre quelques secondes",
      "Tu peux définir jusqu'à 5 structures maximum",
    ],
    visual: (
      <svg viewBox="0 0 400 220" className="w-full rounded-sm border border-border">
        <rect width="400" height="220" fill="#1a1a2e"/>
        {/* Fond console Minecraft */}
        <rect x="20" y="10" width="360" height="200" rx="4" fill="#0a0a0b" stroke="#333" strokeWidth="1"/>
        {/* Barre titre */}
        <rect x="20" y="10" width="360" height="24" rx="4" fill="#1a1a2e"/>
        <circle cx="38" cy="22" r="5" fill="#ff5f57"/>
        <circle cx="54" cy="22" r="5" fill="#ffbd2e"/>
        <circle cx="70" cy="22" r="5" fill="#28ca41"/>
        <text x="200" y="26" textAnchor="middle" fill="#666" fontSize="10" fontFamily="monospace">Minecraft Console</text>
        {/* Commande tapée */}
        <text x="35" y="60" fill="#aaa" fontSize="11" fontFamily="monospace">&gt; /define MaMaison</text>
        {/* Réponses */}
        <text x="35" y="85" fill="#666" fontSize="10" fontFamily="monospace">Scan de la structure en cours...</text>
        <text x="35" y="103" fill="#10B981" fontSize="10" fontFamily="monospace">✔ Structure analysée !</text>
        {/* Scores */}
        <rect x="30" y="115" width="340" height="80" rx="3" fill="#111" stroke="#222"/>
        <text x="40" y="132" fill="#F5C518" fontSize="10" fontFamily="monospace">╔══ RÉSULTATS ══╗</text>
        <text x="40" y="150" fill="#aaa" fontSize="10" fontFamily="monospace">Créativité   :</text>
        <text x="180" y="150" fill="#10B981" fontSize="10" fontFamily="monospace">████████░░  82/100</text>
        <text x="40" y="165" fill="#aaa" fontSize="10" fontFamily="monospace">Architecture :</text>
        <text x="180" y="165" fill="#10B981" fontSize="10" fontFamily="monospace">███████░░░  74/100</text>
        <text x="40" y="180" fill="#aaa" fontSize="10" fontFamily="monospace">Score total  :</text>
        <text x="180" y="180" fill="#F5C518" fontSize="10" fontFamily="monospace">★ 847 points</text>
      </svg>
    ),
  },
  {
    id: 4,
    icon: Coins,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    tag: "ÉTAPE 4",
    title: "Gagne des $FB grâce au marché",
    desc: "Une fois ta structure définie, elle génère automatiquement des $Farm Bucks ($FB) toutes les heures selon les prix du marché. Plus le marché valorise tes compétences, plus tu gagnes ! Les prix fluctuent selon les constructions de tous les joueurs.",
    tips: [
      "Les $FB sont distribués automatiquement toutes les heures",
      "Consulte /market pour voir les prix actuels du marché",
      "Plus tu as de structures (max 5), plus tu gagnes",
      "Surveille le marché sur farm-land.fr pour anticiper les tendances",
    ],
    visual: (
      <svg viewBox="0 0 400 220" className="w-full rounded-sm border border-border">
        <rect width="400" height="220" fill="#1a1a2e"/>
        {/* Graphique marché simplifié */}
        <text x="200" y="25" textAnchor="middle" fill="#F5C518" fontSize="12" fontFamily="monospace">MARCHÉ EN TEMPS RÉEL</text>
        {/* Axes */}
        <line x1="50" y1="170" x2="370" y2="170" stroke="#333" strokeWidth="1"/>
        <line x1="50" y1="40" x2="50" y2="170" stroke="#333" strokeWidth="1"/>
        {/* Courbe marché */}
        <polyline points="50,150 90,130 130,140 170,100 210,110 250,80 290,90 330,60 370,70"
          fill="none" stroke="#10B981" strokeWidth="2.5"/>
        {/* Zone sous la courbe */}
        <polygon points="50,150 90,130 130,140 170,100 210,110 250,80 290,90 330,60 370,70 370,170 50,170"
          fill="#10B981" opacity="0.08"/>
        {/* Labels Y */}
        <text x="40" y="170" textAnchor="end" fill="#666" fontSize="9" fontFamily="monospace">0</text>
        <text x="40" y="100" textAnchor="end" fill="#666" fontSize="9" fontFamily="monospace">50</text>
        <text x="40" y="44" textAnchor="end" fill="#666" fontSize="9" fontFamily="monospace">100</text>
        {/* Gains */}
        <rect x="250" y="100" width="130" height="60" rx="3" fill="#111" stroke="#10B981" strokeWidth="1"/>
        <text x="315" y="120" textAnchor="middle" fill="#aaa" fontSize="9" fontFamily="monospace">Tes gains / heure</text>
        <text x="315" y="142" textAnchor="middle" fill="#10B981" fontSize="18" fontFamily="monospace">+47 $FB</text>
        <text x="315" y="157" textAnchor="middle" fill="#666" fontSize="9" fontFamily="monospace">2 structures actives</text>
      </svg>
    ),
  },
  {
    id: 5,
    icon: ArrowUpCircle,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    tag: "ÉTAPE 5",
    title: "Améliore ton plot",
    desc: "Utilise tes $FB pour agrandir la bordure de ton plot avec /plot buy. Les upgrades sont infinis : plus tu avances, plus les prix montent par palier de +20 $FB tous les 21 achats. Construis grand pour construire encore plus grand !",
    tips: [
      "Chaque upgrade ajoute +5 blocs de bordure à ton plot",
      "Le premier palier commence à 50 $FB",
      "Le système est infini : jamais de plafond",
      "Un message t'annonce chaque nouveau palier de prix",
    ],
    visual: (
      <svg viewBox="0 0 400 220" className="w-full rounded-sm border border-border">
        <rect width="400" height="220" fill="#1a1a2e"/>
        <rect x="0" y="160" width="400" height="60" fill="#2d5a27"/>
        <rect x="150" y="90" width="100" height="70" fill="none" stroke="#F5C518" strokeWidth="2" strokeDasharray="6,4"/>
        <rect x="100" y="70" width="200" height="90" fill="none" stroke="#F5C518" strokeWidth="2" strokeDasharray="6,4" opacity="0.5"/>
        <rect x="60" y="55" width="280" height="105" fill="none" stroke="#F5C518" strokeWidth="2" strokeDasharray="6,4" opacity="0.25"/>
        <text x="200" y="40" textAnchor="middle" fill="#F5C518" fontSize="12" fontFamily="monospace">Palier 1 → 2 → 3 → ∞</text>
        <rect x="140" y="8" width="120" height="22" rx="3" fill="#F5C518" opacity="0.15" stroke="#F5C518" strokeWidth="1"/>
        <text x="200" y="23" textAnchor="middle" fill="#F5C518" fontSize="11" fontFamily="monospace">/plot buy</text>
      </svg>
    ),
  },
  {
    id: 6,
    icon: Sailboat,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    tag: "ÉTAPE 6",
    title: "Course de bateaux",
    desc: "Tape /joinboat depuis n'importe où sur le serveur pour rejoindre la prochaine course. Passe les 3 points de contrôle dans l'ordre puis franchis la ligne d'arrivée le plus vite possible. Le podium du jour rapporte gros !",
    tips: [
      "/joinboat fonctionne depuis n'importe où, pas besoin d'être au hub",
      "Les points de contrôle doivent être passés dans l'ordre",
      "1er du jour : 500 $FB, 2e : 250 $FB, 3e : 100 $FB",
      "Ton meilleur temps personnel est affiché sur le site",
    ],
    visual: (
      <svg viewBox="0 0 400 220" className="w-full rounded-sm border border-border">
        <rect width="400" height="220" fill="#0a1a2e"/>
        <rect x="0" y="140" width="400" height="80" fill="#1a4a6e"/>
        <path d="M60,170 L100,170 L90,190 L50,190 Z" fill="#8B6914"/>
        <circle cx="150" cy="150" r="10" fill="#F5C518" opacity="0.8"/>
        <circle cx="230" cy="150" r="10" fill="#F5C518" opacity="0.8"/>
        <circle cx="310" cy="150" r="10" fill="#F5C518" opacity="0.8"/>
        <text x="150" y="135" textAnchor="middle" fill="#F5C518" fontSize="9" fontFamily="monospace">1</text>
        <text x="230" y="135" textAnchor="middle" fill="#F5C518" fontSize="9" fontFamily="monospace">2</text>
        <text x="310" y="135" textAnchor="middle" fill="#F5C518" fontSize="9" fontFamily="monospace">3</text>
        <rect x="140" y="8" width="120" height="22" rx="3" fill="#22d3ee" opacity="0.15" stroke="#22d3ee" strokeWidth="1"/>
        <text x="200" y="23" textAnchor="middle" fill="#22d3ee" fontSize="11" fontFamily="monospace">/joinboat</text>
      </svg>
    ),
  },
  {
    id: 7,
    icon: ThumbsUp,
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
    tag: "ÉTAPE 7",
    title: "Vote et cosmétiques",
    desc: "Tape /vote pour voir les sites de vote du serveur. Chaque vote te donne du temps WorldEdit gratuit. Dépense tes $FB dans /buy cosmetic pour personnaliser ton look avec des chapeaux exclusifs !",
    tips: [
      "/vote affiche tous les liens de vote cliquables",
      "Chaque vote donne 1h de WorldEdit gratuit",
      "/buy cosmetic ouvre la boutique de chapeaux",
      "Un cosmétique acheté peut être rééquipé gratuitement à volonté",
    ],
    visual: (
      <svg viewBox="0 0 400 220" className="w-full rounded-sm border border-border">
        <rect width="400" height="220" fill="#1a1a2e"/>
        <rect x="60" y="60" width="120" height="130" rx="6" fill="#2a1a3e" stroke="#ec4899" strokeWidth="1.5"/>
        <text x="120" y="90" textAnchor="middle" fill="#ec4899" fontSize="10" fontFamily="monospace">/vote</text>
        <text x="120" y="115" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="monospace">+1h WorldEdit</text>
        <rect x="220" y="60" width="120" height="130" rx="6" fill="#2a1a3e" stroke="#F5C518" strokeWidth="1.5"/>
        <text x="280" y="90" textAnchor="middle" fill="#F5C518" fontSize="10" fontFamily="monospace">/buy cosmetic</text>
        <circle cx="280" cy="130" r="18" fill="#F5C518" opacity="0.8"/>
        <text x="280" y="165" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="monospace">chapeaux exclusifs</text>
      </svg>
    ),
  },
  {
    id: 8,
    icon: Clock,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    tag: "ÉTAPE 8",
    title: "Attention à l'AFK",
    desc: "Si tu restes inactif plus de 20 minutes (aucun mouvement), tu passes en AFK. Tes structures continuent de rapporter, mais au taux réduit hors-ligne (20%) plutôt qu'au taux plein. Reste actif pour profiter à fond du marché !",
    tips: [
      "20 minutes sans bouger = statut AFK activé",
      "Les revenus de structures passent à 20% du taux normal",
      "Un simple mouvement suffit à redevenir actif",
      "Le taux plein revient dès que tu bouges à nouveau",
    ],
    visual: (
      <svg viewBox="0 0 400 220" className="w-full rounded-sm border border-border">
        <rect width="400" height="220" fill="#1a1a2e"/>
        <circle cx="200" cy="100" r="60" fill="none" stroke="#fb923c" strokeWidth="3"/>
        <line x1="200" y1="100" x2="200" y2="60" stroke="#fb923c" strokeWidth="3"/>
        <line x1="200" y1="100" x2="230" y2="100" stroke="#fb923c" strokeWidth="3"/>
        <text x="200" y="185" textAnchor="middle" fill="#fb923c" fontSize="12" fontFamily="monospace">20 min → AFK → 20% du taux</text>
      </svg>
    ),
  },
  {
    id: 9,
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    tag: "COMMANDES",
    title: "Toutes tes commandes.",
    desc: "Voici toutes les commandes disponibles sur Farmland. Garde-les en tête pour tirer le meilleur du serveur !",
    tips: [
      "//wand → Obtenir la hache de sélection WorldEdit",
      "/define <nom> → Définir une structure (max 5)",
      "/undefine <nom> → Supprimer une structure",
      "/liststructure → Voir toutes tes structures",
      "/viewmoney → Voir les revenus de tes structures",
      "/market → Voir les prix du marché",
      "/plot buy → Améliorer la bordure de ton plot",
      "/buy worldedit → Acheter WorldEdit (200 $FB / 1h)",
      "/buy cosmetic → Acheter/équiper un chapeau",
      "/joinboat → Rejoindre la course de bateaux",
      "/vote → Voir les sites de vote (+1h WorldEdit)",
      "/hub → Retourner au hub",
      "/money → Voir ton solde $FB",
      "/pay <joueur> <montant> → Envoyer des $FB",
      "/msgf <joueur> <message> → Message privé",
      "/r <message> → Répondre au dernier message privé",
      "/plot home → Aller sur ton plot",
      "/plot trust <joueur> → Donner accès à ton plot",
      "/plot untrust <joueur> → Retirer l'accès à ton plot",
      "/tuto → Afficher ce guide",
    ],
    visual: (
      <svg viewBox="0 0 400 220" className="w-full rounded-sm border border-border">
        <rect width="400" height="220" fill="#1C1C1C"/>
        <rect x="0" y="0" width="400" height="20" fill="#0a2a0a"/>
        <text x="200" y="14" className="ts" fill="#55FF55" textAnchor="middle" fontSize="10" fontFamily="monospace">Commandes disponibles sur mine.farm-land.fr</text>
        <rect x="10" y="26" width="185" height="186" fill="#000" opacity="0.6" stroke="#333" strokeWidth="0.5"/>
        <text x="20" y="42" fill="#55FFFF" fontSize="9" fontFamily="monospace">//wand</text>
        <text x="20" y="56" fill="#55FFFF" fontSize="9" fontFamily="monospace">/define &lt;nom&gt;</text>
        <text x="20" y="70" fill="#55FFFF" fontSize="9" fontFamily="monospace">/undefine &lt;nom&gt;</text>
        <text x="20" y="84" fill="#55FFFF" fontSize="9" fontFamily="monospace">/liststructure</text>
        <text x="20" y="98" fill="#55FFFF" fontSize="9" fontFamily="monospace">/viewmoney</text>
        <text x="20" y="112" fill="#55FFFF" fontSize="9" fontFamily="monospace">/market</text>
        <text x="20" y="126" fill="#55FFFF" fontSize="9" fontFamily="monospace">/buy worldedit</text>
        <text x="20" y="140" fill="#55FFFF" fontSize="9" fontFamily="monospace">/money</text>
        <text x="20" y="154" fill="#55FFFF" fontSize="9" fontFamily="monospace">/pay &lt;joueur&gt; &lt;montant&gt;</text>
        <text x="20" y="168" fill="#55FFFF" fontSize="9" fontFamily="monospace">/msgf &lt;joueur&gt; &lt;msg&gt;</text>
        <text x="20" y="182" fill="#55FFFF" fontSize="9" fontFamily="monospace">/r &lt;message&gt;</text>
        <text x="20" y="196" fill="#55FFFF" fontSize="9" fontFamily="monospace">/tuto</text>
        <rect x="205" y="26" width="185" height="186" fill="#000" opacity="0.6" stroke="#333" strokeWidth="0.5"/>
        <text x="215" y="42" fill="#aaa" fontSize="9" fontFamily="monospace">Hache WorldEdit</text>
        <text x="215" y="56" fill="#aaa" fontSize="9" fontFamily="monospace">Définir une structure</text>
        <text x="215" y="70" fill="#aaa" fontSize="9" fontFamily="monospace">Supprimer une structure</text>
        <text x="215" y="84" fill="#aaa" fontSize="9" fontFamily="monospace">Voir tes structures</text>
        <text x="215" y="98" fill="#aaa" fontSize="9" fontFamily="monospace">Revenus structures</text>
        <text x="215" y="112" fill="#aaa" fontSize="9" fontFamily="monospace">Prix du marché</text>
        <text x="215" y="126" fill="#F5C518" fontSize="9" fontFamily="monospace">WorldEdit 15 $FB / 1h</text>
        <text x="215" y="140" fill="#aaa" fontSize="9" fontFamily="monospace">Voir ton solde</text>
        <text x="215" y="154" fill="#aaa" fontSize="9" fontFamily="monospace">Envoyer des $FB</text>
        <text x="215" y="168" fill="#aaa" fontSize="9" fontFamily="monospace">Message privé</text>
        <text x="215" y="182" fill="#aaa" fontSize="9" fontFamily="monospace">Répondre en privé</text>
        <text x="215" y="196" fill="#aaa" fontSize="9" fontFamily="monospace">Afficher ce guide</text>
      </svg>
    ),
  },
];

export default function Guide() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <p className="font-pixel text-xs text-emerald-400">GUIDE DU JOUEUR</p>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl mt-2">Comment jouer.</h1>
        <p className="text-zinc-400 mt-2">Construis, améliore ton plot, fais la course, vote et personnalise ton look sur Farmland.</p>
      </div>

      {/* Barre de progression */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <button key={s.id} onClick={() => setStep(i)}
            className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? "bg-emerald-500" : "bg-border"}`} />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contenu */}
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-pixel ${current.bg} ${current.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {current.tag}
          </div>
          <h2 className="font-display font-extrabold text-2xl">{current.title}</h2>
          <p className="text-zinc-400 leading-relaxed">{current.desc}</p>

          <div className="space-y-2">
            {current.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-emerald-400 font-pixel mt-0.5">›</span>
                <span className={tip.startsWith("⚠") ? "text-yellow-400" : tip.startsWith("/") || tip.startsWith("//") ? "text-blue-400 font-mono" : "text-zinc-300"}>
                  {tip}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Illustration */}
        <div className="space-y-4">
          <div className="bg-[#0A0A0B] rounded-sm border border-border">
            {current.visual}
          </div>
          <p className="text-zinc-600 text-xs text-center font-pixel">
            ÉTAPE {current.id} / {STEPS.length}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
            step === 0 ? "text-zinc-600 cursor-not-allowed" : "text-zinc-300 hover:text-white border border-border hover:border-zinc-500"
          }`}>
          <ChevronLeft className="w-4 h-4" /> Précédent
        </button>

        <span className="font-pixel text-xs text-zinc-500">{step + 1} / {STEPS.length}</span>

        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-black">
            Suivant <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <a href="https://mine.farm-land.fr" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium bg-yellow-500 hover:bg-yellow-600 text-black">
            Jouer maintenant <ChevronRight className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
