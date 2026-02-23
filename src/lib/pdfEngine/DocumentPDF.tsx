import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { AgencySettings } from '../../hooks/useSettings';

// Register fonts if needed, using standard fonts for now
Font.register({
    family: 'Open Sans',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 }
    ]
});

const styles = StyleSheet.create({
    page: {
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 50,
        paddingRight: 50,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
        fontSize: 10,
        color: '#333333'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    logoArea: {
        width: '50%',
        justifyContent: 'center',
    },
    logoImage: {
        maxWidth: 150,
        maxHeight: 60,
        objectFit: 'contain',
    },
    logoTextPrimary: {
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 2,
        color: '#111111'
    },
    logoTextSecondary: {
        fontSize: 7,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: '#555555'
    },
    headerRight: {
        width: '50%',
        alignItems: 'flex-end',
    },
    documentType: {
        fontSize: 32,
        fontWeight: 'normal',
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: '#111111',
    },
    documentRef: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 4,
        color: '#333333',
    },
    balanceDueBox: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    balanceDueLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 2,
    },
    balanceDueAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111111',
    },
    companyInfo: {
        marginTop: 10,
        marginBottom: 40,
    },
    companyName: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    companyDetail: {
        fontSize: 9,
        color: '#555555',
        marginBottom: 2,
        lineHeight: 1.4,
    },
    billingSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    billedToArea: {
        width: '50%',
    },
    billedToLabel: {
        fontSize: 10,
        color: '#555555',
        marginBottom: 4,
    },
    clientName: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#111111',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    clientEmail: {
        fontSize: 9,
        color: '#555555',
    },
    metaArea: {
        width: '50%',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 6,
    },
    metaLabel: {
        fontSize: 10,
        color: '#555555',
        width: 100,
        textAlign: 'right',
        marginRight: 10,
    },
    metaValue: {
        fontSize: 10,
        color: '#333333',
        width: 80,
        textAlign: 'right',
    },
    descriptionSection: {
        marginBottom: 20,
    },
    descriptionLabel: {
        fontSize: 10,
        color: '#333333',
        marginBottom: 4,
    },
    descriptionText: {
        fontSize: 10,
        textTransform: 'uppercase',
        color: '#333333',
    },
    table: {
        width: '100%',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#3f3f3f',
        color: '#ffffff',
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    thIndex: { width: '5%', fontSize: 9, color: '#ffffff' },
    thDesc: { width: '45%', fontSize: 9, color: '#ffffff' },
    thQty: { width: '15%', textAlign: 'right', fontSize: 9, color: '#ffffff' },
    thRate: { width: '15%', textAlign: 'right', fontSize: 9, color: '#ffffff' },
    thAmount: { width: '20%', textAlign: 'right', fontSize: 9, color: '#ffffff' },

    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    tdIndex: { width: '5%', fontSize: 9, color: '#333333' },
    tdDesc: { width: '45%', fontSize: 9, color: '#555555', textTransform: 'uppercase' },
    tdQty: { width: '15%', textAlign: 'right', fontSize: 9, color: '#333333' },
    tdRate: { width: '15%', textAlign: 'right', fontSize: 9, color: '#333333' },
    tdAmount: { width: '20%', textAlign: 'right', fontSize: 9, color: '#333333' },

    totalsArea: {
        alignItems: 'flex-end',
        marginBottom: 40,
    },
    totalsBox: {
        width: '50%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    totalRowNoBorder: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    totalLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#111111',
    },
    totalValue: {
        fontSize: 10,
        color: '#333333',
    },
    totalValueBold: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#111111',
    },
    balanceGrounded: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f2f2f2',
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginTop: 10,
    },
    notesSection: {
        marginTop: 30,
    },
    notesTitle: {
        fontSize: 12,
        color: '#333333',
        marginBottom: 8,
        fontWeight: 'bold',
    },
    notesText: {
        fontSize: 9,
        color: '#555555',
        lineHeight: 1.5,
    },
    footerNote: {
        marginTop: 40,
        fontSize: 9,
        color: '#888888',
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eeeeee',
        paddingTop: 10,
    }
});

interface LineItem {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
}

interface DocumentPDFProps {
    documentType: string;
    reference: string;
    clientName: string;
    clientEmail: string;
    date: string;
    lineItems: LineItem[];
    settings?: AgencySettings | null;
}

