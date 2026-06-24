import { motion } from "framer-motion";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { fadeInUp, staggerContainer } from "@/lib/framer-variants";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SEO.privacy" });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://planit-app.com";

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: {
        en: `${baseUrl}/en/privacy`,
        uk: `${baseUrl}/uk/privacy`,
      },
    },
  };
}

export default function PrivacyPage() {
  const t = useTranslations("Privacy");

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-24 min-h-screen">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-12"
      >
        <motion.div variants={fadeInUp} className="space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-2">
            <ShieldCheck weight="duotone" className="w-10 h-10 text-indigo-500" />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest">
            {t("lastUpdated")}
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="prose prose-zinc dark:prose-invert max-w-none space-y-10">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4">
              1. {t("section1Title")}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
              {t("section1Content")}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4">
              2. {t("section2Title")}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
              {t("section2Content")}
            </p>
          </section>
        </motion.div>
      </motion.div>
    </div>
  );
}