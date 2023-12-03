import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

async function poolQuery(sql, argumentsArr) {
  const [rows] = await pool.query(sql, argumentsArr);
  return rows;
}

//-- Users --
//Create new user
export async function createUser(user) {
  const {id, fullname, email} = user;
  return poolQuery(`INSERT INTO users (id, fullname, email) VALUES (?, ?, ?)`, [
    id,
    fullname,
    email,
  ]);
}

export async function changeUserTempId(uid) {
  const temporalUidstr = 'temp';

  return poolQuery(
    `UPDATE users
    SET id = ?
    WHERE id = '${temporalUidstr}';`,
    [uid]
  );
}

export async function getUserByUid(uid) {
  return poolQuery(`SELECT fullname FROM users WHERE id=?;`, [uid]);
}

//-- Services --

// Create new service
export async function createService(service) {
  const { name, description, duration, price, owner_id, img_url } = service;
  return poolQuery(
    'INSERT INTO services (name, description, duration, price, owner_id, img_url) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, duration, price, owner_id, img_url]
  );
}

// Read all services
export async function readAllServices(owner_id) {
  const SELECT_SERVICE_QUERY = 'SELECT * FROM services where owner_id=?;';

  return poolQuery(SELECT_SERVICE_QUERY, [owner_id]);
}

// Read single service
export async function readSingleService(service_id) {
  const SELECT_ALL_SERVICES = 'SELECT * FROM services WHERE id=?';
  return poolQuery(SELECT_ALL_SERVICES, [service_id]);
}

// Update service by service_id
export async function updateService(service) {
  const { name, description, duration, price, service_id, img_url } = service;

  const UPDATE_NOT_NULL_SERVICES_PROPERTIES = `UPDATE services
  SET 
   name = CASE WHEN ? IS NOT NULL THEN ? ELSE name END, 
   description = CASE WHEN ? IS NOT NULL THEN ? ELSE description END, 
   duration = CASE WHEN ? IS NOT NULL THEN ? ELSE duration END, 
   price = CASE WHEN ? IS NOT NULL THEN ? ELSE price END,
   img_url = CASE WHEN ? IS NOT NULL THEN ? ELSE img_url END 
  WHERE id = ?;`;

  return poolQuery(UPDATE_NOT_NULL_SERVICES_PROPERTIES, [
    name,
    name,
    description,
    description,
    duration,
    duration,
    price,
    price,
    img_url,
    img_url,
    service_id,
  ]);
}

// read owner_id for service_id
export async function readOwenerIdFromServiceId(service_id) {
  const SELECT_SERVICE_OWNER = 'SELECT owner_id FROM services WHERE id=?';

  const result = await poolQuery(SELECT_SERVICE_OWNER, [service_id]);

  return result[0].owner_id;
}

// Delete service by service_id
export async function deleteService(service_id) {
  const DELETE_SERVICE = `DELETE FROM services WHERE id=?;`;
  return poolQuery(DELETE_SERVICE, [service_id]);
}

// --Workweek --
// Create new workWeek by owner_id
export async function createWorkWeek(owner_id) {
  const INSERT_WORKWEEK = `INSERT INTO workWeek (owner_id) VALUES (?);`;
  return poolQuery(INSERT_WORKWEEK, [owner_id]);
}

// Create new dailySchedule
export async function createDailySchedule(dailySchedule) {
  const { day, startTime, endTime, workweekId, isWorkDay, timeSlotDuration } =
    dailySchedule;

  const INSERT_DAILYSCHEDULE = `INSERT INTO dailySchedule (day_of_week, start_time, end_time, workweek_id, is_workDay, time_slot_duration)
  VALUES
      (? , ?, ?, ?,?, ?);`;
  return poolQuery(INSERT_DAILYSCHEDULE, [
    day,
    startTime,
    endTime,
    workweekId,
    isWorkDay,
    timeSlotDuration,
  ]);
}

