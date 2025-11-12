import { PetData, AppointmentData } from '../helpers/appointment-helpers';

export const TEST_PET: PetData = {
  name: 'Rex Test E2E',
  species: 'dog',
  breed: 'Labrador',
  age: 3,
  weight: 25
};

export const TEST_PET_CAT: PetData = {
  name: 'Mimi Test E2E',
  species: 'cat',
  breed: 'Persa',
  age: 2,
  weight: 4
};

export const TEST_APPOINTMENT: AppointmentData = {
  petShopName: 'PetShop Teste',
  serviceName: 'Banho',
  date: 'tomorrow',
  time: '14:00'
};

export const TEST_APPOINTMENT_GROOMING: AppointmentData = {
  petShopName: 'PetShop Teste',
  serviceName: 'Tosa',
  date: 'tomorrow',
  time: '15:00'
};

export const TEST_CLIENT_CREDENTIALS = {
  email: 'cliente@test.com',
  password: 'SenhaCliente123'
};

export const TEST_PETSHOP_CREDENTIALS = {
  email: 'petshop@test.com',
  password: 'SenhaPetShop123'
};
