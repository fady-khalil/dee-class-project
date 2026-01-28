import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Container from "Components/Container/Container";
import useFetch from "Hooks/useFetch";
import IsLoading from "Components/RequestHandler/IsLoading";
import PlanTitle from "./PlanTitle";
import FrequentlyAskedQuestions from "Components/FQ/FrequentlyAskedQuestions";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import { useNavigate } from "react-router-dom";
import usePostDataNoLang from "Hooks/usePostDataNoLang";
import Spinner from "Components/RequestHandler/Spinner";
import { FRONTEND_URL } from "Utilities/BASE_URL";

const Plans = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError, fetchData } = useFetch("");
  const { user, isLoggedIn, token } = useContext(LoginAuthContext);
  const {
    postData,
    isLoading: isPostLoading,
  } = usePostDataNoLang();

  // Billing cycle toggle state
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  const handlePayment = async (plan) => {
    if (isLoggedIn) {
      setLoadingPlanId(plan.id);

      const payload = {
        type: "package",
        user_id: user?._id,
        id: plan.id,
        source: "website",
        billingCycle: billingCycle,
        success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}&source=website`,
        cancel_url: `${FRONTEND_URL}/payment-cancelled`,
      };

      const response = await postData("create-checkout-session", payload, token);

      if (response?.success && response?.data?.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        console.error("Failed to create checkout session:", response?.message);
        setLoadingPlanId(null);
      }
    } else {
      navigate("/register", {
        state: { plan_id: plan.id, is_register: true },
      });
    }
  };

  useEffect(() => {
    fetchData("packages");
  }, []);

  if (isLoading) {
    return <IsLoading />;
  }

  if (data) {
    return (
      <section className="lg:py-primary py-secondary">
        <Container>
          <PlanTitle />

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center items-center mb-10">
            <div className="bg-grey rounded-full p-1 flex items-center">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  billingCycle === "monthly"
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {t("plans.monthly") || "Monthly"}
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  billingCycle === "yearly"
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {t("plans.yearly") || "Yearly"}
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                  {t("plans.save") || "Save"} 20%
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row justify-center items-center xl:items-end gap-6 md:gap-10 mt-10 lg:mt-0">
            {data?.data?.packages?.map((plan, index) => {
              const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
              const priceFormatted = billingCycle === "yearly" ? plan.yearlyPriceFormatted : plan.monthlyPriceFormatted;
              const isCurrentLoading = loadingPlanId === plan.id;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`w-full md:w-1/2 xl:w-1/3 max-w-md bg-grey rounded-2xl overflow-hidden ${
                    plan.isPopular ? "border-2 border-primary" : ""
                  }`}
                >
                  {plan.isPopular && (
                    <div className="bg-primary text-white text-center py-2 text-sm font-medium">
                      {t("plans.most_popular") || "Most Popular"}
                    </div>
                  )}
                  <div className="p-4 lg:p-6 flex flex-col justify-between min-h-[450px]">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                      <div className="mt-4 mb-6">
                        <div className="flex items-baseline">
                          <p className="text-4xl lg:text-5xl font-bold text-white">
                            {price}
                          </p>
                          <span className="text-gray-400 ml-2">
                            {plan.currency}/{billingCycle === "yearly" ? t("plans.year") || "year" : t("plans.month") || "month"}
                          </span>
                        </div>
                        {billingCycle === "yearly" && (() => {
                          const savings = Math.round(((plan.monthlyPrice * 12) - plan.yearlyPrice) / (plan.monthlyPrice * 12) * 100);
                          return savings > 0 ? (
                            <p className="text-sm text-green-400 mt-1">
                              {t("plans.yearly_savings")} {savings}% {t("plans.compared_monthly")}
                            </p>
                          ) : null;
                        })()}
                      </div>

                      {plan.description && (
                        <p
                          className="text-gray-400 text-sm mb-4"
                          dangerouslySetInnerHTML={{ __html: plan.description }}
                        ></p>
                      )}

                      {/* Features list */}
                      {plan.features && plan.features.length > 0 && (
                        <ul className="space-y-3 mt-4">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-gray-300 text-sm">
                              <svg
                                className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Profiles allowed */}
                      <div className="mt-4 flex items-center text-gray-300 text-sm">
                        <svg
                          className="w-5 h-5 text-primary mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        {plan.profilesAllowed} {t("plans.profiles") || "Profiles"}
                      </div>

                      {/* Download permission */}
                      {plan.canDownload && (
                        <div className="mt-2 flex items-center text-gray-300 text-sm">
                          <svg
                            className="w-5 h-5 text-primary mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {t("plans.download_available") || "Download available"}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handlePayment(plan)}
                      disabled={isCurrentLoading}
                      className="w-full mt-6 py-3 px-4 bg-primary hover:bg-darkPrimary transition ease-in-out duration-300 text-white font-semibold rounded-lg flex justify-center items-center disabled:opacity-70"
                    >
                      {isCurrentLoading ? (
                        <Spinner isWhite={true} />
                      ) : (
                        t("buttons.plans_button") || "Subscribe"
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <FrequentlyAskedQuestions title="Plans" data={data?.data?.faqs} />
        </Container>
      </section>
    );
  }
};

export default Plans;
