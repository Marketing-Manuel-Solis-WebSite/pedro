# Plataforma de WhatsApp — Resumen para el Equipo

## Que es esto?

Es un sistema interno para recibir, organizar y contestar los mensajes de WhatsApp que llegan de personas interesadas en los servicios de la firma. Combina inteligencia artificial (para la primera atencion inmediata) con atencion humana (para la asesoria real). La IA hace el primer contacto y clasifica; el equipo atiende, asesora y cierra.

---

## Como le llega un mensaje al equipo?

1. Una persona visita uno de los sitios web de la firma
2. Ve un boton verde de WhatsApp y le da click
3. Se abre WhatsApp con un mensaje prellenado
4. La persona envia el mensaje
5. La IA responde en segundos: saluda, pregunta que necesita y le da opciones (nueva consulta, seguimiento, agendar llamada o hablar con una persona)
6. La persona responde con lo que necesita
7. La IA le pide su nombre, ciudad y una descripcion breve de su caso
8. El sistema evalua automaticamente que tan urgente es el caso y a que oficina corresponde
9. Si el caso necesita atencion humana (por urgencia, complejidad, o porque la persona lo pidio), el sistema automaticamente asigna la conversacion al siguiente colaborador disponible
10. El colaborador recibe la conversacion en su bandeja de entrada, ya con el contexto completo: nombre, ciudad, que necesita, que tan urgente es, y lo que ya se hablo con la IA

---

## Que hace la inteligencia artificial?

**SI HACE:**
- Responde inmediatamente (en segundos, a cualquier hora)
- Saluda y da opciones claras
- Pregunta nombre, ciudad y que necesita la persona
- Clasifica que tan urgente es el caso (bajo, normal, alto, critico)
- Sugiere a que oficina canalizar
- Pasa a una persona real cuando detecta urgencia, frustracion o un caso complejo
- Pasa a una persona inmediatamente si la persona lo pide
- Responde en el idioma de la persona (español o ingles)

**NO HACE:**
- No da consejos legales
- No interpreta leyes ni predice resultados de casos
- No pide documentos, identificaciones, numeros de caso, cuentas bancarias ni informacion sensible
- No reemplaza al abogado ni al equipo — solo califica y canaliza
- No envia mas de 2 mensajes seguidos sin respuesta de la persona

---

## Como se asignan las conversaciones?

Las conversaciones se asignan automaticamente al equipo con un sistema rotativo:

- El sistema elige al colaborador que lleva mas tiempo sin recibir una conversacion nueva
- Si alguien tiene muchas conversaciones abiertas o no esta disponible, lo salta
- Cada colaborador tiene un limite de conversaciones simultaneas (configurable)
- Cualquier colaborador puede marcarse como "No disponible" para dejar de recibir asignaciones temporalmente
- Un administrador puede reasignar conversaciones manualmente si es necesario
- Los administradores no reciben asignaciones automaticas — solo abogados, paralegales y personal de intake

---

## Que ve cada persona en su pantalla?

### Bandeja de entrada
- Lista de conversaciones activas, ordenadas por urgencia y tiempo
- Cada conversacion muestra: nombre, ciudad, que necesita, estado del caso, calificacion de la IA, y un contador que muestra cuanto tiempo queda para responder dentro de la ventana de 24 horas de WhatsApp

### Conversacion abierta
- Se ven todos los mensajes: lo que escribio la persona, lo que respondio la IA, y lo que respondio el equipo
- Se puede responder directamente desde ahi
- Si la ventana de 24 horas ya se cerro, se muestra un aviso y solo se pueden enviar mensajes con formato aprobado por WhatsApp

### Leads (contactos)
- Tabla con todos los contactos que han escrito
- Se pueden buscar por nombre o telefono
- Se pueden filtrar por estado del caso

### Equipo (solo administradores)
- Ver quien esta disponible y quien no
- Agregar nuevos colaboradores (nombre, email, rol, oficina)
- Cambiar roles, oficina y limites de conversaciones
- Pausar o reactivar a un colaborador
- Ver estadisticas de cada persona: cuantos le han asignado, cuantos ha ganado, cuantos ha perdido

### Plantillas
- Ver los mensajes con formato aprobado por WhatsApp (para enviar despues de 24 horas)
- Ver el estado de aprobacion de cada plantilla

### Widget
- Obtener el codigo para instalar el boton de WhatsApp en los sitios web de la firma
- Cada oficina tiene su propio codigo con su numero de WhatsApp

### Configuracion
- Ver oficinas configuradas
- Ver textos legales de consentimiento
- Ver estado de las conexiones del sistema

### Auditoria
- Registro de todos los consentimientos otorgados
- Historial exportable para revision legal

---

## Cuales son las etapas de un caso?

Cada contacto pasa por etapas que reflejan el proceso real de la firma:

1. **Nuevo** — acaba de escribir, nadie lo ha visto
2. **Calificado por IA** — la IA ya hablo con el y recogio su informacion basica
3. **Asignado** — ya tiene un colaborador responsable
4. **Contactado** — el colaborador ya hablo directamente con la persona
5. **En consulta** — se esta haciendo o agendando una consulta
6. **Propuesta enviada** — se le envio una cotizacion o propuesta de servicios
7. **En negociacion** — esta decidiendo, negociando precio o alcance
8. **Contratado** — firmo contrato, ya es cliente
9. **En tramite** — el caso esta en proceso (ya es cliente activo)
10. **Completado** — el caso termino exitosamente

