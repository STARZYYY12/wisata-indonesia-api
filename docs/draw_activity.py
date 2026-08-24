import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyArrowPatch, Circle

fig, ax = plt.subplots(figsize=(11, 15))
ax.set_xlim(0, 90)
ax.set_ylim(0, 150)
ax.axis('off')

ACT_FACE = '#eff6ff'
ACT_EDGE = '#2563eb'
DEC_FACE = '#fef3c7'
DEC_EDGE = '#b45309'
START_END = '#111827'

def arrow(x1, y1, x2, y2, label=None, color='#374151'):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='-|>', color=color, linewidth=1.4, shrinkA=2, shrinkB=2))
    if label:
        ax.text((x1+x2)/2 + 2.3, (y1+y2)/2, label, fontsize=8, color='#b91c1c', fontweight='bold')

def action(x, y, text, w=34, h=6):
    ax.add_patch(patches.FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.3,rounding_size=1.5",
                 linewidth=1.4, edgecolor=ACT_EDGE, facecolor=ACT_FACE, zorder=3))
    ax.text(x, y, text, fontsize=8.7, ha='center', va='center', zorder=4)
    return (x, y)

def decision(x, y, text, s=10):
    diamond = patches.RegularPolygon((x, y), numVertices=4, radius=s, orientation=0.785398,
                 linewidth=1.4, edgecolor=DEC_EDGE, facecolor=DEC_FACE, zorder=3)
    ax.add_patch(diamond)
    ax.text(x, y, text, fontsize=7.6, ha='center', va='center', zorder=4, wrap=True)
    return (x, y)

def start(x, y):
    ax.add_patch(Circle((x, y), 1.6, facecolor=START_END, zorder=5))

def end(x, y):
    ax.add_patch(Circle((x, y), 1.9, facecolor='white', edgecolor=START_END, linewidth=1.6, zorder=5))
    ax.add_patch(Circle((x, y), 1.0, facecolor=START_END, zorder=6))

cx = 22  # kolom kiri: alur akun
cx2 = 65 # kolom kanan: alur konsumsi data

ax.text(cx, 148, "Alur: Registrasi & Kelola API Key", fontsize=10.5, fontweight='bold', ha='center', color='#1e3a8a')
ax.text(cx2, 148, "Alur: Konsumsi Data API", fontsize=10.5, fontweight='bold', ha='center', color='#1e3a8a')

# ---- Kolom kiri ----
start(cx, 143)
p1 = action(cx, 137, "Buka halaman\nRegister")
p2 = action(cx, 128, "Isi form:\nname, email, password")
p3 = action(cx, 119, "POST /api/auth/register")
d1 = decision(cx, 109, "Email\nsudah ada?", s=8)
p4 = action(cx-14, 100, "Tampilkan\nerror 409", w=20)
p5 = action(cx, 100, "Simpan user\n(password di-hash)")
p6 = action(cx, 90, "POST /api/auth/login")
d2 = decision(cx, 80, "Kredensial\nvalid?", s=8)
p7 = action(cx-14, 71, "Tampilkan\nerror 401", w=20)
p8 = action(cx, 70, "Server generate\nJWT token")
p9 = action(cx, 60, "Client simpan token\n& kirim di header\nAuthorization: Bearer")
p10 = action(cx, 50, "POST /api/keys\n(buat API key baru)")
p11 = action(cx, 41, "Server generate\nAPI key unik (wid_xxx)")
p12 = action(cx, 32, "Simpan ke tabel\napi_keys")
p13 = action(cx, 23, "Tampilkan API key\nke developer")
end(cx, 15)

arrow(cx, 141.4, cx, 140)
arrow(cx, 134, cx, 131)
arrow(cx, 125, cx, 122)
arrow(cx, 116, cx, 112.5)
arrow(cx-2, 104.5, cx-13, 102.5, "Ya")
arrow(cx+1, 105, cx, 103, "Tidak")
arrow(cx, 97, cx, 93)
arrow(cx, 87, cx, 83)
arrow(cx-2, 75.5, cx-13, 73.5, "Tidak")
arrow(cx+1, 76, cx, 73, "Ya")
arrow(cx, 67, cx, 63)
arrow(cx, 57, cx, 53)
arrow(cx, 47, cx, 44)
arrow(cx, 38, cx, 35)
arrow(cx, 29, cx, 26)
arrow(cx, 20, cx, 17)

# ---- Kolom kanan ----
start(cx2, 143)
q1 = action(cx2, 137, "Aplikasi klien\nkirim request")
q2 = action(cx2, 128, "Sertakan header\nx-api-key: <key>")
q3 = action(cx2, 119, "Middleware:\nauthApiKey()")
d3 = decision(cx2, 109, "API key\nvalid & aktif?", s=8)
q4 = action(cx2+16, 100, "Response 401/403\n+ pesan error", w=22)
q5 = action(cx2, 100, "Update request_count\n& last_used_at")
q6 = action(cx2, 90, "Catat log ke\napi_request_logs")
q7 = action(cx2, 80, "Proses query ke\ntabel destinations/reviews")
d4 = decision(cx2, 70, "Data\nditemukan?", s=8)
q8 = action(cx2+16, 61, "Response 404\nNot Found", w=20)
q9 = action(cx2, 61, "Format response JSON")
q10 = action(cx2, 51, "Kirim response\n200 OK ke klien")
q11 = action(cx2, 41, "Klien menampilkan\ndata wisata")
end(cx2, 33)

arrow(cx2, 141.4, cx2, 140)
arrow(cx2, 134, cx2, 131)
arrow(cx2, 125, cx2, 122)
arrow(cx2, 116, cx2, 112.5)
arrow(cx2+2, 105, cx2+15, 102.5, "Tidak")
arrow(cx2-1, 104.5, cx2, 103, "Ya")
arrow(cx2, 97, cx2, 93)
arrow(cx2, 87, cx2, 83)
arrow(cx2, 77, cx2, 73.5)
arrow(cx2+2, 65.5, cx2+15, 63, "Tidak")
arrow(cx2-1, 65, cx2, 64, "Ya")
arrow(cx2, 58, cx2, 54)
arrow(cx2, 48, cx2, 44)
arrow(cx2, 38, cx2, 35.5)

ax.text(45, 4, "Activity Diagram / Userflow - Wisata Indonesia API", fontsize=12.5, fontweight='bold', ha='center')

plt.tight_layout()
plt.savefig('/home/claude/wisata-api/docs/activity.png', dpi=165, bbox_inches='tight')
print("saved activity.png")
