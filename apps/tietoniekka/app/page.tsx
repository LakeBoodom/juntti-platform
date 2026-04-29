import {
  getTodaysCelebrity,
  getTodaysQuiz,
  getRandomQuizzesPerCategory,
  getUpcomingEvents,
} from "../lib/queries";
import { CATEGORIES } from "../lib/categories";
import { HomeClient } from "./home-client";

// Cache 1 h — sisältö ei muutu päivän aikana usein
export const revalidate = 3600;

export default async function HomePage() {
  // Rinnakkainen haku
  const [todaysCelebrity, todaysQuiz, upcomingEvents, categoryQuizzes] = await Promise.all([
    getTodaysCelebrity(),
    getTodaysQuiz(),
    getUpcomingEvents(3),
    getRandomQuizzesPerCategory(CATEGORIES.map((c) => c.slug)),
  ]);

  return (
    <HomeClient
      todaysCelebrity={todaysCelebrity}
      todaysQuiz={todaysQuiz}
      categoryQuizzes={categoryQuizzes}
      upcomingEvents={upcomingEvents}
    />
  );
}
