export function isAdult(dob: Date, minAge = 18) {
  const now = new Date();
  const age = now.getFullYear() - dob.getFullYear() - (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
  return age >= minAge;
}
