/// Page d'accueil publique de Clinique NOS.
/// Structure : Navbar → Hero → Chiffres → Services → Témoignages → CTA → Footer.

import Link from "next/link";
import {
  CalendarCheck,
  ShieldCheck,
  Clock,
  Star,
  ArrowRight,
  Phone,
  MapPin,
  CheckCircle,
  Users,
  Award,
  HeartPulse,
} from "lucide-react";

// --- Données de contenu ---

/// Les trois services phares mis en avant sur la page d'accueil.
const SERVICES = [
  {
    icon: CalendarCheck,
    title: "Prise de rendez-vous en ligne",
    description:
      "Réservez une consultation avec nos médecins en moins de 2 minutes, 24h/24 et 7j/7, sans attente.",
  },
  {
    icon: ShieldCheck,
    title: "Suivi personnalisé",
    description:
      "Accédez à vos ordonnances, comptes-rendus et résultats depuis votre espace sécurisé.",
  },
  {
    icon: Clock,
    title: "Consultations rapides",
    description:
      "Nos créneaux sont conçus pour respecter votre temps. Les délais d'attente sont les plus courts possibles.",
  },
];

/// Les trois chiffres clés qui rassurent le visiteur.
const STATS = [
  { value: "4 800+", label: "Patients accompagnés" },
  { value: "98%", label: "De satisfaction" },
  { value: "12 min", label: "Délai moyen d'obtention" },
];

/// Les témoignages patients — preuve sociale essentielle pour la conversion.
const TESTIMONIALS = [
  {
    name: "Marie L.",
    role: "Patiente depuis 2 ans",
    quote:
      "J'ai enfin trouvé une clinique qui respecte mon temps. La prise de rendez-vous en ligne est un vrai soulagement.",
    rating: 5,
  },
  {
    name: "Thomas B.",
    role: "Patient",
    quote:
      "L'équipe médicale est attentive et professionnelle. Je recommande à toute ma famille.",
    rating: 5,
  },
  {
    name: "Isabelle M.",
    role: "Patiente depuis 3 ans",
    quote:
      "Mon espace patient me permet de suivre mon parcours de santé facilement. Vraiment pratique.",
    rating: 5,
  },
];

/// Les avantages listés dans la section CTA.
const ADVANTAGES = [
  "Aucun frais d'inscription",
  "Paiement en ligne sécurisé",
  "Facture téléchargeable",
  "Rappels automatiques",
];

// --- Composants de section ---

/// Barre de navigation fixe avec logo et liens.
function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <HeartPulse size={16} className="text-white" />
          </div>
          <span className="font-heading font-700 text-slate-900 text-lg tracking-tight">
            Clinique <span className="text-emerald-600">NOS</span>
          </span>
        </Link>

        {/* Navigation principale */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#services" className="hover:text-emerald-600 transition-colors duration-200 cursor-pointer">
            Nos services
          </a>
          <a href="#temoignages" className="hover:text-emerald-600 transition-colors duration-200 cursor-pointer">
            Témoignages
          </a>
          <a href="#contact" className="hover:text-emerald-600 transition-colors duration-200 cursor-pointer">
            Contact
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:block text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors duration-200 px-4 py-2"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-colors duration-200 cursor-pointer"
          >
            Prendre rendez-vous
          </Link>
        </div>
      </nav>
    </header>
  );
}

