import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FileText, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ReportsPage = () => {
  const [documents, setDocuments] = useState([]);

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

  const categories = ['Annual Reports', 'Financial Reports', 'Audit Reports', 'Certificates'];

  const getDocumentsByCategory = (category) => {
    return documents.filter((doc) => doc.category === category);
  };

  return (
    <div className="min-h-screen" data-testid="reports-page">
      <Navbar />

      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">Reports & Documents</h1>
          <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto">
            Transparency and accountability in all our operations
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {categories.map((category) => {
              const docs = getDocumentsByCategory(category);
              if (docs.length === 0) return null;

              return (
                <div key={category}>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-6">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 flex items-start space-x-4"
                        data-testid={`document-${doc.id}`}
                      >
                        <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-heading font-semibold text-primary mb-2">
                            {doc.title}
                          </h3>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-secondary hover:text-secondary/80 p-0 h-auto"
                            onClick={() => window.open(doc.file_url, '_blank')}
                            data-testid={`download-${doc.id}`}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {documents.length === 0 && (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No documents available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ReportsPage;
