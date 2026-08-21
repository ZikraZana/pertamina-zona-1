import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

// ============================================================
// PALET WARNA
// ============================================================
const COLORS = {
    blue900: '#1e3a8a',
    blue700: '#1d4ed8',
    blue100: '#dbeafe',
    blue50: '#eff6ff',
    slate800: '#1e293b',
    slate600: '#475569',
    slate400: '#94a3b8',
    slate200: '#e2e8f0',
    white: '#ffffff',
};

const styles = StyleSheet.create({

    // Basic
    page: {
        padding: 32,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: COLORS.slate800,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.blue900,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 10,
        color: COLORS.slate400,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.blue900,
        marginBottom: 8,
        marginTop: 4,
    },
    subSectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.blue700,
        marginBottom: 6,
        marginTop: 10,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.blue900,
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    tableHeaderCell: {
        flex: 1,
        color: COLORS.white,
        fontSize: 9,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: `1px solid ${COLORS.slate200}`,
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    tableCell: {
        flex: 1,
        fontSize: 9,
        color: COLORS.slate600,
    },
    sectionWrapper: {
        marginBottom: 24,
    },
    emptyText: {
        fontSize: 9,
        color: COLORS.slate400,
        fontStyle: 'italic',
        marginBottom: 8,
    },


    // start Produksi //
    produksiCard: {
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        padding: 20,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'capitalize',
    },
    cardPeriod: {
        fontSize: 9,
        color: '#94a3b8',
        marginTop: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    chip: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        fontSize: 9,
        fontWeight: 'bold',
        backgroundColor: '#dbeafe',
        color: '#1d4ed8',
    },
    bigNumberRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: 16,
    },
    bigNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginRight: 6,
    },
    unitText: {
        fontSize: 10,
        color: '#94a3b8',
    },
    cardFlex: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    barTrack: {
        height: 6,
        borderRadius: 999,
        backgroundColor: '#f1f5f9',
        marginTop: 10,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 999,
        backgroundColor: '#1d4ed8',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    smallLabel: {
        fontSize: 8,
        color: '#94a3b8',
    },

    // end Produksi //

    // start Rencana Kerja //
    sectionRKFlex: {
        flexDirection: 'row'
    },

    // end Rencana Kerja //

    // start Top Project //
    topAbiCard: {
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        padding: 20,
        marginBottom: 12,
    },

    cardTitleTopAbi: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'capitalize',
    },

    cardPeriodTopAbi: {
        fontSize: 9,
        color: '#94a3b8',
        marginTop: 2,
    },

    headerRowTopAbi: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flex: 1,
    },

    textContainerTopAbi: {
        flex: 1,
        paddingRight: 12,
    },

    chipTopAbi: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        fontSize: 9,
        fontWeight: 'bold',
        backgroundColor: '#dbeafe',
        color: '#1d4ed8'
    },

    bigNumberRowTopAbi: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: '16'
    },

    bigNumberTopAbi: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        marginRight: 6,
    },

    unitTextTopAbi: {
        fontSize: 10,
        color: '#94a3b8',
    },

    cardFlexTopAbi: {
        flexDirection: 'row',
        gap: 8,
    },

    // end Top Project //



});

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
type KehumasanItem = { id: string; wilayah_kerja: string; kategori: string; sub_kategori: string; medali: string };

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
// HELPER: header + baris kosong reusable, biar tidak menulis ulang di tiap section
// ============================================================
function TableHeader({ labels }: { labels: string[] }) {
    return (
        <View style={styles.tableHeaderRow}>
            {labels.map((label) => (
                <Text key={label} style={styles.tableHeaderCell}>{label}</Text>
            ))}
        </View>
    );
}

