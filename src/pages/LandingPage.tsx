import heroImage from "../assets/hero.png";
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { FeatureCard } from '../components/Cards';

export const LandingPage: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleStart = () => {
    if (isLoggedIn) {
      navigate('/upload');
    } else {
      navigate('/login');
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "What is BrainAI?",
      a: "BrainAI is a medical imaging assistant that uses advanced Graph Neural Networks and tumor segmentation models to analyze brain MRI scans, providing a preliminary overview for review with your neurologist."
    },
    {
      q: "Is this a medical diagnosis?",
      a: "No. BrainAI provides a preliminary AI severity analysis and tumor segmentation. It is designed for educational purposes and patient clarity, and does not replace a professional clinical diagnosis."
    },
    {
      q: "Is my personal data secure?",
      a: "Yes. All scan uploads and medical histories are encrypted end-to-end. We implement strict privacy standards to ensure your medical records remain completely confidential."
    },
    {
      q: "What file formats are supported?",
      a: "We support standard clinical formats including high-resolution PNG, JPG, and DICOM formats up to 50MB."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300 ambient-bg pt-20">
      <Navbar />

      <main className="flex-grow pt-8 pb-stack-lg flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-7xl mx-auto px-container-padding py-stack-lg grid grid-cols-1 lg:grid-cols-2 gap-stack-lg items-center relative z-10">
          <div className="flex flex-col gap-stack-md text-center lg:text-left">
            <h1 className="font-display-lg text-display-lg md:text-display-lg text-on-surface dark:text-slate-100 animate-fade">
              AI Brain MRI Analysis for <span className="gradient-text">Patients</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 animate-fade">
              Upload your MRI scan and receive an AI-powered preliminary analysis within seconds. Review your results and discuss them with your healthcare professional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4 animate-fade">
              <button
                onClick={handleStart}
                className="gradient-bg text-white font-label-sm text-label-sm px-8 py-4 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all border-none cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined">upload_file</span>
                Upload MRI Scan
              </button>
              <Link
                to={isLoggedIn ? "/reports" : "/login"}
                className="glass-panel text-primary dark:text-primary-fixed font-label-sm text-label-sm px-8 py-4 rounded-lg hover:bg-surface-container-low dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 border-none cursor-pointer no-underline font-bold"
              >
                <span className="material-symbols-outlined">description</span>
                View My Reports
              </Link>
            </div>
          </div>

          <div className="relative w-full aspect-[1.79] rounded-xl overflow-hidden glass-panel shadow-2xl flex items-center justify-center p-4">
            <img
              src={heroImage}
              alt="Futuristic Brain Illustration"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 pointer-events-none rounded-xl"></div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full max-w-7xl mx-auto px-container-padding py-stack-lg border-t border-outline-variant/10">
          <div className="text-center mb-stack-lg">
            <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-slate-100 mb-2">
              How It Works
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-300 max-w-2xl mx-auto">
              A secure, simple 4-step AI severity evaluation process.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {[
              { step: "01", title: "Upload MRI", desc: "Drag and drop your high-resolution MRI scan files securely.", icon: "cloud_upload" },
              { step: "02", title: "AI Tumor Segmentation", desc: "Advanced tumor segmentation models highlight anatomical anomalies.", icon: "contrast" },
              { step: "03", title: "AI Severity Prediction", desc: "Graph Neural Networks compute severity classifications.", icon: "analytics" },
              { step: "04", title: "Receive Patient Report", desc: "Instantly retrieve recommendations and diagnostic overlays.", icon: "article" }
            ].map((item, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-xl hover-lift flex flex-col gap-4 relative">
                <span className="absolute top-4 right-4 text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent opacity-35">
                  {item.step}
                </span>
                <span className="material-symbols-outlined text-primary text-4xl">{item.icon}</span>
                <h3 className="font-title-md text-title-md text-on-surface dark:text-slate-100">{item.title}</h3>
                <p className="text-sm text-on-surface-variant dark:text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full max-w-7xl mx-auto px-container-padding py-stack-lg border-t border-outline-variant/10">
          <div className="text-center mb-stack-lg">
            <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-slate-100 mb-2">
              Understanding Your Analysis
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-300 max-w-2xl mx-auto">
              Demystifying AI-assisted neuroimaging for better patient outcomes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">
            <FeatureCard
              title="Rapid Results"
              description="Our advanced neural networks process high-resolution MRI scans in seconds, providing a preliminary overview before your doctor's appointment."
              icon="speed"
              iconBg="bg-primary-container/20"
              iconColor="text-primary dark:text-primary-fixed"
            />
            <FeatureCard
              title="High Precision"
              description="Trained on millions of verified clinical scans, BrainAI assists in highlighting subtle anomalies that warrant professional medical review."
              icon="verified"
              iconBg="bg-secondary-container/20"
              iconColor="text-secondary dark:text-secondary-fixed"
            />
            <FeatureCard
              title="Private & Secure"
              description="Your medical data is encrypted end-to-end. We adhere to strict HIPAA guidelines to ensure your privacy is never compromised."
              icon="security"
              iconBg="bg-tertiary-container/20"
              iconColor="text-tertiary dark:text-tertiary-fixed"
            />
          </div>
        </section>

        {/* FAQs Section */}
        <section className="w-full max-w-3xl mx-auto px-container-padding py-stack-lg border-t border-outline-variant/10">
          <div className="text-center mb-stack-lg">
            <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-slate-100 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-300">
              Find answers to common questions about our AI neuro-evaluation portal.
            </p>
          </div>

          <div className="space-y-4 w-full">
            {faqs.map((faq, index) => (
              <div key={index} className="glass-panel rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left font-title-md text-on-surface dark:text-slate-100 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined transition-transform duration-200" style={{ transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0)' }}>
                    keyboard_arrow_down
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 pt-2 text-sm text-on-surface-variant dark:text-slate-300 leading-relaxed border-t border-outline-variant/10 animate-fade">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Call To Action */}
        {!isLoggedIn && (
          <section className="w-full max-w-4xl mx-auto px-container-padding py-stack-lg text-center">
            <div className="glass-panel p-stack-lg rounded-2xl flex flex-col items-center justify-center gap-6 relative overflow-hidden border-primary/20">
              <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-slate-100 tracking-tight">
                Ready to begin your neuro-analysis?
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-300 max-w-xl">
                Create a secure patient profile to upload your MRI scan and view segmented analysis histories.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/login"
                  className="gradient-bg text-white font-label-sm text-label-sm px-8 py-4 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all no-underline font-bold"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="glass-panel text-primary dark:text-inverse-primary font-label-sm text-label-sm px-8 py-4 rounded-lg hover:bg-surface-container-low dark:hover:bg-slate-800 transition-all no-underline font-bold"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-high dark:bg-slate-900 border-t border-outline-variant/30 dark:border-slate-700/50 px-container-padding py-stack-lg flex flex-col items-center gap-base text-center mt-auto transition-colors duration-300">
        <div className="font-title-md text-primary dark:text-primary-fixed mb-2 flex items-center gap-2 justify-center">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            neurology
          </span>
          BrainAI
        </div>
        <p className="font-body-md text-body-md text-tertiary dark:text-slate-400 max-w-3xl mb-4 font-normal">
          © 2024 BrainAI Technologies. All medical insights are AI-generated and require specialist verification. This tool is not a substitute for professional medical advice, diagnosis, or treatment.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-slate-300 hover:text-secondary dark:hover:text-secondary-fixed opacity-80 hover:opacity-100 transition-opacity" href="#" onClick={(e) => e.preventDefault()}>
            Medical Disclaimer
          </a>
          <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-slate-300 hover:text-secondary dark:hover:text-secondary-fixed opacity-80 hover:opacity-100 transition-opacity" href="#" onClick={(e) => e.preventDefault()}>
            Privacy Policy
          </a>
          <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-slate-300 hover:text-secondary dark:hover:text-secondary-fixed opacity-80 hover:opacity-100 transition-opacity" href="#" onClick={(e) => e.preventDefault()}>
            Terms of Service
          </a>
          <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-slate-300 hover:text-secondary dark:hover:text-secondary-fixed opacity-80 hover:opacity-100 transition-opacity" href="#" onClick={(e) => e.preventDefault()}>
            Ethical AI Guidelines
          </a>
        </div>
      </footer>
    </div>
  );
};
