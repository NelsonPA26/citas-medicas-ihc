from __future__ import annotations

from dataclasses import dataclass, field
from html import escape
from pathlib import Path
import textwrap

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # Keep SVG generation available with the project Python.
    Image = ImageDraw = ImageFont = None


OUT_DIR = Path.cwd() / "hta_corregidos"


@dataclass
class Node:
    label: str
    children: list["Node"] = field(default_factory=list)
    x: float = 0
    y: float = 0
    w: float = 132
    h: float = 62


def n(label: str, children: list[Node] | None = None) -> Node:
    return Node(label=label, children=children or [])


DIAGRAMS = [
    {
        "file": "04-consulta-historial-seguimiento.svg",
        "title": "Análisis jerárquico de tareas de Consulta de historial y seguimiento",
        "root": n(
            "Consulta de historial y seguimiento",
            [
                n(
                    "1 Consultar historial médico",
                    [
                        n("1.1 Buscar o filtrar consultas"),
                        n("1.2 Seleccionar consulta"),
                        n("1.3 Ver detalle"),
                    ],
                ),
                n(
                    "2 Consultar próximas citas",
                    [
                        n("2.1 Visualizar citas programadas"),
                        n("2.2 Seleccionar cita próxima"),
                    ],
                ),
                n(
                    "3 Revisar estado de cita",
                    [
                        n("3.1 Ver cita confirmada"),
                        n("3.2 Ver cita pendiente"),
                        n("3.3 Ver cita reprogramada"),
                        n("3.4 Ver cita cancelada"),
                        n("3.5 Ver consulta completada"),
                    ],
                ),
            ],
        ),
        "plan": "Plan 0: realizar 1, 2 o 3 según la información que necesite consultar el usuario.",
    },
    {
        "file": "06-historial-triajes.svg",
        "title": "Análisis jerárquico de tareas de Historial de triajes",
        "root": n(
            "Historial de triajes",
            [
                n("1 Consultar registros"),
                n(
                    "2 Filtrar registros",
                    [
                        n("2.1 Filtrar por paciente"),
                        n("2.2 Filtrar por fecha"),
                    ],
                ),
                n("3 Seleccionar triaje"),
                n(
                    "4 Ver detalle",
                    [
                        n("4.1 Revisar signos vitales"),
                        n("4.2 Revisar síntomas"),
                        n("4.3 Revisar observaciones"),
                    ],
                ),
                n("5 Exportar o imprimir"),
            ],
        ),
        "plan": "Plan 0: realizar 1, opcionalmente 2, luego 3 y 4; realizar 5 si se requiere respaldo.",
    },
    {
        "file": "08-consultar-pacientes-historial.svg",
        "title": "Análisis jerárquico de tareas de Consultar pacientes e historial",
        "root": n(
            "Consultar pacientes e historial",
            [
                n("1 Buscar paciente"),
                n(
                    "2 Filtrar pacientes",
                    [
                        n("2.1 Filtrar por DNI o nombre"),
                        n("2.2 Filtrar por estado"),
                    ],
                ),
                n("3 Seleccionar paciente"),
                n(
                    "4 Ver historial del paciente",
                    [
                        n("4.1 Seleccionar consulta"),
                        n("4.2 Revisar antecedentes"),
                    ],
                ),
                n(
                    "5 Ver detalle de consulta",
                    [
                        n("5.1 Ver diagnóstico"),
                        n("5.2 Ver receta e indicaciones"),
                    ],
                ),
            ],
        ),
        "plan": "Plan 0: buscar o filtrar, seleccionar paciente, revisar historial y abrir el detalle necesario.",
    },
    {
        "file": "10-gestion-citas-admin.svg",
        "title": "Análisis jerárquico de tareas de Gestión de citas",
        "root": n(
            "Gestión de citas",
            [
                n("1 Ver citas", [n("1.1 Ver todas las citas")]),
                n(
                    "2 Filtrar o buscar citas",
                    [
                        n("2.1 Buscar por paciente"),
                        n("2.2 Buscar por fecha"),
                        n("2.3 Buscar por estado"),
                    ],
                ),
                n(
                    "3 Crear cita",
                    [
                        n("3.1 Seleccionar paciente"),
                        n("3.2 Asignar médico"),
                        n("3.3 Elegir fecha y hora"),
                        n("3.4 Confirmar creación"),
                    ],
                ),
                n(
                    "4 Reprogramar cita",
                    [
                        n("4.1 Seleccionar cita"),
                        n("4.2 Elegir nuevo horario"),
                        n("4.3 Confirmar reprogramación"),
                    ],
                ),
                n(
                    "5 Cancelar cita",
                    [
                        n("5.1 Seleccionar cita"),
                        n("5.2 Revisar si se puede cancelar"),
                        n("5.3 Confirmar cancelación"),
                        n("5.4 Enviar notificación al paciente"),
                    ],
                ),
            ],
        ),
        "plan": "Plan 0: para consultar realizar 1 o 2; para modificar agenda realizar 3, 4 o 5 con confirmación.",
    },
]


