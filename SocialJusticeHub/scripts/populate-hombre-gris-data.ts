// Script para poblar el sistema con datos del Hombre Gris
// Basado en el PERFIL_HOMBRE_GRIS.md

const hombreGrisData = {
  dreams: [
    {
      dream: "Sueño con una Argentina donde mi hija pueda estudiar medicina en la UBA sin tener que trabajar 8 horas para pagar el alquiler, y que cuando se reciba pueda ejercer su profesión con dignidad en nuestro país",
      location: "Buenos Aires, Argentina",
      latitude: "-34.6037",
      longitude: "-58.3816"
    },
    {
      dream: "Aspiro a un país donde el trabajo honesto permita formar una familia sin tener que elegir entre comer o educar a los hijos, donde el salario mínimo sea realmente digno",
      location: "Córdoba, Argentina",
      latitude: "-31.4201",
      longitude: "-64.1888"
    },
    {
      dream: "Sueño con barrios donde los jóvenes no tengan que emigrar para encontrar oportunidades, donde cada provincia ofrezca las mismas chances de desarrollo personal y profesional",
      location: "Rosario, Argentina",
      latitude: "-32.9468",
      longitude: "-60.6393"
    },
    {
      dream: "Quiero una Argentina donde la innovación y la creatividad sean valoradas por encima de los contactos políticos, donde el mérito sea el único camino al éxito",
      location: "Mendoza, Argentina",
      latitude: "-32.8908",
      longitude: "-68.8272"
    }
  ],
  
  values: [
    {
      value: "Valoro profundamente cómo en mi barrio de San Telmo, cuando alguien se enferma, todos nos organizamos para llevar comida, cuidar a los chicos y acompañar. Ese espíritu comunitario que nos hace fuertes en las crisis",
      location: "Buenos Aires, Argentina",
      latitude: "-34.6218",
      longitude: "-58.3748"
    },
    {
      value: "Creo en la honestidad radical como único camino posible para construir confianza. Sin verdad no hay futuro posible, y cada mentira pequeña erosiona el tejido social que tanto necesitamos reconstruir",
      location: "Córdoba, Argentina",
      latitude: "-31.4135",
      longitude: "-64.1811"
    },
    {
      value: "Valoro la capacidad de reinventarme constantemente. Mi abuelo llegó de España con una mano atrás y otra adelante, y construyó una vida digna trabajando honradamente. Esa resiliencia está en nuestra sangre",
      location: "Rosario, Argentina",
      latitude: "-32.9524",
      longitude: "-60.6389"
    },
    {
      value: "Creo profundamente en la educación como el gran igualador social. Mi maestra de primaria me enseñó que el conocimiento libera, y desde entonces esa convicción guía cada decisión que tomo",
      location: "Mendoza, Argentina",
      latitude: "-32.8895",
      longitude: "-68.8458"
    }
  ],
  
  needs: [
    {
      need: "Necesitamos que el comedor del barrio tenga gas para cocinar. Hace 3 meses que cocinamos con leña porque no nos conectan la garrafa, y los chicos se están enfermando del humo tóxico",
      location: "Buenos Aires, Argentina",
      latitude: "-34.6345",
      longitude: "-58.3654"
    },
    {
      need: "Urge que mi hijo pueda acceder a un tratamiento psicológico. Tiene 12 años y sufre de ansiedad por la situación económica familiar, pero no podemos pagar un profesional privado",
      location: "Córdoba, Argentina",
      latitude: "-31.4201",
      longitude: "-64.1888"
    },
    {
      need: "Requerimos transporte público seguro y eficiente. Mi esposa pierde 3 horas diarias en colectivos que no pasan nunca, tiempo que podría usar para estudiar o descansar",
      location: "Rosario, Argentina",
      latitude: "-32.9468",
      longitude: "-60.6393"
    },
    {
      need: "Necesitamos conexión a internet estable y accesible. Mis hijos tienen que hacer las tareas escolares en la plaza buscando wifi abierto, y eso limita su futuro educativo",
      location: "Mendoza, Argentina",
      latitude: "-32.8908",
      longitude: "-68.8272"
    }
  ],
  
  bastas: [
    {
      basta: "¡BASTA! de postergar mis sueños por miedo al fracaso. ¡BASTA! de esperar que otros cambien primero. Quiero ser una persona que actúa con valentía y coherencia, empezando por mi propia transformación",
      location: "Buenos Aires, Argentina",
      latitude: "-34.6118",
      longitude: "-58.3960"
    },
    {
      basta: "¡BASTA! de aceptar que la salud mental sea un lujo solo para quienes pueden pagarlo. ¡BASTA! de normalizar que nuestros hijos sufran en silencio porque 'no hay plata para psicólogos'",
      location: "Córdoba, Argentina",
      latitude: "-31.4135",
      longitude: "-64.1811"
    },
    {
      basta: "¡BASTA! de la resignación aprendida. ¡BASTA! de creer que 'esto es lo que hay'. Quiero construir activamente el país que merecemos, empezando por cambiar mi propia actitud derrotista",
      location: "Rosario, Argentina",
      latitude: "-32.9524",
      longitude: "-60.6389"
    },
    {
      basta: "¡BASTA! de competir destructivamente entre nosotros. ¡BASTA! de esa mentalidad de 'sálvese quien pueda'. Quiero colaborar, sumar fuerzas y construir redes de apoyo mutuo que nos hagan más fuertes",
      location: "Mendoza, Argentina",
      latitude: "-32.8895",
      longitude: "-68.8458"
    }
  ]
};

