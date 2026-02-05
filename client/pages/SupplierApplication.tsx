import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import SupplierApplicationForm from "@/components/SupplierApplicationForm";

export default function SupplierApplication() {
  const { isArabic } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir={isArabic ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-navy mb-4">
              Vendor Pre-Qualification Application
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Greetings from the Abu Dhabi Early Childhood Authority (ECA),
            </p>
            <p className="text-gray-700 leading-relaxed">
              As part of our commitment to building trusted partnerships and ensuring compliance with our procurement standards, 
              we kindly request you to complete this Vendor Pre-Qualification Questionnaire. The purpose of this survey is to assess 
              your company's eligibility, compliance, and experience for upcoming projects and opportunities with ECA.
            </p>
          </div>

          {/* Application Form */}
          <SupplierApplicationForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