Si el caso no avanza:
- **Perdido** — decidio no contratar
- **Sin respuesta** — nunca contesto
- **Spam** — no era un contacto real

---

## Que pasa si nadie contesta a tiempo?

El sistema tiene seguimientos automaticos para que ningun contacto se quede sin atencion:

- **A los 15 minutos** sin respuesta del equipo: el sistema envia un mensaje automatico preguntando si todavia necesita ayuda y ofreciendo opciones (continuar por WhatsApp, llamada, o hablar con persona)
- **A las 2 horas** sin respuesta: envia un segundo mensaje recordatorio
- **Despues de eso**, no envia mas mensajes dentro de la ventana de 24 horas
- **Si pasan 24 horas** sin respuesta de la persona: el sistema solo puede enviar un mensaje con formato aprobado por WhatsApp (no mensajes libres)
- **Nunca se envian mensajes entre las 9pm y las 8am** en la zona horaria de la persona
- Si la persona responde en cualquier momento, el contador de 24 horas se reinicia

---

## Que pasa si la persona quiere dejar de recibir mensajes?

Si la persona escribe cualquiera de estas palabras, el sistema automaticamente deja de enviarle mensajes:

- En español: BAJA, PARAR, CANCELAR, NO MAS, DETENER, NO QUIERO
- En ingles: STOP, UNSUBSCRIBE, CANCEL, QUIT, OPT OUT

Que sucede:
- Se le confirma inmediatamente que ya no recibira mas mensajes
- Queda registrado en el sistema
- Nadie del equipo puede volver a escribirle a menos que la persona escriba de nuevo por su cuenta
- El registro de cancelacion se guarda para auditorias legales

---

## Como se instala en los sitios web?

- Desde el panel de administracion (seccion "Widget"), se copia una sola linea de codigo para cada sitio web de la firma
- Se pega en el sitio web antes del cierre de la pagina
- Aparece un boton verde de WhatsApp flotante en la esquina inferior derecha
- En celulares, el boton se muestra como un icono circular; en computadoras, muestra texto tambien
- Al pasar el cursor por encima, se muestra el aviso legal de consentimiento
- Cuando alguien le da click, antes de abrir WhatsApp se registra: de que pagina vino, a que hora, y que campaña de publicidad lo trajo (si aplica)
- Esto permite saber exactamente de donde vienen los contactos

---

## Roles y permisos

### Administrador
- Ve todas las conversaciones
- Puede reasignar casos a cualquier persona
- Puede agregar, editar y desactivar colaboradores
- Acceso a estadisticas y auditoria
- Puede cambiar configuracion del sistema
- Puede ver los codigos del widget para los sitios web

### Abogado
- Ve las conversaciones que le asignaron
- Puede tomar conversaciones sin asignar
- Puede cambiar el estado de sus casos a la siguiente etapa

### Paralegal
- Mismos permisos que abogado
- Tipicamente maneja la primera atencion y calificacion humana

### Intake (recepcion)
- Ve las conversaciones que le asignaron
- Puede tomar conversaciones sin asignar
- Primer punto de contacto humano despues de la IA

---

## Que necesita el equipo para empezar a usarlo?

Para cada colaborador:
- Una computadora con navegador web (Chrome, Edge, Safari o Firefox)
- Conexion a internet
- Un email corporativo — el administrador debe darlo de alta primero en la seccion "Equipo"
- Entrar a la direccion de la plataforma y crear su cuenta con ese mismo email
- El sistema automaticamente vincula la cuenta con el perfil que creo el administrador
- No se necesita instalar nada
- No se necesita tener WhatsApp en la computadora — todo se maneja desde la plataforma web

---

## Preguntas frecuentes

**Puedo contestar desde mi celular?**
Si, la plataforma funciona en el navegador del celular, pero es mas comoda en computadora.

**La IA reemplaza al equipo?**
No. La IA solo hace el primer contacto: saluda, clasifica y recoge informacion basica. Despues pasa la conversacion a una persona real. El equipo es quien atiende, asesora y cierra.

**Que pasa si la IA se equivoca?**
La IA tiene instrucciones de pasar a una persona en cualquier caso que sea urgente, complejo, o si la persona lo pide. Si la IA da una respuesta que no es adecuada, el colaborador puede tomar la conversacion y responder directamente.

**Se puede ver el historial de una conversacion?**
Si, todo queda registrado: lo que dijo la persona, lo que respondio la IA, lo que respondio el equipo, cuando se asigno, y cada cambio de etapa.

**Puedo marcar que no estoy disponible?**
Si. En la seccion de "Equipo", cada colaborador puede ser puesto como "Pausado" por un administrador. Mientras este asi, no le llegaran nuevas conversaciones, pero puede seguir atendiendo las que ya tiene.

**Que pasa si se cae la plataforma?**
Los mensajes de WhatsApp quedan en cola del lado de WhatsApp y se procesan cuando la plataforma vuelve a estar disponible. Ningun mensaje se pierde.

**La persona sabe que primero habla con IA?**
La IA se presenta como "asistente virtual" de la firma. No se oculta que es un sistema automatizado, pero el tono es profesional y calido.

**Cuantos WhatsApps puede manejar el sistema?**
No hay limite practico. El sistema puede recibir cientos de mensajes simultaneos. El limite real es la capacidad del equipo humano para contestar.
