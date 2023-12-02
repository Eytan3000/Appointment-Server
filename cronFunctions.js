import {
  getClient,
  getUserByUid,
  readAllAppointmentsAtDate,
  readBusiness,
  readSingleService,
} from './database.js';
import {
  formatIsraeliPhoneNumberToE164,
  getDayAfterTomorrowDate,
  getTomorrowDate,
} from './helperFunctions.js';
import { sendWhatsappMessage } from './messageSend.js';

export async function sendReminderCron() {
  const tomorrowDate = getTomorrowDate();
  const formattedDateForString = tomorrowDate.split('-').reverse().join('/'); // 2023-12-07 >> 07/12/2023

  const dayAfterTomorrowDate = getDayAfterTomorrowDate();
  const result = await readAllAppointmentsAtDate(tomorrowDate);
  console.log(result);
  //iMac this is supposed to be tomorrow, not day after, but for some reason mysql returns -1 day in the date. check this:
  //https://stackoverflow.com/questions/54666536/date-one-day-backwards-after-select-from-mysql-db

  if (result.length > 0) {
    result.forEach(async (appointment) => {
      const { owner_id, client_id, service_id, start } = appointment;

      // get ownerName
      const [{ fullname: ownerName }] = await getUserByUid(owner_id);

      // get businessAddress
      const [{ address: businessAddress }] = await readBusiness(owner_id);

      // get clientName, clientPhone
      const [{ Name: clientName, phone }] = await getClient(client_id);
      const clientPhone = formatIsraeliPhoneNumberToE164(phone);

      // get serviceDuration
      const [{ duration: serviceDuration }] = await readSingleService(
        service_id
      );

      const message = `Hello ${clientName}, you've scheduled an appointment with ${ownerName} on ${formattedDateForString} at ${start.slice(
        0,
        -3
      )}. The session is located at ${businessAddress} and expected to last for ${serviceDuration} minutes.`;
      // Hello eytan test 3, you've scheduled an appointment with user7000 on 01/12/2023 at 11:30. The session is located at Wilson 7 Tel Aviv and expected to last for 60 minutes.
      sendWhatsappMessage(message, clientPhone);

    });
  }
  else console.log('no appointments');
  
}
export function eytan() {
  console.log('eytan');
}