/// Section héro — première impression, message principal, CTA principal.
function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-emerald-50/60 via-white to-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contenu textuel */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 text-sm font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Consultations disponibles aujourd'hui
            </div>

            {/* Titre principal */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Votre santé,{" "}
              <span className="text-emerald-600">prise en charge</span>{" "}
              simplement
            </h1>

            {/* Sous-titre */}
            <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
              Réservez une consultation avec nos médecins spécialistes en quelques
              clics. Suivi personnalisé, accès à vos documents et rappels automatiques.
            </p>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-200 cursor-pointer"
              >
                Prendre rendez-vous
                <ArrowRight size={18} />
              </Link>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-8 py-4 rounded-2xl border border-slate-200 transition-colors duration-200 cursor-pointer"
              >
                Découvrir nos soins
              </a>
            </div>

            {/* Rassurances rapides */}
            <div className="flex flex-wrap gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle size={16} className="text-emerald-500" />
                Sans avance de frais
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle size={16} className="text-emerald-500" />
                Disponible 24h/24
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle size={16} className="text-emerald-500" />
                Médecins certifiés
              </span>
            </div>
          </div>

          {/* Visuel décoratif — carte flottante */}
          <div className="relative hidden lg:block">
            {/* Fond décoratif */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-3xl -rotate-2"></div>

            {/* Carte principale */}
            <div className="relative bg-white rounded-3xl shadow-xl p-8 space-y-6 border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Prochain créneau</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">Aujourd'hui à 14h30</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <CalendarCheck size={24} className="text-emerald-600" />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-3">
                {["Dr. Martin – Cardiologie", "Dr. Rousseau – Généraliste", "Dr. Benali – Dermatologie"].map(
                  (doc) => (
                    <div
                      key={doc}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Users size={14} className="text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{doc}</span>
                      <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Disponible
                      </span>
                    </div>
                  )
                )}
              </div>

              <Link
                href="/register"
                className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-colors duration-200 cursor-pointer"
              >
                Réserver maintenant
              </Link>
            </div>

            {/* Badge flottant satisfaction */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border border-slate-100">
              <div className="flex -space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center"
                  >
                    <Users size={10} className="text-emerald-600" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">4 800+ patients</p>
                <p className="text-xs text-slate-500">nous font confiance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/// Section chiffres clés — preuve sociale quantifiée.
function StatsSection() {
  return (
    <section className="py-16 bg-emerald-600">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {STATS.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-4xl font-heading font-extrabold text-white">{stat.value}</p>
              <p className="text-emerald-100 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/// Section services — ce que la clinique offre concrètement.
function ServicesSection() {
  return (
    <section id="services" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto space-y-14">
        {/* En-tête de section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-[0.2em]">
            Ce que nous proposons
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">
            Des soins accessibles et personnalisés
          </h2>
          <p className="text-slate-500 leading-relaxed">
            Nous mettons la technologie au service de votre santé pour vous offrir
            une expérience médicale simple, rapide et sans stress.
          </p>
        </div>

        {/* Grille de services */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="group p-8 rounded-3xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all duration-300 cursor-default"
              >
                <div className="w-12 h-12 bg-emerald-50 group-hover:bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-200">
                  <Icon size={24} className="text-emerald-600" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/// Section témoignages — preuve sociale qualitative.
function TestimonialsSection() {
  return (
    <section id="temoignages" className="py-24 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-14">
        {/* En-tête */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-[0.2em]">
            Ils nous font confiance
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">
            La parole à nos patients
          </h2>
        </div>

        {/* Grille de témoignages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-5"
            >
              {/* Étoiles */}
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-amber-400 fill-amber-400"
                  />
                ))}
              </div>

              {/* Citation */}
              <blockquote className="text-slate-700 leading-relaxed italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Auteur */}
              <div className="border-t border-slate-100 pt-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Users size={14} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{testimonial.name}</p>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/// Section CTA finale — conversion principale.
function CTASection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-10 sm:p-14 text-center space-y-8 shadow-2xl shadow-emerald-200">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
            <Award size={28} className="text-white" />
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              Prêt à prendre soin de vous ?
            </h2>
            <p className="text-emerald-100 leading-relaxed max-w-lg mx-auto">
              Créez votre espace patient gratuitement et réservez votre première
              consultation en quelques minutes.
            </p>
          </div>

          {/* Avantages */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
            {ADVANTAGES.map((avantage) => (
              <div key={avantage} className="flex items-center gap-2 text-sm text-white/90">
                <CheckCircle size={14} className="text-emerald-200 flex-shrink-0" />
                {avantage}
              </div>
            ))}
          </div>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-emerald-700 font-bold px-10 py-4 rounded-2xl transition-all duration-200 active:scale-95 shadow-lg cursor-pointer"
          >
            Créer mon compte
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/// Pied de page avec coordonnées et liens essentiels.
function Footer() {
  return (
    <footer id="contact" className="bg-slate-900 text-slate-400 py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-slate-800">
          {/* Identité */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <HeartPulse size={16} className="text-white" />
              </div>
              <span className="font-heading font-bold text-white text-lg">
                Clinique <span className="text-emerald-500">NOS</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Des soins de qualité, accessibles à tous. Votre bien-être est notre
              priorité.
            </p>
          </div>

          {/* Liens rapides */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">
              Accès rapide
            </h3>
            <nav className="space-y-2 text-sm">
              <Link href="/login" className="block hover:text-emerald-400 transition-colors duration-200 cursor-pointer">
                Connexion
              </Link>
              <Link href="/register" className="block hover:text-emerald-400 transition-colors duration-200 cursor-pointer">
                Créer un compte
              </Link>
              <a href="#services" className="block hover:text-emerald-400 transition-colors duration-200 cursor-pointer">
                Nos services
              </a>
            </nav>
          </div>

          {/* Coordonnées */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">
              Nous contacter
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>123 Avenue de la Santé<br />75000 Paris, France</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-emerald-500 flex-shrink-0" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Lun – Ven : 8h – 19h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2024 Clinique NOS — Tous droits réservés.</p>
          <p>Données médicales protégées — Hébergement certifié HDS</p>
        </div>
      </div>
    </footer>
  );
}

// --- Page principale ---

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <ServicesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
