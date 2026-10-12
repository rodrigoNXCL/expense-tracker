'use client'

import { FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PrivacidadPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-white text-neutral-900 antialiased">
      <nav className="border-b border-black/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-neutral-900">NXChile</span>
          </div>
          <button
            onClick={() => router.back()}
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Volver
          </button>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
          Política de privacidad y tratamiento de datos
        </h1>
        <p className="text-sm text-neutral-500 mb-10">
          Última actualización: septiembre de 2026 · NXChile
        </p>

        <div className="space-y-8 text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Quién trata los datos</h2>
            <p>
              Los productos GastosNX y RindeNX son operados por <strong>NXChile</strong>. Puedes
              contactarnos en <strong>gastos@nxchile.com</strong> (GastosNX) o{' '}
              <strong>rinde@nxchile.com</strong> (RindeNX) para cualquier consulta sobre esta
              política o sobre los datos de tu empresa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Qué datos almacenamos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Datos de la cuenta:</strong> correo electrónico, nombre de la empresa, plan
                contratado y estado de activación.
              </li>
              <li>
                <strong>Datos operativos:</strong> gastos registrados, rendiciones, fondos
                asignados, montos, fechas y el detalle de cada movimiento.
              </li>
              <li>
                <strong>Documentos de respaldo:</strong> las imágenes de boletas, facturas y
                vouchers que el usuario adjunta.
              </li>
            </ul>
            <p className="mt-3">
              <strong>No solicitamos ni almacenamos datos de tarjetas bancarias, claves
              bancarias ni credenciales de acceso a cuentas bancarias.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Dónde se almacenan</h2>
            <p>
              Los datos de cada empresa se guardan en una hoja de cálculo privada en Google
              Sheets, de forma aislada por empresa. Las imágenes de los comprobantes se guardan en
              Supabase Storage, en un contenedor dedicado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Lectura automática de documentos</h2>
            <p>
              Cuando el usuario registra un gasto con captura de imagen, esa imagen se envía a{' '}
              <strong>Google Cloud Vision</strong> para extraer el texto del comprobante. La
              imagen se procesa en esa plataforma de Google conforme a sus propias políticas de
              tratamiento de datos, y se conserva en nuestro almacenamiento para quedar
              asociada al gasto como respaldo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Cookies y sesión</h2>
            <p>
              Utilizamos una única cookie técnica llamada <code>gx_session</code>, de tipo
              <strong> httpOnly</strong>, que permite mantener la sesión iniciada. No se
              almacena información de sesión en el navegador de forma accesible al usuario. Su
              vigencia es de 7 días y se elimina al cerrar sesión.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Correos de notificación</h2>
            <p>
              Los avisos de alta, recuperación de contraseña y contacto se envían mediante el
              servicio Web3Forms. Las contraseñas <strong>nunca se incluyen</strong> en esos
              correos: para restablecer una contraseña se genera un enlace temporal de un solo
              uso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Finalidad del tratamiento</h2>
            <p>
              Los datos se usan exclusivamente para operar el servicio contratado: registrar
              gastos y rendiciones, mostrar saldos y estados, generar la información de apoyo al
              proceso contable de la propia empresa y gestionar la cuenta. No utilizamos los datos
              con fines publicitarios ni los cedemos a terceros con fines comerciales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Acceso, corrección y eliminación</h2>
            <p>
              El usuario administrador puede consultar, corregir y eliminar los gastos y rendiciones de su empresa desde la propia aplicación. Para solicitar la eliminación de la cuenta o de los datos asociados, escribe al correo de contacto correspondiente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Alcance del servicio</h2>
            <p>
              GastosNX y RindeNX son herramientas de <strong>registro y control operacional</strong>.
              No reemplazan al contador ni determinan el tratamiento contable o tributario de las
              operaciones. Esas decisiones corresponden al profesional responsable y dependen de los
              antecedentes y requisitos aplicables.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-black/5">
          <p className="text-xs text-neutral-400 leading-relaxed">
            Esta política describe el tratamiento de datos en la implementación actual del
            servicio. Cualquier modificación sustancial se comunicará con antelación.
          </p>
        </div>
      </article>
    </main>
  )
}