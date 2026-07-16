/* 
  ========================================================================
  GOOGLE APPS SCRIPT: SIMPAN DATA FORMULIR KE GOOGLE SHEETS
  ========================================================================
  
  URL GitHub Pages: https://eryrizalh.github.io/formulir-kipi/
  
  Cara Penggunaan:
  1. Buka Google Sheets baru.
  2. Klik Ekstensi -> Apps Script.
  3. Hapus kode bawaan, lalu salin seluruh kode di bawah ini.
  4. Klik tombol simpan (ikon disket).
  5. Klik tombol "Terapkan" (Deploy) -> "Terapkan Baru" (New Deployment).
  6. Pilih jenis penerapan: "Aplikasi Web" (Web App).
  7. Ubah pengaturan:
     - Jalankan sebagai: "Saya" (email Anda)
     - Siapa yang memiliki akses: "Siapa saja" (Anyone / Anyone, even anonymous)
  8. Klik Terapkan, beri izin akses jika diminta, lalu salin "URL Aplikasi Web" yang diberikan.
  9. Buka file `script.js` pada baris ke-201, paste URL tersebut ke variabel:
     const APPS_SCRIPT_URL = 'PASTE_URL_WEB_APP_DISINI';
*/

function doPost(e) {
  try {
    // Ponytail: check if executed manually from editor
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": "Manual run detected. Please submit via web form." }))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Jika sheet masih kosong, buat baris header otomatis
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Waktu Pengiriman", "Tanggal Laporan", "Tanggal Investigasi", "Nama Petugas", "Instansi", 
        "Nama Pemilik", "RT/RW", "Desa", "Kecamatan", "Provinsi", 
        "Jenis Sapi", "Sapi Perah Lainnya", "Sapi Potong Lainnya", "Umur Ternak", "Jenis Kelamin", 
        "Populasi", "Eartag Sapi Sakit", "Kategori Umur (Bulan)", "Tanggal Vaksinasi", "Merek Vaksin", 
        "No Batch Vaksin", "No Batch Pelarut", "Rantai Dingin", "Rentang Onset (Hari)", 
        "Gejala Umum", "Gejala Umum Lainnya", "Gejala Pencernaan", "Gejala Pencernaan Lainnya", 
        "Gejala Kulit", "Gejala Kulit Lainnya", "Status Akhir", "Tanggal Kematian", 
        "Diberikan Obat", "Obat 1", "Dosis 1", "Frekuensi 1", 
        "Obat 2", "Dosis 2", "Frekuensi 2", "Obat 3", "Dosis 3", "Frekuensi 3", 
        "Vitamin / Lainnya", "Pengobatan Lainnya", "Dosis Pengobatan Lain", "Frekuensi Pengobatan Lain",
        "Nekropsi", "Temuan Nekropsi", "Sampel yang Diambil", "Sampel Lainnya", "Kesimpulan & Rekomendasi"
      ];
      sheet.appendRow(headers);
      
      // Format header agar tebal
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f4f6");
    }
    
    // Gabungkan array checkbox jika ada multi-pilih menjadi string dipisahkan koma
    var formatVal = function(val) {
      if (Array.isArray(val)) return val.join(", ");
      return val || "";
    };
    
    // Susun data sesuai dengan urutan kolom header
    var rowData = [
      data._submitted_at || new Date().toISOString(),
      formatVal(data.tgl_laporan),
      formatVal(data.tgl_investigasi),
      formatVal(data.nama_petugas),
      formatVal(data.instansi),
      formatVal(data.nama_pemilik),
      formatVal(data.rt_rw),
      formatVal(data.desa),
      formatVal(data.kecamatan),
      formatVal(data.provinsi),
      formatVal(data.jenis_sapi),
      formatVal(data.perah_lainnya),
      formatVal(data.potong_lainnya),
      formatVal(data.umur_ternak),
      formatVal(data.jenis_kelamin),
      formatVal(data.populasi),
      formatVal(data.eartag),
      formatVal(data.kategori_umur),
      formatVal(data.tgl_vaksinasi),
      formatVal(data.nama_produk),
      formatVal(data.no_batch),
      formatVal(data.no_batch_diluent),
      formatVal(data.rantai_dingin),
      formatVal(data.rentang_onset),
      formatVal(data.gejala_umum),
      formatVal(data.gejala_umum_lainnya),
      formatVal(data.gejala_pencernaan),
      formatVal(data.gejala_pencernaan_lainnya),
      formatVal(data.gejala_kulit),
      formatVal(data.gejala_kulit_lainnya),
      formatVal(data.status_akhir),
      formatVal(data.tgl_kematian),
      formatVal(data.diberi_obat),
      formatVal(data.obat_nama_1),
      formatVal(data.obat_dosis_1),
      formatVal(data.obat_frekuensi_1),
      formatVal(data.obat_nama_2),
      formatVal(data.obat_dosis_2),
      formatVal(data.obat_frekuensi_2),
      formatVal(data.obat_nama_3),
      formatVal(data.obat_dosis_3),
      formatVal(data.obat_frekuensi_3),
      formatVal(data.vitamin_lain),
      formatVal(data.pengobatan_lain),
      formatVal(data.pengobatan_lain_dosis),
      formatVal(data.pengobatan_lain_frekuensi),
      formatVal(data.nekropsi),
      formatVal(data.temuan_nekropsi),
      formatVal(data.sampel),
      formatVal(data.sampel_lainnya),
      formatVal(data.kesimpulan)
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": e.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
