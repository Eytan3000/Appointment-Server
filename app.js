import express from 'express';
import {
  changeUserTempId,
  checkOverlaps,
  createAppointment,
  createBusiness,
  createClient,
  createDailySchedule,
  createService,
  createUser,
  createWorkWeek,
  deleteAppointment,
  deleteClient,
  deleteService,
  getAllOwnerClients,
  getClient,
  getClientExistsByPhone,
  getClientIdByPhone,
  getUserByUid,
  readAllAppointmentsAtDate,
  readAllClientAppointments,
  readAllOwnerAppointments,
  readAllOwnerFutureAppointments,
  readAllServices,
  readAppointment,
  readBusiness,
  readOwenerIdFromServiceId,
  readSingleService,
  readWeeklySchedule,
  readWorkWeedId,
  updateAppointment,
  updateBusiness,
  updateClient,
  updateDailySchedule,
  updateService,
} from './database.js';
import cors from 'cors';
import { check, validationResult } from 'express-validator';
import {
  addDayToDate,
  formatIsraeliPhoneNumberToE164,
  getDayAfterTomorrowDate,
  getTomorrowDate,
} from './helperFunctions.js';
import {
  formulateNewSummaryClientMsg,
  sendWhatsappMessage,
} from './messageSend.js';

import twilio from 'twilio';
import cron from 'node-cron';
import { sendReminderCron } from './cronFunctions.js';

const app = express();
app.use(express.json());

const corsOptions = {
  // origin: 'https://planifyapp.netlify.app',
  origin: '*',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
// app.use(cors());



const port = process.env.PORT || 3000;
const cronInterval = '0 19 * * *';

// function wait(time) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, time);
//   });
// }

// TEST
app.get('/test', async (req, res) => {
  try {
      res.status(201).send('Test successful');
      console.log('Test successful console log');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error test');
  }
});

//-- Users --
//Create new user
app.post(
  '/users/create-user',
  [
    check('fullname').notEmpty().withMessage('Full name cannot be empty'),
    check('email').isEmail().withMessage('Invalid email'),
    check('id').notEmpty().withMessage('Id cannot be empty'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('expess- password sould be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const { id, fullname, email, password } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // return res.status(400).json({ error: errors.array() });
        // return res.status(400).send('eytan4000');
        return res.status(400).send(errors.array()[0].msg);
      }
      const user = {
        id,
        fullname,
        email,
      };
      const result = await createUser(user);

      if (result.affectedRows === 1) {
        res.status(201).send('User created successfully');
        console.log('User created successfully');
      } else {
        res.status(500).send('User creation failed');
        console.log('User creation failed');
      }
    } catch (err) {
      console.error(err);
      // res.status(500).send('Server error');
      res.status(500).send(err.sqlMessage);
      // console.log(err.sqlMessage);
    }
  }
);

app.get('/users/change-user-temp-id/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    // // Validate the request data
    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ error: errors.array() });
    // }

    const result = await changeUserTempId(uid);

    if (result.affectedRows === 1) {
      res.status(201).send('User id updated successfully');
      console.log('User id updated successfully');
    } else {
      res.status(500).send('User id update failed');
      console.log('User id update failed');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// google auth:
//Create new user
app.post(
  '/users/create-google-user',
  [
    check('fullname').notEmpty().withMessage('Full name cannot be empty'),
    check('email').isEmail().withMessage('Invalid email'),
    check('id').notEmpty().withMessage('Id cannot be empty'),
  ],
  async (req, res) => {
    try {
      const { id, fullname, email } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // return res.status(400).json({ error: errors.array() });
        // return res.status(400).send('eytan4000');
        return res.status(400).send(errors.array()[0].msg);
      }

      const result = await createUser(id, fullname, email);

      if (result.affectedRows === 1) {
        res.status(201).send('User created successfully');
        console.log('User created successfully');
      } else {
        res.status(500).send('User creation failed');
        console.log('User creation failed');
      }
    } catch (err) {
      console.error(err);
      // res.status(500).send('Server error');
      res.status(500).send(err.sqlMessage);
      // console.log(err.sqlMessage);
    }
  }
);

