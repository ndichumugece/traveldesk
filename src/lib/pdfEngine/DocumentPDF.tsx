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
        justifyContent: 'flex-start',
    },
    logoImage: {
        maxWidth: 250,
        maxHeight: 100,
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
    },
    // Voucher Specific Styles
    voucherHeader: {
        marginTop: 20,
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eeeeee',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        textTransform: 'uppercase',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    gridItem: {
        width: '50%',
        paddingRight: 15,
        marginBottom: 8,
    },
    gridItemFull: {
        width: '100%',
        marginBottom: 8,
    },
    fieldLabel: {
        fontSize: 8,
        color: '#777777',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    fieldValue: {
        fontSize: 10,
        color: '#111111',
        fontWeight: 'bold',
    },
    statusBox: {
        padding: 5,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
    },
    listSection: {
        marginTop: 10,
        marginBottom: 10,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    bullet: {
        width: 8,
        fontSize: 10,
    },
    listItemText: {
        fontSize: 9,
        color: '#555555',
        flex: 1,
    },
    signatureBlock: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureLine: {
        width: '45%',
        borderTopWidth: 1,
        borderTopColor: '#333333',
        marginTop: 30,
        paddingTop: 5,
    },
    signatureLabel: {
        fontSize: 8,
        color: '#555555',
        textAlign: 'center',
    },
    // Quotation Specific Styles
    optionCard: {
        backgroundColor: '#f9fafb',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 15,
    },
    optionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingBottom: 5,
    },
    optionProperty: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#111827',
    },
    optionPrice: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#059669',
    },
    optionSubheader: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 6,
    },
    optionMeta: {
        fontSize: 9,
        color: '#6b7280',
    },
    optionDescription: {
        fontSize: 9,
        color: '#4b5563',
        lineHeight: 1.4,
        marginTop: 4,
    },
    inclusionsTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 15,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 4,
    },
    inclusionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    inclusionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '30%',
        marginBottom: 5,
    },
    checkIcon: {
        width: 8,
        height: 8,
        backgroundColor: '#059669',
        borderRadius: 2,
        marginRight: 6,
    },
    inclusionText: {
        fontSize: 8,
        color: '#374151',
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
    checkIn?: string;
    checkOut?: string;
    lineItems: LineItem[];
    metadata?: any;
    settings?: AgencySettings | null;
}