// Read weekly schedule based on workweek_id
export async function readWeeklySchedule(workWeek_id) {
  const SELECT_DAILYSCHEDULE = `SELECT * FROM dailySchedule WHERE workWeek_id=?;`;
  return poolQuery(SELECT_DAILYSCHEDULE, [workWeek_id]);
}

// Select workweek_id from owner_id
export async function readWorkWeedId(owner_id) {
  const SELECT_WORKWEEK_ID = `SELECT id FROM workWeek WHERE owner_id=?`;
  return poolQuery(SELECT_WORKWEEK_ID, [owner_id]);
}

// Update dailySchedule by dailySchedule_id
export async function updateDailySchedule(dailySchedule) {
  const {
    start_time,
    end_time,
    is_work_day,
    time_slot_duration,
    dailySchedule_id,
  } = dailySchedule;

  const UPDATE_DAILYSCHEDULE = `UPDATE dailySchedule
  SET
    start_time = ?,
    end_time = ?,
    is_workDay = ?,
    time_slot_duration = ?
  WHERE id = ?;`;

  return poolQuery(
    UPDATE_DAILYSCHEDULE,

    [start_time, end_time, is_work_day, time_slot_duration, dailySchedule_id]
  );
}

// --Clients--

// Create new client:
export async function createClient(client) {
  const { name, phone, email, owner_id } = client;
  const INSERT_CLIENT = `INSERT INTO clients (name, phone, email, owner_id) 
  VALUES (?, ?, ?, ?);`;
  return poolQuery(INSERT_CLIENT, [name, phone, email, owner_id]);
}

// Update client by client_id:
export async function updateClient(client) {
  const {name, phone, email, client_id} = client;
  const UPDATE_CLIENT = `UPDATE clients
  SET
    Name = CASE WHEN ? IS NOT NULL THEN ? ELSE Name END,
    phone = CASE WHEN ? IS NOT NULL THEN ? ELSE phone END,
    email = CASE WHEN ? IS NOT NULL THEN ? ELSE email END
  WHERE id = ? ;`;
  return poolQuery(UPDATE_CLIENT, [
    name,
    name,
    phone,
    phone,
    email,
    email,
    client_id,
  ]);
}

// Delete client
export async function deleteClient(client_id) {
  const DELETE_CLIENT = `DELETE FROM clients WHERE id = ?;`;
  return poolQuery(DELETE_CLIENT, [client_id]);
}

// read all owners clinet
export async function getAllOwnerClients(owner_id) {
  const SELECT_ALL_CLIENTS = `SELECT * FROM clients WHERE owner_id = ?;`;
  return poolQuery(SELECT_ALL_CLIENTS, [owner_id]);
}
// read client by client_id
export async function getClient(client_id) {
  const SELECT_CLIENT = `SELECT * FROM clients WHERE id = ?;`;
  return poolQuery(SELECT_CLIENT, [client_id]);
}

// Check if client exists by phone
export async function getClientExistsByPhone(phone, owner_id) {
  // 0508657032
  const CHECK_CLIENT_EXISTS = `SELECT EXISTS (SELECT 1 FROM clients WHERE phone = ? && owner_id = ?) AS existsValue;`;
  return poolQuery(CHECK_CLIENT_EXISTS, [phone, owner_id]);
}

// Get client id by phone
export async function getClientIdByPhone(phone, owner_id) {
  const GET_CLIENT = `SELECT * FROM clients WHERE phone = ? && owner_id = ?`;
  // 0508657032
  return poolQuery(GET_CLIENT, [phone, owner_id]);
}

//--Appointments

// Create new appointment:
export async function createAppointment(appointment) {
  const { owner_id, client_id, start, end, date, service_id, note } =
    appointment;
  const INSERT_APPOINTMENT = `INSERT INTO appointments (owner_id, client_id, start, end,date, service_id, note) 
  VALUES (?,?,?,?,?,?,?);`;

  return poolQuery(INSERT_APPOINTMENT, [
    owner_id,
    client_id,
    start,
    end,
    date,
    service_id,
    note,
  ]);
}

// Read single appointment:
export async function readAppointment(appointment_id) {
  const QUERY = `SELECT * FROM appointments WHERE id=?;`;
  return poolQuery(QUERY, [appointment_id]);
}

