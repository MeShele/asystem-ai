import { QuizForm } from "@/components/quiz/quiz-form";

export default function RequestPage() {
  return (
    <section className="relative">
      <div className="fc-container">
        <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />
        <div className="min-h-screen pt-28 pb-20 px-4">
          <QuizForm />
        </div>
      </div>
    </section>
  );
}
