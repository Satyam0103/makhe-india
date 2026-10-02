import React from "react";
import { ArrowLeft } from "lucide-react";
import { PageRoute } from "../types";

type PolicyKind = "shipping" | "returns";

interface PolicySection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  afterBullets?: string[];
}

interface PolicyContent {
  title: string;
  introduction: string;
  sections: PolicySection[];
}

const POLICIES: Record<PolicyKind, PolicyContent> = {
  shipping: {
    title: "Shipping Policy",
    introduction:
      "Thank you for shopping with Makhe India. We aim to process and deliver your orders safely and within the estimated delivery timeline.",
    sections: [
      {
        title: "1. Order Processing",
        bullets: [
          "Orders are generally processed within 1–2 business days after successful order confirmation.",
          "Orders placed on weekends or public holidays may be processed on the next business day.",
        ],
      },
      {
        title: "2. Delivery Time",
        paragraphs: [
          "Once your order has been dispatched, delivery generally takes approximately 3–7 business days, depending on the delivery location and courier service.",
          "Delivery timelines may vary due to:",
        ],
        bullets: [
          "Location and serviceability",
          "Weather conditions",
          "Public holidays",
          "Courier delays",
          "High order volumes",
          "Other circumstances beyond our reasonable control",
        ],
      },
      {
        title: "3. Shipping Charges",
        paragraphs: [
          "Shipping charges, if applicable, will be displayed at checkout before you complete your purchase. We may also offer free shipping on selected orders, products, locations, or promotional periods.",
        ],
      },
      {
        title: "4. Order Tracking",
        paragraphs: [
          "Once your order has been shipped, tracking details may be shared with you through your registered mobile number or email address.",
          "You can use the tracking information provided by the courier to check the status of your shipment.",
        ],
      },
      {
        title: "5. Incorrect Address",
        paragraphs: [
          "Customers are responsible for providing accurate delivery information at checkout.",
          "If an incorrect or incomplete address is provided and the order cannot be delivered, additional shipping charges may apply for re-delivery.",
        ],
      },
      {
        title: "6. Delayed or Lost Orders",
        paragraphs: [
          "If your order is delayed beyond the expected delivery period, please contact us at wecare@makheindia.com or +91 8409118082 with your order details.",
          "We will coordinate with the delivery partner and assist you as reasonably possible.",
        ],
      },
      {
        title: "7. Damaged Package",
        paragraphs: [
          "If your package arrives visibly damaged, please contact us as soon as possible and preferably within 48 hours of delivery.",
          "Please keep the original packaging and provide photographs or videos of the package and products when requested.",
        ],
      },
      {
        title: "8. Contact Us",
        paragraphs: [
          "For shipping-related queries, please contact:",
          "Makhe India",
          "Website: makheindia.com",
          "Email: wecare@makheindia.com",
          "Phone: +91 8409118082",
          "Address: Darbhanga, Bihar (846001)",
        ],
      },
    ],
  },
  returns: {
    title: "Return & Refund Policy",
    introduction:
      "At Makhe India, we want you to receive your order in good condition. Since our products are food items, returns are subject to the conditions mentioned below.",
    sections: [
      {
        title: "1. Returns",
        paragraphs: [
          "For hygiene and food-safety reasons, we generally do not accept returns of food products once they have been delivered.",
          "However, if you receive:",
        ],
        bullets: [
          "A damaged product",
          "A wrong product",
          "A defective or tampered package",
          "A product damaged during transit",
        ],
        afterBullets: ["please contact us as soon as possible after delivery."],
      },
      {
        title: "2. Damaged or Incorrect Orders",
        paragraphs: [
          "If your order arrives damaged or you receive an incorrect product, please contact us within 48 hours of delivery.",
          "We may request:",
        ],
        bullets: [
          "Order number",
          "Photographs/videos of the received product",
          "Photographs of the outer packaging",
          "A description of the issue",
        ],
        afterBullets: [
          "After reviewing the request, we may offer a replacement, refund, or another appropriate resolution, depending on the circumstances.",
        ],
      },
      {
        title: "3. Refunds",
        paragraphs: [
          "If a refund is approved, the refund will generally be processed to the original payment method used for the purchase.",
          "The time taken for the amount to reflect in your account may depend on your bank or payment service provider.",
        ],
      },
      {
        title: "4. Non-Refundable Situations",
        paragraphs: [
          "Refunds or replacements may not be available in cases such as:",
        ],
        bullets: [
          "Change of mind after delivery",
          "Incorrect address provided by the customer",
          "Failure to accept the delivery",
          "Product damage caused after delivery due to improper storage or handling",
          "Requests made outside the applicable reporting period",
          "Products that have been opened, consumed, or otherwise used, except where the issue relates to a verified product defect or damage",
        ],
      },
      {
        title: "5. Cancellation",
        paragraphs: [
          "Order cancellation may be possible if the order has not yet been processed or dispatched.",
          "Once an order has been dispatched, cancellation may no longer be possible.",
          "To request cancellation, contact us as soon as possible at wecare@makheindia.com or +91 8409118082.",
        ],
      },
      {
        title: "6. Refund Processing",
        paragraphs: [
          "Once a refund is approved, we will initiate the refund within a reasonable processing period. The actual credit time may vary depending on the payment method and financial institution.",
        ],
      },
      {
        title: "7. Contact Us",
        paragraphs: [
          "For return or refund-related queries, please contact:",
          "Makhe India",
          "Website: makheindia.com",
          "Email: wecare@makheindia.com",
          "Phone: +91 8409118082",
          "Address: Darbhanga, Bihar (846001)",
        ],
      },
    ],
  },
};

interface PolicyPageProps {
  policy: PolicyKind;
  onNavigate: (page: PageRoute) => void;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({
  policy,
  onNavigate,
}) => {
  const content = POLICIES[policy];

  return (
    <main className="min-h-[60vh] bg-[#FAF7F2] py-10 sm:py-14">
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#183321] hover:text-[#8C6420]"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
        <header className="mb-8 border-b border-[#DFD3BE] pb-6">
          <h1 className="font-serif-brand text-3xl font-bold text-[#142B1A] sm:text-4xl">
            {content.title}
          </h1>
          <p className="mt-3 text-sm text-[#687A6C]">
            Last Updated: 02/10/2026
          </p>
          <p className="mt-5 text-base leading-relaxed text-[#34473A]">
            {content.introduction}
          </p>
        </header>
        <div className="space-y-7">
          {content.sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-2 font-serif-brand text-xl font-bold text-[#142B1A]">
                {section.title}
              </h2>
              <div className="space-y-2 text-sm leading-relaxed text-[#34473A] sm:text-base">
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul className="list-disc space-y-1 pl-6">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
                {section.afterBullets?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
};
