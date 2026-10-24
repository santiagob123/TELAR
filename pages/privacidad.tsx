import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/privacy-policy.module.css'

const contactEmail = 'shantiii622@gmail.com'

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <Head>
        <title>Política de privacidad | TELAR Workspace</title>
        <meta
          name="description"
          content="Cómo TELAR Workspace trata y protege la información de las conversaciones de WhatsApp."
        />
        <meta name="robots" content="index,follow" />
      </Head>

      <header className={styles.hero}>
        <span className={styles.eyebrow}>TELAR WORKSPACE · PRIVACIDAD</span>
        <h1>Política de privacidad</h1>
        <p>
          Aquí explicamos qué información se procesa cuando conversas con TELAR por WhatsApp,
          para qué se utiliza y cómo puedes solicitar su eliminación.
        </p>
        <div className={styles.meta}>
          <span>Vigente desde el 23 de octubre de 2026</span>
          <span>Servicio: telar.workspace</span>
        </div>
      </header>

      <article className={styles.document}>
        <section>
          <h2>1. Responsable y contacto</h2>
          <p>
            <strong>Santiago Bernal Vega</strong> administra TELAR Workspace (telar.workspace) como
            responsable individual del servicio. Para consultas sobre privacidad, acceso,
            corrección o eliminación de información, escribe a{' '}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </p>
        </section>

        <section>
          <h2>2. Información que procesamos</h2>
          <p>Al utilizar el asistente de WhatsApp, TELAR puede procesar:</p>
          <ul>
            <li>Tu número de teléfono o identificador de WhatsApp.</li>
            <li>El contenido de los mensajes que envías y las respuestas del asistente.</li>
            <li>Fechas, horas e identificadores técnicos necesarios para organizar la conversación y evitar duplicados.</li>
            <li>La información que incluyas voluntariamente en tus mensajes.</li>
          </ul>
        </section>

        <section>
          <h2>3. Cómo usamos la información</h2>
          <p>Usamos estos datos para:</p>
          <ul>
            <li>Recibir y responder tus mensajes a través de WhatsApp.</li>
            <li>Mantener el contexto de la conversación y transferirla a una persona cuando corresponda.</li>
            <li>Proteger el servicio, detectar solicitudes duplicadas y resolver fallos técnicos.</li>
            <li>Atender solicitudes de privacidad relacionadas con tus conversaciones.</li>
          </ul>
        </section>

        <section>
          <h2>4. Proveedores que participan en el servicio</h2>
          <p>
            Para prestar el servicio, la información puede pasar por WhatsApp/Meta, los servicios
            de alojamiento y base de datos de TELAR, y la automatización de n8n. El texto necesario
            para generar una respuesta también puede ser procesado por el proveedor de inteligencia
            artificial configurado para el entorno de TELAR; la implementación admite OpenAI,
            Google Gemini o un servicio Ollama administrado por TELAR. El proveedor activo puede
            variar según la configuración del servicio.
          </p>
          <p>
            Estos proveedores reciben únicamente la información necesaria para realizar la función
            correspondiente. Cada proveedor puede tratarla conforme a sus propios términos y
            políticas de privacidad.
          </p>
        </section>

        <section>
          <h2>5. Conservación y eliminación</h2>
          <p>
            TELAR conserva las conversaciones hasta que recibamos una solicitud de eliminación.
            Para pedirla, escribe al correo de contacto e indica el número de WhatsApp asociado a
            la conversación. Para confirmar que controlas ese número, podemos pedirte que repitas
            la solicitud desde el mismo número de WhatsApp asociado a la conversación. Si no puedes
            hacerlo, acordaremos una verificación alternativa que no requiera documentos sensibles
            innecesarios. Una vez verificada, atenderemos la eliminación de los mensajes y datos de
            conversación en el almacenamiento operativo de TELAR.
          </p>
          <p>
            No hay un plazo automático de vencimiento para las conversaciones. Los datos que deban
            conservar terceros o sus respaldos se rigen también por las prácticas de esos
            proveedores.
          </p>
        </section>

        <section>
          <h2>6. Seguridad</h2>
          <p>
            TELAR utiliza conexiones HTTPS, controles de acceso y verificación de firma para las
            notificaciones entrantes de Meta. Ningún método de transmisión o almacenamiento puede
            garantizar seguridad absoluta; por eso, evita enviar contraseñas, códigos de acceso o
            información financiera por el chat.
          </p>
        </section>

        <section>
          <h2>7. Cambios a esta política</h2>
          <p>
            Si cambia el tratamiento de la información o la forma de prestar el servicio,
            actualizaremos esta página y su fecha de vigencia.
          </p>
        </section>

        <footer className={styles.footer}>
          <span>¿Tienes una solicitud de privacidad?</span>
          <a href={`mailto:${contactEmail}`}>Contactar a TELAR</a>
        </footer>
      </article>

      <nav className={styles.backLink} aria-label="Navegación secundaria">
        <Link href="/">Volver al inicio</Link>
      </nav>
    </div>
  )
}
