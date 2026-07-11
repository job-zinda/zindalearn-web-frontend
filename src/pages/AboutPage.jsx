import { Shield, Users, Target, Rocket, Heart, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLandingData } from '../hooks/useLandingData';
import Footer from '../components/Footer';

const AboutPage = () => {
  const { stats } = useLandingData();
  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar showBackground={true} />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-bold font-display text-surface-900 leading-tight mb-6">
              Revolutionizing Education with <span className="gradient-text">Zinda Learn</span>
            </h1>
            <p className="text-lg lg:text-xl text-surface-600 mb-10 leading-relaxed">
              We believe that quality education should be accessible, engaging, and transformational. Zinda Learn is more than just a platform; it's a movement to empower the next generation of digital creators.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80" 
                  alt="Team Collaboration" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary-600 text-white p-8 rounded-3xl shadow-xl hidden md:block">
                <p className="text-4xl font-bold mb-1">{stats.students || 0}</p>
                <p className="text-sm opacity-80">Students Empowered</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-surface-900 mb-4 font-display">Our Mission</h2>
                <p className="text-surface-600 leading-relaxed">
                  Our mission is to bridge the gap between academic knowledge and industry demands. We curate world-class content from experts to ensure our students aren't just learning, but mastering skills that matter in the real world.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: Target, title: 'Results Driven', desc: 'Focus on practical skills and portfolio building.' },
                  { icon: Heart, title: 'Student First', desc: 'Personalized learning paths for every individual.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-surface-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-surface-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-32 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
            <h2 className="text-3xl lg:text-4xl font-bold font-display text-surface-900 mb-4">The Values that Drive Us</h2>
            <p className="text-surface-500">Built on trust, innovation, and a passion for excellence.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { icon: Shield, title: 'Excellence', desc: 'We never compromise on the quality of our content or the experience of our students.' },
              { icon: Users, title: 'Community', desc: 'Learning is better together. We foster a supportive ecosystem for growth.' },
              { icon: Rocket, title: 'Innovation', desc: 'We stay ahead of the curve, constantly updating our curriculum with the latest tech.' }
            ].map((value, i) => (
              <div key={i} className="bg-white p-8 lg:p-10 rounded-3xl border border-surface-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-50 flex items-center justify-center text-primary-600 mx-auto mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-surface-900 mb-4">{value.title}</h3>
                <p className="text-surface-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
