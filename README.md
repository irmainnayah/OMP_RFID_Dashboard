# OMP RFID Dashboard

Dashboard pemantauan servis bengkel (SMMS Workshop) untuk alat berat. Menampilkan okupansi bay,
ID unit, mekanik, waktu mulai, estimasi selesai, countdown, dan status overdue dalam satu layar.
Target tampilan adalah Smart Display 16:9 (1920 × 1080); ini ukuran target, bukan batasan teknis.

Aplikasi ini adalah **ASP.NET Core MVC (.NET 10, C#)**.

## Fitur

- 8 kartu bay: PARKIRAN DALAM (BAY 01, 02, 07, 08) dan PARKIRAN LUAR (BAY 01, 02, 07, 08).
- Ringkasan: total, in service, overdue, dan kosong.
- Per kartu: ID unit, mekanik, jam mulai, estimasi selesai, countdown `HH:MM:SS` (`-HH:MM:SS` setelah lewat target).
- Jam dan tanggal di header, diperbarui tiap detik.
- Fallback ke data dummy jika API gagal atau responsnya tidak valid.

Halaman tidak polling API. Countdown dan summary diperbarui di browser dari data yang sudah dimuat;
muat ulang halaman untuk mengambil data terbaru.

## Teknologi

| Komponen | Keterangan |
| --- | --- |
| .NET 10 SDK | ASP.NET Core MVC, C# |
| Razor | View dan partial view |
| JavaScript (vanilla) | `wwwroot/js/dashboard.js`: jam, countdown, summary |
| Tailwind CSS v4 | Hanya saat membangun `site.css` (tooling, bukan runtime) |
| xUnit | Unit test |

## Struktur folder

```text
OmpRfidDashboard.csproj               Project web MVC (net10.0)
Program.cs                            Konfigurasi aplikasi dan HttpClient
appsettings.json                      BayApi:Url
Controllers/HomeController.cs         Mengambil data, menghitung summary, merender view
Models/                               BayData, BaySummary, DashboardViewModel
Services/
  BayService.cs                       Request API, validasi respons, fallback
  BayMapper.cs                        Mapping location_bays ke 8 kartu (fungsi murni)
  BaySummaryCalculator.cs             Perhitungan summary
Data/DummyBays.cs                     Data fallback
Views/Home/Index.cshtml               Halaman dashboard
Views/Shared/                         _Layout, _Header, _SummaryBar, _BayGrid, _BayCard,
                                      _StatusBadge, _EquipmentVisual
Styles/input.css                      Sumber CSS (Tailwind dan animasi)
wwwroot/css/site.css                  CSS hasil build (disertakan di repository)
wwwroot/js/dashboard.js
wwwroot/images, wwwroot/fonts         Aset (font IBM Plex disimpan lokal)
OmpRfidDashboard.Tests/               Unit test xUnit
```

## Persyaratan

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- Node.js hanya jika ingin membangun ulang CSS (lihat bagian terakhir).

## Menjalankan

```bash
dotnet restore
dotnet run
```

Buka `http://localhost:5005`.

## Konfigurasi

| Pengaturan | Sumber | Keterangan |
| --- | --- | --- |
| `BayApi:Url` | `appsettings.json` | Alamat API bay. |
| `API_KEY` | Environment variable atau User Secrets | Dikirim sebagai header `x-api-key`. Tidak pernah di-log. |

Aplikasi tidak membaca file `.env`. Jangan menaruh nilai `API_KEY` di source code atau repository.

**Environment variable** (PowerShell):

```powershell
$env:API_KEY = "<isi key>"
dotnet run
```

**User Secrets** (pengembangan lokal):

```bash
dotnet user-secrets init
dotnet user-secrets set API_KEY "<isi key>"
```

Alamat API dapat diganti lewat environment variable `BayApi__Url` tanpa mengubah file.

## Alur data

```text
Browser -> HomeController.Index -> IBayService (BayService) -> BayMapper -> DashboardViewModel -> Razor view
```

1. `HomeController.Index` memanggil `GetBaysAsync()` pada setiap request. Respons dikirim dengan `no-store`.
2. `BayService` memanggil API dengan header `x-api-key` dan timeout 15 detik, lalu memvalidasi respons
   (`success` benar dan `data` berupa array).
3. `BayMapper` membaca `location_bays` dan mencocokkan nomor bay (01, 02, 07, 08) dan lokasi
   (DALAM atau LUAR) secara bersamaan. Hasilnya selalu tepat 8 kartu.
   - Record yang nomor atau lokasinya tidak dikenal dilewati.
   - Jika ada beberapa record untuk satu kartu, tidak ada yang dipilih: kartu dibiarkan kosong.
   - Kartu tanpa record tetap kosong.
   - Log hanya berisi jumlah, misalnya `Bay mapping issues: 1 unrecognized, 1 duplicate`.
4. `BaySummaryCalculator` menghitung summary, dan `DashboardViewModel` membagi kartu menjadi baris DALAM dan LUAR.
5. View Razor merender halaman. `dashboard.js` menjalankan jam, countdown, status overdue, dan summary tiap detik.

Pemetaan field: `unit_number` ke `EquipmentId`, `assigned_mechanics` ke `Mechanic`,
`plan_start_time` ke `StartService`, `estimade_rfu` ke `TargetFinish` dan `TargetFinishDate`.

Status: `IN SERVICE` bila waktu estimasi belum lewat, `OVERDUE` bila sudah lewat, dan kartu kosong
bila tidak ada record. Tidak ada status `COMPLETE`.

### Fallback DummyBays

`Data/DummyBays.cs` dipakai bila request gagal, status HTTP bukan sukses, respons bukan JSON valid,
atau `success`/`data` tidak sesuai. Data dummy berisi 3 bay DALAM yang terisi dan 5 bay kosong.

## Unit test

```bash
dotnet test OmpRfidDashboard.Tests
```

Tes memakai handler HTTP palsu, jadi tidak ada request ke API asli. Cakupannya: mapping DALAM/LUAR,
nomor sama di lokasi berbeda, urutan record, bay tanpa data, data tidak dikenal, duplikat, validasi
respons, header `x-api-key`, fallback, dan summary.

## Production build dan deployment

```bash
dotnet publish OmpRfidDashboard.csproj -c Release -o publish
```

Jalankan hasil publish:

```bash
cd publish
dotnet OmpRfidDashboard.dll --urls http://0.0.0.0:5005
```

Catatan deployment:

- Server membutuhkan **ASP.NET Core Runtime 10** dan akses jaringan ke API.
- Atur `API_KEY` (dan bila perlu `BayApi__Url`) sebagai environment variable di server atau di
  konfigurasi IIS/service. Jangan menaruhnya di repository.
- Untuk IIS, instal ASP.NET Core Hosting Bundle dan arahkan site ke folder `publish`.
- Aplikasi tidak memakai HTTPS secara bawaan di konfigurasi ini; pasang di belakang reverse proxy
  atau atur sertifikat sesuai kebijakan jaringan.

## Membangun ulang CSS

`wwwroot/css/site.css` sudah disertakan, jadi menjalankan aplikasi tidak membutuhkan Node.js.
Bangun ulang hanya setelah mengubah class Tailwind di `Views/`, `wwwroot/js/`, atau `Styles/input.css`
(butuh Node.js, tidak ada file Node di repository):

```bash
npx @tailwindcss/cli@4 -i Styles/input.css -o wwwroot/css/site.css --minify
```

## Keterbatasan

- Format `location_bays` yang didukung adalah `BAY 01 DALAM` / `BAY 01 LUAR` (nomor dan lokasi).
  Format ini berasal dari persyaratan proyek dan harus diverifikasi terhadap server asli.
  Jika berbeda, kartu akan kosong dan log menampilkan jumlah `unrecognized`.
- Gambar peralatan disajikan dalam ukuran aslinya (tidak dioptimasi otomatis).
