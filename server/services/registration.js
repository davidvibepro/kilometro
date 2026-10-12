const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// D1: the LTO renewal month comes from the LAST digit in the plate number.
// 1 = January ... 9 = September, and 0 = October. Returns the month number (1-10).
export function getRegistrationMonth(plateNumber) {
  const digits = plateNumber.match(/\d/g);
  if (!digits) return null;

  const lastDigit = Number(digits[digits.length - 1]);
  return lastDigit === 0 ? 10 : lastDigit;
}

// The same month as a name, e.g. "ABC 1234" -> "April" (used by D18)
export function getRegistrationMonthName(plateNumber) {
  const month = getRegistrationMonth(plateNumber);
  return month ? MONTH_NAMES[month - 1] : null;
}

// D7: 'due_this_month', 'due_next_month', or null when the renewal is further away.
// After December comes January.
export function getRegistrationStatus(plateNumber, today = new Date()) {
  const month = getRegistrationMonth(plateNumber);
  const thisMonth = today.getMonth() + 1; // getMonth() counts from 0
  const nextMonth = thisMonth === 12 ? 1 : thisMonth + 1;

  if (month === thisMonth) return 'due_this_month';
  if (month === nextMonth) return 'due_next_month';
  return null;
}