// ============================================================
// SECTION 1: PRODUKSI
// ============================================================
function ProduksiCard({ item }: { item: ProduksiItem | undefined }) {
    const realization = item?.realization ?? 0;
    const target = item?.target || 1;
    const percent = Math.round((realization / target) * 100);

    return (
        <View style={styles.produksiCard}>
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.cardTitle}>{item?.type}</Text>
                    <Text style={styles.cardPeriod}>{item?.period}</Text>
                </View>
                <Text style={styles.chip}>{percent}% RKAP</Text>
            </View>

            <View style={styles.bigNumberRow}>
                <Text style={styles.bigNumber}>{item?.realization?.toLocaleString('en-US') ?? '-'}</Text>
                <Text style={styles.unitText}>{item?.unit}</Text>
            </View>

            <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${Math.min(percent, 100)}%` }]} />
            </View>
            <View style={styles.bottomRow}>
                <Text style={styles.smallLabel}>Realisasi</Text>
                <Text style={styles.smallLabel}>Target: {item?.target?.toLocaleString('en-US') ?? '-'} {item?.unit}</Text>
            </View>
        </View>
    );
}

function SectionProduksi({ items }: { items: ProduksiItem[] }) {
    const minyak = items.find((i) => i.type === 'minyak');
    const gas = items.find((i) => i.type === 'gas');
    const migas = items.find((i) => i.type === 'migas');

    return (
        <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>1. Produksi</Text>
            {items.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada data produksi.</Text>
            ) : (
                <View style={styles.cardFlex}>
                    <ProduksiCard item={minyak} />
                    <ProduksiCard item={gas} />
                    <ProduksiCard item={migas} />
                </View>
            )}
        </View>
    );
}

// ============================================================
// SECTION 2: RENCANA KERJA — dikelompokkan per jenis_rk
// ============================================================
function SectionRencanaKerja({ items }: { items: RkItem[] }) {
    const groups: Record<string, RkItem[]> = {};
    for (const item of items) {
        if (!groups[item.jenis_rk]) groups[item.jenis_rk] = [];
        groups[item.jenis_rk].push(item);
    }
    const groupKeys = Object.keys(groups);

    return (
        <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>2. Rencana Kerja</Text>

            <View>

            </View>


            {/* {groupKeys.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada data rencana kerja.</Text>
            ) : (
                groupKeys.map((jenis) => (
                    <View key={jenis}>
                        <Text style={styles.subSectionTitle}>{jenis}</Text>
                        <TableHeader labels={['Nama RK', 'Wilayah Kerja', 'Minyak (BOPD)', 'Gas (MMSCFD)']} />
                        {groups[jenis].map((item) => (
                            <View key={item.id} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{item.nama_rk}</Text>
                                <Text style={styles.tableCell}>{item.wilayah_kerja}</Text>
                                <Text style={styles.tableCell}>{item.jumlah_minyak ?? '-'}</Text>
                                <Text style={styles.tableCell}>{item.jumlah_gas ?? '-'}</Text>
                            </View>
                        ))}
                    </View>
                ))
            )} */}
        </View>
    );
}

// ============================================================
// SECTION 3: HSSE (PROPER + Security)
// ============================================================
function SectionHsse({ proper, security }: { proper: ProperItem[]; security: SecurityItem[] }) {
    return (
        <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>3. HSSE</Text>

            <Text style={styles.subSectionTitle}>PROPER</Text>
            {proper.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada data PROPER.</Text>
            ) : (
                <View>
                    <TableHeader labels={['Wilayah Kerja', 'Peringkat', 'Tahun', 'Keterangan']} />
                    {proper.map((item) => (
                        <View key={item.id} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{item.wilayah_kerja}</Text>
                            <Text style={styles.tableCell}>{item.peringkat}</Text>
                            <Text style={styles.tableCell}>{item.tahun}</Text>
                            <Text style={styles.tableCell}>{item.keterangan ?? '-'}</Text>
                        </View>
                    ))}
                </View>
            )}

            <Text style={styles.subSectionTitle}>Security</Text>
            {security.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada data security.</Text>
            ) : (
                <View>
                    <TableHeader labels={['Judul', 'Wilayah Kerja', 'Tanggal']} />
                    {security.map((item) => (
                        <View key={item.id} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{item.judul}</Text>
                            <Text style={styles.tableCell}>{item.wilayah_kerja}</Text>
                            <Text style={styles.tableCell}>
                                {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

// ============================================================
// SECTION 4: INOVASI
// ============================================================
function SectionInovasi({ items }: { items: InovasiItem[] }) {
    return (
        <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>4. Inovasi</Text>
            {items.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada data inovasi.</Text>
            ) : (
                <View>
                    <TableHeader labels={['Pencapaian', 'Nama Inovasi', 'Acara', 'Wilayah Kerja']} />
                    {items.map((item) => (
                        <View key={item.id} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{item.pencapaian}</Text>
                            <Text style={styles.tableCell}>{item.nama_inovasi}</Text>
                            <Text style={styles.tableCell}>{item.nama_acara ?? '-'}</Text>
                            <Text style={styles.tableCell}>{item.wilayah_kerja}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

// ============================================================
// SECTION 5: TOP PROJECT (Naratif + ABI NBD)
// ============================================================
function SectionTopProject({ naratif, abi }: { naratif: NaratifItem[]; abi: AbiItem[] }) {
    return (
        <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>5. Top Project</Text>

            <Text style={styles.subSectionTitle}>Pencapaian</Text>
            {naratif.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada data pencapaian.</Text>
            ) : (
                <View>
                    <TableHeader labels={['Judul', 'Detail']} />
                    {naratif.map((item) => (
                        <View key={item.id} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{item.title}</Text>
                            <Text style={styles.tableCell}>{item.detail}</Text>
                        </View>
                    ))}
                </View>
            )}

            <Text style={styles.subSectionTitle}>ABI NBD</Text>

            <View>
                {abi.map((item) => (
                    <View style={styles.topAbiCard}>
                        <View style={styles.headerRowTopAbi}>
                            <View>
                                <Text style={styles.cardTitleTopAbi}>Proyek Strategis Peningkatan Kapasitas Produksi.</Text>
                                <Text style={styles.cardPeriodTopAbi}></Text>
                            </View>
                            <Text style={styles.chipTopAbi}>% RKAP</Text>
                        </View>
                        <View style={styles.bigNumberRowTopAbi}>
                            <Text style={styles.bigNumberTopAbi}></Text>
                            <Text style={styles.unitTextTopAbi}></Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* {abi.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada data ABI NBD.</Text>
            ) : (
                <View>
                    <TableHeader labels={['Judul', 'Realisasi', 'Target', 'Periode']} />
                    {abi.map((item) => (
                        <View key={item.id} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{item.title}</Text>
                            <Text style={styles.tableCell}>{item.realization.toLocaleString('en-US')} {item.unit}</Text>
                            <Text style={styles.tableCell}>{item.target.toLocaleString('en-US')} {item.unit}</Text>
                            <Text style={styles.tableCell}>{item.period}</Text>
                        </View>
                    ))}
                </View>
            )} */}
        </View>
    );
}

// ============================================================
// SECTION 6: KEHUMASAN — dikelompokkan per wilayah_kerja
// ============================================================
function SectionKehumasan({ items }: { items: KehumasanItem[] }) {
    const groups: Record<string, KehumasanItem[]> = {};
    for (const item of items) {
        if (!groups[item.wilayah_kerja]) groups[item.wilayah_kerja] = [];
        groups[item.wilayah_kerja].push(item);
    }
    const groupKeys = Object.keys(groups);

    return (
        <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>6. Kehumasan</Text>
            {groupKeys.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada data kehumasan.</Text>
            ) : (
                groupKeys.map((wilayah) => (
                    <View key={wilayah}>
                        <Text style={styles.subSectionTitle}>{wilayah}</Text>
                        <TableHeader labels={['Kategori', 'Sub Kategori', 'Medali']} />
                        {groups[wilayah].map((item) => (
                            <View key={item.id} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{item.kategori}</Text>
                                <Text style={styles.tableCell}>{item.sub_kategori}</Text>
                                <Text style={[styles.tableCell, { textTransform: 'capitalize' }]}>{item.medali}</Text>
                            </View>
                        ))}
                    </View>
                ))
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
            <Page size="A4" style={styles.page}>
                <Text style={styles.headerTitle}>Laporan Achievement — Zona 1</Text>
                <Text style={styles.headerSubtitle}>Dicetak pada {tanggalCetak}</Text>

                <SectionProduksi items={data.produksi} />
                <SectionRencanaKerja items={data.rencanaKerja} />
                <SectionHsse proper={data.hsseProper} security={data.hsseSecurity} />
                <SectionInovasi items={data.inovasi} />
                <SectionTopProject naratif={data.topProjectNaratif} abi={data.topProjectAbi} />
                <SectionKehumasan items={data.kehumasan} />
            </Page>
        </Document>
    );
}