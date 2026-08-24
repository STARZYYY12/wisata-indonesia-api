import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Ellipse, FancyArrowPatch

fig, ax = plt.subplots(figsize=(13, 9.5))
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')

SYS_COLOR = '#1e3a8a'
UC_FACE = '#eff6ff'
UC_EDGE = '#2563eb'
ACTOR_COLOR = '#111827'

# System boundary
ax.add_patch(patches.FancyBboxPatch((22, 5), 62, 90, boxstyle="round,pad=0.3,rounding_size=1",
             linewidth=2, edgecolor=SYS_COLOR, facecolor='white', zorder=1))
ax.text(53, 97, "Sistem: Wisata Indonesia API", fontsize=12.5, fontweight='bold', ha='center', color=SYS_COLOR)

def draw_actor(x, y, label):
    # simple stick figure
    ax.add_patch(patches.Circle((x, y+6), 2.1, facecolor='#fbbf24', edgecolor=ACTOR_COLOR, linewidth=1.3, zorder=5))
    ax.plot([x, x], [y+4, y-3], color=ACTOR_COLOR, linewidth=1.6, zorder=5)
    ax.plot([x-3, x+3], [y+1.5, y+1.5], color=ACTOR_COLOR, linewidth=1.6, zorder=5)
    ax.plot([x, x-3], [y-3, y-7], color=ACTOR_COLOR, linewidth=1.6, zorder=5)
    ax.plot([x, x+3], [y-3, y-7], color=ACTOR_COLOR, linewidth=1.6, zorder=5)
    ax.text(x, y-9.5, label, fontsize=10, fontweight='bold', ha='center', color=ACTOR_COLOR)

def draw_usecase(x, y, label, w=17, h=6.4):
    e = Ellipse((x, y), w, h, facecolor=UC_FACE, edgecolor=UC_EDGE, linewidth=1.5, zorder=3)
    ax.add_patch(e)
    ax.text(x, y, label, fontsize=8.3, ha='center', va='center', color='#111827', wrap=True, zorder=4)
    return (x, y, w, h)

def connect(actor_xy, uc_xy, uc_w):
    ax.plot([actor_xy[0], uc_xy[0]-uc_w/2], [actor_xy[1], uc_xy[1]], color='#6b7280', linewidth=1.1, zorder=2)

# Actors
guest_xy = (8, 55)
user_xy = (8, 25)
apiconsumer_xy = (92, 65)
admin_xy = (92, 20)

draw_actor(*guest_xy, "Pengunjung\n(Guest)")
draw_actor(*user_xy, "Developer\n(User Terdaftar)")
draw_actor(*apiconsumer_xy, "Aplikasi Klien\n(API Consumer)")
draw_actor(*admin_xy, "Admin")

# Use cases (left column - auth)
uc_register = draw_usecase(35, 82, "Register Akun")
uc_login = draw_usecase(35, 72, "Login (JWT)")
uc_create_key = draw_usecase(35, 60, "Buat API Key")
uc_list_key = draw_usecase(35, 50, "Lihat Daftar\nAPI Key")
uc_revoke_key = draw_usecase(35, 40, "Nonaktifkan /\nHapus API Key")

# Use cases (right column - data)
uc_get_dest = draw_usecase(68, 78, "Lihat List\nDestinasi Wisata")
uc_get_detail = draw_usecase(68, 66, "Lihat Detail\nDestinasi")
uc_get_cat = draw_usecase(68, 54, "Lihat Kategori\n& Provinsi")
uc_add_review = draw_usecase(68, 42, "Tambah Review\nDestinasi")
uc_manage_data = draw_usecase(68, 18, "Kelola Data\nDestinasi (CRUD)")

# include relation validasi api key
uc_validate = draw_usecase(68, 30, "«include»\nValidasi API Key", w=19)

# Connections: Guest
connect(guest_xy, uc_register, 17)
connect(guest_xy, uc_login, 17)

# Connections: User terdaftar (developer)
connect(user_xy, uc_login, 17)
connect(user_xy, uc_create_key, 17)
connect(user_xy, uc_list_key, 17)
connect(user_xy, uc_revoke_key, 17)

# Connections: API consumer
connect(apiconsumer_xy, uc_get_dest, 17)
connect(apiconsumer_xy, uc_get_detail, 17)
connect(apiconsumer_xy, uc_get_cat, 17)
connect(apiconsumer_xy, uc_add_review, 17)

# Connections: Admin
connect(admin_xy, uc_manage_data, 17)

# include arrows (dashed) from data use cases to validate
for uc in [uc_get_dest, uc_get_detail, uc_get_cat, uc_add_review]:
    ax.annotate('', xy=(uc_validate[0], uc_validate[1]+3.2), xytext=(uc[0], uc[1]-3.2),
                arrowprops=dict(arrowstyle='->', linestyle='dashed', color='#059669', linewidth=1.1))

ax.text(53, 3, "Use Case Diagram - Wisata Indonesia API", fontsize=13, fontweight='bold', ha='center')

plt.tight_layout()
plt.savefig('/home/claude/wisata-api/docs/usecase.png', dpi=170, bbox_inches='tight')
print("saved usecase.png")
