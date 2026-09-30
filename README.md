# Civan Portfolio

Koyu mor temalı, mobil uyumlu ve yönetim panelli kişisel portfolyo sitesi.

## Özellikler

- Mobilde portre önce, tanıtım metni sonra gelir.
- Ziyaretçi TR/EN dil anahtarından tüm portfolyo içeriğini değiştirebilir; seçim cihazda hatırlanır.
- Yönetim panelinde Türkçe ve İngilizce metinler ayrı ayrı düzenlenebilir.
- Üst menü aktif bölümü animasyonla gösterir; ana aksiyon ve sosyal medya düğmeleri etkileşimli hareketlere sahiptir.
- Logo yazısı veya logo görseli yönetim panelinden değiştirilebilir.
- Proje kartları masaüstü ve mobilde kaydırıldıkça üst üste yerleşir.
- Tam ekran, opak ve taşmasız mobil menü kullanır.
- Deneyim ve eğitim kayıtları kart yapısındadır.
- CV ve sertifikalar PDF olarak yüklenir ve yeni sekmede açılır.
- Profil, sosyal bağlantılar, bölüm metinleri, deneyimler, projeler, görseller ve belgeler şifre korumalı `/admin` üzerinden yönetilir.
- Proje düğmeleri proje detayı, tarayıcıda oynama, ZIP indirme veya Steam / Play Store yönlendirmesi olarak ayarlanabilir.
- YouTube kanal kimliği girildiğinde en yeni videonun başlığı ve kapak görseli otomatik gösterilir.
- İçerik Cloudflare D1, görseller ve PDF dosyaları Cloudflare R2 üzerinde saklanır.

## Klasör yapısı

```text
app/                 Sayfalar ve API rotaları
components/          Portfolyo ve admin arayüzleri
db/                  D1 veritabanı şeması
drizzle/             Üretilmiş SQL migrasyonları
lib/                 İçerik modeli, saklama ve yetkilendirme
public/logos/         Sosyal medya logoları
.openai/hosting.json Sites yayın ve binding ayarları
```

## Yerel geliştirme

Node.js 22.13 veya üzeri ve pnpm gerekir.

```bash
pnpm install
pnpm run db:generate
pnpm run dev
```

Site `http://127.0.0.1:5173` adresinde açılır. Yönetim paneli `http://127.0.0.1:5173/admin` adresindedir. Yerel geliştirme şifresi `civan123` değeridir.

Üretimde yönetici şifresi kaynak dosyaya yazılmaz; Sites ortamındaki gizli `ADMIN_PASSWORD` değişkeninden okunur.

## Derleme

```bash
pnpm run build
```

Proje Sites üzerinde D1 için `DB`, R2 için `BUCKET` binding adlarını kullanır.

## Oyun ve proje ekleme

Yönetim panelinde **Projeler** bölümünden bir kart ekleyin ve bağlantı türünü kullanım biçimine göre seçin:

- **Tarayıcıda oyna:** Unity'de WebGL build alın. Build klasörünün tamamını hostingte örneğin `/games/oyun-adi/` yoluna yükleyin ve bağlantı olarak `/games/oyun-adi/index.html` yazın. Yalnızca `.exe` dosyasını tarayıcıda çalıştırmak mümkün değildir.
- **Bilgisayara indir:** Windows/macOS/Linux build klasörünü ZIP yapıp paneldeki “İndirilebilir oyun paketi yükle” alanını kullanın. 95 MB'den büyük paketleri hostingin dosya alanına, GitHub Releases'a veya itch.io'ya yükleyip doğrudan indirme adresini bağlantı alanına yazın.
- **Steam / Play Store / mağaza:** Oyunun mağaza sayfasının tam adresini bağlantı alanına yazın ve bağlantı türünü mağaza olarak seçin.
- **Proje detayı / kaynak kod:** GitHub, canlı demo veya ayrıntı sayfası adresini kullanın.

## YouTube kapak görseli

Admin panelindeki **Profil → Sosyal bağlantılar** alanında YouTube kanal adresinizi ve `UC…` ile başlayan kanal kimliğinizi girin. Site YouTube'un kanal beslemesini yaklaşık 30 dakikada bir kontrol eder ve en yeni videonun kapağını, başlığını ve bağlantısını gösterir. Kanal kimliği girilmezse kart doğrudan YouTube kanalına yönlendirir.

## Hosting ve domain

Bu proje sunucu tarafında çalışan API rotaları ile Cloudflare D1 ve R2 kullanır; yalnızca statik HTML destekleyen klasik bir hosting paketine olduğu gibi yüklenemez. Mevcut yapıyla en kısa yayın yolu Cloudflare Workers/Sites üzerinde D1 ve R2 binding'leriyle deploy etmektir.

Kendi hostinginiz VPS veya Node.js uygulaması çalıştırabiliyorsa, D1/R2 katmanının SQLite/S3 ya da hostinginizin sunduğu veritabanı ve dosya deposuna uyarlanması gerekir. cPanel türü bir pakette “Node.js App” desteği olsa bile bu Cloudflare binding'leri doğrudan sağlamaz.

Domain alındıktan sonra genel akış şöyledir:

1. Hosting tarafında siteye özel alan adını ekleyin.
2. Domain firmasındaki DNS panelinde hostingin verdiği `A`, `AAAA` veya `CNAME` kaydını tanımlayın.
3. `www` için ayrıca bir `CNAME` ekleyin ve ana domaine yönlendirin.
4. Hosting panelinden ücretsiz SSL/TLS sertifikasını etkinleştirin.
5. Üretim ortamında güçlü bir `ADMIN_PASSWORD` secret'ı tanımlayın.

Kesin DNS değerleri hosting sağlayıcısına göre değiştiği için yayın aşamasında paket türü ve sağlayıcı adıyla birlikte kontrol edilmelidir.
