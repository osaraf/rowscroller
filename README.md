# Row Scroller Panel — `osamahraf-rowscroller-panel`

Deep-link directly to a **dashboard row** by name. On load, the panel finds the target row, optionally **expands** it, and **aligns its header to the top** (with an offset). Designed to run as an **invisible micro panel** so users don’t see it.

> **Use cases:** Alert links, runbooks, NOC/kiosk screens, cross-dashboard navigation.

---

## Features

- `row=<name>` — case-insensitive match of the row title
- `expand=true|false` — expand row if collapsed (default: `true`)
- `offset=<px>` — align header to top with a pixel offset (default: `60`)
- Works as a **micro panel** (1×1, transparent, optional hidden row)
- No backend, no data source, no telemetry

---

## Requirements

- Grafana **≥ 12.1.0**
- Browser access to the dashboard (no special permissions)

---

## Installation

### Dev (unsigned)
Mount the built plugin into Grafana:

```yaml
# docker-compose.yml (minimal for local dev)
services:
  grafana:
    image: grafana/grafana:12.1.0
    container_name: osamahraf-rowscroller-panel
    ports:
      - "3000:3000"
    environment:
      - GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=osamahraf-rowscroller-panel
    volumes:
      - ./dist:/var/lib/grafana/plugins/osamahraf-rowscroller-panel

---
## Examples

/d/abcd1234/ops-overview?row=Energie
/d/abcd1234/ops-overview?row=Errors&expand=false
/d/abcd1234/ops-overview?row=Network%20Health&expand=true&offset=72

