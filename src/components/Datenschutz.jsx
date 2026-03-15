import { Link } from "react-router-dom";

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium mb-8 hover:opacity-80"
          style={{ color: "#2C5C45" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Zurück
        </Link>

        <h1
          className="text-3xl font-bold mb-8"
          style={{ color: "#2C5C45" }}
        >
          Datenschutzerklärung
        </h1>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10 space-y-8 text-gray-700 leading-relaxed">
          {/* 1. Verantwortlicher */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: "#2C5C45" }}
            >
              1. Verantwortlicher
            </h2>
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
            </p>
            <address className="mt-2 not-italic bg-gray-50 rounded-lg p-4 text-sm">
              [Dein Name]
              <br />
              [Straße Nr.]
              <br />
              [PLZ Stadt]
              <br />
              E-Mail:{" "}
              <a
                href="mailto:deine@email.de"
                className="underline"
                style={{ color: "#2C5C45" }}
              >
                [deine@email.de]
              </a>
            </address>
          </section>

          {/* 2. Erhebung und Speicherung personenbezogener Daten */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: "#2C5C45" }}
            >
              2. Erhebung und Speicherung personenbezogener Daten
            </h2>
            <p>
              Bei der Nutzung von Deeny werden folgende personenbezogene Daten
              erhoben und gespeichert:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>E-Mail-Adresse</strong> – zur Registrierung und
                Anmeldung über Supabase Authentication.
              </li>
              <li>
                <strong>Passwort (als Hash)</strong> – wird von Supabase
                verschlüsselt gespeichert und ist für uns nicht im Klartext
                einsehbar.
              </li>
              <li>
                <strong>Gebetsdaten</strong> – Informationen zu deinen
                eingetragenen Gebeten, Streaks und Fortschritten werden in der
                Supabase-Datenbank gespeichert.
              </li>
            </ul>
          </section>

          {/* 3. Zweck der Datenverarbeitung */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: "#2C5C45" }}
            >
              3. Zweck der Datenverarbeitung
            </h2>
            <p>Die erhobenen Daten werden ausschließlich verwendet, um:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>dir die Nutzung der App zu ermöglichen (Registrierung, Login),</li>
              <li>deine Gebete zu tracken und deinen Fortschritt anzuzeigen,</li>
              <li>Streak-Daten zu berechnen und darzustellen,</li>
              <li>deine persönlichen Statistiken bereitzustellen.</li>
            </ul>
            <p className="mt-2">
              Es findet keine Weitergabe deiner Daten an Dritte zu Werbezwecken
              statt.
            </p>
          </section>

          {/* 4. Rechtsgrundlage */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: "#2C5C45" }}
            >
              4. Rechtsgrundlage
            </h2>
            <p>
              Die Verarbeitung deiner personenbezogenen Daten erfolgt auf
              Grundlage von:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</strong> – du
                willigst durch die Registrierung in die Verarbeitung deiner
                Daten ein.
              </li>
              <li>
                <strong>
                  Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
                </strong>{" "}
                – die Datenverarbeitung ist erforderlich, um dir die
                Funktionalitäten der App bereitzustellen.
              </li>
            </ul>
          </section>

          {/* 5. Speicherdauer */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: "#2C5C45" }}
            >
              5. Speicherdauer
            </h2>
            <p>
              Deine personenbezogenen Daten werden so lange gespeichert, wie dein
              Benutzerkonto besteht. Wenn du dein Konto löschst oder eine
              Löschung anforderst, werden alle zugehörigen Daten unwiderruflich
              entfernt.
            </p>
            <p className="mt-2">
              Du kannst jederzeit die Löschung deines Kontos und aller
              gespeicherten Daten per E-Mail an{" "}
              <a
                href="mailto:deine@email.de"
                className="underline"
                style={{ color: "#2C5C45" }}
              >
                [deine@email.de]
              </a>{" "}
              beantragen.
            </p>
          </section>

          {/* 6. Rechte der Betroffenen */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: "#2C5C45" }}
            >
              6. Rechte der Betroffenen
            </h2>
            <p>Du hast gemäß DSGVO folgende Rechte:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Auskunft</strong> (Art. 15 DSGVO) – du kannst Auskunft
                über deine gespeicherten Daten verlangen.
              </li>
              <li>
                <strong>Berichtigung</strong> (Art. 16 DSGVO) – du kannst die
                Korrektur unrichtiger Daten verlangen.
              </li>
              <li>
                <strong>Löschung</strong> (Art. 17 DSGVO) – du kannst die
                Löschung deiner Daten verlangen.
              </li>
              <li>
                <strong>Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)
                – du kannst die Einschränkung der Datenverarbeitung verlangen.
              </li>
              <li>
                <strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO) – du
                kannst deine Daten in einem gängigen Format erhalten.
              </li>
              <li>
                <strong>Widerspruch</strong> (Art. 21 DSGVO) – du kannst der
                Verarbeitung deiner Daten widersprechen.
              </li>
            </ul>
            <p className="mt-2">
              Zur Ausübung deiner Rechte wende dich bitte an{" "}
              <a
                href="mailto:deine@email.de"
                className="underline"
                style={{ color: "#2C5C45" }}
              >
                [deine@email.de]
              </a>
              .
            </p>
          </section>

          {/* 7. Cookies und lokale Speicherung */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: "#2C5C45" }}
            >
              7. Cookies und lokale Speicherung
            </h2>
            <p>
              Deeny verwendet <strong>keine Tracking-Cookies</strong> und keine
              Analyse-Tools von Drittanbietern.
            </p>
            <p className="mt-2">
              Wir nutzen ausschließlich den <strong>localStorage</strong> deines
              Browsers, um lokale Einstellungen und Präferenzen zu speichern
              (z.&nbsp;B. Spracheinstellungen, UI-Präferenzen). Diese Daten
              verlassen deinen Browser nicht und werden nicht an Server
              übermittelt.
            </p>
          </section>

          {/* 8. Hosting */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: "#2C5C45" }}
            >
              8. Hosting
            </h2>
            <p>
              Das <strong>Frontend</strong> von Deeny wird als statische Website
              gehostet. Beim Aufruf der Website werden vom Hosting-Anbieter
              übliche Server-Logdaten (z.&nbsp;B. IP-Adresse, Browsertyp,
              Zugriffszeitpunkt) verarbeitet.
            </p>
            <p className="mt-2">
              Das <strong>Backend</strong> (Authentifizierung und Datenbank) wird
              über{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: "#2C5C45" }}
              >
                Supabase
              </a>{" "}
              bereitgestellt. Supabase speichert Daten auf Servern, die nach
              modernen Sicherheitsstandards betrieben werden. Weitere
              Informationen findest du in der{" "}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: "#2C5C45" }}
              >
                Datenschutzerklärung von Supabase
              </a>
              .
            </p>
          </section>

          {/* 9. Änderungen der Datenschutzerklärung */}
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: "#2C5C45" }}
            >
              9. Änderungen der Datenschutzerklärung
            </h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf
              anzupassen, um sie an geänderte Rechtslagen oder bei Änderungen der
              App anzupassen. Die jeweils aktuelle Fassung gilt ab dem Zeitpunkt
              ihrer Veröffentlichung auf dieser Seite.
            </p>
          </section>

          <p className="text-sm text-gray-400 pt-4 border-t border-gray-100">
            Stand: März 2026
          </p>
        </div>
      </div>
    </div>
  );
}