export const DocumentPDF = ({ documentType, reference, clientName, clientEmail, date, lineItems, settings }: DocumentPDFProps) => {
    const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const primaryColor = settings?.primary_color || '#3f3f3f';

    // We will extract the hotel/main description from the first line item to display under the Billed To section
    const mainDescription = lineItems.length > 0 ? lineItems[0].description : '';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoArea}>
                        {settings?.logo_url ? (
                            <Image style={styles.logoImage} src={settings.logo_url} />
                        ) : (
                            <>
                                <Text style={styles.logoTextPrimary}>{settings?.legal_name?.toUpperCase() || 'TRAVEL AGENCY'}</Text>
                                <Text style={styles.logoTextSecondary}>Official Document</Text>
                            </>
                        )}
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.documentType}>{documentType === 'Quotation' ? 'QUOTATION' : 'INVOICE'}</Text>
                        <Text style={styles.documentRef}># {reference}</Text>
                        <View style={styles.balanceDueBox}>
                            <Text style={styles.balanceDueLabel}>Balance Due</Text>
                            <Text style={styles.balanceDueAmount}>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                    </View>
                </View>

                {/* Company Info */}
                <View style={styles.companyInfo}>
                    <Text style={styles.companyName}>{settings?.legal_name || 'TravelDesk Agency'}</Text>
                    {settings?.tax_id && <Text style={styles.companyDetail}>Tax ID / Reg: {settings.tax_id}</Text>}
                    {settings?.address && <Text style={styles.companyDetail}>{settings.address}</Text>}
                    {settings?.phone && <Text style={styles.companyDetail}>{settings.phone}</Text>}
                    {settings?.support_email && <Text style={styles.companyDetail}>{settings.support_email}</Text>}
                </View>

                {/* Billing Info & Meta */}
                <View style={styles.billingSection}>
                    <View style={styles.billedToArea}>
                        <Text style={styles.billedToLabel}>Bill To</Text>
                        <Text style={styles.clientName}>{clientName || 'Valued Client'}</Text>
                        {clientEmail && <Text style={styles.clientEmail}>{clientEmail}</Text>}
                    </View>
                    <View style={styles.metaArea}>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Invoice Date :</Text>
                            <Text style={styles.metaValue}>{date}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Terms :</Text>
                            <Text style={styles.metaValue}>Custom</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Due Date :</Text>
                            {/* Assuming due date is same as issue date for now, or could add 30 days */}
                            <Text style={styles.metaValue}>{date}</Text>
                        </View>
                    </View>
                </View>

                {/* Main Package Description */}
                {mainDescription && (
                    <View style={styles.descriptionSection}>
                        <Text style={styles.descriptionLabel}>Description :</Text>
                        <Text style={styles.descriptionText}>{mainDescription}</Text>
                    </View>
                )}

                {/* Line Items Table */}
                <View style={styles.table}>
                    <View style={[styles.tableHeader, { backgroundColor: primaryColor }]}>
                        <Text style={styles.thIndex}>#</Text>
                        <Text style={styles.thDesc}>Item & Description</Text>
                        <Text style={styles.thQty}>Qty</Text>
                        <Text style={styles.thRate}>Rate</Text>
                        <Text style={styles.thAmount}>Amount</Text>
                    </View>

                    {lineItems.map((item, index) => (
                        <View key={item.id || index} style={styles.tableRow}>
                            <Text style={styles.tdIndex}>{index + 1}</Text>
                            <Text style={styles.tdDesc}>{item.description}</Text>
                            <Text style={styles.tdQty}>{item.quantity.toFixed(2)}</Text>
                            <Text style={styles.tdRate}>{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                            <Text style={styles.tdAmount}>{(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                    ))}
                </View>

                {/* Totals Box */}
                <View style={styles.totalsArea}>
                    <View style={styles.totalsBox}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Sub Total</Text>
                            <Text style={styles.totalValue}>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                        <View style={styles.totalRowNoBorder}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValueBold}>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                        <View style={styles.balanceGrounded}>
                            <Text style={styles.totalLabel}>Balance Due</Text>
                            <Text style={styles.totalValueBold}>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                    </View>
                </View>

                {/* Notes & Payment Details */}
                {settings?.default_terms && (
                    <View style={styles.notesSection}>
                        <Text style={styles.notesTitle}>Terms & Conditions</Text>
                        <Text style={styles.notesText}>{settings.default_terms}</Text>
                    </View>
                )}

                {/* Footer Note */}
                {settings?.default_footer_note && (
                    <Text style={styles.footerNote}>{settings.default_footer_note}</Text>
                )}
            </Page>
        </Document>
    );
};
