import Link from 'next/link'
import TelarHomeAnimation from '../components/TelarHomeAnimation'

export default function Home() {
  return (
    <div className="home-page">
      <div className="home-floating-figures" aria-hidden="true">
        <span className="home-float-shape home-float-orbit" />
        <span className="home-float-shape home-float-dot home-float-dot-one" />
        <span className="home-float-shape home-float-diamond" />
        <span className="home-float-shape home-float-dot home-float-dot-two" />
        <span className="home-float-shape home-float-square" />
        <span className="home-float-shape home-float-orbit home-float-orbit-small" />
        <span className="home-float-shape home-float-orbit home-float-orbit-mid" />
        <span className="home-float-shape home-float-star" />
        <span className="home-float-shape home-float-pill" />
        <span className="home-float-shape home-float-dot home-float-dot-three" />
        <span className="home-float-shape home-float-plus" />
        <span className="home-float-shape home-float-square home-float-square-small" />
        <span className="home-float-shape home-float-orbit home-float-orbit-large" />
        <span className="home-float-shape home-float-orbit home-float-orbit-right" />
        <span className="home-float-shape home-float-orbit home-float-ring-small" />
        <span className="home-float-shape home-float-orbit home-float-orbit-tiny" />
        <span className="home-float-shape home-float-star home-float-star-small" />
        <span className="home-float-shape home-float-dot home-float-dot-four" />
        <span className="home-float-shape home-float-dot home-float-dot-five" />
        <span className="home-float-shape home-float-dot home-float-dot-six" />
        <span className="home-float-shape home-float-diamond home-float-diamond-small" />
        <span className="home-float-shape home-float-cross" />
        <span className="home-float-shape home-float-dash" />
      </div>
      <main className="home-public-layout" aria-label="Experiencia pública TELAR TAG">
        <div className="home-copy-column">
          <section className="home-public-copy" aria-labelledby="home-title">
            <p className="home-kicker"><span className="home-kicker-dot" /> PERFIL DIGITAL <span className="home-kicker-divider" /> TELAR TAG</p>
            <h1 id="home-title">Tu negocio,<br />a un toque de distancia.</h1>
            <p className="home-intro">Comparte quién eres, dónde encontrarte y cómo ponerse en contacto con una experiencia digital sencilla.</p>
          </section>
          <div className="home-copy-footer">
            <Link href="/tag/demo123" className="home-primary-action">
              <span>Ver TAG demo</span>
              <span className="home-action-arrow" aria-hidden="true">→</span>
            </Link>
            <span className="home-copy-hint">Explora un perfil público de TELAR TAG</span>
          </div>
        </div>

        <div className="home-animation-stage">
          <TelarHomeAnimation />
        </div>
      </main>
    </div>
  )
}
