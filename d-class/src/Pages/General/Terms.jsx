import React from "react";

const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-primary">Terms of Service</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-600 mb-4">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            1. Agreement to Terms
          </h2>
          <p className="text-gray-600 mb-2">
            By accessing or using the D-Class platform, you agree to be bound by
            these Terms of Service and all applicable laws and regulations. If
            you do not agree with any of these terms, you are prohibited from
            using or accessing this site.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            2. Use License
          </h2>
          <p className="text-gray-600 mb-2">
            Permission is granted to temporarily access the materials on
            D-Class's platform for personal, non-commercial use. This is the
            grant of a license, not a transfer of title, and under this license
            you may not:
          </p>
          <ul className="list-disc pl-6 mb-2 text-gray-600">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>
              Attempt to decompile or reverse engineer any software contained on
              the platform
            </li>
            <li>
              Remove any copyright or other proprietary notations from the
              materials
            </li>
            <li>
              Transfer the materials to another person or "mirror" the materials
              on any other server
            </li>
          </ul>
          <p className="text-gray-600 mb-2">
            This license shall automatically terminate if you violate any of
            these restrictions and may be terminated by D-Class at any time.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            3. User Accounts
          </h2>
          <p className="text-gray-600 mb-2">
            When you create an account with us, you must provide information
            that is accurate, complete, and current at all times. Failure to do
            so constitutes a breach of the Terms, which may result in immediate
            termination of your account.
          </p>
          <p className="text-gray-600 mb-2">
            You are responsible for safeguarding the password that you use to
            access the service and for any activities or actions under your
            password. You agree not to disclose your password to any third
            party.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            4. Intellectual Property
          </h2>
          <p className="text-gray-600 mb-2">
            The Service and its original content, features, and functionality
            are and will remain the exclusive property of D-Class and its
            licensors. The Service is protected by copyright, trademark, and
            other laws of both the United States and foreign countries.
          </p>
          <p className="text-gray-600 mb-2">
            Our trademarks and trade dress may not be used in connection with
            any product or service without the prior written consent of D-Class.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            5. User Content
          </h2>
          <p className="text-gray-600 mb-2">
            You are solely responsible for all content that you upload, post,
            email, transmit, or otherwise make available via our Service. By
            providing any content on the Service, you grant us a worldwide,
            non-exclusive, royalty-free license to use, reproduce, modify,
            perform, display, distribute, and otherwise disclose to third
            parties any such material.
          </p>
          <p className="text-gray-600 mb-2">
            You represent and warrant that your content:
          </p>
          <ul className="list-disc pl-6 mb-2 text-gray-600">
            <li>Does not violate the rights of any third party</li>
            <li>Complies with all applicable laws and regulations</li>
            <li>
              Does not contain any malicious code, viruses, or other harmful
              content
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            6. Limitation of Liability
          </h2>
          <p className="text-gray-600 mb-2">
            In no event shall D-Class, nor its directors, employees, partners,
            agents, suppliers, or affiliates, be liable for any indirect,
            incidental, special, consequential or punitive damages, including
            without limitation, loss of profits, data, use, goodwill, or other
            intangible losses, resulting from:
          </p>
          <ul className="list-disc pl-6 mb-2 text-gray-600">
            <li>
              Your access to or use of or inability to access or use the Service
            </li>
            <li>Any conduct or content of any third party on the Service</li>
            <li>Any content obtained from the Service</li>
            <li>
              Unauthorized access, use or alteration of your transmissions or
              content
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            7. Termination
          </h2>
          <p className="text-gray-600 mb-2">
            We may terminate or suspend your account immediately, without prior
            notice or liability, for any reason whatsoever, including without
            limitation if you breach the Terms.
          </p>
          <p className="text-gray-600 mb-2">
            Upon termination, your right to use the Service will immediately
            cease. If you wish to terminate your account, you may simply
            discontinue using the Service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            8. Governing Law
          </h2>
          <p className="text-gray-600 mb-2">
            These Terms shall be governed and construed in accordance with the
            laws of the United States, without regard to its conflict of law
            provisions.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            9. Changes to Terms
          </h2>
          <p className="text-gray-600 mb-2">
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. If a revision is material we will try to
            provide at least 30 days' notice prior to any new terms taking
            effect.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-primary">
            10. Contact Us
          </h2>
          <p className="text-gray-600 mb-2">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="text-gray-600">
            Email: legal@d-class.example.com
            <br />
            Address: 123 Terms Street, Legal City, LC 12345
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
