# Universal System UX — skill para Codex

Skill reutilizable para crear, modificar o auditar sistemas interactivos con:

- diseño centrado en el usuario;
- usabilidad y las diez heurísticas;
- factores humanos y modelos mentales;
- metáforas e iconografía coherentes;
- análisis de tareas y arquitectura de información;
- prototipado iterativo;
- evaluación heurística y pruebas con usuarios;
- diseño universal y accesibilidad WCAG 2.2 AA.

## Instalación global

Copia la carpeta completa en:

```text
$HOME/.agents/skills/universal-system-ux/
```

Así estará disponible en todos tus repositorios.

## Instalación por proyecto

Copia la carpeta completa dentro del repositorio:

```text
<repo>/.agents/skills/universal-system-ux/
```

Codex detecta las skills desde `.agents/skills` en el directorio actual y sus carpetas superiores hasta la raíz del repositorio.

## Invocación

Explícita:

```text
$universal-system-ux Revisa y mejora el flujo de registro de pacientes.
```

También puede activarse de forma implícita cuando la solicitud trate sobre interfaces, formularios, navegación, accesibilidad, UX, componentes o evaluación.

## Estructura

```text
universal-system-ux/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
├── assets/
│   ├── context-brief-template.md
│   ├── definition-of-done-template.md
│   ├── heuristic-finding-template.md
│   └── usability-test-plan-template.md
└── references/
    ├── 00-source-coverage.md
    ├── 01-context-and-task-analysis.md
    ├── 02-human-factors-and-interface-design.md
    ├── 03-heuristic-audit-expanded.md
    ├── 04-accessibility-wcag22.md
    ├── 05-prototyping-and-evaluation.md
    ├── 06-component-patterns.md
    └── 07-quality-gates.md
```

El archivo principal contiene el procedimiento obligatorio. Las referencias extensas se cargan solo cuando son necesarias, lo que reduce el consumo de contexto.

## Alcance

Aplica a sistemas web, móviles, escritorio, paneles internos, portales, aplicaciones empresariales y prototipos. No pretende sustituir requisitos legales o de seguridad específicos del dominio. En salud, finanzas, gobierno u otros ámbitos críticos, las reglas del dominio tienen prioridad y deben validarse por especialistas.

## Principio de mantenimiento

Actualiza primero las referencias especializadas y conserva `SKILL.md` como núcleo estable. No agregues una regla universal por una preferencia aislada; añade reglas cuando resuelvan problemas recurrentes, tengan evidencia o correspondan a estándares.
