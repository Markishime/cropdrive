'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ConsumerInfoPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight font-heading">
              Consumer <span className="text-yellow-400">Information</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Verbraucherinformationen
            </p>
          </motion.div>
        </div>
      </section>

      {/* English Version */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 font-heading">
              Consumer Information
            </h2>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                We are committed to resolving any consumer complaints or disputes in an amicable and satisfactory manner. If you have any complaints about our services, please contact us directly at:
              </p>

              <div className="bg-green-50 p-6 rounded-xl mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information:</h3>
                <div className="space-y-1 text-gray-700">
                  <p className="font-semibold">AGS - Agriculture Global Solutions OÜ</p>
                  <p>Sakala tn 7-2,</p>
                  <p>Kesklinna linnaosa,</p>
                  <p>10141 Tallinn, Harju maakond,</p>
                  <p>Estonia</p>
                  <p className="mt-3"><span className="font-semibold">Email:</span> <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 hover:text-green-800 underline">contact@agriglobalsolutions.com</a></p>
                  <p><span className="font-semibold">Phone:</span> <a href="tel:+4952218719889" className="text-green-700 hover:text-green-800">+49 5221 8719889</a></p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-8">
                We aim to respond to your complaints within 14 days.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Online Dispute Resolution</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                In accordance with EU Regulation No. 524/2013 on online dispute resolution for consumer disputes, we are obliged to inform consumers about the existence of the European Online Dispute Resolution platform. The European Commission provides a platform for online dispute resolution (ODR), which is accessible at{' '}
                <a 
                  href="https://ec.europa.eu/consumers/odr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-700 hover:text-green-800 underline font-semibold"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
                . Consumers have the option to use this platform for resolving disputes relating to contractual obligations arising from online sales or service contracts.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Consumer Arbitration Board</h3>
              <p className="text-gray-700 leading-relaxed mb-8">
                We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* German Version */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 font-heading">
              Verbraucherinformationen
            </h2>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                Wir sind bestrebt, alle Verbraucherbeschwerden oder -streitigkeiten auf eine einvernehmliche und zufriedenstellende Weise zu lösen. Wenn Sie Beschwerden über unsere Dienstleistungen haben, kontaktieren Sie uns bitte direkt unter:
              </p>

              <div className="bg-green-50 p-6 rounded-xl mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Kontaktdaten:</h3>
                <div className="space-y-1 text-gray-700">
                  <p className="font-semibold">AGS - Agriculture Global Solutions OÜ</p>
                  <p>Sakala tn 7-2,</p>
                  <p>Kesklinna linnaosa,</p>
                  <p>10141 Tallinn, Harju maakond,</p>
                  <p>Estland</p>
                  <p className="mt-3"><span className="font-semibold">E-Mail:</span> <a href="mailto:contact@agriglobalsolutions.com" className="text-green-700 hover:text-green-800 underline">contact@agriglobalsolutions.com</a></p>
                  <p><span className="font-semibold">Telefon:</span> <a href="tel:+4952218719889" className="text-green-700 hover:text-green-800">+49 5221 8719889</a></p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-8">
                Wir bemühen uns, innerhalb von 14 Tagen auf Ihre Beschwerden zu antworten.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Online-Streitbeilegung</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Gemäß der Verordnung (EU) Nr. 524/2013 über die Online-Beilegung verbraucherrechtlicher Streitigkeiten sind wir verpflichtet, Verbraucher über die Existenz der Europäischen Online-Streitbeilegungsplattform zu informieren. Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die unter{' '}
                <a 
                  href="https://ec.europa.eu/consumers/odr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-700 hover:text-green-800 underline font-semibold"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
                {' '}erreichbar ist. Verbraucher haben die Möglichkeit, diese Plattform zur Beilegung von Streitigkeiten im Zusammenhang mit vertraglichen Verpflichtungen aus Online-Kauf- oder Dienstleistungsverträgen zu nutzen.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Verbraucherschlichtungsstelle</h3>
              <p className="text-gray-700 leading-relaxed mb-8">
                Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-br from-green-900 via-green-800 to-green-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 font-heading">
              Need Assistance?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Benötigen Sie Hilfe?
            </p>
            <a 
              href="mailto:contact@agriglobalsolutions.com"
              className="inline-block px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 font-black rounded-full hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 transform hover:scale-105 uppercase tracking-wide"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

