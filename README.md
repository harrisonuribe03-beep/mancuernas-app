# Mancuernas

App de Android para entrenar en casa con mancuernas: rutina de lunes a sábado, modo exprés, temporizadores de descanso, registro de pesos, récords, logros y gráficas de progreso.

## Descargar

Cada vez que cambia el código, GitHub compila la app y deja el APK en **Releases → Mancuernas.apk**.

## Instalar en el celular

1. Abre el enlace de descarga desde el celular y descarga `Mancuernas.apk`.
2. Ábrelo. Si Android lo pide, permite "Instalar apps desconocidas" para tu navegador o el administrador de archivos.
3. Toca **Instalar**.

Las actualizaciones se instalan encima de la versión anterior sin perder tus datos.

## Estructura

- `www/` la app (HTML, CSS y JavaScript, funciona sin internet)
- `android/` proyecto Android (Capacitor 6)
- `.github/workflows/apk.yml` compilación automática
