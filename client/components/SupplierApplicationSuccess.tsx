import { CheckCircle, Copy, Download, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface SupplierApplicationSuccessProps {
  trackingId: string;
  companyName: string;
  contactEmail: string;
  submissionDate: string;
}

export default function SupplierApplicationSuccess({
  trackingId,
  companyName,
  contactEmail,
  submissionDate,
}: SupplierApplicationSuccessProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyTrackingId = () => {
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    toast({
      title: "Copied",
      description: "Tracking ID copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReceipt = () => {
    // Create a simple text document with submission details
    const receiptContent = `
VENDOR PRE-QUALIFICATION APPLICATION RECEIPT
=============================================

Submission Date: ${new Date(submissionDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}

Company Name: ${companyName}
Contact Email: ${contactEmail}

TRACKING ID: ${trackingId}

=============================================

Please save this Tracking ID. You can use it to:
- Monitor the status of your application
- Follow up with ECA regarding your submission
- Contact support with questions about your application

A confirmation email has been sent to: ${contactEmail}

=============================================

Next Steps:
1. You will receive updates about your application status via email
2. The ECA team will review your submission within 5-7 business days
3. You may be contacted for additional information if required
4. A final decision will be communicated to you via email

For support: support@ecavhs.ae

=============================================
`;

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," +
        encodeURIComponent(receiptContent)
    );
    element.setAttribute(
      "download",
      `ECA-Vendor-Application-${trackingId}.txt`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Downloaded",
      description: "Application receipt downloaded successfully",
    });
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-900 mb-2">
            Application Submitted Successfully!
          </h1>
          <p className="text-green-700">
            Thank you for submitting your vendor pre-qualification application.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Tracking ID Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-sm font-semibold text-blue-900 mb-3 uppercase">
              Your Tracking ID
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-grow">
                <p className="text-3xl font-mono font-bold text-blue-700 break-all">
                  {trackingId}
                </p>
              </div>
              <button
                onClick={handleCopyTrackingId}
                className="flex-shrink-0 p-3 bg-blue-100 hover:bg-blue-200 rounded-lg transition"
                title="Copy tracking ID"
              >
                <Copy className="w-5 h-5 text-blue-700" />
              </button>
            </div>
            <p className="text-xs text-blue-700 mt-3">
              Save this ID to track your application status and for future
              reference.
            </p>
          </div>

          {/* Application Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                Company Name
              </p>
              <p className="text-sm text-navy font-medium">{companyName}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                Contact Email
              </p>
              <p className="text-sm text-navy font-medium break-all">
                {contactEmail}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                Submission Date & Time
              </p>
              <p className="text-sm text-navy font-medium">
                {new Date(submissionDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-900 mb-3">What Happens Next?</h3>
            <ol className="text-sm text-orange-800 space-y-2 list-decimal list-inside">
              <li>
                A confirmation email will be sent to <strong>{contactEmail}</strong>
              </li>
              <li>
                The ECA review team will evaluate your application within 5-7
                business days
              </li>
              <li>
                You may be contacted for additional information if required
              </li>
              <li>
                A final decision will be communicated to you via email with your
                Tracking ID
              </li>
            </ol>
          </div>

          {/* Important Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">
              Important Information
            </h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Keep your Tracking ID safe - you'll need it for status inquiries</li>
              <li>
                Check your email (including spam folder) for updates from ECA
              </li>
              <li>Do not submit another application for the same company</li>
              <li>
                If you don't receive a confirmation email, please contact support
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Need help?</strong> If you have any questions about your
              application, please contact us at{" "}
              <a
                href="mailto:support@ecavhs.ae"
                className="text-blue-700 font-semibold hover:underline"
              >
                support@ecavhs.ae
              </a>
            </p>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 flex gap-3 flex-wrap">
          <button
            onClick={handleDownloadReceipt}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            <Download size={18} />
            Download Receipt
          </button>
          <button
            onClick={() => {
              window.location.href = `mailto:${contactEmail}?subject=ECA Vendor Application - Tracking ID: ${trackingId}`;
            }}
            className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition font-medium"
          >
            <Mail size={18} />
            Email Tracking ID
          </button>
          <button
            onClick={handleBackToHome}
            className="ml-auto px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
