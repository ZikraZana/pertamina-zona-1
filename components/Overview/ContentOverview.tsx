"use client";

import { useEffect } from "react";

type WilayahData = {
    nama_wilayah: string | null;
    provinsi: string | null;
    kabupaten_kota: string | null;
    jenis_wk: string | null;
    tahun_berdiri: string | null;
    luas_wilayah: string | null;
    part_interest: string | null;
    kkp: string | null;
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
            const zoneOverview = document.getElementById('zone-overview-container');
            if (!mapPane || !detailPane) return;

            if (active) {
                mapPane.classList.remove(...MAP_PANE_FULL);
                mapPane.classList.add(...MAP_PANE_HALF);
                detailPane.classList.remove(...DETAIL_PANE_HIDDEN);
                detailPane.classList.add(...DETAIL_PANE_SHOWN);

                quickCards?.classList.add('hidden');
                zoneOverview?.classList.add('hidden');
            } else {
                mapPane.classList.remove(...MAP_PANE_HALF);
                mapPane.classList.add(...MAP_PANE_FULL);
                detailPane.classList.remove(...DETAIL_PANE_SHOWN);
                detailPane.classList.add(...DETAIL_PANE_HIDDEN);

                quickCards?.classList.remove('hidden');
            }
        }

        function openCards() {
            // Sembunyikan Ringkasan Operasional Zona di sebelah kanan
            const zoneOverview = document.getElementById('zone-overview-container');
            zoneOverview?.classList.add('hidden');

            // Tampilkan kontainer 3 card lapangan
            const quickCards = document.getElementById('quick-cards-container');
            quickCards?.classList.remove('hidden');

            ['card-info', 'card-produksi', 'card-fasilitas'].forEach(id => {
                const el = document.getElementById(id);
                el?.classList.remove(...CARD_HIDDEN);
                el?.classList.add(...CARD_SHOWN);
            });

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

            const quickCards = document.getElementById('quick-cards-container');
            quickCards?.classList.add('hidden');

            // Munculkan kembali Ringkasan Operasional Zona di kanan
            const zoneOverview = document.getElementById('zone-overview-container');
            zoneOverview?.classList.remove('hidden');

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

        function loadWilayahKerja(kode: string, namaWilayah: string) {
            const titleEl = document.getElementById('cardInfoTitle')!;
            const infoBody = document.getElementById('cardInfoBody')!;
            const produksiBody = document.getElementById('cardProduksiBody')!;

            titleEl.textContent = namaWilayah;

            let d: WilayahData = {
                nama_wilayah: null, provinsi: null, kabupaten_kota: null, jenis_wk: null, tahun_berdiri: null, luas_wilayah: null, part_interest: null, kkp: null, produksi_minyak: null, produksi_gas: null, tanggal_produksi: null, nama_fasilitas: null, jenis_fasilitas: null, jumlah: null, sumur_eksplorasi_active: null, sumur_eksplorasi_total: null, producer_active: null, producer_total: null, injector_active: null, injector_total: null, sumur_total_active: null, sumur_total_total: null, process_facilities_active: null, process_facilities_total: null, offshore_platforms_active: null, offshore_platforms_total: null, swamp_platforms_active: null, swamp_platforms_total: null, gas_compressors_active: null, gas_compressors_total: null, pipeline_active: null, pipeline_total: null, drilling_rigs: null, workover_rigs: null,
            };

            // DATASET
            // DATASET
            // Sumber: Materi Kunjungan Kerja Komisi XII DPR RI, GMZ1, 25 Mei 2026 (slide 7-12)
            // Field null = tidak disebutkan di ppt untuk wilayah kerja tsb.
            if (kode === 'nso') {
                d = {
                    nama_wilayah: "North Sumatra Offshore (NSO)",
                    provinsi: "Aceh",
                    kabupaten_kota: null,
                    jenis_wk: "Gross Split",
                    tahun_berdiri: "1998",
                    luas_wilayah: "6.842,01 km²",
                    part_interest: "100% - PT Pertamina Hulu Energi NSO (PHE NSO)",
                    kkp: "Komitmen Pasti Tiga Tahun Pertama: USD 18,500,000. Komitmen Kerja Tiga Tahun Kedua: USD 24,500,000. Realisasi ITD Okt'24 USD 37,955,597 (88%). 100% selesai Komitmen Pasti.",
                    produksi_minyak: null,
                    produksi_gas: "18.42",
                    tanggal_produksi: "2025-10-31",
                    nama_fasilitas: null,
                    jenis_fasilitas: null,
                    jumlah: null,
                    sumur_eksplorasi_active: "3",
                    sumur_eksplorasi_total: "32",
                    producer_active: "5",
                    producer_total: "9",
                    injector_active: null,
                    injector_total: null,
                    sumur_total_active: "8",
                    sumur_total_total: "41",
                    process_facilities_active: "2",
                    process_facilities_total: "2",
                    offshore_platforms_active: "1",
                    offshore_platforms_total: "1",
                    swamp_platforms_active: null,
                    swamp_platforms_total: null,
                    gas_compressors_active: "2",
                    gas_compressors_total: "2",
                    pipeline_active: "1",
                    pipeline_total: "1",
                    drilling_rigs: null,
                    workover_rigs: null,
                };
            } else if (kode === 'p-susu') {
                d = {
                    nama_wilayah: "Pangkalan Susu",
                    provinsi: "Sumatera Utara",
                    kabupaten_kota: null,
                    jenis_wk: "Cost Recovery",
                    tahun_berdiri: "1885",
                    luas_wilayah: "474,54 km²",
                    part_interest: "100% - PT Pertamina EP",
                    kkp: null,
                    produksi_minyak: "0.23",
                    produksi_gas: "3.00",
                    tanggal_produksi: "2025-10-31",
                    nama_fasilitas: null,
                    jenis_fasilitas: null,
                    jumlah: null,
                    sumur_eksplorasi_active: null,
                    sumur_eksplorasi_total: null,
                    producer_active: "26",
                    producer_total: "484",
                    injector_active: "5",
                    injector_total: "9",
                    sumur_total_active: "31",
                    sumur_total_total: "493",
                    process_facilities_active: "11",
                    process_facilities_total: "14",
                    offshore_platforms_active: null,
                    offshore_platforms_total: null,
                    swamp_platforms_active: null,
                    swamp_platforms_total: null,
                    gas_compressors_active: "6",
                    gas_compressors_total: "6",
                    pipeline_active: ">1700 km",
                    pipeline_total: ">1700 km",
                    drilling_rigs: null,
                    workover_rigs: null,
                };
            } else if (kode === 'rantau') {
                d = {
                    nama_wilayah: "Rantau",
                    provinsi: "Aceh",
                    kabupaten_kota: null,
                    jenis_wk: "Cost Recovery",
                    tahun_berdiri: "1929",
                    luas_wilayah: "58,3 km²",
                    part_interest: "100% - PT Pertamina EP",
                    kkp: null,
                    produksi_minyak: "1.93",
                    produksi_gas: "2.47",
                    tanggal_produksi: "2025-10-31",
                    nama_fasilitas: null,
                    jenis_fasilitas: null,
                    jumlah: null,
                    sumur_eksplorasi_active: null,
                    sumur_eksplorasi_total: null,
                    producer_active: "110",
                    producer_total: "942",
                    injector_active: "21",
                    injector_total: "58",
                    sumur_total_active: "131",
                    sumur_total_total: "1000",
                    process_facilities_active: "1",
                    process_facilities_total: "1",
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
            } else if (kode === 'lirik') {
                d = {
                    nama_wilayah: "Lirik",
                    provinsi: "Riau",
                    kabupaten_kota: null,
                    jenis_wk: "Cost Recovery",
                    tahun_berdiri: "1940",
                    luas_wilayah: "433 km²",
                    part_interest: "100% - PT Pertamina EP",
                    kkp: null,
                    produksi_minyak: "1.34",
                    produksi_gas: null,
                    tanggal_produksi: "2025-10-31",
                    nama_fasilitas: null,
                    jenis_fasilitas: null,
                    jumlah: null,
                    sumur_eksplorasi_active: null,
                    sumur_eksplorasi_total: null,
                    producer_active: "96",
                    producer_total: "304",
                    injector_active: "56",
                    injector_total: "64",
                    sumur_total_active: "152",
                    sumur_total_total: "368",
                    process_facilities_active: "16",
                    process_facilities_total: "16",
                    offshore_platforms_active: null,
                    offshore_platforms_total: null,
                    swamp_platforms_active: null,
                    swamp_platforms_total: null,
                    gas_compressors_active: null,
                    gas_compressors_total: null,
                    pipeline_active: ">1700 km",
                    pipeline_total: ">1700 km",
                    drilling_rigs: "0 Swamp, 0 Offshore",
                    workover_rigs: "2 Swamp, 0 Offshore",
                };
            } else if (kode === 'jambi') {
                d = {
                    nama_wilayah: "Jambi",
                    provinsi: "Jambi",
                    kabupaten_kota: null,
                    jenis_wk: "Cost Recovery",
                    tahun_berdiri: "1922",
                    luas_wilayah: "5.751 km²",
                    part_interest: "100% - PT Pertamina EP",
                    kkp: null,
                    produksi_minyak: "6.8",
                    produksi_gas: "6.08",
                    tanggal_produksi: "2025-10-31",
                    nama_fasilitas: null,
                    jenis_fasilitas: null,
                    jumlah: null,
                    sumur_eksplorasi_active: null,
                    sumur_eksplorasi_total: null,
                    producer_active: "176",
                    producer_total: "626",
                    injector_active: "63",
                    injector_total: "103",
                    sumur_total_active: "239",
                    sumur_total_total: "729",
                    process_facilities_active: "9",
                    process_facilities_total: "9",
                    offshore_platforms_active: null,
                    offshore_platforms_total: null,
                    swamp_platforms_active: null,
                    swamp_platforms_total: null,
                    gas_compressors_active: null,
                    gas_compressors_total: "5",
                    pipeline_active: ">375 km",
                    pipeline_total: ">375 km",
                    drilling_rigs: "3 Rig",
                    workover_rigs: "1 Rig WO, 3 Well Service",
                };
            } else if (kode === 'jambi-merang') {
                d = {
                    nama_wilayah: "Jambi Merang",
                    provinsi: "Sumatera Selatan",
                    kabupaten_kota: null,
                    jenis_wk: "Gross Split",
                    tahun_berdiri: "2011",
                    luas_wilayah: "1.028,38 km²",
                    part_interest: "100% - PT Pertamina Hulu Energi Jambi Merang",
                    kkp: "Komitmen Kerja Pasti 5 Tahun: USD 239,300,000. Realisasi ITD Okt'24 USD 145,388,726.",
                    produksi_minyak: "5.00",
                    produksi_gas: "126.78",
                    tanggal_produksi: "2025-10-31",
                    nama_fasilitas: "Sungai Kenawang Central Gas Processing Plant",
                    jenis_fasilitas: "Central Gas Processing Plant (kapasitas 155 MMSCFD, design lifetime 25 tahun)",
                    jumlah: "3",
                    sumur_eksplorasi_active: null,
                    sumur_eksplorasi_total: null,
                    producer_active: "9 (5 SKN + 4 PGD)",
                    producer_total: null,
                    injector_active: "2 (water disposal)",
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
            }

            lastData = d;
            lastNama = namaWilayah;

            // Card 1: info umum
            infoBody.innerHTML = `
                <p><span class="font-semibold">Nama Wilayah:</span> ${d.nama_wilayah ?? '-'}</p>
                <p><span class="font-semibold">Provinsi:</span> ${d.provinsi ?? '-'}</p>
                <p><span class="font-semibold">Kabupaten/Kota:</span> ${d.kabupaten_kota ?? '-'}</p>
                <p><span class="font-semibold">Jenis Wilayah Kerja:</span> ${d.jenis_wk ?? '-'}</p>
                <p><span class="font-semibold">Tahun Berdiri:</span> ${d.tahun_berdiri ?? '-'}</p>
                <p><span class="font-semibold">Luas Wilayah:</span> ${d.luas_wilayah ?? '-'}</p>
            `;

            // Card 2: produksi saja
            produksiBody.innerHTML = `
                <p><span class="font-semibold">Produksi Minyak:</span> ${d.produksi_minyak ?? '-'} Mbopd</p>
                <p><span class="font-semibold">Produksi Gas:</span> ${d.produksi_gas ?? '-'} MMscfd</p>
                <p><span class="font-semibold">Tanggal Produksi:</span> ${d.tanggal_produksi ?? '-'}</p>
            `
        }

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
                  <p><span class="font-semibold">Tahun Berdiri:</span> ${d.tahun_berdiri ?? '-'}</p>
                  <p><span class="font-semibold">Luas Wilayah:</span> ${d.luas_wilayah ?? '-'}</p>
                  <p><span class="font-semibold">Part. Interest:</span> ${d.part_interest ?? '-'}</p>
                  <p><span class="font-semibold">KKP:</span> ${d.kkp ?? '-'}</p>
                  <hr class="my-3">
                  <p class="font-semibold text-blue-900">Produksi</p>
                  <p><span class="font-semibold">Tanggal Data:</span> ${d.tanggal_produksi ?? '-'}</p>
                  <p><span class="font-semibold">Produksi Minyak:</span> ${d.produksi_minyak ?? '-'} Mbopd</p>
                  <p><span class="font-semibold">Produksi Gas:</span> ${d.produksi_gas ?? '-'} MMscfd</p>
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

            // Sembunyikan kontainer quick-card lama dan aktifkan split view
            ['card-info', 'card-produksi', 'card-fasilitas'].forEach(id => {
                const el = document.getElementById(id);
                el?.classList.remove(...CARD_SHOWN);
                el?.classList.add(...CARD_HIDDEN);
            });
            toggleSplitView(true);
        }

        // ============================================================
        // MASTER CLICK HANDLER (Event Delegation Global)
        // ============================================================
        function handleGlobalClick(e: MouseEvent) {
            const target = e.target as HTMLElement;

            // 1. Deteksi Klik Badge/Label Lapangan di Peta SVG
            const badge = target.closest<HTMLElement>('[data-badge-click]');
            if (badge) {
                e.stopPropagation();
                setActive(badge.dataset.badgeClick!, badge.dataset.namaClick!, badge.dataset.provinsiClick!);
                return;
            }

            // 2. Deteksi Klik Tombol "Detail" di Quick Card Info
            const detailBtn = target.closest<HTMLElement>('[data-detail]');
            if (detailBtn) {
                e.stopPropagation();
                openDetailCard(detailBtn.dataset.detail!);
                return;
            }

            // 3. Deteksi Klik Tombol Close (X) di Quick Cards Lapangan
            if (target.closest('#closeCardInfo')) {
                e.stopPropagation();
                closePanel();
                return;
            }

            // 4. Deteksi Klik Tombol Close (X) di Split Screen Detail Full-Pane
            if (target.closest('#closeCardDetail')) {
                e.stopPropagation();
                closePanel();
                return;
            }

            // 5. Menutup panel jika klik sembarang di luar area card aktif
            const clickedInsideCard = target.closest('#card-info, #card-produksi, #card-fasilitas, #card-detail, #zone-overview-container');
            const clickedInsideStaticCard = target.closest('#card-geografis');

            if (!clickedInsideCard && !clickedInsideStaticCard) {
                closePanel();
            }
        }

        // Pasang listener global tunggal di tingkat document
        document.addEventListener('click', handleGlobalClick);

        return () => {
            document.removeEventListener('click', handleGlobalClick);
        };

    }, []);

    return (
        <>
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

                            <path className="prov cursor-pointer stroke-white stroke-[1px] transition-opacity duration-150 hover:opacity-[.85]" fill="#003399" data-p="ID-RI" data-nama="Riau" d="M 183.9,120.5 L 184.9,125.1 L 191.4,132.4 L 198.8,135.5 L 201.6,136.3 L 197.9,130.3 L 199.1,128.9 L 207.3,128.5 L 210.7,133.2 L 215.7,137.8 L 217.0,143.3 L 217.1,145.3 L 220.8,147.8 L 224.9,149.2 L 229.8,148.5 L 239.1,156.0 L 242.3,157.6 L 242.7,162.3 L 243.6,166.5 L 247.9,172.5 L 253.5,177.7 L 259.9,177.7 L 262.3,178.5 L 266.8,179.0 L 271.4,185.0 L 275.5,187.1 L 279.2,185.6 L 280.3,184.4 L 285.7,187.5 L 289.2,190.8 L 293.1,193.0 L 294.6,198.5 L 295.6,202.1 L 288.9,202.7 L 288.7,205.2 L 285.9,208.0 L 289.8,209.4 L 294.7,213.0 L 292.1,213.3 L 289.0,216.1 L 283.5,218.8 L 282.7,225.5 L 285.3,226.8 L 280.8,227.3 L 270.1,226.3 L 263.6,233.1 L 259.7,236.7 L 257.5,237.2 L 253.5,236.9 L 250.3,235.2 L 248.0,232.9 L 245.8,231.7 L 242.8,230.9 L 241.4,231.7 L 237.1,230.3 L 232.6,233.6 L 229.5,233.2 L 224.6,229.4 L 218.5,225.7 L 217.0,223.2 L 211.3,219.7 L 206.2,214.8 L 205.3,212.1 L 202.5,213.9 L 200.1,212.3 L 198.4,209.4 L 198.0,203.1 L 198.7,198.1 L 196.7,195.8 L 195.4,196.3 L 188.2,194.9 L 186.0,191.1 L 182.3,191.3 L 180.3,185.1 L 181.5,179.2 L 179.2,177.5 L 177.5,173.3 L 177.7,171.5 L 176.8,167.5 L 177.5,164.2 L 177.2,161.6 L 175.8,157.4 L 182.1,156.3 L 186.4,154.7 L 186.6,152.6 L 187.9,149.6 L 182.7,144.0 L 183.6,140.3 L 184.8,130.6 L 183.0,124.4 L 183.9,120.5 Z" />
                            <path className="prov cursor-pointer stroke-white stroke-[1px] transition-opacity duration-150 hover:opacity-[.85]" fill="#003399" data-p="ID-SU" data-nama="Sumatera Utara" d="M 117.1,64.0 L 117.0,66.8 L 114.4,69.8 L 117.7,69.5 L 118.8,71.0 L 122.9,72.1 L 126.9,75.3 L 130.6,76.3 L 131.4,77.4 L 134.3,82.4 L 143.5,85.8 L 147.7,88.3 L 149.9,90.3 L 156.7,94.3 L 158.7,97.6 L 164.8,100.0 L 167.7,103.4 L 173.2,107.5 L 173.3,111.9 L 173.5,114.4 L 175.2,114.1 L 177.7,116.0 L 180.4,115.0 L 183.9,120.5 L 183.0,124.4 L 184.8,130.6 L 183.6,140.3 L 182.7,144.0 L 186.4,144.8 L 186.6,152.6 L 186.4,154.7 L 182.1,156.3 L 181.1,157.2 L 176.0,159.0 L 177.5,164.2 L 176.8,167.5 L 178.4,169.9 L 176.2,172.6 L 177.8,176.4 L 175.9,176.5 L 171.9,173.9 L 168.0,173.4 L 168.3,179.9 L 170.7,182.5 L 172.1,184.2 L 167.6,187.2 L 164.1,187.4 L 162.7,186.5 L 160.0,185.4 L 154.2,186.1 L 150.6,191.2 L 148.7,191.5 L 146.0,192.1 L 145.4,188.0 L 143.4,181.8 L 142.9,178.6 L 140.8,175.5 L 138.7,168.5 L 135.9,160.6 L 136.1,159.1 L 133.4,152.8 L 136.0,149.6 L 134.6,147.8 L 133.7,145.4 L 130.8,146.0 L 125.0,139.6 L 121.4,137.4 L 121.4,137.4 L 119.8,136.2 L 116.1,134.6 L 114.9,127.4 L 112.5,124.0 L 112.4,122.5 L 111.3,119.2 L 112.9,116.6 L 111.7,111.2 L 110.3,111.0 L 107.4,108.7 L 107.0,103.2 L 108.2,101.4 L 107.1,100.2 L 104.8,97.5 L 109.9,94.9 L 107.3,92.9 L 105.9,87.7 L 103.9,84.2 L 106.0,79.1 L 107.1,76.6 L 107.6,75.6 L 110.8,67.2 L 113.6,64.1 L 117.1,64.0 Z" />
                            <path className="prov cursor-pointer stroke-white stroke-[1px] transition-opacity duration-150 hover:opacity-[.85]" fill="#003399" data-p="ID-SB" data-nama="Sumatera Barat" d="M 146.3,194.6 L 148.7,191.5 L 150.6,191.2 L 154.2,186.1 L 157.2,184.7 L 161.7,184.4 L 162.7,186.5 L 165.7,186.5 L 167.6,187.2 L 170.3,186.7 L 170.7,182.5 L 170.5,180.1 L 168.3,175.0 L 168.0,173.4 L 171.9,173.9 L 175.9,176.5 L 179.2,177.5 L 179.9,182.9 L 180.3,185.1 L 182.3,191.3 L 184.9,190.6 L 187.3,194.0 L 188.2,194.9 L 192.7,196.1 L 196.7,195.8 L 198.3,196.6 L 197.5,200.5 L 198.0,203.1 L 198.4,209.4 L 200.2,211.4 L 200.1,212.3 L 203.5,212.1 L 205.3,212.1 L 206.2,214.8 L 207.6,218.0 L 213.7,222.2 L 217.0,223.2 L 221.5,228.0 L 224.6,229.4 L 226.5,232.1 L 231.9,233.5 L 232.1,237.5 L 233.1,239.3 L 231.7,240.9 L 227.6,243.7 L 228.6,245.3 L 227.7,247.0 L 227.8,249.7 L 223.7,252.6 L 221.3,256.1 L 219.3,256.6 L 215.7,256.5 L 213.7,256.5 L 212.4,257.2 L 209.5,256.0 L 209.4,259.4 L 211.7,266.0 L 213.3,267.1 L 215.3,274.1 L 214.9,275.4 L 213.3,277.5 L 206.3,281.9 L 205.2,280.3 L 201.5,274.3 L 200.0,272.4 L 201.2,269.7 L 201.7,267.7 L 198.4,260.6 L 195.3,255.5 L 193.9,254.1 L 191.1,247.2 L 191.8,246.3 L 189.1,243.8 L 188.0,242.6 L 186.7,240.6 L 185.6,239.9 L 186.5,235.4 L 184.3,230.4 L 181.9,227.2 L 175.9,219.7 L 172.3,216.3 L 169.6,213.3 L 167.5,211.9 L 167.0,209.9 L 165.7,204.1 L 164.7,202.9 L 156.3,197.7 L 153.8,197.1 L 151.1,194.3 L 149.2,195.2 L 146.3,194.6 Z" />
                            <path className="prov cursor-pointer stroke-white stroke-[1px] transition-opacity duration-150 hover:opacity-[.85]" fill="#003399" data-p="ID-SS" data-nama="Sumatera Selatan" d="M 359.4,334.5 L 356.8,333.9 L 353.7,328.8 L 348.0,325.1 L 345.5,324.1 L 343.5,325.6 L 340.6,327.2 L 337.8,330.7 L 336.2,334.6 L 328.2,338.5 L 325.7,338.8 L 323.0,338.8 L 312.6,344.4 L 312.7,350.4 L 312.4,356.7 L 313.1,357.2 L 313.2,358.2 L 311.9,359.2 L 307.1,360.4 L 302.6,359.8 L 300.5,359.8 L 297.6,360.3 L 296.3,356.5 L 294.3,354.6 L 292.1,351.7 L 288.8,347.6 L 285.1,348.9 L 283.6,343.8 L 280.4,340.1 L 276.2,338.7 L 273.9,331.5 L 267.0,329.8 L 261.6,327.3 L 258.1,324.7 L 261.3,321.1 L 263.7,318.1 L 264.9,315.8 L 269.2,315.5 L 269.4,310.5 L 263.9,309.3 L 261.5,308.7 L 256.8,309.3 L 253.4,306.4 L 250.2,300.0 L 245.6,299.4 L 241.9,294.5 L 239.9,291.5 L 241.6,289.8 L 246.6,286.2 L 250.1,287.2 L 254.3,288.2 L 258.2,286.0 L 263.1,282.6 L 264.6,277.9 L 269.3,277.3 L 273.8,277.9 L 276.0,274.6 L 278.6,271.3 L 282.4,275.9 L 284.8,274.4 L 284.4,272.1 L 287.5,268.0 L 284.0,263.6 L 289.0,260.4 L 297.6,260.1 L 301.3,260.2 L 310.7,258.1 L 313.3,258.1 L 318.5,256.0 L 319.2,259.8 L 318.7,264.0 L 322.9,263.6 L 329.2,266.6 L 331.2,271.1 L 329.4,275.6 L 334.1,277.2 L 341.5,277.1 L 351.2,279.1 L 353.9,278.9 L 354.5,287.1 L 358.5,288.5 L 360.2,295.8 L 366.5,297.4 L 368.1,300.9 L 368.8,306.6 L 363.5,310.9 L 360.7,321.5 L 364.9,325.9 L 360.6,336.1 L 360.3,335.6 L 359.4,334.5 Z" />
                            <path className="prov cursor-pointer stroke-white stroke-[1px] transition-opacity duration-150 hover:opacity-[.85]" fill="#003399" data-p="ID-JA" data-nama="Jambi" d="M 214.9,275.4 L 215.3,274.1 L 213.3,267.1 L 211.7,266.0 L 209.4,259.4 L 209.5,256.0 L 212.4,257.2 L 213.7,256.5 L 218.8,255.8 L 219.3,256.6 L 222.4,254.0 L 223.7,252.6 L 228.6,247.7 L 227.7,247.0 L 227.6,243.7 L 228.3,241.8 L 233.1,239.3 L 233.7,237.7 L 231.9,233.5 L 232.6,233.6 L 237.1,230.3 L 239.5,230.7 L 242.8,230.9 L 245.8,231.7 L 247.4,231.5 L 250.0,234.0 L 250.3,235.2 L 253.5,236.9 L 257.5,237.2 L 259.7,236.7 L 262.7,235.0 L 266.7,230.8 L 270.1,226.3 L 280.8,227.3 L 285.3,226.8 L 287.3,228.2 L 287.5,229.6 L 291.3,232.7 L 292.8,232.8 L 297.8,234.2 L 299.4,233.8 L 306.1,235.8 L 308.7,236.5 L 312.8,235.6 L 313.9,234.9 L 314.9,241.6 L 316.9,247.1 L 316.3,249.3 L 318.5,256.0 L 315.4,254.4 L 313.3,258.1 L 311.6,259.1 L 305.5,259.5 L 304.3,260.1 L 299.6,258.3 L 297.6,260.1 L 289.0,260.4 L 287.6,262.9 L 284.0,263.6 L 287.9,266.4 L 286.3,269.1 L 286.7,271.7 L 284.0,273.2 L 284.8,274.4 L 283.0,277.1 L 282.4,275.9 L 278.6,271.3 L 276.8,271.9 L 276.0,274.6 L 273.8,277.9 L 271.5,276.4 L 269.3,277.3 L 265.9,276.2 L 265.8,279.5 L 263.1,282.6 L 261.3,285.0 L 258.2,286.0 L 254.3,288.2 L 253.4,289.0 L 250.1,287.2 L 248.3,287.5 L 245.7,286.7 L 245.2,288.5 L 239.8,291.0 L 237.3,289.6 L 233.4,289.8 L 229.0,285.9 L 224.8,283.7 L 223.0,284.4 L 216.1,276.3 L 214.9,275.4 Z" />
                            <path className="prov cursor-pointer stroke-white stroke-[1px] transition-opacity duration-150 hover:opacity-[.85]" fill="#003399" data-p="ID-LA" data-nama="Lampung" d="M 294.8,356.3 L 294.8,356.3 L 297.6,358.0 L 297.6,360.3 L 300.5,359.8 L 300.5,359.8 L 302.6,359.8 L 303.9,359.5 L 307.1,360.4 L 308.1,358.6 L 312.0,359.2 L 313.2,358.2 L 313.2,357.2 L 313.1,357.2 L 312.4,356.7 L 311.7,355.3 L 312.7,350.4 L 312.0,347.5 L 316.4,340.3 L 321.3,338.2 L 325.6,338.8 L 325.7,338.8 L 328.2,338.5 L 334.5,336.3 L 336.2,334.6 L 337.8,330.7 L 338.4,330.4 L 340.6,327.2 L 342.0,327.8 L 343.2,324.2 L 345.1,322.0 L 347.5,323.5 L 348.0,325.1 L 350.6,326.6 L 353.7,328.8 L 356.8,333.9 L 357.8,335.3 L 359.6,334.5 L 360.3,335.6 L 360.6,336.1 L 360.4,340.9 L 363.0,345.7 L 363.2,348.2 L 363.5,351.5 L 362.4,353.1 L 362.1,358.9 L 362.0,362.4 L 361.7,365.4 L 360.5,373.7 L 360.6,382.0 L 359.5,386.1 L 359.6,388.2 L 357.0,390.5 L 353.6,389.6 L 353.0,386.8 L 351.9,385.3 L 346.0,380.6 L 343.5,377.2 L 342.7,379.5 L 342.0,381.8 L 339.9,384.4 L 340.4,385.6 L 340.1,388.8 L 338.9,389.0 L 331.8,385.3 L 328.5,382.9 L 324.8,379.7 L 321.1,378.9 L 320.3,382.5 L 322.7,387.0 L 324.8,390.1 L 325.2,392.9 L 321.0,393.1 L 316.5,387.5 L 315.2,385.6 L 312.2,382.5 L 311.5,381.4 L 305.8,377.6 L 301.9,373.3 L 298.9,369.6 L 299.8,368.4 L 297.6,366.4 L 296.7,365.0 L 292.8,361.9 L 290.9,361.4 L 289.2,359.5 L 291.0,358.4 L 292.9,356.5 L 293.8,356.4 L 294.7,356.4 L 294.8,356.3 Z" />
                            <path className="prov cursor-pointer stroke-white stroke-[1px] transition-opacity duration-150 hover:opacity-[.85]" fill="#003399" data-p="ID-BE" data-nama="Bengkulu" d="M 294.8,356.3 L 294.8,356.3 L 294.7,356.4 L 294.6,356.6 L 292.9,356.5 L 291.1,358.3 L 291.0,358.4 L 289.2,359.5 L 287.0,360.1 L 285.9,358.9 L 283.6,358.8 L 282.7,357.0 L 278.7,353.4 L 277.6,352.4 L 273.4,349.3 L 271.1,348.1 L 266.0,344.9 L 263.1,342.1 L 259.9,339.5 L 248.8,331.3 L 247.5,327.5 L 247.3,325.6 L 245.8,324.2 L 246.2,323.1 L 240.4,316.3 L 235.5,313.9 L 234.4,312.2 L 231.2,310.5 L 222.3,302.2 L 221.1,299.3 L 218.5,296.2 L 215.9,290.1 L 210.4,286.9 L 206.3,281.9 L 210.4,278.9 L 213.3,277.5 L 216.1,276.3 L 223.4,280.9 L 223.0,284.4 L 224.8,283.7 L 229.0,285.9 L 233.4,289.8 L 234.9,290.1 L 237.3,289.6 L 239.9,291.5 L 239.9,291.5 L 241.7,293.2 L 244.8,296.3 L 245.6,299.4 L 248.0,300.7 L 250.2,300.0 L 253.2,302.0 L 253.4,306.4 L 254.1,307.4 L 256.8,309.3 L 259.7,308.8 L 261.5,308.7 L 262.5,307.6 L 263.9,309.3 L 266.2,310.6 L 269.4,310.5 L 269.7,313.6 L 269.2,315.5 L 267.3,317.6 L 264.9,315.8 L 263.8,315.7 L 263.7,318.1 L 261.3,321.1 L 261.0,322.7 L 258.7,323.4 L 258.1,324.7 L 261.6,327.3 L 263.1,329.3 L 266.1,330.4 L 267.0,329.8 L 273.9,331.5 L 274.8,334.3 L 275.8,336.0 L 276.2,338.7 L 280.4,340.1 L 284.4,341.4 L 284.9,341.9 L 283.6,343.8 L 285.1,348.9 L 286.5,349.2 L 288.8,347.6 L 290.1,348.6 L 292.1,351.7 L 292.5,353.2 L 294.3,354.6 L 294.8,356.3 Z" />
                            <path className="prov cursor-pointer stroke-white stroke-[1px] transition-opacity duration-150 hover:opacity-[.85]" fill="#003399" data-p="ID-AC" data-nama="Aceh" d="M 117.1,64.0 L 113.6,64.1 L 111.8,67.0 L 109.7,74.3 L 107.6,75.6 L 105.7,76.8 L 106.0,79.1 L 103.9,84.2 L 104.7,87.1 L 107.3,92.9 L 109.0,93.6 L 108.4,96.6 L 104.8,97.5 L 106.5,98.2 L 108.2,101.4 L 108.4,102.8 L 107.6,106.7 L 107.4,108.7 L 110.3,111.0 L 111.7,111.2 L 112.9,116.6 L 111.6,117.3 L 111.6,121.3 L 112.4,122.5 L 112.5,124.0 L 114.9,127.4 L 113.8,133.0 L 107.3,129.0 L 104.0,129.7 L 102.0,130.1 L 98.0,124.7 L 96.5,110.9 L 95.4,109.0 L 92.5,108.0 L 91.1,107.9 L 89.3,106.6 L 85.3,98.7 L 83.0,97.2 L 80.7,94.3 L 79.5,92.8 L 73.7,86.2 L 72.4,83.2 L 66.1,81.5 L 61.5,81.9 L 56.1,77.0 L 53.8,73.6 L 51.3,70.5 L 48.6,69.0 L 46.3,66.7 L 40.8,61.7 L 38.3,59.4 L 31.5,53.2 L 30.1,52.3 L 28.2,49.2 L 26.0,47.0 L 22.0,37.4 L 22.3,35.9 L 21.0,34.8 L 20.5,29.3 L 20.2,26.3 L 20.0,23.2 L 21.0,23.4 L 23.9,21.9 L 26.6,20.0 L 31.9,20.9 L 34.4,22.3 L 41.0,25.1 L 41.5,26.9 L 42.8,28.2 L 47.3,31.9 L 50.6,32.8 L 57.2,34.4 L 59.4,33.6 L 65.0,34.4 L 67.6,33.4 L 73.9,33.1 L 77.1,32.8 L 81.8,36.4 L 82.9,36.6 L 90.5,34.0 L 94.5,34.3 L 95.3,35.7 L 103.2,43.7 L 105.7,44.8 L 107.6,51.7 L 109.3,53.5 L 108.7,56.3 L 111.7,56.5 L 118.1,59.9 L 118.0,62.1 L 117.1,64.0 Z" />

                            <text className="pointer-events-none select-none fill-white text-[9px] font-semibold [paint-order:stroke] stroke-[rgba(0,0,0,0.35)] stroke-[2px] [text-anchor:middle]" x="75" y="60">Aceh</text>
                            <text className="pointer-events-none select-none fill-white text-[9px] font-semibold [paint-order:stroke] stroke-[rgba(0,0,0,0.35)] stroke-[2px] [text-anchor:middle]" x="150" y="128">Sumatera Utara</text>
                            <text className="pointer-events-none select-none fill-white text-[9px] font-semibold [paint-order:stroke] stroke-[rgba(0,0,0,0.35)] stroke-[2px] [text-anchor:middle]" x="191" y="222">Sumatera Barat</text>
                            <text className="pointer-events-none select-none fill-white text-[9px] font-semibold [paint-order:stroke] stroke-[rgba(0,0,0,0.35)] stroke-[2px] [text-anchor:middle]" x="230" y="195">Riau</text>
                            <text className="pointer-events-none select-none fill-white text-[9px] font-semibold [paint-order:stroke] stroke-[rgba(0,0,0,0.35)] stroke-[2px] [text-anchor:middle]" x="255" y="255">Jambi</text>
                            <text className="pointer-events-none select-none fill-white text-[9px] font-semibold [paint-order:stroke] stroke-[rgba(0,0,0,0.35)] stroke-[2px] [text-anchor:middle]" x="255" y="327">Bengkulu</text>
                            <text className="pointer-events-none select-none fill-white text-[9px] font-semibold [paint-order:stroke] stroke-[rgba(0,0,0,0.35)] stroke-[2px] [text-anchor:middle]" x="310" y="305">Sumatera Selatan</text>
                            <text className="pointer-events-none select-none fill-white text-[9px] font-semibold [paint-order:stroke] stroke-[rgba(0,0,0,0.35)] stroke-[2px] [text-anchor:middle]" x="337" y="360">Lampung</text>

                            <line className="pointer-events-none stroke-[1.2px] stroke-slate-800 opacity-100" data-line="nso" x1="93" y1="25" x2="150" y2="10" />
                            <line className="pointer-events-none stroke-[1.2px] stroke-slate-800 opacity-100" data-line="p-susu" x1="125" y1="85" x2="215" y2="85" />
                            <line className="pointer-events-none stroke-[1.2px] stroke-slate-800 opacity-100" data-line="rantau" x1="110" y1="73" x2="158" y2="50" />
                            <line className="pointer-events-none stroke-[1.2px] stroke-slate-800 opacity-100" data-line="lirik" x1="250" y1="210" x2="315" y2="170" />
                            <line className="pointer-events-none stroke-[1.2px] stroke-slate-800 opacity-100" data-line="jambi" x1="282" y1="250" x2="345" y2="210" />
                            <line className="pointer-events-none stroke-[1.2px] stroke-slate-800 opacity-100" data-line="jambi-merang" x1="299" y1="277" x2="395" y2="245" />
                            <line className="pointer-events-none stroke-[1.2px] stroke-slate-800 opacity-100" data-line="tamiang" x1="105" y1="60" x2="65" y2="120" />
                            <line className="pointer-events-none stroke-[1.2px] stroke-slate-800 opacity-100" data-line="meruap" x1="255" y1="265" x2="200" y2="295" />
                            <line className="pointer-events-none stroke-[1.2px] stroke-slate-800 opacity-100" data-line="Jabung" x1="285" y1="240" x2="170" y2="267" />

                            <circle className="pointer-events-none fill-amber-500" data-dot="nso" data-nama="NSO" data-provinsi="ID-AC" cx="93" cy="25" r="2.8" />
                            <circle className="pointer-events-none fill-amber-500" data-dot="p-susu" data-nama="Pangkalan Susu" data-provinsi="ID-SU" cx="125" cy="85" r="2.8" />
                            <circle className="pointer-events-none fill-amber-500" data-dot="rantau" data-nama="Rantau" data-provinsi="ID-SU" cx="110" cy="73" r="2.8" />
                            <circle className="pointer-events-none fill-amber-500" data-dot="lirik" data-nama="Lirik" data-provinsi="ID-RI" cx="250" cy="210" r="2.8" />
                            <circle className="pointer-events-none fill-amber-500" data-dot="jambi" data-nama="Jambi" data-provinsi="ID-JA" cx="282" cy="250" r="2.8" />
                            <circle className="pointer-events-none fill-amber-500" data-dot="jambi-merang" data-nama="Jambi Merang" data-provinsi="ID-SS" cx="299" cy="277" r="2.8" />
                            <circle className="pointer-events-none fill-amber-500" data-dot="tamiang" data-nama="Tamiang Raya Energy" data-provinsi="ID-AC" cx="105" cy="60" r="2.8" />
                            <circle className="pointer-events-none fill-amber-500" data-dot="meruap" data-nama="SEBWP Meruap" data-provinsi="ID-SS" cx="255" cy="265" r="2.8" />
                            <circle className="pointer-events-none fill-amber-500" data-dot="jabung" data-nama="Jabung" data-provinsi="ID-JA" cx="285" cy="240" r="2.8" />

                            <foreignObject className="pointer-events-auto overflow-visible opacity-100 transition-opacity duration-150 ease-in-out" data-badge="nso" x="102" y="-1" width="96" height="24">
                                <div className="text-center">
                                    <span className="inline-block cursor-pointer whitespace-nowrap rounded-full bg-blue-900 px-2.5 py-0.75 text-[10.5px] font-semibold text-white shadow-md hover:bg-blue-800" data-badge-click="nso" data-nama-click="NSO" data-provinsi-click="ID-AC">NSO</span>
                                </div>
                            </foreignObject>
                            <foreignObject className="pointer-events-auto overflow-visible opacity-100 transition-opacity duration-150 ease-in-out" data-badge="p-susu" x="170" y="71" width="96" height="24">
                                <div className="text-center">
                                    <span className="inline-block cursor-pointer whitespace-nowrap rounded-full bg-blue-900 px-2.5 py-0.75 text-[10.5px] font-semibold text-white shadow-md hover:bg-blue-800" data-badge-click="p-susu" data-nama-click="Pangkalan Susu" data-provinsi-click="ID-SU">Pangkalan Susu</span>
                                </div>
                            </foreignObject>
                            <foreignObject className="pointer-events-auto overflow-visible opacity-100 transition-opacity duration-150 ease-in-out" data-badge="rantau" x="130" y="35" width="96" height="24">
                                <div className="text-center">
                                    <span className="inline-block cursor-pointer whitespace-nowrap rounded-full bg-blue-900 px-2.5 py-0.75 text-[10.5px] font-semibold text-white shadow-md hover:bg-blue-800" data-badge-click="rantau" data-nama-click="Rantau" data-provinsi-click="ID-SU">Rantau</span>
                                </div>
                            </foreignObject>
                            <foreignObject className="pointer-events-auto overflow-visible opacity-100 transition-opacity duration-150 ease-in-out" data-badge="lirik" x="267" y="159" width="96" height="24">
                                <div className="text-center">
                                    <span className="inline-block cursor-pointer whitespace-nowrap rounded-full bg-blue-900 px-2.5 py-0.75 text-[10.5px] font-semibold text-white shadow-md hover:bg-blue-800" data-badge-click="lirik" data-nama-click="Lirik" data-provinsi-click="ID-RI">Lirik</span>
                                </div>
                            </foreignObject>
                            <foreignObject className="pointer-events-auto overflow-visible opacity-100 transition-opacity duration-150 ease-in-out" data-badge="jambi" x="297" y="204" width="96" height="24">
                                <div className="text-center">
                                    <span className="inline-block cursor-pointer whitespace-nowrap rounded-full bg-blue-900 px-2.5 py-0.75 text-[10.5px] font-semibold text-white shadow-md hover:bg-blue-800" data-badge-click="jambi" data-nama-click="Jambi" data-provinsi-click="ID-JA">Jambi</span>
                                </div>
                            </foreignObject>
                            <foreignObject className="pointer-events-auto overflow-visible opacity-100 transition-opacity duration-150 ease-in-out" data-badge="jambi-merang" x="347" y="239" width="96" height="24">
                                <div className="text-center">
                                    <span className="inline-block cursor-pointer whitespace-nowrap rounded-full bg-blue-900 px-2.5 py-0.75 text-[10.5px] font-semibold text-white shadow-md hover:bg-blue-800" data-badge-click="jambi-merang" data-nama-click="Jambi Merang" data-provinsi-click="ID-SS">Jambi Merang</span>
                                </div>
                            </foreignObject>
                            <foreignObject className="pointer-events-auto overflow-visible opacity-100 transition-opacity duration-150 ease-in-out" data-badge="tamiang" x="0" y="105" width="110" height="24">
                                <div className="text-center">
                                    <span className="inline-block cursor-pointer whitespace-nowrap rounded-full bg-gray-500 px-2.5 py-0.75 text-[7.5px] font-semibold text-white shadow-md hover:bg-gray-800" data-badge-click="tamiang" data-nama-click="Tamiang Raya Energy" data-provinsi-click="ID-AC">Tamiang Raya</span>
                                </div>
                            </foreignObject>
                            <foreignObject className="pointer-events-auto overflow-visible opacity-100 transition-opacity duration-150 ease-in-out" data-badge="meruap" x="120" y="288" width="96" height="24">
                                <div className="text-center">
                                    <span className="inline-block cursor-pointer whitespace-nowrap rounded-full bg-gray-500 px-2.5 py-0.75 text-[7.5px] font-semibold text-white shadow-md hover:bg-gray-800" data-badge-click="meruap" data-nama-click="SEBWP Meruap" data-provinsi-click="ID-JA">SEBWP Meruap</span>
                                </div>
                            </foreignObject>
                            <foreignObject className="pointer-events-auto overflow-visible opacity-100 transition-opacity duration-150 ease-in-out" data-badge="jabung" x="115" y="250" width="96" height="24">
                                <div className="text-center">
                                    <span className="inline-block cursor-pointer whitespace-nowrap rounded-full bg-gray-500 px-2.5 py-0.75 text-[7.5px] font-semibold text-white shadow-md hover:bg-gray-800" data-badge-click="jabung" data-nama-click="Jabung" data-provinsi-click="ID-JA">Jabung</span>
                                </div>
                            </foreignObject>
                        </svg>

                        {/* CARD GEOGRAFIS: statis di kiri, selalu tampil awal */}
                        <div id="card-geografis" className="absolute bottom-6 left-6 top-6 w-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-lg opacity-100 pointer-events-auto transition-opacity duration-200 ease-in-out">
                            <h2 className="text-base font-bold text-blue-900">Overview Zona 1</h2>
                            <p className="mb-4 text-[11px] text-slate-400">Ringkasan cakupan wilayah kerja Regional 1 Sumatra</p>

                            <div className="mb-4 grid grid-cols-2 gap-2">
                                <div className="rounded-lg bg-blue-50 p-2.5 text-center">
                                    <p className="text-xl font-bold leading-tight text-blue-900">5</p>
                                    <p className="text-[10.5px] font-medium text-blue-700">Provinsi</p>
                                </div>
                                <div className="rounded-lg bg-blue-50 p-2.5 text-center">
                                    <p className="text-xl font-bold leading-tight text-blue-900">14</p>
                                    <p className="text-[10.5px] font-medium text-blue-700">Kab/Kota</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Cakupan Lokasi</h3>
                                <ul className="divide-y divide-slate-100 text-xs text-slate-700">
                                    <li className="flex items-center justify-between py-1"><span>Aceh</span><span className="font-semibold text-slate-500">1 Kab</span></li>
                                    <li className="flex items-center justify-between py-1"><span>Sumatera Utara</span><span className="font-semibold text-slate-500">4 Kab/Kota</span></li>
                                    <li className="flex items-center justify-between py-1"><span>Riau</span><span className="font-semibold text-slate-500">3 Kab</span></li>
                                    <li className="flex items-center justify-between py-1"><span>Jambi</span><span className="font-semibold text-slate-500">5 Kab/Kota</span></li>
                                    <li className="flex items-center justify-between py-1"><span>Sumatera Selatan</span><span className="font-semibold text-slate-500">1 Kab</span></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Wilayah Kerja</h3>
                                <details className="group mb-2 rounded-lg border border-slate-200 open:bg-slate-50" open>
                                    <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-xs font-semibold text-slate-800 [&::-webkit-details-marker]:hidden">
                                        <span>WK Operator <span className="font-normal text-slate-400">(5)</span></span>
                                        <svg className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                    </summary>
                                    <ul className="list-outside list-disc space-y-1 px-3 pb-2.5 pl-7 text-[11px] leading-snug text-slate-600">
                                        <li>PHE Jambi Merang <span className="text-slate-400">(GS)</span></li>
                                        <li>PHE NSO <span className="text-slate-400">(GS)</span></li>
                                        <li>PEP Asset 1 <span className="text-slate-400">— Rantau, P. Susu, Lirik (CR)</span></li>
                                        <li>KSO SEBWP Meruap <span className="text-slate-400">(CR)</span></li>
                                        <li>KSO Tamiang Raya Energy <span className="text-slate-400">(CR)</span></li>
                                    </ul>
                                </details>

                                <details className="group rounded-lg border border-slate-200 open:bg-slate-50">
                                    <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-xs font-semibold text-slate-800 [&::-webkit-details-marker]:hidden">
                                        <span>WK Non-Operator <span className="font-normal text-slate-400">(2)</span></span>
                                        <svg className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                    </summary>
                                    <ul className="list-outside list-disc space-y-1 px-3 pb-2.5 pl-7 text-[11px] leading-snug text-slate-600">
                                        <li>JABUNG <span className="text-slate-400">(CR)</span></li>
                                        <li>KAKAP <span className="text-slate-400">(CR)</span></li>
                                    </ul>
                                </details>
                            </div>
                        </div>

                        {/* KANAN: KONDISI AWAL (OVERVIEW OPERASIONAL ZONA) */}
                        <div id="zone-overview-container" className="absolute right-6 top-6 flex max-h-[calc(100%-48px)] w-75 flex-col gap-3 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-lg transition-all duration-200">
                            <div>
                                <h2 className="text-base font-bold text-blue-900">Operasional Zona 1</h2>
                                <p className="mb-1 text-[11px] text-slate-400">Data produksi dan fasilitas kumulatif Regional 1</p>
                            </div>

                            <div>
                                <div className="mb-1.5 flex items-end justify-between">
                                    <h3 className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Produksi</h3>
                                    <span className="text-[9px] font-medium text-slate-400">17 Mei 2026</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-2 text-center">
                                        <p className="text-sm font-extrabold text-blue-900">19,431</p>
                                        <p className="text-[9.5px] font-semibold text-blue-700">BOPD (Minyak)</p>
                                    </div>
                                    <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-2 text-center">
                                        <p className="text-sm font-extrabold text-blue-900">228.010</p>
                                        <p className="text-[9.5px] font-semibold text-blue-700">MMSCFD (Gas)</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Fasilitas Produksi</h3>
                                <div className="space-y-1 text-[11px] text-slate-700">
                                    <div className="flex items-center justify-between rounded bg-slate-50 px-2 py-1"><span>Struktur</span><span className="font-bold text-slate-800">49</span></div>
                                    <div className="flex items-center justify-between rounded bg-slate-50 px-2 py-1"><span>Stasiun Pengumpul</span><span className="font-bold text-slate-800">40</span></div>
                                    <div className="flex items-center justify-between rounded bg-slate-50 px-2 py-1"><span>Stasiun Pengumpul Utama</span><span className="font-bold text-slate-800">5</span></div>
                                    <div className="flex items-center justify-between rounded bg-slate-50 px-2 py-1"><span>Pusat Pengumpul Produksi</span><span className="font-bold text-slate-800">6</span></div>
                                </div>
                            </div>

                            <details className="group rounded-lg border border-slate-200 open:bg-slate-50" open>
                                <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-800 [&::-webkit-details-marker]:hidden">
                                    <span>Program Kerja & Rigs</span>
                                    <svg className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </summary>
                                <div className="px-3 pb-3 pt-1 text-[11px] leading-relaxed text-slate-600">
                                    <p className="mb-1 font-semibold text-slate-800">Program Kerja:</p>
                                    <ul className="mb-2 list-inside list-disc space-y-0.5 pl-1 text-[10.5px]">
                                        <li>~10-20 sumur pemboran & explorasi</li>
                                        <li>~500 program WO/WI/WS per tahun</li>
                                    </ul>
                                    <p className="mb-1 font-semibold text-slate-800">Rig Availability:</p>
                                    <p className="text-[10.5px]">3 Rig Pemboran + 15 Rig WOWS untuk mendukung program development dan base business.</p>
                                </div>
                            </details>
                        </div>

                        {/* KANAN: KONDISI LAPANGAN AKTIF (3 QUICK CARDS) */}
                        <div id="quick-cards-container" className="absolute right-6 top-6 hidden max-h-[calc(100%-48px)] w-72 flex-col overflow-y-auto pb-4">

                            {/* CARD 1: Info Umum Lapangan */}
                            <div id="card-info" className="relative -translate-y-2 pointer-events-none rounded-xl mb-3 border border-slate-200 bg-white p-4 opacity-0 shadow-lg transition-all duration-200 ease-in-out">
                                {/* Header */}
                                <div className="mb-3 flex items-start justify-between border-b border-slate-100 pb-2.5">
                                    <div className="flex items-start gap-2.5">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.31 13.31 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 id="cardInfoTitle" className="mt-0.5 text-sm font-bold text-blue-900">-</h2>
                                        </div>
                                    </div>
                                    <button type="button" id="closeCardInfo" className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-slate-50 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500" aria-label="Tutup">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Body (Data dari JS) */}
                                <div id="cardInfoBody" className="text-[11.5px] leading-relaxed text-slate-600 [&>p>span]:text-slate-800 [&>p]:mb-1.5 last:[&>p]:mb-0"></div>

                                {/* Action */}
                                <button type="button" data-detail="all" className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow active:scale-[0.98]">
                                    Lihat Detail Lengkap
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* CARD 2: Produksi Lapangan */}
                            <div id="card-produksi" className="relative -translate-y-2 pointer-events-none rounded-xl border border-slate-200 bg-white p-4 opacity-0 shadow-lg transition-all duration-200 ease-in-out">
                                {/* Header */}
                                <div className="mb-3 flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-sm font-bold uppercase tracking-wide text-blue-900">Produksi Lapangan</h2>
                                </div>

                                {/* Body (Data dari JS) */}
                                <div id="cardProduksiBody" className="text-[11.5px] leading-relaxed text-slate-600 [&>p>span]:text-slate-800 [&>p]:mb-1.5 last:[&>p]:mb-0"></div>
                            </div>

                        </div>

                    </div>

                    {/* DETAIL PANE: Pane splitview detail lengkap */}
                    <div
                        id="detail-pane"
                        className="absolute bottom-6 right-6 top-6 z-50 flex w-0 items-center justify-end overflow-hidden opacity-0 pointer-events-none transition-all duration-300 ease-in-out pl-4"
                    >
                        <div
                            id="card-detail"
                            className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        >
                            {/* HEADER: Sticky di atas, tidak ikut ter-scroll */}
                            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 backdrop-blur-sm">
                                <div>
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Detail Operasional</p>
                                    </div>
                                    <h2 id="cardDetailTitle" className="text-xl font-bold tracking-tight text-blue-950">-</h2>
                                </div>

                                {/* Tombol Close Modern */}
                                <button
                                    type="button"
                                    id="closeCardDetail"
                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                                    aria-label="Tutup"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* BODY: Area Scrollable dengan styling "Sihir" Tailwind */}
                            <div className="flex-1 overflow-y-auto bg-white px-6 py-5 custom-scrollbar">
                                <div
                                    id="cardDetailBody"
                                    className="
                    text-sm text-slate-700
                    
                    /* 1. Styling untuk Judul Section (Info Umum, Produksi, dll) */
                    [&>p.text-blue-900]:mt-5 [&>p.text-blue-900]:text-base [&>p.text-blue-900]:font-bold [&>p.text-blue-900]:text-slate-900 first:[&>p.text-blue-900]:mt-0
                    
                    /* 2. Styling ajaib untuk Label (Nama Wilayah, Provinsi, dll) agar lebarnya rata (tabular alignment) */
                    [&>p>span.font-semibold]:inline-block [&>p>span.font-semibold]:w-40 [&>p>span.font-semibold]:text-slate-500 [&>p>span.font-semibold]:font-medium
                    [&>p]:mb-2 last:[&>p]:mb-0
                    
                    /* 3. Styling Garis Pemisah (HR) menjadi lebih elegan */
                    [&>hr]:my-6 [&>hr]:border-dashed [&>hr]:border-slate-200
                    
                    /* 4. Menghaluskan tampilan Tabel bawaan JS */
                    [&_table]:shadow-sm [&_th]:bg-slate-800 [&_th]:text-slate-100 [&_td]:text-slate-600 [&_tr:hover]:bg-slate-50
                "
                                ></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default ContentOverview;