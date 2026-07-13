"use client";

import { useEffect } from "react";

type WilayahData = {
    nama_wilayah: string | null;
    provinsi: string | null;
    kabupaten_kota: string | null;
    jenis_wk: string | null;
    tahun_beroperasi: string | null;
    luas_wilayah: string | null;
    deskripsi: string | null;
    produksi_minyak: string | null;
    produksi_gas: string | null;
    tanggal_produksi: string | null;
    nama_fasilitas: string | null;
    jenis_fasilitas: string | null;
    jumlah: string | null;
    sumur_eksplorasi_active: string | null;
    sumur_eksplorasi_total: string | null;
    producer_active: string | null;
    producer_total: string | null;
    injector_active: string | null;
    injector_total: string | null;
    sumur_total_active: string | null;
    sumur_total_total: string | null;
    process_facilities_active: string | null;
    process_facilities_total: string | null;
    offshore_platforms_active: string | null;
    offshore_platforms_total: string | null;
    swamp_platforms_active: string | null;
    swamp_platforms_total: string | null;
    gas_compressors_active: string | null;
    gas_compressors_total: string | null;
    pipeline_active: string | null;
    pipeline_total: string | null;
    drilling_rigs: string | null;
    workover_rigs: string | null;
};

const ContentOverview = () => {
    useEffect(() => {

        // Kunci wilayah kerja yang sedang aktif (panelnya sedang terbuka)
        let activeKey: string | null = null;
        
        const koordinatWilayah: Record<string, string> = {
            'nso': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1758828.4833084824!2d96.44592863870214!3d5.222246513227389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3047773ee34bcc15%3A0x96b7cedbe6bb0f8c!2sPT.%20Pertamina%20Hulu%20Energi%20NSO!5e1!3m2!1sen!2sus!4v1783928795832!5m2!1sen!2sus',
            'p-susu': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13762.458951983883!2d98.20356883627866!3d4.120297531596398!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x303713005aed9639%3A0x97cca8a709c3fa20!2sPERTAMINA%20EP%2C%20PANGKALAN%20SUSU%20FIELD!5e1!3m2!1sen!2sus!4v1783928920370!5m2!1sen!2sus',
            'rantau': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3439.6707214629782!2d98.1000643!3d4.3330432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3037750d48cd20cf%3A0x13efbf08c535d29!2sPertamina%20EP%20Field%20Rantau!5e1!3m2!1sen!2sus!4v1783929114862!5m2!1sen!2sus',
            'lirik': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3449.480307873737!2d102.3048558!3d-0.3088458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e2993197e715cbb%3A0xa92c4e90c6203965!2sPT%20Pertamina%20EP%20Aset%201%20Lirik%20Field!5e1!3m2!1sen!2sus!4v1783929183565!5m2!1sen!2sus',
            'jambi': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13792.382824592802!2d103.60006134957072!3d-1.6525543934590752!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e25864160705b6f%3A0x43c5df5c64bf7eb1!2sKantor%20PT%20Pertamina%20EP%20Asset%201%20Field%20Jambi!5e1!3m2!1sen!2sus!4v1783928615966!5m2!1sen!2sus',
            'jambi-merang': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d137663.30282475293!2d103.74048923451154!3d-2.0099324989736123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e2569a3b13978c5%3A0x6fa64a24f0a9976a!2sJetty%20Lalang%20Job%20Pertamina%20Talisman%20Jambi%20Merang!5e1!3m2!1sen!2sus!4v1783929340137!5m2!1sen!2sus',
        };

        const CARD_HIDDEN = ['opacity-0', '-translate-y-2', 'pointer-events-none'];
        const CARD_SHOWN = ['opacity-100', 'translate-y-0', 'pointer-events-auto'];

        // Kelas untuk pane peta (kiri) & pane detail (kanan) saat split-screen aktif
        const MAP_PANE_FULL = ['w-full'];
        const MAP_PANE_HALF = ['w-1/2'];
        const DETAIL_PANE_HIDDEN = ['w-0', 'opacity-0', 'pointer-events-none'];
        const DETAIL_PANE_SHOWN = ['w-1/2', 'opacity-100', 'pointer-events-auto'];

        // Aktifkan / nonaktifkan tampilan split-screen (peta kiri, card detail kanan)
        function toggleSplitView(active: boolean) {
            const mapPane = document.getElementById('map-pane');
            const detailPane = document.getElementById('detail-pane');
            const quickCards = document.getElementById('quick-cards-container');
            if (!mapPane || !detailPane) return;

            if (active) {
                mapPane.classList.remove(...MAP_PANE_FULL);
                mapPane.classList.add(...MAP_PANE_HALF);
                detailPane.classList.remove(...DETAIL_PANE_HIDDEN);
                detailPane.classList.add(...DETAIL_PANE_SHOWN);
                // Sembunyikan total container 3 card ringkas agar tidak lagi memakan ruang
                // (mencegah overflow/scrollbar bawaan muncul saat detail terbuka)
                quickCards?.classList.add('hidden');
            } else {
                mapPane.classList.remove(...MAP_PANE_HALF);
                mapPane.classList.add(...MAP_PANE_FULL);
                detailPane.classList.remove(...DETAIL_PANE_SHOWN);
                detailPane.classList.add(...DETAIL_PANE_HIDDEN);
                quickCards?.classList.remove('hidden');
            }
        }


        function openCards() {
        ['card-info', 'card-produksi', 'card-fasilitas'].forEach(id => {
            const el = document.getElementById(id);
            el?.classList.remove(...CARD_HIDDEN);
            el?.classList.add(...CARD_SHOWN);
        });
            // Pastikan setiap kali label baru diklik, kondisi kembali ke card ringkas (bukan detail)
            toggleSplitView(false);
            const overview = document.getElementById('card-geografis');
            overview?.classList.remove('opacity-100', 'pointer-events-auto');
            overview?.classList.add('opacity-0', 'pointer-events-none');
        }

        function closeCards() {
            ['card-info', 'card-produksi', 'card-fasilitas'].forEach(id => {
                const el = document.getElementById(id);
                el?.classList.remove(...CARD_SHOWN);
                el?.classList.add(...CARD_HIDDEN);
            });
            toggleSplitView(false);

            const overview = document.getElementById('card-geografis');
            overview?.classList.remove('opacity-0', 'pointer-events-none');
            overview?.classList.add('opacity-100', 'pointer-events-auto');
        }

        let activeProvinsi: string | null = null;

        function selectProvinsi(provinsiCode: string) {
            if (activeProvinsi) {
                document.querySelector(`.prov[data-p="${activeProvinsi}"]`)?.classList.remove('fill-green-600');
            }
            activeProvinsi = provinsiCode;
            document.querySelector(`.prov[data-p="${activeProvinsi}"]`)?.classList.add('fill-green-600');
        }

        function clearProvinsiSelection() {
            if (activeProvinsi) {
                document.querySelector(`.prov[data-p="${activeProvinsi}"]`)?.classList.remove('fill-green-600');
                activeProvinsi = null;
            }
        }

        function setActive(key: string, nama: string, provinsiCode: string) {
            activeKey = key;
            openCards();
            selectProvinsi(provinsiCode);
            loadWilayahKerja(key, nama);
        }

        function closePanel() {
            closeCards();
            clearProvinsiSelection();
            activeKey = null;
        }

        // Klik pada badge/label -> satu-satunya pemicu 3 card
        document.querySelectorAll<HTMLElement>('[data-badge-click]').forEach(span => {
            span.addEventListener('click', (e) => {
                e.stopPropagation();
                setActive(span.dataset.badgeClick!, span.dataset.namaClick!, span.dataset.provinsiClick!);
            });
        });

        document.getElementById('closeCardInfo')!.addEventListener('click', closePanel);

        function loadWilayahKerja(kode: string, namaWilayah: string) {
            const titleEl = document.getElementById('cardInfoTitle')!;
            const infoBody = document.getElementById('cardInfoBody')!;
            const produksiBody = document.getElementById('cardProduksiBody')!;
            const fasilitasBody = document.getElementById('cardFasilitasBody')!;

            titleEl.textContent = namaWilayah;

            let d: WilayahData = {
                nama_wilayah: null,
                provinsi: null,
                kabupaten_kota: null,
                jenis_wk: null,
                tahun_beroperasi: null,
                luas_wilayah: null,
                deskripsi: null,
                produksi_minyak: null,
                produksi_gas: null,
                tanggal_produksi: null,
                nama_fasilitas: null,
                jenis_fasilitas: null,
                jumlah: null,
                sumur_eksplorasi_active: null,
                sumur_eksplorasi_total: null,
                producer_active: null,
                producer_total: null,
                injector_active: null,
                injector_total: null,
                sumur_total_active: null,
                sumur_total_total: null,
                process_facilities_active: null,
                process_facilities_total: null,
                offshore_platforms_active: null,
                offshore_platforms_total: null,
                swamp_platforms_active: null,
                swamp_platforms_total: null,
                gas_compressors_active: null,
                gas_compressors_total: null,
                pipeline_active: null,
                pipeline_total: null,
                drilling_rigs: null,
                workover_rigs: null,
            };

            // DATASET
            if (kode === 'nso') {
                d = {
                    nama_wilayah: "North Sumatra Offshore (NSO)",
                    provinsi: "Aceh",
                    kabupaten_kota: "Aceh Utara",
                    jenis_wk: "GS",
                    tahun_beroperasi: "1999",
                    luas_wilayah: "1000 km²",
                    deskripsi: "Wilayah kerja di Aceh Utara, fokus pada produksi gas.",
                    produksi_minyak: "5000",
                    produksi_gas: "100",
                    tanggal_produksi: "2023-10-26",
                    nama_fasilitas: "Fasilitas NSO Utama",
                    jenis_fasilitas: "Produksi Gas",
                    jumlah: "1",
                    sumur_eksplorasi_active: "2",
                    sumur_eksplorasi_total: "5",
                    producer_active: "15",
                    producer_total: "20",
                    injector_active: "3",
                    injector_total: "5",
                    sumur_total_active: "20",
                    sumur_total_total: "30",
                    process_facilities_active: "1",
                    process_facilities_total: "1",
                    offshore_platforms_active: "2",
                    offshore_platforms_total: "3",
                    swamp_platforms_active: "0",
                    swamp_platforms_total: "0",
                    gas_compressors_active: "1",
                    gas_compressors_total: "1",
                    pipeline_active: "50",
                    pipeline_total: "60",
                    drilling_rigs: "1",
                    workover_rigs: "0",
                };
            } else if (kode === 'p-susu') {
                d = {
                    nama_wilayah: "Pangkalan Susu",
                    provinsi: "Sumatera Utara",
                    kabupaten_kota: "Langkat",
                    jenis_wk: "CR",
                    tahun_beroperasi: "1970",
                    luas_wilayah: "800 km²",
                    deskripsi: "Wilayah kerja di Langkat, Sumatera Utara, dengan fokus minyak.",
                    produksi_minyak: "3000",
                    produksi_gas: "50",
                    tanggal_produksi: "2023-10-26",
                    nama_fasilitas: "Pangkalan Susu Plant",
                    jenis_fasilitas: "Produksi Minyak",
                    jumlah: "1",
                    sumur_eksplorasi_active: "1",
                    sumur_eksplorasi_total: "3",
                    producer_active: "10",
                    producer_total: "18",
                    injector_active: "2",
                    injector_total: "4",
                    sumur_total_active: "13",
                    sumur_total_total: "25",
                    process_facilities_active: "1",
                    process_facilities_total: "1",
                    offshore_platforms_active: "0",
                    offshore_platforms_total: "0",
                    swamp_platforms_active: "1",
                    swamp_platforms_total: "1",
                    gas_compressors_active: "0",
                    gas_compressors_total: "0",
                    pipeline_active: "30",
                    pipeline_total: "40",
                    drilling_rigs: "0",
                    workover_rigs: "1",
                };
            } else if (kode === 'rantau') {
                d = {
                    nama_wilayah: "Rantau",
                    provinsi: "Sumatera Utara",
                    kabupaten_kota: "Aceh Tamiang",
                    jenis_wk: "CR",
                    tahun_beroperasi: "1928",
                    luas_wilayah: "1200 km²",
                    deskripsi: "Salah satu wilayah kerja tertua di Sumatera, produksi minyak dan gas.",
                    produksi_minyak: "7000",
                    produksi_gas: "80",
                    tanggal_produksi: "2023-10-26",
                    nama_fasilitas: "Rantau Field Station",
                    jenis_fasilitas: "Produksi Minyak & Gas",
                    jumlah: "2",
                    sumur_eksplorasi_active: "0",
                    sumur_eksplorasi_total: "2",
                    producer_active: "25",
                    producer_total: "35",
                    injector_active: "5",
                    injector_total: "7",
                    sumur_total_active: "30",
                    sumur_total_total: "44",
                    process_facilities_active: "2",
                    process_facilities_total: "2",
                    offshore_platforms_active: "0",
                    offshore_platforms_total: "0",
                    swamp_platforms_active: "0",
                    swamp_platforms_total: "0",
                    gas_compressors_active: "1",
                    gas_compressors_total: "1",
                    pipeline_active: "70",
                    pipeline_total: "85",
                    drilling_rigs: "1",
                    workover_rigs: "1",
                };
            } else if (kode === 'lirik') {
                d = {
                    nama_wilayah: "Lirik",
                    provinsi: "Riau",
                    kabupaten_kota: "Indragiri Hulu",
                    jenis_wk: "CR",
                    tahun_beroperasi: "1952",
                    luas_wilayah: "950 km²",
                    deskripsi: "Wilayah kerja di Indragiri Hulu, Riau, penghasil minyak.",
                    produksi_minyak: "4500",
                    produksi_gas: "60",
                    tanggal_produksi: "2023-10-26",
                    nama_fasilitas: "Lirik Central Processing Plant",
                    jenis_fasilitas: "Produksi Minyak",
                    jumlah: "1",
                    sumur_eksplorasi_active: "1",
                    sumur_eksplorasi_total: "4",
                    producer_active: "18",
                    producer_total: "25",
                    injector_active: "4",
                    injector_total: "6",
                    sumur_total_active: "23",
                    sumur_total_total: "35",
                    process_facilities_active: "1",
                    process_facilities_total: "1",
                    offshore_platforms_active: "0",
                    offshore_platforms_total: "0",
                    swamp_platforms_active: "0",
                    swamp_platforms_total: "0",
                    gas_compressors_active: "0",
                    gas_compressors_total: "0",
                    pipeline_active: "40",
                    pipeline_total: "55",
                    drilling_rigs: "0",
                    workover_rigs: "1",
                };
            } else if (kode === 'jambi') {
                d = {
                    nama_wilayah: "Jambi",
                    provinsi: "Jambi",
                    kabupaten_kota: "Muaro Jambi",
                    jenis_wk: "CR",
                    tahun_beroperasi: "1980",
                    luas_wilayah: "1100 km²",
                    deskripsi: "Wilayah kerja di Muaro Jambi, fokus pada gas.",
                    produksi_minyak: "2000",
                    produksi_gas: "120",
                    tanggal_produksi: "2023-10-26",
                    nama_fasilitas: "Jambi Gas Plant",
                    jenis_fasilitas: "Produksi Gas",
                    jumlah: "1",
                    sumur_eksplorasi_active: "3",
                    sumur_eksplorasi_total: "6",
                    producer_active: "12",
                    producer_total: "20",
                    injector_active: "1",
                    injector_total: "2",
                    sumur_total_active: "16",
                    sumur_total_total: "28",
                    process_facilities_active: "1",
                    process_facilities_total: "1",
                    offshore_platforms_active: "0",
                    offshore_platforms_total: "0",
                    swamp_platforms_active: "0",
                    swamp_platforms_total: "0",
                    gas_compressors_active: "1",
                    gas_compressors_total: "1",
                    pipeline_active: "60",
                    pipeline_total: "75",
                    drilling_rigs: "1",
                    workover_rigs: "0",
                };
            } else if (kode === 'jambi-merang') {
                d = {
                    nama_wilayah: "Jambi Merang",
                    provinsi: "Sumatera Selatan",
                    kabupaten_kota: "Musi Banyuasin",
                    jenis_wk: "GS",
                    tahun_beroperasi: "2008",
                    luas_wilayah: "1500 km²",
                    deskripsi: "Wilayah kerja di Musi Banyuasin, Sumatera Selatan, produksi gas dan kondensat.",
                    produksi_minyak: "1500",
                    produksi_gas: "150",
                    tanggal_produksi: "2023-10-26",
                    nama_fasilitas: "Jambi Merang CPF",
                    jenis_fasilitas: "Produksi Gas & Kondensat",
                    jumlah: "1",
                    sumur_eksplorasi_active: "2",
                    sumur_eksplorasi_total: "4",
                    producer_active: "8",
                    producer_total: "15",
                    injector_active: "0",
                    injector_total: "0",
                    sumur_total_active: "10",
                    sumur_total_total: "19",
                    process_facilities_active: "1",
                    process_facilities_total: "1",
                    offshore_platforms_active: "0",
                    offshore_platforms_total: "0",
                    swamp_platforms_active: "0",
                    swamp_platforms_total: "0",
                    gas_compressors_active: "1",
                    gas_compressors_total: "1",
                    pipeline_active: "80",
                    pipeline_total: "90",
                    drilling_rigs: "0",
                    workover_rigs: "0",
                };
            }

            lastData = d;
            lastNama = namaWilayah;

            // Card 1: info umum
            infoBody.innerHTML = `
                <p><span class="font-semibold">Nama Wilayah:</span> ${d.nama_wilayah ?? '-'}</p>
                <p><span class="font-semibold">Provinsi:</span> ${d.provinsi ?? '-'}</p>
                <p><span class="font-semibold">Kabupaten/Kota:</span> ${d.kabupaten_kota ?? '-'}</p>
                <p><span class="font-semibold">Jenis Wilayah Kerja:</span> ${d.jenis_wk ?? '-'}</p>
                <p><span class="font-semibold">Tahun Beroperasi:</span> ${d.tahun_beroperasi ?? '-'}</p>
                <p><span class="font-semibold">Luas Wilayah:</span> ${d.luas_wilayah ?? '-'}</p>
                <p><span class="font-semibold">Deskripsi:</span> ${d.deskripsi ?? '-'}</p>
              `;

            // Card 2: produksi saja
            produksiBody.innerHTML = `
                <p><span class="font-semibold">Produksi Minyak:</span> ${d.produksi_minyak ?? '-'}</p>
                <p><span class="font-semibold">Produksi Gas:</span> ${d.produksi_gas ?? '-'}</p>
                <p><span class="font-semibold">Tanggal Produksi:</span> ${d.tanggal_produksi ?? '-'}</p>
              `;

            // Card 3: fasilitas saja
            fasilitasBody.innerHTML = `
                <p><span class="font-semibold">Nama Fasilitas:</span> ${d.nama_fasilitas ?? '-'}</p>
                <p><span class="font-semibold">Jenis Fasilitas:</span> ${d.jenis_fasilitas ?? '-'}</p>
                <p><span class="font-semibold">Jumlah:</span> ${d.jumlah ?? '-'}</p>
              `;
        }

        // ============================================================
        // CARD DETAIL (sebelumnya modal, sekarang card biasa di kanan)
        // ============================================================
        let lastData: WilayahData | null = null;
        let lastNama = '';

        function openDetailCard(type: string) {
            if (!lastData) return;
            const d = lastData;
            const titleEl = document.getElementById('cardDetailTitle')!;
            const bodyEl = document.getElementById('cardDetailBody')!;

            titleEl.textContent = `${lastNama} — Detail Lengkap`;
            bodyEl.innerHTML = `
                  <p class="font-semibold text-blue-900">Info Umum</p>
                  <p><span class="font-semibold">Nama Wilayah:</span> ${d.nama_wilayah ?? '-'}</p>
                  <p><span class="font-semibold">Provinsi:</span> ${d.provinsi ?? '-'}</p>
                  <p><span class="font-semibold">Kabupaten/Kota:</span> ${d.kabupaten_kota ?? '-'}</p>
                  <p><span class="font-semibold">Jenis Wilayah Kerja:</span> ${d.jenis_wk ?? '-'}</p>
                  <p><span class="font-semibold">Tahun Beroperasi:</span> ${d.tahun_beroperasi ?? '-'}</p>
                  <p><span class="font-semibold">Luas Wilayah:</span> ${d.luas_wilayah ?? '-'}</p>
                  <p><span class="font-semibold">Deskripsi:</span> ${d.deskripsi ?? '-'}</p>
                  <hr class="my-3">
                  <p class="font-semibold text-blue-900">Produksi</p>
                  <p><span class="font-semibold">Tanggal Data:</span> ${d.tanggal_produksi ?? '-'}</p>
                  <p><span class="font-semibold">Produksi Minyak:</span> ${d.produksi_minyak ?? '-'} BOPD</p>
                  <p><span class="font-semibold">Produksi Gas:</span> ${d.produksi_gas ?? '-'} MMSCFD</p>
                  <hr class="my-3">
                  <p class="font-semibold text-blue-900">Fasilitas</p>
                  <p><span class="font-semibold">Nama Fasilitas:</span> ${d.nama_fasilitas ?? '-'}</p>
                  <p><span class="font-semibold">Jenis Fasilitas:</span> ${d.jenis_fasilitas ?? '-'}</p>
                  <p><span class="font-semibold">Jumlah:</span> ${d.jumlah ?? '-'}</p>
                  <hr class="my-3">

                  <p class="mb-2 font-semibold text-blue-900">Number of Assets</p>

                  <table class="mb-3 w-full overflow-hidden rounded-lg border border-slate-200 text-xs">
                    <thead>
                      <tr class="bg-blue-900 text-white">
                        <th class="px-2 py-1.5 text-left font-semibold">Wells</th>
                        <th class="w-16 px-2 py-1.5 text-center font-semibold">Active</th>
                        <th class="w-16 px-2 py-1.5 text-center font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="bg-white">
                        <td class="px-2 py-1">Exploration & Delineation</td>
                        <td class="px-2 py-1 text-center">${d.sumur_eksplorasi_active ?? '-'}</td>
                        <td class="px-2 py-1 text-center">${d.sumur_eksplorasi_total ?? '-'}</td>
                      </tr>
                      <tr class="bg-blue-50">
                        <td class="px-2 py-1">Producer</td>
                        <td class="px-2 py-1 text-center">${d.producer_active ?? '-'}</td>
                        <td class="px-2 py-1 text-center">${d.producer_total ?? '-'}</td>
                      </tr>
                      <tr class="bg-white">
                        <td class="px-2 py-1">Injector</td>
                        <td class="px-2 py-1 text-center">${d.injector_active ?? '-'}</td>
                        <td class="px-2 py-1 text-center">${d.injector_total ?? '-'}</td>
                      </tr>
                      <tr class="bg-blue-100 font-semibold">
                        <td class="px-2 py-1">Total</td>
                        <td class="px-2 py-1 text-center">${d.sumur_total_active ?? '-'}</td>
                        <td class="px-2 py-1 text-center">${d.sumur_total_total ?? '-'}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table class="mb-3 w-full overflow-hidden rounded-lg border border-slate-200 text-xs">
                    <thead>
                      <tr class="bg-blue-900 text-white">
                        <th class="px-2 py-1.5 text-left font-semibold">Surface Facilities</th>
                        <th class="w-16 px-2 py-1.5 text-center font-semibold">Active</th>
                        <th class="w-16 px-2 py-1.5 text-center font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="bg-white">
                        <td class="px-2 py-1">Process Facilities</td>
                        <td class="px-2 py-1 text-center">${d.process_facilities_active ?? '-'}</td>
                        <td class="px-2 py-1 text-center">${d.process_facilities_total ?? '-'}</td>
                      </tr>
                      <tr class="bg-blue-50">
                        <td class="px-2 py-1">Offshore Platforms</td>
                        <td class="px-2 py-1 text-center">${d.offshore_platforms_active ?? '-'}</td>
                        <td class="px-2 py-1 text-center">${d.offshore_platforms_total ?? '-'}</td>
                      </tr>
                      <tr class="bg-white">
                        <td class="px-2 py-1">Swamp Platforms</td>
                        <td class="px-2 py-1 text-center">${d.swamp_platforms_active ?? '-'}</td>
                        <td class="px-2 py-1 text-center">${d.swamp_platforms_total ?? '-'}</td>
                      </tr>
                      <tr class="bg-blue-50">
                        <td class="px-2 py-1">Gas Compressors</td>
                        <td class="px-2 py-1 text-center">${d.gas_compressors_active ?? '-'}</td>
                        <td class="px-2 py-1 text-center">${d.gas_compressors_total ?? '-'}</td>
                      </tr>
                      <tr class="bg-white">
                        <td class="px-2 py-1">Pipeline</td>
                        <td class="px-2 py-1 text-center">${d.pipeline_active ?? '-'}</td>
                        <td class="px-2 py-1 text-center">${d.pipeline_total ?? '-'}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="mb-3 grid grid-cols-2 gap-2">
                    <div class="rounded-lg border border-lime-200 bg-lime-50 p-2 text-xs">
                      <p class="font-semibold text-lime-800">Drilling Rigs</p>
                      <p>${d.drilling_rigs ?? '-'}</p>
                    </div>
                    <div class="rounded-lg border border-lime-200 bg-lime-50 p-2 text-xs">
                      <p class="font-semibold text-lime-800">Workover Rigs</p>
                      <p>${d.workover_rigs ?? '-'}</p>
                    </div>
                  </div>

                  <div class="mt-4 text-xs italic text-slate-400">
                    <p>Keterangan:</p>
                    <p>BOPD: Barrels of Oil Per Day</p>
                    <p>MMSCFD: Million Metric Standard Cubic Feet per Day</p>
                  </div>

                  <hr class="my-3">
                  <p class="mb-2 font-semibold text-blue-900">Open Google Maps</p>
                  <div id="satelliteMapContainer" class="overflow-hidden rounded-lg border border-slate-200"></div>
                `;

            const embedSrc = activeKey ? koordinatWilayah[activeKey] : undefined;
            const mapContainer = document.getElementById('satelliteMapContainer');
            if (embedSrc && mapContainer) {
                mapContainer.innerHTML = `
                    <iframe
                        width="100%"
                        height="220"
                        style="border:0"
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                        src="${embedSrc}">
                    </iframe>
                `;
            } else if (mapContainer) {
                mapContainer.innerHTML = '<p class="p-3 text-xs italic text-slate-400">Koordinat belum tersedia untuk wilayah ini.</p>';
            }

            // Sembunyikan 3 card ringkas, aktifkan split-screen (peta kiri, detail kanan)
            ['card-info', 'card-produksi', 'card-fasilitas'].forEach(id => {
                const el = document.getElementById(id);
                el?.classList.remove(...CARD_SHOWN);
                el?.classList.add(...CARD_HIDDEN);
            });
            toggleSplitView(true);
        }

        

        document.querySelectorAll<HTMLElement>('[data-detail]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openDetailCard(btn.dataset.detail!);
            });
        });


        document.getElementById('closeCardDetail')!.addEventListener('click', (e) => {
            e.stopPropagation();
            closePanel();
        });

        // ============================================================
        // KLIK DI LUAR PETA & CARD -> TUTUP SEMUA CARD (+ LABEL AKTIF)
        // ============================================================
        function handleDocumentClick(e: MouseEvent) {
            const clickedInsideCard = (e.target as HTMLElement)?.closest('#card-info, #card-produksi, #card-fasilitas, #card-detail');
            const clickedInsideStaticCard = (e.target as HTMLElement)?.closest('#card-geografis');

            if (!clickedInsideCard && !clickedInsideStaticCard) {
                closePanel();
            }
        }
        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };

    }, []);

    return (
        <>
            {/* Ini style css custom kalau mau pakai css custom*/}
            <style jsx>{`
                // .mapWrapper {
                //     background-color: #000000;
                //     border-radius: 12px;
                // }
                // .mapWrapper:hover {
                //     box-shadow: 0 0 10px rgba(0,0,0,0.2);
                // }
            `}</style>


            <div className="flex h-screen flex-col overflow-hidden bg-slate-100 p-6">
                 <h1 className="group relative z-10 mb-2 shrink-0 w-fit mx-auto cursor-default bg-linear-to-b from-blue-900 to-blue-500 bg-clip-text text-3xl text-center font-bold text-transparent transition-transform duration-300 ease-out hover:-translate-y-1">
                    Pertamina Hulu Rokan Zona 1
                 <span
                    aria-hidden="true"
                      className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-blue-900 to-blue-500 bg-clip-text text-transparent opacity-0 blur-sm transition-all duration-300 ease-out group-hover:opacity-30 group-hover:translate-y-2">
                    Pertamina Hulu Rokan Zona 1
                </span>
            </h1>
           
<span className="mb-4 shrink-0 text-md text-center text-blue-900">Peta Wilayah Kerja</span>

                {/* Wrapper peta: mengisi penuh sisa ruang (lebar & tinggi) */}
                <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-300 bg-white p-4 shadow-lg">
                    <div id="map-pane" className="relative h-full w-full transition-all duration-300 ease-in-out">
                    <svg id="map-svg" className="h-full w-full" viewBox="0 0 460 413" preserveAspectRatio="xMidYMid meet" role="img">
                        <title>Peta wilayah kerja Regional 1 Sumatra</title>
                        <desc>Enam wilayah kerja: Rantau, NSO, Pangkalan Susu, Lirik, Jambi, dan Jambi Merang</desc>

                        <path
                            className="prov cursor-pointer stroke-white stroke-[1px] transition-opacity duration-150 hover:opacity-[.85]"
                            fill="#003399" data-p="ID-RI" data-nama="Riau"
                            d="M 183.9,120.5 L 184.9,125.1 L 191.4,132.4 L 198.8,135.5 L 201.6,136.3 L 197.9,130.3 L 199.1,128.9 L 207.3,128.5 L 210.7,133.2 L 215.7,137.8 L 217.0,143.3 L 217.1,145.3 L 220.8,147.8 L 224.9,149.2 L 229.8,148.5 L 239.1,156.0 L 242.3,157.6 L 242.7,162.3 L 243.6,166.5 L 247.9,172.5 L 253.5,177.7 L 259.9,177.7 L 262.3,178.5 L 266.8,179.0 L 271.4,185.0 L 275.5,187.1 L 279.2,185.6 L 280.3,184.4 L 285.7,187.5 L 289.2,190.8 L 293.1,193.0 L 294.6,198.5 L 295.6,202.1 L 288.9,202.7 L 288.7,205.2 L 285.9,208.0 L 289.8,209.4 L 294.7,213.0 L 292.1,213.3 L 289.0,216.1 L 283.5,218.8 L 282.7,225.5 L 285.3,226.8 L 280.8,227.3 L 270.1,226.3 L 263.6,233.1 L 259.7,236.7 L 257.5,237.2 L 253.5,236.9 L 250.3,235.2 L 248.0,232.9 L 245.8,231.7 L 242.8,230.9 L 241.4,231.7 L 237.1,230.3 L 232.6,233.6 L 229.5,233.2 L 224.6,229.4 L 218.5,225.7 L 217.0,223.2 L 211.3,219.7 L 206.2,214.8 L 205.3,212.1 L 202.5,213.9 L 200.1,212.3 L 198.4,209.4 L 198.0,203.1 L 198.7,198.1 L 196.7,195.8 L 195.4,196.3 L 188.2,194.9 L 186.0,191.1 L 182.3,191.3 L 180.3,185.1 L 181.5,179.2 L 179.2,177.5 L 177.5,173.3 L 177.7,171.5 L 176.8,167.5 L 177.5,164.2 L 177.2,161.6 L 175.8,157.4 L 182.1,156.3 L 186.4,154.7 L 186.6,152.6 L 187.9,149.6 L 182.7,144.0 L 183.6,140.3 L 184.8,130.6 L 183.0,124.4 L 183.9,120.5 Z" />
                        <path
                            className="prov cursor-pointer stroke-white stroke-[1px] transition-opacity duration-150 hover:opacity-[.85]"
                            fill="#003399" data-p="ID-SU" data-nama="Sumatera Utara"
                            d="M 117.1,64.0 L 117.0,66.8 L 114.4,69.8 L 117.7,69.5 L 118.8,71.0 L 122.9,72.1 L 126.9,75.3 L 130.6,76.3 L 131.4,77.4 L 134.3,82.4 L 143.5,85.8 L 147.7,88.3 L 149.9,90.3 L 156.7,94.3 L 158.7,97.6 L 164.8,100.0 L 167.7,103.4 L 173.2,107.5 L 173.3,111.9 L 173.5,114.4 L 175.2,114.1 L 177.7,116.0 L 180.4,115.0 L 183.9,120.5 L 183.0,124.4 L 184.8,130.6 L 183.6,140.3 L 182.7,144.0 L 186.4,144.8 L 186.6,152.6 L 186.4,154.7 L 182.1,156.3 L 181.1,157.2 L 176.0,159.0 L 177.5,164.2 L 176.8,167.5 L 178.4,169.9 L 176.2,172.6 L 177.8,176.4 L 175.9,176.5 L 171.9,173.9 L 168.0,173.4 L 168.3,179.9 L 170.7,182.5 L 172.1,184.2 L 167.6,187.2 L 164.1,187.4 L 162.7,186.5 L 160.0,185.4 L 154.2,186.1 L 150.6,191.2 L 148.7,191.5 L 146.0,192.1 L 145.4,188.0 L 143.4,181.8 L 142.9,178.6 L 140.8,175.5 L 138.7,168.5 L 135.9,160.6 L 136.1,159.1 L 133.4,152.8 L 136.0,149.6 L 134.6,147.8 L 133.7,145.4 L 130.8,146.0 L 125.0,139.6 L 121.4,137.4 L 119.8,136.2 L 116.1,134.6 L 114.9,127.4 L 112.5,124.0 L 112.4,122.5 L 111.3,119.2 L 112.9,116.6 L 111.7,111.2 L 110.3,111.0 L 107.4,108.7 L 107.0,103.2 L 108.2,101.4 L 107.1,100.2 L 104.8,97.5 L 109.9,94.9 L 107.3,92.9 L 105.9,87.7 L 103.9,84.2 L 106.0,79.1 L 107.1,76.6 L 107.6,75.6 L 110.8,67.2 L 113.6,64.1 L 117.1,64.0 Z" />
                        <path
                            className="prov cursor-pointer stroke-white stroke-[1px] transition-opacity duration-150 hover:opacity-[.85]"
                            fill="#003399" data-p="ID-SB" data-nama="Sumatera Barat"
                            d="M 146.3,194.6 L 148.7,191.5 L 150.6,191.2 L 154.2,186.1 L 157.2,184.7 L 161.7,184.4 L 162.7,186.5 L 165.7,186.5 L 167.6,187.2 L 170.3,186.7 L 170.7,182.5 L 170.5,180.1 L 168.3,175.0 L 168.0,173.4 L 171.9,173.9 L 175.9,176.5 L 179.2,177.5 L 179.9,182.9 L 180.3,185.1 L 182.3,191.3 L 184.9,190.6 L 187.3,194.0 L 188.2,194.9 L 192.7,196.1 L 196.7,195.8 L 198.3,196.6 L 197.5,200.5 L 198.0,203.1 L 198.4,209.4 L 200.2,211.4 L 200.1,212.3 L 203.5,212.1 L 205.3,212.1 L 206.2,214.8 L 207.6,218.0 L 213.7,222.2 L 217.0,223.2 L 221.5,228.0 L 224.6,229.4 L 226.5,232.1 L 231.9,233.5 L 232.1,237.5 L 233.1,239.3 L 231.7,240.9 L 227.6,243.7 L 228.6,245.3 L 227.7,247.0 L 227.8,249.7 L 223.7,252.6 L 221.3,256.1 L 219.3,256.6 L 215.7,256.5 L 213.7,256.5 L 212.4,257.2 L 209.5,256.0 L 209.4,259.4 L 211.7,266.0 L 213.3,267.1 L 215.3,274.1 L 214.9,275.4 L 213.3,277.5 L 206.3,281.9 L 205.2,280.3 L 201.5,274.3 L 200.0,272.4 L 201.2,269.7 L 201.7,267.7 L 198.4,260.6 L 195.3,255.5 L 193.9,254.1 L 191.1,247.2 L 191.8,246.3 L 189.1,243.8 L 188.0,242.6 L 186.7,240.6 L 185.6,239.9 L 186.5,235.4 L 184.3,230.4 L 181.9,227.2 L 175.9,219.7 L 172.3,216.3 L 169.6,213.3 L 167.5,211.9 L 167.0,209.9 L 165.7,204.1 L 164.7,202.9 L 156.3,197.7 L 153.8,197.1 L 151.1,194.3 L 149.2,195.2 L 146.3,194.6 Z" />
                        <path
                            className="prov cursor-pointer stroke-white stroke-[1px] transition-opacity duration-150 hover:opacity-[.85]"
                            fill="#003399" data-p="ID-SS" data-nama="Sumatera Selatan"
                            d="M 359.4,334.5 L 356.8,333.9 L 353.7,328.8 L 348.0,325.1 L 345.5,324.1 L 343.5,325.6 L 340.6,327.2 L 337.8,330.7 L 336.2,334.6 L 328.2,338.5 L 325.7,338.8 L 323.0,338.8 L 312.6,344.4 L 312.7,350.4 L 312.4,356.7 L 313.1,357.2 L 313.2,358.2 L 311.9,359.2 L 307.1,360.4 L 302.6,359.8 L 300.5,359.8 L 297.6,360.3 L 296.3,356.5 L 294.3,354.6 L 292.1,351.7 L 288.8,347.6 L 285.1,348.9 L 283.6,343.8 L 280.4,340.1 L 276.2,338.7 L 273.9,331.5 L 267.0,329.8 L 261.6,327.3 L 258.1,324.7 L 261.3,321.1 L 263.7,318.1 L 264.9,315.8 L 269.2,315.5 L 269.4,310.5 L 263.9,309.3 L 261.5,308.7 L 256.8,309.3 L 253.4,306.4 L 250.2,300.0 L 245.6,299.4 L 241.9,294.5 L 239.9,291.5 L 241.6,289.8 L 246.6,286.2 L 250.1,287.2 L 254.3,288.2 L 258.2,286.0 L 263.1,282.6 L 264.6,277.9 L 269.3,277.3 L 273.8,277.9 L 276.0,274.6 L 278.6,271.3 L 282.4,275.9 L 284.8,274.4 L 284.4,272.1 L 287.5,268.0 L 284.0,263.6 L 289.0,260.4 L 297.6,260.1 L 301.3,260.2 L 310.7,258.1 L 313.3,258.1 L 318.5,256.0 L 319.2,259.8 L 318.7,264.0 L 322.9,263.6 L 329.2,266.6 L 331.2,271.1 L 329.4,275.6 L 334.1,277.2 L 341.5,277.1 L 351.2,279.1 L 353.9,278.9 L 354.5,287.1 L 358.5,288.5 L 360.2,295.8 L 366.5,297.4 L 368.1,300.9 L 368.8,306.6 L 363.5,310.9 L 360.7,321.5 L 364.9,325.9 L 360.6,336.1 L 360.3,335.6 L 359.4,334.5 Z" />
                        <path
                            className="prov cursor-pointer stroke-white stroke-[1px] transition-opacity duration-150 hover:opacity-[.85]"
                            fill="#003399" data-p="ID-JA" data-nama="Jambi"
                            d="M 214.9,275.4 L 215.3,274.1 L 213.3,267.1 L 211.7,266.0 L 209.4,259.4 L 209.5,256.0 L 212.4,257.2 L 213.7,256.5 L 218.8,255.8 L 219.3,256.6 L 222.4,254.0 L 223.7,252.6 L 228.6,247.7 L 227.7,247.0 L 227.6,243.7 L 228.3,241.8 L 233.1,239.3 L 233.7,237.7 L 231.9,233.5 L 232.6,233.6 L 237.1,230.3 L 239.5,230.7 L 242.8,230.9 L 245.8,231.7 L 247.4,231.5 L 250.0,234.0 L 250.3,235.2 L 253.5,236.9 L 257.5,237.2 L 259.7,236.7 L 262.7,235.0 L 266.7,230.8 L 270.1,226.3 L 280.8,227.3 L 285.3,226.8 L 287.3,228.2 L 287.5,229.6 L 291.3,232.7 L 292.8,232.8 L 297.8,234.2 L 299.4,233.8 L 306.1,235.8 L 308.7,236.5 L 312.8,235.6 L 313.9,234.9 L 314.9,241.6 L 316.9,247.1 L 316.3,249.3 L 318.5,256.0 L 315.4,254.4 L 313.3,258.1 L 311.6,259.1 L 305.5,259.5 L 304.3,260.1 L 299.6,258.3 L 297.6,260.1 L 289.0,260.4 L 287.6,262.9 L 284.0,263.6 L 287.9,266.4 L 286.3,269.1 L 286.7,271.7 L 284.0,273.2 L 284.8,274.4 L 283.0,277.1 L 282.4,275.9 L 278.6,271.3 L 276.8,271.9 L 276.0,274.6 L 273.8,277.9 L 271.5,276.4 L 269.3,277.3 L 265.9,276.2 L 265.8,279.5 L 263.1,282.6 L 261.3,285.0 L 258.2,286.0 L 254.3,288.2 L 253.4,289.0 L 250.1,287.2 L 248.3,287.5 L 245.7,286.7 L 245.2,288.5 L 239.8,291.0 L 237.3,289.6 L 233.4,289.8 L 229.0,285.9 L 224.8,283.7 L 223.0,284.4 L 216.1,276.3 L 214.9,275.4 Z" />
                        <path
                            className="prov cursor-pointer stroke-white stroke-[1px] transition-opacity duration-150 hover:opacity-[.85]"
                            fill="#003399" data-p="ID-LA" data-nama="Lampung"
                            d="M 294.8,356.3 L 294.8,356.3 L 297.6,358.0 L 297.6,360.3 L 300.5,359.8 L 300.5,359.8 L 302.6,359.8 L 303.9,359.5 L 307.1,360.4 L 308.1,358.6 L 312.0,359.2 L 313.2,358.2 L 313.2,357.2 L 313.1,357.2 L 312.4,356.7 L 311.7,355.3 L 312.7,350.4 L 312.0,347.5 L 316.4,340.3 L 321.3,338.2 L 325.6,338.8 L 325.7,338.8 L 328.2,338.5 L 334.5,336.3 L 336.2,334.6 L 337.8,330.7 L 338.4,330.4 L 340.6,327.2 L 342.0,327.8 L 343.2,324.2 L 345.1,322.0 L 347.5,323.5 L 348.0,325.1 L 350.6,326.6 L 353.7,328.8 L 356.8,333.9 L 357.8,335.3 L 359.6,334.5 L 360.3,335.6 L 360.6,336.1 L 360.4,340.9 L 363.0,345.7 L 363.2,348.2 L 363.5,351.5 L 362.4,353.1 L 362.1,358.9 L 362.0,362.4 L 361.7,365.4 L 360.5,373.7 L 360.6,382.0 L 359.5,386.1 L 359.6,388.2 L 357.0,390.5 L 353.6,389.6 L 353.0,386.8 L 351.9,385.3 L 346.0,380.6 L 343.5,377.2 L 342.7,379.5 L 342.0,381.8 L 339.9,384.4 L 340.4,385.6 L 340.1,388.8 L 338.9,389.0 L 331.8,385.3 L 328.5,382.9 L 324.8,379.7 L 321.1,378.9 L 320.3,382.5 L 322.7,387.0 L 324.8,390.1 L 325.2,392.9 L 321.0,393.1 L 316.5,387.5 L 315.2,385.6 L 312.2,382.5 L 311.5,381.4 L 305.8,377.6 L 301.9,373.3 L 298.9,369.6 L 299.8,368.4 L 297.6,366.4 L 296.7,365.0 L 292.8,361.9 L 290.9,361.4 L 289.2,359.5 L 291.0,358.4 L 292.9,356.5 L 293.8,356.4 L 294.7,356.4 L 294.8,356.3 Z" />
                        <path
                            className="prov cursor-pointer stroke-white stroke-[1px] transition-opacity duration-150 hover:opacity-[.85]"
                            fill="#003399" data-p="ID-BE" data-nama="Bengkulu"
                            d="M 294.8,356.3 L 294.8,356.3 L 294.7,356.4 L 294.6,356.6 L 292.9,356.5 L 291.1,358.3 L 291.0,358.4 L 289.2,359.5 L 287.0,360.1 L 285.9,358.9 L 283.6,358.8 L 282.7,357.0 L 278.7,353.4 L 277.6,352.4 L 273.4,349.3 L 271.1,348.1 L 266.0,344.9 L 263.1,342.1 L 259.9,339.5 L 248.8,331.3 L 247.5,327.5 L 247.3,325.6 L 245.8,324.2 L 246.2,323.1 L 240.4,316.3 L 235.5,313.9 L 234.4,312.2 L 231.2,310.5 L 222.3,302.2 L 221.1,299.3 L 218.5,296.2 L 215.9,290.1 L 210.4,286.9 L 206.3,281.9 L 210.4,278.9 L 213.3,277.5 L 216.1,276.3 L 223.4,280.9 L 223.0,284.4 L 224.8,283.7 L 229.0,285.9 L 233.4,289.8 L 234.9,290.1 L 237.3,289.6 L 239.9,291.5 L 239.9,291.5 L 241.7,293.2 L 244.8,296.3 L 245.6,299.4 L 248.0,300.7 L 250.2,300.0 L 253.2,302.0 L 253.4,306.4 L 254.1,307.4 L 256.8,309.3 L 259.7,308.8 L 261.5,308.7 L 262.5,307.6 L 263.9,309.3 L 266.2,310.6 L 269.4,310.5 L 269.7,313.6 L 269.2,315.5 L 267.3,317.6 L 264.9,315.8 L 263.8,315.7 L 263.7,318.1 L 261.3,321.1 L 261.0,322.7 L 258.7,323.4 L 258.1,324.7 L 261.6,327.3 L 263.1,329.3 L 266.1,330.4 L 267.0,329.8 L 273.9,331.5 L 274.8,334.3 L 275.8,336.0 L 276.2,338.7 L 280.4,340.1 L 284.4,341.4 L 284.9,341.9 L 283.6,343.8 L 285.1,348.9 L 286.5,349.2 L 288.8,347.6 L 290.1,348.6 L 292.1,351.7 L 292.5,353.2 L 294.3,354.6 L 294.8,356.3 Z" />
                        <path
                            className="prov cursor-pointer stroke-white stroke-[1px] transition-opacity duration-150 hover:opacity-[.85]"
                            fill="#003399" data-p="ID-AC" data-nama="Aceh"
                            d="M 117.1,64.0 L 113.6,64.1 L 111.8,67.0 L 109.7,74.3 L 107.6,75.6 L 105.7,76.8 L 106.0,79.1 L 103.9,84.2 L 104.7,87.1 L 107.3,92.9 L 109.0,93.6 L 108.4,96.6 L 104.8,97.5 L 106.5,98.2 L 108.2,101.4 L 108.4,102.8 L 107.6,106.7 L 107.4,108.7 L 110.3,111.0 L 111.7,111.2 L 112.9,116.6 L 111.6,117.3 L 111.6,121.3 L 112.4,122.5 L 112.5,124.0 L 114.9,127.4 L 113.8,133.0 L 107.3,129.0 L 104.0,129.7 L 102.0,130.1 L 98.0,124.7 L 96.5,110.9 L 95.4,109.0 L 92.5,108.0 L 91.1,107.9 L 89.3,106.6 L 85.3,98.7 L 83.0,97.2 L 80.7,94.3 L 79.5,92.8 L 73.7,86.2 L 72.4,83.2 L 66.1,81.5 L 61.5,81.9 L 56.1,77.0 L 53.8,73.6 L 51.3,70.5 L 48.6,69.0 L 46.3,66.7 L 40.8,61.7 L 38.3,59.4 L 31.5,53.2 L 30.1,52.3 L 28.2,49.2 L 26.0,47.0 L 22.0,37.4 L 22.3,35.9 L 21.0,34.8 L 20.5,29.3 L 20.2,26.3 L 20.0,23.2 L 21.0,23.4 L 23.9,21.9 L 26.6,20.0 L 31.9,20.9 L 34.4,22.3 L 41.0,25.1 L 41.5,26.9 L 42.8,28.2 L 47.3,31.9 L 50.6,32.8 L 57.2,34.4 L 59.4,33.6 L 65.0,34.4 L 67.6,33.4 L 73.9,33.1 L 77.1,32.8 L 81.8,36.4 L 82.9,36.6 L 90.5,34.0 L 94.5,34.3 L 95.3,35.7 L 103.2,43.7 L 105.7,44.8 L 107.6,51.7 L 109.3,53.5 L 108.7,56.3 L 111.7,56.5 L 118.1,59.9 L 118.0,62.1 L 117.1,64.0 Z" />

                        {/* ============================================================
                 NAMA PROVINSI — statis, selalu tampil, tidak interaktif
                 ============================================================ */}
                        <text
                            className="pointer-events-none select-none fill-white text-[9px] font-semibold [paint-order:stroke] stroke-[rgba(0,0,0,0.35)] stroke-[2px] [text-anchor:middle]"
                            x="75" y="60">Aceh</text>
                        <text
                            className="pointer-events-none select-none fill-white text-[9px] font-semibold [paint-order:stroke] stroke-[rgba(0,0,0,0.35)] stroke-[2px] [text-anchor:middle]"
                            x="150" y="128">Sumatera Utara</text>
                        <text
                            className="pointer-events-none select-none fill-white text-[9px] font-semibold [paint-order:stroke] stroke-[rgba(0,0,0,0.35)] stroke-[2px] [text-anchor:middle]"
                            x="191" y="222">Sumatera Barat</text>
                        <text
                            className="pointer-events-none select-none fill-white text-[9px] font-semibold [paint-order:stroke] stroke-[rgba(0,0,0,0.35)] stroke-[2px] [text-anchor:middle]"
                            x="230" y="195">Riau</text>
                        <text
                            className="pointer-events-none select-none fill-white text-[9px] font-semibold [paint-order:stroke] stroke-[rgba(0,0,0,0.35)] stroke-[2px] [text-anchor:middle]"
                            x="255" y="255">Jambi</text>
                        <text
                            className="pointer-events-none select-none fill-white text-[9px] font-semibold [paint-order:stroke] stroke-[rgba(0,0,0,0.35)] stroke-[2px] [text-anchor:middle]"
                            x="255" y="327">Bengkulu</text>
                        <text
                            className="pointer-events-none select-none fill-white text-[9px] font-semibold [paint-order:stroke] stroke-[rgba(0,0,0,0.35)] stroke-[2px] [text-anchor:middle]"
                            x="310" y="305">Sumatera Selatan</text>
                        <text
                            className="pointer-events-none select-none fill-white text-[9px] font-semibold [paint-order:stroke] stroke-[rgba(0,0,0,0.35)] stroke-[2px] [text-anchor:middle]"
                            x="337" y="360">Lampung</text>

                        {/* ============================================================
                 6 WILAYAH KERJA — titik + garis + badge (muncul saat hover)
                 ============================================================ */}
                        <line
                            className="pointer-events-none stroke-[1.2px] stroke-slate-800 opacity-100"
                            data-line="nso" x1="93" y1="25" x2="150" y2="10" />
                        <line
                            className="pointer-events-none stroke-[1.2px] stroke-slate-800 opacity-100"
                            data-line="p-susu" x1="125" y1="85" x2="215" y2="85" />
                        <line
                            className="pointer-events-none stroke-[1.2px] stroke-slate-800 opacity-100"
                            data-line="rantau" x1="110" y1="73" x2="158" y2="50" />
                        <line
                            className="pointer-events-none stroke-[1.2px] stroke-slate-800 opacity-100"
                            data-line="lirik" x1="250" y1="210" x2="315" y2="170" />
                        <line
                            className="pointer-events-none stroke-[1.2px] stroke-slate-800 opacity-100"
                            data-line="jambi" x1="282" y1="250" x2="345" y2="210" />
                        <line
                            className="pointer-events-none stroke-[1.2px] stroke-slate-800 opacity-100"
                            data-line="jambi-merang" x1="299" y1="277" x2="395" y2="245" />

                        <circle className="pointer-events-none fill-amber-500" data-dot="nso" data-nama="NSO" data-provinsi="ID-AC"
                            cx="93" cy="25" r="2.8" />
                        <circle className="pointer-events-none fill-amber-500" data-dot="p-susu" data-nama="Pangkalan Susu"
                            data-provinsi="ID-SU" cx="125" cy="85" r="2.8" />
                        <circle className="pointer-events-none fill-amber-500" data-dot="rantau" data-nama="Rantau"
                            data-provinsi="ID-SU" cx="110" cy="73" r="2.8" />
                        <circle className="pointer-events-none fill-amber-500" data-dot="lirik" data-nama="Lirik" data-provinsi="ID-RI"
                            cx="250" cy="210" r="2.8" />
                        <circle className="pointer-events-none fill-amber-500" data-dot="jambi" data-nama="Jambi" data-provinsi="ID-JA"
                            cx="282" cy="250" r="2.8" />
                        <circle className="pointer-events-none fill-amber-500" data-dot="jambi-merang" data-nama="Jambi Merang"
                            data-provinsi="ID-SS" cx="299" cy="277" r="2.8" />

                        <foreignObject
                            className="pointer-events-auto overflow-visible opacity-100 transition-opacity duration-150 ease-in-out"
                            data-badge="nso" x="102" y="-1" width="96" height="24">
                            <div className="text-center">
                                <span
                                    className="inline-block cursor-pointer whitespace-nowrap rounded-full bg-blue-900 px-2.5 py-0.75 text-[10.5px] font-semibold text-white shadow-md hover:bg-blue-800"
                                    data-badge-click="nso" data-nama-click="NSO" data-provinsi-click="ID-AC">NSO</span>
                            </div>
                        </foreignObject>
                        <foreignObject
                            className="pointer-events-auto overflow-visible opacity-100 transition-opacity duration-150 ease-in-out"
                            data-badge="p-susu" x="170" y="71" width="96" height="24">
                            <div className="text-center">
                                <span
                                    className="inline-block cursor-pointer whitespace-nowrap rounded-full bg-blue-900 px-2.5 py-0.75 text-[10.5px] font-semibold text-white shadow-md hover:bg-blue-800"
                                    data-badge-click="p-susu" data-nama-click="Pangkalan Susu" data-provinsi-click="ID-SU">Pangkalan
                                    Susu</span>
                            </div>
                        </foreignObject>
                        <foreignObject
                            className="pointer-events-auto overflow-visible opacity-100 transition-opacity duration-150 ease-in-out"
                            data-badge="rantau" x="130" y="35" width="96" height="24">
                            <div className="text-center">
                                <span
                                    className="inline-block cursor-pointer whitespace-nowrap rounded-full bg-blue-900 px-2.5 py-0.75 text-[10.5px] font-semibold text-white shadow-md hover:bg-blue-800"
                                    data-badge-click="rantau" data-nama-click="Rantau" data-provinsi-click="ID-SU">Rantau</span>
                            </div>
                        </foreignObject>
                        <foreignObject
                            className="pointer-events-auto overflow-visible opacity-100 transition-opacity duration-150 ease-in-out"
                            data-badge="lirik" x="267" y="159" width="96" height="24">
                            <div className="text-center">
                                <span
                                    className="inline-block cursor-pointer whitespace-nowrap rounded-full bg-blue-900 px-2.5 py-0.75 text-[10.5px] font-semibold text-white shadow-md hover:bg-blue-800"
                                    data-badge-click="lirik" data-nama-click="Lirik" data-provinsi-click="ID-RI">Lirik</span>
                            </div>
                        </foreignObject>
                        <foreignObject
                            className="pointer-events-auto overflow-visible opacity-100 transition-opacity duration-150 ease-in-out"
                            data-badge="jambi" x="297" y="204" width="96" height="24">
                            <div className="text-center">
                                <span
                                    className="inline-block cursor-pointer whitespace-nowrap rounded-full bg-blue-900 px-2.5 py-0.75 text-[10.5px] font-semibold text-white shadow-md hover:bg-blue-800"
                                    data-badge-click="jambi" data-nama-click="Jambi" data-provinsi-click="ID-JA">Jambi</span>
                            </div>
                        </foreignObject>
                        <foreignObject
                            className="pointer-events-auto overflow-visible opacity-100 transition-opacity duration-150 ease-in-out"
                            data-badge="jambi-merang" x="347" y="239" width="96" height="24">
                            <div className="text-center">
                                <span
                                    className="inline-block cursor-pointer whitespace-nowrap rounded-full bg-blue-900 px-2.5 py-0.75 text-[10.5px] font-semibold text-white shadow-md hover:bg-blue-800"
                                    data-badge-click="jambi-merang" data-nama-click="Jambi Merang" data-provinsi-click="ID-SS">Jambi
                                    Merang</span>
                            </div>
                        </foreignObject>
                    </svg>

                    {/* CARD GEOGRAFIS: statis di kiri, selalu tampil, tanpa tombol tutup */}
                    <div id="card-geografis"
                        className="absolute bottom-6 left-6 top-6 w-70 overflow-y-auto rounded-xl border border-slate-200 bg-white px-5 py-4.5 shadow-lg opacity-100 pointer-events-auto transition-opacity duration-200 ease-in-out">
                        <h2 className="mb-3 text-base font-bold text-blue-900">Overview Zona 1</h2>
                        <div className="space-y-2 text-xs text-slate-700">
                            <p><span className="font-bold underline">Cakupan Lokasi</span></p>
                            <p className="font-semibold">5 Provinsi, 14 Kabupaten/Kota</p>
                            <ul className="list-outside list-disc pl-4">
                                <li><span className="font-normal">NAD:</span> 1 Kabupaten</li>
                                <li><span className="font-normal">Sumatera Utara:</span> 4 Kabupaten/Kota</li>
                                <li><span className="font-normal">Riau:</span> 3 Kabupaten</li>
                                <li><span className="font-normal">Jambi:</span> 5 Kabupaten/Kota</li>
                                <li><span className="font-normal">Sumatera Selatan:</span> 1 Kabupaten</li>
                            </ul>
                            <div className="h-2"></div>
                            <p><span className="font-bold underline">Wilayah Kerja</span></p>
                            <p><span className="font-semibold">WK Operator</span></p>
                            <ul className="list-outside list-disc pl-4">
                                <li><span className="font-normal">PHE Jambi Merang (GS)</span></li>
                                <li><span className="font-normal">PHE NSO (GS)</span></li>
                                <li><span className="font-normal">PEP ASSET 1 (Sumut: Field Rantau, dan P.Susu, Riau: Lirik) (CR)</span>
                                </li>
                                <li><span className="font-normal">KSO SEBWP Meruap (CR)</span></li>
                                <li><span className="font-normal">KSO Tamiang Raya Energy (CR)</span></li>
                            </ul>
                            <p><span className="font-semibold">WK Non-Operator</span></p>
                            <ul className="list-outside list-disc pl-4">

                                <li><span className="font-normal">JABUNG (CR)</span></li>
                                <li><span className="font-normal">KAKAP (CR)</span></li>
                            </ul>
                        </div>
                    </div>

                    <div id="quick-cards-container" className="absolute right-6 top-6 flex max-h-[calc(100%-48px)] w-75 flex-col gap-2 overflow-y-auto">

                        {/* CARD 1: Informasi umum wilayah kerja */}
                        <div id="card-info"
                            className="relative -translate-y-2 rounded-xl border border-slate-200 bg-white p-4 opacity-0 pointer-events-none transition-all duration-200 ease-in-out">
                            <button type="button"
                                className="absolute right-3 top-2 cursor-pointer border-none bg-transparent text-[17px] leading-none text-slate-400 hover:text-slate-600"
                                id="closeCardInfo">&times;</button>
                            <h2 id="cardInfoTitle" className="mb-2 pr-4 text-base font-bold text-blue-900">-</h2>
                            <div id="cardInfoBody" className="space-y-1 text-xs text-slate-700"></div>
                            <button type="button"
                                className="ml-auto mt-2.5 block cursor-pointer rounded-full border-none bg-blue-900 px-3.5 py-1.25 text-xs font-semibold text-white hover:bg-blue-800"
                                data-detail="all">Detail</button>
                        </div>

                        {/* CARD 2: Produksi */}
                        <div id="card-produksi"
                            className="relative -translate-y-2 rounded-xl border border-slate-200 bg-white p-4 opacity-0 pointer-events-none transition-all duration-200 ease-in-out">
                            <h2 className="mb-2 pr-4 text-base font-bold text-blue-900">Produksi</h2>
                            <div id="cardProduksiBody" className="space-y-1 text-xs text-slate-700"></div>
                        </div>

                        {/* CARD 3: Fasilitas */}
                        <div id="card-fasilitas"
                            className="relative -translate-y-2 rounded-xl border border-slate-200 bg-white p-4 opacity-0 pointer-events-none transition-all duration-200 ease-in-out">
                            <h2 className="mb-2 pr-4 text-base font-bold text-blue-900">Fasilitas</h2>
                            <div id="cardFasilitasBody" className="space-y-1 text-xs text-slate-700"></div>
                        </div>

                    </div>
                    </div>

                     {/* DETAIL PANE: separuh kanan layar, card detail diposisikan di tengahnya */}
                  <div id="detail-pane"
                      className="absolute bottom-6 right-6 top-6 flex w-0 items-center justify-center overflow-hidden opacity-0 pointer-events-none transition-all duration-300 ease-in-out">
                      <div id="card-detail"
                          className="max-h-full w-full max-w-96 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                          <div className="mb-2 flex items-center justify-end">
                              <button type="button"
                                  className="cursor-pointer border-none bg-transparent text-[17px] leading-none text-slate-400 hover:text-slate-600"
                                  id="closeCardDetail" aria-label="Tutup">&times;</button>
                          </div>
                          <h2 id="cardDetailTitle" className="mb-3 pr-4 text-base font-bold text-blue-900">-</h2>
                          <div id="cardDetailBody" className="space-y-1 text-xs text-slate-700"></div>
                      </div>
                  </div>

                </div>

            </div>
        </>
    );
};

export default ContentOverview;