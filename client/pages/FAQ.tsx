import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: "How do I access the ECA Vendor Hub?",
    answer:
      "You can access the ECA Vendor Hub by navigating to the portal and logging in with your vendor credentials. If you don't have an account, please contact the ECA support team for registration.",
  },
  {
    id: 2,
    question: "How can I view my active engagements?",
    answer:
      "After logging in, navigate to the Engagements section from the main dashboard. You'll see a comprehensive list of all your active, planned, on-hold, and completed engagements with their status and details.",
  },
  {
    id: 3,
    question: "What information is included in contract details?",
    answer:
      "Contract details include the contract number, awarded amount in AED, start and end dates, current status, assigned ECA project manager, and contract type (such as Service Agreement, Work Order, Sponsorship, or Collaboration Agreement).",
  },
  {
    id: 4,
    question: "How do I manage my resource pool?",
    answer:
      "Visit the Resources Pool page to view and manage your external employees. You can add new resources, edit existing ones, and track their status and linked engagements.",
  },
  {
    id: 5,
    question: "Can I add team members to an engagement?",
    answer:
      "Yes, when editing an engagement that is in Draft or More Information Needed status, you can add or remove team members from your resource pool. Navigate to the Team Members section and click 'Add Team Member' to assign resources.",
  },
  {
    id: 6,
    question: "What does engagement status mean?",
    answer:
      "Engagement statuses include: In Progress (currently active), Planned (scheduled to start), On-hold (temporarily paused), Completed (finished), Draft (being prepared), and More Information Needed (awaiting additional details).",
  },
  {
    id: 7,
    question: "How do I update my profile information?",
    answer:
      "Click the Settings icon in the header to access your profile page. You can update your first name, last name, email, mobile number, and preferred contact method.",
  },
  {
    id: 8,
    question: "Can I filter and search my engagements?",
    answer:
      "Yes, the Engagements page provides multiple filtering and sorting options. You can search by title or requester name, sort by date, name, or status, and filter by status type.",
  },
];

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-navy mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 mb-12">
            Find answers to common questions about the ECA Vendor Hub platform.
          </p>

          <div className="space-y-3">
            {faqItems.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-sm transition"
              >
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition text-left"
                >
                  <h3 className="text-lg font-semibold text-navy">{item.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-navy transition-transform flex-shrink-0 ml-4 ${
                      openId === item.id ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {openId === item.id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-navy mb-2">Still have questions?</h3>
            <p className="text-gray-700">
              If you can't find the answer you're looking for, please contact our support team at{" "}
              <a href="mailto:support@eca.gov.ae" className="text-primary hover:underline">
                support@eca.gov.ae
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
