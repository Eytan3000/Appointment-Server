export function addDayToDate(inputDate) {
  // Parse the input date string to a Date object
  const dateObject = new Date(inputDate);

  // Add one day to the date
  dateObject.setDate(dateObject.getDate() + 1);

  // Return the updated date as a string
  return dateObject;
}

export function getTomorrowDate() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); 

  const year = tomorrow.getFullYear();
  const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const day = tomorrow.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getDayAfterTomorrowDate() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 3); 

  const year = tomorrow.getFullYear();
  const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const day = tomorrow.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatIsraeliPhoneNumberToE164(phone) {
  // Remove non-numeric characters from the input
  const numericOnly = phone.replace(/\D/g, '');

  // Check if the number starts with "0" and remove it
  const withoutLeadingZero = numericOnly.startsWith('0') ? numericOnly.slice(1) : numericOnly;

  // Add the country code for Israel (+972) to the formatted number
  const formattedNumber = `+972${withoutLeadingZero}`;

  return formattedNumber;
}


