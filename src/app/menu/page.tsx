import PdfViewer from "@/components/PdfViewer";

export const metadata = {
  title: "Our Menu",
  description:
    "Browse Otter Pizza's full menu — Classic, Premium, and Specialty pizzas, plus sides and drinks. Order online for delivery or pickup.",
};

export default function MenuPage() {
  return (
    <div className="min-h-screen pt-16">
      <PdfViewer
        src="/menu.pdf"
        className="w-full"
        style={{ height: "calc(100vh - 4rem)" }}
      />
    </div>
  );
}