// get uid return owner full name.
app.get('/users/read-user/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    const result = await getUserByUid(uid);

    if (result.length > 0) {
      res.status(201).json(result[0].fullname);
    } else {
      res.status(500).send('User not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//-- Services --

// Create new service
app.post(
  '/services/create-service',
  [
    check('name').notEmpty().withMessage('Service name cannot be empty'),
    check('owner_id').notEmpty().withMessage('Owner id cannot be empty'),
  ],
  async (req, res) => {
    try {
      const { name, description, duration, price, owner_id, img_url } =
        req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const user = { name, description, duration, price, owner_id, img_url };
      const result = await createService(user);

      if (result.affectedRows === 1) {
        // res.status(201).send('Service created successfully');
        const allServices = await readAllServices(owner_id);
        res.status(201).json(allServices);
      } else {
        res.status(500).send('Service creation failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Read all owner's services by owner_id

app.get('/services/read-all-services/:owner_id', async (req, res) => {
  console.log('Read all services');
  try {
    const owner_id = req.params.owner_id;

    const result = await readAllServices(owner_id);

    if (result.length >= 0) {
      res.status(201).json(result);
    } else {
      res.status(500).send('Services reading failed');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Read single service by service_id

app.get('/services/read-single-service/:service_id', async (req, res) => {
  console.log('Read single service');
  try {
    const service_id = req.params.service_id;

    const result = await readSingleService(service_id);
    // throw error;
    if (result.length > 0) {
      res.status(201).json(result);
    } else {
      res.status(500).send('Services reading failed');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update service by service_id
app.post(
  '/services/update-service',
  [
    // check('name').notEmpty().withMessage('Service name cannot be empty'),
    check('service_id').notEmpty().withMessage('Service id cannot be empty'),
  ],
  async (req, res) => {
    try {
      const {
        name = null,
        description = null,
        duration = null,
        price = null,
        service_id,
        owner_id,
        img_url = null,
      } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }
      const service = {
        name,
        description,
        duration,
        price,
        service_id,
        img_url,
      };
      const result = await updateService(service);

      if (result.affectedRows === 1) {
        // res.status(201).send('Service created successfully');
        const allServices = await readAllServices(owner_id);
        res.status(201).json(allServices);
      } else {
        res.status(500).send('Service creation failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Delete service by service_id
app.delete('/services/:service_id', async (req, res) => {
  try {
    const { service_id } = req.params;

    //   Validate the request data

    if (!service_id) {
      return res.status(400).send('No service id to delete');
    }
    const owner_id = await readOwenerIdFromServiceId(service_id); // get owner_id before deleting, to send back the total array of services.
    const result = await deleteService(service_id);

    if (result.affectedRows === 1) {
      // res.status(201).send('Service deleted successfully');
      const allServices = await readAllServices(owner_id);
      res.status(201).json(allServices);
    } else {
      res.status(500).send('Service deleting failed');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//-- WorkWeek --

// Create new workWeek
app.post(
  '/workweek/create-workweek',
  [check('owner_id').notEmpty().withMessage('Owner id cannot be empty')],
  async (req, res) => {
    try {
      const { owner_id } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const result = await createWorkWeek(owner_id);

      if (result.affectedRows === 1) {
        res.status(201).json({ workweekId: result.insertId });
      } else {
        res.status(500).send('WorkWeek creation failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

//create 7 daily schedules
app.post(
  '/dailySchedule/create-7-daily-schedules',
  [check('workweek_id').notEmpty().withMessage('workweek_id cannot be empty')],
  async (req, res) => {
    try {
      const { weekScheduleObj } = req.body;
      const { workweek_id } = weekScheduleObj;

      // // Validate the request data
      // const errors = validationResult(req);

      // if (!errors.isEmpty()) {
      //   return res.status(400).json({ error: errors.array() });
      // }

      const weekDaysArray = Object.values(weekScheduleObj); //object to arr for map

      //this creates a daily schedule for each arr obj and returns all the
      const resultArr = await Promise.all(
        weekDaysArray.map(async (weekDay) => {
          if (typeof weekDay === 'number') return; // checks if the array object is the workweek_id

          const dailySchedule = {
            day: weekDay.name,
            startTime: weekDay.startTime,
            endTime: weekDay.endTime,
            workweekId:workweek_id,
            isWorkDay: weekDay.isWorkDay,
            timeSlotDuration: weekDay.timeSlotDuration,
          };
          const result = await createDailySchedule(dailySchedule);
          return result.insertId;
        })
      );

      if (resultArr.length > 0) {
        res.status(201).send('WorkWeek created successfully');
        // res.status(201).json(resultArr);
      } else {
        res.status(500).send('WorkWeek creation failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// // Read WorkWeek based on owner_id
// app.post(
//   '/workweek/read-workweek',
//   [check('owner_id').notEmpty().withMessage('Owner_id cannot be empty')],
//   async (req, res) => {
//     try {
//       const { owner_id } = req.body;

//       // Validate the request data
//       const errors = validationResult(req);

//       if (!errors.isEmpty()) {
//         return res.status(400).json({ error: errors.array() });
//       }

//       const result = await getWorkWeekIdForOwnerId(owner_id);

//       if (result.length > 0) {
//         res.status(201).json(result[0]);
//       } else {
//         res.status(500).send('WorkWeek id read failed');
//       }
//     } catch (err) {
//       console.error(err);
//       res.status(500).send('Server error');
//     }
//   }
// );

// Read workWeek_id based on owner_id
app.get('/workweek/read-workweek-id/:owner_id', async (req, res) => {
  try {
    const { owner_id } = req.params;
    // Validate the request data
    const errors = validationResult(req);

    if (owner_id.trim === '') {
      return res.status(400).json({ error: errors.array() });
    }

    const result = await readWorkWeedId(owner_id);

    if (result.length > 0) {
      res.status(201).json(result[0].id);
    } else {
      res.status(500).send('Owner id read failed');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Read weekly schedule based on workweek_id
app.get(
  '/dailySchedule/read-weekly-schedule/:workweek_id',
  async (req, res) => {
    try {
      const { workweek_id } = req.params;

      // Validate the request data
      const errors = validationResult(req);
      if (workweek_id.trim === '') {
        return res.status(400).json({ error: errors.array() });
      }

      const result = await readWeeklySchedule(workweek_id);

      if (result.length > 0) {
        res.status(201).json(result);
      } else {
        res.status(500).send('WorkWeek id read failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Update dailySchedule by workWeek_id AND day_of_week
app.post(
  '/dailySchedule/update-changed-daily-schedules',
  // [check('start_time').withMessage('Start time cannot be empty')],
  // [check('end_time').notEmpty().withMessage('End time cannot be empty')],
  // [check('workWeek_id').notEmpty().withMessage('workweek_id cannot be empty')],
  // [check('day_of_week').notEmpty().withMessage('Day of week cannot be empty')],
  async (req, res) => {
    try {
      const { changedArr } = req.body;

      // // Validate the request data
      // const errors = validationResult(req);

      // if (!errors.isEmpty()) {
      //   return res.status(400).json({ error: errors.array() });
      // }

      const resultArr = await Promise.all(
        changedArr.map(async (weekDay) => {
          const dailySchedule = {
            start_time: weekDay.start_time,
            end_time: weekDay.endTime,
            is_work_day: weekDay.isWorkDay,
            time_slot_duration: weekDay.timeSlotDuration,
            dailySchedule_id: weekDay.id,
          };

          const result = await updateDailySchedule(dailySchedule);
          return result.insertId;
        })
      );

      if (resultArr) {
        res.status(201).send('Daily schedule updated successfully');
      } else {
        res.status(500).send('Daily schedule update failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// --Clients--

// Create new client:
app.post(
  '/clients/create-client',
  [
    check('name').notEmpty().withMessage('Name cannot be empty'),
    check('phone').notEmpty().withMessage('Phone cannot be empty'),
    // check('email').isEmail().withMessage('Invalid email'),
    check('owner_id').notEmpty().withMessage('Owner id cannot be empty'),
  ],
  async (req, res) => {
    try {
      const { name, phone, email, owner_id } = req.body;

      console.log(name, phone, email, owner_id);

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }
      const client = {
        name,
        phone,
        email,
        owner_id,
      };
      const result = await createClient(client);

      if (result.affectedRows === 1) {
        res.status(201).json(result.insertId);
      } else {
        res.status(500).send('Client creation failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Update client by client_id:
app.post(
  '/clients/update-client',
  [check('client_id').notEmpty().withMessage('Client id cannot be empty')],
  async (req, res) => {
    try {
      const { name, phone, email, client_id } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }
      const client = { name, phone, email, client_id };
      const result = await updateClient(client);

      if (result.affectedRows === 1) {
        res.status(201).send('Client updated successfully');
      } else {
        res.status(500).send('Client update failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Delete Client by client_id
app.delete('/clients/delete-client/:client_id', async (req, res) => {
  try {
    const { client_id } = req.params;

    //   Validate the request data

    if (!client_id) {
      return res.status(400).send('No service id to delete');
    }

    const result = await deleteClient(client_id);

    if (result.affectedRows === 1) {
      res.status(201).send('Client deleted successfully');
    } else {
      res.status(500).send('Client deleting failed');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Read all owner's clients
app.get('/clients/get-all-clients/:owner_id', async (req, res) => {
  try {
    const { owner_id } = req.params;

    // Validate the request data

    const result = await getAllOwnerClients(owner_id);

    if (result.length > 0) {
      res.status(201).json(result);
    } else {
      res.status(500).send('Cannot fetch appointment');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Read single client by client_id
app.get('/clients/get-client/:client_id', async (req, res) => {
  try {
    const { client_id } = req.params;

    // Validate the request data

    const result = await getClient(client_id);

    if (result.length > 0) {
      res.status(201).json(result);
    } else {
      res.status(500).send('Cannot fetch appointment');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Read single client for owner by phone
app.get('/clients/get-client-exists-by-phone/', async (req, res) => {
  try {

    const phone = req.query.phone;
    const owner_id = req.query.owner_id;

    // Validate the request data

    const result = await getClientExistsByPhone(phone, owner_id);

    if (result.length > 0) {
      res.status(201).json(result[0]);
    } else {
      res.status(500).send('Cannot execute query');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Read clientId by Phone
app.get('/clients/get-client-id-by-phone/', async (req, res) => {

  try {
    // const { phone } = req.params;

    const phone = req.query.phone;
    const owner_id = req.query.owner_id;

    // Validate the request data

    const result = await getClientIdByPhone(phone, owner_id);

    if (result.length > 0) {
      res.status(201).json(result[0].id);
    } else {
      res.status(500).send('Cannot execute query');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//--Appointments--

// Create new appointment:
app.post(
  '/appointments/create-appointment',
  [check('owner_id').notEmpty().withMessage('Owner id cannot be empty')],
  [check('client_id').notEmpty().withMessage('Client id cannot be empty')],
  [check('service_id').notEmpty().withMessage('Service id cannot be empty')],
  async (req, res) => {
    try {
      const { owner_id, client_id, start, end, date, service_id, note } =
        req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }
      const appointment = {
        owner_id,
        client_id,
        start,
        end,
        date,
        service_id,
        note,
      };
      const result = await createAppointment(appointment);
      // console.log(result.insertId);

      if (result.affectedRows === 1) {
        res.status(201).json(result.insertId);
      } else {
        res.status(500).send('Appointment creation failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Read single appointment:
app.get('/appointments/get-appointment/:appointment_id', async (req, res) => {
  try {
    const { appointment_id } = req.params;

    // Validate the request data

    const result = await readAppointment(appointment_id);

    if (result.length > 0) {
      res.status(201).json(result);
    } else {
      res.status(500).send('Cannot fetch appointment');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Read all appointments by owner_id:
app.get(
  '/appointments/get-all-owner-appointments/:owner_id',
  async (req, res) => {
    try {
      const { owner_id } = req.params;

      // Validate the request data

      const result = await readAllOwnerAppointments(owner_id);

      if (result.length > 0) {
        res.status(201).json(result);
      } else {
        res.status(500).send('Cannot fetch appointments');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Read all Future appointments by owner_id:
app.get(
  '/appointments/get-all-future-appointments/:owner_id',
  async (req, res) => {
    try {
      const { owner_id } = req.params;
      console.log(owner_id);

      // Validate the request data

      const result = await readAllOwnerFutureAppointments(owner_id);

      console.log(result);

      const resultWithAddedDay = result.map((res) => ({
        ...res,
        date: addDayToDate(res.date),
      })); //returns minus 1 day (why?)

      console.log(resultWithAddedDay);

      if (result.length >= 0) {
        res.status(201).json(resultWithAddedDay);
      } else {
        res.status(500).send('Cannot fetch appointments');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Read all appointments by client_id:
app.get(
  '/appointments/get-all-client-appointments/:client_id',
  async (req, res) => {
    try {
      const { client_id } = req.params;

      // Validate the request data

      const result = await readAllClientAppointments(client_id);

      if (result.length > 0) {
        res.status(201).json(result);
      } else {
        res.status(500).send('Cannot fetch appointments');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Read all tomorrows appointments (for all users).  date format 2023-12-07
app.get('/appointments/get-all-tomorrows-appointments/', async (req, res) => {
  try {
    // Validate the request data
    const tomorrowDate = getTomorrowDate();
    const formattedDateForString = tomorrowDate.split('-').reverse().join('/'); // 2023-12-07 >> 07/12/2023

    const dayAfterTomorrowDate = getDayAfterTomorrowDate();
    const result = await readAllAppointmentsAtDate(dayAfterTomorrowDate);
    // this is supposed to be tomorrow, not day after, but for some reason mysql returns -1 day in the date. check this:
    //https://stackoverflow.com/questions/54666536/date-one-day-backwards-after-select-from-mysql-db

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
      // console.log(clientPhone);
    });

    if (result.length > 0) {
      res.status(201).json(result);
    } else {
      res.status(500).send('No appointments tomorrows');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
// Update appointment:

app.post(
  '/appointments/update-appointment',
  [
    check('appointment_id')
      .notEmpty()
      .withMessage('Appointment id cannot be empty'),
  ],
  async (req, res) => {
    try {
      const { start, end, serviceId, note, date, appointment_id } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }
      const appointment = { start, end, serviceId, note, date, appointment_id };

      const result = await updateAppointment(appointment);

      if (result.affectedRows === 1) {
        res.status(201).send('Appointment updated successfully');
      } else {
        res.status(500).send('Appointment update failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Delete appointment:
// deleteAppointment(appointment_id)
app.delete(
  '/appointments/delete-appointment/:appointment_id',
  async (req, res) => {
    try {
      const { appointment_id } = req.params;

      const result = await deleteAppointment(appointment_id);

      if (result.affectedRows === 1) {
        res.status(201).send('Appointment deleted successfully');
      } else {
        res.status(500).send('Appointment deleting failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// check if new appointment overlaps existing one before summary
app.post(
  '/appointments/check-overlap',
  [
    check('start').notEmpty().withMessage('Start time cannot be empty'),
    check('end').notEmpty().withMessage('End time cannot be empty'),
    check('date').notEmpty().withMessage('End time cannot be empty'),
    check('owner_id').notEmpty().withMessage('owner_id cannot be empty'),
  ],
  async (req, res) => {

    try {
      const { start, end, date, owner_id } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }
      const overlappingAppointment = await checkOverlaps(
        owner_id,
        date,
        start,
        end
      );

      if (overlappingAppointment.length === 0) {
        res.status(201).send('Not overlapping');
      } else {
        res.status(201).send('Overlapping');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// -----business -----------

// Create new appointment:
app.post(
  '/business/create-business',
  [check('owner_id').notEmpty().withMessage('Owner id cannot be empty')],
  async (req, res) => {
    try {
      const { owner_id, name, address, phone } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }
      const businessDetails = {
        owner_id,
        name,
        address,
        phone,
      };

      const result = await createBusiness(businessDetails);

      if (result.affectedRows === 1) {
        res.status(201).json(result.insertId);
      } else {
        res.status(500).send('Appointment creation failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Update business:
app.post(
  '/business/update-business',
  [check('owner_id').notEmpty().withMessage('Business id cannot be empty')],
  async (req, res) => {
    try {
      const { name, address, phone, owner_id } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }
      const businesDetails = { name, address, phone, owner_id };
      const result = await updateBusiness(businesDetails);

      if (result.affectedRows === 1) {
        res.status(201).send('Business updated successfully');
      } else {
        res.status(500).send('Business update failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);
// Read single appointment:
app.get('/business/get-business/:owner_id', async (req, res) => {

  try {
    const { owner_id } = req.params;

    // Validate the request data

    const result = await readBusiness(owner_id);

    if (result.length > 0) {
      res.status(201).json(result[0]);
    } else {
      res.status(500).send('Cannot fetch business');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// // send message for client booking new appointment.
// app.get('/send-message', async (req, res) => {
//   try {
//     // Validate the request data
//     const message = formulateNewSummaryClientMsg(
//       'מיכל',
//       'קארן רונן',
//       '13/10/24',
//       '15:00',
//       '90',
//       'רבניצקי 4 תל אביב'
//     );
//     const result = await sendWhatsappMessage(message);

//     // if (result.length > 0) {
//     //   res.status(201).json(result[0]);
//     // } else {
//     //   res.status(500).send('Cannot fetch business');
//     // }
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server error');
//   }
// });

app.post(
  '/send-message/client-new-appointment',
  // [check('owner_id').notEmpty().withMessage('Owner id cannot be empty')],
  async (req, res) => {
    try {
      const {
        Clientname,
        Ownername,
        date,
        startTime,
        duration,
        businessAddress,
        phone,
      } = req.body;

      // // Validate the request data
      // const errors = validationResult(req);

      // if (!errors.isEmpty()) {
      //   return res.status(400).json({ error: errors.array() });
      // }

      const message = formulateNewSummaryClientMsg(
        Clientname,
        Ownername,
        date,
        startTime,
        duration,
        businessAddress
      );

      const result = await sendWhatsappMessage(message, phone);
      console.log('app: ', result);

      if (result.body) {
        res.status(201).json('Message sent successfully');
      } else {
        res.status(500).send('Message sending failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// receive whatsapp message
const { MessagingResponse } = twilio.twiml;
app.post('/receive-message', (req, res) => {
  const twiml = new MessagingResponse();

  // twiml.message('אין קבלת הודעות למספר זה');
  twiml.message('This contact number is not configured to receive messages.');

  res.type('text/xml').send(twiml.toString());
});

// cron
cron.schedule(
  cronInterval,
  () => {
    sendReminderCron();
  },
  {
    scheduled: true,
    timezone: 'Asia/Jerusalem',
  }
);

//------------------------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, '0.0.0.0' ,() => {
  console.log('server is running on port ' + port);
});
