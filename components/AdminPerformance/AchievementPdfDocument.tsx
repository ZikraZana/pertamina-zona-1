import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';

// ============================================================
// PALET WARNA — korporat, formal
// ============================================================
const COLORS = {
    navy: '#0f2a4a',
    navyLight: '#1e4870',
    accent: '#c9a227',      // emas/kuning korporat, dipakai sangat terbatas sbg aksen
    slate900: '#1a202c',
    slate700: '#334155',
    slate500: '#64748b',
    slate300: '#cbd5e1',
    slate100: '#f1f5f9',
    line: '#d0d7e2',
    white: '#ffffff',
    positive: '#0f7a4f',
    negative: '#b91c1c',
};

// ============================================================
// TIPE DATA — sesuai bentuk yang dibalikin masing-masing GET API achievement
// ============================================================
type ProduksiItem = { type: string; realization: number; target: number; unit: string; period: string };
type RkItem = { id: string; jenis_rk: string; nama_rk: string; jumlah_minyak: number | null; jumlah_gas: number | null; wilayah_kerja: string };
type ProperItem = { id: string; wilayah_kerja: string; peringkat: string; tahun: number; keterangan: string | null };
type SecurityItem = { id: string; judul: string; wilayah_kerja: string; tanggal: string };
type InovasiItem = { id: string; pencapaian: string; nama_inovasi: string; nama_acara: string | null; wilayah_kerja: string };
type NaratifItem = { id: string; title: string; detail: string };
type AbiItem = { id: string; title: string; unit: string; realization: number; target: number; period: string };
type KehumasanItem = { id: string; wilayah_kerja: string; judul: string; deskripsi: string; bulan: number; tahun: number; medali: string };

