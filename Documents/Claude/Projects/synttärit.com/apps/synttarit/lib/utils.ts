// Apufunktiot päivämäärille ja iälle

export function getAge(birthDate: string): number {
  const today = new Date();
  const born = new Date(birthDate);
  let age = today.getFullYear() - born.getFullYear();
  const m = today.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--;
  return age;
}

export function formatBirthDateFi(birthDate: string): string {
  const d = new Date(birthDate);
  const months = [
    "tammikuuta", "helmikuuta", "maaliskuuta", "huhtikuuta",
    "toukokuuta", "kesäkuuta", "heinäkuuta", "elokuuta",
    "syyskuuta", "lokakuuta", "marraskuuta", "joulukuuta",
  ];
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function getTodayMonthDay(): { month: number; day: number } {
  const today = new Date();
  return { month: today.getMonth() + 1, day: today.getDate() };
}

export function getMonthNameFi(month: number): string {
  const names = [
    "Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu",
    "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu",
    "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu",
  ];
  return names[month - 1] ?? "";
}