// Read all appointments by owner_id:
export async function readAllOwnerAppointments(owner_id) {
  const QUERY = `SELECT * FROM appointments WHERE owner_id=?`;
  return poolQuery(QUERY, [owner_id]);
}

// Read all future appointments by owner_id:
export async function readAllOwnerFutureAppointments(owner_id) {
  const QUERY = `SELECT * FROM appointments WHERE owner_id=? AND date >= CURDATE();`;
  return poolQuery(QUERY, [owner_id]);
}

// Read all future appointments by owner_id of spesific date:
export async function readAllOwnerAppointmentsInDate(owner_id, date) {
  const QUERY = `SELECT * FROM appointments WHERE owner_id=? AND date =?;`;
  return poolQuery(QUERY, [owner_id, date]);
}

// check for overlaps
export async function checkOverlaps(
  owner_id,
  date,
  appointmentStart,
  appointmentEnd
) {
  const QUERY = `SELECT *
  FROM appointments
  WHERE owner_id = ?
    AND (
      (start < ? AND end > ? AND date = ?)
      OR
      (start < ? AND end > ? AND date = ?)
      OR
      (start > ? AND end < ? AND date = ?)
    );
  `;
  return poolQuery(QUERY, [
    owner_id,

    appointmentEnd,
    appointmentStart,
    date,

    appointmentEnd,
    appointmentStart,
    date,

    appointmentStart,
    appointmentEnd,
    date,
  ]);
}

// console.log(await checkOverlaps(
//   'nbl4kT3L2pNLEcZ1W4zQAzfcUsA3',
//   '2023-11-28',
//   '14:30',
//   '16:30'
// ));

// Read all appointments by client_id:
export async function readAllClientAppointments(client_id) {
  const QUERY = `SELECT * FROM appointments WHERE client_id=?`;
  return poolQuery(QUERY, [client_id]);
}

// Read all tomorrow appointments by date:
export async function readAllAppointmentsAtDate(date) {
  const QUERY = `SELECT * FROM appointments WHERE date=?`;
  return poolQuery(QUERY, [date]);
}

// Update appointment:
export async function updateAppointment(appointment) {
  const { start, end, service_id, note, date, appointment_id } = appointment;
  const QUERY = `UPDATE appointments
  SET
    start = CASE WHEN ? IS NOT NULL THEN ? ELSE start END,
    end = CASE WHEN ? IS NOT NULL THEN ? ELSE end END,
    service_id = CASE WHEN ? IS NOT NULL THEN ? ELSE service_id END,
    date = CASE WHEN ? IS NOT NULL THEN ? ELSE date END,
    note = CASE WHEN ? IS NOT NULL THEN ? ELSE note END
  WHERE id = ? ;`;
  return poolQuery(QUERY, [
    start,
    start,
    end,
    end,
    service_id,
    service_id,
    date,
    date,
    note,
    note,
    appointment_id,
  ]);
}

// Delete appointment:
export async function deleteAppointment(appointment_id) {
  const QUERY = `DELETE FROM appointments WHERE id=?;`;
  return poolQuery(QUERY, [appointment_id]);
}

// -- business --
// Create new business:
export async function createBusiness(businessDetails) {
  const {owner_id, name, address, phone} = businessDetails;

  const QUERY = `INSERT INTO business (owner_id, name, address, phone) 
  VALUES (?,?,?,?);`;
  return poolQuery(QUERY, [owner_id, name, address, phone]);
}

// Read business:
export async function readBusiness(owner_id) {
  const QUERY = `SELECT * FROM business WHERE owner_id=?;`;
  return poolQuery(QUERY, [owner_id]);
}

// Update business:
export async function updateBusiness(businessDetails) {
  const {name, address, phone, owner_id}=businessDetails; 
  const QUERY = `UPDATE business
  SET
  name = ?,
  address = ?,
  phone = ?
  WHERE owner_id = ? ;`;
  return poolQuery(QUERY, [name, address, phone, owner_id]);
}
