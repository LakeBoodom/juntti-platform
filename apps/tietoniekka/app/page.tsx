import {
  getTodaysCelebrity,
  getTodaysQuiz,
  getRandomQuizzesPerCategory,
  getPinnallaEvents,
  getSankariQuizPreview,
} from "../lib/queries";
import { CATEGORIES } from "../lib/categories";
import { HomeClient } from "./home-client";
import { getDuelData, makeDuel } from "../lib/duel";

// Cache 1 h — sisältö ei muutu päivän aikana usein
export const revalidate = 3600;

export default async function HomePage() {
  // Rinnakkainen haku
  const [todaysCelebrity, todaysQuiz, categoryQuizzes, pinnallaEvents, duelData] = await Promise.all([
    getTodaysCelebrity(),
    getTodaysQuiz(),
    getRandomQuizzesPerCategory(CATEGORIES.map((c) => c.slug)),
    getPinnallaEvents(),
    getDuelData(),
  ]);

  // Yksi oikea kaksintaistelu etusivun nostoon — ei mock-dataa
  const duel = duelData ? makeDuel(duelData, "sekoitus", new Set()) : null;
  const kumpiPreview = duel
    ? { subject: duel.def.subject, question: duel.def.question, a: duel.a.name, b: duel.b.name }
    : null;
  // Sankarin oma visa vasta kun tiedämme trivia_quiz_id:n (riippuu yllä olevasta hausta)
  const sankariQuiz = todaysCelebrity?.trivia_quiz_id
    ? await getSankariQuizPreview(todaysCelebrity.trivia_quiz_id)
    : null;

  return (
    <HomeClient
      todaysCelebrity={todaysCelebrity}
      todaysQuiz={todaysQuiz}
      categoryQuizzes={categoryQuizzes}
      pinnallaEvents={pinnallaEvents}
      sankariQuiz={sankariQuiz}
      kumpiPreview={kumpiPreview}
    />
  );
}