def leaf_count(node: Node) -> int:
    if not node.children:
        return 1
    return sum(leaf_count(child) for child in node.children)


def depth(node: Node) -> int:
    if not node.children:
        return 1
    return 1 + max(depth(child) for child in node.children)


def set_widths(node: Node) -> None:
    node.w = 148 if len(node.label) < 28 else 168
    node.h = 56 if len(node.label) < 24 else 66
    for child in node.children:
        set_widths(child)


def layout(node: Node, left: float, right: float, y: float, level_gap: float) -> None:
    node.x = (left + right) / 2
    node.y = y
    if not node.children:
        return

    total = sum(leaf_count(child) for child in node.children)
    cursor = left
    for child in node.children:
        span = (right - left) * leaf_count(child) / total
        layout(child, cursor, cursor + span, y + level_gap, level_gap)
        cursor += span


def all_nodes(node: Node) -> list[Node]:
    nodes = [node]
    for child in node.children:
        nodes.extend(all_nodes(child))
    return nodes


def wrap_lines(text: str, width: int = 17) -> list[str]:
    return textwrap.wrap(text, width=width, break_long_words=False) or [text]


def rect(node: Node) -> str:
    x = node.x - node.w / 2
    y = node.y - node.h / 2
    parts = [
        f'<rect x="{x:.1f}" y="{y:.1f}" width="{node.w:.1f}" height="{node.h:.1f}" rx="6" class="task"/>'
    ]
    lines = wrap_lines(node.label, 18 if node.w > 145 else 15)
    start_y = node.y - (len(lines) - 1) * 9
    for index, line in enumerate(lines):
        parts.append(
            f'<text x="{node.x:.1f}" y="{start_y + index * 18:.1f}" class="label">{escape(line)}</text>'
        )
    if not node.children:
        underline_y = y + node.h + 15
        parts.append(
            f'<line x1="{x + 10:.1f}" y1="{underline_y:.1f}" x2="{x + node.w - 10:.1f}" y2="{underline_y:.1f}" class="unit"/>'
        )
    return "\n".join(parts)


def connectors(node: Node) -> list[str]:
    if not node.children:
        return []
    bus_y = node.y + node.h / 2 + 34
    child_tops = [child.y - child.h / 2 for child in node.children]
    left = min(child.x for child in node.children) - node.children[0].w / 2 + 4
    right = max(child.x for child in node.children) + node.children[-1].w / 2 - 4
    lines = [
        f'<line x1="{node.x:.1f}" y1="{node.y + node.h / 2:.1f}" x2="{node.x:.1f}" y2="{bus_y:.1f}" class="link"/>',
        f'<line x1="{left:.1f}" y1="{bus_y:.1f}" x2="{right:.1f}" y2="{bus_y:.1f}" class="link"/>',
    ]
    for child, top in zip(node.children, child_tops):
        lines.append(
            f'<line x1="{child.x:.1f}" y1="{bus_y:.1f}" x2="{child.x:.1f}" y2="{top:.1f}" class="link"/>'
        )
        lines.extend(connectors(child))
    return lines


