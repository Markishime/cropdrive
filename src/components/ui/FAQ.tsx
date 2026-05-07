'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { Language } from '@/i18n';
import { toIndonesianText } from '@/i18n/id';

interface FAQProps {
  language: Language;
}

export default function FAQ({ language }: FAQProps) {
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);

  const copy = (en: string, ms: string) => language === 'id' ? toIndonesianText(ms) : language === 'ms' ? ms : en;

  const faqs = [
    {
      q: copy('What is CropDrive™?', 'Apakah CropDrive™?'),
      a: copy(
        'It is an AI-powered agronomy assistant that interprets your soil and leaf test results and turns them into clear fertilizer and soil-health recommendations. You get reliable, science-based guidance to improve productivity and profitability.',
        'Ia adalah pembantu agronomi bertenaga AI yang mentafsir keputusan ujian tanah dan daun anda dan menukarkannya kepada cadangan baja dan kesihatan tanah yang jelas. Anda mendapat panduan berasaskan sains yang boleh dipercayai untuk meningkatkan produktiviti dan keuntungan.'
      )
    },
    {
      q: copy('Who can benefit from CropDrive™?', 'Siapa yang boleh mendapat manfaat dari CropDrive™?'),
      a: copy(
        'Farmers, plantations, soil and leaf testing labs, fertilizer suppliers, NGOs, development programs, and agribusinesses use CropDrive™.',
        'Petani, ladang, makmal ujian tanah dan daun, pembekal baja, NGO, program pembangunan, dan perniagaan pertanian menggunakan CropDrive™.'
      )
    },
    {
      q: copy('How does CropDrive™ work?', 'Bagaimana CropDrive™ berfungsi?'),
      a: copy(
        'You upload soil or leaf test results. The AI analyzes them, identifies nutrient gaps, and generates a field-specific plan with cost and return-on-investment estimates so you grow more with less waste.',
        'Anda memuat naik keputusan ujian tanah atau daun. AI menganalisisnya, mengenal pasti jurang nutrien, dan menjana pelan khusus ladang dengan anggaran kos dan pulangan pelaburan supaya anda dapat tumbuh lebih banyak dengan lebih kurang pembaziran.'
      )
    },
    {
      q: copy('What results can I expect?', 'Apakah hasil yang boleh saya jangkakan?'),
      a: copy(
        'Farmers report reduced fertilizer waste, higher yields, stronger palms, and lower production costs within months, leading to better income and more sustainable farm management.',
        'Petani melaporkan pengurangan pembaziran baja, hasil yang lebih tinggi, pokok sawit yang lebih kuat, dan kos pengeluaran yang lebih rendah dalam beberapa bulan, membawa kepada pendapatan yang lebih baik dan pengurusan ladang yang lebih lestari.'
      )
    },
    {
      q: copy('Is CropDrive™ suitable for smallholders?', 'Adakah CropDrive™ sesuai untuk pekebun kecil?'),
      a: copy(
        'Yes. It makes expert agronomy support accessible to smallholders by giving affordable recommendations that raise yields and improve incomes.',
        'Ya. Ia menjadikan sokongan agronomi pakar boleh diakses oleh pekebun kecil dengan memberikan cadangan berpatutan yang meningkatkan hasil dan meningkatkan pendapatan.'
      )
    },
    {
      q: copy('Can CropDrive™ help estates and plantations?', 'Bolehkah CropDrive™ membantu estet dan ladang?'),
      a: copy(
        'Yes. Agronomists on large estates use it to streamline soil health improvement, fertilization planning, and long-term economic projections. Estates and plantations save significant man-hours and get results based on the latest science.',
        'Ya. Pakar agronomi di estet besar menggunakannya untuk memperkemaskan peningkatan kesihatan tanah, perancangan pembajaan, dan unjuran ekonomi jangka panjang. Estet dan ladang menjimatkan banyak jam kerja dan mendapat hasil berdasarkan sains terkini.'
      )
    },
    {
      q: copy('How do NGOs and development programs use CropDrive™?', 'Bagaimana NGO dan program pembangunan menggunakan CropDrive™?'),
      a: copy(
        'They organize farmers into cooperatives and link them to CropDrive™. This gives smallholders access to advanced agronomy tools and expert-level recommendations at low cost.',
        'Mereka mengatur petani ke dalam koperasi dan menghubungkan mereka dengan CropDrive™. Ini memberi pekebun kecil akses kepada alat agronomi maju dan cadangan peringkat pakar pada kos rendah.'
      )
    },
    {
      q: copy('How do soil and leaf testing labs use CropDrive™?', 'Bagaimana makmal ujian tanah dan daun menggunakan CropDrive™?'),
      a: copy(
        'Labs attach tailored CropDrive™ reports to lab results, giving farmers clear and practical recommendations. This adds value to the lab\'s services and makes them more competitive.',
        'Makmal melampirkan laporan CropDrive™ yang disesuaikan dengan keputusan makmal, memberikan petani cadangan yang jelas dan praktikal. Ini menambah nilai kepada perkhidmatan makmal dan menjadikan mereka lebih berdaya saing.'
      )
    },
    {
      q: copy('How do fertilizer suppliers and distributors use CropDrive™?', 'Bagaimana pembekal dan pengedar baja menggunakan CropDrive™?'),
      a: copy(
        'They provide customized fertilization plans tied directly to their products. Short- and long-term nutrient strategies add value for clients and strengthen their market position.',
        'Mereka menyediakan pelan pembajaan yang disesuaikan dan dikaitkan secara langsung dengan produk mereka. Strategi nutrien jangka pendek dan panjang menambah nilai untuk pelanggan dan mengukuhkan kedudukan pasaran mereka.'
      )
    },
    {
      q: copy('How do agribusinesses and public institutions use CropDrive™?', 'Bagaimana perniagaan pertanian dan institusi awam menggunakan CropDrive™?'),
      a: copy(
        'They rely on field-level data from CropDrive™ to track adoption, verify results, support extension programs, guide training, and inform sustainability policies.',
        'Mereka bergantung pada data peringkat ladang dari CropDrive™ untuk menjejak penggunaan, mengesahkan keputusan, menyokong program pengembangan, membimbing latihan, dan memberi maklumat kepada dasar kelestarian.'
      )
    },
    {
      q: copy('What crops does CropDrive™ work with?', 'Apakah tanaman yang CropDrive™ sokong?'),
      a: copy(
        'It currently supports oil palm. Plans are underway to add coffee, cacao, and other tropical crops, bringing AI-driven support to more farming systems.',
        'Ia kini menyokong kelapa sawit. Rancangan sedang dijalankan untuk menambah kopi, koko, dan tanaman tropika lain, membawa sokongan didorong AI kepada lebih banyak sistem pertanian.'
      )
    },
    {
      q: copy('How fast will I get my report?', 'Berapa cepat saya akan mendapat laporan saya?'),
      a: copy(
        'Fertilization and soil-health plans are generated within 5-8 minutes after you upload your test results, so you can act quickly to improve yields and income.',
        'Pelan pembajaan dan kesihatan tanah dijana dalam masa 5-8 minit selepas anda memuat naik keputusan ujian anda, jadi anda boleh bertindak dengan cepat untuk meningkatkan hasil dan pendapatan.'
      )
    },
    {
      q: copy('How do I start using CropDrive™?', 'Bagaimana saya mula menggunakan CropDrive™?'),
      a: copy(
        'Click "Subscribe" on cropdrive.com, create an account, and upload your lab results. You will receive your first AI-generated report with clear recommendations.',
        'Klik "Langgan" di cropdrive.com, buat akaun, dan muat naik keputusan makmal anda. Anda akan menerima laporan pertama yang dijana AI dengan cadangan yang jelas.'
      )
    },
    {
      q: copy('Is the advice backed by science?', 'Adakah nasihat disokong oleh sains?'),
      a: copy(
        'Yes. CropDrive™ combines proven agronomic practices with AI analysis to ensure recommendations are practical, evidence-based, and focused on long-term productivity and profitability.',
        'Ya. CropDrive™ menggabungkan amalan agronomi yang terbukti dengan analisis AI untuk memastikan cadangan adalah praktikal, berasaskan bukti, dan fokus pada produktiviti dan keuntungan jangka panjang.'
      )
    }
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openFaqIndex === index;
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.06 }}
            viewport={{ once: true }}
            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
              isOpen 
                ? 'bg-white shadow-lg shadow-green-100/50 border-green-300 ring-1 ring-green-200/50' 
                : 'bg-white/80 shadow-sm border-gray-200 hover:border-green-300 hover:shadow-md'
            }`}
          >
            <button
              onClick={() => setOpenFaqIndex(isOpen ? null : index)}
              className="w-full px-5 py-4 sm:px-6 sm:py-5 text-left flex justify-between items-center gap-4 group"
            >
              <h3 className={`text-base sm:text-lg font-semibold transition-colors ${isOpen ? 'text-green-800' : 'text-gray-800 group-hover:text-green-700'}`}>{faq.q}</h3>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                isOpen ? 'bg-green-600 rotate-180' : 'bg-gray-100 group-hover:bg-green-100'
              }`}>
                <svg
                  className={`w-4 h-4 transition-colors ${isOpen ? 'text-white' : 'text-gray-500 group-hover:text-green-600'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            <motion.div
              initial={false}
              animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-100 pt-4">
                {faq.a}
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}