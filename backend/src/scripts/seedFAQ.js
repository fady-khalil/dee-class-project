import mongoose from "mongoose";
import dotenv from "dotenv";
import FAQ from "../Modules/FAQ.model.js";

dotenv.config();

const faqItems = [
  {
    question: "What is Dee Class?",
    question_ar: "ما هو دي كلاس؟",
    answer: "Dee Class is an online learning platform that offers a wide range of courses in music, technology, art, and more. Learn from expert instructors at your own pace.",
    answer_ar: "دي كلاس هو منصة تعليمية عبر الإنترنت تقدم مجموعة واسعة من الدورات في الموسيقى والتكنولوجيا والفن وغيرها. تعلّم من مدربين خبراء بالسرعة التي تناسبك.",
  },
  {
    question: "How do I create an account on Dee Class?",
    question_ar: "كيف أنشئ حسابًا على دي كلاس؟",
    answer: "Simply click the Sign Up button on our homepage, enter your email and create a password. You can also sign up using your social media accounts for faster registration.",
    answer_ar: "ما عليك سوى النقر على زر التسجيل في الصفحة الرئيسية، وإدخال بريدك الإلكتروني وإنشاء كلمة مرور. يمكنك أيضًا التسجيل باستخدام حسابات التواصل الاجتماعي لتسجيل أسرع.",
  },
  {
    question: "What types of courses does Dee Class offer?",
    question_ar: "ما أنواع الدورات التي يقدمها دي كلاس؟",
    answer: "We offer single video courses, multi-lesson series, and full playlists organized into chapters. Categories include music, technology, art, business, and many more.",
    answer_ar: "نقدم دورات فيديو فردية، وسلاسل دروس متعددة، وقوائم تشغيل كاملة منظمة في فصول. تشمل الفئات الموسيقى والتكنولوجيا والفن والأعمال وغيرها الكثير.",
  },
  {
    question: "How much do courses cost?",
    question_ar: "كم تكلفة الدورات؟",
    answer: "Course prices vary depending on the content and instructor. You can also subscribe to one of our plans for unlimited access to all courses on the platform.",
    answer_ar: "تختلف أسعار الدورات حسب المحتوى والمدرب. يمكنك أيضًا الاشتراك في إحدى خططنا للوصول غير المحدود إلى جميع الدورات على المنصة.",
  },
  {
    question: "Can I access courses on my mobile device?",
    question_ar: "هل يمكنني الوصول إلى الدورات من هاتفي المحمول؟",
    answer: "Yes! Dee Class is available on both iOS and Android through our mobile app. You can also access courses through any web browser on your phone or tablet.",
    answer_ar: "نعم! دي كلاس متاح على كل من iOS وAndroid من خلال تطبيقنا. يمكنك أيضًا الوصول إلى الدورات من خلال أي متصفح ويب على هاتفك أو جهازك اللوحي.",
  },
  {
    question: "What is the subscription plan and what does it include?",
    question_ar: "ما هي خطة الاشتراك وماذا تتضمن؟",
    answer: "Our subscription plans give you unlimited access to all courses on the platform. You can create multiple profiles under one account so your family members can learn too.",
    answer_ar: "تمنحك خطط الاشتراك لدينا وصولاً غير محدود إلى جميع الدورات على المنصة. يمكنك إنشاء ملفات تعريف متعددة تحت حساب واحد حتى يتمكن أفراد عائلتك من التعلم أيضًا.",
  },
  {
    question: "How do I track my learning progress?",
    question_ar: "كيف أتابع تقدمي في التعلم؟",
    answer: "Dee Class automatically tracks your video progress and completed lessons. You can see which videos you have watched, resume where you left off, and view your completed courses in your profile.",
    answer_ar: "يتتبع دي كلاس تلقائيًا تقدمك في الفيديو والدروس المكتملة. يمكنك رؤية الفيديوهات التي شاهدتها، والاستئناف من حيث توقفت، وعرض دوراتك المكتملة في ملفك الشخصي.",
  },
  {
    question: "Can I gift a course to someone?",
    question_ar: "هل يمكنني إهداء دورة لشخص ما؟",
    answer: "Absolutely! Dee Class offers a gift feature that lets you purchase a course or subscription as a gift. The recipient will receive a unique code to redeem their gift.",
    answer_ar: "بالتأكيد! يقدم دي كلاس ميزة الهدايا التي تتيح لك شراء دورة أو اشتراك كهدية. سيتلقى المستلم رمزًا فريدًا لاسترداد هديته.",
  },
  {
    question: "How can I become an instructor on Dee Class?",
    question_ar: "كيف يمكنني أن أصبح مدربًا على دي كلاس؟",
    answer: "If you are an expert in your field, you can apply to become an instructor through our Expert Application form. Our team will review your application and get back to you.",
    answer_ar: "إذا كنت خبيرًا في مجالك، يمكنك التقدم لتصبح مدربًا من خلال نموذج طلب الخبراء لدينا. سيقوم فريقنا بمراجعة طلبك والتواصل معك.",
  },
  {
    question: "What is the refund policy?",
    question_ar: "ما هي سياسة الاسترداد؟",
    answer: "If you are not satisfied with a course, you can request a refund within 14 days of purchase, provided you have not completed more than 30% of the course content. Contact our support team for assistance.",
    answer_ar: "إذا لم تكن راضيًا عن دورة ما، يمكنك طلب استرداد المبلغ خلال 14 يومًا من الشراء، بشرط ألا تكون قد أكملت أكثر من 30% من محتوى الدورة. تواصل مع فريق الدعم لدينا للمساعدة.",
  },
];

const seedFAQ = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find existing FAQ or create new one
    let faq = await FAQ.findOne({ singleton: "faq" });

    if (faq) {
      console.log("Existing FAQ found — replacing items...");
      faq.pageTitle = "Frequently Asked Questions";
      faq.pageTitle_ar = "الأسئلة الشائعة";
      faq.items = faqItems.map((item, index) => ({ ...item, order: index }));
    } else {
      console.log("No FAQ found — creating new one...");
      faq = new FAQ({
        pageTitle: "Frequently Asked Questions",
        pageTitle_ar: "الأسئلة الشائعة",
        items: faqItems.map((item, index) => ({ ...item, order: index })),
      });
    }

    await faq.save();
    console.log(`\n=== FAQ Seeded Successfully ===`);
    console.log(`${faq.items.length} questions added.`);
  } catch (error) {
    console.error("Error seeding FAQ:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedFAQ();
