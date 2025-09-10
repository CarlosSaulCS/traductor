# 🎵 Sincronizador de Letras - Cama y Mesa

Una aplicación web interactiva para sincronizar letras de canciones en tiempo real, específicamente diseñada para "Cama y Mesa" de Roberto Carlos, con soporte para múltiples idiomas.

## 🌟 Características

- **Sincronización en tiempo real**: Las palabras se resaltan mientras se reproducen
- **Soporte multiidioma**: Español, inglés, o ambos idiomas simultáneamente
- **Interfaz intuitiva**: Diseño moderno y fácil de usar
- **Carga de audio personalizada**: Soporte para diferentes formatos de audio
- **Responsive**: Funciona en dispositivos móviles y de escritorio

## 🚀 Cómo usar

### 1. Preparar el audio
- Coloque el archivo de audio en la carpeta `audio/` con el nombre `cama-y-mesa.mp3`
- O use el botón "Cargar Audio" para seleccionar un archivo

### 2. Configurar las letras sincronizadas
Para agregar las letras con sincronización precisa, edite el archivo `script.js` y reemplace la variable `sampleLyricsData` con los datos reales:

```javascript
const lyricsData = [
    {
        startTime: 0.0,    // Tiempo de inicio en segundos
        endTime: 5.2,      // Tiempo de fin en segundos
        spanish: "Letra en español",
        english: "Lyrics in English",
        words: [
            { text: "Letra", startTime: 0.0, endTime: 0.8 },
            { text: "en", startTime: 0.8, endTime: 1.0 },
            { text: "español", startTime: 1.0, endTime: 1.8 }
            // ... más palabras con tiempos exactos
        ]
    }
    // ... más líneas de la canción
];
```

### 3. Obtener los tiempos exactos
1. Reproduzca la canción
2. Use la consola del navegador (F12) y ejecute `getCurrentTime()` para obtener el tiempo actual
3. Marque el inicio y fin de cada palabra/línea
4. Use `formatTime(segundos)` para convertir a formato legible

## 📁 Estructura del proyecto

```
traductor/
├── index.html          # Página principal
├── styles.css          # Estilos de la aplicación
├── script.js           # Lógica de sincronización
├── audio/              # Carpeta para archivos de audio
│   └── cama-y-mesa.mp3 # (archivo de audio - agregar manualmente)
└── README.md           # Este archivo
```

## 🎯 Funcionalidades

### Controles de reproducción
- **▶️ Reproducir/Pausar**: Control básico de reproducción
- **🔄 Reiniciar**: Volver al inicio de la canción
- **📁 Cargar Audio**: Seleccionar archivo de audio personalizado

### Modos de visualización
- **🇪🇸 Español**: Solo letras en español
- **🇬🇧 English**: Solo letras en inglés  
- **🌍 Ambos/Both**: Ambos idiomas simultáneamente

### Características visuales
- Resaltado de palabras en tiempo real
- Barra de progreso
- Desplazamiento automático a la línea actual
- Animaciones suaves de transición

## 🛠️ Tecnologías utilizadas

- **HTML5**: Estructura y elementos de audio
- **CSS3**: Estilos modernos con gradientes y animaciones
- **JavaScript**: Lógica de sincronización y control del audio
- **Web Audio API**: Manejo preciso del tiempo de reproducción

## 📱 Compatibilidad

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Dispositivos móviles (iOS/Android)

## 🔧 Personalización

### Para otras canciones
1. Cambie el título en `index.html`
2. Agregue el nuevo archivo de audio
3. Configure los nuevos datos de letras en `script.js`
4. Ajuste los estilos en `styles.css` si es necesario

### Agregar más idiomas
1. Extienda la estructura de datos de letras
2. Agregue nuevos botones de idioma en el HTML
3. Implemente la lógica en la función `switchLanguage()`

## 📝 Notas importantes

- Los archivos de audio deben estar en formato soportado por el navegador (MP3, WAV, OGG)
- Los tiempos de sincronización deben ser precisos para una buena experiencia
- Use herramientas de edición de audio para obtener tiempos exactos si es necesario

## 🤝 Contribuciones

Para mejorar la aplicación:
1. Fork el proyecto
2. Cree una rama para su función
3. Haga commit de sus cambios
4. Cree un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

**¡Disfrute sincronizando letras de canciones!** 🎶
