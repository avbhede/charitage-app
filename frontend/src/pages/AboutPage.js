import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Target, Users, Eye, Award } from 'lucide-react';

const AboutPage = () => {
  const values = [
    {
      icon: Target,
      title: 'Transparency',
      description: 'We maintain complete transparency in our operations and fund utilization',
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Every initiative is community-driven and culturally sensitive',
    },
    {
      icon: Eye,
      title: 'Accountability',
      description: 'Regular audits and public reporting ensure accountability',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in every program we undertake',
    },
  ];

  return (
    <div className="min-h-screen" data-testid="about-page">
      <Navbar />

      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">About Us</h1>
          <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto">
            Building bridges of hope and empowerment across India
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-primary mb-6">
                Our Mission
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
                Charitage Foundation is committed to empowering underserved communities across India through sustainable development initiatives in education, healthcare, and livelihood creation.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                We believe in creating lasting change by working hand-in-hand with communities, understanding their unique challenges, and co-creating solutions that are culturally appropriate and sustainable.
              </p>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/7692546/pexels-photo-7692546.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="Volunteers teaching"
                className="rounded-xl shadow-card-hover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1723564211731-21ceb97443a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21lbiUyMHNlbGYlMjBoZWxwJTIwZ3JvdXAlMjBtZWV0aW5nfGVufDB8fHx8MTc3MTU4MDEyN3ww&ixlib=rb-4.1.0&q=85"
                alt="Women empowerment"
                className="rounded-xl shadow-card-hover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-primary mb-6">
                Our Vision
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
                We envision an India where every individual, regardless of their background, has access to quality education, healthcare, and economic opportunities.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Through our integrated approach, we aim to break the cycle of poverty and create self-reliant communities that can thrive independently.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-primary text-center mb-12">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="bg-white p-8 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 text-center"
                  data-testid={`value-${value.title.toLowerCase()}`}
                >
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-primary mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-primary mb-6">
            Registered & Certified
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8">
            Charitage Foundation is a registered non-profit organization with 80G and 12A certifications.
            All donations are eligible for tax benefits under Indian law.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-white px-6 py-3 rounded-full shadow-md">
              <span className="font-semibold text-primary">80G Certified</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-full shadow-md">
              <span className="font-semibold text-primary">12A Registered</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
