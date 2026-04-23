import ms from './ms.json';
import { LanguageStrings } from '@/types';

const orderedReplacements: Array<[string, string]> = [
  ['garis panduan MPOB', 'standar Indonesian Sustainable Palm Oil (ISPO)'],
  ['Garis panduan MPOB', 'Standar Indonesian Sustainable Palm Oil (ISPO)'],
  ['Piawaian MPOB', 'Standar ISPO'],
  ['piawaian MPOB', 'standar ISPO'],
  ['MPOB', 'ISPO'],
  ['Pilih Pelan Anda', 'Pilih Paket Anda'],
  ['Papan Pemuka', 'Dasbor'],
  ['papan pemuka', 'dasbor'],
  ['Selamat kembali', 'Selamat datang kembali'],
  ['Muat Naik', 'Unggah'],
  ['muat naik', 'unggah'],
  ['Muat Turun', 'Unduh'],
  ['muat turun', 'unduh'],
  ['Sokongan', 'Dukungan'],
  ['sokongan', 'dukungan'],
  ['Tetapan', 'Pengaturan'],
  ['tetapan', 'pengaturan'],
  ['Ciri-ciri', 'Fitur'],
  ['ciri-ciri', 'fitur'],
  ['Laman Utama', 'Beranda'],
  ['Pelan', 'Paket'],
  ['pelan', 'paket'],
  ['Pilih Fail', 'Pilih File'],
  ['format fail', 'format file'],
  ['Fail', 'File'],
  ['fail', 'file'],
  ['Paling Popular', 'Paling Populer'],
  ['Pembaharuan', 'Perpanjangan'],
  ['perkhidmatan', 'layanan'],
  ['Perkhidmatan', 'Layanan'],
  ['kelestarian', 'keberlanjutan'],
  ['Kelestarian', 'Keberlanjutan'],
  ['Pakar Bertauliah', 'Tim Ahli'],
  ['Petua', 'Tips'],
  ['petua', 'tips'],
  ['Pantas', 'Cepat'],
  ['pantas', 'cepat'],
  ['Sila', 'Silakan'],
  ['Berjaya', 'Berhasil'],
  ['berjaya', 'berhasil'],
  ['Ralat', 'Kesalahan'],
  ['ralat', 'kesalahan'],
  ['Mula', 'Mulai'],
  ['mulakan', 'mulai'],
  ['Mulakan', 'Mulai'],
  ['Had', 'Batas'],
  ['had', 'batas'],
  ['Ladang', 'Kebun'],
  ['ladang', 'kebun'],
  ['e-mel', 'email'],
  ['Emel', 'Email'],
  ['emel', 'email'],
  ['pengesahan', 'verifikasi'],
  ['Pengesahan', 'Verifikasi'],
  ['sahkan', 'verifikasi'],
  ['Sahkan', 'Verifikasi'],
  ['Ahli Akademik', 'Akademisi'],
  ['Kakitangan', 'Staf'],
  ['Cuba Lagi', 'Coba Lagi'],
  ['Sahaja', 'Saja'],
  ['sahaja', 'saja'],
  ['Bahasa Malaysia', 'Bahasa Melayu'],
  ['Masa pemprosesan', 'Waktu pemrosesan'],
  ['Pemprosesan', 'Pemrosesan'],
  ['pemprosesan', 'pemrosesan'],
  ['Bulan Ini', 'Bulan Ini'],
  ['Baki', 'Sisa'],
];

const replacementRules = orderedReplacements.map(([from, to]) => [
  new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
  to,
] as const);

export function toIndonesianText(value: string): string {
  return replacementRules.reduce((result, [pattern, replacement]) => {
    return result.replace(pattern, replacement);
  }, value);
}

function convertValue<T>(value: T): T {
  if (typeof value === 'string') {
    return toIndonesianText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => convertValue(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [key, convertValue(nestedValue)])
    ) as T;
  }

  return value;
}

const id = convertValue(ms) as LanguageStrings;

id.common = {
  ...id.common,
  loading: 'Memuat...',
  error: 'Kesalahan',
  success: 'Berhasil',
  warning: 'Peringatan',
  info: 'Informasi',
  next: 'Berikutnya',
  retry: 'Coba Lagi',
  start: 'Mulai',
};

id.nav = {
  ...id.nav,
  home: 'Beranda',
  features: 'Fitur',
  dashboard: 'Dasbor',
  settings: 'Pengaturan',
  logout: 'Keluar',
};

id.hero = {
  ...id.hero,
  title: 'Analisis Kebun Cerdas dengan AI',
  subtitle: 'Transformasikan kebun kelapa sawit Anda dengan analisis tanah dan daun berbasis AI',
  description: 'Unggah laporan laboratorium Anda dan dapatkan wawasan AI instan, rekomendasi, serta analisis tren untuk mengoptimalkan produktivitas kebun Anda.',
  cta: {
    ...id.hero?.cta,
    primary: 'Daftar Sekarang',
    secondary: 'Lihat Harga',
  },
};

id.pricing = {
  ...id.pricing,
  title: 'Pilih Paket Anda',
  subtitle: 'Harga transparan tanpa biaya tersembunyi',
  monthly: 'Bulanan',
  yearly: 'Tahunan',
  save: 'Hemat',
};

id.auth = {
  ...id.auth,
  login: {
    ...id.auth?.login,
    subtitle: 'Masuk ke akun CropDrive Anda',
    forgotPassword: 'Lupa kata sandi?',
    signIn: 'Masuk',
    noAccount: 'Belum punya akun?',
  },
  register: {
    ...id.auth?.register,
    title: 'Buat Akun',
    subtitle: 'Bergabunglah dengan ribuan petani yang menggunakan AI untuk hasil yang lebih baik',
    phone: 'Nomor Telepon',
    farmName: 'Nama Kebun',
    farmLocation: 'Lokasi Kebun',
    password: 'Kata Sandi',
    confirmPassword: 'Konfirmasi Kata Sandi',
    language: 'Bahasa Pilihan',
    signUp: 'Daftar',
    haveAccount: 'Sudah punya akun?',
    signIn: 'Masuk di sini',
  },
  forgotPassword: {
    ...id.auth?.forgotPassword,
    title: 'Atur Ulang Kata Sandi',
    subtitle: 'Masukkan email Anda untuk menerima tautan atur ulang kata sandi',
    sendResetLink: 'Kirim Tautan Atur Ulang',
    backToLogin: 'Kembali ke Masuk',
  },
};

id.dashboard = {
  ...id.dashboard,
  title: 'Dasbor',
  welcome: 'Selamat datang kembali',
  overview: 'Ringkasan',
  recentActivity: 'Aktivitas Terbaru',
  uploadAnalysis: 'Unggah & Analisis',
  history: 'Riwayat Analisis',
  subscription: 'Langganan',
  multiFarm: 'Manajemen Multi-Kebun',
  farms: 'Kebun',
  allFarms: 'Semua Kebun',
  addFarm: 'Tambah Kebun',
  farmDetails: 'Detail Kebun',
  farmName: 'Nama Kebun',
  location: 'Lokasi',
  size: 'Luas (hektare)',
};

export default id;