def svg_for(diagram: dict) -> str:
    root = diagram["root"]
    set_widths(root)
    levels = depth(root)
    width = max(1180, leaf_count(root) * 165)
    level_gap = 148
    title_h = 44
    plan_h = 46
    height = title_h + levels * level_gap + plan_h
    layout(root, 52, width - 52, title_h + 58, level_gap)
    nodes = all_nodes(root)

    body = "\n".join(connectors(root) + [rect(node) for node in nodes])
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">
  <title id="title">{escape(diagram["title"])}</title>
  <desc id="desc">Diagrama HTA corregido con tareas jerárquicas, subtareas y plan de ejecución.</desc>
  <style>
    .title {{ font: italic 24px Georgia, "Times New Roman", serif; fill: #111; }}
    .label {{ font: 500 17px Georgia, "Times New Roman", serif; fill: #111; dominant-baseline: middle; text-anchor: middle; }}
    .plan {{ font: italic 18px Georgia, "Times New Roman", serif; fill: #222; }}
    .task {{ fill: #edf4ff; stroke: #4b5563; stroke-width: 1.4; }}
    .link {{ stroke: #111; stroke-width: 3.2; fill: none; stroke-linecap: square; }}
    .unit {{ stroke: #111; stroke-width: 3.2; stroke-linecap: square; }}
    .frame {{ fill: none; stroke: #111; stroke-width: 1.4; }}
  </style>
  <rect x="8" y="38" width="{width - 16}" height="{height - 82}" class="frame"/>
  <text x="10" y="26" class="title">{escape(diagram["title"])}</text>
  {body}
  <text x="20" y="{height - 22}" class="plan">{escape(diagram["plan"])}</text>
</svg>
'''


def main() -> None:
    OUT_DIR.mkdir(exist_ok=True)
    for diagram in DIAGRAMS:
        (OUT_DIR / diagram["file"]).write_text(svg_for(diagram), encoding="utf-8")
        if Image is not None:
            render_png(diagram, OUT_DIR / diagram["file"].replace(".svg", ".png"))
    print(f"Generated {len(DIAGRAMS)} HTA diagrams in {OUT_DIR}")


def font(size: int, italic: bool = False):
    candidates = [
        "C:/Windows/Fonts/timesi.ttf" if italic else "C:/Windows/Fonts/times.ttf",
        "C:/Windows/Fonts/georgiai.ttf" if italic else "C:/Windows/Fonts/georgia.ttf",
        "DejaVuSerif-Italic.ttf" if italic else "DejaVuSerif.ttf",
        "DejaVuSans.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def render_png(diagram: dict, path: Path) -> None:
    if Image is None:
        return

    root = diagram["root"]
    set_widths(root)
    levels = depth(root)
    width = max(1180, leaf_count(root) * 165)
    level_gap = 148
    title_h = 44
    plan_h = 46
    height = title_h + levels * level_gap + plan_h
    layout(root, 52, width - 52, title_h + 58, level_gap)

    scale = 2
    img = Image.new("RGB", (width * scale, height * scale), "white")
    draw = ImageDraw.Draw(img)

    title_font = font(24 * scale, italic=True)
    label_font = font(17 * scale)
    plan_font = font(18 * scale, italic=True)

    def s(value: float) -> int:
        return round(value * scale)

    draw.rectangle([s(8), s(38), s(width - 8), s(height - 44)], outline="#111111", width=s(1.4))
    draw.text((s(10), s(4)), diagram["title"], fill="#111111", font=title_font)

    def draw_connectors(node: Node) -> None:
        if not node.children:
            return
        bus_y = node.y + node.h / 2 + 34
        left = min(child.x for child in node.children) - node.children[0].w / 2 + 4
        right = max(child.x for child in node.children) + node.children[-1].w / 2 - 4
        draw.line([s(node.x), s(node.y + node.h / 2), s(node.x), s(bus_y)], fill="#111111", width=s(3.2))
        draw.line([s(left), s(bus_y), s(right), s(bus_y)], fill="#111111", width=s(3.2))
        for child in node.children:
            draw.line([s(child.x), s(bus_y), s(child.x), s(child.y - child.h / 2)], fill="#111111", width=s(3.2))
            draw_connectors(child)

    def draw_node(node: Node) -> None:
        x = node.x - node.w / 2
        y = node.y - node.h / 2
        draw.rounded_rectangle(
            [s(x), s(y), s(x + node.w), s(y + node.h)],
            radius=s(6),
            fill="#edf4ff",
            outline="#4b5563",
            width=s(1.4),
        )
        lines = wrap_lines(node.label, 18 if node.w > 145 else 15)
        line_height = 18
        start_y = node.y - (len(lines) - 1) * line_height / 2
        for index, line in enumerate(lines):
            bbox = draw.textbbox((0, 0), line, font=label_font)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]
            draw.text(
                (s(node.x) - text_w / 2, s(start_y + index * line_height) - text_h / 2),
                line,
                fill="#111111",
                font=label_font,
            )
        if not node.children:
            underline_y = y + node.h + 15
            draw.line([s(x + 10), s(underline_y), s(x + node.w - 10), s(underline_y)], fill="#111111", width=s(3.2))

    draw_connectors(root)
    for node in all_nodes(root):
        draw_node(node)

    draw.text((s(20), s(height - 40)), diagram["plan"], fill="#222222", font=plan_font)
    img = img.resize((width, height), Image.Resampling.LANCZOS)
    img.save(path)


if __name__ == "__main__":
    main()
