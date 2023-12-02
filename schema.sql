Show databases;
-- @block
use appointments;
-- use bookShop;
-- @block
show tables;



-- @block
Select * FROM users;
-- @block
Select * FROM services;
-- @block
Select * FROM workWeek;
-- @block
Select * FROM dailySchedule;
-- @block
Select * FROM clients;
-- @block
Select * FROM appointments;
-- @block
Select * FROM business;



-- @block
-- Delete  FROM clients where id=44;
-- Delete FROM appointments where client_id=44;
Delete FROM appointments where id=104;
-- @block
UPDATE users
SET id = 'dsahjkhdfdlffjf4'
WHERE id = 'temp';


-- @block
INSERT INTO appointments (owner_id, client_id, start, end,date, service_id, note) 
            VALUES ('KJUrnSsrFwRdNNrk896c8GFr0F32','55','8:00','9:00','2023-12-01',1,'');




-- @block
Select fullname FROM users WHERE id='KJUrnSsrFwRdNNrk896c8GFr0F32';

-- @block
DROP TABLE dailySchedule;


-- @block
DELETE FROM users;
-- @block
DELETE FROM services;
-- @block
DELETE FROM workWeek;
-- DESC workWeek;
-- @block
DELETE FROM dailySchedule;
-- @block
DELETE FROM clients;
-- @block
DELETE FROM appointments;

-- @block

INSERT INTO clients (Name, phone, email, owner_id) VALUES
  ('David Williams', '0501234567', 'david.williams@gmail.com', 'KJUrnSsrFwRdNNrk896c8GFr0F32'),
  ('Christopher Davis', '0502345678', 'chris.davis@gmail.com', 'KJUrnSsrFwRdNNrk896c8GFr0F32'),
  ('Daniel Brown', '0503456789', 'daniel.brown@gmail.com', 'KJUrnSsrFwRdNNrk896c8GFr0F32'),
  ('Emily Johnson', '0508765432', 'emily.johnson@gmail.com', 'KJUrnSsrFwRdNNrk896c8GFr0F32'),
  ('Olivia Martinez', '0507654321', 'olivia.martinez@gmail.com', 'KJUrnSsrFwRdNNrk896c8GFr0F32'),
  ('Sophia Taylor', '0506543210', 'sophia.taylor@gmail.com', 'KJUrnSsrFwRdNNrk896c8GFr0F32'),
  ('Ava Anderson', '0505432109', 'ava.anderson@gmail.com', 'KJUrnSsrFwRdNNrk896c8GFr0F32'),
  ('Mia Wilson', '0504321098', 'mia.wilson@gmail.com', 'KJUrnSsrFwRdNNrk896c8GFr0F32'),
  ('Michael Johnson', '0509876543', 'michael.johnson@gmail.com', 'KJUrnSsrFwRdNNrk896c8GFr0F32'),
  ('John Smith', '0508657832', 'john.smith@gmail.com', 'KJUrnSsrFwRdNNrk896c8GFr0F32');





-- @block
Desc users;
-- @block
Desc services;
-- @block
Desc workWeek;
-- DESC workWeek;
-- @block
Desc dailySchedule;
-- @block
Desc clients;
-- @block
Desc appointments;






    -- users:
        -- create new user:
-- @block
            INSERT INTO users (id, fullname, email) VALUES (1, 'Eytan Krief', 'eytankr@gmail.com'); 

    -- services:
        -- post new service:
-- @block
            INSERT INTO services (name, description, duration, price, owner_id) 
                        VALUES ('manicure4', 'russian method4', 90, 180.00, 1);
        
        -- Read all services
-- @block   
             SELECT * FROM services;
        -- Get all owener's services
-- @block            
            SELECT * FROM services where owner_id=2;
            

        -- get single service:
-- @block
            SELECT * FROM services WHERE id=1;

        -- Edit service by service_id
-- @block
            UPDATE services SET duration=75 WHERE id=1;

        --edit all not null fields in a service

            UPDATE services
                SET
                    name = CASE WHEN :new_name IS NOT NULL THEN :new_name ELSE name END,
                    description = CASE WHEN :new_description IS NOT NULL THEN :new_description ELSE description END,
                    duration = CASE WHEN :new_duration IS NOT NULL THEN :new_duration ELSE duration END,
                    price = CASE WHEN :new_price IS NOT NULL THEN :new_price ELSE price END
                WHERE id = :service_id;


        -- delete service
-- @block
            DELETE FROM services WHERE id=1;

    -- @block
    -- workWeek:
            INSERT INTO workWeek (owner_id) VALUES (2);

        -- create init dayly_schedule for each new user:

                -- for loop 0-6:
-- @block
                INSERT INTO dailySchedule (day_of_week, start_time, end_time, workweek_id)
                VALUES
                    (0, '09:00', '17:00', 2); -- Replace [workweek_id] with the actual workweek_id
                    

        -- Read workweek
-- @block
            SELECT id FROM workWeek WHERE owner_id=[owner_id];
-- @block
            SELECT * FROM dailySchedule WHERE workWeek_id=[workWeek_id];


        -- edit workweek
-- @block        
-- Select workweek id from owner id
            workWeek_id = SELECT id FROM workWeek WHERE owner_id=1;
-- @block            
            UPDATE dailySchedule SET start_time=10:00 WHERE workWeek_id=[workWeek_id] AND day_of_week=0; --for Sunday

        UPDATE dailySchedule
                SET
                        start_time = CASE WHEN ? IS NOT NULL THEN ? ELSE start_time END,
                        end_time = CASE WHEN ? IS NOT NULL THEN ? ELSE end_time END
                WHERE workWeek_id = ? AND day_of_week = ?;
            
        
    -- clients:
        -- post new client
-- @block
            INSERT INTO clients (name, phone, email, owner_id) 
                          VALUES ('Lital Cohen', '050-865-9933', 'litalcohen@gmail.com', 1);
        
        -- update client
-- @block        
            UPDATE clients SET phone='050-332-3344' Where id=2;
        
        -- Delete client
-- @block        
            DELETE FROM clients WHERE id=2;
            
    
    -- Appointments:

        -- Create new appointment:
-- @block        
            INSERT INTO appointments (owner_id, client_id, start, end, service_id, note);
                          VALUES (1, 1, '10:30', '12:00', 1, '');
            
        -- Read single appointment:
-- @block        
            SELECT * FROM appointments WHERE id=1;
        
        -- Read all appointments by owner_id:
-- @block        
            SELECT * FROM appointments WHERE owner_id='oWYIFCBCsSYueiUuzl3VyaWJJLq2';
        -- Read all future appointments by owner_id:
-- @block        
            SELECT * FROM appointments WHERE owner_id='oWYIFCBCsSYueiUuzl3VyaWJJLq2' AND date >= CURDATE();
        
        -- Update appointment:
-- @block        
            UPDATE appointments SET start='11:00', end='12:30' WHERE id=1;
        
        -- Delete appointment:
-- @block        
            DELETE FROM appointments WHERE id=1;



-- update users id to hold string : --



-- @block

SELECT * FROM appointments WHERE date='2023-12-12';