export const DocumentPDF = ({ documentType, reference, clientName, clientEmail, date, checkIn, checkOut, lineItems, metadata, settings }: DocumentPDFProps) => {
    const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const primaryColor = settings?.primary_color || '#3f3f3f';

    // We will extract the hotel/main description from the first line item to display under the Billed To section
    const mainDescription = lineItems.length > 0 ? lineItems[0].description : '';

    if (documentType === 'Voucher' || documentType === 'Booking') {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    {/* Voucher Header Style */}
                    <View style={styles.header}>
                        <View style={styles.logoArea}>
                            {settings?.logo_url ? (
                                <Image style={styles.logoImage} src={settings.logo_url} />
                            ) : (
                                <View>
                                    <Text style={styles.logoTextPrimary}>{settings?.legal_name?.toUpperCase() || 'TRAVEL AGENCY'}</Text>
                                    <Text style={styles.logoTextSecondary}>Hospitality & Travel Services</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.headerRight}>
                            <Text style={styles.documentType}>{documentType === 'Booking' ? 'BOOKING VOUCHER' : 'CONFIRMATION VOUCHER'}</Text>
                            <Text style={styles.documentRef}># {reference}</Text>
                        </View>
                    </View>


                    {/* Main Voucher Content Grid */}
                    <View style={styles.gridContainer}>
                        {/* Reservation Details */}
                        <View style={{ width: '100%', marginBottom: 20 }}>
                            <Text style={styles.sectionTitle}>Reservation Record</Text>
                            <View style={styles.gridContainer}>
                                <View style={styles.gridItem}>
                                    <Text style={styles.fieldLabel}>Name of Unit</Text>
                                    <Text style={styles.fieldValue}>{metadata?.unitName}</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.fieldLabel}>Number of Guests</Text>
                                    <Text style={styles.fieldValue}>
                                        {metadata?.numGuests || (metadata?.rooms?.reduce((acc: number, r: any) => acc + (Number(r.adults) || 0) + (Number(r.children) || 0), 0)) || '0'}
                                    </Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.fieldLabel}>Date of Arrival</Text>
                                    <Text style={styles.fieldValue}>{checkIn || date}</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.fieldLabel}>Time of Arrival</Text>
                                    <Text style={styles.fieldValue}>{metadata?.checkInTime}</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.fieldLabel}>Date of Departure</Text>
                                    <Text style={styles.fieldValue}>{checkOut || 'TBD'}</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.fieldLabel}>Time of Departure</Text>
                                    <Text style={styles.fieldValue}>{metadata?.checkOutTime}</Text>
                                </View>
                                {documentType === 'Booking' && (
                                    <>
                                        <View style={styles.gridItem}>
                                            <Text style={styles.fieldLabel}>Nationality</Text>
                                            <Text style={styles.fieldValue}>{metadata?.nationality}</Text>
                                        </View>
                                        <View style={styles.gridItem}>
                                            <Text style={styles.fieldLabel}>Package Type</Text>
                                            <Text style={styles.fieldValue}>{metadata?.packageType}</Text>
                                        </View>

                                    </>
                                )}
                            </View>
                        </View>

                        {/* Guest Details */}
                        <View style={styles.gridItem}>
                            <Text style={styles.sectionTitle}>Guest Information</Text>
                            <Text style={styles.fieldLabel}>Main Guest</Text>
                            <Text style={[styles.fieldValue, { marginBottom: 3 }]}>{metadata?.guestName || clientName}</Text>
                            <Text style={styles.fieldLabel}>Phone</Text>
                            <Text style={[styles.fieldValue, { marginBottom: 3 }]}>{metadata?.guestPhone}</Text>
                            <Text style={styles.fieldLabel}>Email</Text>
                            <Text style={[styles.fieldValue, { marginBottom: 3 }]}>{metadata?.guestEmail || clientEmail}</Text>
                            {metadata?.additionalGuestInfo && (
                                <>
                                    <Text style={styles.fieldLabel}>Additional Guest Info</Text>
                                    <Text style={styles.fieldValue}>{metadata?.additionalGuestInfo}</Text>
                                </>
                            )}
                        </View>

                        {/* Rate & Finance */}
                        <View style={styles.gridItem}>
                            <Text style={styles.sectionTitle}>Financial Status</Text>
                            <View style={styles.gridContainer}>
                                <View style={styles.gridItem}>
                                    <Text style={styles.fieldLabel}>Room Type</Text>
                                    <Text style={styles.fieldValue}>{metadata?.roomType}</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.fieldLabel}>Meal Plan</Text>
                                    <Text style={styles.fieldValue}>{metadata?.mealPlan}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Booking Specific Sections */}
                    {documentType === 'Booking' && metadata?.rooms && metadata.rooms.length > 0 && (
                        <View style={{ marginTop: 10 }}>
                            <Text style={styles.sectionTitle}>Room Configurations</Text>
                            <View style={styles.gridContainer}>
                                {metadata.rooms.map((room: any, idx: number) => (
                                    <View key={idx} style={[styles.gridItem, { width: '33.33%', marginBottom: 10 }]}>
                                        <Text style={[styles.fieldLabel, { fontSize: 7 }]}>Room {idx + 1}</Text>
                                        <Text style={styles.fieldValue}>
                                            {room.adults} Adults, {room.children} Children
                                            {room.childAges && room.childAges.length > 0 && ` (${room.childAges.filter((a: any) => a).map((a: any) => `${a}y`).join(', ')})`}
                                        </Text>
                                        <Text style={[styles.fieldValue, { fontSize: 8, marginTop: 2 }]}>{room.bedType}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {documentType === 'Booking' && (
                        <View style={{ marginTop: 10 }}>
                            <Text style={styles.sectionTitle}>Transport & Logistics</Text>
                            <View style={styles.gridContainer}>
                                <View style={styles.gridItem}>
                                    <Text style={styles.fieldLabel}>Arrival Transfer</Text>
                                    <Text style={styles.fieldValue}>{metadata?.arrivalTransport || 'Not specified'}</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.fieldLabel}>Departure Transfer</Text>
                                    <Text style={styles.fieldValue}>{metadata?.departureTransport || 'Not specified'}</Text>
                                </View>
                                <View style={styles.gridItemFull}>
                                    <Text style={styles.fieldLabel}>Transport Notes</Text>
                                    <Text style={styles.fieldValue}>{metadata?.transportNote || 'No extra notes'}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {documentType === 'Booking' && (
                        <View style={{ marginTop: 10 }}>
                            <Text style={styles.sectionTitle}>Preferences & Requests</Text>
                            <View style={styles.gridContainer}>
                                <View style={styles.gridItem}>
                                    <Text style={styles.fieldLabel}>Dietary Requirements</Text>
                                    <Text style={styles.fieldValue}>{metadata?.dietaryRequests || 'None'}</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.fieldLabel}>Special Requests</Text>
                                    <Text style={styles.fieldValue}>{metadata?.specialRequests || 'None'}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                </Page>
            </Document>
        );
    }

    if (documentType === 'Quotation') {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoArea}>
                            {settings?.logo_url ? (
                                <Image style={styles.logoImage} src={settings.logo_url} />
                            ) : (
                                <View>
                                    <Text style={styles.logoTextPrimary}>{settings?.legal_name?.toUpperCase() || 'TRAVEL AGENCY'}</Text>
                                    <Text style={styles.logoTextSecondary}>Premium Travel Experiences</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.headerRight}>
                            <Text style={styles.documentType}>QUOTATION</Text>
                            <Text style={styles.documentRef}>Ref: {reference}</Text>
                            {metadata?.bookingId && (
                                <Text style={[styles.documentRef, { color: '#6b7280', fontSize: 8 }]}>Booking ID: {metadata.bookingId}</Text>
                            )}
                        </View>
                    </View>

                    {/* Quotation Info Box */}
                    <View style={[styles.gridContainer, { backgroundColor: '#f9fafb', padding: 15, borderRadius: 8, marginBottom: 25 }]}>
                        <View style={styles.gridItem}>
                            <Text style={styles.fieldLabel}>Client Name</Text>
                            <Text style={styles.fieldValue}>{clientName || 'Valued Client'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.fieldLabel}>Package Type</Text>
                            <Text style={styles.fieldValue}>{metadata?.packageType || 'Road'}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.fieldLabel}>Travel Dates</Text>
                            <Text style={styles.fieldValue}>{checkIn} to {checkOut}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.fieldLabel}>No. of Guests</Text>
                            <Text style={styles.fieldValue}>{metadata?.numGuests || 'Not specified'}</Text>
                        </View>
                    </View>

                    {/* Hotel Options Section */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.sectionTitle}>Proposed Property Options</Text>
                        {metadata?.hotelOptions?.map((option: any, idx: number) => (
                            <View key={idx} style={styles.optionCard}>
                                <View style={styles.optionHeader}>
                                    <Text style={styles.optionProperty}>{option.property || 'Property Option'}</Text>
                                    <Text style={styles.optionPrice}>{option.price}</Text>
                                </View>
                                <View style={styles.optionSubheader}>
                                    <Text style={styles.optionMeta}>Meal Plan: {option.mealPlan || 'Not specified'}</Text>
                                    <Text style={styles.optionMeta}>Status: {metadata?.quotationStatus || 'Tentative'}</Text>
                                </View>
                                {option.description && (
                                    <Text style={styles.optionDescription}>{option.description}</Text>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Inclusions Section */}
                    {metadata?.selectedInclusions && metadata.selectedInclusions.length > 0 && (
                        <View style={{ marginBottom: 25 }}>
                            <Text style={styles.inclusionsTitle}>What's Included</Text>
                            <View style={styles.inclusionsGrid}>
                                {metadata.selectedInclusions.map((item: string, idx: number) => (
                                    <View key={idx} style={styles.inclusionItem}>
                                        <View style={styles.checkIcon} />
                                        <Text style={styles.inclusionText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Additional Notes */}
                    {metadata?.additionalNotes && (
                        <View style={{ marginTop: 10 }}>
                            <Text style={styles.sectionTitle}>Important Notes</Text>
                            <Text style={styles.optionDescription}>{metadata.additionalNotes}</Text>
                        </View>
                    )}

                    {/* Sign-off if needed */}
                    <View style={{ marginTop: 'auto', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
                        <Text style={[styles.optionMeta, { textAlign: 'center' }]}>
                            This quotation is subject to availability at the time of booking.
                        </Text>
                        {settings?.default_footer_note && (
                            <Text style={[styles.footerNote, { borderTopWidth: 0, marginTop: 5 }]}>{settings.default_footer_note}</Text>
                        )}
                    </View>
                </Page>
            </Document>
        );
    }

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
                        {checkIn && (
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Check In :</Text>
                                <Text style={styles.metaValue}>{checkIn}</Text>
                            </View>
                        )}
                        {checkOut && (
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Check Out :</Text>
                                <Text style={styles.metaValue}>{checkOut}</Text>
                            </View>
                        )}
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
