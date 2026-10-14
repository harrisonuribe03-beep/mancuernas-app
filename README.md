# Mancuernas

App de Android para entrenar en casa con mancuernas: plan personalizado, guía paso a paso con ilustraciones animadas, temporizadores, coach de voz, progreso y logros. Uso personal.

## Descargar

La última versión compilada siempre está en:
https://github.com/harrisonuribe03-beep/mancuernas-app/releases/download/app/Mancuernas.apk

La app avisa sola cuando hay una versión nueva.

## Estructura

```
app-src/                Código fuente de la app (HTML, CSS y JavaScript sin frameworks)
  index.html            Esqueleto de la página
  css/                  Estilos por pantalla (se concatenan en orden)
  data/                 Ejercicios, plan base, textos de técnica y figuras de respaldo
  js/                   Módulos de la app (se concatenan en orden dentro de un mismo ámbito)
    00-errors.js          Registro de errores: nada que falle borra datos
    01-04                 Plataforma, iconos, constantes y estado (almacenamiento local y nube)
    05-12                 Tema, ilustraciones, cálculos, niveles, recordatorios, respaldo, medidas
    13-program.js         Generador del plan personalizado (objetivo, nivel, días, tiempo, molestias)
    14-15                 Sonido básico, vibración, notificaciones y botón atrás
    16-19                 Pantallas: Inicio, Ejercicios, Progreso y Perfil
    20-23                 Hojas, reproductor de entrenamiento, resumen y reloj
    24-25                 Pantalla Plan (editor de rutinas) y asistente
    26-audio.js           Paquetes de sonido y coach de voz
    27-muscles-photos.js  Mapa muscular, series por músculo y fotos de progreso
    28-tools.js           Intervalos, estiramientos, movilidad y calculadoras
    29-goals.js           Misiones, logros, tipos de serie, notas y colores
    30-fx.js              Celebraciones
    31-native.js          Widget, accesos directos, notificación en curso y resumen semanal
    98-99                 Despachador de acciones, eventos e inicio
  build.js              Une todo y escribe www/ (Android) y dist/ (versión web)
www/                    App compilada que empaqueta Capacitor (no editar a mano)
android/                Proyecto nativo (Capacitor 6)
  .../NativePlugin.java   Vibración, pantalla, barras, sonidos (SoundPool), voz (TextToSpeech
                          con atenuación de música), notificación en curso, widget y accesos
  .../TodayWidget.java    Widget "Hoy" de la pantalla de inicio
  .../MainActivity.java   Botón atrás y acciones desde widget y accesos directos
```

## Compilar

```
node app-src/build.js      # genera www/
npx cap sync android       # copia www/ al proyecto Android
```

Al subir a `main`, GitHub Actions compila el APK firmado y lo publica en la versión `app`. El número de compilación se inyecta en la app para el aviso de actualización.

## Datos

Todo se guarda en el teléfono (localStorage e IndexedDB para las fotos). El respaldo exporta historial, plan, medidas y ajustes en un archivo JSON. Las fotos de progreso nunca salen del teléfono.
