
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear etiquetas
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'Ciencias' },
      update: {},
      create: { name: 'Ciencias', color: '#10B981' }
    }),
    prisma.tag.upsert({
      where: { name: 'Historia' },
      update: {},
      create: { name: 'Historia', color: '#F59E0B' }
    }),
    prisma.tag.upsert({
      where: { name: 'Matemáticas' },
      update: {},
      create: { name: 'Matemáticas', color: '#3B82F6' }
    }),
    prisma.tag.upsert({
      where: { name: 'Programación' },
      update: {},
      create: { name: 'Programación', color: '#8B5CF6' }
    }),
    prisma.tag.upsert({
      where: { name: 'Filosofía' },
      update: {},
      create: { name: 'Filosofía', color: '#EF4444' }
    })
  ])

  // Fichas de ejemplo
  const sampleCards = [
    {
      title: 'La Fotosíntesis',
      level1: 'Proceso mediante el cual las plantas convierten luz solar, CO₂ y agua en glucosa y oxígeno',
      level2: '• Ocurre en los cloroplastos de las células vegetales\n• Requiere luz solar como fuente de energía\n• Produce oxígeno como subproducto\n• Es fundamental para la vida en la Tierra\n• Convierte energía lumínica en química',
      level3: 'La fotosíntesis es el proceso biológico más importante para la vida en nuestro planeta. Se desarrolla en dos fases principales: la fase lumínica (reacciones dependientes de la luz) que ocurre en los tilacoides, donde la clorofila captura fotones y genera ATP y NADPH; y la fase oscura (ciclo de Calvin) que ocurre en el estroma, donde se fija el CO₂ atmosférico para formar glucosa. Este proceso no solo proporciona el oxígeno que respiramos, sino que también forma la base de todas las cadenas alimenticias, ya que convierte la energía solar en energía química almacenada.',
      level4: 'La fotosíntesis representa uno de los procesos bioquímicos más sofisticados y fundamentales de la naturaleza. A nivel molecular, involucra complejos sistemas de proteínas como el Fotosistema I y II, que trabajan en conjunto para capturar y convertir la energía lumínica. La ecuación general 6CO₂ + 6H₂O + energía lumínica → C₆H₁₂O₆ + 6O₂ resume un proceso extraordinariamente complejo que incluye la fotólisis del agua, la síntesis de ATP mediante fotofosforilación, y la reducción del NADP+. Evolutivamente, la aparición de la fotosíntesis oxigénica hace aproximadamente 2.5 mil millones de años transformó completamente la atmósfera terrestre, permitiendo el desarrollo de formas de vida aeróbicas y creando la capa de ozono protectora. En la actualidad, este proceso fija aproximadamente 100 mil millones de toneladas de carbono anualmente, siendo crucial para el equilibrio climático global.',
      questions: [
        '¿Cuáles son las dos fases principales de la fotosíntesis y dónde ocurren?',
        '¿Por qué la fotosíntesis es considerada el proceso más importante para la vida en la Tierra?',
        '¿Qué papel juegan los fotosistemas I y II en la fase lumínica?',
        '¿Cómo impactó evolutivamente la aparición de la fotosíntesis oxigénica?'
      ],
      tags: ['Ciencias']
    },
    {
      title: 'La Revolución Francesa (1789-1799)',
      level1: 'Período de transformación política y social radical en Francia que derrocó el Antiguo Régimen',
      level2: '• Comenzó en 1789 con la crisis financiera del reino\n• Proclamación de los Derechos del Hombre y del Ciudadano\n• Abolición del sistema feudal y privilegios aristocráticos\n• Ejecución de Luis XVI y María Antonieta\n• Establecimiento de la República Francesa',
      level3: 'La Revolución Francesa fue un proceso complejo que transformó no solo Francia sino que influyó en todo el mundo occidental. Surgió de una combinación de factores: la crisis financiera del Estado, las ideas ilustradas que cuestionaban el absolutismo, y el descontento popular ante las desigualdades sociales. El proceso revolucionario pasó por varias etapas: desde la convocatoria de los Estados Generales hasta el Terror jacobino liderado por Robespierre. Sus logros incluyen la abolición de la monarquía absoluta, la Declaración de Derechos, la separación de poderes, y profundas reformas sociales como la eliminación de los privilegios feudales.',
      level4: 'La Revolución Francesa representa un punto de inflexión en la historia mundial, marcando el fin del Antiguo Régimen y el nacimiento de la modernidad política. Su complejidad radica en la interacción de múltiples factores: la bancarrota estatal tras las guerras coloniales, la influencia de filósofos como Voltaire, Rousseau y Montesquieu, y las tensiones sociales entre los tres estados. El proceso revolucionario fue extraordinariamente dinámico: desde la Asamblea Nacional Constituyente (1789-1791) que elaboró la primera constitución, pasando por la Asamblea Legislativa (1791-1792) y la radicalización con la Convención Nacional (1792-1795), hasta la reacción termidoriana y el Directorio. Las consecuencias fueron trascendentales: establecimiento del principio de soberanía popular, codificación legal con el Código Napoleónico, impulso al nacionalismo moderno, y la expansión de los ideales democráticos y republicanos por Europa y América. Su impacto perdura hasta nuestros días en conceptos fundamentales como ciudadanía, derechos humanos, separación de poderes y estado laico.',
      questions: [
        '¿Qué factores provocaron el estallido de la Revolución Francesa?',
        '¿Cuáles fueron las principales transformaciones sociales y políticas?',
        '¿Por qué se considera que la Revolución Francesa marca el inicio de la era contemporánea?',
        '¿Qué legado dejó la Revolución en el desarrollo de las democracias modernas?'
      ],
      tags: ['Historia']
    },
    {
      title: 'Funciones en Programación',
      level1: 'Bloques de código reutilizable que realizan una tarea específica y pueden recibir parámetros',
      level2: '• Permiten modularizar y organizar el código\n• Pueden recibir argumentos/parámetros de entrada\n• Pueden devolver un valor como resultado\n• Facilitan la reutilización y mantenimiento del código\n• Mejoran la legibilidad y estructura del programa',
      level3: 'Las funciones son uno de los conceptos fundamentales en programación, presentes en prácticamente todos los lenguajes. Representan el principio de "divide y vencerás", permitiendo descomponer problemas complejos en tareas más pequeñas y manejables. Una función típica tiene tres componentes: nombre (identificador), parámetros (datos de entrada opcionales) y cuerpo (código que ejecuta). Los beneficios incluyen reutilización de código, facilidad de testing, mantenimiento simplificado, y mejor organización del proyecto. Existen diferentes tipos: funciones puras (sin efectos secundarios), procedimientos (no retornan valor), métodos (funciones dentro de clases), y funciones anónimas o lambda.',
      level4: 'Las funciones constituyen la base de múltiples paradigmas de programación y representan una abstracción fundamental en ciencias de la computación. Desde una perspectiva teórica, conectan con el cálculo lambda de Alonzo Church y la teoría de funciones matemáticas. En programación funcional, las funciones son ciudadanos de primera clase, pudiendo ser asignadas a variables, pasadas como argumentos, y retornadas por otras funciones (higher-order functions). Conceptos avanzados incluyen closures (funciones que capturan su entorno léxico), currying (transformación de funciones multi-parámetro), recursión (especialmente tail recursion para optimización), y composición funcional. En términos de implementación, las funciones involucran el stack frame, paso de parámetros (por valor vs. referencia), y gestión de memoria. La evolución hacia funciones asíncronas (async/await) ha revolucionado el manejo de operaciones no bloqueantes. En diseño de software, patrones como Strategy, Command y Template Method se basan fuertemente en el concepto de función.',
      questions: [
        '¿Cuáles son las ventajas de usar funciones en lugar de código repetitivo?',
        '¿Qué diferencia existe entre pasar parámetros por valor y por referencia?',
        '¿Cómo se relacionan las funciones con paradigmas como la programación funcional?',
        '¿Qué son las funciones de orden superior y cuál es su utilidad?'
      ],
      tags: ['Programación']
    }
  ]

  // Crear fichas con sus relaciones
  for (const cardData of sampleCards) {
    const tagNames = cardData.tags
    const card = await prisma.card.create({
      data: {
        title: cardData.title,
        level1: cardData.level1,
        level2: cardData.level2,
        level3: cardData.level3,
        level4: cardData.level4,
        questions: cardData.questions,
        tags: {
          create: tagNames.map(tagName => ({
            tag: {
              connect: { name: tagName }
            }
          }))
        }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })
    
    console.log(`✅ Creada ficha: ${card.title}`)
  }

  console.log('🎉 Seed completado exitosamente')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
