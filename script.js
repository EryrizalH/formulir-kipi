/* ============================================================
   KIPI Form — JavaScript
   Conditional logic, validation, local storage, and submission
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('kipiForm');

  // -------- Scroll progress bar --------
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  document.body.prepend(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  });

  // -------- Toggle "Lainnya" text inputs --------
  const otherPairs = [
    ['chk_perah_lain', 'perah_lainnya'],
    ['chk_potong_lain', 'potong_lainnya'],
    ['chk_gejala_umum_lain', 'gejala_umum_lainnya'],
    ['chk_gejala_cerna_lain', 'gejala_pencernaan_lainnya'],
    ['chk_gejala_kulit_lain', 'gejala_kulit_lainnya'],
    ['chk_sampel_lain', 'sampel_lainnya'],
  ];

  otherPairs.forEach(([chkId, inputId]) => {
    const chk = document.getElementById(chkId);
    const inp = document.getElementById(inputId);
    if (!chk || !inp) return;
    chk.addEventListener('change', () => {
      inp.disabled = !chk.checked;
      if (chk.checked) inp.focus();
      else inp.value = '';
    });
  });

  // -------- Conditional: Mati Mendadak -> Tanggal Kematian --------
  document.querySelectorAll('input[name="status_akhir"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const wrapper = document.getElementById('tgl_kematian_wrapper');
      wrapper.style.display = radio.value === 'Mati Mendadak' ? 'block' : 'none';
    });
  });

  // -------- Conditional: Diberi Obat -> Detail Obat --------
  document.querySelectorAll('input[name="diberi_obat"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.getElementById('obat-detail').style.display =
        document.getElementById('radio_obat_ya').checked ? 'block' : 'none';
    });
  });

  // -------- Conditional: Nekropsi -> Detail Nekropsi --------
  document.querySelectorAll('input[name="nekropsi"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.getElementById('nekropsi-detail').style.display =
        document.getElementById('radio_nekropsi_ya').checked ? 'block' : 'none';
    });
  });

  // -------- Clear form --------
  document.getElementById('btnClear').addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua jawaban?')) {
      form.reset();
      // hide conditional sections
      document.getElementById('tgl_kematian_wrapper').style.display = 'none';
      document.getElementById('obat-detail').style.display = 'none';
      document.getElementById('nekropsi-detail').style.display = 'none';
      // disable all "lainnya" inputs
      otherPairs.forEach(([, inputId]) => {
        const inp = document.getElementById(inputId);
        if (inp) { inp.disabled = true; inp.value = ''; }
      });
      // remove error states
      form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
      // clear local storage
      localStorage.removeItem('kipiFormData');
    }
  });

  // -------- Auto-save to localStorage --------
  const STORAGE_KEY = 'kipiFormData';

  function saveForm() {
    const data = {};
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        if (Array.isArray(data[key])) data[key].push(value);
        else data[key] = [data[key], value];
      } else {
        data[key] = value;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function loadForm() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      Object.entries(data).forEach(([key, value]) => {
        const elements = form.querySelectorAll(`[name="${key}"]`);
        if (!elements.length) return;

        const values = Array.isArray(value) ? value : [value];

        elements.forEach(el => {
          if (el.type === 'checkbox') {
            el.checked = values.includes(el.value);
            if (el.checked) el.dispatchEvent(new Event('change'));
          } else if (el.type === 'radio') {
            el.checked = values.includes(el.value);
            if (el.checked) el.dispatchEvent(new Event('change'));
          } else {
            el.value = values[0] || '';
          }
        });
      });
    } catch (e) {
      // Ignore parse errors
    }
  }

  loadForm();

  form.addEventListener('input', debounce(saveForm, 500));
  form.addEventListener('change', saveForm);

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  // -------- Validation & Submit --------
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear previous errors
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    let firstError = null;

    // Validate required fields
    form.querySelectorAll('[required]').forEach(el => {
      let valid = true;
      if (el.type === 'radio') {
        const name = el.name;
        valid = form.querySelector(`input[name="${name}"]:checked`) !== null;
        if (!valid && !firstError) {
          firstError = el.closest('.field-group') || el.closest('fieldset');
        }
      } else {
        valid = el.value.trim() !== '';
        if (!valid) {
          el.closest('.field-group')?.classList.add('error');
          if (!firstError) firstError = el.closest('.field-group');
        }
      }
    });

    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Show loading
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    document.getElementById('btnSubmit').disabled = true;

    // Collect form data
    const formData = new FormData(form);
    const submission = {};
    for (const [key, value] of formData.entries()) {
      if (submission[key]) {
        if (Array.isArray(submission[key])) submission[key].push(value);
        else submission[key] = [submission[key], value];
      } else {
        submission[key] = value;
      }
    }
    submission._submitted_at = new Date().toISOString();

    // Save submission to localStorage history
    const history = JSON.parse(localStorage.getItem('kipiSubmissions') || '[]');
    history.push(submission);
    localStorage.setItem('kipiSubmissions', JSON.stringify(history));

    // Optional: Send to Google Sheets via Web App URL
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/180YPGoyxdUT6O5OJp3_9EmLLgPtX47ZOYyi0xOHf-GgNBh0TjKwf-u0J/exec'; // Ponytail: update deployment url

    if (APPS_SCRIPT_URL) {
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submission)
      })
      .then(() => {
        handleSubmitSuccess();
      })
      .catch((err) => {
        console.error('Error submitting form:', err);
        alert('Gagal mengirim data ke server. Data tetap tersimpan di penyimpanan lokal browser Anda.');
        handleSubmitSuccess();
      });
    } else {
      // Simulate submit delay (fallback/local demo)
      setTimeout(() => {
        handleSubmitSuccess();
      }, 1200);
    }

    function handleSubmitSuccess() {
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
      document.getElementById('btnSubmit').disabled = false;

      // Clear form data from autosave
      localStorage.removeItem(STORAGE_KEY);

      // Show success modal
      document.getElementById('successModal').style.display = 'flex';
    }
  });

  // -------- Section intersection animation --------
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    },
    { threshold: 0.05 }
  );

  document.querySelectorAll('.form-section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(section);
  });
});

// -------- Close modal --------
function closeModal() {
  document.getElementById('successModal').style.display = 'none';
  document.getElementById('kipiForm').reset();
  // Reset conditional sections
  document.getElementById('tgl_kematian_wrapper').style.display = 'none';
  document.getElementById('obat-detail').style.display = 'none';
  document.getElementById('nekropsi-detail').style.display = 'none';
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
