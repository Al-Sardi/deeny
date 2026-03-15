import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Impressum() {
  return (
    <div className="min-h-dvh bg-[#FDFBF7] text-[#2D3748] antialiased">
      <div className="mx-auto max-w-2xl px-5 py-8">

        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#2C5C45] hover:opacity-80 transition-opacity mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Zurück</span>
        </Link>

        {/* Logo & heading */}
        <div className="flex items-center gap-3 mb-10">
          <img src="/logo.png" alt="Deeny" className="w-10 h-10 rounded-full" />
          <h1 className="text-2xl font-bold text-[#2C5C45]">Impressum</h1>
        </div>

        {/* Angaben gemäß § 5 DDG */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#2C5C45] mb-3">
            Angaben gemäß § 5 DDG
          </h2>
          <p className="leading-relaxed text-sm text-gray-700">
            {/* [PLACEHOLDER] Ersetze mit deinem vollständigen Namen */}
            [Dein Name]<br />
            {/* [PLACEHOLDER] Ersetze mit deiner Straße und Hausnummer */}
            [Straße Nr.]<br />
            {/* [PLACEHOLDER] Ersetze mit PLZ und Stadt */}
            [PLZ Stadt]
          </p>
        </section>

        {/* Kontakt */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#2C5C45] mb-3">
            Kontakt
          </h2>
          <p className="leading-relaxed text-sm text-gray-700">
            {/* [PLACEHOLDER] Ersetze mit deiner Telefonnummer */}
            Telefon: [Telefonnummer]<br />
            {/* [PLACEHOLDER] Ersetze mit deiner E-Mail-Adresse */}
            E-Mail: [deine@email.de]
          </p>
        </section>

        {/* Haftung für Inhalte */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#2C5C45] mb-3">
            Haftung für Inhalte
          </h2>
          <p className="leading-relaxed text-sm text-gray-700">
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte
            auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
            §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht
            verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
            überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
            Tätigkeit hinweisen.
          </p>
          <p className="leading-relaxed text-sm text-gray-700 mt-3">
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
            Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
            Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
            Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden
            von entsprechenden Rechtsverletzungen werden wir diese Inhalte
            umgehend entfernen.
          </p>
        </section>

        {/* Haftung für Links */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#2C5C45] mb-3">
            Haftung für Links
          </h2>
          <p className="leading-relaxed text-sm text-gray-700">
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren
            Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
            fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
            verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
            Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
            Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige
            Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
          </p>
          <p className="leading-relaxed text-sm text-gray-700 mt-3">
            Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch
            ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
            Bekanntwerden von Rechtsverletzungen werden wir derartige Links
            umgehend entfernen.
          </p>
        </section>

        {/* Footer note */}
        <p className="text-xs text-gray-400 mt-12 mb-4">
          © {new Date().getFullYear()} Deeny. Alle Rechte vorbehalten.
        </p>
      </div>
    </div>
  )
}
