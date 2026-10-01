# MCO Portfolio

Mehmet Civan Öztrak için Türkçe/İngilizce, mobil uyumlu, yönetim panelli portfolyo sitesi. Uygulama Cloudflare Workers üzerinde çalışır; içerik D1'da, yüklenen görsel, PDF ve oyun paketleri R2'da tutulur.

## Klasör yapısı

```text
app/             Sayfalar, SEO dosyaları ve API rotaları
build/           Cloudflare Worker giriş dosyası
components/      Portfolyo ve yönetim paneli bileşenleri
db/              D1 şeması ve bağlantısı
drizzle/         D1 SQL migrasyonları
lib/             İçerik, kimlik doğrulama ve yardımcılar
public/logos/    Sosyal medya görselleri
vendor/          Kullanılan yerel stil dosyaları
```

`.next`, `.vinext`, `dist`, `.wrangler`, `node_modules` ve `*.tsbuildinfo` üretilmiş yerel dosyalardır; GitHub'a gönderilmez.

## Yerel geliştirme

Node.js 22.13 veya üzeri gerekir.

```powershell
npm install
npm run dev
```

Site `http://127.0.0.1:5173`, yönetim paneli `http://127.0.0.1:5173/admin` adresinde açılır.

## Cloudflare kaynakları

- Worker: `mco-portfolio`
- D1: `mco-portfolio-db`
- R2: `mco-portfolio-files`
- D1 binding: `DB`
- R2 binding: `BUCKET`

R2 etkinleştirildikten sonra bir defa:

```powershell
npx wrangler r2 bucket create mco-portfolio-files
npm run build
npm run db:migrate
```

Yönetici parolası kaynak kodunda tutulmaz. PBKDF2 hash değeri ve bağımsız oturum anahtarı Cloudflare secret olarak tanımlanır:

```powershell
npx wrangler secret put ADMIN_PASSWORD_HASH
npx wrangler secret put AUTH_SECRET
```

Ardından yayın:

```powershell
npm run deploy
```

## Domain

Üretim adresi `https://mehmetcivanoztrak.com` olarak ayarlanmıştır. Domain Cloudflare'a eklendikten sonra Natro'daki `ns1.natrohost.com` ve `ns2.natrohost.com` nameserver'ları Cloudflare'ın verdiği iki nameserver ile değiştirilmelidir. Worker yayımlandıktan sonra Cloudflare Workers & Pages içinden hem `mehmetcivanoztrak.com` hem `www.mehmetcivanoztrak.com` Custom Domain olarak Worker'a bağlanır.

## Ücretsiz R2 sınırı

R2 Standard ücretsiz kullanımında aylık 10 GB-ay depolama, 1 milyon Class A ve 10 milyon Class B işlem bulunur; internet çıkışı ücretsizdir. Aşım kullanım bazlı ücret oluşturabilir. Uygulama, ücretsiz alanın altında güvenlik payı bırakmak için yönetici panelinden yapılan toplam yüklemeleri 8 GB ile sınırlar. Tek oyun ZIP dosyası en fazla 95 MB olabilir.

Cloudflare bütçe uyarısı yalnızca bildirim gönderir; harcamayı otomatik durdurmaz.

## Oyun ve proje ekleme

- **Tarayıcıda oyna:** Unity WebGL build klasörünü uygun bir statik barındırmaya yükleyip `index.html` adresini kullanın. Windows `.exe` dosyası tarayıcıda çalışmaz.
- **Bilgisayara indir:** Windows/macOS/Linux build klasörünü ZIP yapıp yönetim panelinden yükleyin. 95 MB'den büyük paketler için itch.io, GitHub Releases veya mağaza sayfası kullanın.
- **Steam / Play Store:** Oyunun mağaza sayfasının tam adresini bağlantı alanına yazıp mağaza bağlantısı türünü seçin.
- **Proje / kaynak kod:** GitHub, canlı demo veya proje detay adresini kullanın.

## YouTube kapağı

Yönetim panelinde YouTube kanal adresiyle birlikte `UC…` kanal kimliğini girin. Site kanal beslemesini kontrol ederek en yeni iki videonun başlık, bağlantı ve kapak görsellerini gösterir.

## GitHub'a gönderme

Yalnızca bu proje klasörü gönderilir:

```powershell
cd "C:\Users\Mehmet Civan OZTRAK\Desktop\civan-portfolio-publish"
git status
git add .
git commit -m "Move portfolio hosting to Cloudflare Workers"
git push -u origin main
```

`git remote -v` çıktısında gerçek GitHub depo adresi görünmelidir; örnek/yer tutucu adres görünüyorsa önce `git remote set-url origin https://github.com/MehmetCivanOZTRAK/mco-portfolio.git` çalıştırılır.
