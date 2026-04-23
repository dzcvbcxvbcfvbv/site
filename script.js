// --- ENTER SCREEN ---
const enterScreen = document.getElementById('enter-screen');
const mainContent = document.getElementById('main-content');
const bgMusic = document.getElementById('bg-music');
const clickToEnter = document.getElementById('click-to-enter');

clickToEnter.addEventListener('click', () => {
    bgMusic.volume = 0.6;
    bgMusic.play().catch(e => console.log("Ses çalınamadı:", e));
    enterScreen.style.opacity = '0';
    setTimeout(() => {
        enterScreen.style.display = 'none';
        mainContent.style.display = 'block';
    }, 500);
});

// --- MATRIX ANIMATION ---
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const characters = '01010101ACCESSDENIEDHACKED404';
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = [];
for (let x = 0; x < columns; x++) drops[x] = Math.random() * -100;

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + 'px "Fira Code"';
    for (let i = 0; i < drops.length; i++) {
        if (drops[i] < 0) { drops[i]++; continue; }
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillStyle = Math.random() > 0.95 ? '#ff003c' : '#8a0000';
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
setInterval(drawMatrix, 50);

// ===================================================================
// DISCORD API (JAPI + LANYARD)
// ===================================================================
const userIds = ['1274031255662628925', '968483727162347590', '1461677975291429027'];

// Discord Orijinal Rozet SVG'leri (CDN Sorunları için Github Raw Repo)
const badgeIcons = {
    "HOUSE_BRAVERY": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/hypesquadbravery.svg",
    "HOUSE_BRILLIANCE": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/hypesquadbrilliance.svg",
    "HOUSE_BALANCE": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/hypesquadbalance.svg",
    "ACTIVE_DEVELOPER": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/activedeveloper.svg",
    "NITRO": "https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png", // Pembe elmas Nitro
    "EARLY_SUPPORTER": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordearlysupporter.svg",
    "BUG_HUNTER_1": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordbughunter1.svg",
    "BUG_HUNTER_2": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordbughunter2.svg",
    "VERIFIED_DEVELOPER": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordbotdev.svg",
    "EARLY_VERIFIED_BOT_DEVELOPER": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordbotdev.svg",
    "BOOSTER": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordnitro.svg", // Booster icon fallback
    "HYPESQUAD_EVENTS": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/hypesquadevents.svg"
};

// Rozet isimleri (kullanıcıya gösterilecek Türkçe isimler)
const badgeNames = {
    "HOUSE_BRAVERY": "HypeSquad Bravery",
    "HOUSE_BRILLIANCE": "HypeSquad Brilliance",
    "HOUSE_BALANCE": "HypeSquad Balance",
    "ACTIVE_DEVELOPER": "Aktif Geliştirici",
    "NITRO": "Discord Nitro",
    "EARLY_SUPPORTER": "Erken Destekçi",
    "BUG_HUNTER_1": "Bug Hunter",
    "BUG_HUNTER_2": "Bug Hunter Lvl 2",
    "VERIFIED_DEVELOPER": "Doğrulanmış Geliştirici",
    "EARLY_VERIFIED_BOT_DEVELOPER": "Bot Geliştiricisi",
    "BOOSTER": "Server Booster",
    "HYPESQUAD_EVENTS": "Hypesquad Events"
};

// 1) JAPI.REST: Profil bilgileri (isim, avatar, banner, rozetler, clan)
async function fetchProfile(id) {
    try {
        const res = await fetch(`https://japi.rest/discord/v1/user/${id}`);
        const result = await res.json();
        if (!result || !result.data) return;
        const d = result.data;

        // Görünen Ad (Display Name)
        const dispEl = document.getElementById(`displayname-${id}`);
        if (dispEl) dispEl.textContent = (d.global_name || d.username).trim();

        // Gerçek Kullanıcı Adı (küçük yazı)
        const userEl = document.getElementById(`username-${id}`);
        if (userEl) userEl.textContent = '@' + d.username;

        // Avatar
        const avEl = document.getElementById(`avatar-${id}`);
        if (avEl && d.avatar) {
            const ext = d.avatar.startsWith('a_') ? 'gif' : 'png';
            avEl.src = `https://cdn.discordapp.com/avatars/${id}/${d.avatar}.${ext}?size=256`;
        }

        // Banner
        const banEl = document.getElementById(`banner-${id}`);
        if (banEl) {
            if (d.banner) {
                const ext = d.banner.startsWith('a_') ? 'gif' : 'png';
                banEl.style.backgroundImage = `url(https://cdn.discordapp.com/banners/${id}/${d.banner}.${ext}?size=600)`;
            } else if (d.banner_color) {
                banEl.style.backgroundColor = d.banner_color;
            }
        }

        // Rozetler
        const badgesEl = document.getElementById(`badges-${id}`);
        if (badgesEl) {
            badgesEl.innerHTML = '';

            // Leux için rozet enjeksiyonu (İstenen tüm rozetleri zorla ekle)
            if (id === '1274031255662628925') {
                const forcedBadges = ["EARLY_SUPPORTER", "HOUSE_BRAVERY", "HYPESQUAD_EVENTS", "ACTIVE_DEVELOPER", "NITRO", "BUG_HUNTER_1", "VERIFIED_DEVELOPER"];
                d.public_flags_array = [...new Set([...(d.public_flags_array || []), ...forcedBadges])];
            }

            // Public Flags (HypeSquad vb.)
            if (d.public_flags_array && d.public_flags_array.length > 0) {
                d.public_flags_array.forEach(flag => {
                    if (!flag || flag.trim() === '') return;
                    const pngUrl = badgeIcons[flag];
                    const name = badgeNames[flag] || flag.replace(/_/g, ' ');

                    if (pngUrl) {
                        const img = document.createElement('img');
                        img.src = pngUrl;
                        img.title = name;
                        img.className = 'badge-icon';
                        badgesEl.appendChild(img);
                    } else {
                        const span = document.createElement('span');
                        span.className = 'badge-text';
                        span.title = name;
                        span.innerText = name;
                        badgesEl.appendChild(span);
                    }
                });
            }

            // Nitro (JAPI'de bazen flag içinde gelmiyor)
            if (d.avatar_decoration_data || d.banner) {
                const existing = badgesEl.querySelector('[title="Discord Nitro"]');
                if (!existing) {
                    const img = document.createElement('img');
                    img.src = badgeIcons["NITRO"];
                    img.title = "Discord Nitro";
                    img.className = 'badge-icon';
                    badgesEl.appendChild(img);
                }
            }

            // Clan Tag (404, HQ vb.)
            if (d.clan && d.clan.tag) {
                const clanEl = document.createElement('span');
                clanEl.className = 'badge-clan';
                clanEl.title = 'Klan: ' + d.clan.tag;

                if (d.clan.badge) {
                    const clanImg = document.createElement('img');
                    clanImg.onerror = () => clanImg.remove();
                    clanImg.src = `https://cdn.discordapp.com/clan-badges/${d.clan.identity_guild_id}/${d.clan.badge}.png?size=32`;
                    clanEl.appendChild(clanImg);
                }

                const tagText = document.createTextNode(d.clan.tag);
                clanEl.appendChild(tagText);
                badgesEl.appendChild(clanEl);
            }
        }
    } catch (err) {
        console.error(`[JAPI] ${id}:`, err);
    }
}

// 2) LANYARD: Anlık aktiflik durumu + Custom Status
async function fetchPresence(id) {
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${id}`);
        const result = await res.json();

        // Kullanıcı Lanyard sunucusunda yoksa hata fırlat ki catch bloğunda varsayılanı yazsın
        if (!result || !result.success) {
            throw new Error("Lanyard data not found");
        }
        
        const data = result.data;
        const status = data.discord_status || 'offline'; 

        // Status Noktası
        const dotEl = document.getElementById(`status-dot-${id}`);
        if (dotEl) dotEl.className = 'status-indicator ' + status;

        // Status Yazısı
        const textEl = document.getElementById(`status-text-${id}`);
        if (textEl) {
            let customStatus = null;
            if (data.activities) {
                const customAct = data.activities.find(a => a.type === 4); 
                if (customAct && customAct.state) {
                    customStatus = customAct.state;
                }
            }

            if (status !== 'offline' && customStatus) {
                // Filtreleme ( /theparaf yazısını gizle )
                customStatus = customStatus.replace(/\/theparaf/gi, '').trim();

                if (customStatus === '') {
                    // Yazı temizlenince boş kaldıysa, standart statüyü göster
                    const statusNames = { online: 'ÇEVRİMİÇİ', idle: 'BOŞTA', dnd: 'RAHATSIZ ETMEYİN' };
                    textEl.textContent = statusNames[status] || 'ÇEVRİMİÇİ';
                    textEl.className = 'detail-value status-' + status;
                } else {
                    textEl.textContent = customStatus;
                    textEl.className = 'detail-value status-' + status;
                }
            } else if (status !== 'offline') {
                const statusNames = { online: 'ÇEVRİMİÇİ', idle: 'BOŞTA', dnd: 'RAHATSIZ ETMEYİN' };
                textEl.textContent = statusNames[status] || 'ÇEVRİMİÇİ';
                textEl.className = 'detail-value status-' + status;
            } else {
                textEl.textContent = 'BAĞLANTI BEKLENİYOR...';
                textEl.className = 'detail-value status-offline';
            }
        }

        // Avatar ve İsim Lanyard'da daha güncel olabilir
        if (data.discord_user) {
            const user = data.discord_user;
            const avEl = document.getElementById(`avatar-${id}`);
            if (avEl && user.avatar) {
                const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
                avEl.src = `https://cdn.discordapp.com/avatars/${id}/${user.avatar}.${ext}?size=256`;
            }

            const dispEl = document.getElementById(`displayname-${id}`);
            if (dispEl && user.global_name) dispEl.textContent = user.global_name.trim();

            const userEl = document.getElementById(`username-${id}`);
            if (userEl) userEl.textContent = '@' + user.username;
        }

    } catch (err) {
        // Hata durumunda (Lanyard'da yoksa) "BAĞLANTI BEKLENİYOR..." yaz
        const dotEl = document.getElementById(`status-dot-${id}`);
        if (dotEl) dotEl.className = 'status-indicator offline';
        
        const textEl = document.getElementById(`status-text-${id}`);
        if (textEl) {
            textEl.textContent = 'BAĞLANTI BEKLENİYOR...';
            textEl.className = 'detail-value status-offline';
        }
    }
}

// --- BAŞLATMA ---
async function init() {
    await Promise.all(userIds.map(id => fetchProfile(id)));
    await Promise.all(userIds.map(id => fetchPresence(id)));
}

init();

// Her 15 saniyede bir güncelle
setInterval(() => {
    userIds.forEach(id => {
        fetchPresence(id);
        fetchProfile(id);
    });
}, 15000);
