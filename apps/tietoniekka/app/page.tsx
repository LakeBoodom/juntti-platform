import {
  getTodaysCelebrity,
  getTodaysQuiz,
  getRandomQuizzesPerCategory,
  getPinnallaEvents,
} from "../lib/queries";
import { CATEGORIES } from "../lib/categories";
import { HomeClient } from "./home-client";

// Cache 1 h — sisältö ei muutu päivän aikana usein
export const revalidate = 3600;

export default async function HomePage() {
  // Rinnakkainen haku
  const [todaysCelebrity, todaysQuiz, categoryQuizzes, pinnallaEvents] = await Promise.all([
    getTodaysCelebrity(),
    getTodaysQuiz(),
    getRandomQuizzesPerCategory(CATEGORIES.map((c) => c.slug)),
    getPinnallaEvents(),
  ]);

  return (
    <HomeClient
      todaysCelebrity={todaysCelebrity}
      todaysQuiz={todaysQuiz}
      categoryQuizzes={categoryQuizzes}
      pinnallaEvents={pinnallaEvents}
    />
  );
}
