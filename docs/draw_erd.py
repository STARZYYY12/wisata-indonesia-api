import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(14, 9))
ax.set_xlim(0, 140)
ax.set_ylim(0, 95)
ax.axis('off')

HEADER = '#2563eb'
BODY = '#eff6ff'
BORDER = '#1e3a8a'
PK_COLOR = '#b91c1c'
FK_COLOR = '#0f766e'

def draw_entity(x, y, w, title, fields):
    row_h = 3.6
    header_h = 4.5
    total_h = header_h + row_h * len(fields)
    ax.add_patch(patches.FancyBboxPatch((x, y - total_h), w, total_h,
                 boxstyle="round,pad=0.15,rounding_size=0.3",
                 linewidth=1.5, edgecolor=BORDER, facecolor=BODY, zorder=2))
    ax.add_patch(patches.FancyBboxPatch((x, y - header_h), w, header_h,
                 boxstyle="round,pad=0.15,rounding_size=0.3",
                 linewidth=1.5, edgecolor=BORDER, facecolor=HEADER, zorder=3))
    ax.text(x + w/2, y - header_h/2, title, ha='center', va='center',
            fontsize=11.5, fontweight='bold', color='white', zorder=4)
    for i, (fname, ftype, key) in enumerate(fields):
        fy = y - header_h - row_h*i - row_h/2
        color = PK_COLOR if key == 'PK' else (FK_COLOR if key == 'FK' else '#111827')
        label = f"{fname}" + (f"  ({key})" if key else "")
        ax.text(x + 2, fy, label, ha='left', va='center', fontsize=9, color=color, zorder=4)
        ax.text(x + w - 2, fy, ftype, ha='right', va='center', fontsize=8, color='#6b7280', style='italic', zorder=4)
    return (x, y, w, total_h)

# Entities
users = draw_entity(3, 90, 28, "users", [
    ("id", "SERIAL", "PK"),
    ("name", "VARCHAR", ""),
    ("email", "VARCHAR", ""),
    ("password_hash", "VARCHAR", ""),
    ("role", "VARCHAR", ""),
    ("created_at", "TIMESTAMPTZ", ""),
])

api_keys = draw_entity(3, 55, 28, "api_keys", [
    ("id", "SERIAL", "PK"),
    ("user_id", "INTEGER", "FK"),
    ("api_key", "VARCHAR", ""),
    ("label", "VARCHAR", ""),
    ("is_active", "BOOLEAN", ""),
    ("request_count", "INTEGER", ""),
    ("rate_limit", "INTEGER", ""),
    ("last_used_at", "TIMESTAMPTZ", ""),
])

logs = draw_entity(3, 15, 28, "api_request_logs", [
    ("id", "BIGSERIAL", "PK"),
    ("api_key_id", "INTEGER", "FK"),
    ("endpoint", "VARCHAR", ""),
    ("method", "VARCHAR", ""),
    ("status_code", "INTEGER", ""),
    ("created_at", "TIMESTAMPTZ", ""),
])

destinations = draw_entity(60, 90, 32, "destinations", [
    ("id", "SERIAL", "PK"),
    ("name", "VARCHAR", ""),
    ("slug", "VARCHAR", ""),
    ("category", "VARCHAR", ""),
    ("province", "VARCHAR", ""),
    ("city", "VARCHAR", ""),
    ("description", "TEXT", ""),
    ("price_ticket", "INTEGER", ""),
    ("rating", "NUMERIC", ""),
    ("latitude", "NUMERIC", ""),
    ("longitude", "NUMERIC", ""),
    ("facilities", "TEXT[]", ""),
    ("opening_hours", "VARCHAR", ""),
    ("is_active", "BOOLEAN", ""),
])

reviews = draw_entity(105, 55, 30, "reviews", [
    ("id", "SERIAL", "PK"),
    ("destination_id", "INTEGER", "FK"),
    ("reviewer_name", "VARCHAR", ""),
    ("rating", "SMALLINT", ""),
    ("comment", "TEXT", ""),
    ("created_at", "TIMESTAMPTZ", ""),
])

def relation(x1, y1, x2, y2, label, one='1', many='N'):
    ax.plot([x1, x2], [y1, y2], color='#374151', linewidth=1.3, zorder=1)
    ax.text(x1 + (x2-x1)*0.12, y1 + (y2-y1)*0.12, one, fontsize=9, color='#374151', fontweight='bold')
    ax.text(x1 + (x2-x1)*0.88, y1 + (y2-y1)*0.88, many, fontsize=9, color='#374151', fontweight='bold')
    mx, my = (x1+x2)/2, (y1+y2)/2 + 1.5
    ax.text(mx, my, label, fontsize=8.5, ha='center', color='#4b5563', style='italic',
            bbox=dict(boxstyle='round,pad=0.2', facecolor='white', edgecolor='none'))

# users -> api_keys (1 user punya banyak api_key)
relation(17, 90-27, 17, 55, "memiliki", '1', 'N')
# api_keys -> api_request_logs
relation(17, 55-28, 17, 15, "mencatat", '1', 'N')
# destinations -> reviews
relation(92, 90-53.5, 105, 55-16, "diulas dalam", '1', 'N')

ax.text(70, 3, "ERD - Wisata Indonesia API", fontsize=15, fontweight='bold', ha='center', color='#111827')

plt.tight_layout()
plt.savefig('/home/claude/wisata-api/docs/erd.png', dpi=170, bbox_inches='tight')
print("saved erd.png")
