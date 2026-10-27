# Prompts para videos tipo "¿puedes creer que una IA hizo esto?"

El video de referencia no es un video generado por IA. Es una landing page muy cuidada, abierta en un portátil real y filmada con el celular mientras la página hace scroll sola. La calidad sale de tres cosas: el diseño de la web, las imágenes del producto y una grabación limpia sin tirones.

Por eso hay dos prompts: uno construye la web y el otro arma el video. Las skills que usan ya están en `.claude/skills/`:

- `frontend-design` (Anthropic): obliga a definir paleta, tipografía y concepto antes de programar y a evitar el look genérico.
- `remotion-best-practices` (Remotion): hacer videos con código React, previsualizarlos en el Studio y exportarlos a MP4.

Llena lo que está entre corchetes antes de pegar cada prompt.

---

## Prompt 1: la landing

```
/frontend-design

Construye en la carpeta video/landing una landing de una sola página para [PRODUCTO], pensada para grabarse en video. Quiero que parezca un sitio premiado en Awwwards: cada pantalla distinta a la anterior y el scroll contando una historia.

Producto: [qué es y para quién]
Tono: [premium y serio | exagerado con humor: tratar algo simple como si fuera tecnología de punta]
Idioma de los textos: [español]

Secciones (cada una ocupa la pantalla completa y tiene una sola idea):
1. Hero: el producto en 3D con Three.js girando despacio sobre fondo oscuro, luz cálida de lado. Titular corto a la izquierda y dos líneas de texto pequeño a la derecha.
2. Una frase grande que se arma con el scroll mientras el producto sigue rotando.
3. El producto solo, con trazos técnicos alrededor (círculo guía, líneas de medida, coordenadas), como en un plano.
4. Fotos del producto en uso que entran desde los lados.
5. Un golpe de color fuerte (neón o el color de la marca) que rompa el ritmo.
6. Macro del material o de una función, con zoom atado al scroll.
7. Sección clara: fondo casi blanco y una palabra gigante que ocupe todo el ancho.
8. Reseñas.
9. Cierre con el logo grande y un botón.

Dirección visual:
- Antes de escribir código define la paleta en variables CSS. Alterna secciones oscuras y claras para que el video tenga contraste.
- Titulares en una display grande y apretada; cuerpo en una sans limpia. Fuentes de Google Fonts.
- Menú mínimo: logo a la izquierda y cuatro enlaces pequeños a la derecha.
- Nada de tarjetas redondeadas con sombra, rellenos con degradado ni íconos genéricos.

Movimiento:
- Lenis para el scroll suave y GSAP con ScrollTrigger para pin, scrub y parallax. Versiones fijas desde cdnjs o jsDelivr.
- Las transiciones van atadas al scroll (scrub). Evita el fade-in al aparecer en cada bloque.
- Respeta prefers-reduced-motion.

Imágenes:
- Donde haga falta una foto, deja un <img> con placeholder del tamaño exacto y anota en video/landing/assets/PROMPTS.md el prompt para generarla con una IA de imágenes (sujeto, luz, lente, fondo, encuadre). Las cambio después sin tocar el código.

Modo grabación:
- Con ?record en la URL la página baja sola de principio a fin en [16] segundos, con una curva suave y una pausa corta en cada sección. Oculta la barra de scroll y el cursor. Al terminar pone window.__recordDone = true.
- Tiene que verse perfecta a 1440×900.

Proceso:
1. Primero muéstrame el plan: paleta en hex, tipografías y una línea por sección. Espera mi visto bueno.
2. Escribe index.html, styles.css y main.js.
3. Sirve la página, toma capturas de cada sección con Playwright a 1440×900, revísalas y corrige lo que se vea roto o genérico antes de decirme que terminaste.
```

Ejemplo de los campos para esta app:

```
Producto: Mancuernas, app de Android para entrenar en casa o en el gimnasio con plan personalizado, coach de voz y nutrición con comida colombiana. Para gente que entrena sola y quiere un plan sin pagar entrenador.
Tono: exagerado con humor: presentar una mancuerna como si fuera un dispositivo de ingeniería aeroespacial.
Idioma de los textos: español
```

---

## Prompt 2: el video

Graba antes la landing en `video/landing/record.mp4`. Lo más fácil es lo que hizo el video original: abrir la página con `?record` en pantalla completa en un portátil y filmarla con el celular. Si prefieres hacerlo todo por computador, este prompt monta la grabación dentro de un portátil virtual.

```
/remotion-best-practices

Crea un proyecto Remotion en video/promo con un video vertical de 1080×1920 a 30 fps y [16] segundos para TikTok y Reels, usando la grabación video/landing/record.mp4.

- Escena: un portátil negro sobre un escritorio gris claro, visto desde abajo con unos 20° de inclinación, como filmado con el celular. La grabación va dentro de la pantalla con perspectiva 3D y un reflejo leve sobre el escritorio.
- Cámara: un acercamiento muy lento (de 100 % a 106 %) con un poco de vaivén para que parezca hecho a mano. Sin cortes.
- Texto arriba todo el tiempo: "[¿Puedes creer que una IA hizo esto?]" en blanco, sans seminegrita, sombra suave y un ícono pequeño encima.
- Música: video/promo/public/track.mp3 con entrada y salida suaves.
- Abre el Studio para revisarlo antes de exportar.
```