export type PdfData = {
    produksi: ProduksiItem[];
    rencanaKerja: RkItem[];
    hsseProper: ProperItem[];
    hsseSecurity: SecurityItem[];
    inovasi: InovasiItem[];
    topProjectNaratif: NaratifItem[];
    topProjectAbi: AbiItem[];
    kehumasan: KehumasanItem[];
};

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
    page: {
        paddingTop: 28,
        paddingBottom: 40,
        paddingHorizontal: 36,
        fontSize: 8.5,
        fontFamily: 'Helvetica',
        color: COLORS.slate900,
    },

    // ---------- Kop dokumen ----------
    coverHeader: {
        borderBottom: `2px solid ${COLORS.navy}`,
        paddingBottom: 10,
        marginBottom: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    coverKicker: {
        fontSize: 7.5,
        color: COLORS.slate500,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 3,
    },
    coverTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    coverMetaBox: {
        alignItems: 'flex-end',
    },
    coverMetaLabel: {
        fontSize: 7,
        color: COLORS.slate500,
    },
    coverMetaValue: {
        fontSize: 8.5,
        color: COLORS.slate900,
        fontWeight: 'bold',
        marginBottom: 3,
    },

    // ---------- Section frame ----------
    sectionBlock: {
        marginBottom: 12,
    },
    sectionHeadRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.navy,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginBottom: 6,
    },
    sectionNumber: {
        fontSize: 8,
        fontWeight: 'bold',
        color: COLORS.accent,
        marginRight: 6,
    },
    sectionHeadText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: COLORS.white,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    subHeadText: {
        fontSize: 7.5,
        fontWeight: 'bold',
        color: COLORS.navy,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        marginTop: 6,
        marginBottom: 3,
    },
    emptyText: {
        fontSize: 8,
        color: COLORS.slate500,
        fontStyle: 'italic',
        paddingVertical: 3,
    },

    // ---------- Tabel generik ----------
    table: {
        border: `0.5px solid ${COLORS.line}`,
    },
    tableHeadRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.slate100,
        borderBottom: `0.5px solid ${COLORS.line}`,
    },
    tableHeadCell: {
        fontSize: 7,
        fontWeight: 'bold',
        color: COLORS.slate700,
        textTransform: 'uppercase',
        paddingVertical: 4,
        paddingHorizontal: 6,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottom: `0.5px solid ${COLORS.line}`,
    },
    tableRowLast: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tableCell: {
        fontSize: 8,
        color: COLORS.slate900,
        paddingVertical: 3.5,
        paddingHorizontal: 6,
    },
    tableCellMuted: {
        fontSize: 7.5,
        color: COLORS.slate500,
        paddingVertical: 3.5,
        paddingHorizontal: 6,
    },
    tableCellRight: {
        fontSize: 8,
        color: COLORS.slate900,
        paddingVertical: 3.5,
        paddingHorizontal: 6,
        textAlign: 'right',
    },
    tableCellBold: {
        fontSize: 8,
        fontWeight: 'bold',
        color: COLORS.slate900,
        paddingVertical: 3.5,
        paddingHorizontal: 6,
    },

    // ---------- Kolom lebar (dipakai inline lewat width prop) ----------
    colXS: { width: '10%' },
    colS: { width: '14%' },
    colM: { width: '20%' },
    colL: { width: '28%' },
    colXL: { width: '36%' },
    colFlex: { flex: 1 },

    // ---------- Status pill kecil (dipakai di dalam sel tabel) ----------
    pill: {
        fontSize: 6.5,
        fontWeight: 'bold',
        paddingVertical: 1.5,
        paddingHorizontal: 5,
        borderRadius: 3,
        alignSelf: 'flex-end',
    },
    pillNavy: { backgroundColor: COLORS.navy, color: COLORS.white },
    pillGold: { backgroundColor: '#fdf3d8', color: '#8a6d1a' },
    pillGreen: { backgroundColor: '#dcf3e6', color: COLORS.positive },
    pillBlue: { backgroundColor: '#dbe8f7', color: COLORS.navyLight },
    pillGray: { backgroundColor: COLORS.slate100, color: COLORS.slate500 },

    // ---------- Ringkasan metrik (produksi) ----------
    metricRow: {
        flexDirection: 'row',
        border: `0.5px solid ${COLORS.line}`,
        marginBottom: 12,
    },
    metricCell: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRight: `0.5px solid ${COLORS.line}`,
    },
    abiMiniCard: {
        paddingVertical: 6,
        paddingHorizontal: 6,
        borderBottom: `0.5px solid ${COLORS.line}`,
    },
    abiMiniTitle: {
        fontSize: 7.5,
        fontWeight: 'bold',
        color: COLORS.slate900,
        marginBottom: 3,
    },
    abiMiniValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    metricCellLast: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    metricLabel: {
        fontSize: 6.5,
        color: COLORS.slate500,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 3,
    },
    metricValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    metricValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    metricUnit: {
        fontSize: 7,
        color: COLORS.slate500,
        marginLeft: 3,
    },
    metricSubRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    metricTarget: {
        fontSize: 6.5,
        color: COLORS.slate500,
    },
    metricAchievement: {
        fontSize: 7,
        fontWeight: 'bold',
    },
    achievementPositive: { color: COLORS.positive },
    achievementNegative: { color: COLORS.negative },
    metricBarTrack: {
        height: 3,
        backgroundColor: COLORS.slate100,
        marginTop: 4,
    },
    metricBarFill: {
        height: 3,
        backgroundColor: COLORS.navy,
    },
    realisasiFont: {
        fontSize: 7.5,
        color: COLORS.slate500,
        marginTop: 3,
    },

    // ---------- Two-column layout untuk section 5 (Top Project) ----------
    twoColRow: {
        flexDirection: 'row',
    },
    twoColLeft: {
        width: '48%',
        marginRight: '4%',
    },
    twoColRight: {
        width: '48%',
    },
    naratifItem: {
        marginBottom: 5,
        paddingLeft: 8,
        borderLeft: `2px solid ${COLORS.accent}`,
    },
    naratifItemTitle: {
        fontSize: 7.5,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    naratifItemDetail: {
        fontSize: 7,
        color: COLORS.slate700,
        marginTop: 1,
        lineHeight: 1.3,
    },

    // ---------- Grid 2 kolom untuk Rencana Kerja ----------
    rkGridWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    rkGridCol: {
        width: '48.5%',
        marginBottom: 8,
    },
    rkGroupBox: {
        border: `0.5px solid ${COLORS.line}`,
    },
    rkGroupHeadRow: {
        backgroundColor: COLORS.slate100,
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderBottom: `0.5px solid ${COLORS.line}`,
    },
    rkGroupHeadText: {
        fontSize: 7,
        fontWeight: 'bold',
        color: COLORS.navy,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    rkItemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 3.5,
        paddingHorizontal: 6,
        borderBottom: `0.5px solid ${COLORS.line}`,
    },
    rkItemRowLast: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 3.5,
        paddingHorizontal: 6,
    },
    rkItemTextCol: {
        flexDirection: 'column',
        flex: 1,
        paddingRight: 6,
    },
    rkItemName: {
        fontSize: 7.5,
        color: COLORS.slate900,
        lineHeight: 1.4,
        marginBottom: 2,
    },
    rkItemWilayah: {
        fontSize: 6.5,
        color: COLORS.slate500,
        lineHeight: 1.3,
    },
    rkItemNumbers: {
        fontSize: 6.5,
        color: COLORS.slate500,
        textAlign: 'right',
        width: 60,
    },

    hsseItemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingVertical: 3.5,
        paddingHorizontal: 6,
        borderBottom: `0.5px solid ${COLORS.line}`,
    },
    hsseItemRowLast: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingVertical: 3.5,
        paddingHorizontal: 6,
    },
    hsseMedalYearItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    hsseItemTextCol: {
        flexDirection: 'column',
        flex: 1,
        paddingRight: 6,
    },
    hsseItemTitle: {
        fontSize: 7.5,
        color: COLORS.slate900,
        lineHeight: 1.4,
        marginBottom: 2,
    },
    hsseItemSub: {
        fontSize: 6.5,
        color: COLORS.slate500,
        lineHeight: 1.3,
    },
    hsseItemMeta: {
        fontSize: 6.5,
        color: COLORS.slate500,
        textAlign: 'right',
    },


    // ---------- Footer halaman ----------
    footer: {
        position: 'absolute',
        bottom: 16,
        left: 36,
        right: 36,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTop: `0.5px solid ${COLORS.line}`,
        paddingTop: 5,
    },
    footerText: {
        fontSize: 6.5,
        color: COLORS.slate500,
    },
});

