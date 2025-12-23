'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FAQProps {
  language: 'en' | 'ms';
}

export default function FAQ({ language }: FAQProps) {
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);

  const faqs = [
    {
      q: language === 'ms' ? 'Apakah CropDrive™?' : 'What is CropDrive™?',
      a: language === 'ms'
        ? 'Ia adalah pembantu agronomi bertenaga AI yang mentafsir keputusan ujian tanah dan daun anda dan menukarkannya kepada cadangan baja dan kesihatan tanah yang jelas. Anda mendapat panduan berasaskan sains yang boleh dipercayai untuk meningkatkan produktiviti dan keuntungan.'
        : 'It is an AI-powered agronomy assistant that interprets your soil and leaf test results and turns them into clear fertilizer and soil-health recommendations. You get reliable, science-based guidance to improve productivity and profitability.'
    },
    {
      q: language === 'ms' ? 'Siapa yang boleh mendapat manfaat dari CropDrive™?' : 'Who can benefit from CropDrive™?',
      a: language === 'ms'
        ? 'Petani, ladang, makmal ujian tanah dan daun, pembekal baja, NGO, program pembangunan, dan perniagaan pertanian menggunakan CropDrive™.'
        : 'Farmers, plantations, soil and leaf testing labs, fertilizer suppliers, NGOs, development programs, and agribusinesses use CropDrive™.'
    },
    {
      q: language === 'ms' ? 'Bagaimana CropDrive™ berfungsi?' : 'How does CropDrive™ work?',
      a: language === 'ms'
        ? 'Anda memuat naik keputusan ujian tanah atau daun. AI menganalisisnya, mengenal pasti jurang nutrien, dan menjana pelan khusus ladang dengan anggaran kos dan pulangan pelaburan supaya anda dapat tumbuh lebih banyak dengan lebih kurang pembaziran.'
        : 'You upload soil or leaf test results. The AI analyzes them, identifies nutrient gaps, and generates a field-specific plan with cost and return-on-investment estimates so you grow more with less waste.'
    },
    {
      q: language === 'ms' ? 'Apakah hasil yang boleh saya jangkakan?' : 'What results can I expect?',
      a: language === 'ms'
        ? 'Petani melaporkan pengurangan pembaziran baja, hasil yang lebih tinggi, pokok sawit yang lebih kuat, dan kos pengeluaran yang lebih rendah dalam beberapa bulan, membawa kepada pendapatan yang lebih baik dan pengurusan ladang yang lebih lestari.'
        : 'Farmers report reduced fertilizer waste, higher yields, stronger palms, and lower production costs within months, leading to better income and more sustainable farm management.'
    },
    {
      q: language === 'ms' ? 'Adakah CropDrive™ sesuai untuk pekebun kecil?' : 'Is CropDrive™ suitable for smallholders?',
      a: language === 'ms'
        ? 'Ya. Ia menjadikan sokongan agronomi pakar boleh diakses oleh pekebun kecil dengan memberikan cadangan berpatutan yang meningkatkan hasil dan meningkatkan pendapatan.'
        : 'Yes. It makes expert agronomy support accessible to smallholders by giving affordable recommendations that raise yields and improve incomes.'
    },
    {
      q: language === 'ms' ? 'Bolehkah CropDrive™ membantu estet dan ladang?' : 'Can CropDrive™ help estates and plantations?',
      a: language === 'ms'
        ? 'Ya. Pakar agronomi di estet besar menggunakannya untuk memperkemaskan peningkatan kesihatan tanah, perancangan pembajaan, dan unjuran ekonomi jangka panjang. Estet dan ladang menjimatkan banyak jam kerja dan mendapat hasil berdasarkan sains terkini.'
        : 'Yes. Agronomists on large estates use it to streamline soil health improvement, fertilization planning, and long-term economic projections. Estates and plantations save significant man-hours and get results based on the latest science.'
    },
    {
      q: language === 'ms' ? 'Bagaimana NGO dan program pembangunan menggunakan CropDrive™?' : 'How do NGOs and development programs use CropDrive™?',
      a: language === 'ms'
        ? 'Mereka mengatur petani ke dalam koperasi dan menghubungkan mereka dengan CropDrive™. Ini memberi pekebun kecil akses kepada alat agronomi maju dan cadangan peringkat pakar pada kos rendah.'
        : 'They organize farmers into cooperatives and link them to CropDrive™. This gives smallholders access to advanced agronomy tools and expert-level recommendations at low cost.'
    },
    {
      q: language === 'ms' ? 'Bagaimana makmal ujian tanah dan daun menggunakan CropDrive™?' : 'How do soil and leaf testing labs use CropDrive™?',
      a: language === 'ms'
        ? 'Makmal melampirkan laporan CropDrive™ yang disesuaikan dengan keputusan makmal, memberikan petani cadangan yang jelas dan praktikal. Ini menambah nilai kepada perkhidmatan makmal dan menjadikan mereka lebih berdaya saing.'
        : 'Labs attach tailored CropDrive™ reports to lab results, giving farmers clear and practical recommendations. This adds value to the lab\'s services and makes them more competitive.'
    },
    {
      q: language === 'ms' ? 'Bagaimana pembekal dan pengedar baja menggunakan CropDrive™?' : 'How do fertilizer suppliers and distributors use CropDrive™?',
      a: language === 'ms'
        ? 'Mereka menyediakan pelan pembajaan yang disesuaikan dan dikaitkan secara langsung dengan produk mereka. Strategi nutrien jangka pendek dan panjang menambah nilai untuk pelanggan dan mengukuhkan kedudukan pasaran mereka.'
        : 'They provide customized fertilization plans tied directly to their products. Short- and long-term nutrient strategies add value for clients and strengthen their market position.'
    },
    {
      q: language === 'ms' ? 'Bagaimana perniagaan pertanian dan institusi awam menggunakan CropDrive™?' : 'How do agribusinesses and public institutions use CropDrive™?',
      a: language === 'ms'
        ? 'Mereka bergantung pada data peringkat ladang dari CropDrive™ untuk menjejak penggunaan, mengesahkan keputusan, menyokong program pengembangan, membimbing latihan, dan memberi maklumat kepada dasar kelestarian.'
        : 'They rely on field-level data from CropDrive™ to track adoption, verify results, support extension programs, guide training, and inform sustainability policies.'
    },
    {
      q: language === 'ms' ? 'Apakah tanaman yang CropDrive™ sokong?' : 'What crops does CropDrive™ work with?',
      a: language === 'ms'
        ? 'Ia kini menyokong kelapa sawit. Rancangan sedang dijalankan untuk menambah kopi, koko, dan tanaman tropika lain, membawa sokongan didorong AI kepada lebih banyak sistem pertanian.'
        : 'It currently supports oil palm. Plans are underway to add coffee, cacao, and other tropical crops, bringing AI-driven support to more farming systems.'
    },
    {
      q: language === 'ms' ? 'Berapa cepat saya akan mendapat laporan saya?' : 'How fast will I get my report?',
      a: language === 'ms'
        ? 'Pelan pembajaan dan kesihatan tanah dijana dalam masa 5-8 minit selepas anda memuat naik keputusan ujian anda, jadi anda boleh bertindak dengan cepat untuk meningkatkan hasil dan pendapatan.'
        : 'Fertilization and soil-health plans are generated within 5-8 minutes after you upload your test results, so you can act quickly to improve yields and income.'
    },
    {
      q: language === 'ms' ? 'Bagaimana saya mula menggunakan CropDrive™?' : 'How do I start using CropDrive™?',
      a: language === 'ms'
        ? 'Klik "Langgan" di cropdrive.com, buat akaun, dan muat naik keputusan makmal anda. Anda akan menerima laporan pertama yang dijana AI dengan cadangan yang jelas.'
        : 'Click "Subscribe" on cropdrive.com, create an account, and upload your lab results. You will receive your first AI-generated report with clear recommendations.'
    },
    {
      q: language === 'ms' ? 'Adakah nasihat disokong oleh sains?' : 'Is the advice backed by science?',
      a: language === 'ms'
        ? 'Ya. CropDrive™ menggabungkan amalan agronomi yang terbukti dengan analisis AI untuk memastikan cadangan adalah praktikal, berasaskan bukti, dan fokus pada produktiviti dan keuntungan jangka panjang.'
        : 'Yes. CropDrive™ combines proven agronomic practices with AI analysis to ensure recommendations are practical, evidence-based, and focused on long-term productivity and profitability.'
    }
  ];

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openFaqIndex === index;
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl border-2 border-green-200 hover:border-yellow-400 transition-all overflow-hidden"
          >
            <button
              onClick={() => setOpenFaqIndex(isOpen ? null : index)}
              className="w-full p-6 text-left flex justify-between items-center"
            >
              <h3 className="text-xl font-bold text-gray-900">{faq.q}</h3>
              <svg
                className={`w-6 h-6 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <motion.div
              initial={false}
              animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 pt-0 text-gray-700 leading-relaxed border-t border-gray-100">
                {faq.a}
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}