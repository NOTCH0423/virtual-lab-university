# Virtual Lab University

Plataforma de laboratorio virtual universitario con simulaciones 3D interactivas para física, química y biología.

## Características

- 🔬 **Simulaciones 3D Interactivas** - Experimentos de laboratorio en entornos inmersivos
- 👥 **Sistema de Usuarios** - Roles para estudiantes, profesores y administradores
- 📊 **Panel de Administración** - Gestión completa de usuarios y contenido
- 📜 **Certificaciones** - Certificados por experimentos completados
- 📱 **Diseño Responsivo** - Accesible desde cualquier dispositivo
- 🎨 **UI Moderna** - Interfaz oscura con gradientes y animaciones

## Tecnologías

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **3D Graphics**: Three.js, React Three Fiber, Drei
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Next.js API Routes

## Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar en producción
npm start
```

## Estructura del Proyecto

```
├── app/                    # Páginas y layouts de Next.js
│   ├── admin/             # Panel de administración
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard del usuario
│   ├── experiments/      # Experimentos con simulaciones 3D
│   ├── laboratories/     # Lista de laboratorios
│   ├── login/            # Página de login
│   └── register/         # Página de registro
├── components/            # Componentes reutilizables
└── public/               # Archivos estáticos
```

## Laboratorios Disponibles

### Física
- Mecánica Clásica
- Termodinámica
- Movimiento Parabólico
- Óptica

### Química
- Química Orgánica
- Química Inorgánica
- Electroquímica

### Biología
- Biología Celular
- Genética y Herencia

### Ingeniería
- Análisis de Circuitos

## Licencia

MIT License