// ============================================================
// KOMPONEN BANTU
// ============================================================
function SectionHead({ number, title }: { number: string; title: string }) {
    return (
        <View style={styles.sectionHeadRow}>
            <Text style={styles.sectionNumber}>{number}</Text>
            <Text style={styles.sectionHeadText}>{title}</Text>
        </View>
    );
}

function TableHead({ columns }: { columns: { label: string; style: Style }[] }) {
    return (
        <View style={styles.tableHeadRow}>
            {columns.map((col, i) => (
                <Text key={i} style={[styles.tableHeadCell, col.style]}>{col.label}</Text>
            ))}
        </View>
    );
}

const NAMA_BULAN_PDF = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
function formatBulanTahunPdf(bulan: number, tahun: number) {
    return `${NAMA_BULAN_PDF[bulan - 1] ?? ''} ${tahun}`;
}

function MedalPill({ medali }: { medali: string }) {
    const label = medali === 'gold' ? 'Gold' : medali === 'silver' ? 'Silver' : 'Bronze';
    const style = medali === 'gold' ? styles.pillGold : medali === 'silver' ? styles.pillGray : styles.pillBlue;
    return <Text style={[styles.pill, style]}>{label}</Text>;
}

function ProperPill({ peringkat }: { peringkat: string }) {
    const style = peringkat === 'Emas' ? styles.pillGold : peringkat === 'Hijau' ? styles.pillGreen : styles.pillBlue;
    return <Text style={[styles.pill, style]}>{peringkat}</Text>;
}

