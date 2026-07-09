import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FileText, Download, ShieldCheck, Award, FileCheck, Eye, Printer, X, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ReportsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [activeCertModal, setActiveCertModal] = useState(null); // '80G' or '12A' or null

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const certData = {
    '80G': {
      title: '80G Tax Exemption Approval Certificate',
      formNo: 'FORM NO. 106 (See rule 181)',
      subHeading: 'Order for provisional approval u/s 354',
      applicantName: 'CHARITAGE FOUNDATION',
      address: 'Plot No 31, Pandan Road Wathoda Layout, Bhandewadi, NAGPUR, Maharashtra, INDIA - 440008',
      pan: 'AANCC6167A',
      din: 'AANCC6167AF2026102',
      appNo: '769073380260426',
      nature: 'Charitable',
      section: '354(4)',
      urn: 'AANCC6167AF20261',
      date: '06-05-2026',
      taxYears: 'From TY 2026-27 to TY 2028-29',
      authority: 'Naveen Gupta',
      designation: 'Principal Director of Income Tax'
    },
    '12A': {
      title: '12A Trust Registration Certificate',
      formNo: 'FORM NO. 106 (See rule 181)',
      subHeading: 'Order for provisional registration u/s 332',
      applicantName: 'CHARITAGE FOUNDATION',
      address: 'Plot No 31, Pandan Road Wathoda Layout, Bhandewadi, NAGPUR, Maharashtra, INDIA - 440008',
      pan: 'AANCC6167A',
      din: 'AANCC6167AE2026101',
      appNo: '769073380260426',
      nature: 'Charitable',
      section: '332(8)',
      urn: 'AANCC6167AE20261',
      date: '06-05-2026',
      taxYears: 'From TY 2026-27 to TY 2028-29',
      authority: 'Naveen Gupta',
      designation: 'Principal Director of Income Tax'
    }
  };

  const handleDownloadCertificate = (certType) => {
    const d = certData[certType];
    const certText = `
====================================================================================================
                                      INCOME TAX DEPARTMENT
                                      GOVERNMENT OF INDIA
                                          ${d.formNo}
                                ${d.subHeading}
====================================================================================================

PART A: PARTICULARS OF THE APPLICANT
----------------------------------------------------------------------------------------------------
1. Name:                             ${d.applicantName}
2. Address:                          ${d.address}
3. Permanent Account Number (PAN):    ${d.pan}

PART B: DETAILS OF ${certType === '80G' ? 'APPROVAL' : 'REGISTRATION'} GRANTED
----------------------------------------------------------------------------------------------------
4. Document Identification Number:   ${d.din}
4a. Application Number:              ${d.appNo}
5. Nature of Activities:             ${d.nature}
6. Section Granted:                  ${d.section}
7. Unique Registration Number (URN): ${d.urn}
8. Date of Approval/Registration:    ${d.date}
9. Tax Years Approved:               ${d.taxYears}

PART C: CONDITIONS GRANTED
----------------------------------------------------------------------------------------------------
a) Any income of the registered non-profit organisation shall not be applied, other than for its objects;
b) The registered non-profit organisation shall not apply any part of its total income for private religious purposes;
c) The non-profit organisation shall comply with all requirements under the Income Tax Act, 1961.

PART D: DETAILS OF THE AUTHORITY PASSING THE ORDER
----------------------------------------------------------------------------------------------------
Name:                                ${d.authority}
Designation:                         ${d.designation}
Status:                              Digitally Signed & Verified
====================================================================================================
`;

    const blob = new Blob([certText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Charitage_Foundation_${certType}_Certificate.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`${d.title} downloaded successfully!`);
  };

  return (
    <div className="min-h-screen bg-slate-50/50" data-testid="reports-page">
      <Navbar />

      {/* Hero Banner */}
      <section className="py-16 md:py-24 bg-primary text-white text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="inline-block bg-secondary/20 text-secondary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-secondary/30">
            Compliance & Transparency
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">Certificates & Reports</h1>
          <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto">
            View & download official tax exemption certificates, annual reports, and verified registration details for Charitage Foundation.
          </p>
        </div>
      </section>

      {/* Official Certificates Section (80G and 12A) */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Government Registrations
            </span>
            <h2 className="text-3xl font-heading font-bold text-primary">Official Tax & Trust Certificates</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Charitage Foundation is registered with the Income Tax Department of India under PAN <strong className="text-primary font-bold">AANCC6167A</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* First File: 80G Certificate */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-lg transition-all" data-testid="cert-80g-card">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary">
                    <Award className="w-7 h-7" />
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Provisionally Approved
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">Form No. 106 • Section 354(4)</span>
                  <h3 className="text-2xl font-heading font-bold text-primary mt-1">80G Approval Certificate</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Grants 50% tax deduction benefit to all donors contributing to Charitage Foundation under Section 80G of the Income Tax Act.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">DIN:</span>
                    <span className="font-bold text-slate-800">AANCC6167AF2026102</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">URN:</span>
                    <span className="font-bold text-secondary">AANCC6167AF20261</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax Years:</span>
                    <span className="font-bold text-emerald-700">TY 2026-27 to TY 2028-29</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={() => setActiveCertModal('80G')}
                  variant="outline"
                  className="flex-1 rounded-full font-bold text-xs border-slate-300 hover:border-secondary"
                  data-testid="view-80g-btn"
                >
                  <Eye className="w-4 h-4 mr-1.5 text-secondary" />
                  View Form 106
                </Button>
                <Button
                  onClick={() => handleDownloadCertificate('80G')}
                  className="flex-1 bg-secondary text-white hover:bg-secondary/90 rounded-full font-bold text-xs shadow-md"
                  data-testid="download-80g-btn"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Download 80G
                </Button>
              </div>
            </div>

            {/* Second File: 12A Certificate */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-lg transition-all" data-testid="cert-12a-card">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <FileCheck className="w-7 h-7" />
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Provisionally Registered
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Form No. 106 • Section 332(8)</span>
                  <h3 className="text-2xl font-heading font-bold text-primary mt-1">12A Registration Certificate</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Official provisional registration certificate certifying Charitage Foundation as a recognized non-profit charitable trust.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">DIN:</span>
                    <span className="font-bold text-slate-800">AANCC6167AE2026101</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">URN:</span>
                    <span className="font-bold text-primary">AANCC6167AE20261</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax Years:</span>
                    <span className="font-bold text-emerald-700">TY 2026-27 to TY 2028-29</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={() => setActiveCertModal('12A')}
                  variant="outline"
                  className="flex-1 rounded-full font-bold text-xs border-slate-300 hover:border-primary"
                  data-testid="view-12a-btn"
                >
                  <Eye className="w-4 h-4 mr-1.5 text-primary" />
                  View Form 106
                </Button>
                <Button
                  onClick={() => handleDownloadCertificate('12A')}
                  className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-full font-bold text-xs shadow-md"
                  data-testid="download-12a-btn"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Download 12A
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial & Audit Reports */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-primary mb-6">Financial & Audit Reports</h2>
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4"
                  data-testid={`document-${doc.id}`}
                >
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-primary mb-2">{doc.title}</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-secondary hover:text-secondary/80 p-0 h-auto font-bold text-xs"
                      onClick={() => window.open(doc.file_url, '_blank')}
                      data-testid={`download-${doc.id}`}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download Document
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-muted-foreground text-sm">
              Additional audit reports will be listed here as uploaded by trust admins.
            </div>
          )}
        </div>
      </section>

      {/* Form No. 106 Interactive Viewer Modal */}
      {activeCertModal && certData[activeCertModal] && (
        <Dialog open={Boolean(activeCertModal)} onOpenChange={() => setActiveCertModal(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8" data-testid="cert-view-modal">
            <DialogHeader className="border-b pb-4 mb-4 flex items-center justify-between">
              <DialogTitle className="text-xl font-heading font-bold text-primary">
                {certData[activeCertModal].title}
              </DialogTitle>
            </DialogHeader>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-300 space-y-6 font-serif text-slate-800 text-xs sm:text-sm">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold tracking-widest uppercase">FORM NO. 106</h3>
                <p className="text-xs text-muted-foreground font-sans">(See rule 181)</p>
                <p className="text-sm font-semibold italic">{certData[activeCertModal].subHeading}</p>
              </div>

              {/* Part A */}
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <div className="bg-slate-100 p-2 font-bold font-sans text-xs uppercase border-b">
                  Part A: Particulars of the Applicant
                </div>
                <div className="p-3 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold">1. Name:</span>
                    <span className="col-span-2 font-semibold text-primary">{certData[activeCertModal].applicantName}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t pt-2">
                    <span className="font-bold">2. Address:</span>
                    <span className="col-span-2">{certData[activeCertModal].address}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t pt-2">
                    <span className="font-bold">3. PAN:</span>
                    <span className="col-span-2 font-mono font-bold text-secondary">{certData[activeCertModal].pan}</span>
                  </div>
                </div>
              </div>

              {/* Part B */}
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <div className="bg-slate-100 p-2 font-bold font-sans text-xs uppercase border-b">
                  Part B: Details of {activeCertModal === '80G' ? 'Approval' : 'Registration'} Granted
                </div>
                <div className="p-3 space-y-2 font-mono">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold font-sans">4. DIN:</span>
                    <span className="col-span-2 font-bold text-slate-900">{certData[activeCertModal].din}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t pt-2">
                    <span className="font-bold font-sans">4a. App Number:</span>
                    <span className="col-span-2">{certData[activeCertModal].appNo}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t pt-2">
                    <span className="font-bold font-sans">5. Nature:</span>
                    <span className="col-span-2">{certData[activeCertModal].nature}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t pt-2">
                    <span className="font-bold font-sans">6. Section:</span>
                    <span className="col-span-2">{certData[activeCertModal].section}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t pt-2">
                    <span className="font-bold font-sans">7. URN:</span>
                    <span className="col-span-2 font-bold text-secondary">{certData[activeCertModal].urn}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t pt-2">
                    <span className="font-bold font-sans">8. Date Granted:</span>
                    <span className="col-span-2">{certData[activeCertModal].date}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t pt-2">
                    <span className="font-bold font-sans">9. Approved TY:</span>
                    <span className="col-span-2 text-emerald-700 font-bold">{certData[activeCertModal].taxYears}</span>
                  </div>
                </div>
              </div>

              {/* Part D */}
              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 font-sans flex justify-between items-center text-xs">
                <div>
                  <span className="block font-bold text-slate-800">{certData[activeCertModal].authority}</span>
                  <span className="block text-muted-foreground">{certData[activeCertModal].designation}</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Income Tax Department, Govt of India</span>
                </div>
                <div className="border border-emerald-500 bg-emerald-50 text-emerald-800 p-2 rounded text-[10px] text-center font-bold">
                  ✓ Digitally Signed<br />DS Income Tax Dept
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <Button
                onClick={() => window.print()}
                className="flex-1 bg-primary text-white rounded-full font-bold py-3 text-xs"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Certificate
              </Button>
              <Button
                onClick={() => handleDownloadCertificate(activeCertModal)}
                className="flex-1 bg-secondary text-white rounded-full font-bold py-3 text-xs"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Document
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
};

export default ReportsPage;
