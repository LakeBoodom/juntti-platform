import {
  getTodaysCelebrity,
  getTodaysQuiz,
  getRandomQuizzesPerCategory,
  getPinnallaEvents,
  getKuvavisaTeasers,
} from "../lib/queries";
import { CATEGORIES } from "../lib/categories";
import { HomeClient } from "./home-client";

// Cache 1 h — sisältö ei muutu päivän aikana usein
export const revalidate = 3600;

export default async function HomePage() {
  // Rinnakkainen haku
  const [todaysCelebrity, todaysQuiz, categoryQuizzes, pinnallaEvents, kuvavisaTeasers] = await Promise.all([
    getTodaysCelebrity(),
    getTodaysQuiz(),
    getRandomQuizzesPerCategory(CATEGORIES.map((c) => c.slug)),
    getPinnallaEvents(),
    getKuvavisaTeasers(),
  ]);

  return (
    <HomeClient
      todaysCelebrity={todaysCelebrity}
      todaysQuiz={todaysQuiz}
      categoryQuizzes={categoryQuizzes}
      pinnallaEvents={pinnallaEvents}
      kuvavisaTeasers={kuvavisaTeasers}
    />
  );
}
