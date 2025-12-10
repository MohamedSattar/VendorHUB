import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-navy mb-8">About ECA Vendor Hub</h1>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-navy mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The ECA Vendor Hub is a comprehensive portal designed to streamline vendor engagement with ECA activities. Our mission is to provide a centralized, user-friendly platform where vendors can efficiently access engagements, manage contracts, and collaborate on projects with the ECA.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-navy mb-4">What We Do</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The ECA Vendor Hub serves as the official public portal for vendor engagement with ECA activities. Through this platform, vendors can:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>View and manage active engagements</li>
                <li>Track contracts and their status</li>
                <li>Access resources and documentation</li>
                <li>Manage team members and resources</li>
                <li>Monitor engagement progress and timelines</li>
                <li>Collaborate with ECA project managers</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-navy mb-4">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-navy mb-2">Engagement Management</h3>
                  <p className="text-gray-700">Track and manage all your active engagements with real-time updates and status monitoring.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-navy mb-2">Contract Tracking</h3>
                  <p className="text-gray-700">Monitor contracts with detailed information on awards, dates, and current status.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-navy mb-2">Resource Pool</h3>
                  <p className="text-gray-700">Maintain and manage your resource pool with detailed profiles and availability tracking.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-navy mb-2">Team Collaboration</h3>
                  <p className="text-gray-700">Assign and manage team members for engagements with easy member management.</p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-navy mb-4">Contact & Support</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions or support regarding the ECA Vendor Hub, please contact our support team:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-2"><span className="font-semibold">Email:</span> support@eca.gov.ae</p>
                <p className="text-gray-700"><span className="font-semibold">Hours:</span> Sunday - Thursday, 8:00 AM - 5:00 PM (GST)</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
