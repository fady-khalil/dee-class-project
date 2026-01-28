import React from "react";

const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-primary">Privacy Policy</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-600 mb-4">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            1. Introduction
          </h2>
          <p className="text-gray-600 mb-2">
            Welcome to D-Class. We respect your privacy and are committed to
            protecting your personal data. This Privacy Policy explains how we
            collect, use, and safeguard your information when you use our
            service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            2. Information We Collect
          </h2>
          <p className="text-gray-600 mb-2">
            We may collect several types of information from and about users of
            our platform, including:
          </p>
          <ul className="list-disc pl-6 mb-2 text-gray-600">
            <li>
              Personal identifiers such as name, email address, and phone number
            </li>
            <li>Account credentials</li>
            <li>Profile information</li>
            <li>Usage data and analytics</li>
            <li>Device information</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            3. How We Use Your Information
          </h2>
          <p className="text-gray-600 mb-2">We use your information to:</p>
          <ul className="list-disc pl-6 mb-2 text-gray-600">
            <li>Provide and maintain our service</li>
            <li>Improve and personalize your experience</li>
            <li>Process transactions</li>
            <li>Send you service-related notifications</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Analyze usage patterns and improve our platform</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            4. Data Sharing and Disclosure
          </h2>
          <p className="text-gray-600 mb-2">
            We may share your information with:
          </p>
          <ul className="list-disc pl-6 mb-2 text-gray-600">
            <li>Service providers who perform services on our behalf</li>
            <li>Business partners with your consent</li>
            <li>Legal authorities when required by law</li>
            <li>
              In connection with a business transaction such as a merger or
              acquisition
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            5. Data Security
          </h2>
          <p className="text-gray-600 mb-2">
            We implement appropriate security measures to protect your personal
            information from unauthorized access, alteration, disclosure, or
            destruction. However, no method of transmission over the Internet or
            electronic storage is 100% secure.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            6. Your Privacy Rights
          </h2>
          <p className="text-gray-600 mb-2">
            Depending on your location, you may have certain rights regarding
            your personal information, including:
          </p>
          <ul className="list-disc pl-6 mb-2 text-gray-600">
            <li>Access to your personal data</li>
            <li>Correction of inaccurate data</li>
            <li>Deletion of your data</li>
            <li>Restriction of processing</li>
            <li>Data portability</li>
            <li>Objection to processing</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            7. Contact Us
          </h2>
          <p className="text-gray-600 mb-2">
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <p className="text-gray-600">
            Email: privacy@d-class.example.com
            <br />
            Address: 123 Privacy Street, Data City, DC 12345
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