// Función para poblar los datos
export const populateHombreGrisData = async () => {
  console.log('🌱 Poblando el sistema con datos del Hombre Gris...');
  
  try {
    // Poblar sueños
    for (const dream of hombreGrisData.dreams) {
      const response = await fetch('http://localhost:5000/api/dreams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dream),
      });
      
      if (response.ok) {
        console.log(`✅ Sueño agregado: "${dream.dream.substring(0, 50)}..."`);
      } else {
        console.error(`❌ Error agregando sueño: ${response.statusText}`);
      }
    }
    
    // Poblar valores
    for (const value of hombreGrisData.values) {
      const response = await fetch('http://localhost:5000/api/dreams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...value, type: 'value' }),
      });
      
      if (response.ok) {
        console.log(`✅ Valor agregado: "${value.value.substring(0, 50)}..."`);
      } else {
        console.error(`❌ Error agregando valor: ${response.statusText}`);
      }
    }
    
    // Poblar necesidades
    for (const need of hombreGrisData.needs) {
      const response = await fetch('http://localhost:5000/api/dreams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...need, type: 'need' }),
      });
      
      if (response.ok) {
        console.log(`✅ Necesidad agregada: "${need.need.substring(0, 50)}..."`);
      } else {
        console.error(`❌ Error agregando necesidad: ${response.statusText}`);
      }
    }
    
    // Poblar ¡BASTA!
    for (const basta of hombreGrisData.bastas) {
      const response = await fetch('http://localhost:5000/api/dreams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...basta, type: 'basta' }),
      });
      
      if (response.ok) {
        console.log(`✅ ¡BASTA! agregado: "${basta.basta.substring(0, 50)}..."`);
      } else {
        console.error(`❌ Error agregando ¡BASTA!: ${response.statusText}`);
      }
    }
    
    console.log('🎉 ¡Datos del Hombre Gris poblados exitosamente!');
    console.log(`📊 Total: ${hombreGrisData.dreams.length} sueños, ${hombreGrisData.values.length} valores, ${hombreGrisData.needs.length} necesidades, ${hombreGrisData.bastas.length} ¡BASTA!`);
    
  } catch (error) {
    console.error('❌ Error poblando datos:', error);
  }
};

// Función para poblar datos de forma secuencial con delay
export const populateWithDelay = async (delayMs = 1000) => {
  console.log('🌱 Iniciando poblamiento con delay...');
  
  const allData = [
    ...hombreGrisData.dreams.map(item => ({ ...item, type: 'dream' })),
    ...hombreGrisData.values.map(item => ({ ...item, type: 'value' })),
    ...hombreGrisData.needs.map(item => ({ ...item, type: 'need' })),
    ...hombreGrisData.bastas.map(item => ({ ...item, type: 'basta' }))
  ];
  
  for (let i = 0; i < allData.length; i++) {
    const item = allData[i];
    
    try {
      const response = await fetch('http://localhost:5000/api/dreams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (response.ok) {
        console.log(`✅ ${item.type} ${i + 1}/${allData.length}: "${item[item.type as keyof typeof item]?.toString().substring(0, 50)}..."`);
      } else {
        console.error(`❌ Error agregando ${item.type}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Error en ${item.type}:`, error);
    }
    
    // Delay entre requests
    if (i < allData.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.log('🎉 ¡Poblamiento completado!');
};

export default hombreGrisData;
