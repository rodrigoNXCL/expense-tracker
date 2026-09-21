import type { Metadata } from 'next'
import PreciosClient from './precios-client'

export const metadata: Metadata = {
  title: 'RindeNX | Precios de software de rendiciones de gastos',
  description:
    'Controla fondos, gastos, respaldos y rendiciones desde un solo lugar. RindeNX desde $9.900 al mes pagando anual. Solicita una demostración.',
  keywords: [
    'software de rendición de gastos',
    'software de rendiciones',
    'sistema de rendiciones de gastos',
    'rendición de gastos empresas',
    'software rendición de gastos Chile',
    'sistema de rendición de gastos Chile',
    'control de fondos por rendir',
    'fondos por rendir empresas',
    'control de gastos empresas',
    'gestión de rendiciones',
    'software para rendiciones',
    'rendiciones de gastos trabajadores',
    'control de fondos empresas',
    'software administrativo Chile',
  ],
  openGraph: {
    title: 'RindeNX | Software de rendición de gastos para empresas',
    description:
      'Controla fondos, gastos, respaldos y rendiciones desde un solo lugar. Planes desde $9.900 al mes pagando anual.',
    url: 'https://rinde.nxchile.com/precios',
    siteName: 'RindeNX',
    locale: 'es_CL',
    type: 'website',
  },
  alternates: {
    canonical: 'https://rinde.nxchile.com/precios',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'RindeNX',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'Software de gestión de rendiciones de gastos que permite a las empresas controlar fondos por rendir, registrar gastos, asociar respaldos, revisar rendiciones y aprobar operaciones.',
      url: 'https://rinde.nxchile.com',
      offers: [
        {
          '@type': 'Offer',
          name: 'RindeNX Pyme',
          price: '9900',
          priceCurrency: 'CLP',
          priceValidUntil: '2026-12-31',
          availability: 'https://schema.org/InStock',
          description: 'Hasta 5 rendidores. Pago anual.',
        },
        {
          '@type': 'Offer',
          name: 'RindeNX Empresa',
          price: '19900',
          priceCurrency: 'CLP',
          priceValidUntil: '2026-12-31',
          availability: 'https://schema.org/InStock',
          description: 'Hasta 15 rendidores. Pago anual.',
        },
        {
          '@type': 'Offer',
          name: 'RindeNX Pro',
          price: '34900',
          priceCurrency: 'CLP',
          priceValidUntil: '2026-12-31',
          availability: 'https://schema.org/InStock',
          description: 'Hasta 30 rendidores. Pago anual.',
        },
      ],
    },
    {
      '@type': 'Organization',
      name: 'NXChile',
      url: 'https://www.nxchile.com',
      logo: 'https://rinde.nxchile.com/images/LogogastosNX.png',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Cuánto cuesta RindeNX?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'RindeNX comienza en $9.900 mensuales con pago anual y hasta 5 rendidores incluidos. Para quienes prefieren pagar mes a mes, el plan Pyme tiene un valor de $12.900 mensuales.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cuál es la diferencia entre pagar mensual y anual?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'El pago anual permite acceder al precio preferente de cada plan. El pago mensual ofrece mayor flexibilidad de pago con una tarifa mensual superior.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Qué es un rendidor?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Es una persona que recibe fondos de la empresa y posteriormente debe registrar y rendir los gastos realizados.',
          },
        },
        {
          '@type': 'Question',
          name: '¿RindeNX sirve para controlar fondos por rendir?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí. RindeNX permite registrar fondos entregados, asociar gastos y respaldos, revisar la rendición y controlar los saldos pendientes.',
          },
        },
        {
          '@type': 'Question',
          name: '¿RindeNX permite subir boletas y facturas?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí. Los documentos pueden asociarse a los gastos registrados y RindeNX incorpora OCR para facilitar la captura de información.',
          },
        },
        {
          '@type': 'Question',
          name: '¿RindeNX reemplaza el sistema contable?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. RindeNX está orientado al control y gestión de fondos y rendiciones. La información puede prepararse para facilitar el proceso contable.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Puedo utilizar RindeNX con pocos trabajadores?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí. El plan Pyme permite comenzar con hasta 5 rendidores.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Puedo aumentar la cantidad de rendidores?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí. RindeNX cuenta con planes para empresas con mayor cantidad de rendidores.',
          },
        },
        {
          '@type': 'Question',
          name: '¿RindeNX se integra con GastosNX?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí. Los gastos asociados a las rendiciones pueden continuar su flujo hacia GastosNX para mantener y organizar sus respaldos y antecedentes.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: 'https://rinde.nxchile.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Planes y precios',
          item: 'https://rinde.nxchile.com/precios',
        },
      ],
    },
  ],
}

export default function PreciosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PreciosClient />
    </>
  )
}
