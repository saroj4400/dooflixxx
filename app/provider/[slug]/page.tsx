
import { notFound } from "next/navigation";
import ProviderClient from "./ProviderClient";

const providerNames: Record<string, string> = {
    netflix: "Netflix",
    prime: "Prime Video",
    disney: "Disney+",
    apple: "Apple TV+",
    applestore: "Apple TV",
    hulu: "Hulu",
    hbo: "HBO Max",
    paramount: "Paramount+",
    peacock: "Peacock",
    crunchyroll: "Crunchyroll",
    starz: "Starz",
    amc: "AMC+"
};

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function ProviderPage({ params }: Props) {
    const { slug } = await params;
    const providerName = providerNames[slug];

    if (!providerName) notFound();

    return (
        <main className="min-h-screen bg-[#08080c] px-4 pb-16 pt-24 sm:px-6 md:px-10">
            <ProviderClient
                slug={slug}
                providerName={providerName}
            />
        </main>
    );
}