function Footer() {
    return (
        <View style={styles.footer} fixed>
            <Text style={styles.footerText}>Laporan Achievement — PT Pertamina Hulu Rokan Zona 1</Text>
            <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`} />
        </View>
    );
}

// ============================================================
// PRODUKSI
// ============================================================
function SectionProduksi({ items }: { items: ProduksiItem[] }) {
    const order = ['minyak', 'gas', 'migas'];
    const sortedItems = [...items].sort(
        (a, b) => order.indexOf(a.type.toLowerCase()) - order.indexOf(b.type.toLowerCase())
    );
    return (
        <View style={styles.sectionBlock}>
            <SectionHead number="01" title="Realisasi Produksi" />
            {sortedItems.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada data produksi.</Text>
            ) : (
                <View style={styles.metricRow}>
                    {sortedItems.map((item, i) => {
                        const percent = item.target > 0 ? Math.round((item.realization / item.target) * 100) : 0;
                        const positive = percent >= 100;
                        const isLast = i === sortedItems.length - 1;
                        return (
                            <View key={item.type} style={isLast ? styles.metricCellLast : styles.metricCell}>
                                <Text style={styles.metricLabel}>{item.type} • {item.period}</Text>
                                <Text style={styles.realisasiFont}>Realisasi</Text>
                                <View style={styles.metricValueRow}>
                                    <Text style={styles.metricValue}>{item.realization.toLocaleString('en-US')}</Text>
                                    <Text style={styles.metricUnit}>{item.unit}</Text>
                                </View>
                                <View style={styles.metricBarTrack}>
                                    <View style={[styles.metricBarFill, { width: `${Math.min(percent, 100)}%` }]} />
                                </View>
                                <View style={styles.metricSubRow}>
                                    <Text style={styles.metricTarget}>Target {item.target.toLocaleString('en-US')} {item.unit}</Text>
                                    <Text style={[styles.metricAchievement, positive ? styles.achievementPositive : styles.achievementNegative]}>
                                        {percent}% RKAP
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

// ============================================================
// RENCANA KERJA
// ============================================================
function SectionRencanaKerja({ items }: { items: RkItem[] }) {
    // kelompokkan per jenis_rk
    const order: string[] = [];
    const groups: Record<string, RkItem[]> = {};
    for (const item of items) {
        if (!groups[item.jenis_rk]) {
            groups[item.jenis_rk] = [];
            order.push(item.jenis_rk);
        }
        groups[item.jenis_rk].push(item);
    }

    return (
        <View style={styles.sectionBlock}>
            <SectionHead number="02" title="Rencana Kerja" />
            {items.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada data rencana kerja.</Text>
            ) : (
                <View style={styles.rkGridWrap}>
                    {order.map((jenis) => {
                        const groupItems = groups[jenis].slice(0, 5);
                        return (
                            <View key={jenis} style={styles.rkGridCol}>
                                <View style={styles.rkGroupBox}>
                                    <View style={styles.rkGroupHeadRow}>
                                        <Text style={styles.rkGroupHeadText}>{jenis}</Text>
                                    </View>
                                    {groupItems.map((item, i) => {
                                        const isLast = i === groupItems.length - 1;
                                        return (
                                            <View key={item.id} style={isLast ? styles.rkItemRowLast : styles.rkItemRow}>
                                                <View style={styles.rkItemTextCol}>
                                                    <Text style={styles.rkItemName}>{item.nama_rk}</Text>
                                                    <Text style={styles.rkItemWilayah}>{item.wilayah_kerja}</Text>
                                                </View>
                                                <Text style={styles.rkItemNumbers}>
                                                    {item.jumlah_minyak !== null ? `${item.jumlah_minyak} BOPD` : ''}
                                                    {item.jumlah_minyak !== null && item.jumlah_gas !== null ? ' / ' : ''}
                                                    {item.jumlah_gas !== null ? `${item.jumlah_gas} MMSCFD` : ''}
                                                    {item.jumlah_minyak === null && item.jumlah_gas === null ? '-' : ''}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

// ============================================================
// HSSE (PROPER + Security + Reduksi)
// ============================================================
function SectionHsse({ proper, security }: { proper: ProperItem[]; security: SecurityItem[] }) {
    return (
        <View style={styles.sectionBlock}>
            <SectionHead number="03" title="HSSE" />

            <View style={styles.rkGridWrap}>
                <View style={styles.rkGridCol}>
                    <View style={styles.rkGroupBox}>
                        <View style={styles.rkGroupHeadRow}>
                            <Text style={styles.rkGroupHeadText}>Penghargaan PROPER</Text>
                        </View>
                        {proper.length === 0 ? (
                            <Text style={styles.emptyText}>Belum ada data PROPER.</Text>
                        ) : (
                            proper.map((item, i) => (
                                <View key={item.id} style={i === proper.length - 1 ? styles.hsseItemRowLast : styles.hsseItemRow}>
                                    <View style={styles.hsseItemTextCol}>
                                        <Text style={styles.hsseItemTitle}>{item.wilayah_kerja}</Text>
                                        <Text style={styles.hsseItemSub}>{item.keterangan || '-'}</Text>
                                    </View>
                                    <View style={styles.hsseMedalYearItemRow}>
                                        <ProperPill peringkat={item.peringkat} />
                                        <Text style={styles.hsseItemMeta}>{item.tahun}</Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </View>

                <View style={styles.rkGridCol}>
                    <View style={styles.rkGroupBox}>
                        <View style={styles.rkGroupHeadRow}>
                            <Text style={styles.rkGroupHeadText}>Security</Text>
                        </View>
                        {security.length === 0 ? (
                            <Text style={styles.emptyText}>Belum ada data security.</Text>
                        ) : (
                            security.map((item, i) => (
                                <View key={item.id} style={i === security.length - 1 ? styles.hsseItemRowLast : styles.hsseItemRow}>
                                    <View style={styles.hsseItemTextCol}>
                                        <Text style={styles.hsseItemTitle}>{item.judul}</Text>
                                        <Text style={styles.hsseItemSub}>{item.wilayah_kerja}</Text>
                                    </View>
                                    <Text style={styles.hsseItemMeta}>{item.tanggal}</Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </View>

            {/* Refuksi */}
            <Text style={styles.subHeadText}>Reduksi Emisi</Text>
            <View style={styles.metricRow}>
                <View style={styles.metricCellLast}>
                    <Text style={styles.metricLabel}>Reduksi Emisi • YTD Oktober 2025</Text>
                    <View style={styles.metricValueRow}>
                        <Text style={styles.metricValue}>22.484</Text>
                        <Text style={styles.metricUnit}>Ton CO2eq</Text>
                    </View>
                    <View style={styles.metricBarTrack}>
                        <View style={[styles.metricBarFill, { width: '100%' }]} />
                    </View>
                    <View style={styles.metricSubRow}>
                        <Text style={styles.metricTarget}>Target 18.582 Ton CO2eq</Text>
                        <Text style={[styles.metricAchievement, styles.achievementPositive]}>121%</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

// ============================================================
// INOVASI
// ============================================================
function SectionInovasi({ items }: { items: InovasiItem[] }) {
    return (
        <View style={styles.sectionBlock}>
            <SectionHead number="04" title="Inovasi" />
            {items.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada data inovasi.</Text>
            ) : (
                <View style={styles.table}>
                    <TableHead columns={[
                        { label: 'No', style: styles.colXS },
                        { label: 'Pencapaian', style: styles.colM },
                        { label: 'Nama Inovasi / Acara', style: styles.colXL },
                        { label: 'Wilayah Kerja', style: styles.colM },
                    ]} />
                    {items.map((item, i) => {
                        const isLast = i === items.length - 1;
                        return (
                            <View key={item.id} style={isLast ? styles.tableRowLast : styles.tableRow}>
                                <Text style={[styles.tableCellMuted, styles.colXS]}>{i + 1}</Text>
                                <Text style={[styles.tableCellBold, styles.colM]}>{item.pencapaian}</Text>
                                <Text style={[styles.tableCellMuted, styles.colXL]}>
                                    {item.nama_inovasi}{item.nama_inovasi && item.nama_acara ? ' — ' : ''}{item.nama_acara}
                                </Text>
                                <Text style={[styles.tableCellMuted, styles.colM]}>{item.wilayah_kerja}</Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

// ============================================================
// TOP PROJECT
// ============================================================
function SectionTopProject({ naratif, abi }: { naratif: NaratifItem[]; abi: AbiItem[] }) {
    return (
        <View style={styles.sectionBlock}>
            <SectionHead number="05" title="Top Project" />

            {naratif.length === 0 && abi.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada data top project.</Text>
            ) : (
                <View style={styles.rkGridWrap}>
                    {/* Kolom kiri: Pencapaian Naratif */}
                    <View style={styles.rkGridCol}>
                        <View style={styles.rkGroupBox}>
                            <View style={styles.rkGroupHeadRow}>
                                <Text style={styles.rkGroupHeadText}>Pencapaian Naratif</Text>
                            </View>
                            {naratif.length === 0 ? (
                                <Text style={styles.emptyText}>Belum ada data.</Text>
                            ) : (
                                naratif.map((item, i) => (
                                    <View key={item.id} style={i === naratif.length - 1 ? styles.hsseItemRowLast : styles.hsseItemRow}>
                                        <View style={styles.hsseItemTextCol}>
                                            <Text style={styles.hsseItemTitle}>{item.title}</Text>
                                            <Text style={styles.hsseItemSub}>{item.detail}</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>

                    {/* Kolom kanan: Realisasi ABI NBD */}
                    <View style={styles.rkGridCol}>
                        <View style={styles.rkGroupBox}>
                            <View style={styles.rkGroupHeadRow}>
                                <Text style={styles.rkGroupHeadText}>Realisasi ABI NBD</Text>
                            </View>
                            {abi.length === 0 ? (
                                <Text style={styles.emptyText}>Belum ada data.</Text>
                            ) : (
                                abi.map((item) => {
                                    const percent = item.target > 0 ? Math.round((item.realization / item.target) * 100) : 0;
                                    const positive = percent >= 100;
                                    return (
                                        <View key={item.id} style={styles.abiMiniCard}>
                                            <Text style={styles.abiMiniTitle}>{item.title}</Text>
                                            <Text style={styles.realisasiFont}>Realisasi</Text>
                                            <View style={styles.metricValueRow}>
                                                <Text style={styles.abiMiniValue}>{item.realization.toLocaleString('en-US')}</Text>
                                                <Text style={styles.metricUnit}>{item.unit}</Text>
                                            </View>
                                            <View style={styles.metricBarTrack}>
                                                <View style={[styles.metricBarFill, { width: `${Math.min(percent, 100)}%` }]} />
                                            </View>
                                            <View style={styles.metricSubRow}>
                                                <Text style={styles.metricTarget}>Target {item.target.toLocaleString('en-US')} {item.unit}</Text>
                                                <Text style={[styles.metricAchievement, positive ? styles.achievementPositive : styles.achievementNegative]}>
                                                    {percent}%
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })
                            )}
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

// ============================================================
// KEHUMASAN
// ============================================================
function SectionKehumasan({ items }: { items: KehumasanItem[] }) {
    return (
        <View style={styles.sectionBlock}>
            <SectionHead number="06" title="Kehumasan" />
            {items.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada data kehumasan.</Text>
            ) : (
                <View style={styles.table}>
                    <TableHead columns={[
                        { label: 'Wilayah Kerja', style: styles.colS },
                        { label: 'Judul', style: styles.colM },
                        { label: 'Deskripsi', style: styles.colXL },
                        { label: 'Tanggal', style: styles.colS },
                        { label: 'Penghargaan', style: styles.colS },
                    ]} />
                    {items.map((item, i) => {
                        const isLast = i === items.length - 1;
                        return (
                            <View key={item.id} style={isLast ? styles.tableRowLast : styles.tableRow}>
                                <Text style={[styles.tableCellBold, styles.colS]}>{item.wilayah_kerja}</Text>
                                <Text style={[styles.tableCellBold, styles.colM]}>{item.judul}</Text>
                                <Text style={[styles.tableCellMuted, styles.colXL]}>{item.deskripsi}</Text>
                                <Text style={[styles.tableCellMuted, styles.colS]}>{formatBulanTahunPdf(item.bulan, item.tahun)}</Text>
                                <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }, styles.colS]}>
                                    <MedalPill medali={item.medali} />
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

// ============================================================
// DOKUMEN UTAMA
// ============================================================
export function AchievementPdfDocument({ data }: { data: PdfData }) {
    const tanggalCetak = new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <Document>
            <Page size="A4" style={styles.page} wrap>
                <View style={styles.coverHeader}>
                    <View>
                        <Text style={styles.coverKicker}>PT Pertamina Hulu Rokan Zona 1</Text>
                        <Text style={styles.coverTitle}>Laporan Achievement</Text>
                    </View>
                    <View style={styles.coverMetaBox}>
                        <Text style={styles.coverMetaLabel}>Tanggal Cetak</Text>
                        <Text style={styles.coverMetaValue}>{tanggalCetak}</Text>
                    </View>
                </View>

                <SectionProduksi items={data.produksi} />
                <SectionRencanaKerja items={data.rencanaKerja} />
                <SectionHsse proper={data.hsseProper} security={data.hsseSecurity} />
                <SectionInovasi items={data.inovasi} />
                <SectionTopProject naratif={data.topProjectNaratif} abi={data.topProjectAbi} />
                <SectionKehumasan items={data.kehumasan} />

                <Footer />
            </Page>
        </Document>
    );
}